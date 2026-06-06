# 📡 API Documentation

**Base URL**: `http://localhost:5000/api` (development) or `https://your-domain.com/api` (production)

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Courses](#course-endpoints)
  - [Lessons](#lesson-endpoints)
  - [Quizzes](#quiz-endpoints)
  - [Projects](#project-endpoints)
  - [Dashboard](#dashboard-endpoints)
  - [Community](#community-endpoints)
  - [Events](#event-endpoints)
  - [Payments](#payment-endpoints)
  - [Support](#support-endpoints)
  - [Notifications](#notification-endpoints)

---

## Authentication

### JWT Cookie-Based Authentication

This API uses JWT tokens stored in httpOnly cookies for secure authentication.

#### How it works:
1. User logs in with credentials
2. Server generates JWT and sets it in httpOnly cookie
3. Browser automatically sends cookie with each request
4. Server validates JWT from cookie

#### Headers Required:
```
Content-Type: application/json
```

#### Cookies (set automatically):
```
jwt: <JWT_TOKEN> (httpOnly, secure in production)
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

### General API Endpoints
- **Window**: 15 minutes
- **Max Requests**: 500 requests per window
- **Response**: 429 status with retry information

### Authentication Endpoints
- **Window**: 15 minutes
- **Max Requests**: 20 requests per window
- **Applied to**: `/api/auth/login`, `/api/auth/register`, `/api/auth/password/*`

---

## Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Access**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Validation**:
- `name`: 2-50 characters
- `email`: Valid email format, unique
- `password`: 8-100 characters
- `role`: "student" or "instructor"

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "6547abc123def456789",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": null,
    "isPremium": false,
    "xp": 0,
    "level": 1
  },
  "message": "Registration successful"
}
```

---

### Login

Authenticate user and receive JWT cookie.

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "6547abc123def456789",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": null,
    "isPremium": false
  },
  "message": "Login successful"
}
```

**Sets Cookie**:
```
jwt=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

---

### Get Current User

Retrieve authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Access**: Protected (requires authentication)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "6547abc123def456789",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Passionate learner",
    "isPremium": true,
    "xp": 1250,
    "level": 5,
    "badges": ["badge_id_1", "badge_id_2"],
    "enrolledCourses": ["course_id_1", "course_id_2"]
  }
}
```

---

### Logout

Clear authentication cookie.

**Endpoint**: `POST /api/auth/logout`

**Access**: Protected

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### OAuth Login (Google/GitHub)

Initiate OAuth authentication flow.

**Endpoint**: `GET /api/auth/oauth/:provider`

**Parameters**:
- `provider`: "google" or "github"

**Access**: Public

**Process**:
1. Redirects to OAuth provider
2. User authorizes application
3. Callback to `/api/auth/oauth/:provider/callback`
4. Sets JWT cookie
5. Redirects to frontend dashboard

---

### Forgot Password

Request password reset code.

**Endpoint**: `POST /api/auth/password/forgot`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset code sent to email"
}
```

---

### Reset Password

Reset password using code from email.

**Endpoint**: `POST /api/auth/password/reset`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "resetCode": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Update Profile

Update user profile information.

**Endpoint**: `PUT /api/auth/profile`

**Access**: Protected

**Request Body**:
```json
{
  "name": "John Updated",
  "bio": "New bio text",
  "headline": "Full Stack Developer",
  "avatar": "https://example.com/new-avatar.jpg",
  "socialLinks": {
    "github": "https://github.com/john",
    "linkedin": "https://linkedin.com/in/john",
    "website": "https://john.dev"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "6547abc123def456789",
    "name": "John Updated",
    "email": "john@example.com",
    "bio": "New bio text",
    "headline": "Full Stack Developer",
    "socialLinks": {
      "github": "https://github.com/john",
      "linkedin": "https://linkedin.com/in/john",
      "website": "https://john.dev"
    }
  }
}
```

---

## Course Endpoints

### List Courses

Get paginated list of courses with filters.

**Endpoint**: `GET /api/courses`

**Access**: Public (shows published courses) / Protected (shows draft courses for instructors)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `category`: Filter by category
- `level`: Filter by level (beginner, intermediate, advanced)
- `search`: Search in title and description
- `sort`: Sort field (title, rating, createdAt, price)
- `order`: Sort order (asc, desc)
- `instructor`: Filter by instructor ID

**Example**: `GET /api/courses?category=web-development&level=beginner&page=1&limit=10`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "course_id_1",
        "title": "Introduction to Web Development",
        "slug": "intro-web-dev",
        "shortDescription": "Learn the basics of web development",
        "coverImage": "https://example.com/cover.jpg",
        "category": "web-development",
        "level": "beginner",
        "price": 0,
        "currency": "USD",
        "accessMode": "open",
        "rating": 4.7,
        "numReviews": 150,
        "totalDuration": 480,
        "instructor": {
          "_id": "instructor_id",
          "name": "Jane Instructor",
          "avatar": "https://example.com/avatar.jpg"
        },
        "students": ["student_id_1", "student_id_2"],
        "isPublished": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCourses": 47,
      "limit": 10
    }
  }
}
```

---

### Get Course Details

Get detailed information about a specific course.

**Endpoint**: `GET /api/courses/:id`

**Access**: Public (for published courses) / Protected (for enrollment status)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "course_id_1",
    "title": "Introduction to Web Development",
    "slug": "intro-web-dev",
    "description": "Complete course description with markdown support...",
    "shortDescription": "Learn the basics",
    "coverImage": "https://example.com/cover.jpg",
    "category": "web-development",
    "tags": ["html", "css", "javascript"],
    "level": "beginner",
    "price": 0,
    "currency": "USD",
    "accessMode": "open",
    "prerequisites": ["Basic computer skills"],
    "xpReward": 500,
    "totalDuration": 480,
    "rating": 4.7,
    "numReviews": 150,
    "instructor": {
      "_id": "instructor_id",
      "name": "Jane Instructor",
      "email": "jane@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "headline": "Senior Web Developer"
    },
    "students": ["student_id_1", "student_id_2"],
    "isEnrolled": true,
    "isPublished": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

---

### Create Course

Create a new course (Instructor only).

**Endpoint**: `POST /api/courses`

**Access**: Protected (Instructor, Admin)

**Request Body**:
```json
{
  "title": "Advanced React Patterns",
  "description": "Deep dive into React patterns...",
  "shortDescription": "Master React patterns",
  "category": "web-development",
  "tags": ["react", "javascript", "frontend"],
  "level": "advanced",
  "price": 49.99,
  "currency": "USD",
  "accessMode": "paid",
  "prerequisites": ["React basics", "JavaScript ES6+"],
  "xpReward": 1000,
  "coverImage": "https://example.com/cover.jpg"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "new_course_id",
    "title": "Advanced React Patterns",
    "slug": "advanced-react-patterns",
    "instructor": "instructor_id",
    "status": "draft",
    "isPublished": false,
    "createdAt": "2024-02-01T10:00:00Z"
  },
  "message": "Course created successfully"
}
```

---

### Update Course

Update course information (Instructor/Admin only).

**Endpoint**: `PUT /api/courses/:id`

**Access**: Protected (Course instructor or Admin)

**Request Body**: (any fields to update)
```json
{
  "title": "Updated Course Title",
  "price": 39.99,
  "isPublished": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "course_id",
    "title": "Updated Course Title",
    "price": 39.99,
    "isPublished": true,
    "updatedAt": "2024-02-05T14:30:00Z"
  },
  "message": "Course updated successfully"
}
```

---

### Delete Course

Soft delete a course (Instructor/Admin only).

**Endpoint**: `DELETE /api/courses/:id`

**Access**: Protected (Course instructor or Admin)

**Response** (200):
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### Enroll in Course

Enroll the authenticated user in a course.

**Endpoint**: `POST /api/courses/:id/enroll`

**Access**: Protected (Student)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "courseId": "course_id",
    "userId": "user_id",
    "enrolledAt": "2024-02-10T09:00:00Z",
    "progress": 0
  },
  "message": "Enrolled successfully"
}
```

**Error** (409):
```json
{
  "success": false,
  "message": "Already enrolled in this course"
}
```

---

### Get Course Reviews

Get reviews for a specific course.

**Endpoint**: `GET /api/courses/:id/reviews`

**Access**: Public

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort by rating or date

**Response** (200):
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "user": {
          "_id": "user_id",
          "name": "Student Name",
          "avatar": "https://example.com/avatar.jpg"
        },
        "course": "course_id",
        "rating": 5,
        "comment": "Excellent course! Learned a lot.",
        "createdAt": "2024-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReviews": 25
    },
    "averageRating": 4.7
  }
}
```

---

### Submit Course Review

Submit a review for an enrolled course.

**Endpoint**: `POST /api/courses/:id/reviews`

**Access**: Protected (Enrolled students only)

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Amazing course! Highly recommended."
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "review_id",
    "user": "user_id",
    "course": "course_id",
    "rating": 5,
    "comment": "Amazing course! Highly recommended.",
    "createdAt": "2024-02-15T11:00:00Z"
  },
  "message": "Review submitted successfully"
}
```

---

## Lesson Endpoints

### Get Course Lessons

Get all lessons for a specific course.

**Endpoint**: `GET /api/courses/:courseId/lessons`

**Access**: Protected (Enrolled students, Course instructor, Admin)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "lesson_id",
      "course": "course_id",
      "title": "Introduction to HTML",
      "slug": "intro-html",
      "phase": "Foundation",
      "weekNumber": 1,
      "topicName": "Web Basics",
      "order": 1,
      "description": "Learn HTML fundamentals",
      "videoUrls": [
        "https://example.com/video1.mp4"
      ],
      "attachments": [
        {
          "name": "Cheat Sheet.pdf",
          "url": "https://example.com/cheatsheet.pdf",
          "type": "pdf"
        }
      ],
      "checklist": [
        "Watch video",
        "Complete exercises",
        "Review examples"
      ],
      "estimatedMinutes": 45,
      "isPublished": true,
      "isFree": true
    }
  ]
}
```

---

### Get Single Lesson

Get detailed information about a specific lesson.

**Endpoint**: `GET /api/lessons/:id`

**Access**: Protected (Enrolled students, Course instructor, Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "lesson_id",
    "course": {
      "_id": "course_id",
      "title": "Course Title"
    },
    "title": "Introduction to HTML",
    "slug": "intro-html",
    "phase": "Foundation",
    "weekNumber": 1,
    "topicName": "Web Basics",
    "order": 1,
    "description": "Detailed lesson description...",
    "videoUrls": ["https://example.com/video1.mp4"],
    "attachments": [...],
    "checklist": [...],
    "externalLinks": [
      {
        "title": "MDN Web Docs",
        "url": "https://developer.mozilla.org"
      }
    ],
    "estimatedMinutes": 45,
    "isPublished": true,
    "isFree": true,
    "progress": {
      "completed": false,
      "checklistCompleted": [0, 2],
      "videoProgress": 75
    }
  }
}
```

---

### Create Lesson

Create a new lesson for a course (Instructor only).

**Endpoint**: `POST /api/courses/:courseId/lessons`

**Access**: Protected (Course instructor or Admin)

**Request Body**:
```json
{
  "title": "CSS Flexbox Layout",
  "phase": "Foundation",
  "weekNumber": 2,
  "topicName": "CSS Basics",
  "order": 3,
  "description": "Master CSS Flexbox...",
  "videoUrls": [
    "https://example.com/flexbox.mp4"
  ],
  "attachments": [
    {
      "name": "Flexbox Guide.pdf",
      "url": "https://example.com/guide.pdf",
      "type": "pdf"
    }
  ],
  "checklist": [
    "Watch video tutorial",
    "Complete flexbox exercises"
  ],
  "estimatedMinutes": 60,
  "isFree": false
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "new_lesson_id",
    "course": "course_id",
    "title": "CSS Flexbox Layout",
    "slug": "css-flexbox-layout",
    "isPublished": false,
    "createdAt": "2024-02-01T10:00:00Z"
  },
  "message": "Lesson created successfully"
}
```

---

### Update Lesson Progress

Mark lesson as completed or update progress.

**Endpoint**: `PUT /api/lessons/:id/progress`

**Access**: Protected (Enrolled students)

**Request Body**:
```json
{
  "completed": true,
  "checklistCompleted": [0, 1, 2],
  "videoProgress": 100
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "lessonId": "lesson_id",
    "completed": true,
    "xpEarned": 50,
    "courseProgress": 45
  },
  "message": "Progress updated successfully"
}
```

---

## Dashboard Endpoints

### Student Dashboard

Get student dashboard data with progress, enrolled courses, and recommendations.

**Endpoint**: `GET /api/dashboard/student`

**Access**: Protected (Student)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "xp": 1250,
      "level": 5,
      "isPremium": true
    },
    "enrolledCourses": [
      {
        "course": {
          "_id": "course_id",
          "title": "Course Title",
          "coverImage": "https://example.com/cover.jpg"
        },
        "progress": 65,
        "lastAccessed": "2024-02-10T14:30:00Z",
        "completedLessons": 13,
        "totalLessons": 20
      }
    ],
    "recentActivity": [...],
    "recommendations": [...],
    "upcomingDeadlines": [...],
    "achievements": {
      "badges": [...],
      "recentBadges": [...]
    }
  }
}
```

---

### Instructor Dashboard

Get instructor dashboard with course analytics.

**Endpoint**: `GET /api/dashboard/instructor`

**Access**: Protected (Instructor)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalCourses": 5,
    "totalStudents": 342,
    "totalRevenue": 15420.50,
    "averageRating": 4.6,
    "courses": [
      {
        "course": {
          "_id": "course_id",
          "title": "Course Title"
        },
        "enrolledStudents": 89,
        "completionRate": 72,
        "revenue": 4450.00,
        "rating": 4.7,
        "recentReviews": 12
      }
    ],
    "recentEnrollments": [...],
    "pendingSubmissions": [...]
  }
}
```

---

*This is a comprehensive API reference. For additional endpoints (Quizzes, Projects, Events, Payments, etc.), see the full documentation or explore the API using tools like Postman or Swagger UI.*

---

## Testing the API

### Using cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'

# Login (save cookie)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user (using saved cookie)
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Using Postman

1. Import the Postman collection from `docs/postman/CTC-Club-API.postman_collection.json`
2. Set up environment variables
3. Test endpoints with automatic cookie handling

---

*Last Updated: [Current Date]*
*API Version: 1.0*
