# Contributing to CTC Club

First off, thank you for considering contributing to CTC Club! It's people like you that make CTC Club such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7+
- Git
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CTC-Club1.git
   cd CTC-Club1
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/CTC-Club1.git
   ```

### Local Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

3. Start development servers:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

---

## Development Workflow

### Branching Strategy

We use **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release preparation

### Creating a Feature Branch

```bash
# Make sure you're on develop
git checkout develop

# Pull latest changes
git pull upstream develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### Feature Branch Naming

Use descriptive names with prefixes:

- `feature/add-video-player`
- `feature/course-recommendations`
- `bugfix/fix-login-redirect`
- `hotfix/security-patch`
- `docs/update-api-documentation`

---

## Coding Standards

### TypeScript Style Guide

We follow strict TypeScript best practices:

#### 1. Use Explicit Types
```typescript
// ✅ Good
function getUserById(id: string): Promise<IUser | null> {
  return User.findById(id);
}

// ❌ Bad
function getUserById(id) {
  return User.findById(id);
}
```

#### 2. Interface Over Type for Objects
```typescript
// ✅ Good
interface User {
  name: string;
  email: string;
}

// ❌ Bad (for objects)
type User = {
  name: string;
  email: string;
}
```

#### 3. Use Async/Await Over Promises
```typescript
// ✅ Good
async function fetchUser() {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error('User not found');
  }
}

// ❌ Bad
function fetchUser() {
  return User.findById(id)
    .then(user => user)
    .catch(error => {
      throw new Error('User not found');
    });
}
```

#### 4. Destructuring
```typescript
// ✅ Good
const { name, email, role } = req.body;

// ❌ Bad
const name = req.body.name;
const email = req.body.email;
const role = req.body.role;
```

### Backend Conventions

#### Controller Pattern
```typescript
import expressAsyncHandler from 'express-async-handler';

export const createCourse = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Validate input
    const result = courseSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400);
      throw new Error('Invalid input');
    }
    
    // Business logic
    const course = await Course.create({
      ...result.data,
      instructor: req.user._id
    });
    
    // Response
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  }
);
```

#### Model Pattern
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IModel extends Document {
  field: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const modelSchema = new Schema<IModel>(
  {
    field: {
      type: String,
      required: [true, 'Field is required'],
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Always filter soft-deleted documents
modelSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model<IModel>('Model', modelSchema);
```

### Frontend Conventions

#### Component Structure
```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ComponentProps {
  title: string;
  onSave: (data: any) => void;
}

export function Component({ title, onSave }: ComponentProps) {
  // 1. Hooks
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3. Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };
  
  // 4. Render
  return (
    <div>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        {/* Form content */}
      </form>
    </div>
  );
}
```

#### API Service Pattern
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true
});

export const courseService = {
  getAll: (params?: any) => 
    api.get('/courses', { params }).then(res => res.data),
  
  getById: (id: string) => 
    api.get(`/courses/${id}`).then(res => res.data),
  
  create: (data: any) => 
    api.post('/courses', data).then(res => res.data),
  
  update: (id: string, data: any) => 
    api.put(`/courses/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/courses/${id}`).then(res => res.data)
};
```

### File Naming

- **React Components**: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Pages**: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- **Hooks**: `use` prefix + `camelCase.ts` (e.g., `useAuth.ts`)
- **Contexts**: `PascalCase` + `Context.tsx` (e.g., `AuthContext.tsx`)

### Code Formatting

We use **Prettier** and **ESLint**:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Lint and fix
npm run lint:fix
```

**Prettier config** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Commit Guidelines

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

#### Examples

```bash
# Feature
git commit -m "feat(courses): add video player controls"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactor
git commit -m "refactor(models): extract common schema methods"

# With body
git commit -m "feat(quiz): add multiple choice questions

- Add QuizQuestion model
- Implement question validation
- Update quiz controller

Closes #123"
```

### Commit Best Practices

1. **Write meaningful commit messages**
2. **Keep commits atomic** (one logical change per commit)
3. **Commit often** (small, focused commits)
4. **Don't commit broken code**
5. **Test before committing**

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest `develop`:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Build successfully**:
   ```bash
   npm run build
   ```

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature
   ```

2. **Open PR** on GitHub from your fork to `upstream/develop`

3. **Fill out PR template** completely:
   - **Title**: Clear, descriptive summary
   - **Description**: What, why, and how
   - **Related Issues**: Reference issue numbers
   - **Screenshots**: For UI changes
   - **Testing**: How you tested the changes
   - **Checklist**: Complete all items

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added feature X
- Fixed bug Y
- Updated documentation Z

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** must pass:
   - Build successful
   - Tests passing
   - Linting passing
   - No security vulnerabilities

2. **Code review** by maintainers:
   - At least one approval required
   - Address all feedback
   - Make requested changes

3. **Merge**:
   - Maintainer will merge when ready
   - Branch will be deleted automatically

---

## Testing Guidelines

### Backend Testing

```typescript
// tests/course.test.ts
import request from 'supertest';
import app from '../src/server';
import Course from '../src/models/courseModel';

describe('Course API', () => {
  beforeEach(async () => {
    await Course.deleteMany({});
  });

  describe('GET /api/courses', () => {
    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test description',
        category: 'test'
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(courseData.title);
    });
  });
});
```

### Frontend Testing

```typescript
// tests/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CourseCard } from '../app/components/CourseCard';

describe('CourseCard', () => {
  const mockCourse = {
    _id: '1',
    title: 'Test Course',
    description: 'Test description',
    instructor: { name: 'John Doe' }
  };

  it('renders course title', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('renders instructor name', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## Documentation

### Code Comments

```typescript
/**
 * Enrolls a student in a course
 * 
 * @param userId - The ID of the student
 * @param courseId - The ID of the course
 * @returns Promise resolving to enrollment data
 * @throws Error if user is already enrolled
 */
async function enrollStudent(
  userId: string,
  courseId: string
): Promise<EnrollmentData> {
  // Implementation
}
```

### API Documentation

When adding new endpoints, update `docs/API.md` with:
- Endpoint path and method
- Required authentication
- Request parameters
- Request body schema
- Response format
- Example requests/responses
- Error cases

### Architecture Documentation

For significant architectural changes, update `docs/ARCHITECTURE.md`.

---

## Questions?

- 💬 **Discord**: [Join our community](https://discord.gg/ctcclub)
- 📧 **Email**: dev@ctcclub.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/CTC-Club1/issues)

---

Thank you for contributing to CTC Club! 🎉
