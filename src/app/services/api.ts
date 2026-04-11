import api from "../utils/api";

export type Role = "student" | "instructor" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  xp?: number;
  level?: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  coverImage?: string;
  status?: "draft" | "published" | "archived";
  level?: "beginner" | "intermediate" | "advanced";
  price: number;
  instructor?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  students?: Array<string | { _id: string }>;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  course?: string;
  order?: number;
  duration?: number | string;
  isPublished?: boolean;
  attachments?: Array<{
    title?: string;
    url: string;
    fileType?: string;
  }>;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  course?: { _id: string; title: string } | string;
  instructions?: string;
  requirements?: string[];
  xpReward?: number;
  maxPoints?: number;
  deadline?: string;
  isPublished?: boolean;
  createdAt?: string;
}

export interface ProjectSubmission {
  _id: string;
  student?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  project?: {
    _id: string;
    title: string;
    maxPoints?: number;
    xpReward?: number;
  };
  course?: {
    _id: string;
    title: string;
  };
  repoUrl?: string;
  liveUrl?: string;
  comments?: string;
  grade?: number;
  feedback?: string;
  status: "pending" | "submitted" | "under_review" | "graded";
  xpEarned?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface TicketMessage {
  sender: string | { _id: string; name: string; avatar?: string; role?: Role };
  message: string;
  isAdminReply: boolean;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  category: "technical" | "billing" | "course_content" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  user?: { _id: string; name: string; email?: string; avatar?: string };
  assignedTo?: { _id: string; name: string; email?: string };
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  course?: string | { _id: string; title: string };
  category: "general" | "qna" | "showcase" | "announcement";
  tags: string[];
  user?: { _id: string; name: string; avatar?: string; role?: Role };
  upvotes?: string[];
  downvotes?: string[];
  repliesCount?: number;
  isPinned?: boolean;
  createdAt: string;
}

export interface CommunityReply {
  _id: string;
  post: string;
  content: string;
  user?: { _id: string; name: string; avatar?: string; role?: Role };
  createdAt: string;
}

export interface InstructorStudentRow {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt?: string;
  lastActiveAt?: string | null;
  isActive: boolean;
  progress: number;
  status: "active" | "inactive" | "completed";
  courses: Array<{ _id: string; title: string }>;
}

export interface InstructorStudentsData {
  summary: {
    totalEnrolled: number;
    avgCompletionRate: number;
    activeThisWeek: number;
  };
  courses: Array<{ _id: string; title: string }>;
  students: InstructorStudentRow[];
}

export interface InstructorAnalyticsTrend {
  month: string;
  date: string;
  revenue: number;
  enrollments: number;
  completions: number;
}

export interface InstructorAnalyticsStatusItem {
  name: string;
  value: number;
}

export interface InstructorAnalyticsCourseItem {
  courseId: string;
  name: string;
  enrollments: number;
  completions: number;
  revenue: number;
  rating: number;
  reviews: number;
}

export interface InstructorAnalyticsData {
  summary: {
    totalRevenue: number;
    totalEnrollments: number;
    avgCourseRating: number;
    courseCompletions: number;
  };
  trends: InstructorAnalyticsTrend[];
  progressStatus: InstructorAnalyticsStatusItem[];
  coursePerformance: InstructorAnalyticsCourseItem[];
  generatedAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "system" | "course_update" | "project_graded" | "achievement" | "message";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  role: Role;
}

export interface DashboardPublicStats {
  activeStudents: number;
  videoCourses: number;
  instructors: number;
  certificates: number;
}

export interface FavoriteCourseMutationResult {
  courseId: string;
  isFavorite: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  isPublished: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSearchItem {
  id: string;
  type: "user" | "course" | "ticket" | "announcement" | "event";
  title: string;
  subtitle?: string;
  href: string;
}

export interface AdminSearchData {
  query: string;
  items: AdminSearchItem[];
  counts: {
    users: number;
    courses: number;
    tickets: number;
    announcements: number;
    events: number;
  };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
}

export interface UploadedFile {
  url: string;
  fileType?: string;
  size: number;
  originalName: string;
  filename: string;
}

export type QuizQuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface QuizQuestion {
  _id?: string;
  questionText: string;
  type: QuizQuestionType;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course?: { _id: string; title: string; coverImage?: string } | string;
  lesson?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  xpReward?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizResultItem {
  _id: string;
  user?: { _id: string; name: string; email?: string; avatar?: string };
  quiz?: string;
  course?: string;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  timeSpent: number;
  xpEarned: number;
  createdAt?: string;
}

const asObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === "object") {
    return value as Record<string, any>;
  }
  return {};
};

const pickData = <T>(payload: unknown, fallbackKeys: string[] = []): T => {
  const obj = asObject(payload);

  if (Object.prototype.hasOwnProperty.call(obj, "data")) {
    return obj.data as T;
  }

  for (const key of fallbackKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key] as T;
    }
  }

  return payload as T;
};

const pickPaginated = <T>(payload: unknown, fallbackKeys: string[] = []): Paginated<T> => {
  const obj = asObject(payload);
  const list = pickData<T[]>(payload, fallbackKeys);

  return {
    items: Array.isArray(list) ? list : [],
    page: Number(obj.page) || 1,
    pages: Number(obj.pages) || 1,
    total: Number(obj.total) || (Array.isArray(list) ? list.length : 0),
  };
};

export interface GetCoursesParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: "student" | "instructor" | "admin" | "all";
  isActive?: boolean;
}

export const apiService = {
  async loginUser(email: string, password: string): Promise<AuthUser> {
    const res = await api.post("/auth/login", { email, password });
    return pickData<AuthUser>(res.data);
  },

  async registerUser(input: { name: string; email: string; password: string }): Promise<AuthUser> {
    const res = await api.post("/auth/register", input);
    return pickData<AuthUser>(res.data);
  },

  async logoutUser(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<AuthUser> {
    const res = await api.get("/auth/profile");
    return pickData<AuthUser>(res.data);
  },

  async getFavoriteCourses(): Promise<Course[]> {
    const res = await api.get("/auth/favorites/courses");
    return pickData<Course[]>(res.data);
  },

  async addFavoriteCourse(courseId: string): Promise<FavoriteCourseMutationResult> {
    const res = await api.post(`/auth/favorites/courses/${courseId}`);
    return pickData<FavoriteCourseMutationResult>(res.data);
  },

  async removeFavoriteCourse(courseId: string): Promise<FavoriteCourseMutationResult> {
    const res = await api.delete(`/auth/favorites/courses/${courseId}`);
    return pickData<FavoriteCourseMutationResult>(res.data);
  },

  async getCourses(params: GetCoursesParams = {}): Promise<Paginated<Course>> {
    const res = await api.get("/courses", { params });
    return pickPaginated<Course>(res.data, ["courses"]);
  },

  async getCourseById(courseId: string): Promise<Course> {
    const res = await api.get(`/courses/${courseId}`);
    return pickData<Course>(res.data);
  },

  async createCourse(input: {
    title: string;
    description: string;
    category: string;
    price: number;
    coverImage?: string;
  }): Promise<Course> {
    const res = await api.post("/courses", input);
    return pickData<Course>(res.data);
  },

  async updateCourse(
    courseId: string,
    input: Partial<{
      title: string;
      description: string;
      category: string;
      price: number;
      coverImage?: string;
    }>
  ): Promise<Course> {
    const res = await api.put(`/courses/${courseId}`, input);
    return pickData<Course>(res.data);
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/courses/${courseId}`);
  },

  async enrollCourse(courseId: string): Promise<Course> {
    const res = await api.post(`/courses/${courseId}/enroll`);
    return pickData<Course>(res.data);
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    const res = await api.get(`/courses/${courseId}/lessons`);
    return pickData<Lesson[]>(res.data);
  },

  async createLesson(
    courseId: string,
    input: {
      title: string;
      content: string;
      videoUrl?: string;
      order?: number;
      duration?: number;
      attachments?: Array<{ title?: string; url: string; fileType?: string }>;
      isPublished?: boolean;
    }
  ): Promise<Lesson> {
    const res = await api.post(`/courses/${courseId}/lessons`, input);
    return pickData<Lesson>(res.data);
  },

  async updateLesson(
    courseId: string,
    lessonId: string,
    input: Partial<{
      title: string;
      content: string;
      videoUrl?: string;
      order?: number;
      duration?: number;
      attachments?: Array<{ title?: string; url: string; fileType?: string }>;
      isPublished?: boolean;
    }>
  ): Promise<Lesson> {
    const res = await api.put(`/courses/${courseId}/lessons/${lessonId}`, input);
    return pickData<Lesson>(res.data);
  },

  async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
  },

  async uploadLessonVideo(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("video", file);

    const res = await api.post("/uploads/video", formData);
    return pickData<UploadedFile>(res.data);
  },

  async uploadLessonResource(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("resource", file);

    const res = await api.post("/uploads/resource", formData);
    return pickData<UploadedFile>(res.data);
  },

  async getQuizzes(): Promise<Quiz[]> {
    const res = await api.get("/quizzes");
    return pickData<Quiz[]>(res.data);
  },

  async getQuizById(quizId: string): Promise<Quiz> {
    const res = await api.get(`/quizzes/${quizId}`);
    return pickData<Quiz>(res.data);
  },

  async createQuiz(input: {
    title: string;
    description?: string;
    courseId: string;
    lessonId?: string;
    questions?: QuizQuestion[];
    passingScore?: number;
    timeLimit?: number;
    maxAttempts?: number;
    xpReward?: number;
    isPublished?: boolean;
  }): Promise<Quiz> {
    const res = await api.post("/quizzes", input);
    return pickData<Quiz>(res.data);
  },

  async updateQuiz(
    quizId: string,
    input: Partial<{
      title: string;
      description?: string;
      courseId: string;
      lessonId?: string;
      passingScore?: number;
      timeLimit?: number;
      maxAttempts?: number;
      xpReward?: number;
      isPublished?: boolean;
    }>
  ): Promise<Quiz> {
    const res = await api.put(`/quizzes/${quizId}`, input);
    return pickData<Quiz>(res.data);
  },

  async deleteQuiz(quizId: string): Promise<void> {
    await api.delete(`/quizzes/${quizId}`);
  },

  async addQuizQuestion(
    quizId: string,
    input: {
      questionText: string;
      type: QuizQuestionType;
      options?: string[];
      correctAnswerIndex?: number;
      correctAnswerText?: string;
      points?: number;
    }
  ): Promise<Quiz> {
    const res = await api.post(`/quizzes/${quizId}/questions`, input);
    return pickData<Quiz>(res.data);
  },

  async updateQuizQuestion(
    quizId: string,
    questionId: string,
    input: Partial<{
      questionText: string;
      type: QuizQuestionType;
      options?: string[];
      correctAnswerIndex?: number;
      correctAnswerText?: string;
      points?: number;
    }>
  ): Promise<Quiz> {
    const res = await api.put(`/quizzes/${quizId}/questions/${questionId}`, input);
    return pickData<Quiz>(res.data);
  },

  async deleteQuizQuestion(quizId: string, questionId: string): Promise<Quiz> {
    const res = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return pickData<Quiz>(res.data);
  },

  async getQuizResults(quizId: string): Promise<QuizResultItem[]> {
    const res = await api.get(`/quizzes/${quizId}/results`);
    return pickData<QuizResultItem[]>(res.data);
  },

  async submitQuiz(
    quizId: string,
    payload: { answers: Array<{ questionId?: string; userAnswerIndex?: number; userAnswerText?: string }>; timeSpent?: number }
  ): Promise<QuizResultItem> {
    const res = await api.post(`/quizzes/${quizId}/submit`, payload);
    return pickData<QuizResultItem>(res.data);
  },

  async getProjects(courseId?: string): Promise<Project[]> {
    const res = await api.get("/projects", { params: courseId ? { courseId } : undefined });
    return pickData<Project[]>(res.data);
  },

  async createProject(input: {
    title: string;
    description: string;
    courseId: string;
    lessonId?: string;
    instructions?: string;
    requirements?: string[];
    xpReward?: number;
    maxPoints?: number;
    deadline?: string;
    isPublished?: boolean;
  }): Promise<Project> {
    const res = await api.post("/projects", input);
    return pickData<Project>(res.data);
  },

  async getProjectSubmissions(projectId?: string): Promise<ProjectSubmission[]> {
    const res = await api.get("/projects/submissions", { params: projectId ? { projectId } : undefined });
    return pickData<ProjectSubmission[]>(res.data);
  },

  async submitProject(
    projectId: string,
    payload: { repoUrl?: string; liveUrl?: string; files?: string[]; comments?: string }
  ): Promise<ProjectSubmission> {
    const res = await api.post(`/projects/${projectId}/submit`, payload);
    return pickData<ProjectSubmission>(res.data);
  },

  async reviewProject(submissionId: string, payload: { grade: number; feedback: string }): Promise<ProjectSubmission> {
    const res = await api.put(`/projects/submissions/${submissionId}/review`, payload);
    return pickData<ProjectSubmission>(res.data);
  },

  async getSupportTickets(params: { page?: number; limit?: number } = {}): Promise<Paginated<Ticket>> {
    const res = await api.get("/support/tickets", { params });
    return pickPaginated<Ticket>(res.data, ["tickets"]);
  },

  async getSupportTicketById(ticketId: string): Promise<Ticket> {
    const res = await api.get(`/support/tickets/${ticketId}`);
    return pickData<Ticket>(res.data);
  },

  async createSupportTicket(input: {
    subject: string;
    category: "technical" | "billing" | "course_content" | "other";
    priority?: "low" | "medium" | "high" | "urgent";
    message: string;
  }): Promise<Ticket> {
    const res = await api.post("/support/tickets", input);
    return pickData<Ticket>(res.data);
  },

  async replySupportTicket(ticketId: string, message: string): Promise<Ticket> {
    const res = await api.post(`/support/tickets/${ticketId}/reply`, { message });
    return pickData<Ticket>(res.data);
  },

  async updateSupportTicketStatus(ticketId: string, status: Ticket["status"]): Promise<Ticket> {
    const res = await api.put(`/support/tickets/${ticketId}/status`, { status });
    return pickData<Ticket>(res.data);
  },

  async getUsers(params: GetUsersParams = {}): Promise<Paginated<AuthUser>> {
    const res = await api.get("/auth/users", { params });
    const data = pickData<AuthUser[]>(res.data);
    const meta = asObject(res.data).meta;
    const pagination = asObject(meta?.pagination);

    return {
      items: Array.isArray(data) ? data : [],
      page: Number(pagination.page) || Number(asObject(res.data).page) || 1,
      pages: Number(pagination.pages) || Number(asObject(res.data).pages) || 1,
      total: Number(pagination.total) || Number(asObject(res.data).total) || (Array.isArray(data) ? data.length : 0),
    };
  },

  async updateUserRole(userId: string, role: Role): Promise<AuthUser> {
    const res = await api.put(`/auth/users/${userId}/role`, { role });
    return pickData<AuthUser>(res.data);
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<AuthUser> {
    const res = await api.put(`/auth/users/${userId}/status`, { isActive });
    return pickData<AuthUser>(res.data);
  },

  async softDeleteUser(userId: string): Promise<void> {
    await api.delete(`/auth/users/${userId}`);
  },

  async getActivityLogs(): Promise<any[]> {
    const res = await api.get("/auth/activity-logs");
    return pickData<any[]>(res.data);
  },

  async getDashboardMetrics(): Promise<any> {
    const res = await api.get("/dashboard/metrics");
    return pickData<any>(res.data);
  },

  async adminGlobalSearch(query: string): Promise<AdminSearchData> {
    const res = await api.get("/dashboard/admin/search", { params: { q: query } });
    return pickData<AdminSearchData>(res.data);
  },

  async getInstructorStudents(params: { keyword?: string; courseId?: string; instructorId?: string } = {}): Promise<InstructorStudentsData> {
    const res = await api.get("/dashboard/instructor/students", { params });
    return pickData<InstructorStudentsData>(res.data);
  },

  async getInstructorAnalytics(params: { instructorId?: string } = {}): Promise<InstructorAnalyticsData> {
    const res = await api.get("/dashboard/instructor/analytics", { params });
    return pickData<InstructorAnalyticsData>(res.data);
  },

  async getAnalytics(): Promise<any> {
    const res = await api.get("/dashboard/analytics");
    return pickData<any>(res.data);
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await api.get("/dashboard/leaderboard");
    return pickData<LeaderboardEntry[]>(res.data);
  },

  async getDashboardResources(): Promise<any[]> {
    const res = await api.get("/dashboard/resources");
    return pickData<any[]>(res.data);
  },

  async getPublicStats(): Promise<DashboardPublicStats> {
    const res = await api.get("/dashboard/public-stats");
    return pickData<DashboardPublicStats>(res.data);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await api.get("/dashboard/announcements");
    return pickData<Announcement[]>(res.data);
  },

  async createAnnouncement(input: { title: string; content: string }): Promise<CommunityPost> {
    const res = await api.post("/community/posts", {
      title: input.title,
      content: input.content,
      category: "announcement",
      tags: ["announcement", "admin"],
    });
    return pickData<CommunityPost>(res.data);
  },

  async deleteAnnouncement(postId: string): Promise<void> {
    await api.delete(`/community/posts/${postId}`);
  },

  async getEvents(params: { keyword?: string; upcoming?: boolean; includeUnpublished?: boolean } = {}): Promise<EventItem[]> {
    const res = await api.get("/events", { params });
    return pickData<EventItem[]>(res.data);
  },

  async createEvent(input: {
    title: string;
    description: string;
    location?: string;
    startsAt: string;
    endsAt?: string;
    isPublished?: boolean;
  }): Promise<EventItem> {
    const res = await api.post("/events", input);
    return pickData<EventItem>(res.data);
  },

  async updateEvent(
    eventId: string,
    input: Partial<{
      title: string;
      description: string;
      location?: string;
      startsAt: string;
      endsAt?: string;
      isPublished?: boolean;
    }>
  ): Promise<EventItem> {
    const res = await api.put(`/events/${eventId}`, input);
    return pickData<EventItem>(res.data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}`);
  },

  async getCommunityPosts(params: { page?: number; limit?: number; keyword?: string; category?: string; course?: string; managed?: boolean } = {}): Promise<Paginated<CommunityPost>> {
    const res = await api.get("/community/posts", { params });
    return pickPaginated<CommunityPost>(res.data, ["posts"]);
  },

  async createCommunityPost(input: { title: string; content: string; category?: string; tags?: string[]; course?: string }): Promise<CommunityPost> {
    const res = await api.post("/community/posts", input);
    return pickData<CommunityPost>(res.data);
  },

  async voteCommunityPost(postId: string, vote: "up" | "down"): Promise<{ upvotes: number; downvotes: number }> {
    const res = await api.post(`/community/posts/${postId}/vote`, { vote });
    return pickData<{ upvotes: number; downvotes: number }>(res.data);
  },

  async getCommunityReplies(postId: string): Promise<CommunityReply[]> {
    const res = await api.get(`/community/posts/${postId}/replies`);
    return pickData<CommunityReply[]>(res.data);
  },

  async addCommunityReply(postId: string, content: string): Promise<CommunityReply> {
    const res = await api.post(`/community/posts/${postId}/replies`, { content });
    return pickData<CommunityReply>(res.data);
  },

  async pinCommunityPost(postId: string, isPinned: boolean): Promise<CommunityPost> {
    const res = await api.patch(`/community/posts/${postId}/pin`, { isPinned });
    return pickData<CommunityPost>(res.data);
  },

  async deleteCommunityPost(postId: string): Promise<void> {
    await api.delete(`/community/posts/${postId}`);
  },

  async getNotifications(params: { page?: number; limit?: number } = {}): Promise<Paginated<NotificationItem>> {
    const res = await api.get("/notifications", { params });
    return pickPaginated<NotificationItem>(res.data, ["notifications"]);
  },

  async markNotificationRead(notificationId: string): Promise<NotificationItem> {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return pickData<NotificationItem>(res.data);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async broadcastNotification(input: {
    title: string;
    message: string;
    type?: "system" | "course_update" | "project_graded" | "achievement" | "message";
    role?: Role;
  }): Promise<{ count: number }> {
    const res = await api.post("/notifications/broadcast", input);
    return pickData<{ count: number }>(res.data);
  },
};

export default apiService;
