# 🎓 CTC Club - Modern Learning Management System

<div align="center">

![CTC Club Banner](docs/images/banner.png)

[![CI/CD](https://github.com/yourusername/CTC-Club1/workflows/CI/badge.svg)](https://github.com/yourusername/CTC-Club1/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

**A full-stack, enterprise-grade Learning Management System built with modern technologies**

[Live Demo](#) • [Documentation](docs/README.md) • [API Docs](docs/API.md) • [Architecture](docs/ARCHITECTURE.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CTC Club** is a comprehensive Learning Management System designed for modern educational institutions, coding bootcamps, and tech communities. It provides a complete solution for course creation, student engagement, progress tracking, and community building.

### Why CTC Club?

- **🎯 Multi-Role System**: Seamlessly manage students, instructors, and administrators
- **🎮 Gamification**: Drive engagement with XP, levels, badges, and leaderboards
- **💳 Payment Integration**: Monetize courses with integrated payment gateway
- **📊 Advanced Analytics**: Track student progress and instructor performance
- **🔒 Enterprise Security**: JWT authentication, role-based access control, rate limiting
- **🎨 Modern UI/UX**: Beautiful, responsive design with dark mode support
- **🚀 Production Ready**: Containerized, CI/CD enabled, and scalable

---

## ✨ Key Features

### 📚 Course Management
- **Rich Course Creation**: Create courses with multimedia lessons, videos, attachments
- **Structured Content**: Organize lessons into phases, weeks, and topics
- **Multiple Access Modes**: Open (free), paid, or custom locked/unlocked per student
- **Version Control**: Draft, publish, and archive course versions

### 👥 Role-Based Access
- **Students**: Enroll in courses, track progress, earn rewards, participate in community
- **Instructors**: Create courses, grade assignments, manage students, view analytics
- **Admins**: Full platform control, user management, moderation, system settings

### 🎯 Assessment & Progress
- **Interactive Quizzes**: Multiple choice, multiple answer, true/false, fill-in-the-blank
- **Project Submissions**: File uploads with instructor grading and feedback
- **Progress Tracking**: Course completion percentages, lesson checkpoints
- **Performance Analytics**: Detailed insights into learning patterns

### 🎮 Gamification System
- **XP & Levels**: Reward active learning and participation
- **Achievement Badges**: Unlock badges for milestones and accomplishments
- **Leaderboards**: Foster healthy competition among learners
- **Course Reviews**: Student ratings and feedback system

### 💬 Community Features
- **Discussion Forums**: Course-specific and general community discussions
- **Q&A System**: Ask questions, get answers from instructors and peers
- **User Profiles**: Showcase achievements, bio, social links
- **Notifications**: Real-time updates on course activities

### 💼 Premium Features
- **Payment Integration**: Chapa payment gateway for subscriptions and paid courses
- **Premium Membership**: Unlock exclusive content and features
- **Support Ticketing**: Priority support system with ticket management
- **Event Management**: Create and promote events with registration

### 🔐 Security & Performance
- **Secure Authentication**: JWT with httpOnly cookies, bcrypt password hashing
- **OAuth Integration**: Sign in with Google and GitHub
- **Rate Limiting**: Protect API endpoints from abuse
- **Input Validation**: Zod schema validation for all inputs
- **File Upload Security**: Controlled file types and size limits
- **CORS Protection**: Configurable origin allowlist

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 20+ |
| **TypeScript** | Type-safe development | 6.0+ |
| **Express.js** | Web framework | 5.2 |
| **MongoDB** | Database | 7.0 |
| **Mongoose** | ODM | 9.4 |
| **JWT** | Authentication | 9.0 |
| **bcrypt** | Password hashing | 6.0 |
| **Multer** | File uploads | 2.1 |
| **Nodemailer** | Email service | 8.0 |
| **Zod** | Schema validation | 4.3 |
| **Helmet** | Security headers | 8.1 |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3 |
| **TypeScript** | Type-safe development | 6.0+ |
| **Vite** | Build tool | 6.3 |
| **React Router** | Routing | 7.13 |
| **Radix UI** | Component primitives | Latest |
| **Tailwind CSS** | Styling | 4.1 |
| **Framer Motion** | Animations | Latest |
| **Axios** | HTTP client | 1.15 |
| **Recharts** | Data visualization | 2.15 |
| **Sonner** | Toast notifications | Latest |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **MongoDB Atlas** | Database hosting (prod) |
| **GitHub Pages** | Frontend hosting |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Public  │  │ Student  │  │Instructor│  │  Admin   │   │
│  │  Portal  │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
┌───────────────────────────┴─────────────────────────────────┐
│                    Backend (Express + TypeScript)            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  • Authentication (JWT)                              │   │
│  │  • Authorization (Role-based)                        │   │
│  │  • Rate Limiting                                     │   │
│  │  • Input Validation (Zod)                            │   │
│  │  • Error Handling                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Controller Layer                        │   │
│  │  Auth • Course • Lesson • Quiz • Project            │   │
│  │  Payment • Community • Event • Support              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Service Layer (Business Logic)          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (Mongoose)            │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Courses  │  │ Lessons  │  │  Quizzes │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Projects │  │  Events  │  │Community │  │  Badges  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **MVC Architecture**: Clear separation of routes, controllers, and models
- **Repository Pattern**: Data access abstraction via Mongoose models
- **Middleware Chain**: Composable request processing pipeline
- **Context API**: Global state management in React
- **Lazy Loading**: Code splitting for optimized bundle size
- **Soft Delete**: Preserve data integrity with `isDeleted` flags

See [detailed architecture documentation](docs/ARCHITECTURE.md) for more information.

---

## 📸 Screenshots

### Landing Page
![Landing Page](docs/images/landing.png)
*Modern, conversion-optimized landing page*

### Student Dashboard
![Student Dashboard](docs/images/student-dashboard.png)
*Intuitive student dashboard with progress tracking*

### Course Viewer
![Course Viewer](docs/images/course-viewer.png)
*Rich multimedia course experience*

### Instructor Dashboard
![Instructor Dashboard](docs/images/instructor-dashboard.png)
*Comprehensive instructor analytics*

### Admin Panel
![Admin Panel](docs/images/admin-panel.png)
*Full platform administration*

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **MongoDB** 7+ ([Download](https://www.mongodb.com/try/download/community) or use [Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/downloads))

### Quick Start (5 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CTC-Club1.git
   cd CTC-Club1
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend configuration
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your values
   # Minimum required:
   # - MONGO_URI (your MongoDB connection string)
   # - JWT_SECRET (generate with: openssl rand -base64 32)
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend (http://localhost:5000)
   npm run dev:backend
   
   # Terminal 2 - Frontend (http://localhost:5173)
   npm run dev:frontend
   ```

5. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:5000/api
   API Health: http://localhost:5000/api/health
   ```

### Docker Setup (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [Docker Setup Guide](DOCKER_SETUP.md) for detailed instructions.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and patterns
- **[Deployment Guide](DEPLOYMENT_CHECKLIST.md)** - Production deployment steps
- **[DevOps Guide](DEVOPS_STUDENT_SETUP.md)** - CI/CD configuration
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Security Policy](SECURITY.md)** - Security guidelines

### API Endpoints Overview

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `POST /api/auth/register` | User registration | Public |
| `POST /api/auth/login` | User login | Public |
| `GET /api/auth/me` | Get current user | Protected |
| `GET /api/courses` | List courses | Public/Protected |
| `POST /api/courses` | Create course | Instructor |
| `GET /api/courses/:id` | Get course details | Public/Protected |
| `POST /api/courses/:id/enroll` | Enroll in course | Student |
| `GET /api/dashboard/student` | Student dashboard | Student |
| `GET /api/dashboard/instructor` | Instructor dashboard | Instructor |

See [complete API documentation](docs/API.md) for all endpoints.

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Generate secure `JWT_SECRET` (32+ characters)
- [ ] Configure MongoDB Atlas or production database
- [ ] Set up domain and SSL certificates
- [ ] Configure CORS origins for production domains
- [ ] Enable rate limiting (already configured)
- [ ] Set up email service (SMTP credentials)
- [ ] Configure file upload storage (AWS S3, etc.)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deployment Options

#### Option 1: Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Platform as a Service
- **Backend**: Railway, Render, DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, AWS DocumentDB

#### Option 3: Traditional Hosting
- **Backend**: VPS (DigitalOcean, Linode, AWS EC2)
- **Frontend**: Nginx static hosting, CDN
- **Database**: Self-hosted MongoDB or managed service

See [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for step-by-step instructions.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`, `npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- TypeScript for type safety
- ESLint + Prettier for consistent formatting
- Conventional Commits for commit messages
- 80%+ test coverage for new features

---

## 📊 Project Status

- ✅ Core LMS functionality
- ✅ Multi-role authentication system
- ✅ Course creation and management
- ✅ Quiz and project assessment
- ✅ Payment integration
- ✅ Gamification system
- ✅ Community features
- 🚧 Mobile responsive optimization
- 🚧 Advanced analytics dashboard
- 📅 Video conferencing integration
- 📅 AI-powered recommendations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Created and maintained by the CTC Club development team.

- **Project Lead**: Your Name
- **Backend Developer**: Your Name
- **Frontend Developer**: Your Name
- **DevOps Engineer**: Your Name

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [MongoDB](https://www.mongodb.com/) - Modern, document-based database
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📞 Support

- 📧 Email: support@ctcclub.com
- 💬 Discord: [Join our community](https://discord.gg/ctcclub)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/CTC-Club1/issues)
- 📖 Documentation: [docs.ctcclub.com](https://docs.ctcclub.com)

---

<div align="center">

**[⬆ back to top](#-ctc-club---modern-learning-management-system)**

Made with ❤️ by the CTC Club team

</div>
