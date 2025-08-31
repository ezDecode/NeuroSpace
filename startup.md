# 🚀 NeuroSpace Startup Guide

## Quick Start

### 1. Environment Setup

#### Frontend (.env.local)
```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your actual values
# You'll need:
# - Clerk authentication keys
# - AWS S3 credentials
# - Nvidia NIM API key
# - Pinecone credentials
# - Supabase credentials
```

#### Backend (backend/.env)
```bash
# Copy the example environment file
cd backend
cp env.example .env

# Edit .env with your actual values
# Same credentials as frontend, plus backend-specific keys
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start Development Servers

#### Terminal 1 - Frontend
```bash
npm run dev
# http://localhost:3000
```

#### Terminal 2 - Backend
```bash
cd backend
python main.py
# http://localhost:8000
```

### 4. Verify Setup

- Frontend: http://localhost:3000
- Backend Health: http://localhost:8000/health
- Backend API Docs: http://localhost:8000/docs

## Required Services

### 1. Clerk Authentication
- Sign up at [clerk.com](https://clerk.com)
- Create a new application
- Get your publishable and secret keys

### 2. AWS S3
- Create an S3 bucket
- Create an IAM user with S3 access
- Get access key and secret

### 3. Nvidia NIM
- Sign up for Nvidia AI Foundation
- Get your API key
- Note the base URL (usually https://api.nvcf.nvidia.com)

### 4. Pinecone
- Create account at [pinecone.io](https://pinecone.io)
- Create a new index (dimension: 1024)
- Get your API key and environment

### 5. Supabase
- Create project at [supabase.com](https://supabase.com)
- Get your project URL and keys
- Run the schema from `backend/supabase_schema.sql`

## Common Issues

### Pinecone Dimension Mismatch
- Delete and recreate the index with dimension 1024
- Check backend logs for expected dimension

### Backend Connection Issues
- Verify all environment variables are set
- Check that backend is running on port 8000
- Ensure CORS is properly configured

### File Upload Issues
- Verify S3 bucket permissions
- Check file size limits (50MB)
- Ensure supported file types

## Next Steps

1. Upload some test documents (PDF, DOC, TXT)
2. Start a chat conversation
3. Explore the studio features
4. Customize the design system

## Support

- Check the main README.md for detailed documentation
- Review the architecture docs in the `docs/` folder
- Check backend logs for detailed error information
