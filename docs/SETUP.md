# 🚀 Complete Setup Guide

This guide will walk you through setting up CTC Club on your local machine for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | 20.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 10.x or higher | Comes with Node.js |
| **MongoDB** | 7.x or higher | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/downloads) |

### Optional Tools

- **MongoDB Compass**: GUI for MongoDB ([Download](https://www.mongodb.com/try/download/compass))
- **Postman**: API testing ([Download](https://www.postman.com/downloads/))
- **VS Code**: Recommended code editor ([Download](https://code.visualstudio.com/))

### Verify Installation

```bash
# Check Node.js version
node --version
# Expected: v20.x.x or higher

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Check MongoDB version
mongod --version
# Expected: db version v7.x.x or higher

# Check Git version
git --version
# Expected: git version 2.x.x or higher
```

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/CTC-Club1.git

# Navigate to project directory
cd CTC-Club1
```

### Step 2: Install Dependencies

**Option A: Install All (Recommended)**
```bash
# Install both frontend and backend dependencies
npm run install:all
```

**Option B: Install Separately**
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Verify Installation

```bash
# Check backend dependencies
cd backend && npm list --depth=0

# Check frontend dependencies
cd ../frontend && npm list --depth=0
```

---

## Configuration

### Backend Configuration

#### 1. Create Environment File

```bash
# Navigate to backend directory
cd backend

# Copy example environment file
cp .env.example .env
```

#### 2. Edit Environment Variables

Open `backend/.env` and configure the following:

```bash
# ============================================
# Server Configuration
# ============================================
NODE_ENV=development
PORT=5000

# ============================================
# Database Configuration
# ============================================
# Option 1: Local MongoDB
MONGO_URI=mongodb://localhost:27017/ctc-club

# Option 2: MongoDB Atlas (Recommended for cloud)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ctc-club?retryWrites=true&w=majority

# ============================================
# JWT Configuration
# ============================================
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=30d

# ============================================
# CORS Configuration
# ============================================
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_MAX=20

# ============================================
# File Upload Configuration
# ============================================
VIDEO_UPLOAD_MAX_MB=512
RESOURCE_UPLOAD_MAX_MB=50

# ============================================
# Email Configuration (Optional)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=CTC Club <noreply@ctcclub.com>

# ============================================
# OAuth Configuration (Optional)
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth/github/callback

# ============================================
# Payment Gateway (Optional)
# ============================================
# Chapa Payment Gateway
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_PUBLIC_KEY=your-chapa-public-key
CHAPA_WEBHOOK_URL=http://localhost:5000/api/payments/webhook
```

#### 3. Generate Secure JWT Secret

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Node.js (Any OS):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as `JWT_SECRET` in your `.env` file.

### Frontend Configuration (Optional)

Frontend environment variables are optional for local development. Create only if deploying separately.

```bash
# Navigate to frontend directory
cd frontend

# Create environment file
touch .env
```

Edit `frontend/.env`:

```bash
# API Base URL (optional, defaults to relative /api)
# Only needed if frontend and backend are on different domains
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=CTC Club
VITE_APP_URL=http://localhost:5173
```

---

## Database Setup

### Option 1: Local MongoDB

#### Start MongoDB Service

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Mac (Homebrew):**
```bash
brew services start mongodb-community@7.0
```

**Windows:**
- MongoDB should start automatically
- Or run: `net start MongoDB`

#### Verify MongoDB is Running

```bash
# Connect to MongoDB shell
mongosh

# Should see connection successful message
# Exit with: exit
```

#### Create Database (Optional)

MongoDB will create the database automatically, but you can do it manually:

```bash
mongosh
use ctc-club
db.createCollection('users')
exit
```

### Option 2: MongoDB Atlas (Cloud)

#### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)

#### 2. Configure Network Access

1. In Atlas dashboard, go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
   - Or add your specific IP address for better security

#### 3. Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password
5. Grant **Read and write to any database** role

#### 4. Get Connection String

1. Go to **Clusters** > **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your user's password
5. Replace `<dbname>` with `ctc-club`
6. Paste into `MONGO_URI` in `.env`

Example:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/ctc-club?retryWrites=true&w=majority
```

### Seed Database (Optional)

Populate database with sample data:

```bash
cd backend
npm run seed
```

---

## Running the Application

### Development Mode

#### Option 1: Run Both Servers (Recommended)

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Backend running at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Frontend running at http://localhost:5173
```

#### Option 2: Run Individually

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

### First Time Setup

1. Open http://localhost:5173
2. Click **Register** to create an account
3. Choose role: **Student** or **Instructor**
4. Complete registration
5. You're ready to explore!

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using port 5000
# Linux/Mac:
lsof -i :5000

# Windows:
netstat -ano | findstr :5000

# Kill the process
# Linux/Mac:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**

1. **Check MongoDB is running:**
   ```bash
   # Linux:
   sudo systemctl status mongod
   
   # Mac:
   brew services list
   
   # Windows:
   sc query MongoDB
   ```

2. **Check connection string:**
   - Verify `MONGO_URI` in `.env`
   - Ensure no typos in username/password

3. **Check network access (Atlas):**
   - Whitelist your IP in Atlas
   - Check firewall settings

### JWT Secret Not Set

**Error:** `JWT_SECRET is not defined`

**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Add to backend/.env
JWT_SECRET=<generated-secret>
```

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**

1. **Check backend is running** on http://localhost:5000

2. **Verify CORS configuration** in `backend/.env`:
   ```bash
   CLIENT_URL=http://localhost:5173
   CORS_ORIGINS=http://localhost:5173
   ```

3. **Clear browser cache** and reload

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Build Fails

**Error:** `Build failed with TypeScript errors`

**Solution:**
```bash
# Check TypeScript version
npx tsc --version

# Rebuild
npm run build

# Check for errors
npm run lint
```

---

## Next Steps

### For Developers

- [ ] Read [Architecture Documentation](ARCHITECTURE.md)
- [ ] Review [API Documentation](API.md)
- [ ] Check [Contributing Guidelines](../CONTRIBUTING.md)
- [ ] Set up code editor (recommended: VS Code with ESLint + Prettier)
- [ ] Explore the codebase

### For Testing

- [ ] Import Postman collection from `docs/postman/`
- [ ] Test API endpoints
- [ ] Create test accounts for each role
- [ ] Try creating a course as instructor
- [ ] Enroll in courses as student

### For Production

- [ ] Review [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)
- [ ] Read [Security Policy](../SECURITY.md)
- [ ] Set up MongoDB Atlas
- [ ] Configure email service
- [ ] Set up OAuth providers
- [ ] Choose hosting platform

---

## Useful Commands

### Backend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database
npm run seed

# Run tests
npm test
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Both

```bash
# Install all dependencies
npm run install:all

# Run both in development
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2

# Build both
npm run build
```

---

## Getting Help

- 📖 **Documentation**: Check `docs/` directory
- 💬 **Community**: [Discord](https://discord.gg/ctcclub)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/CTC-Club1/issues)
- 📧 **Email**: support@ctcclub.com

---

**Ready to code? Let's build something amazing! 🚀**
