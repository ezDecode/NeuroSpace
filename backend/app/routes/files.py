from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
import os
from app.models.file import FileUploadRequest
from app.deps import get_verified_user
from app.services.supabase_service import SupabaseService
from app.services.s3_service import S3Service
import uuid

router = APIRouter()
supabase_service = SupabaseService()
s3_service = S3Service()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: str = Depends(get_verified_user)
):
    """
    Upload a file to S3 and create a file record
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Generate unique file key
        file_extension = os.path.splitext(file.filename)[1]
        file_key = f"uploads/{current_user}/{uuid.uuid4()}{file_extension}"
        
        # Upload to S3
        file_content = await file.read()
        await s3_service.upload_file(file_key, file_content, file.content_type)
        
        # Create file record in database
        file_id = await supabase_service.create_file_record({
            'file_key': file_key,
            'file_name': file.filename,
            'user_id': current_user,
            'file_size': len(file_content),
            'content_type': file.content_type or 'application/octet-stream',
            'status': 'uploaded'
        })
        
        if not file_id:
            raise HTTPException(status_code=500, detail="Failed to create file record")
        
        return {
            "file_id": str(file_id),
            "status": "uploaded",
            "message": "File uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in upload_file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/")
async def list_files(current_user: str = Depends(get_verified_user)):
    """
    List all files for the authenticated user
    """
    try:
        # Use the existing get_user_files method
        files_data = await supabase_service.get_user_files(current_user)
        
        # Transform the data to match the expected format
        files = []
        for file_data in files_data:
            files.append({
                "id": str(file_data.get('id', '')),
                "file_key": file_data.get('file_key', ''),
                "file_name": file_data.get('file_name', ''),
                "file_size": file_data.get('file_size', 0),
                "content_type": file_data.get('content_type', ''),
                "status": file_data.get('status', 'uploaded'),
                "chunks_count": file_data.get('chunks_count', 0),
                "embedding_count": file_data.get('embedding_count', 0),
                "last_error": file_data.get('last_error', None),
                "created_at": file_data.get('created_at', ''),
                "processed_at": file_data.get('processed_at', ''),
            })
        
        return {"files": files, "total": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch files: {str(e)}")

@router.post("/")
async def create_file(file_data: FileUploadRequest, current_user: str = Depends(get_verified_user)):
    """
    Create a new file record in the database
    """
    try:
        print(f"Creating file record for user: {current_user}")
        print(f"File data: {file_data}")
        
        # Use the current_user from authentication
        user_id = current_user
        
        # Use the existing create_file_record method
        file_id = await supabase_service.create_file_record({
            'file_key': file_data.file_key,
            'file_name': file_data.file_name,
            'user_id': user_id,
            'file_size': file_data.file_size,
            'content_type': file_data.content_type,
            'status': 'uploaded'
        })
        
        if file_id:
            print(f"File created successfully with ID: {file_id}")
            return {"id": str(file_id), "message": "File created successfully"}
        else:
            print("Failed to create file record - no ID returned")
            raise HTTPException(status_code=500, detail="Failed to create file record - database operation failed")
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to create file: {str(e)}"
        print(f"Error in create_file route: {error_msg}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {str(e)}")
        
        # Check if it's a database schema issue
        if "embedding_count" in str(e) or "PGRST204" in str(e):
            error_msg = "Database schema issue detected. Please run the schema fix script in Supabase SQL Editor."
            print("DATABASE SCHEMA ISSUE DETECTED - RUN THE FIX SCRIPT!")
        
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/{file_id}")
async def get_file(file_id: str, current_user: str = Depends(get_verified_user)):
    """
    Get file details by ID
    """
    try:
        # Use the existing get_file_by_id method
        file_data = await supabase_service.get_file_by_id(file_id)
        
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify the file belongs to the current user
        if file_data.get('user_id') != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
        return {
            "id": str(file_data.get('id', '')),
            "file_key": file_data.get('file_key', ''),
            "file_name": file_data.get('file_name', ''),
            "user_id": file_data.get('user_id', ''),
            "file_size": file_data.get('file_size', 0),
            "content_type": file_data.get('content_type', ''),
            "status": file_data.get('status', 'uploaded'),
            "chunks_count": file_data.get('chunks_count', 0),
            "embedding_count": file_data.get('embedding_count', 0),
            "last_error": file_data.get('last_error', None),
            "created_at": file_data.get('created_at', ''),
            "processed_at": file_data.get('processed_at', ''),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch file: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: str, current_user: str = Depends(get_verified_user)):
    """
    Delete a file by ID
    """
    try:
        # Use the existing delete_file method
        success = await supabase_service.delete_file(file_id, current_user)
        
        if success:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found or not authorized")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

@router.post("/cleanup-duplicates")
async def cleanup_duplicate_files(current_user: str = Depends(get_verified_user)):
    """
    Clean up duplicate file records for the current user
    """
    try:
        # Get all files for the user
        files = await supabase_service.get_user_files(current_user)
        
        # Group files by file_key
        file_groups = {}
        for file in files:
            file_key = file.get('file_key')
            if file_key not in file_groups:
                file_groups[file_key] = []
            file_groups[file_key].append(file)
        
        # Find and remove duplicates
        duplicates_removed = 0
        for file_key, file_list in file_groups.items():
            if len(file_list) > 1:
                # Sort by created_at to keep the oldest record
                file_list.sort(key=lambda x: x.get('created_at', ''))
                
                # Keep the first (oldest) record and delete the rest
                for file_to_delete in file_list[1:]:
                    success = await supabase_service.delete_file(file_to_delete['id'], current_user)
                    if success:
                        duplicates_removed += 1
                        print(f"Removed duplicate file record: {file_to_delete['id']}")
        
        return {
            "message": f"Cleanup completed. Removed {duplicates_removed} duplicate records.",
            "duplicates_removed": duplicates_removed
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup duplicates: {str(e)}")

@router.post("/fix-file-sizes")
async def fix_file_sizes(current_user: str = Depends(get_verified_user)):
    """
    Fix file sizes for files that have incorrect size (development/admin only)
    """
    try:
        # Only allow in development environment
        if os.getenv('DEBUG') != 'true':
            raise HTTPException(status_code=403, detail="This endpoint is only available in development mode")
        
        fixed_count = await supabase_service.fix_file_sizes_from_s3(s3_service)
        return {"message": f"Fixed file sizes for {fixed_count} files"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fix file sizes: {str(e)}")