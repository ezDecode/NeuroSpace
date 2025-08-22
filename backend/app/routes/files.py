from fastapi import APIRouter, Depends, HTTPException
from typing import List
import os
from app.models.file import FileUploadRequest
from app.deps import get_verified_user, require_backend_key
from app.services.supabase_service import SupabaseService

router = APIRouter(dependencies=[Depends(require_backend_key)])
supabase_service = SupabaseService()

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
        # Verify the user owns this file
        if file_data.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to create file for this user")
        
        # Use the existing create_file_record method
        file_id = await supabase_service.create_file_record({
            'file_key': file_data.file_key,
            'file_name': file_data.file_name,
            'user_id': file_data.user_id,
            'file_size': file_data.file_size,
            'content_type': file_data.content_type,
            'status': 'uploaded'
        })
        
        if file_id:
            return {"id": str(file_id), "message": "File created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create file record")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create file: {str(e)}")

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