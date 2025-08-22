from fastapi import APIRouter, HTTPException, Depends
from app.models.file import FileUploadRequest, FileProcessingResponse
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
    return PineconeService()

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
async def process_file(request: FileUploadRequest, current_user: str = Depends(get_verified_user)):
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
        
        # Generate job ID and file ID
        job_id = str(uuid.uuid4())
        file_id = str(uuid.uuid4())
        
        # Download file from S3
        local_file_path = await s3_service.download_file(request.file_key)
        if not local_file_path:
            raise HTTPException(status_code=500, detail="Failed to download file from S3")

        try:
            # Security: Validate file size after download
            if not validate_file_size(local_file_path, max_size_mb=50):
                raise HTTPException(status_code=400, detail="File too large for processing")

            # Extract text from file
            text = TextExtractor.extract_text(local_file_path, request.content_type)
            if not text:
                raise HTTPException(status_code=400, detail="Failed to extract text from file")

            # Security: Validate extracted text length
            if len(text) > 10 * 1024 * 1024:  # 10MB text limit
                raise HTTPException(status_code=400, detail="Extracted text too large")

            # Chunk the text
            chunks = TextExtractor.chunk_text(text)
            
            # Security: Limit number of chunks to prevent resource exhaustion
            if len(chunks) > 1000:
                raise HTTPException(status_code=400, detail="Too many text chunks generated")
            
            # Generate embeddings using Nvidia NIM API
            print(f"Generating embeddings for {len(chunks)} chunks...")
            embeddings = await nim_service.generate_embeddings_batch(chunks)
            
            # Filter out None embeddings and prepare for Pinecone
            valid_embeddings = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                if embedding:
                    # Security: Limit chunk text length in metadata
                    chunk_preview = chunk[:500] if len(chunk) > 500 else chunk
                    valid_embeddings.append({
                        'id': f"{request.file_key}_chunk_{i}",
                        'embedding': embedding,
                        'metadata': {
                            'file_key': request.file_key,
                            'file_name': request.file_name,
                            'user_id': request.user_id,
                            'chunk_index': i,
                            'text': chunk_preview,
                            'content_type': request.content_type
                        }
                    })
            
            # Store embeddings in Pinecone
            if valid_embeddings:
                success = await pinecone_service.upsert_vectors(valid_embeddings)
                if success:
                    print(f"Successfully stored {len(valid_embeddings)} embeddings in Pinecone")
                else:
                    print("Failed to store embeddings in Pinecone")
                    # Don't fail the entire process if Pinecone fails
            
            # Store metadata in Supabase
            file_record = {
                'id': file_id,
                'file_key': request.file_key,
                'file_name': request.file_name,
                'user_id': request.user_id,
                'file_size': request.file_size,
                'content_type': request.content_type,
                'status': 'processed',
                'chunks_count': len(valid_embeddings)
            }
            
            db_file_id = await supabase_service.create_file_record(file_record)
            if db_file_id:
                print(f"File metadata stored in Supabase with ID: {db_file_id}")
            
            print(f"Processed file {request.file_name}: {len(chunks)} chunks created, {len(valid_embeddings)} embeddings stored")
            
            return FileProcessingResponse(
                job_id=job_id,
                status="completed",
                message=f"Successfully processed {request.file_name} into {len(chunks)} chunks",
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
        if os.getenv('DEBUG') == 'True':
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