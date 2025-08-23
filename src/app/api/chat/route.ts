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
    
    const resp = await fetch(`${backendUrl}/api/query/ask`, {
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
      const errorData = await resp.json().catch(() => ({}));
      console.error('Backend error:', resp.status, errorData);
      return NextResponse.json({ 
        error: errorData?.detail || `Backend error: ${resp.status}` 
      }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error('Chat API error:', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
