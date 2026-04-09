import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Search, Send, Clock, User, AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { Ticket } from "../services/api";

const statusLabels: Record<Ticket["status"], string> = {
  open: "open",
  in_progress: "in progress",
  resolved: "resolved",
  closed: "closed",
};

export function Support() {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "instructor";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string>("");
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Ticket["category"]>("technical");
  const [priority, setPriority] = useState<Ticket["priority"]>("medium");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      setError("");
      const payload = await apiService.getSupportTickets({ limit: 50 });
      const list = payload.items;
      setTickets(list);

      if (list.length > 0) {
        const firstId = activeTicketId || list[0]._id;
        setActiveTicketId(firstId);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load support tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  useEffect(() => {
    const loadTicketDetail = async () => {
      if (!activeTicketId) {
        setActiveTicket(null);
        return;
      }

      try {
        const ticket = await apiService.getSupportTicketById(activeTicketId);
        setActiveTicket(ticket);
      } catch {
        setActiveTicket(tickets.find((t) => t._id === activeTicketId) || null);
      }
    };

    void loadTicketDetail();
  }, [activeTicketId, tickets]);

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const keyword = search.toLowerCase();
    return tickets.filter((ticket) => {
      const studentName = ticket.user?.name || "";
      return (
        ticket.subject.toLowerCase().includes(keyword) ||
        studentName.toLowerCase().includes(keyword) ||
        ticket.category.toLowerCase().includes(keyword)
      );
    });
  }, [search, tickets]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await apiService.createSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        message: description.trim(),
      });

      setTickets((prev) => [ticket, ...prev]);
      setActiveTicketId(ticket._id);
      setSubject("");
      setDescription("");
      setCategory("technical");
      setPriority("medium");
      setDialogOpen(false);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeTicket || !newMessage.trim()) return;
    setIsSubmitting(true);

    try {
      const updated = await apiService.replySupportTicket(activeTicket._id, newMessage.trim());
      setTickets((prev) => prev.map((ticket) => (ticket._id === updated._id ? updated : ticket)));
      setActiveTicket(updated);
      setNewMessage("");
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async (status: Ticket["status"]) => {
    if (!activeTicket || !isAdmin) return;
    setIsSubmitting(true);

    try {
      const updated = await apiService.updateSupportTicketStatus(activeTicket._id, status);
      setTickets((prev) => prev.map((ticket) => (ticket._id === updated._id ? updated : ticket)));
      setActiveTicket(updated);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update ticket status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isAdmin ? "Support Tickets" : "My Tickets"}</h2>
          {!isAdmin ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">New Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>Describe your issue and we will respond as soon as possible.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject *</label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Unable to submit project" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Ticket["category"])}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                      >
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="course_content">Course Content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Please include details..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTicket} disabled={isSubmitting || !subject.trim() || !description.trim()}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search tickets..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredTickets.length === 0 ? (
            <div className="text-center p-4 text-slate-500 text-sm border border-dashed rounded-xl">No tickets found.</div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => setActiveTicketId(ticket._id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeTicketId === ticket._id
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-950"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {statusLabels[ticket.status]}
                  </Badge>
                  {ticket.priority === "urgent" ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">{ticket.subject}</h4>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  {isAdmin ? (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.user?.name || "User"}
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <Card className="flex-1 flex flex-col h-full overflow-hidden border-2 border-slate-200 dark:border-slate-800">
        {activeTicket ? (
          <>
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{activeTicket.subject}</CardTitle>
                    <Badge className="bg-indigo-600 text-white shrink-0">#{activeTicket._id.slice(-6).toUpperCase()}</Badge>
                  </div>
                  <CardDescription>
                    Opened {new Date(activeTicket.createdAt).toLocaleString()} • Category: {activeTicket.category.replace("_", " ")}
                    {isAdmin ? ` • Student: ${activeTicket.user?.name || "User"}` : ""}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin ? (
                    <select
                      className="h-9 rounded-md border border-slate-300 text-xs px-2 dark:border-slate-800 bg-white dark:bg-slate-950"
                      value={activeTicket.status}
                      onChange={(e) => void handleChangeStatus(e.target.value as Ticket["status"])}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : null}
                  {activeTicket.status !== "resolved" && activeTicket.status !== "closed" ? (
                    <Button variant="outline" size="sm" onClick={() => void handleChangeStatus("resolved")} disabled={!isAdmin || isSubmitting}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">
              {activeTicket.messages.map((msg, index) => {
                const senderObj = typeof msg.sender === "string" ? null : msg.sender;
                const senderName = senderObj?.name || "User";
                const isOwnMessage = isAdmin ? msg.isAdminReply : !msg.isAdminReply;

                return (
                  <div key={`${msg.createdAt}-${index}`} className={`flex gap-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    {!isOwnMessage ? (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-orange-100" : "bg-indigo-100 dark:bg-indigo-900"}`}>
                        {isAdmin ? <User className="h-4 w-4 text-orange-600" /> : <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    ) : null}
                    <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-900 dark:text-white">{isOwnMessage ? "You" : senderName}</span>
                        <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <div
                        className={`p-3 sm:p-4 rounded-2xl text-sm ${
                          isOwnMessage
                            ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              {activeTicket.status === "resolved" || activeTicket.status === "closed" ? (
                <div className="text-center text-sm text-slate-500 py-2">This ticket is closed. New replies are disabled.</div>
              ) : (
                <div className="relative">
                  <Textarea placeholder="Type your reply..." className="min-h-[80px] pr-12 resize-none" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <Button size="icon" className="absolute right-2 bottom-2 h-8 w-8" disabled={!newMessage.trim() || isSubmitting} onClick={() => void handleSendMessage()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!isAdmin && activeTicket.status !== "resolved" && activeTicket.status !== "closed" ? (
                <p className="text-xs text-slate-500 mt-2">Support is online. Reply times are typically within 24 hours.</p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Ticket Selected</h3>
            <p className="text-slate-500">Select a ticket from the sidebar to view details.</p>
          </div>
        )}
      </Card>
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
