import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
import signal
import asyncio
from app.config import settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global shutdown event
shutdown_event = asyncio.Event()

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    shutdown_event.set()

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Security: Validate required environment variables
def validate_environment():
    """Validate that all required environment variables are set"""
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY', 
        'AWS_REGION',
        'AWS_S3_BUCKET_NAME',
        'NVIDIA_NIM_API_KEY',
        'PINECONE_API_KEY',
        'PINECONE_ENVIRONMENT',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ValueError(error_msg)

# Validate environment on startup
try:
    validate_environment()
    logger.info("Environment validation passed")
except ValueError as e:
    logger.error(f"Environment validation failed: {e}")
    # Fail-closed in non-debug
    if os.getenv('DEBUG') != 'True':
        import sys; sys.exit(1)

# Create FastAPI app with lifespan events
async def lifespan(app: FastAPI):
    """Handle app startup and shutdown"""
    logger.info("Application starting up...")
    try:
        # Log Pinecone key settings for quick triage (without secrets)
        from app.config import settings
        logger.info(
            "Pinecone config: region=%s index=%s",
            settings.pinecone_environment,
            settings.pinecone_index_name,
        )
        # Log expected embedding dimension
        try:
            from app.services.nim_service import NIMService
            dim = NIMService().get_embedding_dimension()
            logger.info("Embedding dimension: %d", dim)
        except Exception as e:
            logger.warning("Unable to determine embedding dimension at startup: %s", e)
    except Exception as e:
        logger.warning("Startup logging error: %s", e)
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title="NeuroSpace API",
    description="AI-powered Personal Knowledge Base Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Configure CORS using environment-driven origins
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Backend-Key"],
)

# Import routes
from app.routes import files, processing, query

# Include routers
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(processing.router, prefix="/api/processing", tags=["processing"])
app.include_router(query.router, prefix="/api/query", tags=["query"])

@app.get("/")
async def root():
    return {"message": "NeuroSpace API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Basic health checks
        checks = {
            "api": "healthy",
            "environment": "validated"
        }
        
        # Add more health checks as needed
        # e.g., database connectivity, external service status
        
        return {
            "status": "healthy",
            "checks": checks,
            "timestamp": "2024-01-01T00:00:00Z"  # You might want to use actual timestamp
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}")
    
    # Security: Return generic error in production
    if os.getenv('DEBUG') == 'True':
        return {"error": f"Internal server error: {str(exc)}"}
    else:
        return {"error": "Internal server error"}