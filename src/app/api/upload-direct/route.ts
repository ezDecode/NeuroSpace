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

    // For now, use the existing upload workflow
    // First get a signed URL, then upload the file
    const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
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
    const { getToken } = await auth();
    const jwt = await getToken();
    
    const registerResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        file_key: fileKey,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
      }),
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
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
