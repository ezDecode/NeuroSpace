from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
from app.deps import require_backend_key, get_verified_user
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_backend_key)])

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    sources: List[str] = []  # List of file IDs
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

def get_nim_service():
    return NIMService()

def get_pinecone_service():
    nim_service = NIMService()
    embedding_dimension = nim_service.get_embedding_dimension()
    return PineconeService(embedding_dimension=embedding_dimension)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_sources(payload: ChatRequest, current_user: str = Depends(get_verified_user)):
    """
    Chat endpoint that works with selected sources and chat history
    """
    start = time.time()
    logger.info("Chat: received message for user %s", current_user)
    
    # Validate message input
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Initialize services
    nim_service = get_nim_service()
    pinecone_service = get_pinecone_service()
    
    try:
        # If sources are selected, do semantic search
        context = ""
        source_files = []
        
        if payload.sources:
            # 1) Embed the user's message
            embedding = await nim_service.generate_embedding(payload.message.strip())
            if not embedding:
                raise HTTPException(status_code=500, detail="Failed to generate embedding")
            
            # 2) Search for relevant content in selected sources
            filter_dict = {
                "user_id": {"$eq": current_user},
                "file_key": {"$in": payload.sources}
            }
            
            matches = pinecone_service.search_similar(
                embedding, 
                top_k=5, 
                filter_dict=filter_dict
            )
            
            # 3) Build context from matches
            context_parts = []
            for match in matches:
                metadata = match.get('metadata', {})
                text = metadata.get('text', '')
                file_name = metadata.get('file_name', 'document')
                
                if text and file_name not in source_files:
                    source_files.append(file_name)
                    context_parts.append(f"[From {file_name}]\n{text}")
            
            context = "\n\n".join(context_parts)
        
        # 4) Build conversation context from history
        conversation_context = ""
        if payload.history:
            recent_history = payload.history[-6:]  # Last 6 messages for context
            history_parts = []
            for msg in recent_history:
                history_parts.append(f"{msg.role.title()}: {msg.content}")
            conversation_context = "\n".join(history_parts)
        
        # 5) Generate response
        if context:
            # Use document-based answering with conversation context
            full_context = context
            if conversation_context:
                full_context = f"Previous conversation:\n{conversation_context}\n\nRelevant documents:\n{context}"
            
            answer = await nim_service.generate_answer(payload.message.strip(), full_context)
        else:
            # Use general conversation with history
            if conversation_context:
                enhanced_message = f"Previous conversation:\n{conversation_context}\n\nCurrent message: {payload.message.strip()}"
                answer = await nim_service.generate_general_answer(enhanced_message)
            else:
                answer = await nim_service.generate_general_answer(payload.message.strip())
        
        if not answer:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        logger.info("Chat: completed in %.2f ms", (time.time() - start) * 1000)
        
        return ChatResponse(
            response=answer,
            sources=source_files
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
