import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Loader2, Settings2, Users, BookOpen, LifeBuoy, DollarSign, Send } from "lucide-react";
import apiService from "../../services/api";

type BroadcastType = "system" | "course_update" | "project_graded" | "achievement" | "message";
type BroadcastRole = "all" | "student" | "instructor" | "admin";

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState(0);
  const [courses, setCourses] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<BroadcastRole>("all");
  const [type, setType] = useState<BroadcastType>("system");
  const [sending, setSending] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        const analytics = await apiService.getAnalytics();

        setUsers(Number(analytics?.totals?.users || 0));
        setCourses(Number(analytics?.totals?.courses || 0));
        setOpenTickets(Number(analytics?.openTickets || 0));
        setRevenue(Number(analytics?.collectedRevenue || 0));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load system snapshot");
      } finally {
        setLoading(false);
      }
    };

    void loadSnapshot();
  }, []);

  const sendBroadcast = async () => {
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setError("");
    try {
      const result = await apiService.broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        role: role === "all" ? undefined : role,
        type,
      });

      setLastCount(Number(result?.count || 0));
      setTitle("");
      setMessage("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Live admin snapshot and operational controls.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {lastCount !== null ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          Broadcast delivered to {lastCount} user{lastCount === 1 ? "" : "s"}.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SnapshotCard title="Active Users" value={users.toLocaleString()} icon={Users} />
        <SnapshotCard title="Published Courses" value={courses.toLocaleString()} icon={BookOpen} />
        <SnapshotCard title="Open Tickets" value={openTickets.toLocaleString()} icon={LifeBuoy} />
        <SnapshotCard title="Total Revenue" value={`$${revenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Broadcast Notification</CardTitle>
          <CardDescription>Send an in-app notification to user inboxes. This does not create an announcement or an event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Message title" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message body"
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                value={role}
                onChange={(e) => setRole(e.target.value as BroadcastRole)}
              >
                <option value="all">All users</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                value={type}
                onChange={(e) => setType(e.target.value as BroadcastType)}
              >
                <option value="system">System</option>
                <option value="course_update">Course Update</option>
                <option value="project_graded">Project Graded</option>
                <option value="achievement">Achievement</option>
                <option value="message">Message</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => void sendBroadcast()}
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Status</CardTitle>
          <CardDescription>
            Announcement posts, scheduled events, and broadcast notifications are now treated as separate features.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="success">Analytics Connected</Badge>
          <Badge variant="success">Notifications Connected</Badge>
          <Badge variant="outline">Feature Flags API Pending</Badge>
          <Badge variant="outline">Backup API Pending</Badge>
          <Badge variant="outline">Role Matrix API Pending</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
