import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
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

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Call the backend API to delete the file
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        ...(process.env.BACKEND_API_KEY ? { 'X-Backend-Key': process.env.BACKEND_API_KEY } : {}),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Backend responded with status: ${response.status}`;
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
      return NextResponse.json({ 
        error: errorMessage,
        success: false 
      }, { status: response.status });
    }

    return NextResponse.json({ 
      message: 'File deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete file',
      success: false 
    }, { status: 500 });
  }
}