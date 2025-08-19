import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch files from Supabase via FastAPI backend
    // For now, return mock data
    const mockFiles = [
      {
        id: '1',
        file_name: 'Sample Document.pdf',
        file_size: 1024000,
        content_type: 'application/pdf',
        status: 'processed',
        chunks_count: 15,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      },
      {
        id: '2',
        file_name: 'Research Notes.txt',
        file_size: 512000,
        content_type: 'text/plain',
        status: 'processing',
        chunks_count: 0,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        processed_at: null,
      }
    ];

    return NextResponse.json({
      files: mockFiles,
      total: mockFiles.length
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}