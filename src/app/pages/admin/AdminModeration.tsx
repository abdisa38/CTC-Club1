import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Flag, Trash2, AlertTriangle, ShieldAlert, CheckCircle, Eye, MessageSquare, BookOpen, FileText } from "lucide-react";

type FlaggedItem = {
  id: number;
  type: "comment" | "course" | "resource";
  title: string;
  content: string;
  reportedBy: string;
  author: string;
  reason: string;
  reportedAt: string;
  status: "Pending" | "Reviewed" | "Removed" | "Dismissed";
};

const initialItems: FlaggedItem[] = [
  { id: 1, type: "comment", title: "Comment on 'Web Dev Basics'", content: "This is completely wrong information. The instructor doesn't know what they're talking about. [offensive content redacted]", reportedBy: "Alex Chen", author: "anon_user_42", reason: "Inappropriate language", reportedAt: "2026-04-05", status: "Pending" },
  { id: 2, type: "course", title: "Free Bitcoin Mining Course", content: "Learn how to mine bitcoin for free! This course will teach you secret methods to earn passive income...", reportedBy: "Prof. Jenkins", author: "new_instructor_99", reason: "Spam / Misleading content", reportedAt: "2026-04-04", status: "Pending" },
  { id: 3, type: "comment", title: "Comment on 'Data Science'", content: "Stop asking stupid questions in the forum. If you can't figure this out, you shouldn't be here.", reportedBy: "Maria Rodriguez", author: "Liam O'Brien", reason: "Harassment / Bullying", reportedAt: "2026-04-03", status: "Pending" },
  { id: 4, type: "resource", title: "Cracked Software Links.pdf", content: "Contains links to pirated software downloads.", reportedBy: "System (Auto-mod)", author: "unknown_user", reason: "Copyright violation", reportedAt: "2026-04-02", status: "Removed" },
  { id: 5, type: "comment", title: "Forum post in 'Cybersecurity'", content: "Here's how to hack into your school's grading system...", reportedBy: "Prof. Patel", author: "hacker_student", reason: "Promoting illegal activity", reportedAt: "2026-04-01", status: "Removed" },
];

const typeIcons = { comment: MessageSquare, course: BookOpen, resource: FileText };

export function AdminModeration() {
  const [items, setItems] = useState<FlaggedItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionDialog, setActionDialog] = useState<{ item: FlaggedItem; action: "remove" | "warn" | "ban" | "dismiss" | "view" } | null>(null);
  const [processing, setProcessing] = useState(false);

  const filteredByTab = activeTab === "all" ? items :
    activeTab === "pending" ? items.filter(i => i.status === "Pending") :
    items.filter(i => i.status === "Removed" || i.status === "Reviewed" || i.status === "Dismissed");

  const handleAction = (action: string) => {
    if (!actionDialog) return;
    setProcessing(true);
    setTimeout(() => {
      if (action === "remove") {
        setItems(prev => prev.map(i => i.id === actionDialog.item.id ? { ...i, status: "Removed" as const } : i));
      } else if (action === "dismiss") {
        setItems(prev => prev.map(i => i.id === actionDialog.item.id ? { ...i, status: "Dismissed" as const } : i));
      } else if (action === "warn" || action === "ban") {
        setItems(prev => prev.map(i => i.id === actionDialog.item.id ? { ...i, status: "Reviewed" as const } : i));
      }
      setProcessing(false);
      setActionDialog(null);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Content Moderation</h1>
        <p className="text-slate-500 dark:text-slate-400">Review flagged content and take moderation actions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Pending Review</p><p className="text-2xl font-bold text-amber-600">{items.filter(i => i.status === "Pending").length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Content Removed</p><p className="text-2xl font-bold text-red-600">{items.filter(i => i.status === "Removed").length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Total Reports</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({items.filter(i => i.status === "Pending").length})</TabsTrigger>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredByTab.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">No flagged content</p>
              <p className="text-sm text-slate-400">All clear! No items require moderation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredByTab.map((item) => {
                const Icon = typeIcons[item.type];
                return (
                  <div key={item.id} className={`p-4 rounded-lg border transition-colors ${item.status === "Pending" ? "border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/10" : "border-slate-200 dark:border-slate-800"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.status === "Pending" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                          <Icon className={`h-4 w-4 ${item.status === "Pending" ? "text-amber-600" : "text-slate-500"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                            <Badge variant={item.status === "Pending" ? "outline" : item.status === "Removed" ? "destructive" : item.status === "Dismissed" ? "secondary" : "success"} className="text-[10px] uppercase">{item.status}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2 italic">"{item.content}"</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                            <span><Flag className="h-3 w-3 inline mr-1" />Reason: {item.reason}</span>
                            <span>By: {item.author}</span>
                            <span>Reported by: {item.reportedBy}</span>
                            <span>{item.reportedAt}</span>
                          </div>
                        </div>
                      </div>
                      {item.status === "Pending" && (
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700" onClick={() => setActionDialog({ item, action: "dismiss" })}>Dismiss</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700" onClick={() => setActionDialog({ item, action: "warn" })}>
                            <AlertTriangle className="h-3 w-3 mr-1" /> Warn
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700" onClick={() => setActionDialog({ item, action: "remove" })}>
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700" onClick={() => setActionDialog({ item, action: "ban" })}>
                            <ShieldAlert className="h-3 w-3 mr-1" /> Ban User
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="sm:max-w-[420px]">
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionDialog.action === "remove" && "Remove Content"}
                  {actionDialog.action === "warn" && "Warn User"}
                  {actionDialog.action === "ban" && "Ban User"}
                  {actionDialog.action === "dismiss" && "Dismiss Report"}
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "remove" && "This will permanently remove the content."}
                  {actionDialog.action === "warn" && `Send a warning to ${actionDialog.item.author}. Three warnings result in a ban.`}
                  {actionDialog.action === "ban" && `This will permanently ban ${actionDialog.item.author} from the platform.`}
                  {actionDialog.action === "dismiss" && "This will mark the report as dismissed (false positive)."}
                </DialogDescription>
              </DialogHeader>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg my-2">
                <p className="text-xs text-slate-500">Content:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 italic">"{actionDialog.item.content.slice(0, 120)}..."</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
                <Button
                  variant={actionDialog.action === "dismiss" ? "default" : "destructive"}
                  onClick={() => handleAction(actionDialog.action)}
                  disabled={processing}
                >
                  {processing ? "Processing..." : actionDialog.action === "remove" ? "Remove Content" : actionDialog.action === "warn" ? "Send Warning" : actionDialog.action === "ban" ? "Ban User" : "Dismiss"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
