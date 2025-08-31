import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

    // Get authentication token for internal API call
    const { getToken } = await auth();
    const jwt = await getToken();
    
    // For now, use the existing upload workflow
    // First get a signed URL, then upload the file
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!uploadResponse.ok) {
      let errorData;
      try {
        errorData = await uploadResponse.json();
      } catch (parseError) {
        // If JSON parsing fails, get text response instead
        const errorText = await uploadResponse.text();
        console.error('Upload response parse error:', parseError, 'Response text:', errorText);
        return NextResponse.json({ 
          error: `Failed to get upload URL: ${uploadResponse.status} ${uploadResponse.statusText}` 
        }, { status: uploadResponse.status });
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to get upload URL' 
      }, { status: uploadResponse.status });
    }

    const { url, fileKey } = await uploadResponse.json();

    // Upload the file to S3
    const fileBuffer = await file.arrayBuffer();
    const s3Response = await fetch(url, {
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
    
    const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/files/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
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
