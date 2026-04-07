import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import {
  Search, BookOpen, CheckCircle, XCircle, Edit2, Trash2, Eye,
  ChevronLeft, ChevronRight, Filter, Clock, Star
} from "lucide-react";

type CourseStatus = "Published" | "Draft" | "Under Review" | "Rejected";

type Course = {
  id: number;
  title: string;
  instructor: string;
  category: string;
  status: CourseStatus;
  students: number;
  rating: number;
  createdAt: string;
  lastUpdated: string;
};

const initialCourses: Course[] = [
  { id: 1, title: "Full Stack Web Development", instructor: "Prof. Sarah Jenkins", category: "Web Dev", status: "Published", students: 450, rating: 4.8, createdAt: "2026-01-15", lastUpdated: "2026-03-20" },
  { id: 2, title: "Data Science Fundamentals", instructor: "Prof. James Wright", category: "Data Science", status: "Published", students: 380, rating: 4.6, createdAt: "2025-11-10", lastUpdated: "2026-02-15" },
  { id: 3, title: "Advanced Cybersecurity", instructor: "Prof. Aisha Patel", category: "Security", status: "Under Review", students: 0, rating: 0, createdAt: "2026-03-28", lastUpdated: "2026-03-28" },
  { id: 4, title: "React Native Mobile Apps", instructor: "Dr. Michael Torres", category: "Mobile", status: "Published", students: 340, rating: 4.5, createdAt: "2025-09-20", lastUpdated: "2026-01-10" },
  { id: 5, title: "Cloud Architecture with AWS", instructor: "Prof. Lisa Chen", category: "Cloud", status: "Draft", students: 0, rating: 0, createdAt: "2026-04-01", lastUpdated: "2026-04-01" },
  { id: 6, title: "Machine Learning with Python", instructor: "Prof. James Wright", category: "AI/ML", status: "Under Review", students: 0, rating: 0, createdAt: "2026-03-25", lastUpdated: "2026-03-30" },
  { id: 7, title: "DevOps Pipeline Mastery", instructor: "Dr. Michael Torres", category: "DevOps", status: "Published", students: 180, rating: 4.3, createdAt: "2025-08-15", lastUpdated: "2026-02-28" },
  { id: 8, title: "Blockchain Fundamentals", instructor: "Prof. Sarah Jenkins", category: "Web3", status: "Rejected", students: 0, rating: 0, createdAt: "2026-03-10", lastUpdated: "2026-03-15" },
  { id: 9, title: "UI/UX Design Principles", instructor: "Prof. Lisa Chen", category: "Design", status: "Published", students: 290, rating: 4.7, createdAt: "2025-10-05", lastUpdated: "2026-03-01" },
  { id: 10, title: "Kubernetes in Production", instructor: "Prof. Aisha Patel", category: "Cloud", status: "Draft", students: 0, rating: 0, createdAt: "2026-04-02", lastUpdated: "2026-04-02" },
];

const statusConfig: Record<CourseStatus, { variant: string; color: string }> = {
  "Published": { variant: "success", color: "text-emerald-600" },
  "Draft": { variant: "secondary", color: "text-slate-500" },
  "Under Review": { variant: "outline", color: "text-amber-600" },
  "Rejected": { variant: "destructive", color: "text-red-600" },
};

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [actionDialog, setActionDialog] = useState<{ course: Course; action: "approve" | "reject" | "delete" | "view" } | null>(null);
  const [editDialog, setEditDialog] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "" });
  const [processing, setProcessing] = useState(false);

  const PER_PAGE = 6;

  const filteredByTab = activeTab === "all" ? courses :
    activeTab === "published" ? courses.filter(c => c.status === "Published") :
    activeTab === "review" ? courses.filter(c => c.status === "Under Review") :
    activeTab === "draft" ? courses.filter(c => c.status === "Draft") :
    courses.filter(c => c.status === "Rejected");

  const filtered = filteredByTab.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleAction = (action: string) => {
    if (!actionDialog) return;
    setProcessing(true);
    setTimeout(() => {
      if (action === "approve") {
        setCourses(prev => prev.map(c => c.id === actionDialog.course.id ? { ...c, status: "Published" as CourseStatus, lastUpdated: new Date().toISOString().split("T")[0] } : c));
      } else if (action === "reject") {
        setCourses(prev => prev.map(c => c.id === actionDialog.course.id ? { ...c, status: "Rejected" as CourseStatus, lastUpdated: new Date().toISOString().split("T")[0] } : c));
      } else if (action === "delete") {
        setCourses(prev => prev.filter(c => c.id !== actionDialog.course.id));
      }
      setProcessing(false);
      setActionDialog(null);
    }, 800);
  };

  const handleEdit = () => {
    if (!editDialog) return;
    setProcessing(true);
    setTimeout(() => {
      setCourses(prev => prev.map(c => c.id === editDialog.id ? { ...c, title: editForm.title || c.title, category: editForm.category || c.category, lastUpdated: new Date().toISOString().split("T")[0] } : c));
      setProcessing(false);
      setEditDialog(null);
    }, 800);
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === "Published").length,
    review: courses.filter(c => c.status === "Under Review").length,
    draft: courses.filter(c => c.status === "Draft").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Course Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Review, approve, and manage all platform courses.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Courses", value: stats.total, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Published", value: stats.published, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Under Review", value: stats.review, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Drafts", value: stats.draft, icon: Edit2, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800" },
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

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">All Courses</CardTitle>
              <CardDescription>Manage course submissions and status.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search courses..." className="pl-8 bg-slate-50 dark:bg-slate-900" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
              <TabsTrigger value="review">Under Review ({stats.review})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({courses.filter(c => c.status === "Rejected").length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Students</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No courses found</p>
                  </TableCell>
                </TableRow>
              ) : paginated.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.instructor}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{course.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[course.status].variant as any} className="text-[10px] uppercase">
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500">{course.students || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {course.rating > 0 ? <span className="text-amber-500">★ {course.rating}</span> : <span className="text-slate-400">-</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" title="View" onClick={() => setActionDialog({ course, action: "view" })}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {course.status === "Under Review" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600" title="Approve" onClick={() => setActionDialog({ course, action: "approve" })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" title="Reject" onClick={() => setActionDialog({ course, action: "reject" })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" title="Edit" onClick={() => { setEditDialog(course); setEditForm({ title: course.title, category: course.category }); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" title="Delete" onClick={() => setActionDialog({ course, action: "delete" })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <span className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} courses</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">{currentPage}/{totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="sm:max-w-[450px]">
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionDialog.action === "view" && `Course Details`}
                  {actionDialog.action === "approve" && `Approve Course`}
                  {actionDialog.action === "reject" && `Reject Course`}
                  {actionDialog.action === "delete" && `Delete Course`}
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "view" && "Full course information."}
                  {actionDialog.action === "approve" && "This will make the course visible to all students."}
                  {actionDialog.action === "reject" && "The instructor will be notified of the rejection."}
                  {actionDialog.action === "delete" && "This action cannot be undone. All enrollments will be lost."}
                </DialogDescription>
              </DialogHeader>
              {actionDialog.action === "view" ? (
                <div className="space-y-3 py-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Title:</span><p className="font-medium">{actionDialog.course.title}</p></div>
                    <div><span className="text-slate-500">Instructor:</span><p className="font-medium">{actionDialog.course.instructor}</p></div>
                    <div><span className="text-slate-500">Category:</span><p className="font-medium">{actionDialog.course.category}</p></div>
                    <div><span className="text-slate-500">Status:</span><p className="font-medium">{actionDialog.course.status}</p></div>
                    <div><span className="text-slate-500">Students:</span><p className="font-medium">{actionDialog.course.students}</p></div>
                    <div><span className="text-slate-500">Rating:</span><p className="font-medium">{actionDialog.course.rating || "N/A"}</p></div>
                    <div><span className="text-slate-500">Created:</span><p className="font-medium">{actionDialog.course.createdAt}</p></div>
                    <div><span className="text-slate-500">Updated:</span><p className="font-medium">{actionDialog.course.lastUpdated}</p></div>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="font-medium text-sm">{actionDialog.course.title}</p>
                    <p className="text-xs text-slate-500">{actionDialog.course.instructor}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialog(null)}>
                  {actionDialog.action === "view" ? "Close" : "Cancel"}
                </Button>
                {actionDialog.action !== "view" && (
                  <Button
                    variant={actionDialog.action === "delete" || actionDialog.action === "reject" ? "destructive" : "default"}
                    className={actionDialog.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => handleAction(actionDialog.action)}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : actionDialog.action === "approve" ? "Approve" : actionDialog.action === "reject" ? "Reject" : "Delete"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-[450px]">
          {editDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
                <DialogDescription>Update course details.</DialogDescription>
              </DialogHeader>
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
                <Button onClick={handleEdit} disabled={processing} className="bg-purple-600 hover:bg-purple-700">
                  {processing ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
