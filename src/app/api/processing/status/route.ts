import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const jobId = searchParams.get('jobId');
		if (!jobId) {
			return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
		}

		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
		const resp = await fetch(`${backendUrl}/api/processing/status/${jobId}`, { cache: 'no-store' });
		if (!resp.ok) {
			const text = await resp.text();
			return NextResponse.json({ error: text || 'Failed to fetch status' }, { status: resp.status });
		}
		const data = await resp.json();
		return NextResponse.json(data);
	} catch (e) {
		return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
	}
}

