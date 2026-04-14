# CTC Club - Beginner CI/CD and Docker Guide

This guide is for complete beginners.
For now, Heroku and DigitalOcean deployment workflows are removed.

## 1) What is active now

- CI workflow (build + audit): .github/workflows/ci.yml
- Frontend CD workflow (GitHub Pages): .github/workflows/deploy-frontend-pages.yml
- Optional backend CD workflow (Azure): .github/workflows/deploy-azure.yml
- Docker backend image: backend/Dockerfile
- Docker local stack (backend + MongoDB): docker-compose.yml

## 2) What was removed now

- .github/workflows/deploy-heroku.yml
- .github/workflows/deploy-digitalocean.yml

## 3) CI step by step (every code push)

1. Push your code to GitHub.
2. Open your repository on GitHub.
3. Click Actions.
4. Click CI.
5. Open the latest run.
6. Confirm these jobs are green:
   - Install workspace dependencies
   - Build frontend and backend
   - Dependency vulnerability audit

If CI is red:
1. Click failed step.
2. Read the error line.
3. Fix in local code.
4. Push again and confirm green.

## 4) Frontend CD step by step (GitHub Pages)

### One-time setup

1. Open repository Settings.
2. Open Pages.
3. Set Source to GitHub Actions.

### Deploy flow

1. Push changes to main branch (frontend files).
2. Open Actions.
3. Open Deploy Frontend to GitHub Pages workflow.
4. Wait for build and deploy jobs to finish.
5. Open your Pages URL from workflow output.

## 5) Optional backend CD (Azure for Students)

If you want backend cloud deploy without Heroku/DigitalOcean now, use Azure.

1. Create Azure App Service (Node backend).
2. Download Publish Profile from Azure portal.
3. In GitHub repo, open Settings -> Secrets and variables -> Actions.
4. Add these secrets:
   - AZURE_BACKEND_WEBAPP_NAME
   - AZURE_BACKEND_PUBLISH_PROFILE
5. Open Actions -> Deploy Backend to Azure App Service.
6. Run workflow manually.
7. Check backend health endpoint /api/health.

## 6) Docker step by step (local backend + database)

### Start

1. Open terminal in project root.
2. Run: docker compose up -d --build
3. Wait until containers are healthy.

### Check

1. Open: http://localhost:5000/api/health
2. Confirm API responds successfully.

### Logs

1. Backend logs: docker compose logs -f backend
2. Mongo logs: docker compose logs -f mongo

### Stop

1. Run: docker compose down
2. To remove volume data too: docker compose down -v

## 7) Environment variables you must set in production

- NODE_ENV=production
- PORT
- MONGO_URI
- JWT_SECRET
- CLIENT_URL
- CORS_ORIGINS
- RATE_LIMIT_MAX
- AUTH_RATE_LIMIT_MAX
- VIDEO_UPLOAD_MAX_MB
- RESOURCE_UPLOAD_MAX_MB

Optional feature variables:

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- CHAPA_SECRET_KEY, CHAPA_WEBHOOK_SECRET, CHAPA_RETURN_URL

## 8) Beginner command list

- Install all: npm run install:all
- Run frontend: npm run dev:frontend
- Run backend: npm run dev:backend
- Build all: npm run build
- Audit packages: npm run audit
- Pre-deploy gate: npm run predeploy

## 9) Safety rules

1. Keep deployment workflows manual until you are confident.
2. Do not put secrets directly in files.
3. Use GitHub Secrets for all keys and passwords.
4. Check CI green before any deploy.
