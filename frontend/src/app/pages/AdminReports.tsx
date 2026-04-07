import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, BookOpen, Clock, Download,
  Calendar, ArrowUpRight, ArrowDownRight, Activity, GraduationCap, Target
} from "lucide-react";

const enrollmentTrendData = [
  { month: "Sep", students: 1820, instructors: 42 },
  { month: "Oct", students: 2100, instructors: 48 },
  { month: "Nov", students: 2450, instructors: 51 },
  { month: "Dec", students: 2200, instructors: 50 },
  { month: "Jan", students: 2890, instructors: 55 },
  { month: "Feb", students: 3200, instructors: 58 },
  { month: "Mar", students: 3650, instructors: 62 },
  { month: "Apr", students: 4100, instructors: 67 },
];

const weeklyEngagementData = [
  { day: "Mon", hours: 3.8, sessions: 520 },
  { day: "Tue", hours: 4.2, sessions: 610 },
  { day: "Wed", hours: 4.5, sessions: 680 },
  { day: "Thu", hours: 3.9, sessions: 545 },
  { day: "Fri", hours: 3.2, sessions: 430 },
  { day: "Sat", hours: 2.1, sessions: 280 },
  { day: "Sun", hours: 1.8, sessions: 210 },
];

const coursePerformanceData = [
  { name: "Web Development", enrolled: 450, completed: 320, rating: 4.8, revenue: 12500 },
  { name: "Data Science", enrolled: 380, completed: 210, rating: 4.6, revenue: 10800 },
  { name: "Cybersecurity", enrolled: 290, completed: 180, rating: 4.7, revenue: 8700 },
  { name: "Mobile Dev", enrolled: 340, completed: 245, rating: 4.5, revenue: 9900 },
  { name: "Cloud Computing", enrolled: 260, completed: 155, rating: 4.4, revenue: 7800 },
  { name: "AI/ML Basics", enrolled: 520, completed: 290, rating: 4.9, revenue: 15200 },
  { name: "DevOps", enrolled: 180, completed: 120, rating: 4.3, revenue: 5400 },
];

const completionRateData = [
  { name: "Completed", value: 1520, color: "#10b981" },
  { name: "In Progress", value: 980, color: "#6366f1" },
  { name: "Dropped", value: 320, color: "#f43f5e" },
  { name: "Not Started", value: 180, color: "#94a3b8" },
];

const retentionData = [
  { week: "W1", rate: 100 },
  { week: "W2", rate: 92 },
  { week: "W3", rate: 85 },
  { week: "W4", rate: 78 },
  { week: "W5", rate: 72 },
  { week: "W6", rate: 68 },
  { week: "W7", rate: 65 },
  { week: "W8", rate: 63 },
];

const topInstructors = [
  { name: "Prof. Sarah Jenkins", courses: 6, students: 890, rating: 4.9, completionRate: 82 },
  { name: "Prof. James Wright", courses: 8, students: 1240, rating: 4.8, completionRate: 78 },
  { name: "Prof. Aisha Patel", courses: 3, students: 420, rating: 4.7, completionRate: 85 },
  { name: "Dr. Michael Torres", courses: 5, students: 680, rating: 4.6, completionRate: 74 },
  { name: "Prof. Lisa Chen", courses: 4, students: 560, rating: 4.8, completionRate: 80 },
];

type TimeRange = "7d" | "30d" | "90d" | "1y";

export function AdminReports() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const statCards = [
    { title: "Total Enrollments", value: "12,450", change: "+12.5%", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Course Completion Rate", value: "68.4%", change: "+3.2%", up: true, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Avg. Learning Time", value: "4.2 hrs/wk", change: "-0.3 hrs", up: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Revenue (MTD)", value: "$48,200", change: "+18.7%", up: true, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Platform performance metrics, engagement data, and insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-emerald-600" : "text-red-500"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change} vs last period
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrollment Trend & Completion Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Trend</CardTitle>
            <CardDescription>Student and instructor growth over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="instructorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="r-grid-enroll" strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis key="r-x-enroll" dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis key="r-y-enroll" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip key="r-tip-enroll" contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Legend key="r-leg-enroll" />
                <Area key="r-area-students" type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} fill="url(#studentsGrad)" />
                <Area key="r-area-instructors" type="monotone" dataKey="instructors" stroke="#10b981" strokeWidth={2} fill="url(#instructorsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Breakdown</CardTitle>
            <CardDescription>Student course status overview.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  key="r-pie-completion"
                  data={completionRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {completionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="r-tip-pie" />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {completionRateData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Engagement & Retention */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Engagement</CardTitle>
            <CardDescription>Average learning hours and session count by day.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEngagementData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid key="r-grid-eng" strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis key="r-x-eng" dataKey="day" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis key="r-y-eng" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip key="r-tip-eng" contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Bar key="r-bar-hours" dataKey="hours" name="Avg Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Retention</CardTitle>
            <CardDescription>Cohort retention rate over 8 weeks.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid key="r-grid-ret" strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis key="r-x-ret" dataKey="week" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis key="r-y-ret" domain={[0, 100]} axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip key="r-tip-ret" formatter={(value: number) => [`${value}%`, "Retention"]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)" }} />
                <Line key="r-line-ret" type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: "#f43f5e" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Course Performance</CardTitle>
              <CardDescription>Detailed breakdown of all courses by key metrics.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> {coursePerformanceData.length} Active Courses
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Completion %</TableHead>
                <TableHead className="text-center hidden md:table-cell">Rating</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursePerformanceData.map((course) => {
                const completionPct = Math.round((course.completed / course.enrolled) * 100);
                return (
                  <TableRow key={course.name}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500 shrink-0" />
                        {course.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{course.enrolled}</TableCell>
                    <TableCell className="text-center">{course.completed}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${completionPct >= 70 ? "bg-emerald-500" : completionPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                        <span className="text-sm">{completionPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="flex items-center justify-center gap-1 text-amber-500">
                        ★ {course.rating}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell font-medium text-emerald-600">
                      ${course.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Instructors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Instructors</CardTitle>
          <CardDescription>Highest-performing instructors by student engagement and ratings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center hidden md:table-cell">Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topInstructors.map((instructor, idx) => (
                <TableRow key={instructor.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {instructor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{instructor.name}</span>
                        {idx === 0 && <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px]">Top Rated</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{instructor.courses}</TableCell>
                  <TableCell className="text-center">{instructor.students.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-amber-500">★ {instructor.rating}</span>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <Badge variant={instructor.completionRate >= 80 ? "success" : "secondary"}>
                      {instructor.completionRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
