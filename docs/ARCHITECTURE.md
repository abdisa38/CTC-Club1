# 🏗️ Architecture Documentation

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Design Patterns](#design-patterns)

---

## System Overview

CTC Club follows a modern **three-tier architecture** with clear separation between presentation, business logic, and data layers.

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│                  (React + TypeScript)                    │
│  • Component-based UI                                    │
│  • Client-side routing                                   │
│  • State management (Context API)                        │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (HTTPS)
┌────────────────────┴────────────────────────────────────┐
│                  Application Layer                       │
│               (Express + TypeScript)                     │
│  • RESTful API endpoints                                 │
│  • Business logic                                        │
│  • Authentication & authorization                        │
│  • Input validation                                      │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────┴────────────────────────────────────┐
│                    Data Layer                            │
│                    (MongoDB)                             │
│  • Document storage                                      │
│  • Indexing                                              │
│  • Relationships                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Separation of Concerns
- **Routes**: API endpoint definitions and request routing
- **Controllers**: Business logic and request handling
- **Models**: Data schema and database operations
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

### 2. Single Responsibility
Each module, class, and function has a single, well-defined purpose.

### 3. DRY (Don't Repeat Yourself)
Reusable utilities, middleware, and components eliminate code duplication.

### 4. Security by Design
Security is built into every layer, not added as an afterthought.

### 5. Scalability First
Architecture supports horizontal scaling and microservices migration.

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    ↓
Express Router
    ↓
Middleware Chain
    ├── CORS validation
    ├── Rate limiting
    ├── Body parsing
    ├── Authentication (JWT)
    ├── Authorization (Role check)
    └── Input validation (Zod)
    ↓
Controller
    ├── Extract request data
    ├── Call business logic
    ├── Handle errors
    └── Format response
    ↓
Model Layer
    ├── Mongoose schema validation
    ├── Database operations
    └── Return data
    ↓
HTTP Response (JSON)
```

### Directory Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.ts           # MongoDB connection
│   │   └── env.ts          # Environment variable validation
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── userModel.ts    # User schema with auth methods
│   │   ├── courseModel.ts  # Course with access control
│   │   ├── lessonModel.ts  # Lesson with structure
│   │   ├── quizModel.ts    # Quiz with multiple types
│   │   └── ...
│   │
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts      # Auth logic
│   │   ├── courseController.ts    # Course CRUD
│   │   ├── lessonController.ts    # Lesson management
│   │   └── ...
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.ts          # /api/auth/*
│   │   ├── courseRoutes.ts        # /api/courses/*
│   │   └── ...
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── authMiddleware.ts      # JWT verification
│   │   └── errorMiddleware.ts     # Error handling
│   │
│   ├── utils/               # Helper functions
│   │   ├── responseUtils.ts       # Consistent API responses
│   │   └── tokenUtils.ts          # JWT utilities
│   │
│   └── server.ts            # Express app setup
│
├── uploads/                 # User-uploaded files
├── .env                     # Environment variables
├── Dockerfile              # Container configuration
└── package.json            # Dependencies
```

### API Design Principles

#### RESTful Conventions
- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update entire resource
- **PATCH**: Partial update
- **DELETE**: Remove resource (soft delete)

#### Response Format
```typescript
// Success response
{
  success: true,
  data: { /* resource data */ },
  message?: "Optional success message"
}

// Error response
{
  success: false,
  message: "Error description",
  errors?: [/* validation errors */]
}
```

#### Endpoint Naming
```
/api/resource                 # Collection
/api/resource/:id             # Single item
/api/resource/:id/action      # Action on item
/api/resource/:id/nested      # Nested resources
```

### Middleware Stack

```typescript
// Global middleware (applied to all routes)
app.use(helmet())              // Security headers
app.use(cors())               // CORS handling
app.use(express.json())       // JSON parsing
app.use(cookieParser())       // Cookie parsing

// Route-specific middleware
router.get('/protected',
  protect,                    // JWT authentication
  authorizeRoles('admin'),    // Role authorization
  controller                  // Route handler
)

// Error handling (last middleware)
app.use(notFound)             // 404 handler
app.use(errorHandler)         // Global error handler
```

---

## Frontend Architecture

### Component Architecture

```
frontend/src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   └── ...
│   │   ├── common/         # Shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── features/       # Feature-specific components
│   │       ├── CourseCard.tsx
│   │       ├── LessonPlayer.tsx
│   │       └── QuizForm.tsx
│   │
│   ├── pages/              # Route pages
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── student/        # Student-specific pages
│   │   ├── instructor/     # Instructor-specific pages
│   │   └── admin/          # Admin-specific pages
│   │
│   ├── context/            # Global state
│   │   └── AuthContext.tsx # Authentication state
│   │
│   ├── services/           # API layer
│   │   └── api.ts          # Axios wrapper
│   │
│   ├── utils/              # Helper functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts
│   │
│   └── routes.tsx          # React Router config
│
├── styles/                 # Global styles
│   └── index.css          # Tailwind + custom styles
│
└── main.tsx               # App entry point
```

### Component Hierarchy

```
App
├── AuthProvider (Global state)
│   └── Router
│       ├── PublicLayout
│       │   ├── Navbar
│       │   ├── Route Components
│       │   └── Footer
│       │
│       └── AppLayout (Protected)
│           ├── Sidebar
│           ├── Header
│           ├── Route Components
│           └── Toast Container
```

### State Management Strategy

#### Local State (useState)
- Component-specific UI state
- Form inputs
- Toggle states

#### Context API (useContext)
- Global authentication state
- User information
- Theme preferences

#### Server State (Future: React Query)
- API data fetching
- Caching
- Automatic refetching

### Routing Strategy

```typescript
// Lazy loading for code splitting
const lazyComponent = (loader, exportName) => {
  return async () => {
    const module = await loader();
    return { Component: module[exportName] };
  };
};

// Route configuration
[
  {
    path: '/',
    Component: PublicLayout,    // Public pages
    children: [/* public routes */]
  },
  {
    path: '/app',
    Component: AppLayout,       // Protected pages
    children: [/* protected routes */]
  }
]
```

---

## Database Design

### Schema Design Principles

#### 1. Embedded vs Referenced Documents

**Embedded** (when data is frequently accessed together):
```javascript
// User preferences embedded in User document
{
  _id: ObjectId,
  name: "John Doe",
  preferences: {
    notifications: { /* settings */ },
    appearance: { /* settings */ }
  }
}
```

**Referenced** (when data is large or shared):
```javascript
// Courses referenced in User document
{
  _id: ObjectId,
  name: "John Doe",
  enrolledCourses: [
    ObjectId("course1"),
    ObjectId("course2")
  ]
}
```

#### 2. Indexing Strategy

```javascript
// Single field index for frequent queries
userSchema.index({ email: 1 }, { unique: true });

// Compound index for common filter combinations
courseSchema.index({ status: 1, isPublished: 1 });

// Text index for search functionality
courseSchema.index({ title: 'text', description: 'text' });
```

#### 3. Soft Delete Pattern

```javascript
// All models include soft delete flag
{
  _id: ObjectId,
  // ... other fields
  isDeleted: false,  // Never actually delete data
  deletedAt: null
}

// Query with soft delete filter
Course.find({ isDeleted: false });
```

### Key Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['student', 'instructor', 'admin'],
  oauthProvider: Enum ['google', 'github'],
  
  // Profile
  avatar: String,
  bio: String,
  socialLinks: Object,
  
  // Gamification
  xp: Number,
  level: Number,
  badges: [ObjectId],
  
  // Relationships
  enrolledCourses: [ObjectId],
  favoriteCourses: [ObjectId],
  
  // Premium
  isPremium: Boolean,
  premiumActivatedAt: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isDeleted: Boolean
}
```

#### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  slug: String (unique, indexed),
  description: String,
  instructor: ObjectId (ref: User, indexed),
  
  // Content
  coverImage: String,
  category: String,
  tags: [String],
  
  // Access Control
  accessMode: Enum ['open', 'paid', 'locked'],
  price: Number,
  currency: String,
  lockedStudentIds: [ObjectId],
  unlockedStudentIds: [ObjectId],
  
  // Status
  status: Enum ['draft', 'published', 'archived'],
  isPublished: Boolean,
  
  // Metadata
  level: Enum ['beginner', 'intermediate', 'advanced'],
  xpReward: Number,
  prerequisites: [String],
  totalDuration: Number,
  
  // Analytics
  students: [ObjectId],
  rating: Number,
  numReviews: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

#### Lessons Collection
```javascript
{
  _id: ObjectId,
  course: ObjectId (ref: Course, indexed),
  title: String,
  slug: String,
  
  // Structure
  phase: String,
  weekNumber: Number,
  topicName: String,
  order: Number,
  
  // Content
  description: String,
  videoUrls: [String],
  attachments: [Object],
  estimatedMinutes: Number,
  
  // Interactive
  checklist: [String],
  externalLinks: [Object],
  
  // Status
  isPublished: Boolean,
  isFree: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

### Relationships

```
User (1) ──enrolls in──> (N) Course
User (1) ──creates────> (N) Course (as instructor)
Course (1) ──contains──> (N) Lesson
Course (1) ──has───────> (N) Quiz
Quiz (1) ──has─────────> (N) QuizResult
User (1) ──submits─────> (N) ProjectSubmission
User (1) ──earns───────> (N) Badge
User (1) ──creates─────> (N) CommunityPost
Course (1) ──has───────> (N) CourseReview
```

---

## Security Architecture

### Authentication Flow

```
1. User Login
   ├── Client sends credentials
   ├── Server validates credentials
   ├── Server generates JWT
   ├── Server sets httpOnly cookie
   └── Client receives user data (no token exposure)

2. Authenticated Request
   ├── Browser automatically sends cookie
   ├── Server validates JWT from cookie
   ├── Server attaches user to request
   └── Controller processes request

3. Logout
   ├── Client requests logout
   ├── Server clears httpOnly cookie
   └── Client clears local user data
```

### Authorization Layers

```typescript
// Layer 1: Route-level protection
router.get('/protected',
  protect,                 // Verify JWT, attach user
  controller
);

// Layer 2: Role-based access
router.post('/admin-only',
  protect,
  authorizeRoles('admin'), // Check user role
  controller
);

// Layer 3: Resource-level access
async function updateCourse(req, res) {
  const course = await Course.findById(req.params.id);
  
  // Check ownership
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw new Error('Not authorized');
  }
  
  // Proceed with update
}
```

### Security Features

#### 1. Password Security
```typescript
// Hashing on save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Comparison method
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
```

#### 2. JWT Security
- Stored in httpOnly cookies (not accessible to JavaScript)
- Short expiration time (configurable)
- Secure flag in production (HTTPS only)
- SameSite attribute to prevent CSRF

#### 3. Rate Limiting
```typescript
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 500                    // 500 requests per window
});

// Stricter auth endpoint rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20                     // 20 attempts per window
});
```

#### 4. Input Validation
```typescript
// Zod schema validation
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['student', 'instructor'])
});

// Validation middleware
const result = registerSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({
    success: false,
    errors: result.error.errors
  });
}
```

#### 5. Security Headers (Helmet)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy

#### 6. CORS Configuration
```typescript
cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true  // Allow cookies
})
```

---

## Scalability Considerations

### Current Architecture (Monolithic)

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │
│  (Static)   │     │  (Monolith) │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    └─────────────┘
```

### Horizontal Scaling Path

```
                ┌─────────────┐
                │Load Balancer│
                └──────┬──────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  Backend 1  │ │  Backend 2  │ │  Backend N  │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                ┌──────▼──────┐
                │   MongoDB   │
                │  (Replica)  │
                └─────────────┘
```

### Microservices Migration Path

```
┌─────────────────────────────────────┐
│          API Gateway                 │
└─────┬─────┬─────┬─────┬─────┬──────┘
      │     │     │     │     │
      ▼     ▼     ▼     ▼     ▼
   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
   │Auth Service   │Course Service Payment│
   │Service   │Quiz│Notification Service│
   └───┘ └───┘ └───┘ └───┘ └───┘
      │     │     │     │     │
      ▼     ▼     ▼     ▼     ▼
   [DB]  [DB]  [DB]  [DB]  [DB]
```

### Performance Optimizations

#### Backend
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Lean queries, projection, pagination
- **Caching Layer**: Redis for session storage and frequent reads
- **Connection Pooling**: Mongoose connection pool configuration
- **Static Asset CDN**: Upload files to S3/CloudFront

#### Frontend
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Vite tree-shaking and minification
- **Image Optimization**: WebP format, lazy loading, responsive images
- **Asset Caching**: Aggressive caching headers for static assets
- **API Debouncing**: Reduce unnecessary API calls

---

## Design Patterns

### 1. Repository Pattern (Mongoose Models)
```typescript
// Model acts as repository
class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ email, isDeleted: false });
  }
  
  async create(userData: IUser) {
    return User.create(userData);
  }
}
```

### 2. Middleware Pattern (Express)
```typescript
// Composable request processing
router.get('/resource',
  middleware1,    // Authentication
  middleware2,    // Authorization
  middleware3,    // Validation
  controller      // Business logic
);
```

### 3. Factory Pattern (Error Responses)
```typescript
// Consistent error response creation
class ErrorResponse extends Error {
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

### 4. Strategy Pattern (Authentication)
```typescript
// Multiple auth strategies (JWT, OAuth)
interface AuthStrategy {
  authenticate(credentials: any): Promise<User>;
}

class JWTStrategy implements AuthStrategy { /* ... */ }
class GoogleOAuthStrategy implements AuthStrategy { /* ... */ }
```

### 5. Observer Pattern (Notifications)
```typescript
// Event-based notifications
eventEmitter.on('courseEnroll', async (userId, courseId) => {
  await Notification.create({
    user: userId,
    type: 'enrollment',
    message: 'Successfully enrolled in course'
  });
});
```

### 6. Singleton Pattern (Database Connection)
```typescript
// Single database connection instance
let connection: Connection | null = null;

export async function connectDB() {
  if (connection) return connection;
  connection = await mongoose.connect(MONGO_URI);
  return connection;
}
```

---

## Future Enhancements

### Short Term
- [ ] Implement React Query for data fetching
- [ ] Add comprehensive test coverage
- [ ] Implement API rate limiting per user
- [ ] Add request/response logging middleware

### Medium Term
- [ ] Migrate to microservices architecture
- [ ] Implement Redis caching layer
- [ ] Add real-time features (WebSocket)
- [ ] Implement S3 for file storage

### Long Term
- [ ] AI-powered course recommendations
- [ ] Video streaming infrastructure
- [ ] Multi-tenant architecture
- [ ] Event-driven architecture with message queue

---

## References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
- [React Architecture Patterns](https://reactpatterns.com/)
- [RESTful API Design](https://restfulapi.net/)

---

*Last Updated: [Current Date]*
*Document Version: 1.0*
