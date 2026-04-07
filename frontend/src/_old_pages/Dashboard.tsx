import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { 
  PlayCircle, Clock, Award, TrendingUp, Calendar, BookOpen, Users, Star, CheckCircle, FileText, MessageSquare, DollarSign, Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { StudentDashboard } from "./student/StudentDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { role } = useAuth();

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'instructor') {
    return <InstructorDashboard />;
  }

  return <StudentDashboard />;
}

function InstructorDashboard() {
  const analyticsData = [
    { name: 'Mon', views: 400, enrollments: 24 },
    { name: 'Tue', views: 300, enrollments: 13 },
    { name: 'Wed', views: 550, enrollments: 45 },
    { name: 'Thu', views: 450, enrollments: 32 },
    { name: 'Fri', views: 600, enrollments: 55 },
    { name: 'Sat', views: 700, enrollments: 80 },
    { name: 'Sun', views: 800, enrollments: 110 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, Instructor! 🎓
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's your teaching overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/app/instructor/analytics">View Full Report</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/app/instructor/courses/new">Create Course</Link>
          </Button>
        </div>
      </div>

      {/* Instructor Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$12,450", change: "+14%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-100" },
          { title: "Total Students", value: "3,248", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
          { title: "Active Courses", value: "6", change: "+1", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-100" },
          { title: "Avg Rating", value: "4.8", change: "+0.2", icon: Star, color: "text-amber-500", bg: "bg-amber-100" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bg} dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center">
                <span className="text-emerald-500 font-medium flex items-center mr-1"><TrendingUp className="h-3 w-3 mr-0.5" /> {stat.change}</span> this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Course views vs enrollments this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" name="Course Views" />
                  <Area type="monotone" dataKey="enrollments" stroke="#6366f1" fill="none" name="New Enrollments" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Tasks requiring your action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">Project Reviews</h4>
                    <p className="text-xs text-slate-500">24 pending submissions</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild className="h-8">
                  <Link to="/app/instructor/projects">Review</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">Q&A Questions</h4>
                    <p className="text-xs text-slate-500">12 unanswered questions</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild className="h-8">
                  <Link to="/app/community">Reply</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">Quizzes to Grade</h4>
                    <p className="text-xs text-slate-500">5 pending grades</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8">Grade</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm"><Bell className="h-4 w-4 mr-2"/> All Notifications</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { student: "Alex Chen", action: "submitted project", course: "Advanced React", time: "2 hours ago", type: "project" },
                { student: "Emily Parker", action: "asked a question", course: "Web Dev Bootcamp", time: "5 hours ago", type: "comment" },
                { student: "David Kumar", action: "enrolled in", course: "Node.js Basics", time: "Yesterday", type: "enrollment" },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                  {i !== 2 && <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -z-10"></div>}
                  <div className={`p-2 rounded-full mt-1 bg-white dark:bg-slate-950 border ${act.type === 'project' ? 'border-orange-200 text-orange-600' : act.type === 'comment' ? 'border-blue-200 text-blue-600' : 'border-emerald-200 text-emerald-600'}`}>
                    {act.type === 'project' ? <FileText className="h-4 w-4" /> : act.type === 'comment' ? <MessageSquare className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p><span className="font-medium text-slate-900 dark:text-white">{act.student}</span> {act.action} <span className="font-medium text-indigo-600">{act.course}</span></p>
                    <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses (This Month)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Advanced React Patterns", students: 450, revenue: "$4,500", progress: 85 },
              { title: "Full-Stack Bootcamp", students: 320, revenue: "$3,200", progress: 65 },
              { title: "UI/UX for Developers", students: 210, revenue: "$2,100", progress: 40 },
            ].map((course, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">{course.title}</h4>
                  <span className="text-sm font-bold text-emerald-600">{course.revenue}</span>
                </div>
                <Progress value={course.progress} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
                <p className="text-xs text-slate-500">{course.students} new enrollments</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}