import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Progress } from "../../components/ui/Progress";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  PlayCircle, Clock, Award, TrendingUp, Calendar, BookOpen, Star, CheckCircle,
  FileText, MessageSquare, Bell, Flame, Zap, Target, Trophy, Heart,
  ChevronRight, Sparkles, GraduationCap, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Data
const enrolledCourses = [
  {
    id: "1", title: "Advanced React Patterns 2026", instructor: "Prof. Sarah Jenkins",
    progress: 75, lastLesson: "Custom Hooks Deep Dive", nextLesson: "Performance Optimization",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "2", title: "Data Structures in C++", instructor: "Dr. Alan Turing",
    progress: 32, lastLesson: "Linked Lists", nextLesson: "Binary Trees",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "3", title: "Full-Stack Web Development", instructor: "Prof. Michael Jordan",
    progress: 60, lastLesson: "Express.js Middleware", nextLesson: "MongoDB Queries",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "4", title: "Machine Learning Foundations", instructor: "Dr. Andrew Ng",
    progress: 15, lastLesson: "Linear Regression", nextLesson: "Gradient Descent",
    image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=400"
  },
];

const recommendedCourses = [
  { id: "5", title: "DevOps Masterclass", instructor: "Alex Chen", rating: 4.9, students: "3.1k", image: "https://images.unsplash.com/photo-1620912189868-30761e649ce4?auto=format&fit=crop&q=80&w=400", tags: ["Docker", "K8s"] },
  { id: "6", title: "UI/UX Design", instructor: "Sarah Jenkins", rating: 4.7, students: "5.4k", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400", tags: ["Figma", "CSS"] },
  { id: "7", title: "Cybersecurity Basics", instructor: "Dr. James Hale", rating: 4.8, students: "2.8k", image: "https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?auto=format&fit=crop&q=80&w=400", tags: ["Security", "Networks"] },
];

const recentActivity = [
  { title: "Completed Quiz: React Hooks", time: "2 hours ago", type: "quiz" as const, score: "95%", xp: 50 },
  { title: "Submitted Project: E-commerce API", time: "Yesterday", type: "project" as const, status: "Under Review" },
  { title: "Earned Badge: Code Ninja", time: "2 days ago", type: "badge" as const, xp: 100 },
  { title: "Completed Lesson: Express Middleware", time: "3 days ago", type: "lesson" as const, xp: 25 },
];

const badges = [
  { name: "Code Ninja", icon: "🥷", earned: true, desc: "10 challenges completed" },
  { name: "Quick Learner", icon: "⚡", earned: true, desc: "5 courses enrolled" },
  { name: "Fire Streak", icon: "🔥", earned: true, desc: "7-day streak" },
  { name: "Quiz Master", icon: "🧠", earned: true, desc: "5 quizzes passed" },
  { name: "Social Star", icon: "💬", earned: false, desc: "50 forum posts" },
  { name: "Perfectionist", icon: "💎", earned: false, desc: "100% on 3 quizzes" },
];

const notifications = [
  { id: 1, text: "New quiz available in React course", time: "10 min ago", unread: true },
  { id: 2, text: "Prof. Jenkins graded your project", time: "2 hours ago", unread: true },
  { id: 3, text: "Hackathon registration open!", time: "Yesterday", unread: false },
];

export function StudentDashboard({ metrics }: { metrics?: any }) {
  const [loading, setLoading] = useState(true);
  const [showBadgePopup, setShowBadgePopup] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowBadgePopup(true), 1500);
      const t2 = setTimeout(() => setShowBadgePopup(false), 5000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><Skeleton className="h-10 w-80 mb-2" /><Skeleton className="h-5 w-60" /></div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const xp = metrics?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  const xpToNext = level * 1000;
  const streak = metrics?.activeStreak || 0;

  return (
    <div className="space-y-6">
      {/* Badge Unlock Popup */}
      <AnimatePresence>
        {showBadgePopup && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="text-4xl">🏆</div>
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Badge Unlocked!</p>
              <h4 className="font-bold text-slate-900 dark:text-white">Quiz Master</h4>
              <p className="text-xs text-slate-500">Passed 5 quizzes with 90%+ score</p>
            </div>
            <button onClick={() => setShowBadgePopup(false)} className="text-slate-400 hover:text-slate-600 text-sm ml-2">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, Student! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's your learning journey at a glance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/app/notifications"><Bell className="h-4 w-4 mr-2" /> Notifications</Link>
          </Button>
          <Button asChild>
            <Link to="/app/courses">Find Courses</Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Courses in Progress", value: metrics?.enrolledCourses || 0, icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { title: "Completed Courses", value: metrics?.completedCourses || 0, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { title: "Learning Hours", value: "148h", icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
          { title: "Global Rank", value: "#12", icon: Trophy, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* XP, Level & Streak Bar */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10" />
        <CardContent className="p-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs opacity-80">Level {level}</p>
                  <p className="text-2xl font-bold">{xp.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-white/20" />
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Flame className="h-7 w-7 text-orange-300" />
                </div>
                <div>
                  <p className="text-xs opacity-80">Daily Streak</p>
                  <p className="text-2xl font-bold">{streak} Days</p>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <div className="flex justify-between text-xs opacity-80 mb-1">
                <span>Progress to Level {level + 1}</span>
                <span>{xp}/{xpToNext} XP</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(xp / xpToNext) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-xs opacity-80 mt-1 text-right">{xpToNext - xp} XP to next level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Continue Learning + Enrolled */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning - Hero */}
          <Card className="overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-indigo-600" /> Continue Learning
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/courses">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.slice(0, 2).map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  <img src={course.image} alt={course.title} className="h-20 w-32 rounded-lg object-cover bg-slate-100 hidden sm:block" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link to={`/app/courses/${course.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors block truncate">
                          {course.title}
                        </Link>
                        <p className="text-xs text-slate-500">{course.instructor}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{course.progress}%</Badge>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                    <p className="text-xs text-slate-500">
                      Next: <span className="text-indigo-600 font-medium">{course.nextLesson}</span>
                    </p>
                  </div>
                  <Button size="icon" variant="outline" className="rounded-full shrink-0 h-10 w-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all" asChild>
                    <Link to={`/app/courses/${course.id}/lessons/l3`}>
                      <PlayCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* All Enrolled Courses */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enrolled Courses</CardTitle>
                <Badge variant="secondary">{enrolledCourses.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {enrolledCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/app/courses/${course.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group bg-white dark:bg-slate-950"
                  >
                    <img src={course.image} alt={course.title} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{course.progress}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex gap-3 items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full shrink-0 ${
                      act.type === 'quiz' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                      act.type === 'project' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                      act.type === 'badge' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                      'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                    }`}>
                      {act.type === 'quiz' ? <CheckCircle className="h-4 w-4" /> :
                       act.type === 'project' ? <FileText className="h-4 w-4" /> :
                       act.type === 'badge' ? <Award className="h-4 w-4" /> :
                       <BookOpen className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {act.score && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">{act.score}</Badge>}
                      {act.status && <Badge variant="outline" className="text-xs">{act.status}</Badge>}
                      {act.xp && <span className="text-xs font-bold text-indigo-600">+{act.xp} XP</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Notifications Mini */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" /> Notifications
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/notifications">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-2.5 rounded-lg text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${n.unread ? '' : 'opacity-60'}`}>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />}
                  {!n.unread && <span className="h-2 w-2 rounded-full bg-transparent mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-snug">{n.text}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" /> Badges
                </CardTitle>
                <span className="text-xs text-slate-500">{badges.filter(b => b.earned).length}/{badges.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {badges.map((badge, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center p-3 rounded-xl text-center transition-colors ${
                      badge.earned
                        ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30"
                        : "bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 opacity-40"
                    }`}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-900 dark:text-white leading-tight">{badge.name}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">{badge.desc}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" /> Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Hackathon Kickoff", date: "Oct 15, 6:00 PM", type: "Competition", color: "border-purple-500" },
                { title: "Guest Lecture: AI in 2026", date: "Oct 18, 2:00 PM", type: "Seminar", color: "border-blue-500" },
                { title: "Quiz Due: React Hooks", date: "Oct 20, 11:59 PM", type: "Deadline", color: "border-red-500" },
              ].map((event, i) => (
                <div key={i} className={`flex gap-3 items-start border-l-2 ${event.color} pl-3 py-1`}>
                  <div>
                    <h5 className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-500">{event.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard Mini */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Top Students
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/leaderboard">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Alex Chen", xp: "21,500", rank: 1, avatar: "https://i.pravatar.cc/150?u=1" },
                { name: "Emily Parker", xp: "18,200", rank: 2, avatar: "https://i.pravatar.cc/150?u=3" },
                { name: "You", xp: "2,450", rank: 12, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150", isYou: true },
              ].map((user, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${user.isYou ? 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm w-5 text-center ${user.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {user.rank}
                    </span>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`text-sm font-medium ${user.isYou ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{user.name}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{user.xp} XP</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended Courses */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Recommended For You
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/courses">Browse all <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link to={`/app/courses/${course.id}`} className="group block">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <PlayCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mb-1">
                    <Star className="h-3 w-3 fill-amber-500" /> {course.rating}
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-500">{course.students} students</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{course.instructor}</p>
                  <div className="flex gap-1.5 mt-2">
                    {course.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
