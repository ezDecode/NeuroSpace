import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Security: Validate file key format
const validateFileKey = (fileKey: string, userId: string): boolean => {
  const safePattern = /^[a-zA-Z0-9\-_\.]+$/;
  return fileKey.startsWith(`uploads/${userId}/`) && safePattern.test(fileKey);
};

// Security: Determine content type from file extension
const getContentTypeFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileKey, fileName } = await request.json();

    // Security: Input validation
    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Security: Validate file key format
    if (!validateFileKey(fileKey, userId)) {
      return NextResponse.json(
        { error: 'Invalid file key' },
        { status: 400 }
      );
    }

    // Security: Validate file name
    if (typeof fileName !== 'string' || fileName.length > 255) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    // Security: Determine content type from file extension
    const contentType = getContentTypeFromFileName(fileName);
    if (contentType === 'application/octet-stream') {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Send to FastAPI backend for processing
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${backendUrl}/api/processing/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_key: fileKey,
          file_name: fileName,
          user_id: userId,
          file_size: 0, // Will be determined by backend from S3
          content_type: contentType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend processing failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        jobId: result.job_id,
        message: result.message,
      });
    } catch (error) {
      console.error('Backend processing error:', error);
      
      // Security: Generic error message in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = isDevelopment 
        ? `Failed to process file with backend: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to process file';
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Security: Generic error message in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment 
      ? `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Failed to process file';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}