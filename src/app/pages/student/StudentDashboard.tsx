import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Progress } from "../../components/ui/Progress";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Loader2, PlayCircle, Clock, Bell, Trophy, Sparkles, GraduationCap, BookOpen, ChevronRight } from "lucide-react";
import apiService, { Course, LeaderboardEntry } from "../../services/api";

export function StudentDashboard({ metrics }: { metrics?: any }) {
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [extraError, setExtraError] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  const activeCourses = Array.isArray(metrics?.activeCourses) ? metrics.activeCourses : [];
  const notifications = Array.isArray(metrics?.notifications) ? metrics.notifications : [];
  const quizResults = Array.isArray(metrics?.quizResults) ? metrics.quizResults : [];
  const projectSubmissions = Array.isArray(metrics?.projectSubmissions) ? metrics.projectSubmissions : [];

  const xp = Number(metrics?.xp || 0);
  const level = Number(metrics?.level || Math.floor(xp / 1000) + 1);
  const xpToNextLevel = Math.max(level * 1000, 1000);
  const progressToNext = Math.min(100, Math.round((xp / xpToNextLevel) * 100));

  const recentActivity = useMemo(() => {
    const quizActivity = quizResults.map((q: any) => ({
      id: `quiz-${q._id}`,
      title: `Quiz: ${q.quiz?.title || "Untitled Quiz"}`,
      subtitle: `${Math.round(Number(q.percentage || 0))}% score`,
      createdAt: q.createdAt,
      badge: q.isPassed ? "Passed" : "Retry",
    }));

    const projectActivity = projectSubmissions.map((p: any) => ({
      id: `project-${p._id}`,
      title: `Project: ${p.project?.title || "Untitled Project"}`,
      subtitle: p.status || "submitted",
      createdAt: p.updatedAt || p.createdAt,
      badge: p.grade !== undefined ? `Grade: ${p.grade}` : undefined,
    }));

    return [...quizActivity, ...projectActivity]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [projectSubmissions, quizResults]);

  useEffect(() => {
    const loadExtras = async () => {
      try {
        const [leaderboardData, coursesData] = await Promise.all([
          apiService.getLeaderboard(),
          apiService.getCourses({ limit: 8, status: "published" }),
        ]);

        setLeaderboard(leaderboardData);

        const enrolledIds = new Set(
          activeCourses
            .map((progress: any) => {
              if (typeof progress.course === "string") return progress.course;
              if (progress.course && typeof progress.course === "object") return progress.course._id;
              return "";
            })
            .filter(Boolean)
        );

        const suggestions = coursesData.items.filter((course) => !enrolledIds.has(course._id)).slice(0, 3);
        setRecommendedCourses(suggestions);
      } catch (err: any) {
        setExtraError(err?.response?.data?.message || "Could not load recommendations");
      } finally {
        setLoadingExtras(false);
      }
    };

    void loadExtras();
  }, [activeCourses]);

  const topStudents = leaderboard.slice(0, 5);

  if (loadingExtras) {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400">Your learning progress and live platform updates.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/app/notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/courses">Explore Courses</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Courses in Progress" value={Number(metrics?.enrolledCourses || 0)} icon={<PlayCircle className="h-5 w-5" />} />
        <MetricCard title="Completed Courses" value={Number(metrics?.completedCourses || 0)} icon={<GraduationCap className="h-5 w-5" />} />
        <MetricCard title="Current Level" value={level} icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard title="Total XP" value={xp.toLocaleString()} icon={<Trophy className="h-5 w-5" />} />
      </div>

      <Card className="border-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm opacity-90">Level {level}</p>
              <p className="text-2xl font-bold">{xp.toLocaleString()} XP</p>
            </div>
            <div className="w-full sm:w-72">
              <div className="flex justify-between text-xs opacity-90 mb-1">
                <span>Progress to Level {level + 1}</span>
                <span>{xp}/{xpToNextLevel}</span>
              </div>
              <Progress value={progressToNext} className="h-2 bg-white/25" indicatorClassName="bg-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Continue Learning</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/courses">All Courses</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCourses.length === 0 ? (
                <EmptyState text="You are not enrolled in any course yet." />
              ) : (
                activeCourses.map((progress: any) => {
                  const course = progress.course || {};
                  const courseId = typeof course === "string" ? course : course._id;
                  const title = typeof course === "string" ? "Course" : course.title || "Course";
                  const coverImage = typeof course === "string" ? "" : course.coverImage;
                  const pct = Number(progress.progressPercentage || 0);

                  return (
                    <Link
                      key={progress._id}
                      to={courseId ? `/app/courses/${courseId}` : "/app/courses"}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <img
                        src={coverImage || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300"}
                        alt={title}
                        className="h-14 w-20 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={pct} className="h-1.5" />
                          <span className="text-[11px] font-medium text-slate-500">{pct}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.length === 0 ? (
                <EmptyState text="No recent activity yet." />
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{activity.subtitle}</span>
                      {activity.badge ? <Badge variant="secondary" className="text-[10px]">{activity.badge}</Badge> : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.length === 0 ? (
                <EmptyState text="No notifications yet." />
              ) : (
                notifications.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                    <p className="text-sm text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topStudents.length === 0 ? (
                <EmptyState text="Leaderboard data unavailable." />
              ) : (
                topStudents.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-semibold text-slate-500">#{entry.rank}</span>
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">{entry.xp.toLocaleString()} XP</span>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app/leaderboard">View Full Leaderboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Recommended Courses
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/courses">Browse all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {extraError ? <p className="text-sm text-red-600">{extraError}</p> : null}
          {recommendedCourses.length === 0 ? (
            <EmptyState text="No recommendations right now." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course) => (
                <Link key={course._id} to={`/app/courses/${course._id}`} className="rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
                  <img
                    src={course.coverImage || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=500"}
                    alt={course.title}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.instructor?.name || "Instructor"}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{course.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.level || "beginner"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">{icon}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
      {text}
    </div>
  );
}
