import { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Bell, BookOpen, Award, MessageSquare, CheckCircle, Megaphone,
  FileText, Star, Check, Trash2, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Notification = {
  id: number;
  type: "course" | "quiz" | "badge" | "comment" | "announcement" | "project" | "certificate";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  { id: 1, type: "quiz", title: "Quiz Results: React Hooks", description: "You scored 95% on the React Hooks quiz! Great job!", time: "10 minutes ago", read: false },
  { id: 2, type: "project", title: "Project Feedback Received", description: "Prof. Sarah Jenkins reviewed your React Portfolio project. Grade: 95/100", time: "2 hours ago", read: false },
  { id: 3, type: "badge", title: "New Badge Unlocked!", description: "You earned the 'Code Ninja' badge for completing 10 coding challenges.", time: "5 hours ago", read: false },
  { id: 4, type: "announcement", title: "Platform Maintenance", description: "Scheduled maintenance on Saturday, Oct 12 from 2-4 AM EST.", time: "Yesterday", read: true },
  { id: 5, type: "course", title: "New Course Available", description: "DevOps Masterclass: Docker & Kubernetes is now available. Enroll today!", time: "Yesterday", read: true },
  { id: 6, type: "comment", title: "Reply to Your Post", description: "Emily Parker replied to your question about CSS Grid layouts.", time: "2 days ago", read: true },
  { id: 7, type: "certificate", title: "Certificate Ready", description: "Your certificate for 'Advanced React Patterns' is ready to download.", time: "3 days ago", read: true },
  { id: 8, type: "course", title: "Course Updated", description: "New lessons added to 'Full-Stack Web Development Bootcamp'. Check them out!", time: "4 days ago", read: true },
  { id: 9, type: "quiz", title: "New Quiz Available", description: "A new quiz for Module 3: Backend with Node.js is ready.", time: "5 days ago", read: true },
  { id: 10, type: "announcement", title: "Hackathon Announcement", description: "Join the Fall 2026 Hackathon! Registration opens next week.", time: "1 week ago", read: true },
];

const iconMap: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  course: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  quiz: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  badge: { icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  comment: { icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  announcement: { icon: Megaphone, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  project: { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  certificate: { icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
};

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === "all" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === "unread" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notifications</h3>
          <p className="text-sm text-slate-500 mt-1">
            {filter === "unread" ? "All notifications have been read." : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map(notification => {
              const { icon: Icon, color, bg } = iconMap[notification.type] || iconMap.course;
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`transition-all cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 ${
                      !notification.read ? "border-l-4 border-l-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                    }`}
                    onClick={() => markRead(notification.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${bg} ${color} shrink-0 mt-0.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-slate-900 dark:text-white`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500 mt-1.5 block">{notification.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
