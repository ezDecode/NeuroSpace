import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// TypeScript types for the API
interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface UploadResponse {
  url: string;
  fileKey: string;
  fileName: string;
  success: true;
}

interface ErrorResponse {
  error: string;
  details?: {
    fileName?: string;
    fileType?: string;
    fileSize?: string;
  };
  success: false;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'doc', 'docx', 'md'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
];

const isProd = process.env.NODE_ENV === 'production';
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || 25);

const validateFileKey = (fileKey: string, userId: string): boolean => {
  // Check if it starts with the correct path
  if (!fileKey.startsWith(`uploads/${userId}/`)) {
    return false;
  }
  
  // Extract the filename part after the path
  const pathPrefix = `uploads/${userId}/`;
  const filename = fileKey.substring(pathPrefix.length);
  
  // Validate the filename part (should be UUID.extension format)
  const safeFilenamePattern = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;
  return safeFilenamePattern.test(filename);
};

const validateFileExtension = (fileName: string, mimeType: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) return false;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return false;
  return true;
};

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    if (!isProd) console.log('Upload API called');
    
    const { userId } = await auth();
    if (!userId) {
      if (!isProd) console.log('No user ID found');
      return NextResponse.json({ 
        error: 'Unauthorized',
        success: false 
      }, { status: 401 });
    }
 
    if (!isProd) console.log('User ID:', userId);
 
    const requestBody: UploadRequest = await request.json();
    if (!isProd) console.log('Raw request body:', requestBody);
    
    const { fileName, fileType, fileSize } = requestBody;
    if (!isProd) {
      console.log('Parsed data:', { fileName, fileType, fileSize });
      console.log('Data types:', { 
        fileName: typeof fileName, 
        fileType: typeof fileType, 
        fileSize: typeof fileSize 
      });
    }

    if (!fileName || !fileType || fileSize === undefined || fileSize === null || fileSize === 0) {
      if (!isProd) {
        console.log('Missing or invalid required fields - detailed check:', {
          hasFileName: !!fileName,
          hasFileType: !!fileType,
          hasValidFileSize: fileSize !== undefined && fileSize !== null && fileSize > 0,
          fileName,
          fileType,
          fileSize
        });
      }
      return NextResponse.json({
        error: 'Missing required fields',
        success: false,
        details: {
          fileName: !fileName ? 'missing' : 'ok',
          fileType: !fileType ? 'missing' : 'ok',
          fileSize: (fileSize === undefined || fileSize === null || fileSize === 0) ? 'missing or zero' : 'ok'
        }
      }, { status: 400 });
    }

    if (!validateFileExtension(fileName, fileType)) {
      if (!isProd) console.log('Invalid file extension/type');
      return NextResponse.json({ 
        error: 'File type not supported',
        success: false 
      }, { status: 400 });
    }

    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024; // unified max size
    if (fileSize > maxSize) {
      if (!isProd) console.log('File too large');
      return NextResponse.json(
        { 
          error: `File size too large. Maximum ${MAX_FILE_SIZE_MB}MB allowed.`,
          success: false 
        },
        { status: 400 },
      );
    }

    if (fileName.length > 255) {
      if (!isProd) console.log('File name too long');
      return NextResponse.json({ 
        error: 'File name too long',
        success: false 
      }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    // Encode the filename properly for S3
    const encodedFileName = encodeURIComponent(fileName);
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const fileKey = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

    if (!isProd) {
      console.log('File processing details:', {
        originalFileName: fileName,
        safeFileName,
        fileExtension,
        userId,
        fileKey
      });
    }

    if (!validateFileKey(fileKey, userId)) {
      if (!isProd) {
        console.log('File key validation failed:', {
          fileKey,
          userId,
          startsWithCorrectPath: fileKey.startsWith(`uploads/${userId}/`),
          pathPrefix: `uploads/${userId}/`,
          filename: fileKey.substring(`uploads/${userId}/`.length)
        });
      }
      return NextResponse.json({ 
        error: 'Invalid file key generated',
        success: false 
      }, { status: 500 });
    }

    // Check environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!isProd) {
      console.log('Environment check:', {
        bucketName: bucketName ? 'Set' : 'Missing',
        region: region ? 'Set' : 'Missing',
        accessKeyId: accessKeyId ? 'Set' : 'Missing',
        secretAccessKey: secretAccessKey ? 'Set' : 'Missing'
      });
    }

    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
      console.error('Missing required AWS environment variables');
      return NextResponse.json({ 
        error: 'AWS configuration missing',
        success: false 
      }, { status: 500 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        userId,
        originalName: encodedFileName, // Use encoded filename in metadata
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!isProd) console.log('Generating signed URL...');
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
    if (!isProd) console.log('Signed URL generated successfully');

    // Return the URL in a JSON object as expected by frontend
    const res = NextResponse.json({ 
      url: signedUrl, 
      fileKey, 
      fileName: safeFileName,
      success: true as const
    });
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch (error) {
    console.error('Upload API error:', error);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment
      ? `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Failed to generate upload URL';
    return NextResponse.json({ 
      error: errorMessage,
      success: false as const
    }, { status: 500 });
  }
}
