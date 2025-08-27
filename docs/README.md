# NeuroSpace – End-to-End Application Workflow Guide

This document explains how NeuroSpace works across the frontend and backend with a detailed, system-level walkthrough of data flow, auth, storage, AI, and UX. Use it to understand, debug, and simplify the app.

## Overview

- Frontend: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + Framer Motion
- Backend: FastAPI (Python) + services (S3, Supabase, Pinecone, NVIDIA NIM)
- Auth: Clerk (JWT)
- Storage: AWS S3 (files), Supabase Postgres (metadata), Pinecone (vectors)
- AI: NVIDIA NIM embeddings and chat completions

High-level architecture:

Frontend (Next.js) ⇄ Backend (FastAPI) ⇄ External Services
- Clerk Auth (JWT)               - Text Extraction         - AWS S3 (Files)
- Upload UI & Dashboard          - Embeddings (NIM)        - NVIDIA NIM (AI)
- Chat UI (streaming)            - Vector Search (Pinecone) - Pinecone (Vectors)
- Next.js API routes             - Metadata (Supabase)      - Supabase (DB)


## Authentication & Route Protection

- Clerk manages sign-in/up and issues JWTs.
- Middleware (`src/middleware.ts`) protects all non-public routes; dashboard and API under `/api/*` are protected by default.
- Frontend API routes forward the user’s JWT to the backend in `Authorization: Bearer <token>`.
- Backend validates requests via dependencies (`get_verified_user`, `require_backend_key`) ensuring:
  - Authenticated user identity
  - Optional shared backend key (`X-Backend-Key`) for service-to-service hardening


## File Upload & Processing Workflow

User Flow from the UI (`/dashboard/upload`):

1) Select Files (Drag & Drop)
- Allowed types: PDF, DOC, DOCX, TXT, MD, RTF
- Client-side validation (type/size, 50MB limit in UI)

2) Request Signed S3 URL (`POST /api/upload` – Next.js API)
- Validates filename, extension, mime-type, and size
- Constructs secure S3 key: `uploads/{userId}/{uuid}.{ext}`
- Returns a pre-signed PUT URL and the `fileKey`

3) Direct Upload to S3 (from the browser)
- The file is PUT directly to S3 using the signed URL
- Frontend shows progress and errors gracefully

4) Create/Update File Record (`POST /api/files` – Next.js API → FastAPI)
- Supabase stores metadata: `file_key`, `file_name`, `user_id`, `file_size`, `content_type`, `status`
- Typically created as `pending` or immediately updated to `processing`

5) Trigger Processing (`POST /api/process` – Next.js API → FastAPI `/api/processing/process`)
- Body includes fileKey, name, size, type, and userId (derived from Clerk)
- Backend pipeline runs asynchronously (single-request flow, but structured for batching/queues later)

Backend Pipeline (`backend/app/routes/processing.py`):

A) Validate & Download
- Verify `file_key` belongs to requesting `user_id` and is traversal-safe
- Fetch actual size from S3, download to temp file

B) Extract Text (`TextExtractor`)
- PDF (PyPDF2), DOCX (python-docx), TXT/MD (plain), DOC (conversion)
- Enforce max text size and chunk limits (anti-resource-exhaustion)

C) Chunking
- Split text into manageable chunks (e.g., ~1k chars)
- Cap number of chunks (e.g., 1000) for safety

D) Embeddings (`NIMService`)
- NVIDIA `nv-embedqa-e5-v5` via direct HTTP to NIM API
- 1024-dim vectors, batched with retries/backoff

E) Vector Upsert (`PineconeService`)
- Upsert chunk vectors with metadata: `file_key`, `file_name`, `user_id`, `chunk_index`, `text`, `content_type`
- Namespace effectively scoped by user via filter queries (see Query section)

F) DB Update (`SupabaseService`)
- Update file status to `processed`, store `chunks_count`, `file_size`
- If initial record missing, create as fallback

G) Cleanup
- Remove temp files


## Chat & Retrieval-Augmented Generation (RAG)

Frontend (`/dashboard/chat` + `useChat` hook):

- Users can select specific files to constrain search.
- Messages are streamed to UI; first line is a header JSON with mode and (for RAG) references.
- Markdown rendering with copy, citations shown as “Sources”.

Entry point: `POST /api/chat/stream` (Next.js API)
- Validates Clerk user and fetches JWT
- Detects mode:
  - If user selected files OR user has any documents → “document” (RAG)
  - Else → “general”
- Proxies streaming requests to FastAPI with timeouts and retry for 429/5xx
- Passes through backend’s stream directly to the client

Backend Query (`backend/app/routes/query.py`):

RAG Mode (`/api/query/ask_stream`)
1) Embed the question (NIMService → 1024-dim vector)
2) Pinecone similarity search (filter by `user_id` and optional `file_key in selected_files`)
3) Assemble context from top-K chunks with `[Source: file_name]` headers
4) Stream answer tokens from NVIDIA chat model
5) Stream header line: `{ "mode": "document", "references": [...] }`, then raw tokens

Direct/General Mode (`/api/query/ask_direct_stream`)
- No vector search; call NVIDIA chat directly
- Stream header: `{ "mode": "general" }`, then raw tokens

Error Handling & Resilience
- Detailed error mapping: auth errors (401/403), rate limiting (429), timeouts (408), server errors (5xx)
- Retries with exponential backoff for transient failures
- Graceful stream termination and cleanup on disconnect


## Data Stores & Schema

- AWS S3: Raw file objects at `uploads/{userId}/{uuid}.{ext}` (immutable after upload)
- Supabase Postgres (example `files` shape):
  - `id`, `user_id`, `file_key`, `file_name`, `file_size`, `content_type`, `status`, `chunks_count`, `created_at`, `updated_at`
- Pinecone: Vectors keyed per chunk; metadata includes `user_id` for query-time filtering


## Security Posture

- AuthZ: Per-user scoping everywhere; backend checks payload `user_id` against JWT-verified user
- Route Protection: Clerk middleware on frontend; FastAPI dependencies on backend
- Input Validation: Strict filetype/size checks; S3 key format enforcement; safe filename patterns
- Secrets: All third-party keys via env vars (NIM, Pinecone, S3, Supabase, backend key)
- Headers: Security headers set on backend responses; CORS limited to configured frontend origin
- Error Responses: Generic messages in production; detailed logs gated by `DEBUG`


## Performance & Scalability

- Streaming: Token-level streaming from backend to client for responsiveness
- Batching: Embedding generation batches with concurrency limits and backoff
- Limits: Chunk caps, text size caps, file size caps guard resources
- Stateless: Frontend and backend are stateless; horizontal scaling-friendly
- External services scale independently (S3, Pinecone, NIM)


## Developer Experience & Key Files

Frontend (selected):
- `src/app/layout.tsx` – App shell and providers
- `src/app/page.tsx` – Landing page
- `src/app/dashboard/*` – Dashboard, upload, chat views
- `src/app/api/*` – Next.js API routes (upload, process, files, chat/stream)
- `src/hooks/useChat.ts` – Chat streaming state machine
- `src/middleware.ts` – Clerk route protection

Backend (selected):
- `backend/app/__init__.py` – FastAPI app bootstrapping, CORS, routers
- `backend/app/routes/processing.py` – File processing pipeline endpoint
- `backend/app/routes/query.py` – RAG/direct Q&A (sync + streaming)
- `backend/app/services/*` – S3, TextExtractor, NIM, Pinecone, Supabase services


## Typical User Journeys

1) New User
- Signs up (Clerk) → Dashboard → Upload document(s) → Processing → Chat with documents → Cited answers

2) Returning User with No Docs
- Goes to Chat → General mode (no docs) → Direct AI answers (no citations)

3) Power User
- Bulk upload → Select subset of files in chat → Ask focused questions → Get precise, cited answers


## Notes for Simplification

- Upload flow is already isolated behind Next.js API → consider moving file record creation into FastAPI to consolidate
- Background jobs/queues can make processing more resilient at scale
- Add UI polling for processing status for large files (already possible via `/api/processing/status/{job_id}` placeholder)
- Centralize error surfaces in the UI (toast + inline) for fewer moving parts


## Appendix – Modes & Headers in Streaming

- First streamed line is JSON header (always a single line), e.g.:
  - Document mode: `{ "mode": "document", "references": [{"file_name":"doc.pdf","score":0.87}] }\n`
  - General mode: `{ "mode": "general" }\n`
- Subsequent chunks are raw UTF-8 text tokens until completion


---

If you’re looking for the full code structure and security details, also see:
- `docs/CODEBASE_SUMMARY.md`
- `docs/SECURITY_AUDIT_REPORT.md`
- Project root `README.md` for setup and environment variables
 - `docs/ARCHITECTURE.md` for diagrams and agent-focused technical details
