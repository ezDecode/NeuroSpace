import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    const jwt = await getToken();
    if (!jwt) {
      return new Response('Missing auth token', { status: 401 });
    }

    const { content, topK = 5, selectedFiles = [] } = await request.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return new Response('Invalid or empty content', { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const key = process.env.BACKEND_API_KEY;

    // Determine if the user has any documents
    let hasDocuments = false;
    try {
      const filesResp = await fetch(`${backendUrl}/api/files/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          ...(key ? { 'X-Backend-Key': key } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (filesResp.ok) {
        const filesData = await filesResp.json();
        const total = typeof filesData?.total === 'number' ? filesData.total : Array.isArray(filesData?.files) ? filesData.files.length : 0;
        hasDocuments = total > 0;
      }
    } catch {
      hasDocuments = false;
    }

    const route = hasDocuments ? 'ask_stream' : 'ask_direct_stream';
    
    // Add timeout to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    let resp;
    try {
      resp = await fetch(`${backendUrl}/api/query/${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'X-Backend-Key': key } : {}),
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ 
          user_id: userId, 
          question: content, 
          top_k: topK,
          selected_files: selectedFiles
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return new Response('Request timeout', { status: 408 });
      }
      return new Response(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }

    clearTimeout(timeoutId);

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => '');
      const errorMessage = text || `Backend error: ${resp.status} ${resp.statusText}`;
      console.error('Backend streaming error:', errorMessage);
      return new Response(errorMessage, { status: resp.status || 500 });
    }

    const transform = new TransformStream();
    const writer = transform.writable.getWriter();
    const reader = resp.body.getReader();

    // Backend already sends a header line (mode and optionally references). Pass-through.

    async function pump(): Promise<void> {
      try {
        const { done, value } = await reader.read();
        if (done) {
          await writer.close();
          return;
        }
        await writer.write(value);
        return pump();
      } catch (error) {
        // Handle connection errors gracefully
        try {
          await writer.close();
        } catch {
          // Ignore close errors
        }
        throw error;
      }
    }

    // Handle cleanup on client disconnect
    const cleanup = () => {
      try {
        reader.cancel();
        writer.close();
      } catch {
        // Ignore cleanup errors
      }
    };

    // Listen for client disconnect
    if (request.signal) {
      request.signal.addEventListener('abort', cleanup);
    }

    try {
      await pump();
    } catch (error) {
      cleanup();
      console.error('Stream processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
      return new Response(errorMessage, { status: 500 });
    }
    return new Response(transform.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    console.error('Chat stream route error:', msg, e);
    return new Response(msg, { status: 500 });
  }
}

