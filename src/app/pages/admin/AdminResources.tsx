import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Search, FileText, Download, Trash2, Edit2, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

type ResourceStatus = "Approved" | "Pending" | "Rejected";

type Resource = {
  id: number;
  title: string;
  type: string;
  category: string;
  uploader: string;
  status: ResourceStatus;
  downloads: number;
  size: string;
  uploadedAt: string;
};

const initialResources: Resource[] = [
  { id: 1, title: "React Hooks Cheatsheet", type: "PDF", category: "Web Dev", uploader: "Prof. Jenkins", status: "Approved", downloads: 1245, size: "2.4 MB", uploadedAt: "2026-03-15" },
  { id: 2, title: "Python Data Structures Guide", type: "PDF", category: "Data Science", uploader: "Prof. Wright", status: "Approved", downloads: 890, size: "5.1 MB", uploadedAt: "2026-02-20" },
  { id: 3, title: "AWS Architecture Diagrams", type: "PDF", category: "Cloud", uploader: "Prof. Chen", status: "Pending", downloads: 0, size: "12.8 MB", uploadedAt: "2026-04-01" },
  { id: 4, title: "SQL Query Optimization", type: "PDF", category: "Database", uploader: "Dr. Torres", status: "Approved", downloads: 672, size: "1.8 MB", uploadedAt: "2026-01-10" },
  { id: 5, title: "Mobile UI Design Patterns", type: "Slides", category: "Design", uploader: "Prof. Chen", status: "Approved", downloads: 534, size: "8.2 MB", uploadedAt: "2025-12-05" },
  { id: 6, title: "Docker Compose Templates", type: "Code", category: "DevOps", uploader: "Dr. Torres", status: "Pending", downloads: 0, size: "0.5 MB", uploadedAt: "2026-04-02" },
  { id: 7, title: "Machine Learning Algorithms", type: "PDF", category: "AI/ML", uploader: "Prof. Wright", status: "Approved", downloads: 1102, size: "4.7 MB", uploadedAt: "2026-01-25" },
  { id: 8, title: "Cybersecurity Best Practices", type: "PDF", category: "Security", uploader: "Prof. Patel", status: "Rejected", downloads: 0, size: "3.2 MB", uploadedAt: "2026-03-28" },
];

export function AdminResources() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{ resource: Resource; action: "approve" | "reject" | "delete" | "view" } | null>(null);
  const [editDialog, setEditDialog] = useState<Resource | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "" });
  const [processing, setProcessing] = useState(false);

  const PER_PAGE = 6;

  const filteredByTab = activeTab === "all" ? resources :
    activeTab === "approved" ? resources.filter(r => r.status === "Approved") :
    activeTab === "pending" ? resources.filter(r => r.status === "Pending") :
    resources.filter(r => r.status === "Rejected");

  const filtered = filteredByTab.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.uploader.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleAction = (action: string) => {
    if (!actionDialog) return;
    setProcessing(true);
    setTimeout(() => {
      if (action === "approve") {
        setResources(prev => prev.map(r => r.id === actionDialog.resource.id ? { ...r, status: "Approved" as ResourceStatus } : r));
      } else if (action === "reject") {
        setResources(prev => prev.map(r => r.id === actionDialog.resource.id ? { ...r, status: "Rejected" as ResourceStatus } : r));
      } else if (action === "delete") {
        setResources(prev => prev.filter(r => r.id !== actionDialog.resource.id));
      }
      setProcessing(false);
      setActionDialog(null);
    }, 800);
  };

  const handleEdit = () => {
    if (!editDialog) return;
    setProcessing(true);
    setTimeout(() => {
      setResources(prev => prev.map(r => r.id === editDialog.id ? { ...r, title: editForm.title || r.title, category: editForm.category || r.category } : r));
      setProcessing(false);
      setEditDialog(null);
    }, 800);
  };

  const totalDownloads = resources.reduce((a, r) => a + r.downloads, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resource Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage all uploaded PDFs, slides, and code samples.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Resources", value: resources.length, icon: FileText, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Approved", value: resources.filter(r => r.status === "Approved").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Pending Review", value: resources.filter(r => r.status === "Pending").length, icon: FileText, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: Download, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Resources</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search resources..." className="pl-8 bg-slate-50 dark:bg-slate-900" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Downloads</TableHead>
                <TableHead className="hidden lg:table-cell">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No resources found</p>
                  </TableCell>
                </TableRow>
              ) : paginated.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{resource.title}</p>
                      <p className="text-xs text-slate-500">{resource.uploader} · {resource.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline">{resource.type}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={resource.status === "Approved" ? "success" : resource.status === "Pending" ? "outline" : "destructive"} className="text-[10px] uppercase">
                      {resource.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500">{resource.downloads.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500">{resource.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {resource.status === "Pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600" onClick={() => setActionDialog({ resource, action: "approve" })}><CheckCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => setActionDialog({ resource, action: "reject" })}><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" onClick={() => { setEditDialog(resource); setEditForm({ title: resource.title, category: resource.category }); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => setActionDialog({ resource, action: "delete" })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <span className="text-sm text-slate-500">{filtered.length} resources</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">{currentPage}/{totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle>{actionDialog.action === "delete" ? "Delete Resource" : actionDialog.action === "approve" ? "Approve Resource" : "Reject Resource"}</DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "delete" ? "This cannot be undone." : actionDialog.action === "approve" ? "This will make the resource available to all users." : "The uploader will be notified."}
                </DialogDescription>
              </DialogHeader>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg my-2">
                <p className="font-medium text-sm">{actionDialog.resource.title}</p>
                <p className="text-xs text-slate-500">{actionDialog.resource.uploader}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
                <Button variant={actionDialog.action === "approve" ? "default" : "destructive"} className={actionDialog.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => handleAction(actionDialog.action)} disabled={processing}>
                  {processing ? "Processing..." : actionDialog.action === "approve" ? "Approve" : actionDialog.action === "reject" ? "Reject" : "Delete"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={processing} className="bg-purple-600 hover:bg-purple-700">{processing ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
