import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { PlusCircle, Search, Edit, Trash2, MoreVertical, Eye, Users, Loader2, Shield, Lock, Unlock, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/DropdownMenu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { useAuth } from "../../context/AuthContext";
import apiService, {
  Course,
  CourseAccessMode,
  CourseStudentAccessAction,
  CourseStudentAccessOverride,
  InstructorStudentRow,
} from "../../services/api";

export function InstructorCourses() {
  const { user, role } = useAuth();
  const isAdminView = role === "admin";

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessDialogCourse, setAccessDialogCourse] = useState<Course | null>(null);
  const [accessDialogStudents, setAccessDialogStudents] = useState<InstructorStudentRow[]>([]);
  const [accessModeDraft, setAccessModeDraft] = useState<CourseAccessMode>("open");
  const [paidPriceDraft, setPaidPriceDraft] = useState("200");
  const [accessStudentSearch, setAccessStudentSearch] = useState("");
  const [isAccessDialogLoading, setIsAccessDialogLoading] = useState(false);
  const [isAccessSaving, setIsAccessSaving] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const payload = await apiService.getCourses({ limit: 100 });
        const allCourses = payload.items;

        const filtered = role === "admin" ? allCourses : allCourses.filter((course) => course.instructor?._id === user?._id);
        setCourses(filtered);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourses();
  }, [role, user?._id]);

  const visibleCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch =
        !search.trim() ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (course.category || "").toLowerCase().includes(search.toLowerCase());

      const status = course.status || "draft";
      const matchStatus = statusFilter === "all" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [courses, search, statusFilter]);

  const visibleAccessStudents = useMemo(() => {
    const keyword = accessStudentSearch.trim().toLowerCase();
    if (!keyword) {
      return accessDialogStudents;
    }

    return accessDialogStudents.filter((student) => (
      student.name.toLowerCase().includes(keyword)
      || student.email.toLowerCase().includes(keyword)
    ));
  }, [accessDialogStudents, accessStudentSearch]);

  const readCourseAccessMode = (course: Course): CourseAccessMode => {
    if (course.accessMode === "paid" || course.accessMode === "locked") {
      return course.accessMode;
    }

    return "open";
  };

  const getStudentOverrideForCourse = (course: Course, studentId: string): CourseStudentAccessOverride => {
    const isLocked = Array.isArray(course.lockedStudentIds)
      && course.lockedStudentIds.some((id) => String(id) === studentId);

    if (isLocked) {
      return "locked";
    }

    const isUnlocked = Array.isArray(course.unlockedStudentIds)
      && course.unlockedStudentIds.some((id) => String(id) === studentId);

    if (isUnlocked) {
      return "unlocked";
    }

    return "none";
  };

  const closeAccessDialog = () => {
    setAccessDialogCourse(null);
    setAccessDialogStudents([]);
    setAccessStudentSearch("");
    setIsAccessDialogLoading(false);
    setIsAccessSaving(false);
  };

  const openAccessDialog = async (course: Course) => {
    setAccessDialogCourse(course);
    setAccessModeDraft(readCourseAccessMode(course));
    setPaidPriceDraft(String(Number(course.price || 0) > 0 ? Number(course.price || 0) : 200));
    setAccessStudentSearch("");
    setIsAccessDialogLoading(true);

    try {
      const payload = await apiService.getInstructorStudents({ courseId: course._id });
      setAccessDialogStudents(Array.isArray(payload.students) ? payload.students : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load course students");
      setAccessDialogStudents([]);
    } finally {
      setIsAccessDialogLoading(false);
    }
  };

  const handleSaveAccessMode = async () => {
    if (!accessDialogCourse) {
      return;
    }

    let paidPrice: number | undefined;
    if (accessModeDraft === "paid") {
      const parsed = Number(paidPriceDraft);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError("Paid price must be greater than 0 ETB.");
        return;
      }

      paidPrice = Number(parsed.toFixed(2));
    }

    setIsAccessSaving(true);
    setError("");

    try {
      const updated = await apiService.updateCourseAccessMode(accessDialogCourse._id, {
        mode: accessModeDraft,
        ...(accessModeDraft === "paid" && paidPrice !== undefined ? { paidPrice } : {}),
      });

      setCourses((prev) => prev.map((course) => (course._id === updated._id ? { ...course, ...updated } : course)));
      setAccessDialogCourse((prev) => (prev && prev._id === updated._id ? { ...prev, ...updated } : prev));

      if (accessModeDraft === "paid") {
        setPaidPriceDraft(String(Number(updated.price || paidPrice || 200)));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update access mode");
    } finally {
      setIsAccessSaving(false);
    }
  };

  const handleStudentAccessAction = async (studentId: string, action: CourseStudentAccessAction) => {
    if (!accessDialogCourse) {
      return;
    }

    setIsAccessSaving(true);
    setError("");

    try {
      const updated = await apiService.updateCourseStudentAccess(accessDialogCourse._id, {
        studentId,
        action,
      });

      setCourses((prev) => prev.map((course) => (
        course._id === updated.courseId
          ? {
              ...course,
              lockedStudentIds: updated.lockedStudentIds,
              unlockedStudentIds: updated.unlockedStudentIds,
            }
          : course
      )));

      setAccessDialogCourse((prev) => (
        prev && prev._id === updated.courseId
          ? {
              ...prev,
              lockedStudentIds: updated.lockedStudentIds,
              unlockedStudentIds: updated.unlockedStudentIds,
            }
          : prev
      ));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update student access");
    } finally {
      setIsAccessSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await apiService.deleteCourse(id);
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{isAdminView ? "All Courses" : "My Courses"}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdminView
              ? "Manage all instructor courses across the platform."
              : "Manage your courses and build lessons, resources, quizzes, and projects directly inside each course."}
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link to="/app/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={isAdminView ? "Search all courses..." : "Search your courses..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid gap-6">
        {visibleCourses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
            No courses found.
          </div>
        ) : (
          visibleCourses.map((course) => {
            const students = Array.isArray(course.students) ? course.students.length : 0;
            const revenue = Number(course.price || 0) * students;
            const status = course.status || "draft";
            const hasRatings = Number(course.numReviews || 0) > 0;
            const ratingText = hasRatings ? Number(course.rating || 0).toFixed(1) : "N/A";

            return (
              <Card key={course._id} className="overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <img
                    src={course.coverImage || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"}
                    alt={course.title}
                    className="w-full md:w-64 h-40 object-cover rounded-lg bg-slate-100"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2">
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/app/instructor/courses/${course._id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                Edit Course
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/app/courses/${course._id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                Open Course Workspace
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                              onClick={() => void handleDelete(course._id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <Badge variant={status === "published" ? "success" : status === "archived" ? "destructive" : "secondary"}>{status}</Badge>
                        <span>{course.category}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Students</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          {students}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Revenue</p>
                        <p className="font-semibold text-slate-900 dark:text-white">${revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Rating</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{ratingText}</p>
                      </div>
                      <div className="flex items-end justify-end">
                        <Button variant="outline" asChild>
                          <Link to={`/app/courses/${course._id}`}>Manage In Course</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
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
