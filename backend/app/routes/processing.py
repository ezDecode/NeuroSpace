from fastapi import APIRouter, HTTPException, Depends
from app.models.file import FileProcessingRequest, FileProcessingResponse
from app.services.s3_service import S3Service
from app.services.text_extractor import TextExtractor
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
from app.services.supabase_service import SupabaseService
import uuid
import os
import re
from datetime import datetime
from app.deps import get_verified_user, require_backend_key

router = APIRouter(dependencies=[Depends(require_backend_key)])

# Use lazy initialization for services to avoid OpenAI client issues at startup
def get_s3_service():
    return S3Service()

def get_nim_service():
    return NIMService()

def get_pinecone_service():
    nim_service = NIMService()
    embedding_dimension = nim_service.get_embedding_dimension()
    return PineconeService(embedding_dimension=embedding_dimension)

def get_supabase_service():
    return SupabaseService()

# Security: Validate file key format
def validate_file_key(file_key: str, user_id: str) -> bool:
    """Validate file key to prevent path traversal attacks"""
    # Check if file key starts with expected pattern
    expected_prefix = f"uploads/{user_id}/"
    if not file_key.startswith(expected_prefix):
        return False
    
    # Check for path traversal attempts
    if '..' in file_key or '/' in file_key[len(expected_prefix):]:
        return False
    
    # Check for safe characters only
    safe_pattern = re.compile(r'^[a-zA-Z0-9\-_\.]+$')
    filename = file_key.split('/')[-1]
    return bool(safe_pattern.match(filename))

# Security: Validate file size
def validate_file_size(file_path: str, max_size_mb: int = 50) -> bool:
    """Validate file size to prevent memory exhaustion"""
    try:
        file_size = os.path.getsize(file_path)
        max_size_bytes = max_size_mb * 1024 * 1024
        return file_size <= max_size_bytes
    except OSError:
        return False

@router.post("/process", response_model=FileProcessingResponse)
async def process_file(request: FileProcessingRequest, current_user: str = Depends(get_verified_user)):
    """
    Process uploaded file: download from S3, extract text, chunk it
    """
    try:
        # Verify the user in payload matches the authenticated user
        if request.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to process this user's file")
        
        # Security: Validate file key
        if not validate_file_key(request.file_key, request.user_id):
            raise HTTPException(status_code=400, detail="Invalid file key")
        
        # Initialize services lazily
        s3_service = get_s3_service()
        nim_service = get_nim_service()
        pinecone_service = get_pinecone_service()
        supabase_service = get_supabase_service()
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Get actual file size from S3 first
        actual_file_size = await s3_service.get_file_size(request.file_key)
        if actual_file_size is None:
            raise HTTPException(status_code=500, detail="Failed to get file size from S3")
        
        # Update the request file_size with actual size from S3
        request.file_size = actual_file_size
        
        # Download file from S3
        local_file_path = await s3_service.download_file(request.file_key)
        if not local_file_path:
            raise HTTPException(status_code=500, detail="Failed to download file from S3")

        try:
            # Security: Validate file size after download
            if not validate_file_size(local_file_path, max_size_mb=50):
                raise HTTPException(status_code=400, detail="File too large for processing")

            # Ensure existing file record exists to update status; avoid creating duplicates
            existing_file = await supabase_service.get_file_by_key_and_user(request.file_key, request.user_id)
            if not existing_file:
                raise HTTPException(status_code=500, detail="File record not found for this file_key and user; cannot update status")

            # Extract text from file
            text = TextExtractor.extract_text(local_file_path, request.content_type)
            # Chunk the text (handles None/empty gracefully)
            chunks = TextExtractor.chunk_text(text)
            chunk_count = len(chunks)

            # If no extractable text, update status as error and return
            if chunk_count == 0:
                await supabase_service.update_file_status(
                    existing_file['id'],
                    'error',
                    chunks_count=0,
                    file_size=actual_file_size,
                    embedding_count=0,
                    last_error='No extractable text'
                )
                return FileProcessingResponse(
                    job_id=job_id,
                    status='error',
                    message='No extractable text',
                    file_key=request.file_key
                )

            # Security: Validate extracted text length
            if text and len(text) > 10 * 1024 * 1024:  # 10MB text limit
                raise HTTPException(status_code=400, detail="Extracted text too large")

            # Security: Limit number of chunks to prevent resource exhaustion
            if len(chunks) > 1000:
                raise HTTPException(status_code=400, detail="Too many text chunks generated")
            
            # Generate embeddings using Nvidia NIM API
            print(f"Generating embeddings for {len(chunks)} chunks...")
            embeddings = await nim_service.generate_embeddings_batch(chunks)
            embedding_count = len([e for e in embeddings if e is not None])
            
            # Filter out None embeddings and prepare for Pinecone with enforced metadata
            valid_embeddings = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                if embedding:
                    # Security: Limit chunk text length in metadata
                    chunk_preview = chunk[:500] if len(chunk) > 500 else chunk
                    valid_embeddings.append({
                        'id': f"{request.file_key}_chunk_{i}",
                        'embedding': embedding,
                        'metadata': {
                            'user_id': request.user_id,
                            'file_key': request.file_key,
                            'file_name': request.file_name,
                            'chunk_index': i,
                            'text': chunk_preview,
                            'content_type': request.content_type
                        }
                    })
            
            # If embedding_count is zero, mark error and return
            if embedding_count == 0:
                nim_summary = f"Embedding generation failed: 0/{chunk_count} successful"
                await supabase_service.update_file_status(
                    existing_file['id'],
                    'error',
                    chunks_count=chunk_count,
                    file_size=actual_file_size,
                    embedding_count=0,
                    last_error=nim_summary
                )
                return FileProcessingResponse(
                    job_id=job_id,
                    status='error',
                    message=nim_summary,
                    file_key=request.file_key
                )

            # Store embeddings in Pinecone
            upsert_result = {"total": len(valid_embeddings), "accepted": 0, "skipped": 0, "errors": []}
            if valid_embeddings:
                upsert_result = pinecone_service.upsert_vectors(valid_embeddings)
                print(f"Pinecone upsert result: {upsert_result}")
            
            # Decide final status based on upsert result
            upsert_accepted = int(upsert_result.get('accepted', 0) or 0)
            if upsert_accepted == 0:
                pinecone_error = "Pinecone upsert accepted 0 vectors"
                if upsert_result.get('errors'):
                    pinecone_error += f"; first error: {str(upsert_result['errors'][0])[:200]}"
                await supabase_service.update_file_status(
                    existing_file['id'],
                    'error',
                    chunks_count=chunk_count,
                    file_size=actual_file_size,
                    embedding_count=embedding_count,
                    last_error=pinecone_error
                )
                return FileProcessingResponse(
                    job_id=job_id,
                    status='error',
                    message=pinecone_error,
                    file_key=request.file_key
                )

            # Success path: mark as processed with counts
            update_success = await supabase_service.update_file_status(
                existing_file['id'],
                'processed',
                chunks_count=embedding_count,
                file_size=actual_file_size,
                embedding_count=embedding_count,
                last_error=None
            )
            if update_success:
                print(f"File metadata updated in Supabase for file: {request.file_name}")
            else:
                print(f"Failed to update file metadata in Supabase for file: {request.file_name}")
            
            print(f"Processed file {request.file_name}: {len(chunks)} chunks created, {len(valid_embeddings)} embeddings stored")
            
            return FileProcessingResponse(
                job_id=job_id,
                status='processed',
                message=f"Successfully processed {request.file_name}: {embedding_count} embeddings stored",
                file_key=request.file_key
            )
            
        finally:
            # Clean up temporary file
            s3_service.cleanup_temp_file(local_file_path)
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing file: {e}")
        # Security: Generic error message in production
        debug_value = os.getenv('DEBUG', '').lower()
        if debug_value in ('true', '1', 'yes'):
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/status/{job_id}")
async def get_processing_status(job_id: str, current_user: str = Depends(get_verified_user)):
    """
    Get the status of a processing job
    """
    # Security: Validate job_id format
    if not re.match(r'^[a-f0-9\-]+$', job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    # TODO: Implement job status tracking
    return {
        "job_id": job_id,
        "status": "completed",
        "message": "Processing completed successfully"
    }