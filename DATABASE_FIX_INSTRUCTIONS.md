# Database Schema Fix Instructions

## Problem
The backend is failing with this error:
```
Error creating file record: {'message': "Could not find the 'embedding_count' column of 'files' in the schema cache", 'code': 'PGRST204', 'hint': None, 'details': None}
```

## Root Cause
The database schema is missing two required columns:
- `embedding_count` (INTEGER DEFAULT 0)
- `last_error` (TEXT)

## Solution

### Option 1: Run the Migration Script (Recommended)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `backend/migration_add_embedding_count.sql`
4. Execute the script

### Option 2: Update the Schema File
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `backend/supabase_schema.sql`
4. Execute the script

### Option 3: Manual Column Addition
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Add embedding_count column
ALTER TABLE files ADD COLUMN IF NOT EXISTS embedding_count INTEGER DEFAULT 0;

-- Add last_error column  
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'files' 
ORDER BY ordinal_position;
```

## Expected Result
After running any of the above solutions, your `files` table should have these columns:
- `id` (UUID, PRIMARY KEY)
- `file_key` (TEXT, NOT NULL)
- `file_name` (TEXT, NOT NULL)
- `user_id` (TEXT, NOT NULL)
- `file_size` (BIGINT, DEFAULT 0)
- `content_type` (TEXT, DEFAULT '')
- `status` (TEXT, DEFAULT 'uploaded')
- `chunks_count` (INTEGER, DEFAULT 0)
- `embedding_count` (INTEGER, DEFAULT 0) ← **NEW**
- `last_error` (TEXT) ← **NEW**
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- `processed_at` (TIMESTAMP WITH TIME ZONE)

## Verification
After applying the fix, test the file upload functionality:
1. Try uploading a file through the frontend
2. Check the backend logs for any remaining errors
3. Verify the file record is created successfully in the database

## Files Modified
- ✅ `backend/supabase_schema.sql` - Updated with missing columns
- ✅ `backend/migration_add_embedding_count.sql` - Created migration script
- ✅ `backend/app/routes/files.py` - Added missing fields to API responses

## Next Steps
1. Apply the database schema fix using one of the options above
2. Restart your backend service if needed
3. Test the file upload functionality
4. Monitor logs for any remaining issues
