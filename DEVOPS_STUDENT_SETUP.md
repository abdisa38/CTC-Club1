# CTC Club - DevOps Setup (Student Friendly)

This project now includes CI/CD workflows designed to be safe by default.
Nothing deploys to paid services unless you manually run a deploy workflow and set secrets.

## 1) What is already set up

- CI build + security gate: `.github/workflows/ci.yml`
- Frontend deploy to GitHub Pages: `.github/workflows/deploy-frontend-pages.yml`
- Backend deploy to Heroku: `.github/workflows/deploy-heroku.yml`
- Backend/frontend deploy trigger for DigitalOcean App Platform: `.github/workflows/deploy-digitalocean.yml`
- Backend deploy to Azure App Service: `.github/workflows/deploy-azure.yml`
- Backend container build support: `backend/Dockerfile`

## 2) Before tomorrow (no card needed)

1. Push this repository to GitHub.
2. In GitHub, open Actions tab and run `CI` workflow.
3. Enable GitHub Pages in repository settings:
   - Settings -> Pages -> Source: GitHub Actions.
4. (Optional) Run `Deploy Frontend to GitHub Pages` workflow.

## 3) Tomorrow after adding $2 to your card

### A) Heroku setup

1. Create a Heroku app.
2. In GitHub repo secrets, add:
   - `HEROKU_API_KEY`
   - `HEROKU_APP_NAME`
   - `HEROKU_EMAIL`
3. Run workflow: `Deploy Backend to Heroku`.
4. Verify health endpoint:
   - `https://<HEROKU_APP_NAME>.herokuapp.com/api/health`

### B) DigitalOcean setup (App Platform)

1. Create backend app in App Platform connected to this GitHub repo.
2. (Optional) Create frontend app in App Platform.
3. In GitHub repo secrets, add:
   - `DIGITALOCEAN_ACCESS_TOKEN`
   - `DIGITALOCEAN_BACKEND_APP_ID`
   - `DIGITALOCEAN_FRONTEND_APP_ID` (optional)
   - `DIGITALOCEAN_BACKEND_HEALTHCHECK_URL` (optional)
4. Run workflow: `Deploy to DigitalOcean App Platform`.

### C) Azure for Students (no card path)

1. Create Azure App Service for backend.
2. Download publish profile from Azure portal.
3. In GitHub repo secrets, add:
   - `AZURE_BACKEND_WEBAPP_NAME`
   - `AZURE_BACKEND_PUBLISH_PROFILE`
4. Run workflow: `Deploy Backend to Azure App Service`.

## 4) Required app environment variables

Set these in your hosting provider (Heroku / DigitalOcean / Azure):

- `NODE_ENV=production`
- `PORT` (platform default is fine)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `VIDEO_UPLOAD_MAX_MB`
- `RESOURCE_UPLOAD_MAX_MB`

Optional based on features:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET`, `CHAPA_RETURN_URL`, etc.

## 5) Cost safety rules (important)

1. Keep deploy workflows manual (`workflow_dispatch`) unless you are ready.
2. Use Linux runners only in Actions.
3. Delete old artifacts in Actions if storage grows.
4. Set billing alerts in Heroku/DigitalOcean/Azure immediately.
5. If money is tight, prefer Azure for Students + GitHub Pages first.

## 6) Recommended production branch flow

1. `develop` branch: test and CI.
2. `main` branch: production-ready code only.
3. Deploy only from `main` after CI passes.

## 7) Quick troubleshooting

- Heroku deploy fails: confirm app name, API key, and that app exists.
- DigitalOcean deploy fails: confirm app ID and token scope.
- Azure deploy fails: re-download publish profile and update secret.
- Backend crash after deploy: check provider logs and verify `MONGO_URI` and `JWT_SECRET`.

## 8) Local commands to keep using

- Install all: `npm run install:all`
- Run backend: `npm run dev:backend`
- Run frontend: `npm run dev:frontend`
- Build all: `npm run build`
- Security audit: `npm run audit`
- Predeploy gate: `npm run predeploy`
