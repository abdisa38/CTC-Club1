import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Download, TrendingUp, Award, Clock, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import apiService, { InstructorStudentRow, InstructorStudentsData } from "../../services/api";

const emptyData: InstructorStudentsData = {
  summary: {
    totalEnrolled: 0,
    avgCompletionRate: 0,
    activeThisWeek: 0,
  },
  courses: [],
  students: [],
};

const initials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "S";
};

const formatRelativeTime = (iso?: string | null): string => {
  if (!iso) return "No activity";
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return "No activity";

  const diff = Date.now() - target;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(iso).toLocaleDateString();
};

const statusVariant = (status: InstructorStudentRow["status"]): "success" | "secondary" | "outline" => {
  if (status === "completed") return "success";
  if (status === "active") return "secondary";
  return "outline";
};

export function InstructorStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [data, setData] = useState<InstructorStudentsData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      setError("");
      try {
        const payload = await apiService.getInstructorStudents();
        setData(payload);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return data.students.filter((student) => {
      const matchesKeyword = !keyword
        || student.name.toLowerCase().includes(keyword)
        || student.email.toLowerCase().includes(keyword)
        || student.courses.some((course) => course.title.toLowerCase().includes(keyword));

      const matchesCourse = courseFilter === "all" || student.courses.some((course) => course._id === courseFilter);
      return matchesKeyword && matchesCourse;
    });
  }, [data.students, searchTerm, courseFilter]);

  const filteredSummary = useMemo(() => {
    if (filteredStudents.length === 0) {
      return {
        totalEnrolled: 0,
        avgCompletionRate: 0,
        activeThisWeek: 0,
      };
    }

    const totalEnrolled = filteredStudents.length;
    const avgCompletionRate = Math.round(
      filteredStudents.reduce((sum, student) => sum + (student.progress || 0), 0) / totalEnrolled
    );
    const activeThisWeek = filteredStudents.filter((student) => {
      if (!student.lastActiveAt) return false;
      const diff = Date.now() - new Date(student.lastActiveAt).getTime();
      return Number.isFinite(diff) && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return { totalEnrolled, avgCompletionRate, activeThisWeek };
  }, [filteredStudents]);

  const exportCsv = () => {
    if (filteredStudents.length === 0) return;

    const header = ["Name", "Email", "Courses", "Progress", "Last Active", "Status"];
    const rows = filteredStudents.map((student) => [
      student.name,
      student.email,
      student.courses.map((course) => course.title).join(" | "),
      `${student.progress}%`,
      formatRelativeTime(student.lastActiveAt),
      student.status,
    ]);

    const escapeCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `instructor-students-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const messageAll = () => {
    const emails = filteredStudents.map((student) => student.email).filter(Boolean);
    if (emails.length === 0) return;

    const subject = encodeURIComponent("CTC Club Course Update");
    const body = encodeURIComponent("Hello learners,\n\n");
    window.location.href = `mailto:${emails.join(",")}?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track progress, engage with learners, and manage enrollments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={messageAll} disabled={filteredStudents.length === 0}>
            <Mail className="h-4 w-4 mr-2" /> Message All
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={filteredStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{filteredSummary.totalEnrolled.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Completion Rate</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{filteredSummary.avgCompletionRate}%</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active This Week</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{filteredSummary.activeThisWeek.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-violet-100 text-violet-600 rounded-full dark:bg-violet-900/30">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 w-full sm:w-48"
            >
              <option value="all">All Courses</option>
              {data.courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Enrolled Courses</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{initials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {student.courses.length > 0 ? (
                        student.courses.map((course) => (
                          <span key={course._id} className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]" title={course.title}>
                            {course.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">No course</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={student.progress}
                        className={`h-2 ${student.progress === 100 ? "bg-emerald-100" : ""}`}
                        indicatorClassName={student.progress === 100 ? "bg-emerald-500" : "bg-indigo-600"}
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{student.progress}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500">{formatRelativeTime(student.lastActiveAt)}</td>

                  <td className="px-6 py-4">
                    <Badge variant={statusVariant(student.status)} className="capitalize">{student.status}</Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-emerald-600"
                      onClick={() => {
                        window.location.href = `mailto:${student.email}`;
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No students found matching your filters.</div>
          ) : null}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing {filteredStudents.length} of {data.students.length} students</span>
        </div>
      </Card>
    </div>
  );
}