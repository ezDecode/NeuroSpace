from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.nim_service import NIMService, EmbeddingError
from app.services.pinecone_service import PineconeService
from app.deps import require_backend_key, get_verified_user
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_backend_key)])

class QueryRequest(BaseModel):
	user_id: str
	question: str
	top_k: int = 5
	selected_files: List[str] = []  # List of file_keys to filter by

class QueryResponse(BaseModel):
	answer: str
	references: List[Dict[str, Any]]

class DebugEmbeddingRequest(BaseModel):
	text: str
	user_id: Optional[str] = None

class DebugEmbeddingResponse(BaseModel):
	embedding: List[float]
	dimension: int
	processing_time_ms: float

class DebugSearchRequest(BaseModel):
	embedding: List[float]
	top_k: int = 5
	filter_dict: Optional[Dict] = None
	user_id: Optional[str] = None

class DebugSearchResponse(BaseModel):
	matches: List[Dict[str, Any]]
	total_matches: int
	processing_time_ms: float

class HealthCheckResponse(BaseModel):
	services: Dict[str, Dict[str, Any]]
	overall_status: str

# Use lazy initialization for services with proper embedding dimension coordination
def get_nim_service():
    return NIMService()

def get_pinecone_service():
    nim_service = NIMService()
    embedding_dimension = nim_service.get_embedding_dimension()
    return PineconeService(embedding_dimension=embedding_dimension)

@router.post("/ask", response_model=QueryResponse)
async def ask_question(payload: QueryRequest, current_user: str = Depends(get_verified_user)):
	start = time.time()
	logger.info("QnA: received question for user %s", payload.user_id)
	if payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")
	
	# Validate question input
	if not payload.question or not payload.question.strip():
		raise HTTPException(status_code=400, detail="Question cannot be empty")
	
	# Initialize services lazily
	nim_service = get_nim_service()
	pinecone_service = get_pinecone_service()
	
	# 1) Embed query
	try:
		embedding = await nim_service.generate_embedding(payload.question.strip())
		if not embedding:
			logger.error("QnA: embedding returned None")
			raise HTTPException(status_code=500, detail="Failed to embed query - no embedding returned")
		if not isinstance(embedding, list) or len(embedding) == 0:
			logger.error("QnA: embedding is not a valid list")
			raise HTTPException(status_code=500, detail="Failed to embed query - invalid embedding format")
		logger.info("QnA: embedding generated in %.2f ms (dimension: %d)", (time.time()-start)*1000, len(embedding))
	except EmbeddingError as e:
		logger.error(f"QnA: embedding failed with specific error: {e.message} (code: {e.error_code})")
		if e.error_code == "MISSING_API_KEY":
			raise HTTPException(status_code=500, detail="Configuration error: NVIDIA API key not configured")
		elif e.error_code == "AUTHENTICATION_FAILED":
			raise HTTPException(status_code=500, detail="Authentication error: Invalid NVIDIA API key")
		elif e.error_code == "RATE_LIMITED":
			raise HTTPException(status_code=429, detail="Rate limited by NVIDIA API. Please try again later.")
		elif e.error_code == "TIMEOUT":
			raise HTTPException(status_code=408, detail="Embedding request timed out. Please try again.")
		else:
			raise HTTPException(status_code=500, detail=f"Failed to embed query: {e.message}")
	except Exception as e:
		logger.error(f"QnA: unexpected embedding error: {e}")
		raise HTTPException(status_code=500, detail="Failed to embed query due to unexpected error")

	# 2) Pinecone search scoped to user_id
	pc_start = time.time()
	filter_dict = { "user_id": { "$eq": payload.user_id } }
	
	# Add file filtering if selected_files is provided
	if payload.selected_files:
		filter_dict["file_key"] = { "$in": payload.selected_files }
	
	matches = pinecone_service.search_similar(embedding, top_k=payload.top_k, filter_dict=filter_dict)
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

@router.post("/ask_direct", response_model=QueryResponse)
async def ask_question_direct(payload: QueryRequest, current_user: str = Depends(get_verified_user)):
	start = time.time()
	logger.info("Direct QnA: received question for user %s", payload.user_id)
	if payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")

	# Validate question input
	if not payload.question or not payload.question.strip():
		raise HTTPException(status_code=400, detail="Question cannot be empty")

	# Initialize service lazily
	nim_service = get_nim_service()

	ans_start = time.time()
	answer = await nim_service.generate_general_answer(payload.question.strip())
	if not answer:
		logger.error("Direct QnA: answer generation failed")
		raise HTTPException(status_code=500, detail="Failed to generate answer")
	logger.info("Direct QnA: answer generated in %.2f ms", (time.time()-ans_start)*1000)
	logger.info("Direct QnA: total time %.2f ms", (time.time()-start)*1000)

	return QueryResponse(answer=answer, references=[])

@router.post("/ask_stream")
async def ask_question_stream(payload: QueryRequest, current_user: str = Depends(get_verified_user)):
	start = time.time()
	logger.info("QnA Stream: received question for user %s", payload.user_id)
	if payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")

	# Validate question input
	if not payload.question or not payload.question.strip():
		raise HTTPException(status_code=400, detail="Question cannot be empty")

	# Initialize services lazily
	nim_service = get_nim_service()
	pinecone_service = get_pinecone_service()

	# 1) Embed query
	try:
		embedding = await nim_service.generate_embedding(payload.question.strip())
		if not embedding:
			logger.error("QnA Stream: embedding returned None")
			raise HTTPException(status_code=500, detail="Failed to embed query - no embedding returned")
		if not isinstance(embedding, list) or len(embedding) == 0:
			logger.error("QnA Stream: embedding is not a valid list")
			raise HTTPException(status_code=500, detail="Failed to embed query - invalid embedding format")
	except EmbeddingError as e:
		logger.error(f"QnA Stream: embedding failed with specific error: {e.message} (code: {e.error_code})")
		if e.error_code == "MISSING_API_KEY":
			raise HTTPException(status_code=500, detail="Configuration error: NVIDIA API key not configured")
		elif e.error_code == "AUTHENTICATION_FAILED":
			raise HTTPException(status_code=500, detail="Authentication error: Invalid NVIDIA API key")
		elif e.error_code == "RATE_LIMITED":
			raise HTTPException(status_code=429, detail="Rate limited by NVIDIA API. Please try again later.")
		elif e.error_code == "TIMEOUT":
			raise HTTPException(status_code=408, detail="Embedding request timed out. Please try again.")
		else:
			raise HTTPException(status_code=500, detail=f"Failed to embed query: {e.message}")
	except Exception as e:
		logger.error(f"QnA Stream: unexpected embedding error: {e}")
		raise HTTPException(status_code=500, detail="Failed to embed query due to unexpected error")

	# 2) Pinecone search scoped to user_id
	filter_dict = { "user_id": { "$eq": payload.user_id } }
	
	# Add file filtering if selected_files is provided
	if payload.selected_files:
		filter_dict["file_key"] = { "$in": payload.selected_files }
	
	matches = pinecone_service.search_similar(embedding, top_k=payload.top_k, filter_dict=filter_dict)

	# 3) Assemble context from matches and build references
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

	# 4) Streaming answer from NIM
	async def token_generator():
		try:
			# Emit header first with mode and references
			import json
			header = json.dumps({"mode": "document", "references": references}) + "\n"
			yield header
			# Then emit tokens
			async for token in nim_service.generate_answer_stream(payload.question, context):
				if token:  # Only yield non-empty tokens
					yield token
		except Exception as e:
			logger.error(f"Error in token generator: {e}")
			yield f"Error: Failed to generate response. Please try again.\n"

	return StreamingResponse(
		token_generator(), 
		media_type="text/plain",
		headers={
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"X-Accel-Buffering": "no"  # Disable proxy buffering
		}
	)

@router.post("/ask_direct_stream")
async def ask_question_direct_stream(payload: QueryRequest, current_user: str = Depends(get_verified_user)):
	start = time.time()
	logger.info("Direct QnA Stream: received question for user %s", payload.user_id)
	if payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")

	# Validate question input
	if not payload.question or not payload.question.strip():
		raise HTTPException(status_code=400, detail="Question cannot be empty")

	# Initialize service lazily
	nim_service = get_nim_service()

	async def token_generator():
		try:
			# Emit header first with mode only
			import json
			yield json.dumps({"mode": "general"}) + "\n"
			# Then emit tokens
			async for token in nim_service.generate_general_answer_stream(payload.question.strip()):
				if token:  # Only yield non-empty tokens
					yield token
		except Exception as e:
			logger.error(f"Error in direct token generator: {e}")
			yield f"Error: Failed to generate response. Please try again.\n"

	return StreamingResponse(
		token_generator(), 
		media_type="text/plain",
		headers={
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"X-Accel-Buffering": "no"  # Disable proxy buffering
		}
	)

# Debugging and Health Check Endpoints

@router.post("/debug/embedding", response_model=DebugEmbeddingResponse)
async def debug_embedding(payload: DebugEmbeddingRequest, current_user: str = Depends(get_verified_user)):
	"""
	Debug endpoint to test embedding generation independently
	"""
	if payload.user_id and payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")
	
	if not payload.text or not payload.text.strip():
		raise HTTPException(status_code=400, detail="Text cannot be empty")
	
	nim_service = get_nim_service()
	
	start_time = time.time()
	try:
		embedding = await nim_service.generate_embedding(payload.text.strip())
		processing_time = (time.time() - start_time) * 1000
		
		if not embedding:
			raise HTTPException(status_code=500, detail="Failed to generate embedding")
		
		return DebugEmbeddingResponse(
			embedding=embedding,
			dimension=len(embedding),
			processing_time_ms=round(processing_time, 2)
		)
		
	except EmbeddingError as e:
		logger.error(f"Debug embedding failed: {e.message} (code: {e.error_code})")
		raise HTTPException(status_code=500, detail=f"Embedding failed: {e.message}")
	except Exception as e:
		logger.error(f"Debug embedding unexpected error: {e}")
		raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/debug/search", response_model=DebugSearchResponse)
async def debug_search(payload: DebugSearchRequest, current_user: str = Depends(get_verified_user)):
	"""
	Debug endpoint to test vector search independently
	"""
	if payload.user_id and payload.user_id != current_user:
		raise HTTPException(status_code=403, detail="Not authorized for this user")
	
	if not payload.embedding or not isinstance(payload.embedding, list):
		raise HTTPException(status_code=400, detail="Valid embedding list is required")
	
	pinecone_service = get_pinecone_service()
	
	# Add user filter if user_id is provided
	filter_dict = payload.filter_dict or {}
	if payload.user_id:
		filter_dict["user_id"] = {"$eq": payload.user_id}
	
	start_time = time.time()
	try:
		matches = pinecone_service.search_similar(
			payload.embedding, 
			top_k=payload.top_k, 
			filter_dict=filter_dict
		)
		processing_time = (time.time() - start_time) * 1000
		
		return DebugSearchResponse(
			matches=matches,
			total_matches=len(matches),
			processing_time_ms=round(processing_time, 2)
		)
		
	except Exception as e:
		logger.error(f"Debug search failed: {e}")
		raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
	"""
	Comprehensive health check for all embedding-related services
	"""
	nim_service = get_nim_service()
	pinecone_service = get_pinecone_service()
	
	# Run health checks concurrently
	import asyncio
	
	try:
		nim_health, pinecone_health = await asyncio.gather(
			nim_service.health_check(),
			asyncio.create_task(asyncio.to_thread(pinecone_service.health_check)),
			return_exceptions=True
		)
		
		# Handle exceptions in health checks
		if isinstance(nim_health, Exception):
			nim_health = {
				"service": "nvidia_nim",
				"status": "error",
				"details": {"error": str(nim_health)},
				"timestamp": time.time()
			}
		
		if isinstance(pinecone_health, Exception):
			pinecone_health = {
				"service": "pinecone",
				"status": "error", 
				"details": {"error": str(pinecone_health)},
				"timestamp": time.time()
			}
		
		# Determine overall status
		statuses = [nim_health["status"], pinecone_health["status"]]
		if "error" in statuses:
			overall_status = "error"
		elif "degraded" in statuses:
			overall_status = "degraded"
		else:
			overall_status = "healthy"
		
		return HealthCheckResponse(
			services={
				"nvidia_nim": nim_health,
				"pinecone": pinecone_health
			},
			overall_status=overall_status
		)
		
	except Exception as e:
		logger.error(f"Health check failed: {e}")
		return HealthCheckResponse(
			services={
				"nvidia_nim": {
					"service": "nvidia_nim",
					"status": "error",
					"details": {"error": "Health check failed"},
					"timestamp": time.time()
				},
				"pinecone": {
					"service": "pinecone", 
					"status": "error",
					"details": {"error": "Health check failed"},
					"timestamp": time.time()
				}
			},
			overall_status="error"
		)