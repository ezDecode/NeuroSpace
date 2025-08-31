-- Fix Database Schema for NeuroSpace
-- Run this in your Supabase SQL Editor to resolve the missing columns issue

-- Step 1: Add missing columns to files table
DO $$ 
BEGIN
    -- Add embedding_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'embedding_count'
    ) THEN
        ALTER TABLE files ADD COLUMN embedding_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added embedding_count column to files table';
    ELSE
        RAISE NOTICE 'embedding_count column already exists';
    END IF;

    -- Add last_error column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'last_error'
    ) THEN
        ALTER TABLE files ADD COLUMN last_error TEXT;
        RAISE NOTICE 'Added last_error column to files table';
    ELSE
        RAISE NOTICE 'last_error column already exists';
    END IF;
END $$;

-- Step 2: Verify the complete table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'files' 
ORDER BY ordinal_position;

-- Step 3: Create the table if it doesn't exist (fallback)
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

-- Step 4: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);

-- Step 5: Create processing_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Step 6: Create indexes for processing_jobs
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Step 7: Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for files table
DROP POLICY IF EXISTS "Users can view their own files" ON files;
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own files" ON files;
CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own files" ON files;
CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own files" ON files;
CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 9: Create RLS policies for processing_jobs table
DROP POLICY IF EXISTS "Users can view their own processing jobs" ON processing_jobs;
CREATE POLICY "Users can view their own processing jobs" ON processing_jobs
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own processing jobs" ON processing_jobs;
CREATE POLICY "Users can insert their own processing jobs" ON processing_jobs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own processing jobs" ON processing_jobs;
CREATE POLICY "Users can update their own processing jobs" ON processing_jobs
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own processing jobs" ON processing_jobs;
CREATE POLICY "Users can delete their own processing jobs" ON processing_jobs
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 10: Final verification
SELECT 'Schema fix completed successfully' as status;
