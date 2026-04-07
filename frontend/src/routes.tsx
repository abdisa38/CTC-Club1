import { createBrowserRouter, Navigate } from "next/navigation";
import { AppLayout } from "./components/layouts/AppLayout";
import { PublicLayout } from "./components/layouts/PublicLayout";

// Pages
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { CourseList } from "./pages/CourseList";
import { CourseDetail } from "./pages/CourseDetail";
import { Profile } from "./pages/Profile";
import { Projects } from "./pages/Projects";
import { Resources } from "./pages/Resources";
import { Quizzes } from "./pages/Quizzes";
import { Community } from "./pages/Community";
import { Support } from "./pages/Support";
import { Leaderboard } from "./pages/Leaderboard";
import { Settings } from "./pages/Settings";

// Student Pages
import { LessonView } from "./pages/student/LessonView";
import { Favorites } from "./pages/student/Favorites";
import { Certificates } from "./pages/student/Certificates";
import { Notifications } from "./pages/student/Notifications";

// Instructor Pages
import { InstructorCourses } from "./pages/instructor/InstructorCourses";
import { CourseEditor } from "./pages/instructor/CourseEditor";
import { InstructorProjects } from "./pages/instructor/InstructorProjects";
import { InstructorAnalytics } from "./pages/instructor/InstructorAnalytics";
import { InstructorStudents } from "./pages/instructor/InstructorStudents";
import { InstructorLessons } from "./pages/instructor/InstructorLessons";
import { InstructorQuizzes } from "./pages/instructor/InstructorQuizzes";
import { InstructorComments } from "./pages/instructor/InstructorComments";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminReports } from "./pages/AdminReports";
import { AdminCourses } from "./pages/admin/AdminCourses";
import { AdminResources } from "./pages/admin/AdminResources";
import { AdminTickets } from "./pages/admin/AdminTickets";
import { AdminAnnouncements } from "./pages/admin/AdminAnnouncements";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminLogs } from "./pages/admin/AdminLogs";
import { AdminModeration } from "./pages/admin/AdminModeration";
import { AdminSettings } from "./pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Auth },
      { path: "register", Component: Auth },
      { path: "features", Component: Home },
      { path: "pricing", Component: Home },
      { path: "events", Component: Home },
    ],
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "courses", Component: CourseList },
      { path: "courses/:id", Component: CourseDetail },
      { path: "courses/:courseId/lessons/:lessonId", Component: LessonView },
      { path: "instructor/courses", Component: InstructorCourses },
      { path: "instructor/courses/new", Component: CourseEditor },
      { path: "instructor/courses/:id/edit", Component: CourseEditor },
      { path: "instructor/courses/:id/lessons", Component: InstructorLessons },
      { path: "instructor/quizzes", Component: InstructorQuizzes },
      { path: "instructor/comments", Component: InstructorComments },
      { path: "instructor/students", Component: InstructorStudents },
      { path: "instructor/projects", Component: InstructorProjects },
      { path: "instructor/analytics", Component: InstructorAnalytics },
      { path: "resources", Component: Resources },
      { path: "quizzes", Component: Quizzes },
      { path: "projects", Component: Projects },
      { path: "support", Component: Support },
      { path: "community", Component: Community },
      { path: "leaderboard", Component: Leaderboard },
      { path: "favorites", Component: Favorites },
      { path: "certificates", Component: Certificates },
      { path: "notifications", Component: Notifications },
      // Admin routes
      { path: "admin", Component: AdminDashboard },
      { path: "admin/users", Component: AdminUsers },
      { path: "admin/courses", Component: AdminCourses },
      { path: "admin/resources", Component: AdminResources },
      { path: "admin/tickets", Component: AdminTickets },
      { path: "admin/analytics", Component: AdminReports },
      { path: "admin/announcements", Component: AdminAnnouncements },
      { path: "admin/events", Component: AdminEvents },
      { path: "admin/logs", Component: AdminLogs },
      { path: "admin/moderation", Component: AdminModeration },
      { path: "admin/settings", Component: AdminSettings },
      { path: "analytics", Component: AdminReports },
      { path: "jobs", Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "*", Component: Dashboard },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);