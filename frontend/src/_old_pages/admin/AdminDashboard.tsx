import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Users, BookOpen, Activity, AlertCircle, FileText, MessageSquare,
  TrendingUp, Bell, Clock, Shield, ChevronRight, RefreshCw, Zap
} from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "../../components/ui/Skeleton";

const userGrowthData = [
  { month: "Oct", users: 8200 }, { month: "Nov", users: 9100 }, { month: "Dec", users: 9800 },
  { month: "Jan", users: 10500 }, { month: "Feb", users: 11200 }, { month: "Mar", users: 12000 }, { month: "Apr", users: 12450 },
];

const engagementData = [
  { day: "Mon", sessions: 520, hours: 3.8 }, { day: "Tue", sessions: 610, hours: 4.2 },
  { day: "Wed", sessions: 680, hours: 4.5 }, { day: "Thu", sessions: 545, hours: 3.9 },
  { day: "Fri", sessions: 430, hours: 3.2 }, { day: "Sat", sessions: 280, hours: 2.1 },
  { day: "Sun", sessions: 210, hours: 1.8 },
];

const ticketStatusData = [
  { name: "Open", value: 23, color: "#f59e0b" },
  { name: "In Progress", value: 15, color: "#6366f1" },
  { name: "Resolved", value: 142, color: "#10b981" },
  { name: "Closed", value: 89, color: "#94a3b8" },
];

const courseActivityData = [
  { month: "Oct", created: 8, published: 6 }, { month: "Nov", created: 12, published: 9 },
  { month: "Dec", created: 6, published: 5 }, { month: "Jan", created: 15, published: 11 },
  { month: "Feb", created: 10, published: 8 }, { month: "Mar", created: 18, published: 14 },
  { month: "Apr", created: 9, published: 7 },
];

const activityFeed = [
  { id: 1, action: "New user registered", user: "Emma Watson", time: "2 min ago", type: "user" as const },
  { id: 2, action: "Course published", user: "Prof. Jenkins", time: "15 min ago", type: "course" as const },
  { id: 3, action: "Support ticket opened", user: "Alex Chen", time: "32 min ago", type: "ticket" as const },
  { id: 4, action: "Resource uploaded", user: "Prof. Wright", time: "1 hr ago", type: "resource" as const },
  { id: 5, action: "User role changed to Instructor", user: "Maria Rodriguez", time: "2 hrs ago", type: "admin" as const },
  { id: 6, action: "Course flagged for review", user: "System", time: "3 hrs ago", type: "moderation" as const },
  { id: 7, action: "Backup completed successfully", user: "System", time: "6 hrs ago", type: "system" as const },
  { id: 8, action: "New announcement published", user: "David Kumar", time: "8 hrs ago", type: "announcement" as const },
];

const notifications = [
  { id: 1, title: "3 courses pending review", desc: "Instructor submissions awaiting approval", urgent: true },
  { id: 2, title: "Server CPU spike detected", desc: "CPU usage reached 87% at 14:32", urgent: true },
  { id: 3, title: "5 new support tickets", desc: "Unassigned tickets from today", urgent: false },
  { id: 4, title: "Weekly report ready", desc: "Platform analytics for last 7 days", urgent: false },
];

const typeIcons: Record<string, string> = {
  user: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  course: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  ticket: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  resource: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  moderation: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  system: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  announcement: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const stats = [
    { title: "Total Users", value: "12,450", change: "+180", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", sub: "8,920 students / 67 instructors" },
    { title: "Active Now", value: "1,284", change: "+12%", up: true, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", sub: "Real-time active sessions" },
    { title: "Total Courses", value: "145", change: "+4", up: true, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", sub: "12 under review" },
    { title: "Resources", value: "892", change: "+23", up: true, icon: FileText, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", sub: "PDFs, slides, code samples" },
    { title: "Support Tickets", value: "269", change: "23 open", up: false, icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", sub: "15 in progress" },
    { title: "System Health", value: "99.9%", change: "Operational", up: true, icon: Activity, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20", sub: "All services running" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Complete overview of platform health, users, and operations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.sub}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${stat.up ? "text-emerald-600" : "text-amber-600"}`}>
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
            <CardDescription>Monthly platform user growth trend</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Activity</CardTitle>
            <CardDescription>Created vs published courses by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseActivityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="created" name="Created" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="published" name="Published" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement + Ticket Pie */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Engagement</CardTitle>
            <CardDescription>Sessions and average learning hours</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                  {ticketStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {ticketStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Platform Activity Feed</CardTitle>
              <CardDescription>Recent actions across the platform</CardDescription>
            </div>
            <Link to="/app/admin/logs">
              <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${typeIcons[item.type]}`}>
                    {item.type === "user" && <Users className="h-4 w-4" />}
                    {item.type === "course" && <BookOpen className="h-4 w-4" />}
                    {item.type === "ticket" && <MessageSquare className="h-4 w-4" />}
                    {item.type === "resource" && <FileText className="h-4 w-4" />}
                    {item.type === "admin" && <Shield className="h-4 w-4" />}
                    {item.type === "moderation" && <AlertCircle className="h-4 w-4" />}
                    {item.type === "system" && <Activity className="h-4 w-4" />}
                    {item.type === "announcement" && <Bell className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 dark:text-white">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.user}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    <Clock className="h-3 w-3 inline mr-1" />{item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications & Alerts</CardTitle>
            <CardDescription>System alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 rounded-lg border transition-colors ${n.urgent ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                        {n.urgent && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs">View</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/app/admin/users"><Button variant="outline" size="sm" className="w-full justify-start"><Users className="h-4 w-4 mr-2" />Manage Users</Button></Link>
                <Link to="/app/admin/courses"><Button variant="outline" size="sm" className="w-full justify-start"><BookOpen className="h-4 w-4 mr-2" />Review Courses</Button></Link>
                <Link to="/app/admin/tickets"><Button variant="outline" size="sm" className="w-full justify-start"><MessageSquare className="h-4 w-4 mr-2" />Open Tickets</Button></Link>
                <Link to="/app/admin/settings"><Button variant="outline" size="sm" className="w-full justify-start"><Activity className="h-4 w-4 mr-2" />Settings</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
