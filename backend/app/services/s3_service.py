import os
try:
    import boto3  # type: ignore
    from botocore.exceptions import ClientError  # type: ignore
except Exception:  # pragma: no cover - allow running without AWS deps
    boto3 = None  # type: ignore
    class ClientError(Exception):  # Minimal stand-in
        pass
import tempfile
from typing import Optional

class S3Service:
    def __init__(self):
        # Lazily handle missing boto3 in test environments
        if boto3 is not None:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION')
            )
        else:
            # Placeholder; tests can monkeypatch this attribute
            self.s3_client = None
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')

    async def upload_file(self, file_key: str, file_content: bytes, content_type: str = None) -> bool:
        """
        Upload a file to S3
        """
        try:
            if not self.s3_client:
                raise Exception("S3 client not available")
            
            # Set content type if provided
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                **extra_args
            )
            
            return True
        except ClientError as e:
            print(f"Error uploading file to S3: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error uploading file: {e}")
            return False

    async def download_file(self, file_key: str) -> Optional[str]:
        """
        Download a file from S3 and return the local file path
        """
        try:
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.tmp')
            temp_file_path = temp_file.name
            temp_file.close()

            # Download file from S3
            self.s3_client.download_file(self.bucket_name, file_key, temp_file_path)
            
            return temp_file_path
        except ClientError as e:
            print(f"Error downloading file from S3: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error downloading file: {e}")
            return None

    async def get_file_metadata(self, file_key: str) -> Optional[dict]:
        """
        Get metadata for a file in S3
        """
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return response.get('Metadata', {})
        except ClientError as e:
            print(f"Error getting file metadata: {e}")
            return None

    async def get_file_size(self, file_key: str) -> Optional[int]:
        """
        Get file size from S3
        """
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return response.get('ContentLength', 0)
        except ClientError as e:
            print(f"Error getting file size from S3: {e}")
            return None

    def cleanup_temp_file(self, file_path: str):
        """
        Clean up temporary file
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error cleaning up temp file: {e}")