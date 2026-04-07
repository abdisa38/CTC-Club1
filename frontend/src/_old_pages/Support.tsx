import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Search, Send, Clock, User, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Message = { id: number; sender: string; time: string; text: string; isUser: boolean };
type Ticket = {
  id: number;
  subject: string;
  status: "open" | "in-progress" | "resolved";
  date: string;
  lastReply: string;
  unread: boolean;
  category: string;
  studentName: string;
  messages: Message[];
};

const initialTickets: Ticket[] = [
  { 
    id: 1, subject: "Course video not loading", status: "open", date: "2 hours ago", lastReply: "Admin", unread: true, category: "technical", studentName: "Student",
    messages: [
      { id: 1, sender: "Student", time: "2 hours ago", text: "Hi, I'm trying to watch the 'Advanced React Patterns' video in Module 3 but it keeps buffering indefinitely.", isUser: true },
      { id: 2, sender: "Admin (Support Team)", time: "1 hour ago", text: "Hello! We apologize for the inconvenience. We are currently experiencing higher than normal traffic on our video servers. Our engineering team is scaling up the resources as we speak.", isUser: false },
      { id: 3, sender: "Admin (Support Team)", time: "10 mins ago", text: "Could you please confirm if the issue is still persisting on your end?", isUser: false },
    ]
  },
  { 
    id: 2, subject: "Unable to submit project link", status: "in-progress", date: "Yesterday", lastReply: "Student", unread: false, category: "course", studentName: "Alex Chen",
    messages: [
      { id: 1, sender: "Alex Chen", time: "Yesterday", text: "The submit button is grayed out on the Final Project page.", isUser: true }
    ]
  }
];

export function Support() {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'instructor'; // Instructors might also handle course tickets

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("technical");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeTicket) return;
    
    const newMsg: Message = {
      id: Date.now(),
      sender: isAdmin ? "Admin (Support Team)" : "Student",
      time: "Just now",
      text: newMessage,
      isUser: !isAdmin
    };

    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          lastReply: isAdmin ? "Admin" : "Student",
          unread: isAdmin,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
    setNewMessage("");
  };

  const handleCreateTicket = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: Ticket = {
        id: Date.now(),
        subject: newTicketSubject,
        category: newTicketCategory,
        status: "open",
        date: "Just now",
        lastReply: "Student",
        unread: false,
        studentName: "Student",
        messages: [
          { id: 1, sender: "Student", time: "Just now", text: newTicketDesc, isUser: true }
        ]
      };
      setTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setIsDialogOpen(false);
      setNewTicketSubject("");
      setNewTicketDesc("");
      setActiveTicketId(newTicket.id);
    }, 800);
  };

  const handleChangeStatus = (status: "open" | "in-progress" | "resolved") => {
    if (!activeTicket) return;
    setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status } : t));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar - Ticket List */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isAdmin ? "All Support Tickets" : "My Tickets"}
          </h2>
          {!isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">New Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>Describe the issue you're facing. Our support team usually responds within 24 hours.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input 
                      placeholder="E.g., Cannot access course material" 
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing / Account</option>
                      <option value="course">Course Content</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Please provide as much detail as possible..." 
                      rows={4}
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTicket} disabled={!newTicketSubject || !newTicketDesc || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search tickets..." className="pl-9 h-10" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {tickets.length === 0 ? (
            <div className="text-center p-4 text-slate-500 text-sm border border-dashed rounded-xl">
              No tickets found.
            </div>
          ) : tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setActiveTicketId(ticket.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeTicketId === ticket.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'in-progress' ? 'warning' : 'default'} className="text-[10px] uppercase">
                  {ticket.status}
                </Badge>
                {!isAdmin && ticket.unread && <span className="h-2 w-2 rounded-full bg-indigo-600"></span>}
                {isAdmin && ticket.status === 'open' && <span className="h-2 w-2 rounded-full bg-red-500"></span>}
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">{ticket.subject}</h4>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ticket.date}</span>
                {isAdmin && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.studentName}</span>}
                {!isAdmin && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.lastReply}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area - Ticket Detail / Chat */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden border-2 border-slate-200 dark:border-slate-800">
        {activeTicket ? (
          <>
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{activeTicket.subject}</CardTitle>
                    <Badge className="bg-indigo-600 text-white shrink-0">#TKT-{activeTicket.id}</Badge>
                  </div>
                  <CardDescription>
                    Opened {activeTicket.date} • Category: <span className="capitalize">{activeTicket.category}</span>
                    {isAdmin && ` • Student: ${activeTicket.studentName}`}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <select 
                      className="h-9 rounded-md border border-slate-300 text-xs px-2 dark:border-slate-800 bg-white dark:bg-slate-950"
                      value={activeTicket.status}
                      onChange={(e) => handleChangeStatus(e.target.value as any)}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}
                  {activeTicket.status !== 'resolved' && (
                    <Button variant="outline" size="sm" onClick={() => handleChangeStatus('resolved')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Resolved
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">
              {activeTicket.messages.map((msg) => {
                // Determine if this message should appear on the right side.
                // For Student, their own messages (msg.isUser = true) are on the right.
                // For Admin, their own messages (msg.isUser = false) are on the right.
                const isOwnMessage = isAdmin ? !msg.isUser : msg.isUser;

                return (
                  <div key={msg.id} className={`flex gap-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-orange-100' : 'bg-indigo-100 dark:bg-indigo-900'}`}>
                        {isAdmin ? <User className="h-4 w-4 text-orange-600" /> : <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    )}
                    <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-baseline gap-2 mb-1`}>
                        <span className="text-xs font-medium text-slate-900 dark:text-white">
                          {isOwnMessage ? "You" : msg.sender}
                        </span>
                        <span className="text-[10px] text-slate-500">{msg.time}</span>
                      </div>
                      <div className={`p-3 sm:p-4 rounded-2xl text-sm ${
                        isOwnMessage 
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' 
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              {activeTicket.status === 'resolved' ? (
                <div className="text-center text-sm text-slate-500 py-2">
                  This ticket has been resolved. You cannot send new messages.
                </div>
              ) : (
                <div className="relative">
                  <Textarea 
                    placeholder="Type your reply here..." 
                    className="min-h-[80px] pr-12 resize-none" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 bottom-2 h-8 w-8"
                    disabled={!newMessage.trim()}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!isAdmin && activeTicket.status !== 'resolved' && (
                <p className="text-xs text-slate-500 mt-2">Support is online. Average reply time: ~10 mins.</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Ticket Selected</h3>
            <p className="text-slate-500">Select a ticket from the sidebar to view details or reply.</p>
          </div>
        )}
      </Card>
    </div>
  );
}