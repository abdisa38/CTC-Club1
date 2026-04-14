# CTC Club - Docker Quick Start

This setup lets you run the backend API and MongoDB locally with Docker Compose.

## 1) Prerequisites

- Docker Desktop installed and running.

## 2) Start containers

From repository root:

- docker compose up -d --build

This starts:

- MongoDB on localhost:27017
- Backend API on localhost:5000

## 3) Verify

- Open http://localhost:5000/api/health
- You should get a success response.

## 4) Stop containers

- docker compose down

To also remove Mongo data volume:

- docker compose down -v

## 5) Notes

- This compose file is for local development and pre-deployment testing.
- Replace placeholder values before using similar settings in production.
- Frontend can still run with npm run dev:frontend.
