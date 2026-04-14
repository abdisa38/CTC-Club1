# CTC Club - Senior Deployment Checklist

## 1) Project Structure

- frontend: Vite + React app
- backend: Express + TypeScript API

## 2) First-Time Setup

1. Install dependencies for both apps:
   - npm run install:all
2. Copy environment templates:
   - backend/.env.example -> backend/.env
   - frontend/.env.example -> frontend/.env (optional for local dev)
3. Fill required values in backend/.env:
   - MONGO_URI
   - JWT_SECRET
   - CLIENT_URL

## 3) Local Development Flow

1. Start backend:
   - npm run dev:backend
2. Start frontend in another terminal:
   - npm run dev:frontend
3. Health check:
   - GET /api/health should return status ok

## 4) Pre-Deploy Quality Gate

Run these before every deployment:

1. npm run build
2. npm run audit
3. Manually test critical user flows:
   - Register/login/logout
   - Role-based routes (student/instructor/admin)
   - Course browse/enroll
   - Lesson playback/download links
   - Payment init and return flow (if enabled)
   - Password reset email and reset code

## 5) DevOps Automation

- CI workflow: .github/workflows/ci.yml
- Frontend Pages workflow: .github/workflows/deploy-frontend-pages.yml
- Heroku workflow: .github/workflows/deploy-heroku.yml
- DigitalOcean workflow: .github/workflows/deploy-digitalocean.yml
- Azure workflow: .github/workflows/deploy-azure.yml
- Full setup guide: DEVOPS_STUDENT_SETUP.md
- Docker local setup guide: DOCKER_SETUP.md

## 6) Security Controls Already Added

- Helmet security headers
- CORS allow-list with optional CORS_ORIGINS env
- API rate limiting and stricter auth endpoint rate limiting
- JWT secret fallback removed for production safety
- Request body size limit on JSON payloads
- Production-safe cookie clearing flags

## 7) Deployment Order

1. Deploy backend first
2. Set backend environment variables on hosting platform
3. Confirm backend /api/health is green
4. Deploy frontend
5. Set frontend VITE_API_BASE_URL to your backend URL + /api (if not same origin)
6. Smoke-test login, dashboard, and one protected API call

## 8) Production Environment Minimum

Backend:

- NODE_ENV=production
- PORT (platform provided or fixed)
- MONGO_URI
- JWT_SECRET
- CLIENT_URL
- CORS_ORIGINS
- VIDEO_UPLOAD_MAX_MB
- RESOURCE_UPLOAD_MAX_MB

Frontend:

- VITE_API_BASE_URL (if frontend and backend are on different domains)

## 9) Rollback Plan (Simple)

1. Keep last known-good backend and frontend build artifacts/images.
2. If health check fails after release, roll back backend first.
3. Then roll back frontend if UI/API contract changed.
4. Re-run smoke tests and only then reopen traffic.
