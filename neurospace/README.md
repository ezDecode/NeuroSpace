# 🧠 NeuroSpace - AI-Powered Personal Knowledge Base

A modern AI-powered "Second Brain" application where users can upload documents, store them securely, and ask natural language queries using cutting-edge AI technology.

## 🚀 Current Status: Week 1 - Day 1-2 Complete

### ✅ Completed Features
- **Day 1**: Next.js + Tailwind + Clerk authentication setup
- **Day 2**: Dashboard UI with sidebar, navbar, and welcome screen
- Modern landing page with authentication
- Responsive dashboard layout
- File upload interface (UI ready)
- Navigation structure

### 🎯 Week 1 Remaining Tasks
- **Day 3**: File upload system with AWS S3 integration
- **Day 4**: FastAPI backend setup
- **Day 5**: Nvidia NIM API + Pinecone integration
- **Day 6**: Supabase database setup
- **Day 7**: End-to-end integration testing

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** (Authentication)
- **Heroicons** (Icons)
- **React Dropzone** (File upload)

### Backend (Coming Soon)
- **FastAPI** (Python)
- **Nvidia NIM API** (AI embeddings)
- **Pinecone** (Vector database)
- **Supabase** (PostgreSQL)
- **AWS S3** (File storage)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Clerk account (for authentication)
- AWS account (for S3)
- Nvidia NIM API access
- Pinecone account
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neurospace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your API keys in `.env.local`:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   
   # Nvidia NIM API
   NVIDIA_NIM_API_KEY=your_nim_api_key
   NVIDIA_NIM_BASE_URL=https://api.nvcf.nvidia.com
   
   # Pinecone
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=neurospace-embeddings
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Backend API
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
neurospace/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── chat/
│   │   │   ├── documents/
│   │   │   ├── settings/
│   │   │   ├── upload/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── public/
├── .env.local
├── middleware.ts
└── package.json
```

## 🔒 Security Features

- **Clerk Authentication**: All routes protected with user authentication
- **Environment Variables**: All API keys stored securely in `.env.local`
- **Signed S3 URLs**: File uploads via secure signed URLs (no public bucket access)
- **Row-Level Security**: Supabase RLS for user data isolation

## 🎨 UI Components

The application uses modern UI components and follows best practices:
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Icons**: Heroicons for consistent iconography
- **Gradient Design**: Purple to pink gradients for brand consistency
- **Interactive Elements**: Hover states and smooth transitions

## 📋 Development Roadmap

### Week 1 (Current Sprint)
- [x] Day 1: Next.js + Tailwind + Clerk setup
- [x] Day 2: Dashboard UI components
- [ ] Day 3: File upload + AWS S3 integration
- [ ] Day 4: FastAPI backend setup
- [ ] Day 5: Nvidia NIM + Pinecone integration
- [ ] Day 6: Supabase database setup
- [ ] Day 7: End-to-end integration testing

### Week 2 (Next Sprint)
- [ ] Day 8: Chat UI implementation
- [ ] Day 9: Query processing pipeline
- [ ] Day 10: AI answer generation
- [ ] Day 11: Chat interface with references
- [ ] Day 12: File management features
- [ ] Day 13: Security hardening
- [ ] Day 14: Deployment and polish

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the PRD for detailed specifications

---

**Built with ❤️ using Next.js, TypeScript, and modern AI technologies**
