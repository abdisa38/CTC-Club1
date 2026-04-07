import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  Search, Activity, LogIn, LogOut, BookOpen, Users, Shield, Trash2,
  Edit2, AlertTriangle, ChevronLeft, ChevronRight, Download, Filter, Clock
} from "lucide-react";

type LogEntry = {
  id: number;
  action: string;
  category: "auth" | "course" | "user" | "admin" | "system" | "content";
  user: string;
  ip: string;
  timestamp: string;
  details: string;
  severity: "info" | "warning" | "error" | "success";
};

const allLogs: LogEntry[] = [
  { id: 1, action: "User Login", category: "auth", user: "Alex Chen", ip: "192.168.1.45", timestamp: "2026-04-06 09:15:23", details: "Successful login via email/password", severity: "info" },
  { id: 2, action: "Course Published", category: "course", user: "Prof. Jenkins", ip: "192.168.1.102", timestamp: "2026-04-06 09:12:10", details: "Published 'Full Stack Web Dev' - Course ID: 142", severity: "success" },
  { id: 3, action: "Failed Login Attempt", category: "auth", user: "unknown@test.com", ip: "45.33.22.11", timestamp: "2026-04-06 09:08:45", details: "3 consecutive failed attempts - IP flagged", severity: "warning" },
  { id: 4, action: "User Role Changed", category: "admin", user: "David Kumar", ip: "192.168.1.10", timestamp: "2026-04-06 08:55:30", details: "Changed Maria Rodriguez: Student -> Instructor", severity: "info" },
  { id: 5, action: "Resource Deleted", category: "content", user: "David Kumar", ip: "192.168.1.10", timestamp: "2026-04-06 08:42:18", details: "Deleted 'Outdated Python Guide v1' - Resource ID: 345", severity: "warning" },
  { id: 6, action: "User Suspended", category: "user", user: "David Kumar", ip: "192.168.1.10", timestamp: "2026-04-06 08:30:00", details: "Suspended Sofia Nguyen - Reason: Violation of community guidelines", severity: "error" },
  { id: 7, action: "System Backup Completed", category: "system", user: "System", ip: "localhost", timestamp: "2026-04-06 06:00:00", details: "Full database backup - Size: 2.4 GB - Duration: 12 min", severity: "success" },
  { id: 8, action: "Course Created", category: "course", user: "Prof. Wright", ip: "192.168.1.88", timestamp: "2026-04-06 05:45:22", details: "Created draft 'Advanced ML with TensorFlow'", severity: "info" },
  { id: 9, action: "User Registered", category: "user", user: "New User (Jake Wilson)", ip: "72.14.205.99", timestamp: "2026-04-06 04:20:15", details: "New student registration via Google OAuth", severity: "success" },
  { id: 10, action: "API Rate Limit Hit", category: "system", user: "System", ip: "203.0.113.50", timestamp: "2026-04-06 03:15:00", details: "Rate limit exceeded by IP 203.0.113.50 - 1000 req/min", severity: "error" },
  { id: 11, action: "User Logout", category: "auth", user: "Emily Parker", ip: "192.168.1.67", timestamp: "2026-04-06 02:30:45", details: "Session ended - Duration: 2h 15min", severity: "info" },
  { id: 12, action: "Content Flagged", category: "content", user: "System (Auto-mod)", ip: "localhost", timestamp: "2026-04-06 01:10:30", details: "Comment flagged for inappropriate language - Post ID: 892", severity: "warning" },
  { id: 13, action: "Feature Toggle Changed", category: "admin", user: "David Kumar", ip: "192.168.1.10", timestamp: "2026-04-05 23:55:10", details: "Enabled 'Quiz System' feature flag", severity: "info" },
  { id: 14, action: "Course Enrollment", category: "course", user: "Ryan Kim", ip: "192.168.1.130", timestamp: "2026-04-05 22:40:05", details: "Enrolled in 'Cloud Architecture with AWS'", severity: "success" },
  { id: 15, action: "Password Reset", category: "auth", user: "Liam O'Brien", ip: "192.168.1.95", timestamp: "2026-04-05 21:15:00", details: "Password reset via email link", severity: "info" },
];

const categoryIcons: Record<string, React.ReactNode> = {
  auth: <LogIn className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
  content: <Edit2 className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  auth: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  course: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  user: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  system: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  content: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
};

const severityColors: Record<string, string> = {
  info: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  error: "text-red-600 bg-red-50 dark:bg-red-900/20",
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
};

export function AdminLogs() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  const filteredByTab = activeTab === "all" ? allLogs : allLogs.filter(l => l.category === activeTab);
  const filtered = filteredByTab.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">Track all platform activity, logins, and system events.</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export Logs</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Entries", value: allLogs.length, color: "text-purple-600" },
          { label: "Warnings", value: allLogs.filter(l => l.severity === "warning").length, color: "text-amber-600" },
          { label: "Errors", value: allLogs.filter(l => l.severity === "error").length, color: "text-red-600" },
          { label: "Auth Events", value: allLogs.filter(l => l.category === "auth").length, color: "text-blue-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Activity Timeline</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search logs..." className="pl-8 bg-slate-50 dark:bg-slate-900" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="mt-3">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="course">Courses</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {paginated.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">No log entries found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {paginated.map((log, idx) => (
                <div key={log.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${categoryColors[log.category]}`}>
                      {categoryIcons[log.category]}
                    </div>
                    {idx < paginated.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${severityColors[log.severity]}`}>
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{log.details}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{log.user}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.timestamp}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">IP: {log.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <span className="text-sm text-slate-500">{filtered.length} entries</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">{currentPage}/{totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
