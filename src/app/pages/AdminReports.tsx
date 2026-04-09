import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, Users, BookOpen, Loader2 } from "lucide-react";
import apiService from "../services/api";

type TimeRange = "7d" | "30d" | "90d" | "1y";

export function AdminReports() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const payload = await apiService.getAnalytics();
        setAnalytics(payload);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAnalytics();
  }, []);

  const enrollmentTrendData = useMemo(
    () =>
      (analytics?.userActivityData || []).map((item: any, index: number) => ({
        month: item.name || `D${index + 1}`,
        users: Number(item.active || 0),
      })),
    [analytics]
  );

  const completionBreakdown = useMemo(() => {
    const list = analytics?.ticketStatusData || [];
    return list.map((item: any, index: number) => ({
      name: item.name,
      value: Number(item.value || 0),
      color: ["#10b981", "#6366f1", "#f43f5e", "#94a3b8"][index % 4],
    }));
  }, [analytics]);

  const courseCompletionData = useMemo(() => analytics?.courseCompletionData || [], [analytics]);
  const activityLogs = useMemo(() => analytics?.activityLogs || [], [analytics]);

  const statCards = [
    {
      title: "Total Users",
      value: Number(analytics?.totals?.users || 0).toLocaleString(),
      icon: Users,
    },
    {
      title: "Total Courses",
      value: Number(analytics?.totals?.courses || 0).toLocaleString(),
      icon: BookOpen,
    },
    {
      title: "Open Tickets",
      value: Number(analytics?.openTickets || 0).toLocaleString(),
      icon: Users,
    },
    {
      title: "Revenue",
      value: `$${Number(analytics?.totalRevenue || 0).toLocaleString()}`,
      icon: Users,
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Live platform performance and operational insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-300">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daily Activity Trend</CardTitle>
            <CardDescription>Active user events from progress updates.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {enrollmentTrendData.length === 0 ? (
              <EmptyState text="No activity trend data available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#studentsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Breakdown</CardTitle>
            <CardDescription>Current support ticket distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center justify-center">
            {completionBreakdown.length === 0 ? (
              <EmptyState text="No ticket data available." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={completionBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {completionBreakdown.map((item: any) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {completionBreakdown.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Completion</CardTitle>
          <CardDescription>Top courses by completed progress count.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          {courseCompletionData.length === 0 ? (
            <EmptyState text="No course completion data available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseCompletionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity Logs</CardTitle>
          <CardDescription>Latest cross-platform events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                activityLogs.slice(0, 20).map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {new Date(log.time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
      {text}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}
