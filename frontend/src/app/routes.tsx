import { createBrowserRouter, Navigate, useParams } from "react-router";
import { AppLayout } from "./components/layouts/AppLayout";
import { PublicLayout } from "./components/layouts/PublicLayout";

const lazyComponent = <T extends Record<string, any>>(loader: () => Promise<T>, exportName: keyof T) => {
  return async () => {
    const module = await loader();
    return { Component: module[exportName] };
  };
};

function RedirectLegacyInstructorLessons() {
  const { id } = useParams();
  return <Navigate to={id ? `/app/courses/${id}` : "/app/instructor/courses"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, lazy: lazyComponent(() => import("./pages/Home"), "Home") },
      { path: "login", lazy: lazyComponent(() => import("./pages/Auth"), "Auth") },
      { path: "register", lazy: lazyComponent(() => import("./pages/Auth"), "Auth") },
      { path: "features", lazy: lazyComponent(() => import("./pages/Home"), "Home") },
      { path: "pricing", lazy: lazyComponent(() => import("./pages/Home"), "Home") },
      { path: "events", lazy: lazyComponent(() => import("./pages/Home"), "Home") },
    ],
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", lazy: lazyComponent(() => import("./pages/Dashboard"), "Dashboard") },
      { path: "courses", lazy: lazyComponent(() => import("./pages/CourseList"), "CourseList") },
      { path: "courses/:id", lazy: lazyComponent(() => import("./pages/CourseDetail"), "CourseDetail") },
      { path: "courses/:courseId/lessons/:lessonId", lazy: lazyComponent(() => import("./pages/student/LessonView"), "LessonView") },
      { path: "instructor/courses", lazy: lazyComponent(() => import("./pages/instructor/InstructorCourses"), "InstructorCourses") },
      { path: "instructor/courses/new", lazy: lazyComponent(() => import("./pages/instructor/CourseEditor"), "CourseEditor") },
      { path: "instructor/courses/:id/edit", lazy: lazyComponent(() => import("./pages/instructor/CourseEditor"), "CourseEditor") },
      { path: "instructor/courses/:id/lessons", element: <RedirectLegacyInstructorLessons /> },
      { path: "instructor/quizzes", element: <Navigate to="/app/instructor/courses" replace /> },
      { path: "instructor/comments", lazy: lazyComponent(() => import("./pages/instructor/InstructorComments"), "InstructorComments") },
      { path: "instructor/students", lazy: lazyComponent(() => import("./pages/instructor/InstructorStudents"), "InstructorStudents") },
      { path: "instructor/projects", element: <Navigate to="/app/instructor/courses" replace /> },
      { path: "instructor/analytics", lazy: lazyComponent(() => import("./pages/instructor/InstructorAnalytics"), "InstructorAnalytics") },
      { path: "resources", element: <Navigate to="/app/courses" replace /> },
      { path: "quizzes", element: <Navigate to="/app/courses" replace /> },
      { path: "projects", element: <Navigate to="/app/courses" replace /> },
      { path: "support", lazy: lazyComponent(() => import("./pages/Support"), "Support") },
      { path: "community", lazy: lazyComponent(() => import("./pages/Community"), "Community") },
      { path: "leaderboard", lazy: lazyComponent(() => import("./pages/Leaderboard"), "Leaderboard") },
      { path: "favorites", lazy: lazyComponent(() => import("./pages/student/Favorites"), "Favorites") },
      { path: "notifications", lazy: lazyComponent(() => import("./pages/student/Notifications"), "Notifications") },
      // Admin routes
      { path: "admin", lazy: lazyComponent(() => import("./pages/admin/AdminDashboard"), "AdminDashboard") },
      { path: "admin/users", lazy: lazyComponent(() => import("./pages/AdminUsers"), "AdminUsers") },
      { path: "admin/courses", lazy: lazyComponent(() => import("./pages/admin/AdminCourses"), "AdminCourses") },
      { path: "admin/resources", lazy: lazyComponent(() => import("./pages/admin/AdminResources"), "AdminResources") },
      { path: "admin/tickets", lazy: lazyComponent(() => import("./pages/admin/AdminTickets"), "AdminTickets") },
      { path: "admin/analytics", lazy: lazyComponent(() => import("./pages/AdminReports"), "AdminReports") },
      { path: "admin/announcements", lazy: lazyComponent(() => import("./pages/admin/AdminAnnouncements"), "AdminAnnouncements") },
      { path: "admin/events", lazy: lazyComponent(() => import("./pages/admin/AdminEvents"), "AdminEvents") },
      { path: "admin/logs", lazy: lazyComponent(() => import("./pages/admin/AdminLogs"), "AdminLogs") },
      { path: "admin/moderation", lazy: lazyComponent(() => import("./pages/admin/AdminModeration"), "AdminModeration") },
      { path: "admin/settings", lazy: lazyComponent(() => import("./pages/admin/AdminSettings"), "AdminSettings") },
      { path: "analytics", lazy: lazyComponent(() => import("./pages/AdminReports"), "AdminReports") },
      { path: "jobs", lazy: lazyComponent(() => import("./pages/Dashboard"), "Dashboard") },
      { path: "profile", lazy: lazyComponent(() => import("./pages/Settings"), "Settings") },
      { path: "premium-return", lazy: lazyComponent(() => import("./pages/PremiumReturn"), "PremiumReturn") },
      { path: "settings", lazy: lazyComponent(() => import("./pages/Settings"), "Settings") },
      { path: "*", lazy: lazyComponent(() => import("./pages/Dashboard"), "Dashboard") },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);