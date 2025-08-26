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

    const { content, topK = 5 } = await request.json();
    if (!content || typeof content !== 'string') {
      return new Response('Invalid content', { status: 400 });
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
    const resp = await fetch(`${backendUrl}/api/query/${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-Backend-Key': key } : {}),
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ user_id: userId, question: content, top_k: topK }),
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => '');
      return new Response(text || 'Backend streaming error', { status: 500 });
    }

    const transform = new TransformStream();
    const writer = transform.writable.getWriter();
    const reader = resp.body.getReader();

    // Backend already sends a header line (mode and optionally references). Pass-through.

    async function pump(): Promise<void> {
      const { done, value } = await reader.read();
      if (done) {
        await writer.close();
        return;
      }
      await writer.write(value);
      return pump();
    }

    pump();
    return new Response(transform.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return new Response(msg, { status: 500 });
  }
}

