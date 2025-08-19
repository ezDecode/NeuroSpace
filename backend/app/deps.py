from fastapi import Header, HTTPException
import os

def require_backend_key(x_backend_key: str = Header(None)):
	expected = os.getenv("BACKEND_API_KEY")
	if not expected:
		return  # If not set, skip (development)
	if not x_backend_key or x_backend_key != expected:
		raise HTTPException(status_code=401, detail="Unauthorized")
	return True