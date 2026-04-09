import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Megaphone, Plus, Loader2, Users } from "lucide-react";
import apiService, { Announcement } from "../../services/api";

type BroadcastForm = {
  title: string;
  message: string;
  role: "all" | "student" | "instructor" | "admin";
  type: "system" | "course_update" | "project_graded" | "achievement" | "message";
};

const initialForm: BroadcastForm = {
  title: "",
  message: "",
  role: "all",
  type: "system",
};

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BroadcastForm>(initialForm);
  const [lastAudienceCount, setLastAudienceCount] = useState<number | null>(null);

  const published = useMemo(
    () =>
      [...announcements].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [announcements]
  );

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await apiService.getAnnouncements();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncements();
  }, []);

  const handleBroadcast = async () => {
    if (!form.title.trim() || !form.message.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const payload = await apiService.broadcastNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        role: form.role === "all" ? undefined : form.role,
      });

      setLastAudienceCount(Number(payload?.count || 0));
      setDialogOpen(false);
      setForm(initialForm);

      const refreshed = await apiService.getAnnouncements();
      setAnnouncements(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send announcement");
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400">Broadcast platform updates and review latest public announcements.</p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {lastAudienceCount !== null ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          Broadcast sent successfully to {lastAudienceCount} user{lastAudienceCount === 1 ? "" : "s"}.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Announcements</CardTitle>
          <CardDescription>Data sourced from live backend announcements feed.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {published.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
              No announcements available yet.
            </div>
          ) : (
            published.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">{item.content}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <Badge variant="outline" className="text-[10px] uppercase">{item.category || "announcement"}</Badge>
                  <span>By {item.author || "CTC Team"}</span>
                  <span>•</span>
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>New Broadcast Announcement</DialogTitle>
            <DialogDescription>Send a live notification to users by role.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Write your announcement"
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Audience</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as BroadcastForm["role"] }))}
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
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as BroadcastForm["type"] }))}
                >
                  <option value="system">System</option>
                  <option value="course_update">Course Update</option>
                  <option value="project_graded">Project Graded</option>
                  <option value="achievement">Achievement</option>
                  <option value="message">Message</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={submitting || !form.title.trim() || !form.message.trim()}
              onClick={() => void handleBroadcast()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Send Broadcast
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
