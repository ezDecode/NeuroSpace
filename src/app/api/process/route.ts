import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get JWT token - simplified call without template
    let jwt;
    try {
      jwt = await getToken();
    } catch (tokenError) {
      console.error('Error getting token:', tokenError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!jwt) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const { fileKey, fileName, fileSize, fileType } = await request.json();

    if (!fileKey || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send to FastAPI backend for processing
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${backendUrl}/api/processing/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          ...(process.env.BACKEND_API_KEY ? { 'X-Backend-Key': process.env.BACKEND_API_KEY } : {}),
        },
        body: JSON.stringify({
          file_key: fileKey,
          file_name: fileName,
          user_id: userId,
          file_size: fileSize || 0, // Use provided file size or default to 0 (will be determined by backend from S3)
          content_type: fileType || (() => {
            const lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith('.pdf')) return 'application/pdf';
            if (lowerFileName.endsWith('.md')) return 'text/markdown';
            if (lowerFileName.endsWith('.txt')) return 'text/plain';
            if (lowerFileName.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (lowerFileName.endsWith('.doc')) return 'application/msword';
            return 'application/octet-stream';
          })(),
        }),
      });

      if (!response.ok) {
        let errorMessage = `Backend processing failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to parse backend error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse backend response JSON:', jsonError);
        throw new Error('Backend returned invalid JSON response');
      }

      return NextResponse.json({
        success: true,
        jobId: result.job_id,
        message: result.message,
        status: result.status,
      });
    } catch (error) {
      console.error('Backend processing error:', error);

      // Security: Generic error message in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = isDevelopment
        ? `Failed to process file with backend: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to process file';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);

    // Security: Generic error message in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment
      ? `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Failed to process file';

    return NextResponse.json({ 
      error: errorMessage,
      success: false 
    }, { status: 500 });
  }
}
