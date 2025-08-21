import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'doc', 'docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User ID:', userId);

    const requestBody = await request.json();
    console.log('Raw request body:', requestBody);
    
    const { fileName, fileType, fileSize } = requestBody;
    console.log('Parsed data:', { fileName, fileType, fileSize });
    console.log('Data types:', { 
      fileName: typeof fileName, 
      fileType: typeof fileType, 
      fileSize: typeof fileSize 
    });

    if (!fileName || !fileType || fileSize === undefined || fileSize === null || fileSize === 0) {
      console.log('Missing or invalid required fields - detailed check:', {
        hasFileName: !!fileName,
        hasFileType: !!fileType,
        hasValidFileSize: fileSize !== undefined && fileSize !== null && fileSize > 0,
        fileName,
        fileType,
        fileSize
      });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          fileName: !fileName ? 'missing' : 'ok',
          fileType: !fileType ? 'missing' : 'ok',
          fileSize: (fileSize === undefined || fileSize === null || fileSize === 0) ? 'missing or zero' : 'ok'
        }
      }, { status: 400 });
    }

    if (!validateFileExtension(fileName, fileType)) {
      console.log('Invalid file extension/type');
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      console.log('File too large');
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 },
      );
    }

    if (fileName.length > 255) {
      console.log('File name too long');
      return NextResponse.json({ error: 'File name too long' }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const fileKey = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

    console.log('File processing details:', {
      originalFileName: fileName,
      safeFileName,
      fileExtension,
      userId,
      fileKey
    });

    if (!validateFileKey(fileKey, userId)) {
      console.log('File key validation failed:', {
        fileKey,
        userId,
        startsWithCorrectPath: fileKey.startsWith(`uploads/${userId}/`),
        pathPrefix: `uploads/${userId}/`,
        filename: fileKey.substring(`uploads/${userId}/`.length)
      });
      return NextResponse.json({ error: 'Invalid file key generated' }, { status: 500 });
    }

    // Check environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    console.log('Environment check:', {
      bucketName: bucketName ? 'Set' : 'Missing',
      region: region ? 'Set' : 'Missing',
      accessKeyId: accessKeyId ? 'Set' : 'Missing',
      secretAccessKey: secretAccessKey ? 'Set' : 'Missing'
    });

    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
      console.error('Missing required AWS environment variables');
      return NextResponse.json({ error: 'AWS configuration missing' }, { status: 500 });
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        userId,
        originalName: safeFileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('Generating signed URL...');
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL generated successfully');

    const res = NextResponse.json({ signedUrl, fileKey, fileName: safeFileName });
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch (error) {
    console.error('Upload API error:', error);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment
      ? `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Failed to generate upload URL';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
