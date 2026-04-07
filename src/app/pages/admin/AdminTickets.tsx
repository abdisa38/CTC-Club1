import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import {
  Search, MessageSquare, Clock, CheckCircle, AlertCircle, User,
  ChevronLeft, ChevronRight, Send, Paperclip, ArrowRight
} from "lucide-react";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type TicketPriority = "Low" | "Medium" | "High" | "Critical";

type Message = { id: number; sender: string; isAdmin: boolean; text: string; time: string };

type Ticket = {
  id: number;
  title: string;
  user: string;
  email: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  assignedTo: string;
  messages: Message[];
};

const initialTickets: Ticket[] = [
  {
    id: 1001, title: "Cannot access course materials", user: "Alex Chen", email: "alex.chen@university.edu", status: "Open", priority: "High", category: "Access", createdAt: "2026-04-05",
    assignedTo: "", messages: [
      { id: 1, sender: "Alex Chen", isAdmin: false, text: "I enrolled in Full Stack Web Dev but can't access module 3 materials. It says 'content locked' even though I completed modules 1 and 2.", time: "Apr 5, 10:30 AM" },
    ]
  },
  {
    id: 1002, title: "Payment not reflected", user: "Maria Rodriguez", email: "m.rodriguez@university.edu", status: "In Progress", priority: "Critical", category: "Billing", createdAt: "2026-04-04",
    assignedTo: "David Kumar", messages: [
      { id: 1, sender: "Maria Rodriguez", isAdmin: false, text: "I paid for the premium plan 3 days ago but my account still shows free tier. Transaction ID: TXN-2026-0401.", time: "Apr 4, 2:15 PM" },
      { id: 2, sender: "David Kumar", isAdmin: true, text: "Hi Maria, I can see the transaction. Let me escalate this to our billing team. We'll get this resolved within 24 hours.", time: "Apr 4, 3:00 PM" },
      { id: 3, sender: "Maria Rodriguez", isAdmin: false, text: "Thank you! I really need access for my upcoming exam prep.", time: "Apr 4, 3:05 PM" },
    ]
  },
  {
    id: 1003, title: "Quiz timer bug", user: "Liam O'Brien", email: "l.obrien@university.edu", status: "Open", priority: "Medium", category: "Bug", createdAt: "2026-04-05",
    assignedTo: "", messages: [
      { id: 1, sender: "Liam O'Brien", isAdmin: false, text: "The quiz timer in Cybersecurity module keeps resetting when I switch tabs. Lost my progress twice already.", time: "Apr 5, 9:00 AM" },
    ]
  },
  {
    id: 1004, title: "Request for certificate", user: "Emily Parker", email: "e.parker@university.edu", status: "Resolved", priority: "Low", category: "General", createdAt: "2026-04-02",
    assignedTo: "David Kumar", messages: [
      { id: 1, sender: "Emily Parker", isAdmin: false, text: "I completed Data Science Fundamentals. How do I get my completion certificate?", time: "Apr 2, 11:00 AM" },
      { id: 2, sender: "David Kumar", isAdmin: true, text: "Hi Emily! Your certificate has been generated and sent to your email. You can also download it from your profile under 'Achievements'.", time: "Apr 2, 2:30 PM" },
      { id: 3, sender: "Emily Parker", isAdmin: false, text: "Got it! Thanks so much!", time: "Apr 2, 2:45 PM" },
    ]
  },
  {
    id: 1005, title: "Instructor portal loading slowly", user: "Prof. Sarah Jenkins", email: "s.jenkins@university.edu", status: "In Progress", priority: "High", category: "Performance", createdAt: "2026-04-03",
    assignedTo: "David Kumar", messages: [
      { id: 1, sender: "Prof. Sarah Jenkins", isAdmin: false, text: "My instructor dashboard takes 15+ seconds to load. This started 2 days ago. Makes grading very difficult.", time: "Apr 3, 4:00 PM" },
      { id: 2, sender: "David Kumar", isAdmin: true, text: "We're investigating a performance issue with the analytics queries. Our engineering team is working on an optimization.", time: "Apr 3, 5:15 PM" },
    ]
  },
  {
    id: 1006, title: "Account deletion request", user: "Sofia Nguyen", email: "s.nguyen@university.edu", status: "Closed", priority: "Low", category: "Account", createdAt: "2026-03-28",
    assignedTo: "David Kumar", messages: [
      { id: 1, sender: "Sofia Nguyen", isAdmin: false, text: "I'd like to delete my account and all associated data.", time: "Mar 28, 10:00 AM" },
      { id: 2, sender: "David Kumar", isAdmin: true, text: "Account deletion processed. All personal data has been removed per our privacy policy.", time: "Mar 29, 9:00 AM" },
    ]
  },
];

const staffMembers = ["David Kumar", "Sarah Admin", "Tech Support Bot"];

const priorityColors: Record<TicketPriority, string> = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<TicketStatus, string> = {
  Open: "outline",
  "In Progress": "secondary",
  Resolved: "success",
  Closed: "default",
};

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [assignDialog, setAssignDialog] = useState<Ticket | null>(null);
  const [selectedStaff, setSelectedStaff] = useState("");

  const PER_PAGE = 5;

  const filteredByTab = activeTab === "all" ? tickets :
    activeTab === "open" ? tickets.filter(t => t.status === "Open") :
    activeTab === "progress" ? tickets.filter(t => t.status === "In Progress") :
    activeTab === "resolved" ? tickets.filter(t => t.status === "Resolved") :
    tickets.filter(t => t.status === "Closed");

  const filtered = filteredByTab.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.user.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    const newMsg: Message = { id: Date.now(), sender: "Admin", isAdmin: true, text: replyText, time: "Just now" };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, messages: [...t.messages, newMsg], status: t.status === "Open" ? "In Progress" as TicketStatus : t.status } : t));
    setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, newMsg], status: prev.status === "Open" ? "In Progress" as TicketStatus : prev.status } : null);
    setReplyText("");
  };

  const handleStatusChange = (ticketId: number, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status } : null);
  };

  const handleAssign = () => {
    if (!assignDialog || !selectedStaff) return;
    setTickets(prev => prev.map(t => t.id === assignDialog.id ? { ...t, assignedTo: selectedStaff, status: t.status === "Open" ? "In Progress" as TicketStatus : t.status } : t));
    setAssignDialog(null);
    setSelectedStaff("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Support Tickets</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage and respond to user support requests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open", value: tickets.filter(t => t.status === "Open").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "In Progress", value: tickets.filter(t => t.status === "In Progress").length, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Resolved", value: tickets.filter(t => t.status === "Resolved").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Total", value: tickets.length, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Ticket List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search tickets..." className="pl-8 bg-slate-50 dark:bg-slate-900" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="mt-3">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
                <TabsTrigger value="open" className="flex-1 text-xs">Open</TabsTrigger>
                <TabsTrigger value="progress" className="flex-1 text-xs">Active</TabsTrigger>
                <TabsTrigger value="resolved" className="flex-1 text-xs">Done</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paginated.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No tickets found</p>
                </div>
              ) : paginated.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${selectedTicket?.id === ticket.id ? "border-purple-300 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">#{ticket.id} {ticket.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ticket.user}</p>
                    </div>
                    <Badge variant={statusColors[ticket.status] as any} className="text-[9px] uppercase shrink-0">{ticket.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                    <span className="text-[10px] text-slate-400">{ticket.createdAt}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">{filtered.length} tickets</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="lg:col-span-3">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">#{selectedTicket.id} {selectedTicket.title}</CardTitle>
                    <CardDescription>{selectedTicket.user} · {selectedTicket.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusColors[selectedTicket.status] as any} className="text-[10px] uppercase">{selectedTicket.status}</Badge>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
                  </div>
                </div>
                {/* Actions bar */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="outline" size="sm" onClick={() => { setAssignDialog(selectedTicket); setSelectedStaff(selectedTicket.assignedTo); }}>
                    <User className="h-3 w-3 mr-1" /> {selectedTicket.assignedTo || "Assign"}
                  </Button>
                  <select
                    className="text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-transparent"
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Timeline / Chat */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${msg.isAdmin ? "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900" : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{msg.sender}</span>
                          {msg.isAdmin && <Badge className="text-[8px] h-4 bg-purple-600">Staff</Badge>}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{msg.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                {selectedTicket.status !== "Closed" && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4 mr-1" /> Attach</Button>
                      <Button onClick={handleReply} disabled={!replyText.trim()} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4 mr-1" /> Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 font-medium">Select a ticket to view details</p>
              <p className="text-sm text-slate-400">Choose from the list on the left</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Assign this ticket to a staff member.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800 text-slate-900 dark:text-slate-100"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="">Unassigned</option>
              {staffMembers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button onClick={handleAssign} className="bg-purple-600 hover:bg-purple-700">Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
