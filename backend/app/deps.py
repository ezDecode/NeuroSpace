from fastapi import Header, HTTPException, Request
import os
import time
import requests
from typing import Optional, Dict, Any
from jose import jwt, jwk
from jose.utils import base64url_decode


def require_backend_key(x_backend_key: str = Header(None)):
	expected = os.getenv("BACKEND_API_KEY")
	if not expected:
		return  # If not set, skip (development)
	if not x_backend_key or x_backend_key != expected:
		raise HTTPException(status_code=401, detail="Unauthorized")
	return True

_JWKS_CACHE: Dict[str, Any] = {"keys": None, "fetched_at": 0}

def _get_jwks_url() -> Optional[str]:
    jwks_url = os.getenv("CLERK_JWKS_URL")
    if jwks_url:
        return jwks_url
    issuer = os.getenv("CLERK_ISSUER")
    if issuer:
        return issuer.rstrip("/") + "/.well-known/jwks.json"
    return None

def _fetch_jwks() -> Dict[str, Any]:
    url = _get_jwks_url()
    if not url:
        raise HTTPException(status_code=500, detail="JWT verification not configured (missing CLERK_JWKS_URL or CLERK_ISSUER)")
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch JWKS for JWT verification")

def _get_jwks_cached() -> Dict[str, Any]:
    now = int(time.time())
    if not _JWKS_CACHE["keys"] or now - _JWKS_CACHE["fetched_at"] > 600:
        jwks = _fetch_jwks()
        _JWKS_CACHE["keys"] = jwks.get("keys", [])
        _JWKS_CACHE["fetched_at"] = now
    return {"keys": _JWKS_CACHE["keys"]}

def _decode_jwt(token: str) -> Dict[str, Any]:
    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token header")

        jwks = _get_jwks_cached()["keys"]
        matching = next((k for k in jwks if k.get("kid") == kid), None)
        if not matching:
            # Refresh once and retry (key rotation)
            _JWKS_CACHE["keys"] = None
            jwks = _get_jwks_cached()["keys"]
            matching = next((k for k in jwks if k.get("kid") == kid), None)
            if not matching:
                raise HTTPException(status_code=401, detail="Signing key not found")

        public_key = jwk.construct(matching)
        message, encoded_sig = str(token).rsplit('.', 1)
        decoded_sig = base64url_decode(encoded_sig.encode('utf-8'))
        if not public_key.verify(message.encode('utf-8'), decoded_sig):
            raise HTTPException(status_code=401, detail="Invalid token signature")

        options = {"verify_aud": False}
        issuer = os.getenv("CLERK_ISSUER")
        if issuer:
            claims = jwt.decode(token, public_key.to_pem().decode('utf-8'), algorithms=["RS256"], issuer=issuer, options=options)
        else:
            claims = jwt.decode(token, public_key.to_pem().decode('utf-8'), algorithms=["RS256"], options=options)
        return claims
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_verified_user(authorization: str = Header(None)) -> str:
    """
    Verify Authorization: Bearer <JWT> via Clerk JWKS and return user ID (sub).
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split(" ", 1)[1].strip()
    claims = _decode_jwt(token)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User claim missing in token")
    return user_id