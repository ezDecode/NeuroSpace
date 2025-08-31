-- Migration to add missing columns to files table
-- Run this in your Supabase SQL editor if the columns don't exist

-- Add embedding_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'embedding_count'
    ) THEN
        ALTER TABLE files ADD COLUMN embedding_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add last_error column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'last_error'
    ) THEN
        ALTER TABLE files ADD COLUMN last_error TEXT;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'files' 
ORDER BY ordinal_position;
