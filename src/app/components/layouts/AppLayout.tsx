import { Outlet, Link, useLocation, Navigate } from "react-router";
import {
  LayoutDashboard, BookOpen, FileText, CheckSquare,
  MessageSquare, Trophy, Settings, Bell, Search, Menu, Focus,
  Users, BarChart3, HelpCircle, Shield, PlusCircle, Star,
  Megaphone, CalendarDays, Activity, Flag, Database, Heart, Award, GraduationCap, X, LogOut, ChevronRight
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { cn } from "../../utils/cn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/DropdownMenu";
import { useAuth } from "../../context/AuthContext";
import apiService, { AdminSearchData, AdminSearchItem, InstructorSearchData, InstructorSearchItem, NotificationItem } from "../../services/api";
import ctcLogo from "../../../assets/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";

type HeaderSearchItem = AdminSearchItem | InstructorSearchItem;
type HeaderSearchResult = AdminSearchData | InstructorSearchData;

export function AppLayout() {
  const location = useLocation();
  const { role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<HeaderSearchResult | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const formatRelativeTime = (dateValue: string) => {
    const date = new Date(dateValue);
    if (!Number.isFinite(date.getTime())) {
      return "just now";
    }

    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "just now";
    if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
    if (diffMs < day) return `${Math.max(1, Math.floor(diffMs / hour))}h ago`;
    return `${Math.max(1, Math.floor(diffMs / day))}d ago`;
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const payload = await apiService.getNotifications({ limit: 8 });
      setNotifications(Array.isArray(payload.items) ? payload.items : []);
    } catch (err: any) {
      setNotificationsError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return;
    }

    try {
      await apiService.markNotificationRead(notification._id);
      setNotifications((prev) => prev.map((item) => (
        item._id === notification._id
          ? { ...item, isRead: true }
          : item
      )));
    } catch {
      // Ignore dropdown mark-read errors to keep navigation smooth.
    }
  };

  const searchTypeIcon = (item: HeaderSearchItem) => {
    if (item.type === "user" || item.type === "student") return Users;
    if (item.type === "course") return BookOpen;
    if (item.type === "ticket" || item.type === "discussion") return MessageSquare;
    if (item.type === "announcement") return Megaphone;
    if (item.type === "project") return Focus;
    if (item.type === "submission") return CheckSquare;
    return CalendarDays;
  };

  useEffect(() => {
    void fetchNotifications();
  }, [user?._id]);

  useEffect(() => {
    if (role !== "admin" && role !== "instructor") {
      setSearchResult(null);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const keyword = searchQuery.trim();
    if (keyword.length < 2) {
      setSearchResult(null);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    let ignore = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const result = role === "admin"
          ? await apiService.adminGlobalSearch(keyword)
          : await apiService.instructorGlobalSearch(keyword);

        if (!ignore) {
          setSearchResult(result);
        }
      } catch (err: any) {
        if (!ignore) {
          setSearchResult(null);
          setSearchError(err?.response?.data?.message || "Search failed");
        }
      } finally {
        if (!ignore) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [role, searchQuery]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname.startsWith('/app/admin') && role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (location.pathname.startsWith('/app/instructor') && role !== 'instructor' && role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const sidebarNavs = {
    student: [
      { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { title: "Courses", href: "/app/courses", icon: BookOpen },
      { title: "Resources", href: "/app/resources", icon: FileText },
      { title: "Projects", href: "/app/projects", icon: Focus },
      { title: "Community", href: "/app/community", icon: MessageSquare },
      { title: "Support", href: "/app/support", icon: HelpCircle },
      { title: "Leaderboard", href: "/app/leaderboard", icon: Trophy },
      { title: "Favorites", href: "/app/favorites", icon: Heart },
      { title: "Certificates", href: "/app/certificates", icon: GraduationCap },
    ],
    instructor: [
      { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { title: "My Courses", href: "/app/instructor/courses", icon: BookOpen },
      { title: "Quizzes", href: "/app/instructor/quizzes", icon: CheckSquare },
      { title: "Create Course", href: "/app/instructor/courses/new", icon: PlusCircle },
      { title: "Students", href: "/app/instructor/students", icon: Users },
      { title: "Projects Review", href: "/app/instructor/projects", icon: CheckSquare },
      { title: "Discussions", href: "/app/instructor/comments", icon: MessageSquare },
      { title: "Analytics", href: "/app/instructor/analytics", icon: BarChart3 },
      { title: "Resources", href: "/app/resources", icon: FileText },
    ],
    admin: [
      { title: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
      { title: "Users", href: "/app/admin/users", icon: Users },
      { title: "Courses", href: "/app/admin/courses", icon: BookOpen },
      { title: "Resources", href: "/app/admin/resources", icon: FileText },
      { title: "Tickets", href: "/app/admin/tickets", icon: HelpCircle },
      { title: "Analytics", href: "/app/admin/analytics", icon: BarChart3 },
      { title: "Announcements", href: "/app/admin/announcements", icon: Megaphone },
      { title: "Events", href: "/app/admin/events", icon: CalendarDays },
      { title: "Moderation", href: "/app/admin/moderation", icon: Flag },
      { title: "Logs", href: "/app/admin/logs", icon: Activity },
      { title: "Settings", href: "/app/admin/settings", icon: Settings },
    ]
  };

  const currentNav = sidebarNavs[role] || sidebarNavs.student;

  const roleConfig = {
    student: { color: "indigo", gradient: "from-indigo-600 to-violet-600", bg: "bg-indigo-600", lightBg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", iconText: "text-indigo-500 dark:text-indigo-400" },
    instructor: { color: "emerald", gradient: "from-emerald-600 to-teal-600", bg: "bg-emerald-600", lightBg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", iconText: "text-emerald-500 dark:text-emerald-400" },
    admin: { color: "violet", gradient: "from-violet-600 to-purple-600", bg: "bg-violet-600", lightBg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", iconText: "text-violet-500 dark:text-violet-400" },
  };
  const rc = roleConfig[role] || roleConfig.student;

  const isActive = (href: string) => {
    if (href === '/app/admin') return location.pathname === '/app/admin';
    return location.pathname.startsWith(href) &&
      (href !== '/app/courses' || location.pathname === '/app/courses' || location.pathname.startsWith('/app/courses/'));
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b border-slate-100 dark:border-slate-800/50 px-5 shrink-0">
        <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img src={ctcLogo} alt="CTC" className="h-8 w-8 rounded-lg transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              CTC Club
            </span>
            <span className={cn("text-[10px] font-semibold uppercase tracking-widest", rc.text)}>
              {role} Panel
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-0.5">
          {currentNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 relative group",
                  active
                    ? `${rc.lightBg} ${rc.text} font-semibold`
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full", rc.bg)}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? rc.iconText : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/50 p-3 shrink-0 space-y-0.5">
        <Link
          to="/app/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="h-[18px] w-[18px] text-slate-400" />
          Settings
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50/50 dark:bg-[#0c0f1a] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] flex-col border-r border-slate-200/60 bg-white md:flex dark:border-slate-800/40 dark:bg-[#0c0f1a] h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-white dark:bg-[#0c0f1a] z-50 shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden h-full pb-16 md:pb-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 md:px-6 dark:border-slate-800/40 dark:bg-[#0c0f1a]/80">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="font-bold text-base text-slate-900 dark:text-white">CTC Club</span>
          </div>

          <div className="hidden flex-1 items-center gap-4 md:flex max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder={
                  role === "admin"
                    ? "Search users, courses, tickets, announcements, events..."
                    : role === "instructor"
                      ? "Search your courses, students, projects, discussions..."
                      : "Search anything..."
                }
                className="pl-9 bg-slate-50/80 border-slate-200/60 focus-visible:bg-white focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 transition-all rounded-xl h-10 text-sm dark:bg-white/5 dark:border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {(role === "admin" || role === "instructor") && searchQuery.trim().length >= 2 ? (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-[#131827] z-50 overflow-hidden">
                  {searchLoading ? (
                    <div className="p-3 text-xs text-slate-500 dark:text-slate-400">Searching...</div>
                  ) : searchError ? (
                    <div className="p-3 text-xs text-red-600 dark:text-red-300">{searchError}</div>
                  ) : (searchResult?.items || []).length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 dark:text-slate-400">No matching records found.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {(searchResult?.items || []).slice(0, 12).map((item) => {
                        const Icon = searchTypeIcon(item);

                        return (
                          <Link
                            key={`${item.type}-${item.id}`}
                            to={item.href}
                            onClick={() => setSearchQuery("")}
                            className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <div className="mt-0.5 rounded-md bg-slate-100 p-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle || item.type}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex gap-2 rounded-lg h-9 text-xs font-semibold border-slate-200/60 dark:border-white/10">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="capitalize">{role || 'Student'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-200/60 dark:border-white/10">
                <DropdownMenuLabel className="text-xs text-slate-500">Current Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg text-sm bg-slate-100 dark:bg-slate-800 capitalize pointer-events-none">
                  {role || 'Student'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu onOpenChange={(open) => {
              if (open) {
                void fetchNotifications();
              }
            }}>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <Bell className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
                  {unreadNotificationCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0c0f1a]" />
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border-slate-200/60 dark:border-white/10">
                <DropdownMenuLabel className="text-sm flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-slate-500">{unreadNotificationCount} unread</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-3 text-xs text-slate-500">Loading notifications...</div>
                  ) : notificationsError ? (
                    <div className="p-3 text-xs text-red-600 dark:text-red-300">{notificationsError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">No notifications yet.</div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification._id} className="p-0 mx-1 rounded-lg">
                        <Link
                          to={notification.link || "/app/notifications"}
                          onClick={() => {
                            void markNotificationRead(notification);
                          }}
                          className={`flex w-full flex-col items-start gap-1 p-3 cursor-pointer rounded-lg ${!notification.isRead ? "bg-indigo-50/70 dark:bg-indigo-900/20" : ""}`}
                        >
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{notification.title}</span>
                          <span className="text-xs text-slate-500 line-clamp-2">{notification.message}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(notification.createdAt)}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className={cn("h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0c0f1a] transition-all hover:ring-indigo-400",
                  role === 'student' ? "ring-indigo-200 dark:ring-indigo-800" :
                  role === 'instructor' ? "ring-emerald-200 dark:ring-emerald-800" :
                  "ring-violet-200 dark:ring-violet-800"
                )}>
                  <AvatarImage src={
                    role === 'student' ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" :
                    role === 'instructor' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" :
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                  } />
                  <AvatarFallback className="text-xs font-semibold">U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200/60 dark:border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none capitalize">{user.name}</p>
                    <p className="text-xs leading-none text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg"><Link to="/app/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg"><Link to="/app/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()} 
                  className="rounded-lg text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#0c0f1a]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl p-1.5 md:hidden z-50 flex justify-around dark:bg-[#0c0f1a]/90 dark:border-slate-800/40">
        {currentNav.slice(0, 4).map((item) => {
          const active = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all",
                active ? rc.text : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && rc.iconText)} />
              <span>{item.title}</span>
            </Link>
          );
        })}
        <Link
          to="/app/settings"
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium text-slate-400 transition-all"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
