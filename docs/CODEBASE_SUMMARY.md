# 📁 NeuroSpace Codebase Summary

## 🏗️ **Project Architecture Overview**

```
neurospace/
├── 📁 Frontend (Next.js 14 + TypeScript)
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── api/               # API Routes
│   │   │   ├── dashboard/         # Protected Dashboard Pages
│   │   │   ├── layout.tsx         # Root Layout with Clerk
│   │   │   └── page.tsx           # Landing Page
│   │   └── components/            # Reusable UI Components
│   ├── middleware.ts              # Clerk Authentication
│   └── package.json              # Frontend Dependencies
│
└── 📁 Backend (FastAPI + Python)
    ├── app/
    │   ├── routes/               # API Endpoints
    │   ├── services/             # External Service Integrations
    │   ├── models/               # Pydantic Data Models
    │   └── __init__.py           # FastAPI App Configuration
    ├── requirements.txt          # Python Dependencies
    └── supabase_schema.sql       # Database Schema
```

## 🎯 **Frontend Structure (Next.js)**

### **Root Level Files**

| File             | Purpose                       | Key Features                               |
| ---------------- | ----------------------------- | ------------------------------------------ |
| `middleware.ts`  | **Authentication Middleware** | Clerk auth protection for all routes       |
| `package.json`   | **Dependencies**              | Next.js, TypeScript, Tailwind, Clerk, etc. |
| `tsconfig.json`  | **TypeScript Config**         | Type checking and compilation settings     |
| `next.config.ts` | **Next.js Config**            | Build and deployment settings              |

### **App Router Structure (`src/app/`)**

#### **Landing Page**

| File         | Purpose          | Key Features                                   |
| ------------ | ---------------- | ---------------------------------------------- |
| `page.tsx`   | **Landing Page** | Hero section, auth buttons, feature highlights |
| `layout.tsx` | **Root Layout**  | Clerk provider, global styles, metadata        |

#### **API Routes (`src/app/api/`)**

| File               | Purpose                 | Key Features                              |
| ------------------ | ----------------------- | ----------------------------------------- |
| `upload/route.ts`  | **File Upload API**     | S3 signed URL generation, file validation |
| `process/route.ts` | **File Processing API** | Backend communication, job triggering     |
| `files/route.ts`   | **File Management API** | File listing, metadata retrieval          |

#### **Dashboard Pages (`src/app/dashboard/`)**

| File                 | Purpose              | Key Features                              |
| -------------------- | -------------------- | ----------------------------------------- |
| `layout.tsx`         | **Dashboard Layout** | Sidebar + Navbar wrapper                  |
| `page.tsx`           | **Main Dashboard**   | Overview cards, quick actions, stats      |
| `upload/page.tsx`    | **File Upload UI**   | Drag & drop, progress tracking, file list |
| `documents/page.tsx` | **File Management**  | File table, status indicators, actions    |
| `chat/page.tsx`      | **QnA Interface**    | Chat UI (placeholder for Week 2)          |
| `settings/page.tsx`  | **User Settings**    | Settings page (placeholder)               |

#### **Components (`src/components/`)**

| File          | Purpose                | Key Features                             |
| ------------- | ---------------------- | ---------------------------------------- |
| `Sidebar.tsx` | **Navigation Sidebar** | Menu items, active states, upload button |
| `Navbar.tsx`  | **Top Navigation**     | Search bar, user profile, notifications  |

## 🔧 **Backend Structure (FastAPI)**

### **Root Level Files**

| File                  | Purpose                 | Key Features                           |
| --------------------- | ----------------------- | -------------------------------------- |
| `main.py`             | **Application Entry**   | Uvicorn server startup                 |
| `requirements.txt`    | **Python Dependencies** | FastAPI, AWS, Pinecone, Supabase, etc. |
| `supabase_schema.sql` | **Database Schema**     | Tables, RLS policies, indexes          |
| `test_integration.py` | **Integration Tests**   | Service connectivity testing           |

### **App Structure (`app/`)**

#### **Main App (`app/__init__.py`)**

| File          | Purpose         | Key Features                             |
| ------------- | --------------- | ---------------------------------------- |
| `__init__.py` | **FastAPI App** | CORS, routes, middleware, env validation |

#### **API Routes (`app/routes/`)**

| File            | Purpose             | Key Features                         |
| --------------- | ------------------- | ------------------------------------ |
| `processing.py` | **File Processing** | Text extraction, embeddings, storage |
| `files.py`      | **File Management** | CRUD operations (placeholder)        |

#### **Services (`app/services/`)**

| File                  | Purpose                 | Key Features                         |
| --------------------- | ----------------------- | ------------------------------------ |
| `s3_service.py`       | **AWS S3 Integration**  | File download, metadata retrieval    |
| `text_extractor.py`   | **Text Processing**     | PDF/DOCX/TXT extraction, chunking    |
| `nim_service.py`      | **Nvidia NIM API**      | Embedding generation                 |
| `pinecone_service.py` | **Vector Database**     | Embedding storage, similarity search |
| `supabase_service.py` | **Database Operations** | File metadata, user data, RLS        |

#### **Data Models (`app/models/`)**

| File      | Purpose             | Key Features                         |
| --------- | ------------------- | ------------------------------------ |
| `file.py` | **Pydantic Models** | Request/response schemas, validation |

## 🔄 **Data Flow & Integration**

### **File Upload Flow**

```
1. User Upload → Frontend (upload/page.tsx)
2. File Validation → API (upload/route.ts)
3. S3 Signed URL → AWS S3
4. Processing Trigger → API (process/route.ts)
5. Backend Processing → FastAPI (processing.py)
6. Text Extraction → text_extractor.py
7. Embedding Generation → nim_service.py
8. Vector Storage → pinecone_service.py
9. Metadata Storage → supabase_service.py
```

### **Service Dependencies**

```
Frontend (Next.js)
├── Clerk (Authentication)
├── AWS S3 (File Storage)
└── FastAPI Backend

Backend (FastAPI)
├── AWS S3 (File Download)
├── Nvidia NIM (AI Embeddings)
├── Pinecone (Vector Database)
└── Supabase (Metadata Storage)
```

## 🛡️ **Security Implementation**

### **Authentication & Authorization**

- **Clerk**: JWT-based authentication
- **Middleware**: Route protection
- **RLS**: Row-Level Security in Supabase

### **Input Validation**

- **File Extensions**: Whitelist validation
- **File Size**: 10MB limit enforcement
- **File Paths**: Path traversal prevention
- **Content Types**: MIME type validation

### **Error Handling**

- **Generic Errors**: Production-safe messages
- **Input Sanitization**: XSS prevention
- **Memory Management**: Proper cleanup

## 📊 **Key Features by File**

### **Frontend Features**

- **Landing Page**: Modern hero section, auth flow
- **Dashboard**: Overview cards, navigation
- **File Upload**: Drag & drop, progress tracking
- **File Management**: Table view, status indicators
- **Responsive Design**: Mobile-first approach

### **Backend Features**

- **File Processing**: Multi-format text extraction
- **AI Integration**: Nvidia NIM embeddings
- **Vector Search**: Pinecone similarity search
- **Data Persistence**: Supabase PostgreSQL
- **Security**: Comprehensive validation

## 🔧 **Modification Guide**

### **Adding New Features**

#### **Frontend Modifications**

1. **New Page**: Add to `src/app/dashboard/`
2. **New API**: Add to `src/app/api/`
3. **New Component**: Add to `src/components/`
4. **Navigation**: Update `Sidebar.tsx`

#### **Backend Modifications**

1. **New Route**: Add to `app/routes/`
2. **New Service**: Add to `app/services/`
3. **New Model**: Add to `app/models/`
4. **Database**: Update `supabase_schema.sql`

### **Common Modification Points**

#### **File Upload**

- **Frontend**: `src/app/dashboard/upload/page.tsx`
- **API**: `src/app/api/upload/route.ts`
- **Backend**: `backend/app/routes/processing.py`

#### **File Management**

- **Frontend**: `src/app/dashboard/documents/page.tsx`
- **API**: `src/app/api/files/route.ts`
- **Backend**: `backend/app/services/supabase_service.py`

#### **Authentication**

- **Middleware**: `middleware.ts`
- **Layout**: `src/app/layout.tsx`
- **Components**: `src/components/Navbar.tsx`

#### **AI Processing**

- **Backend**: `backend/app/services/nim_service.py`
- **Vector Storage**: `backend/app/services/pinecone_service.py`
- **Text Processing**: `backend/app/services/text_extractor.py`

## 🚀 **Deployment Structure**

### **Frontend (Vercel)**

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment**: `.env.local`

### **Backend (Railway/Render)**

- **Runtime**: Python 3.9+
- **Start Command**: `python main.py`
- **Environment**: `backend/.env`

### **Database (Supabase)**

- **Schema**: `backend/supabase_schema.sql`
- **RLS**: Row-Level Security enabled
- **Backups**: Automatic daily backups

## 📋 **Development Workflow**

### **Local Development**

1. **Frontend**: `npm run dev` (port 3000)
2. **Backend**: `python main.py` (port 8000)
3. **Database**: Supabase local or cloud

### **Testing**

1. **Integration**: `python test_integration.py`
2. **Security**: Review `SECURITY_AUDIT_REPORT.md`
3. **Manual**: Test upload → process → search flow

### **Deployment**

1. **Environment**: Set all required variables
2. **Database**: Run schema migrations
3. **Services**: Deploy frontend and backend
4. **Monitoring**: Check health endpoints

This structure provides a clear separation of concerns, making it easy to modify specific features without affecting others. Each file has a single responsibility and clear integration points.
