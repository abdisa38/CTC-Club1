import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { AuthUser, ProjectSubmission } from "../services/api";

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
};

const initials = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const roleLabel = (role?: string) => {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case "graded":
      return "bg-emerald-100 text-emerald-700";
    case "under_review":
      return "bg-amber-100 text-amber-700";
    case "submitted":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

type ProfileAccount = Partial<AuthUser> & {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  oauthProvider?: string;
};

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [profileData, metricsData] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getDashboardMetrics(),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setMetrics(metricsData);

        try {
          const recentSubmissions = await apiService.getProjectSubmissions();
          if (!cancelled) {
            setSubmissions(Array.isArray(recentSubmissions) ? recentSubmissions.slice(0, 6) : []);
          }
        } catch {
          if (!cancelled) {
            setSubmissions([]);
          }
        }
      } catch (loadError: any) {
        if (!cancelled) {
          setError(loadError?.response?.data?.message || "Failed to load profile data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const account = (profile || user || null) as ProfileAccount | null;

  const xp = Number(metrics?.xp ?? account?.xp ?? 0);
  const level = Math.max(1, Number(metrics?.level ?? account?.level ?? Math.floor(xp / 1000) + 1));
  const xpTarget = Math.max(level * 1000, 1000);
  const xpProgress = Math.min(100, Math.round((xp / xpTarget) * 100));

  const enrolledCourses = Number(metrics?.enrolledCourses || 0);
  const completedCourses = Number(metrics?.completedCourses || 0);
  const activeCoursesCount = Array.isArray(metrics?.activeCourses) ? metrics.activeCourses.length : 0;
  const completionRate = enrolledCourses > 0 ? Math.round((completedCourses / enrolledCourses) * 100) : 0;

  const recentNotifications = useMemo(() => {
    const list = Array.isArray(metrics?.notifications) ? metrics.notifications : [];
    return list.slice(0, 4);
  }, [metrics]);

  if (isLoading && !account) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-950">
        <div className="h-44 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
        <CardContent className="relative px-6 sm:px-8 pb-8 pt-0 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-950 -mt-16 bg-white shrink-0">
            <AvatarImage src={account?.avatar || ""} alt={account?.name || "User"} />
            <AvatarFallback>{initials(account?.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{account?.name || "User"}</h1>
                <p className="text-lg text-slate-500 font-medium mt-1">
                  {account?.headline || `${roleLabel(account?.role)} at CTC Club`}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {account?.email || "No email"}</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {roleLabel(account?.role)}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {formatDate(account?.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {account?.socialLinks?.github ? (
                  <Button asChild variant="outline" size="icon">
                    <a href={account.socialLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                      <Github className="h-5 w-5" />
                    </a>
                  </Button>
                ) : null}
                {account?.socialLinks?.linkedin ? (
                  <Button asChild variant="outline" size="icon">
                    <a href={account.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </Button>
                ) : null}
                {account?.socialLinks?.website ? (
                  <Button asChild variant="outline" size="icon">
                    <a href={account.socialLinks.website} target="_blank" rel="noreferrer" aria-label="Website">
                      <Globe className="h-5 w-5" />
                    </a>
                  </Button>
                ) : null}
                <Button asChild>
                  <Link to="/app/settings">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-2">
                  <span className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    Level {level}
                  </span>
                  <span className="text-indigo-600">{xp.toLocaleString()} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {Math.max(0, xpTarget - xp).toLocaleString()} XP to Level {level + 1}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">{enrolledCourses}</span>
                  <span className="text-xs text-slate-500 font-medium">Enrolled</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">{completedCourses}</span>
                  <span className="text-xs text-slate-500 font-medium">Completed</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">{activeCoursesCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Active</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">{completionRate}%</span>
                  <span className="text-xs text-slate-500 font-medium">Completion</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                <span>Sign-in Method</span>
                <Badge variant="secondary">{(account?.oauthProvider || "email").toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                <span>Premium</span>
                <Badge className={account?.isPremium ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}>
                  {account?.isPremium ? "Active" : "Standard"}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                <span>Notifications</span>
                <span className="font-medium">{recentNotifications.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {account?.bio || "No bio added yet. Update your profile settings to add your short introduction."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Recent Project Submissions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/projects">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
                  No project submissions yet.
                </div>
              ) : (
                submissions.map((submission) => {
                  const projectTitle = typeof submission.project === "string"
                    ? "Project"
                    : submission.project?.title || "Project";
                  const courseTitle = typeof submission.course === "string"
                    ? "Course"
                    : submission.course?.title || "Course";

                  return (
                    <div key={submission._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{projectTitle}</h4>
                        <Badge className={statusBadgeClass(submission.status)}>
                          {submission.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{courseTitle}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(submission.updatedAt || submission.createdAt)}</span>
                        {typeof submission.grade === "number" ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Grade: {submission.grade}</span>
                        ) : null}
                        {typeof submission.xpEarned === "number" ? (
                          <span className="flex items-center gap-1"><Award className="h-3 w-3" /> +{submission.xpEarned} XP</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
                  No recent notifications.
                </div>
              ) : (
                recentNotifications.map((item: any) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
