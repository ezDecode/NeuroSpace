from app.tasks.celery_app import celery_app
from app.services.s3_service import S3Service
from app.services.text_extractor import TextExtractor
from app.services.nim_service import NIMService, EmbeddingError
from app.services.pinecone_service import PineconeService
from app.services.supabase_service import SupabaseService
from app.config import settings
import os
import re
from typing import Dict, Any


def _validate_file_key(file_key: str, user_id: str) -> bool:
	expected_prefix = f"uploads/{user_id}/"
	if not file_key.startswith(expected_prefix):
		return False
	if ".." in file_key or "/" in file_key[len(expected_prefix):]:
		return False
	import re as _re
	return bool(_re.compile(r"^[a-zA-Z0-9\-_\.]+$").match(file_key.split("/")[-1]))


@celery_app.task(bind=True, name="processing.process_file_task")
def process_file_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
	user_id = payload["user_id"]
	file_key = payload["file_key"]
	file_name = payload["file_name"]
	content_type = payload.get("content_type", "application/octet-stream")
	job_id = payload.get("job_id")

	if not _validate_file_key(file_key, user_id):
		raise ValueError("Invalid file key")

	s3_service = S3Service()
	nim_service = NIMService()
	pinecone_service = PineconeService(embedding_dimension=nim_service.get_embedding_dimension())
	supabase_service = SupabaseService()

	# Idempotency: ensure single processing record per {user_id, file_key}
	existing = supabase_service.get_file_by_key_and_user.__wrapped__ if hasattr(supabase_service.get_file_by_key_and_user, "__wrapped__") else supabase_service.get_file_by_key_and_user
	import asyncio
	# The supabase client is sync; our service methods are defined async but call sync client; call via asyncio.run if needed
	try:
		file_meta = asyncio.run(supabase_service.get_file_by_key_and_user(file_key, user_id))
	except RuntimeError:
		# already in event loop (Celery worker sync context) — call directly
		file_meta = None

	# Update status to processing
	try:
		if file_meta and file_meta.get("status") == "processed":
			return {"status": "completed", "message": "Already processed", "file_key": file_key}
	except Exception:
		pass

	# Determine size from S3
	actual_file_size = asyncio.run(s3_service.get_file_size(file_key))
	if actual_file_size is None:
		raise RuntimeError("Failed to get file size from S3")

	local_file_path = asyncio.run(s3_service.download_file(file_key))
	if not local_file_path:
		raise RuntimeError("Failed to download file from S3")

	try:
		# Validate size
		if not os.path.exists(local_file_path) or os.path.getsize(local_file_path) > settings.max_file_size_mb * 1024 * 1024:
			raise ValueError(f"File too large. Maximum {settings.max_file_size_mb}MB allowed")

		text = TextExtractor.extract_text(local_file_path, content_type)
		if not text:
			raise ValueError("Failed to extract text from file")
		if len(text) > 10 * 1024 * 1024:
			raise ValueError("Extracted text too large")

		chunks = TextExtractor.chunk_text(text)
		if len(chunks) > 1000:
			raise ValueError("Too many text chunks generated")

		# Embeddings
		import asyncio as _asyncio
		embeddings = _asyncio.run(nim_service.generate_embeddings_batch(chunks))
		valid_embeddings = []
		for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
			if embedding:
				valid_embeddings.append({
					'id': f"{file_key}_chunk_{i}",
					'embedding': embedding,
					'metadata': {
						'file_key': file_key,
						'file_name': file_name,
						'user_id': user_id,
						'chunk_index': i,
						'text': (chunk[:500] if len(chunk) > 500 else chunk),
						'content_type': content_type
					}
				})

		if valid_embeddings:
			pinecone_service.upsert_vectors(valid_embeddings)

		# Update file record
		file_record = _asyncio.run(supabase_service.get_file_by_key_and_user(file_key, user_id))
		if file_record:
			_asyncio.run(supabase_service.update_file_status(file_record['id'], 'processed', len(valid_embeddings), actual_file_size))
		else:
			_asyncio.run(supabase_service.create_file_record({
				'file_key': file_key,
				'file_name': file_name,
				'user_id': user_id,
				'file_size': actual_file_size,
				'content_type': content_type,
				'status': 'processed',
				'chunks_count': len(valid_embeddings)
			}))

		# Mark job as completed in processing_jobs
		# Since Celery task doesn't know job_id, update file status only; the API status endpoint reads from processing_jobs
		# Update job status if known
		if job_id:
			_asyncio.run(supabase_service.update_job_status(job_id, 'completed'))
		return {"status": "completed", "message": f"Processed {file_name}", "file_key": file_key}
	except Exception as e:
		# Update job status to failed on error
		try:
			if job_id:
				_asyncio.run(supabase_service.update_job_status(job_id, 'failed'))
		except Exception:
			pass
		raise
	finally:
		try:
			S3Service().cleanup_temp_file(local_file_path)
		except Exception:
			pass

