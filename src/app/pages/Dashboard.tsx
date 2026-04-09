import { Suspense, lazy, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";

const LazyAdminDashboard = lazy(() =>
  import("./admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard }))
);
const LazyInstructorDashboard = lazy(() =>
  import("./InstructorDashboard").then((module) => ({ default: module.InstructorDashboard }))
);
const LazyStudentDashboard = lazy(() =>
  import("./StudentDashboard").then((module) => ({ default: module.StudentDashboard }))
);

function LoadingView() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
}

export function Dashboard() {
  const { role } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const payload = await apiService.getDashboardMetrics();
        setMetrics(payload);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard metrics");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMetrics();
  }, []);

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingView />}>
      {role === "admin" ? <LazyAdminDashboard metrics={metrics} /> : null}
      {role === "instructor" ? <LazyInstructorDashboard metrics={metrics} /> : null}
      {role !== "admin" && role !== "instructor" ? <LazyStudentDashboard metrics={metrics} /> : null}
    </Suspense>
  );
}
