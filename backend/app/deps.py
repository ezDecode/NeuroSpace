from fastapi import Header, HTTPException, Request
import os

def require_backend_key(x_backend_key: str = Header(None)):
	expected = os.getenv("BACKEND_API_KEY")
	if not expected:
		return  # If not set, skip (development)
	if not x_backend_key or x_backend_key != expected:
		raise HTTPException(status_code=401, detail="Unauthorized")
	return True

async def get_current_user(request: Request):
    """
    Extract user ID from the X-User-ID header sent by the frontend
    """
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID header missing")
    return user_id