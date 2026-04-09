import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Bell, BookOpen, Award, MessageSquare, CheckCircle, Megaphone, FileText, Star, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import apiService, { NotificationItem } from "../../services/api";

type NotificationFilter = "all" | "unread";

const iconMap: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  system: { icon: Bell, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900/20" },
  course_update: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  project_graded: { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  achievement: { icon: Award, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  message: { icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
};

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const fetchNotifications = async () => {
    try {
      setError("");
      const result = await apiService.getNotifications({ limit: 50 });
      setNotifications(result.items);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications),
    [filter, notifications]
  );

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setIsUpdating(true);
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to mark all notifications as read");
    } finally {
      setIsUpdating(false);
    }
  };

  const markRead = async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;

    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await apiService.markNotificationRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)));
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You are all caught up."}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === "all" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === "unread" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0 || isUpdating}>
            <Check className="h-4 w-4 mr-1.5" />
            {isUpdating ? "Updating..." : "Mark all read"}
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notifications</h3>
          <p className="text-sm text-slate-500 mt-1">{filter === "unread" ? "No unread notifications." : "Nothing to show yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, bg } = iconMap[notification.type] || iconMap.system;
              return (
                <motion.div key={notification._id} layout>
                  <Card
                    className={`transition-all cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 ${
                      !notification.isRead ? "border-l-4 border-l-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                    }`}
                    onClick={() => void markRead(notification._id)}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${bg} ${color} shrink-0 mt-0.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"} text-slate-900 dark:text-white`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                          </div>
                          {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" /> : null}
                        </div>
                        <span className="text-xs text-slate-500 mt-1.5 block">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
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
