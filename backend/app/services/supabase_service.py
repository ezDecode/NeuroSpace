import os
from supabase import create_client, Client
from typing import Dict, List, Optional
from datetime import datetime

class SupabaseService:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.client: Client = create_client(self.url, self.key)

    async def create_file_record(self, file_data: Dict) -> Optional[str]:
        """
        Create a new file record in the database
        """
        try:
            # First check if the table exists and create it if not
            await self._ensure_tables_exist()
            
            # Don't include 'id' in the data - let PostgreSQL auto-generate it
            data = {
                'file_key': file_data['file_key'],
                'file_name': file_data['file_name'],
                'user_id': file_data['user_id'],
                'file_size': file_data.get('file_size', 0),
                'content_type': file_data.get('content_type', ''),
                'status': file_data.get('status', 'uploaded'),
                'chunks_count': file_data.get('chunks_count', 0),
                'created_at': datetime.utcnow().isoformat(),
                'processed_at': None
            }

            result = self.client.table('files').insert(data).execute()
            
            if result.data:
                return result.data[0]['id']
            return None

        except Exception as e:
            print(f"Error creating file record: {e}")
            return None

    async def _ensure_tables_exist(self):
        """
        Ensure that required tables exist in the database
        """
        try:
            # Try to create the files table if it doesn't exist
            schema_sql = """
            CREATE TABLE IF NOT EXISTS files (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                file_key TEXT NOT NULL,
                file_name TEXT NOT NULL,
                user_id TEXT NOT NULL,
                file_size BIGINT DEFAULT 0,
                content_type TEXT DEFAULT '',
                status TEXT DEFAULT 'uploaded',
                chunks_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                processed_at TIMESTAMP WITH TIME ZONE
            );
            
            CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
            CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
            """
            
            # Use the SQL execution endpoint (this might not work with service role key)
            # For now, just log that tables need to be created
            print("Tables may need to be created. Please run the schema from supabase_schema.sql")
            
        except Exception as e:
            print(f"Could not ensure tables exist: {e}")
            print("Please manually run the SQL schema from backend/supabase_schema.sql in your Supabase dashboard")

    async def update_file_status(self, file_id: str, status: str, chunks_count: int = None) -> bool:
        """
        Update file processing status
        """
        try:
            update_data = {
                'status': status,
                'processed_at': datetime.utcnow().isoformat()
            }
            
            if chunks_count is not None:
                update_data['chunks_count'] = chunks_count

            result = self.client.table('files').update(update_data).eq('id', file_id).execute()
            return len(result.data) > 0

        except Exception as e:
            print(f"Error updating file status: {e}")
            return False

    async def get_user_files(self, user_id: str) -> List[Dict]:
        """
        Get all files for a user
        """
        try:
            # First ensure tables exist
            await self._ensure_tables_exist()
            
            result = self.client.table('files').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return result.data or []

        except Exception as e:
            print(f"Error getting user files: {e}")
            # Return empty list if table doesn't exist
            return []

    async def get_file_by_id(self, file_id: str) -> Optional[Dict]:
        """
        Get file by ID
        """
        try:
            result = self.client.table('files').select('*').eq('id', file_id).execute()
            return result.data[0] if result.data else None

        except Exception as e:
            print(f"Error getting file by ID: {e}")
            return None

    async def delete_file(self, file_id: str, user_id: str) -> bool:
        """
        Delete a file record
        """
        try:
            result = self.client.table('files').delete().eq('id', file_id).eq('user_id', user_id).execute()
            return len(result.data) > 0

        except Exception as e:
            print(f"Error deleting file: {e}")
            return False

    async def create_processing_job(self, job_data: Dict) -> Optional[str]:
        """
        Create a processing job record
        """
        try:
            # Don't include 'id' in the data - let PostgreSQL auto-generate it
            data = {
                'file_id': job_data['file_id'],
                'user_id': job_data['user_id'],
                'status': job_data.get('status', 'processing'),
                'created_at': datetime.utcnow().isoformat(),
                'completed_at': None
            }

            result = self.client.table('processing_jobs').insert(data).execute()
            
            if result.data:
                return result.data[0]['id']
            return None

        except Exception as e:
            print(f"Error creating processing job: {e}")
            return None

    async def update_job_status(self, job_id: str, status: str) -> bool:
        """
        Update processing job status
        """
        try:
            update_data = {
                'status': status,
                'completed_at': datetime.utcnow().isoformat() if status == 'completed' else None
            }

            result = self.client.table('processing_jobs').update(update_data).eq('id', job_id).execute()
            return len(result.data) > 0

        except Exception as e:
            print(f"Error updating job status: {e}")
            return False

    async def test_connection(self) -> bool:
        """
        Test connection to Supabase
        """
        try:
            # Try to query the files table
            result = self.client.table('files').select('count', count='exact').limit(1).execute()
            return True
        except Exception as e:
            print(f"Supabase connection test failed: {e}")
            return False