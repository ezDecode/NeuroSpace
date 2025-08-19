import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileKey, fileName } = await request.json();

    if (!fileKey || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
          content_type: fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
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