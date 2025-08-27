import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  try {
    // Verify authentication
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = await getToken();
    if (!jwt) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    // Call the backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${backendUrl}/api/files/cleanup-duplicates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          ...(process.env.BACKEND_API_KEY ? { 'X-Backend-Key': process.env.BACKEND_API_KEY } : {}),
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse backend response JSON:', jsonError);
        return NextResponse.json({ 
          error: 'Backend returned invalid JSON response',
          success: false 
        }, { status: 502 });
      }
      
      return NextResponse.json({ 
        ...data,
        success: true 
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout:', fetchError);
        return NextResponse.json({ 
          error: 'Request timeout - backend is not responding',
          success: false 
        }, { status: 504 });
      }
      throw fetchError; // Re-throw other fetch errors to be caught by outer catch
    }
  } catch (error) {
    console.error('Error cleaning up duplicate files:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to cleanup duplicate files',
      success: false 
    }, { status: 500 });
  }
}
