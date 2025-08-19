from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="NeuroSpace API",
    description="AI-powered Personal Knowledge Base Backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import files, processing

# Include routers
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(processing.router, prefix="/api/processing", tags=["processing"])

@app.get("/")
async def root():
    return {"message": "NeuroSpace API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}