import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { CalendarDays, Plus, Edit2, Trash2, Users, Clock, MapPin } from "lucide-react";

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
};

const initialEvents: Event[] = [
  { id: 1, title: "Spring Hackathon 2026", description: "48-hour coding challenge. Theme: Sustainable Tech Solutions. Teams of 2-4.", date: "2026-04-20", time: "9:00 AM", location: "Main Auditorium + Virtual", attendees: 156, maxAttendees: 200, status: "Upcoming" },
  { id: 2, title: "AI Workshop Series #3", description: "Hands-on workshop on neural networks and deep learning fundamentals.", date: "2026-04-12", time: "2:00 PM", location: "Lab 201", attendees: 45, maxAttendees: 50, status: "Upcoming" },
  { id: 3, title: "Industry Guest Talk: Google Engineering", description: "Senior engineer from Google shares insights on scaling distributed systems.", date: "2026-04-08", time: "4:00 PM", location: "Virtual (Zoom)", attendees: 320, maxAttendees: 500, status: "Upcoming" },
  { id: 4, title: "Code Review Workshop", description: "Learn best practices for effective code reviews in team settings.", date: "2026-04-01", time: "10:00 AM", location: "Room 305", attendees: 38, maxAttendees: 40, status: "Completed" },
  { id: 5, title: "Career Fair - Spring 2026", description: "Meet recruiters from 25+ tech companies. Bring your resume!", date: "2026-03-25", time: "11:00 AM", location: "Student Center", attendees: 450, maxAttendees: 500, status: "Completed" },
];

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Event | null>(null);
  const [deleteItem, setDeleteItem] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "", maxAttendees: "100" });
  const [processing, setProcessing] = useState(false);

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    setProcessing(true);
    setTimeout(() => {
      setEvents(prev => [{
        id: Date.now(), title: form.title, description: form.description,
        date: form.date, time: form.time, location: form.location,
        attendees: 0, maxAttendees: parseInt(form.maxAttendees) || 100, status: "Upcoming",
      }, ...prev]);
      setProcessing(false);
      setCreateOpen(false);
      setForm({ title: "", description: "", date: "", time: "", location: "", maxAttendees: "100" });
    }, 800);
  };

  const handleEdit = () => {
    if (!editItem) return;
    setProcessing(true);
    setTimeout(() => {
      setEvents(prev => prev.map(e => e.id === editItem.id ? {
        ...e, title: form.title || e.title, description: form.description || e.description,
        date: form.date || e.date, time: form.time || e.time, location: form.location || e.location,
        maxAttendees: parseInt(form.maxAttendees) || e.maxAttendees,
      } : e));
      setProcessing(false);
      setEditItem(null);
    }, 800);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setEvents(prev => prev.filter(e => e.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const statusColor = (s: string) => s === "Upcoming" ? "outline" : s === "Ongoing" ? "success" : s === "Completed" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Event Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage platform events and workshops.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { setForm({ title: "", description: "", date: "", time: "", location: "", maxAttendees: "100" }); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Upcoming</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{events.filter(e => e.status === "Upcoming").length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Total Attendees</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{events.reduce((a, e) => a + e.attendees, 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Total Events</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</p></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12">
            <CalendarDays className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No events yet</p>
          </CardContent></Card>
        ) : events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-purple-500 uppercase">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-purple-700 dark:text-purple-400 leading-tight">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 dark:text-white">{event.title}</h3>
                      <Badge variant={statusColor(event.status) as any} className="text-[10px] uppercase">{event.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{event.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                    {/* Attendance bar */}
                    <div className="mt-2 w-48">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (event.attendees / event.maxAttendees) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" onClick={() => {
                    setEditItem(event);
                    setForm({ title: event.title, description: event.description, date: event.date, time: event.time, location: event.location, maxAttendees: String(event.maxAttendees) });
                  }}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => setDeleteItem(event)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      {[{ open: createOpen, onClose: () => setCreateOpen(false), onSave: handleCreate, title: "Create Event" },
        { open: !!editItem, onClose: () => setEditItem(null), onSave: handleEdit, title: "Edit Event" }].map((d, i) => (
        <Dialog key={i} open={d.open} onOpenChange={() => d.onClose()}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="min-h-[80px]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Date *</label><Input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Time</label><Input value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} placeholder="2:00 PM" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Max Attendees</label><Input type="number" value={form.maxAttendees} onChange={(e) => setForm(p => ({ ...p, maxAttendees: e.target.value }))} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={d.onClose}>Cancel</Button>
              <Button onClick={d.onSave} disabled={processing} className="bg-purple-600 hover:bg-purple-700">{processing ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Event</DialogTitle><DialogDescription>Delete "{deleteItem?.title}"? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
