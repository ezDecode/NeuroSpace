from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
	# AWS
	aws_access_key_id: str = Field(..., env="AWS_ACCESS_KEY_ID")
	aws_secret_access_key: str = Field(..., env="AWS_SECRET_ACCESS_KEY")
	aws_region: str = Field(..., env="AWS_REGION")
	aws_s3_bucket_name: str = Field(..., env="AWS_S3_BUCKET_NAME")

	# Nvidia NIM
	nvidia_nim_api_key: str = Field(..., env="NVIDIA_NIM_API_KEY")
	nvidia_nim_base_url: str = Field("https://integrate.api.nvidia.com/v1", env="NVIDIA_NIM_BASE_URL")

	# Pinecone
	pinecone_api_key: str = Field(..., env="PINECONE_API_KEY")
	pinecone_environment: str = Field(..., env="PINECONE_ENVIRONMENT")
	pinecone_index_name: str = Field("neurospace-embeddings", env="PINECONE_INDEX_NAME")

	# Supabase
	supabase_url: str = Field(..., env="SUPABASE_URL")
	supabase_service_role_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")

	# Clerk Authentication
	clerk_jwks_url: str = Field(..., env="CLERK_JWKS_URL")
	clerk_issuer: str = Field(..., env="CLERK_ISSUER")

	# Backend API Key for internal service authentication
	backend_api_key: Optional[str] = Field(None, env="BACKEND_API_KEY")

	# App
	app_env: str = Field("development", env="APP_ENV")
	debug: bool = Field(True, env="DEBUG")
	frontend_origin: str = Field("http://localhost:3000", env="FRONTEND_ORIGIN")

	model_config = {
		"env_file": ".env",
		"extra": "ignore"  # Allow extra environment variables
	}

settings = Settings()