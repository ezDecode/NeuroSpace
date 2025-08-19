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
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const validateFileKey = (fileKey: string, userId: string): boolean => {
  const safePattern = /^[a-zA-Z0-9-_.]+$/;
  return fileKey.startsWith(`uploads/${userId}/`) && safePattern.test(fileKey);
};

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

    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!validateFileExtension(fileName, fileType)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    if (fileName.length > 255) {
      return NextResponse.json({ error: 'File name too long' }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const fileKey = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

    if (!validateFileKey(fileKey, userId)) {
      return NextResponse.json({ error: 'Invalid file key generated' }, { status: 500 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        userId,
        originalName: safeFileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const res = NextResponse.json({ signedUrl, fileKey, fileName: safeFileName });
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment ? `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}` : 'Failed to generate upload URL';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}