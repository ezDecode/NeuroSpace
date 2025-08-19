from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FileUploadRequest(BaseModel):
    file_key: str
    file_name: str
    user_id: str
    file_size: int
    content_type: str

class FileProcessingResponse(BaseModel):
    job_id: str
    status: str
    message: str
    file_key: str

class TextChunk(BaseModel):
    id: str
    text: str
    metadata: dict
    embedding: Optional[List[float]] = None

class ProcessedFile(BaseModel):
    id: str
    file_key: str
    file_name: str
    user_id: str
    status: str
    chunks: List[TextChunk]
    created_at: datetime
    processed_at: Optional[datetime] = None