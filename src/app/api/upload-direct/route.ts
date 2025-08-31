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

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || 25);

const validateFileExtension = (fileName: string, mimeType: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) return false;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return false;
  return true;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (!validateFileExtension(file.name, file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported',
        success: false 
      }, { status: 400 });
    }

    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File size too large. Maximum ${MAX_FILE_SIZE_MB}MB allowed.`,
          success: false 
        },
        { status: 400 },
      );
    }

    if (file.name.length > 255) {
      return NextResponse.json({ 
        error: 'File name too long',
        success: false 
      }, { status: 400 });
    }

    // Check environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
      console.error('Missing required AWS environment variables');
      return NextResponse.json({ 
        error: 'AWS configuration missing',
        success: false 
      }, { status: 500 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileKey = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

    // Generate signed URL for direct upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: file.type,
      Metadata: {
        userId,
        originalName: encodeURIComponent(file.name),
        uploadedAt: new Date().toISOString(),
      },
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    // Upload the file to S3
    const fileBuffer = await file.arrayBuffer();
    const s3Response = await fetch(signedUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!s3Response.ok) {
      return NextResponse.json({ 
        error: 'Failed to upload file to storage' 
      }, { status: 500 });
    }

    // Register the file with the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const registerResponse = await fetch(`${backendUrl}/api/files/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await (await auth()).getToken()}`,
        ...(process.env.BACKEND_API_KEY ? { 'X-Backend-Key': process.env.BACKEND_API_KEY } : {}),
      },
      body: JSON.stringify({
        file_key: fileKey,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
      }),
    });

    if (!registerResponse.ok) {
      let errorData;
      try {
        errorData = await registerResponse.json();
      } catch (parseError) {
        const errorText = await registerResponse.text();
        console.error('Register response parse error:', parseError, 'Response text:', errorText);
        return NextResponse.json({ 
          error: `Failed to register file: ${registerResponse.status} ${registerResponse.statusText}` 
        }, { status: registerResponse.status });
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to register file' 
      }, { status: registerResponse.status });
    }

    const result = await registerResponse.json();
    return NextResponse.json({
      success: true,
      file: result,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 });
  }
}
