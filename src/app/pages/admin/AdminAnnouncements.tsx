import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Megaphone, Plus, Loader2, Trash2 } from "lucide-react";
import apiService, { Announcement } from "../../services/api";

type AnnouncementForm = {
  title: string;
  content: string;
};

const initialForm: AnnouncementForm = {
  title: "",
  content: "",
};

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AnnouncementForm>(initialForm);

  const published = useMemo(
    () =>
      [...announcements].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [announcements]
  );

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

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await apiService.createAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
      });

      setDialogOpen(false);
      setForm(initialForm);
      await loadAnnouncements();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to publish announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      await apiService.deleteAnnouncement(announcementId);
      setAnnouncements((prev) => prev.filter((item) => item.id !== announcementId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete announcement");
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
          <p className="text-slate-500 dark:text-slate-400">Publish platform-wide updates. This is separate from Events and Broadcast Notifications.</p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Announcements</CardTitle>
          <CardDescription>These posts appear in the public announcements feed only.</CardDescription>
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

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => void handleDeleteAnnouncement(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
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
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Use this for platform updates that should appear in the announcement feed.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Platform maintenance window"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your announcement"
                className="min-h-[140px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={submitting || !form.title.trim() || !form.content.trim()}
              onClick={() => void handleCreateAnnouncement()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Publish Announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}