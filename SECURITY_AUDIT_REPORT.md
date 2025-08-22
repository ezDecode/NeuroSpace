## NeuroSpace Security Audit Report

Last updated: 2025-08-22
Owner: Security/Platform

## Executive summary
- Overall security posture: 3/5 (baseline controls present; key gaps to address)
- Highest risks: trusting `X-User-ID` header on backend, partial API key protection, service role usage bypassing RLS guarantees, permissive S3/CORS settings
- Immediate focus: enforce verified identity at backend, gate all backend routes, harden S3 policy/CORS, fail closed on misconfig, reduce presign TTL, rotate/centralize secrets

## Scope and method
- Reviewed frontend (Next.js) API routes under `src/app/api/*`
- Reviewed FastAPI backend: `backend/app/*` (routes, deps, config, services)
- Reviewed Supabase schema/RLS, S3 policy/CORS, and env usage
- Searched for hardcoded secrets, key usage, and logging patterns

## Ratings snapshot (1 = poor, 5 = excellent)
| Area | Rating | Notes |
|---|---:|---|
| Authentication & Authorization | 2.5 | Clerk on frontend; backend trusts `X-User-ID` header; only `/api/query` gated by API key |
| Secrets management | 3 | Env-based, no hardcoded secrets found; no centralized manager or rotation policy |
| Data access (DB/RLS) | 3 | RLS defined in schema; backend uses service role key (bypasses RLS) |
| Storage (S3) | 3 | Presigned upload path with validations; policy/CORS placeholders; long TTL |
| Network/CORS/API hygiene | 3 | Basic CORS and security headers present; origins/headers could be tighter |
| Logging & error handling | 3 | Security headers + generic errors; verbose debug logs in places |
| Observability & rate limiting | 2.5 | No visible rate limits, alerting, or anomaly detection |
| Overall | 3 | Solid baseline; several medium-to-high impact gaps |

## Key findings
- High: Backend identity trust boundary
  - Backend file/processing routes rely on a caller-supplied `X-User-ID` header for authorization (spoofable if backend is reachable).
  - Only `/api/query` is protected with `BACKEND_API_KEY`; other routes are not.
- Medium-High: Supabase service role usage
  - Backend uses `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS by design; correctness depends entirely on app-side checks and identity verification.
- Medium: S3 configuration
  - `s3-bucket-policy.json` is a placeholder; no enforced TLS-only, encryption, blocked public ACLs, or explicit key prefix constraints per principal.
  - `s3-cors-config.json` allows broad origins, including placeholders.
  - Presigned URL expiry at 3600s increases window of misuse if leaked.
- Medium: Fail-open environment validation
  - `validate_environment()` logs missing vars; does not fail closed in non-debug production.
- Medium: Lack of rate limiting/abuse controls
  - No per-IP or per-user limits on Next API or backend endpoints.
- Low-Medium: Verbose logging
  - Upload route logs request body and env presence; could leak metadata in prod if not gated by environment.

## Current controls observed
- Frontend: Clerk authentication; server routes proxy to backend; presigned uploads with validation of extensions, MIME type, size, and key structure.
- Backend: Security headers middleware; CORS restricted via `FRONTEND_ORIGIN`; environment validation (log-only); `/api/query` gated by `X-Backend-Key`.
- Database: RLS policies in schema for `files` and `processing_jobs` tables.

## Keys and variables inventory (observed in code)
- Frontend (.env.local):
  - `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Non-public: `CLERK_SECRET_KEY`, `BACKEND_API_KEY` (must not be exposed via NEXT_PUBLIC)
  - AWS for presign if done server-side in Next: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`
- Backend (backend/.env):
  - AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`
  - NVIDIA NIM: `NVIDIA_NIM_API_KEY`, `NVIDIA_NIM_BASE_URL`
  - Pinecone: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`
  - Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - App: `FRONTEND_ORIGIN`, `BACKEND_API_KEY`, `DEBUG`

## Recommendations and action plan

### Phase 1 (0–1 week): High-impact hardening
1) Enforce verified identity on backend
- Accept `Authorization: Bearer <Clerk JWT>` from Next API and verify via Clerk JWKS on FastAPI.
- Derive user ID from the verified token; remove reliance on `X-User-ID`.
2) Gate all backend routers
- Apply `require_backend_key` (or HMAC-signed headers) to `files`, `processing`, and `query` routers.
- Prefer HMAC signatures over a static key for better rotation and replay protection.
3) Fail closed on misconfiguration
- If required env vars are missing and `DEBUG != True`, terminate startup.
4) Harden S3 and CORS
- Bucket policy: require TLS (`aws:SecureTransport`), enforce SSE-KMS, deny all public ACLs and `PutObjectAcl`, scope allowed actions to `uploads/<userId>/*` with IAM conditions.
- CORS: restrict `AllowedOrigins` to exact production domains; keep development origins only in dev.
- Reduce presigned URL TTL to 10–15 minutes.
5) Logging hygiene and error responses
- Remove sensitive request/body/env logs in prod; keep structured logs with minimal context.
6) Rate limiting
- Add per-IP and per-user rate limiting on Next API and backend endpoints.
7) Secrets rotation (initial)
- Rotate `BACKEND_API_KEY`, AWS keys, Supabase service key, Pinecone, NIM immediately after changes above.

### Phase 2 (1–3 weeks): Secrets and platform hardening
1) Centralize secrets
- Backend: migrate secrets to AWS Secrets Manager or SSM Parameter Store; attach IAM role to runtime; fetch at boot.
- Frontend: store secrets in Vercel environment variables; never expose secrets under `NEXT_PUBLIC_*`.
2) Supabase usage mode
- Prefer user-scoped JWT with anon key for RLS enforcement where possible, or keep service role but require verified backend identity checks for every DB operation.
3) CI/CD and IAM
- GitHub OIDC → assume AWS role for deploys; remove long-lived AWS keys.
- Add secret scanning (gitleaks/detect-secrets) and dependency audits (`pip-audit`, `npm audit`) to CI.
4) Web security headers on frontend
- Add CSP (script-src with nonces), HSTS, `X-Frame-Options`, `Referrer-Policy` via Next middleware.
5) Observability
- Centralized logging with PII scrubbing; security alerts on auth failures, unusual S3 access, rate limit triggers.

### Phase 3 (ongoing): Governance and resilience
- Formal rotation policy (e.g., 90 days), runbooks for secret rotation and incident response.
- Periodic threat modeling and targeted pen tests.
- Backup/restore tests for critical data and Pinecone index snapshots.

## Concrete task list (initial)
- Backend: verify Clerk JWTs; remove `X-User-ID` trust; apply API key/HMAC to all routers.
- Backend: fail-closed env validation; add rate limiting; reduce logging in prod.
- S3: update bucket policy (TLS-only, SSE-KMS, block ACLs); tighten CORS; cut presign TTL.
- Secrets: rotate all keys; adopt centralized secret manager; remove long-lived keys from CI.
- Supabase: enforce user checks from verified JWT; revisit service role usage.
- Frontend: add security headers/CSP; ensure no secrets under `NEXT_PUBLIC_*`.
- CI/CD: OIDC to AWS; add secret scanning and dep audit jobs.

## Appendix: References in code
- Backend API key enforcement: `backend/app/deps.py`, applied in `backend/app/routes/query.py`
- Identity handling: frontend sends `X-User-ID` in `src/app/api/*`; backend reads header in `backend/app/deps.py::get_current_user`
- S3 usage: `src/app/api/upload/route.ts` (presign), `backend/app/services/s3_service.py` (download)
- Supabase: `backend/app/services/supabase_service.py`
- Schema & RLS: `backend/supabase_schema.sql`
- S3 config samples: `s3-bucket-policy.json`, `s3-cors-config.json`