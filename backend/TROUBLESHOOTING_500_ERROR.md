# Fixing the 500 Internal Server Error in NeuroSpace Chat

## 🚨 Issue Analysis

The error `POST http://localhost:3000/api/chat/stream 500 (Internal Server Error)` occurs because:

1. **Frontend** (Next.js on port 3000) calls `/api/chat/stream`
2. **Next.js API route** tries to proxy to **Backend** (FastAPI on port 8000)  
3. **Backend is not running** or has configuration issues

## 🔧 Step-by-Step Solutions

### Solution 1: Start the Backend Server

#### Option A: Direct Python Execution
```bash
cd /workspace/backend
python3 main.py
```

#### Option B: Using uvicorn directly
```bash
cd /workspace/backend  
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Option C: Using Docker (if Docker is available)
```bash
cd /workspace/backend
docker build -t neurospace-backend .
docker run -p 8000:8000 --env-file .env neurospace-backend
```

### Solution 2: Environment Configuration

The backend requires these environment variables. Create `/workspace/backend/.env`:

```bash
# AI Services
NVIDIA_NIM_API_KEY=your_nvidia_api_key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=neurospace-embeddings

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Authentication
CLERK_JWKS_URL=your_clerk_jwks_url
CLERK_ISSUER=your_clerk_issuer

# Optional
BACKEND_API_KEY=your_backend_api_key
FRONTEND_ORIGIN=http://localhost:3000
DEBUG=True
```

### Solution 3: Quick Development Setup

For development without all services, you can modify the environment validation:

```bash
cd /workspace/backend
# Edit app/__init__.py line 65 to bypass validation
sed -i 's/if os.getenv.*DEBUG.*!= .*True.*/if False:/' app/__init__.py
```

Or set DEBUG mode:
```bash
export DEBUG=True
```

### Solution 4: Check Backend Health

Once started, verify the backend is working:

```bash
# Test backend health
curl http://localhost:8000/health

# Test query endpoint
curl -X POST http://localhost:8000/api/query/health \
  -H "Content-Type: application/json" \
  -H "X-Backend-Key: your_key"
```

### Solution 5: Frontend Configuration

Ensure the frontend `.env.local` has the correct backend URL:

```bash
# /workspace/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=your_backend_api_key
```

## 🐛 Debugging Steps

### 1. Check if Backend is Running
```bash
# Check if port 8000 is in use
lsof -i :8000
# or
netstat -tlnp | grep 8000
```

### 2. Check Backend Logs
When starting the backend, look for errors like:
- Missing environment variables
- Import errors
- Port binding issues

### 3. Test API Endpoints Manually

```bash
# Test basic connectivity
curl http://localhost:8000/

# Test with authentication (replace with your JWT)
curl -X POST http://localhost:8000/api/query/ask_direct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Backend-Key: YOUR_BACKEND_KEY" \
  -d '{
    "user_id": "test_user", 
    "question": "Hello world"
  }'
```

### 4. Check Frontend Network Tab
1. Open browser DevTools → Network tab
2. Try the chat again
3. Look for:
   - The `/api/chat/stream` request
   - Its response (should show actual error details)
   - Any CORS errors

## 🎯 Most Likely Fixes

### Fix 1: Backend Not Running
**Problem**: Backend server is stopped
**Solution**: Start backend with `python3 main.py` in `/workspace/backend`

### Fix 2: Missing Environment Variables  
**Problem**: Backend crashes due to missing env vars
**Solution**: Create `.env` file with required variables or set `DEBUG=True`

### Fix 3: Port Conflict
**Problem**: Port 8000 is already in use
**Solution**: 
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
# Or use different port
uvicorn app:app --port 8001
# Update NEXT_PUBLIC_BACKEND_URL accordingly
```

### Fix 4: CORS Issues
**Problem**: Frontend can't connect due to CORS
**Solution**: Backend already configured for `http://localhost:3000`, ensure frontend origin matches

### Fix 5: Authentication Issues
**Problem**: Invalid JWT or missing backend API key
**Solution**: Check Clerk configuration and ensure `BACKEND_API_KEY` matches between frontend and backend

## 🔧 Quick Test Script

Save this as `/workspace/backend/test_connection.py`:

```python
#!/usr/bin/env python3
import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    try:
        # Test basic health
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test direct query (no auth needed for testing)
        query_data = {
            "user_id": "test_user",
            "question": "Hello world"
        }
        
        response = requests.post(
            f"{base_url}/api/query/ask_direct",
            json=query_data,
            headers={"X-Backend-Key": "test"}  # Use your actual key
        )
        
        print(f"Query test: {response.status_code}")
        if response.ok:
            print("✅ Backend is working!")
        else:
            print(f"❌ Query failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend - make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_backend()
```

Run with: `python3 test_connection.py`

## 🎉 Expected Result

Once fixed, you should see:
1. Backend logs showing successful startup
2. Frontend chat working without 500 errors  
3. Streaming responses in the chat interface

The most common fix is simply starting the backend server!