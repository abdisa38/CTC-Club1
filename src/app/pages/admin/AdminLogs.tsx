import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Search, Activity, Loader2, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import apiService from "../../services/api";

type ActivityLog = {
  id: string;
  action: string;
  category: "user" | "course" | "system" | "admin" | "auth" | string;
  user: string;
  timestamp: string;
  details: string;
  severity: "success" | "info" | "warning" | "error" | string;
};

const severityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
  if (severity === "success") return "success";
  if (severity === "warning") return "secondary";
  if (severity === "error") return "destructive";
  return "outline";
};

export function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const perPage = 10;

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await apiService.getActivityLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    void loadLogs();
  }, []);

  const filtered = useMemo(() => {
    const byTab = activeTab === "all" ? logs : logs.filter((log) => log.category === activeTab);

    return byTab.filter((log) => {
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        String(log.action || "").toLowerCase().includes(q) ||
        String(log.user || "").toLowerCase().includes(q) ||
        String(log.details || "").toLowerCase().includes(q)
      );
    });
  }, [activeTab, logs, search]);

  const categories = useMemo(() => {
    const values = new Set<string>(["all"]);
    logs.forEach((log) => values.add(log.category || "system"));
    return Array.from(values);
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Logs</h1>
        <p className="text-slate-500 dark:text-slate-400">Live activity events from users, courses, and support workflows.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Activity Feed</CardTitle>
              <CardDescription>Recent platform actions for auditing and monitoring.</CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(1);
            }}
            className="mt-4"
          >
            <TabsList className="flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
              No logs match your current filters.
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={severityVariant(log.severity)} className="text-[10px] uppercase">
                        {log.severity || "info"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {log.category || "system"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {log.user || "System"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="text-sm text-slate-500">{filtered.length} entries</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-300">{safePage}/{totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Logs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{logs.length}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
