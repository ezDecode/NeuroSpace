import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get user authentication and token
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get JWT token without template parameter
    const jwt = await getToken();
    if (!jwt) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const { content, topK = 5 } = await request.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const key = process.env.BACKEND_API_KEY;

    // Determine if the user has any documents
    let hasDocuments = false;
    try {
      const filesResp = await fetch(`${backendUrl}/api/files/`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          ...(key ? { 'X-Backend-Key': key } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (filesResp.ok) {
        const filesData = await filesResp.json();
        const total = typeof filesData?.total === 'number' ? filesData.total : Array.isArray(filesData?.files) ? filesData.files.length : 0;
        hasDocuments = total > 0;
      }
    } catch (checkErr) {
      // If the check fails, default to general mode to avoid RAG failures
      hasDocuments = false;
    }

    const route = hasDocuments ? 'ask' : 'ask_direct';
    const resp = await fetch(`${backendUrl}/api/query/${route}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(key ? { 'X-Backend-Key': key } : {}),
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ 
        user_id: userId, 
        question: content, 
        top_k: topK 
      }),
    });

    if (!resp.ok) {
      let errorMessage = `Backend error: ${resp.status}`;
      try {
        const errorData = await resp.json();
        errorMessage = errorData?.detail || errorData?.error || errorMessage;
      } catch (jsonError) {
        try {
          const errorText = await resp.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Failed to parse backend error response:', textError);
        }
      }
      console.error('Backend error:', resp.status, errorMessage);
      return NextResponse.json({ 
        error: errorMessage,
        success: false 
      }, { status: 500 });
    }

    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      console.error('Failed to parse backend response JSON:', jsonError);
      return NextResponse.json({ 
        error: 'Backend returned invalid JSON response',
        success: false 
      }, { status: 502 });
    }
    
    return NextResponse.json({ 
      ...data,
      mode: hasDocuments ? 'document' : 'general',
      success: true 
    });
  } catch (e) {
    console.error('Chat API error:', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ 
      error: msg,
      success: false 
    }, { status: 500 });
  }
}
