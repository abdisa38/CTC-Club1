import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { CalendarDays, Plus, Loader2, Pencil, Trash2, MapPin, Clock3 } from "lucide-react";
import apiService, { EventItem } from "../../services/api";

type EventForm = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
};

const initialForm: EventForm = {
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  isPublished: true,
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [events]
  );

  const loadEvents = async () => {
    try {
      const payload = await apiService.getEvents({ includeUnpublished: true });
      setEvents(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (event: EventItem) => {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      startsAt: toDateInput(event.startsAt),
      endsAt: toDateInput(event.endsAt),
      isPublished: Boolean(event.isPublished),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.startsAt) {
      setError("Title, description, and event start date are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        isPublished: form.isPublished,
      };

      if (editingId) {
        await apiService.updateEvent(editingId, payload);
      } else {
        await apiService.createEvent(payload);
      }

      setDialogOpen(false);
      setForm(initialForm);
      setEditingId(null);
      await loadEvents();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;

    try {
      await apiService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete event");
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Events</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage upcoming workshops, webinars, and live sessions.</p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scheduled Events</CardTitle>
          <CardDescription>Events are separate from announcements and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
              No events available yet.
            </div>
          ) : (
            sortedEvents.map((event) => {
              const isPast = new Date(event.startsAt).getTime() < Date.now();

              return (
                <div key={event._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                        <Badge variant={event.isPublished ? "success" : "secondary"}>{event.isPublished ? "published" : "draft"}</Badge>
                        <Badge variant="outline">{isPast ? "past" : "upcoming"}</Badge>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(event.startsAt).toLocaleString()}
                        </span>
                        {event.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => void handleDelete(event._id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>Events are for scheduled sessions (workshops, webinars, meetups).</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Weekend React Workshop" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[100px]" placeholder="Event details, agenda, and how to join." />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Starts At</label>
                <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ends At (optional)</label>
                <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Zoom / Main Hall / Hybrid" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                  value={form.isPublished ? "published" : "draft"}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.value === "published" }))}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={saving} onClick={() => void handleSave()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {editingId ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
