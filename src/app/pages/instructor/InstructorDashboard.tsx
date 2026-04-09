import { useMemo } from "react";
import { Link } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Loader2, TrendingUp, Users, BookOpen, DollarSign, FileText, MessageSquare } from "lucide-react";

export function InstructorDashboard({ metrics }: { metrics?: any }) {
  const coursePerformance = Array.isArray(metrics?.coursePerformance) ? metrics.coursePerformance : [];
  const latestSubmissions = Array.isArray(metrics?.latestSubmissions) ? metrics.latestSubmissions : [];

  const analyticsData = useMemo(
    () =>
      coursePerformance.map((course: any, idx: number) => ({
        name: course.name || `Course ${idx + 1}`,
        students: Number(course.students || 0),
        revenue: Number(course.revenue || 0),
      })),
    [coursePerformance]
  );

  if (!metrics) {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, Instructor</h1>
          <p className="text-slate-500 dark:text-slate-400">Your real-time teaching and engagement overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/app/instructor/analytics">View Full Report</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/app/instructor/courses/new">Create Course</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: `$${Number(metrics?.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-100",
          },
          {
            title: "Total Students",
            value: Number(metrics?.totalStudents || 0).toLocaleString(),
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-100",
          },
          {
            title: "Active Courses",
            value: Number(metrics?.totalCourses || 0).toLocaleString(),
            icon: BookOpen,
            color: "text-indigo-500",
            bg: "bg-indigo-100",
          },
          {
            title: "Pending Reviews",
            value: Number(metrics?.pendingSubmissions || 0).toLocaleString(),
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-100",
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bg} dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Students and revenue by your courses.</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
                No course performance data yet.
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="students" stroke="#6366f1" fillOpacity={1} fill="url(#studentsGrad)" name="Students" />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="none" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Submissions</CardTitle>
            <CardDescription>Most recent project updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestSubmissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">
                No submissions yet.
              </div>
            ) : (
              latestSubmissions.slice(0, 6).map((submission: any) => (
                <div key={submission._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{submission.project?.title || "Project"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{submission.student?.name || "Student"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {submission.status || "submitted"}
                    </Badge>
                    <span className="text-[11px] text-slate-500">{submission.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/app/instructor/projects">
                <MessageSquare className="h-4 w-4 mr-2" />
                Review Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {coursePerformance.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">
              No course data available.
            </div>
          ) : (
            coursePerformance.map((course: any) => (
              <div key={course.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{course.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{Number(course.students || 0).toLocaleString()} students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">${Number(course.revenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Revenue
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
