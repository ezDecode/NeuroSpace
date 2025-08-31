-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    content_type TEXT DEFAULT '',
    status TEXT DEFAULT 'uploaded',
    chunks_count INTEGER DEFAULT 0,
    embedding_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create processing_jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for files table
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for processing_jobs table
CREATE POLICY "Users can view their own processing jobs" ON processing_jobs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own processing jobs" ON processing_jobs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own processing jobs" ON processing_jobs
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own processing jobs" ON processing_jobs
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create a function to get user files with status
CREATE OR REPLACE FUNCTION get_user_files(user_uuid TEXT)
RETURNS TABLE (
    id UUID,
    file_key TEXT,
    file_name TEXT,
    file_size BIGINT,
    content_type TEXT,
    status TEXT,
    chunks_count INTEGER,
    embedding_count INTEGER,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.file_key,
        f.file_name,
        f.file_size,
        f.content_type,
        f.status,
        f.chunks_count,
        f.embedding_count,
        f.last_error,
        f.created_at,
        f.processed_at
    FROM files f
    WHERE f.user_id = user_uuid
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;