-- Fix Schema Script for File Upload System
-- This script adds missing columns to the files table if they don't exist

-- Add embedding_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name = 'embedding_count'
    ) THEN
        ALTER TABLE files ADD COLUMN embedding_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added embedding_count column to files table';
    ELSE
        RAISE NOTICE 'embedding_count column already exists';
    END IF;
END $$;

-- Add last_error column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name = 'last_error'
    ) THEN
        ALTER TABLE files ADD COLUMN last_error TEXT;
        RAISE NOTICE 'Added last_error column to files table';
    ELSE
        RAISE NOTICE 'last_error column already exists';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_embedding_count ON files(embedding_count);

-- Verify the schema
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT count(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'files' 
    AND column_name IN ('embedding_count', 'last_error');
    
    IF column_count = 2 THEN
        RAISE NOTICE 'Schema fix completed successfully - both columns are present';
    ELSE
        RAISE NOTICE 'Schema fix may have issues - only % columns found', column_count;
    END IF;
END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'files'
ORDER BY ordinal_position;