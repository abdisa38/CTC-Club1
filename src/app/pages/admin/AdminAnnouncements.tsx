import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Megaphone, Plus, Edit2, Trash2, Clock, Eye, Calendar } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
  author: string;
  status: "Published" | "Scheduled" | "Draft";
  createdAt: string;
  scheduledFor?: string;
  views: number;
};

const initialAnnouncements: Announcement[] = [
  { id: 1, title: "Platform Maintenance - April 10th", content: "We'll be performing scheduled maintenance on April 10th from 2:00 AM to 6:00 AM UTC. The platform will be temporarily unavailable during this period. Please save your work beforehand.", author: "David Kumar", status: "Published", createdAt: "2026-04-05", views: 2340 },
  { id: 2, title: "New AI/ML Course Launching Soon!", content: "We're excited to announce our new Advanced Machine Learning course by Prof. James Wright. Pre-registration opens next week with an early bird discount.", author: "David Kumar", status: "Scheduled", createdAt: "2026-04-04", scheduledFor: "2026-04-12", views: 0 },
  { id: 3, title: "Spring Hackathon 2026 Registration Open", content: "Join our annual Spring Hackathon! Teams of 2-4, prizes worth $5,000. Registration closes April 20th. Theme: Sustainable Tech Solutions.", author: "Sarah Admin", status: "Published", createdAt: "2026-04-01", views: 4120 },
  { id: 4, title: "Updated Code of Conduct", content: "We've updated our community guidelines and code of conduct. Please review the changes in the Community section.", author: "David Kumar", status: "Draft", createdAt: "2026-04-03", views: 0 },
  { id: 5, title: "Summer Internship Partnerships", content: "We've partnered with 15 top tech companies for summer internship placements. Check the Jobs section for opportunities.", author: "Sarah Admin", status: "Published", createdAt: "2026-03-28", views: 5680 },
];

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", content: "", status: "Draft" as Announcement["status"], scheduledFor: "" });
  const [processing, setProcessing] = useState(false);

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    setProcessing(true);
    setTimeout(() => {
      setAnnouncements(prev => [{
        id: Date.now(), title: form.title, content: form.content, author: "Admin",
        status: form.status, createdAt: new Date().toISOString().split("T")[0],
        scheduledFor: form.scheduledFor || undefined, views: 0,
      }, ...prev]);
      setProcessing(false);
      setCreateOpen(false);
      setForm({ title: "", content: "", status: "Draft", scheduledFor: "" });
    }, 800);
  };

  const handleEdit = () => {
    if (!editItem || !form.title) return;
    setProcessing(true);
    setTimeout(() => {
      setAnnouncements(prev => prev.map(a => a.id === editItem.id ? { ...a, title: form.title, content: form.content, status: form.status, scheduledFor: form.scheduledFor || undefined } : a));
      setProcessing(false);
      setEditItem(null);
    }, 800);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setAnnouncements(prev => prev.filter(a => a.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const statusVariant = (s: string) => s === "Published" ? "success" : s === "Scheduled" ? "outline" : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage platform-wide announcements.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { setForm({ title: "", content: "", status: "Draft", scheduledFor: "" }); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </div>

      {/* Announcement Cards */}
      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Megaphone className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No announcements yet</p>
              <p className="text-sm text-slate-400">Create your first announcement to notify users.</p>
            </CardContent>
          </Card>
        ) : announcements.map((a) => (
          <Card key={a.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${a.status === "Published" ? "bg-emerald-50 dark:bg-emerald-900/20" : a.status === "Scheduled" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                    <Megaphone className={`h-5 w-5 ${a.status === "Published" ? "text-emerald-600" : a.status === "Scheduled" ? "text-amber-600" : "text-slate-500"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 dark:text-white">{a.title}</h3>
                      <Badge variant={statusVariant(a.status) as any} className="text-[10px] uppercase">{a.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{a.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{a.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.createdAt}</span>
                      {a.scheduledFor && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Scheduled: {a.scheduledFor}</span>}
                      {a.status === "Published" && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views.toLocaleString()} views</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" onClick={() => { setEditItem(a); setForm({ title: a.title, content: a.content, status: a.status, scheduledFor: a.scheduledFor || "" }); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => setDeleteItem(a)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Create a new platform announcement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content <span className="text-red-500">*</span></label>
              <Textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your announcement..." className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800" value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Publish Now</option>
                  <option value="Scheduled">Schedule</option>
                </select>
              </div>
              {form.status === "Scheduled" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Date</label>
                  <Input type="date" value={form.scheduledFor} onChange={(e) => setForm(p => ({ ...p, scheduledFor: e.target.value }))} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.content || processing} className="bg-purple-600 hover:bg-purple-700">
              {processing ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800" value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={processing} className="bg-purple-600 hover:bg-purple-700">{processing ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteItem?.title}"? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
