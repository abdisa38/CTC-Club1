import { useState } from "react";
import { Search, Filter, Mail, MoreHorizontal, Download, TrendingUp, Award, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

export function InstructorStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    {
      id: "1",
      name: "Alex Chen",
      email: "alex.c@university.edu",
      avatar: "https://i.pravatar.cc/150?u=1",
      enrolled: "Sep 15, 2025",
      progress: 85,
      lastActive: "2 hours ago",
      courses: ["Advanced React Patterns", "CSS Architecture"],
      status: "active"
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "s.smith@university.edu",
      avatar: "https://i.pravatar.cc/150?u=2",
      enrolled: "Oct 01, 2025",
      progress: 42,
      lastActive: "1 day ago",
      courses: ["Full-Stack Web Development"],
      status: "active"
    },
    {
      id: "3",
      name: "David Kumar",
      email: "dkumar@university.edu",
      avatar: "https://i.pravatar.cc/150?u=3",
      enrolled: "Aug 20, 2025",
      progress: 100,
      lastActive: "3 days ago",
      courses: ["Advanced React Patterns"],
      status: "completed"
    },
    {
      id: "4",
      name: "Emily Parker",
      email: "eparker@university.edu",
      avatar: "https://i.pravatar.cc/150?u=4",
      enrolled: "Nov 05, 2025",
      progress: 15,
      lastActive: "2 weeks ago",
      courses: ["Full-Stack Web Development"],
      status: "inactive"
    }
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Track progress, engage with learners, and manage enrollments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Mail className="h-4 w-4 mr-2" /> Message All</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">1,248</h3>
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
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">64%</h3>
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
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">892</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full dark:bg-purple-900/30">
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 flex-1 sm:w-40">
              <option value="all">All Courses</option>
              <option value="react">Advanced React Patterns</option>
              <option value="web">Full-Stack Web Dev</option>
            </select>
            <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
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
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {student.courses.map((c, i) => (
                        <span key={i} className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]" title={c}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className={`h-2 ${student.progress === 100 ? 'bg-emerald-100' : ''}`} indicatorClassName={student.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'} />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={student.status === 'completed' ? 'success' : student.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-slate-500">No students found matching your search.</div>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
