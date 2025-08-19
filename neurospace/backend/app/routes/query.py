from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class QueryRequest(BaseModel):
	user_id: str
	question: str
	top_k: int = 5

class QueryResponse(BaseModel):
	answer: str
	references: List[Dict[str, Any]]

nim_service = NIMService()
pinecone_service = PineconeService()

@router.post("/ask", response_model=QueryResponse)
async def ask_question(payload: QueryRequest):
	start = time.time()
	logger.info("QnA: received question for user %s", payload.user_id)
	# 1) Embed query
	embedding = await nim_service.generate_embedding(payload.question)
	if not embedding:
		logger.error("QnA: embedding failed")
		raise HTTPException(status_code=500, detail="Failed to embed query")
	logger.info("QnA: embedding generated in %.2f ms", (time.time()-start)*1000)

	# 2) Pinecone search scoped to user_id
	pc_start = time.time()
	filter_dict = { "user_id": { "$eq": payload.user_id } }
	matches = await pinecone_service.search_similar(embedding, top_k=payload.top_k, filter_dict=filter_dict)
	logger.info("QnA: pinecone returned %d matches in %.2f ms", len(matches), (time.time()-pc_start)*1000)

	# 3) Assemble context from matches
	context_parts: List[str] = []
	references: List[Dict[str, Any]] = []
	for m in matches:
		md = m.get('metadata', {})
		text = md.get('text', '')
		file_name = md.get('file_name', 'document')
		context_parts.append(f"[Source: {file_name}]\n{text}")
		references.append({
			"file_name": file_name,
			"score": m.get('score'),
			"chunk_index": md.get('chunk_index'),
			"file_key": md.get('file_key')
		})
	context = "\n\n".join(context_parts)

	# 4) Get answer from NIM
	ans_start = time.time()
	answer = await nim_service.generate_answer(payload.question, context)
	if not answer:
		logger.error("QnA: answer generation failed")
		raise HTTPException(status_code=500, detail="Failed to generate answer")
	logger.info("QnA: answer generated in %.2f ms", (time.time()-ans_start)*1000)
	logger.info("QnA: total pipeline time %.2f ms", (time.time()-start)*1000)

	return QueryResponse(answer=answer, references=references)