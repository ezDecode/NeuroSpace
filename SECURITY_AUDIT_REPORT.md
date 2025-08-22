## NeuroSpace Security Audit Report

Last updated: 2025-08-22
Owner: Security/Platform

## Executive summary
- Overall security posture (post-fix): 3.6/5 (up from 3/5)
- Improvements implemented: JWT verification on backend, backend key required on all routers, frontend now sends Authorization + backend key
- Immediate next: S3 policy/CORS tightening, fail-closed env validation in prod, presign TTL reduction, rotation and centralized secrets

## Scope and method
- Reviewed frontend (Next.js) API routes under `src/app/api/*`
- Reviewed FastAPI backend: `backend/app/*` (routes, deps, config, services)
- Reviewed Supabase schema/RLS, S3 policy/CORS, and env usage
- Searched for hardcoded secrets, key usage, and logging patterns

## Ratings snapshot (1 = poor, 5 = excellent)
| Area | Before | After | Notes |
|---|---:|---:|---|
| Authentication & Authorization | 2.5 | 3.8 | Backend verifies JWT via Clerk JWKS; routers gated by backend key |
| Secrets management | 3.0 | 3.0 | Env-based; centralization/rotation pending |
| Data access (DB/RLS) | 3.0 | 3.2 | Verified user enforced in DB ops; still using service role |
| Storage (S3) | 3.0 | 3.0 | Policy/CORS tightening and TTL reductions pending |
| Network/CORS/API hygiene | 3.0 | 3.4 | All routers protected; CORS tuning pending |
| Logging & error handling | 3.0 | 3.0 | Reduce prod verbosity next |
| Observability & rate limiting | 2.5 | 2.5 | To be implemented |
| Overall | 3.0 | 3.6 | Significant step-up in auth and API protection |

## Key findings (updated)
- Fixed: Backend identity trust boundary
  - All backend routes now require a valid Clerk JWT (`Authorization: Bearer <token>`) and the backend key.
  - Payload `user_id` is checked to match the JWT subject.
- Remaining: Supabase service role usage
  - Continue to rely on app-side checks; plan to prefer user JWT with anon key where feasible.
- Remaining: S3 configuration gaps and long presign TTL
  - Tighten policy/CORS and reduce expiry.
- Remaining: Fail-closed env validation for production and rate limiting.

## Week 1 plan status (security-related)
- Clerk auth integrated and now enforced on backend via JWT verification: COMPLETE
- CORS and security headers: PRESENT (further tightening planned)
- Secure S3 uploads with signed URLs: PRESENT (TTL/policy improvements pending)

## Next actions (Phase 1)
- Harden S3 policy/CORS; reduce presign TTL to 10–15 minutes
- Fail closed in production if required envs are missing
- Add rate limiting on Next API and backend
- Start key rotation and adopt AWS Secrets Manager/SSM for backend

## Appendix: References in code
- JWT verification and backend key: `backend/app/deps.py`, applied in all routers under `backend/app/routes/*`
- Frontend Authorization/header updates: `src/app/api/{chat,files,files/[fileId],process}/route.ts`