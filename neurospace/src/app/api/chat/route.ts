import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const { content, topK = 5 } = await request.json();
		if (!content || typeof content !== 'string') {
			return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
		}
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
		const resp = await fetch(`${backendUrl}/api/query/ask`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_id: userId, question: content, top_k: topK }),
		});
		const data = await resp.json();
		if (!resp.ok) {
			return NextResponse.json({ error: data?.detail || 'Failed to get answer' }, { status: 500 });
		}
		return NextResponse.json(data);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
	}
}