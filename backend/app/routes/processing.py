from fastapi import APIRouter, HTTPException, Depends
from app.models.file import FileProcessingRequest, FileProcessingResponse
from app.services.s3_service import S3Service
from app.services.text_extractor import TextExtractor
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
from app.services.supabase_service import SupabaseService
from app.tasks.processing_tasks import process_file_task
import uuid
import os
import re
from datetime import datetime
from app.deps import get_verified_user, require_backend_key
from app.config import settings

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
def validate_file_size(file_path: str, max_size_mb: int = settings.max_file_size_mb) -> bool:
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
    Enqueue background processing job for uploaded file.
    """
    # Verify the user in payload matches the authenticated user
    if request.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to process this user's file")

    # Security: Validate file key
    if not validate_file_key(request.file_key, request.user_id):
        raise HTTPException(status_code=400, detail="Invalid file key")

    # Create or find file record and job record
    supabase_service = get_supabase_service()

    # Ensure file record exists (frontend should have created it, but be idempotent)
    existing_file = await supabase_service.get_file_by_key_and_user(request.file_key, request.user_id)
    if not existing_file:
        file_id = await supabase_service.create_file_record({
            'file_key': request.file_key,
            'file_name': request.file_name,
            'user_id': request.user_id,
            'file_size': request.file_size or 0,
            'content_type': request.content_type,
            'status': 'uploaded',
        })
        if not file_id:
            raise HTTPException(status_code=500, detail="Failed to ensure file record")
        existing_file = await supabase_service.get_file_by_id(file_id)

    # Idempotency: one active job per file
    job_id = await supabase_service.get_or_create_job(existing_file['id'], request.user_id, status='queued')
    if not job_id:
        raise HTTPException(status_code=500, detail="Failed to create job")

    # Update job to queued and enqueue task
    await supabase_service.update_job_status(job_id, 'queued')

    task = process_file_task.apply_async(kwargs={
        'payload': {
            'file_key': request.file_key,
            'file_name': request.file_name,
            'user_id': request.user_id,
            'content_type': request.content_type,
            'job_id': job_id,
        }
    })

    # Mark job as processing immediately after enqueuing
    await supabase_service.update_job_status(job_id, 'processing')

    return FileProcessingResponse(
        job_id=job_id,
        status="queued",
        message=f"Processing started for {request.file_name}",
        file_key=request.file_key
    )

@router.get("/status/{job_id}")
async def get_processing_status(job_id: str, current_user: str = Depends(get_verified_user)):
    """
    Get the status of a processing job
    """
    # Security: Validate job_id format
    if not re.match(r'^[a-f0-9\-]+$', job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    supabase_service = get_supabase_service()
    job = await supabase_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.get('user_id') != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to view this job")

    return {
        "job_id": job_id,
        "status": job.get('status', 'unknown'),
        "created_at": job.get('created_at'),
        "completed_at": job.get('completed_at'),
    }