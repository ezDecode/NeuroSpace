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
          file_size: 0, // We'll get this from S3 metadata if needed
          content_type: 'application/pdf', // We'll determine this from file extension
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        jobId: result.job_id,
        message: result.message,
      });
    } catch (error) {
      console.error('Backend processing error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to process file with backend',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}