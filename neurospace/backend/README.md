# 🧠 NeuroSpace Backend

FastAPI backend for the AI-powered Personal Knowledge Base application.

## 🚀 Features

- **File Processing**: Extract text from PDF, DOCX, and TXT files
- **AI Embeddings**: Generate embeddings using Nvidia NIM API
- **Vector Storage**: Store embeddings in Pinecone vector database
- **Metadata Storage**: Store file metadata in Supabase PostgreSQL
- **Secure File Upload**: AWS S3 integration with signed URLs
- **Text Chunking**: Intelligent text segmentation for better embeddings

## 🛠 Tech Stack

- **FastAPI**: Modern Python web framework
- **Nvidia NIM API**: AI embeddings generation
- **Pinecone**: Vector database for similarity search
- **Supabase**: PostgreSQL database with Row-Level Security
- **AWS S3**: Secure file storage
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX text extraction

## 📋 Prerequisites

- Python 3.8+
- AWS Account with S3 bucket
- Nvidia NIM API access
- Pinecone account
- Supabase account

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the environment file and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name_here

# Nvidia NIM API
NVIDIA_NIM_API_KEY=your_nim_api_key_here
NVIDIA_NIM_BASE_URL=https://api.nvcf.nvidia.com

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=neurospace-embeddings

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Settings
APP_ENV=development
DEBUG=True
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase_schema.sql
```

### 4. Run the Backend

```bash
# Development mode
python main.py

# Or using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 🧪 Testing

Run the integration tests to verify all services are working:

```bash
python test_integration.py
```

This will test:
- ✅ S3 connection and permissions
- ✅ Nvidia NIM API connectivity
- ✅ Pinecone index creation and operations
- ✅ Supabase database connectivity
- ✅ Full file processing pipeline

## 📚 API Endpoints

### File Processing

- `POST /api/processing/process` - Process uploaded file
- `GET /api/processing/status/{job_id}` - Get processing status

### File Management

- `GET /api/files/` - List user files
- `GET /api/files/{file_id}` - Get file details

### Health Check

- `GET /` - API status
- `GET /health` - Health check

## 🔧 Services

### S3Service
Handles file download from AWS S3 using signed URLs.

### TextExtractor
Extracts text from various file formats:
- PDF files using PyPDF2
- DOCX files using python-docx
- TXT files

### NIMService
Generates embeddings using Nvidia NIM API.

### PineconeService
Manages vector storage and similarity search.

### SupabaseService
Handles metadata storage with Row-Level Security.

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py          # FastAPI app configuration
│   ├── models/
│   │   └── file.py          # Pydantic models
│   ├── routes/
│   │   ├── files.py         # File management routes
│   │   └── processing.py    # File processing routes
│   └── services/
│       ├── s3_service.py    # AWS S3 integration
│       ├── text_extractor.py # Text extraction
│       ├── nim_service.py   # Nvidia NIM API
│       ├── pinecone_service.py # Pinecone integration
│       └── supabase_service.py # Supabase integration
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── supabase_schema.sql      # Database schema
└── test_integration.py      # Integration tests
```

## 🔒 Security

- **Row-Level Security**: Supabase RLS ensures users can only access their own data
- **Signed URLs**: S3 uploads use temporary signed URLs (no public bucket access)
- **Environment Variables**: All API keys stored securely in environment variables
- **Input Validation**: Pydantic models validate all API inputs

## 🚀 Deployment

### Railway/Render Deployment

1. Connect your repository to Railway or Render
2. Set environment variables in the deployment platform
3. Deploy the backend

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔍 Troubleshooting

### Common Issues

1. **S3 Access Denied**: Check AWS credentials and bucket permissions
2. **NIM API Errors**: Verify API key and model availability
3. **Pinecone Connection**: Ensure index exists and API key is correct
4. **Supabase RLS**: Check RLS policies and user authentication

### Debug Mode

Enable debug mode in `.env`:

```env
DEBUG=True
```

This will provide detailed error messages and logging.

## 📈 Monitoring

The backend includes health check endpoints for monitoring:

- `GET /health` - Basic health status
- Integration tests can be run periodically to verify service health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.