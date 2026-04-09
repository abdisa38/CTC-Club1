import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Award, Download, Calendar, BookOpen, Trophy, Loader2 } from "lucide-react";
import apiService, { Course } from "../../services/api";

type CertificateItem = {
  id: string;
  title: string;
  instructor: string;
  completedDate: string;
  credentialId: string;
};

export function Certificates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metrics, courseData] = await Promise.all([
          apiService.getDashboardMetrics(),
          apiService.getCourses({ limit: 50, status: "published" }),
        ]);

        setXp(Number(metrics?.xp || 0));
        setLevel(Number(metrics?.level || 1));
        setCompletedCourses(Number(metrics?.completedCourses || 0));
        setCourses(Array.isArray(courseData.items) ? courseData.items : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const certificates = useMemo<CertificateItem[]>(() => {
    const count = Math.max(0, completedCourses);
    const source = courses.slice(0, count);

    return source.map((course, index) => ({
      id: course._id,
      title: course.title,
      instructor: course.instructor?.name || "Instructor",
      completedDate: new Date(course.updatedAt || course.createdAt || Date.now()).toLocaleDateString(),
      credentialId: `CTC-${String(course._id).slice(-6).toUpperCase()}-${index + 1}`,
    }));
  }, [completedCourses, courses]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Certificates</h1>
          <p className="text-slate-500 dark:text-slate-400">Live completion achievements from your learning profile.</p>
        </div>
        <Badge variant="success" className="px-3 py-1.5 text-xs uppercase">
          {certificates.length} certificate{certificates.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Completed Courses" value={completedCourses.toLocaleString()} icon={BookOpen} />
        <StatCard title="Current Level" value={level.toLocaleString()} icon={Trophy} />
        <StatCard title="Total XP" value={xp.toLocaleString()} icon={Award} />
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No certificates yet</h3>
            <p className="text-sm text-slate-500 mt-1">Complete courses to unlock your certificates.</p>
            <Button className="mt-4" asChild>
              <Link to="/app/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
              <div className="h-40 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <Award className="h-8 w-8" />
                  <Badge className="bg-white/20 text-white border-white/20">Certificate</Badge>
                </div>
                <h3 className="mt-6 text-lg font-bold line-clamp-2">{certificate.title}</h3>
                <p className="text-sm opacity-90">CTC Club Certification</p>
              </div>

              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Instructor</span>
                  <span className="font-medium text-slate-900 dark:text-white">{certificate.instructor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Completed
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{certificate.completedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Credential ID</span>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{certificate.credentialId}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <Download className="h-4 w-4 mr-1.5" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-500 font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex items-center justify-between">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
