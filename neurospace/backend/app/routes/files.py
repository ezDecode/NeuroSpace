from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_files():
    """
    List all files for the authenticated user
    """
    # TODO: Implement file listing from Supabase
    return {"files": []}

@router.get("/{file_id}")
async def get_file(file_id: str):
    """
    Get file details by ID
    """
    # TODO: Implement file retrieval from Supabase
    return {"file_id": file_id, "status": "not_implemented"}