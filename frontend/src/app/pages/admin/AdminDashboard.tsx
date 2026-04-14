import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  BookOpen,
  Activity,
  MessageSquare,
  TrendingUp,
  Bell,
  Clock,
  Shield,
  RefreshCw,
  Loader2,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import apiService from "../../services/api";

export function AdminDashboard({ metrics }: { metrics?: any }) {
  const [isLoading, setIsLoading] = useState(!metrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<any>(metrics || null);

  const fetchAnalytics = async () => {
    try {
      setError("");
      const payload = await apiService.getAnalytics();
      setAnalytics(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load admin analytics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!metrics) {
      void fetchAnalytics();
      return;
    }
    setAnalytics(metrics);
    setIsLoading(false);
  }, [metrics]);

  const activityTrend = useMemo(() => analytics?.userActivityData || [], [analytics]);
  const ticketBreakdown = useMemo(() => analytics?.ticketStatusData || [], [analytics]);
  const recentActivity = useMemo(() => analytics?.activityLogs || [], [analytics]);
  const completion = useMemo(() => analytics?.courseCompletionData || [], [analytics]);
  const collectedRevenue = Number(analytics?.collectedRevenue || 0);
  const estimatedRevenue = Number(analytics?.estimatedRevenue || 0);
  const avgCourseRating = Number(analytics?.ratings?.avgCourseRating || 0);
  const totalReviews = Number(analytics?.ratings?.totalReviews || 0);

  const stats = [
    {
      title: "Total Users",
      value: Number(analytics?.totals?.users || 0).toLocaleString(),
      icon: Users,
      sub: "Registered accounts",
    },
    {
      title: "Total Courses",
      value: Number(analytics?.totals?.courses || 0).toLocaleString(),
      icon: BookOpen,
      sub: "Published + draft",
    },
    {
      title: "Open Tickets",
      value: Number(analytics?.openTickets || 0).toLocaleString(),
      icon: MessageSquare,
      sub: "Needs support attention",
    },
    {
      title: "Revenue",
      value: `${collectedRevenue.toLocaleString()} ETB`,
      icon: TrendingUp,
      sub: "Collected sales revenue",
    },
    {
      title: "Avg Course Rating",
      value: avgCourseRating.toFixed(2),
      icon: Star,
      sub: "Weighted by all reviews",
    },
    {
      title: "Total Reviews",
      value: totalReviews.toLocaleString(),
      icon: MessageSquare,
      sub: "Submitted course ratings",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Live platform health, user activity, and support metrics.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsRefreshing(true);
            void fetchAnalytics();
          }}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-300">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Estimated enrollment value: {estimatedRevenue.toLocaleString()} ETB
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <CardDescription>Progress events generated by learners.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {activityTrend.length === 0 ? (
              <EmptyState text="No activity data available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="active" stroke="#8b5cf6" strokeWidth={2} fill="url(#activityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {ticketBreakdown.length === 0 ? (
              <EmptyState text="No ticket data available." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ticketBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                      {ticketBreakdown.map((entry: any, index: number) => (
                        <Cell key={`${entry.name}-${index}`} fill={["#f59e0b", "#6366f1", "#10b981", "#94a3b8"][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {ticketBreakdown.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Completion</CardTitle>
            <CardDescription>Top courses by completion count.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completion.length === 0 ? (
                <EmptyState text="No completion data available." />
              ) : (
                completion.map((item: any) => (
                  <div key={item.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.completed} completions</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Activity</CardTitle>
            <CardDescription>Most recent platform events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <EmptyState text="No recent activity available." />
              ) : (
                recentActivity.slice(0, 10).map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center dark:bg-slate-800 dark:text-slate-300">
                      {item.type === "user" ? <Users className="h-4 w-4" /> : item.type === "course" ? <BookOpen className="h-4 w-4" /> : item.type === "ticket" ? <MessageSquare className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.user}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {item.time ? new Date(item.time).toLocaleString() : "-"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/app/admin/users">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </Link>
                <Link to="/app/admin/courses">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Courses
                  </Button>
                </Link>
                <Link to="/app/admin/tickets">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tickets
                  </Button>
                </Link>
                <Link to="/app/admin/settings">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alerts</CardTitle>
          <CardDescription>System-generated alerts from activity and tickets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ticketBreakdown.length === 0 ? (
            <EmptyState text="No alerts available." />
          ) : (
            ticketBreakdown
              .filter((item: any) => Number(item.value) > 0)
              .map((item: any) => (
                <div key={item.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-slate-900 dark:text-white">{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">{text}</div>;
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{message}</div>;
}
