# 🧠 NeuroSpace - AI-Powered Personal Knowledge Base

A modern AI-powered "Second Brain" application where users can upload documents, store them securely, and ask natural language queries using cutting-edge AI technology.

## 🚀 Current Status: Week 1 Complete ✅

### ✅ **Completed Features**

- **Authentication**: Clerk integration with route protection
- **File Upload**: Drag & drop with S3 signed URLs
- **Text Processing**: Multi-format extraction (PDF, DOCX, TXT)
- **AI Integration**: Nvidia NIM embeddings generation
- **Vector Storage**: Pinecone similarity search
- **Database**: Supabase with Row-Level Security
- **Security**: Comprehensive validation and error handling

### 🎯 **Week 2 Roadmap**

- [ ] Chat UI implementation
- [ ] Query processing pipeline
- [ ] AI answer generation
- [ ] Advanced file management
- [ ] Final polish and deployment

## 🏗️ **Architecture Overview**

```
Frontend (Next.js) ←→ Backend (FastAPI) ←→ External Services
     │                      │                    │
     ├─ Clerk Auth         ├─ Text Extraction   ├─ AWS S3 (Files)
     ├─ File Upload        ├─ Embedding Gen     ├─ Nvidia NIM (AI)
     ├─ Dashboard UI       ├─ Vector Storage    ├─ Pinecone (Vectors)
     └─ File Management    └─ Metadata Storage  └─ Supabase (DB)
```

## 🛠 **Tech Stack**

### **Frontend**

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** (Authentication)
- **Heroicons** (Icons)
- **React Dropzone** (File upload)

### **Backend**

- **FastAPI** (Python)
- **PyPDF2** (PDF extraction)
- **python-docx** (DOCX extraction)
- **Nvidia NIM API** (AI embeddings)
- **Pinecone** (Vector database)
- **Supabase** (PostgreSQL)

### **Infrastructure**

- **AWS S3** (File storage)
- **Vercel** (Frontend deployment)
- **Railway/Render** (Backend deployment)

## 📁 **Codebase Structure**

### **Frontend Structure**

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── upload/route.ts     # File upload API
│   │   ├── process/route.ts    # File processing API
│   │   └── files/route.ts      # File management API
│   ├── dashboard/              # Protected Dashboard
│   │   ├── upload/page.tsx     # File upload UI
│   │   ├── documents/page.tsx  # File management
│   │   ├── chat/page.tsx       # QnA interface
│   │   └── settings/page.tsx   # User settings
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
└── components/
    ├── Sidebar.tsx             # Navigation sidebar
    └── Navbar.tsx              # Top navigation
```

### **Backend Structure**

```
backend/
├── app/
│   ├── routes/
│   │   ├── processing.py       # File processing endpoints
│   │   └── files.py           # File management endpoints
│   ├── services/
│   │   ├── s3_service.py      # AWS S3 integration
│   │   ├── text_extractor.py  # Text extraction
│   │   ├── nim_service.py     # Nvidia NIM API
│   │   ├── pinecone_service.py # Vector database
│   │   └── supabase_service.py # Database operations
│   ├── models/
│   │   └── file.py            # Pydantic models
│   └── __init__.py            # FastAPI app
├── requirements.txt           # Python dependencies
├── supabase_schema.sql        # Database schema
└── test_integration.py        # Integration tests
```

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- Python 3.9+
- AWS Account
- Nvidia NIM API access
- Pinecone account
- Supabase account
- Clerk account

### **1. Clone & Install**

```bash
git clone <repository-url>
cd neurospace

# Frontend setup
npm install

# Backend setup
cd backend
pip install -r requirements.txt
```

### **2. Environment Setup**

```bash
# Frontend (.env.local)
cp .env.local.example .env.local

# Backend (backend/.env)
cp backend/.env.example backend/.env
```

**Required Environment Variables:**

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket

# Nvidia NIM API
NVIDIA_NIM_API_KEY=your_nim_key
NVIDIA_NIM_BASE_URL=https://api.nvcf.nvidia.com

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=neurospace-embeddings

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### **3. Database Setup**

```sql
-- Run in Supabase SQL Editor
-- Copy contents of backend/supabase_schema.sql
```

### **4. Start Development**

```bash
# Frontend (Terminal 1)
npm run dev
# http://localhost:3000

# Backend (Terminal 2)
cd backend
python main.py
# http://localhost:8000
```

## 🔄 **Data Flow**

### **File Upload & Processing**

1. **User Upload** → Drag & drop files
2. **Validation** → File type, size, extension
3. **S3 Upload** → Secure signed URL upload
4. **Processing** → Text extraction & chunking
5. **AI Embeddings** → Nvidia NIM generation
6. **Vector Storage** → Pinecone similarity search
7. **Metadata** → Supabase PostgreSQL storage

### **Security Flow**

1. **Authentication** → Clerk JWT validation
2. **Authorization** → Route protection middleware
3. **Input Validation** → File type, size, path validation
4. **Data Isolation** → Row-Level Security (RLS)
5. **Error Handling** → Generic production messages

## 🔧 **Development Guide**

### **Adding New Features**

#### **Frontend Modifications**

```bash
# New page
src/app/dashboard/new-feature/page.tsx

# New API route
src/app/api/new-feature/route.ts

# New component
src/components/NewComponent.tsx

# Update navigation
src/components/Sidebar.tsx
```

#### **Backend Modifications**

```bash
# New route
backend/app/routes/new_feature.py

# New service
backend/app/services/new_service.py

# New model
backend/app/models/new_model.py

# Update database
backend/supabase_schema.sql
```

### **Common Modification Points**

| Feature             | Frontend             | API               | Backend               |
| ------------------- | -------------------- | ----------------- | --------------------- |
| **File Upload**     | `upload/page.tsx`    | `upload/route.ts` | `processing.py`       |
| **File Management** | `documents/page.tsx` | `files/route.ts`  | `supabase_service.py` |
| **Authentication**  | `middleware.ts`      | -                 | -                     |
| **AI Processing**   | -                    | -                 | `nim_service.py`      |
| **Vector Search**   | -                    | -                 | `pinecone_service.py` |

## 🧪 **Testing**

### **Integration Testing**

```bash
cd backend
python test_integration.py
```

### **Security Testing**

- Review `SECURITY_AUDIT_REPORT.md`
- Test file upload security
- Validate input sanitization
- Check authentication flow

### **Manual Testing**

1. **Upload Flow**: Test file upload → processing → storage
2. **Authentication**: Test login/logout and route protection
3. **Error Handling**: Test with invalid files and network errors
4. **Responsive Design**: Test on mobile and desktop

## 🚀 **Deployment**

### **Frontend (Vercel)**

```bash
# Build
npm run build

# Deploy
vercel --prod
```

### **Backend (Railway/Render)**

```bash
# Requirements
backend/requirements.txt

# Start command
python main.py

# Environment variables
backend/.env
```

### **Database (Supabase)**

- Run schema migrations
- Enable Row-Level Security
- Configure backups

## 🔒 **Security Features**

### **Authentication & Authorization**

- ✅ Clerk JWT authentication
- ✅ Route protection middleware
- ✅ Row-Level Security (RLS)
- ✅ User data isolation

### **Input Validation**

- ✅ File extension whitelisting
- ✅ File size limits (10MB)
- ✅ Path traversal prevention
- ✅ MIME type validation
- ✅ Input sanitization

### **Error Handling**

- ✅ Generic production error messages
- ✅ Comprehensive logging
- ✅ Memory leak prevention
- ✅ Error isolation

## 📊 **Performance & Monitoring**

### **Health Checks**

```bash
# Frontend
http://localhost:3000

# Backend
http://localhost:8000/health
```

### **Monitoring Points**

- File upload success rates
- Processing job completion
- API response times
- Error rates and types
- User authentication events

## 🤝 **Contributing**

### **Development Workflow**

1. Fork the repository
2. Create feature branch
3. Make changes following the structure
4. Test thoroughly
5. Submit pull request

### **Code Standards**

- **Frontend**: TypeScript, ESLint, Prettier
- **Backend**: Python, Black, Flake8
- **Security**: Follow security audit guidelines
- **Documentation**: Update relevant docs

## 📚 **Documentation**

### **Key Documents**

- `CODEBASE_SUMMARY.md` - Detailed file structure
- `SECURITY_AUDIT_REPORT.md` - Security analysis
- `WEEK1_COMPLETE.md` - Development progress
- `backend/README.md` - Backend-specific guide

### **API Documentation**

- **Frontend API**: Next.js API routes
- **Backend API**: FastAPI auto-generated docs
- **Database**: Supabase schema and policies

## 🆘 **Support & Troubleshooting**

### **Common Issues**

1. **Environment Variables**: Ensure all required vars are set
2. **Database Connection**: Check Supabase credentials
3. **File Upload**: Verify S3 bucket permissions
4. **AI Processing**: Validate NIM API access

### **Debug Mode**

```bash
# Frontend
NODE_ENV=development

# Backend
DEBUG=True
```

### **Logs**

- **Frontend**: Browser console
- **Backend**: Application logs
- **Database**: Supabase logs

## 📄 **License**

This project is licensed under the MIT License.

## 🏆 **Project Status**

**Week 1**: ✅ **Complete** - Foundation with file upload, processing, and storage
**Week 2**: 🚧 **In Progress** - QnA chat interface and advanced features

**Ready for production deployment with comprehensive security measures! 🚀**
