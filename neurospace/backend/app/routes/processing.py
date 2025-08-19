from fastapi import APIRouter, HTTPException
from app.models.file import FileUploadRequest, FileProcessingResponse
from app.services.s3_service import S3Service
from app.services.text_extractor import TextExtractor
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
from app.services.supabase_service import SupabaseService
import uuid
from datetime import datetime

router = APIRouter()
s3_service = S3Service()
nim_service = NIMService()
pinecone_service = PineconeService()
supabase_service = SupabaseService()

@router.post("/process", response_model=FileProcessingResponse)
async def process_file(request: FileUploadRequest):
    """
    Process uploaded file: download from S3, extract text, chunk it
    """
    try:
        # Generate job ID and file ID
        job_id = str(uuid.uuid4())
        file_id = str(uuid.uuid4())
        
        # Download file from S3
        local_file_path = await s3_service.download_file(request.file_key)
        if not local_file_path:
            raise HTTPException(status_code=500, detail="Failed to download file from S3")

        try:
            # Extract text from file
            text = TextExtractor.extract_text(local_file_path, request.content_type)
            if not text:
                raise HTTPException(status_code=400, detail="Failed to extract text from file")

            # Chunk the text
            chunks = TextExtractor.chunk_text(text)
            
            # Generate embeddings using Nvidia NIM API
            print(f"Generating embeddings for {len(chunks)} chunks...")
            embeddings = await nim_service.generate_embeddings_batch(chunks)
            
            # Filter out None embeddings and prepare for Pinecone
            valid_embeddings = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                if embedding:
                    valid_embeddings.append({
                        'id': f"{request.file_key}_chunk_{i}",
                        'embedding': embedding,
                        'metadata': {
                            'file_key': request.file_key,
                            'file_name': request.file_name,
                            'user_id': request.user_id,
                            'chunk_index': i,
                            'text': chunk[:500],  # Store first 500 chars for reference
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
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/status/{job_id}")
async def get_processing_status(job_id: str):
    """
    Get the status of a processing job
    """
    # TODO: Implement job status tracking
    return {
        "job_id": job_id,
        "status": "completed",
        "message": "Processing completed successfully"
    }