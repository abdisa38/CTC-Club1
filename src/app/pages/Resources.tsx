import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search, Download, Eye, FileText, Image as ImageIcon, Code, Link as LinkIcon, Filter, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import apiService from "../services/api";

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  size?: string;
  course?: string;
  url?: string;
  date?: string;
};

const iconForType = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("pdf")) return { Icon: FileText, color: "text-red-500" };
  if (normalized.includes("image") || normalized.includes("design")) return { Icon: ImageIcon, color: "text-purple-500" };
  if (normalized.includes("code") || normalized.includes("zip") || normalized.includes("json") || normalized.includes("js")) {
    return { Icon: Code, color: "text-indigo-500" };
  }
  if (normalized.includes("video")) return { Icon: Eye, color: "text-emerald-500" };
  return { Icon: FileText, color: "text-slate-500" };
};

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        const payload = await apiService.getDashboardResources();
        setResources(payload as ResourceItem[]);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    };

    void loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const type = (resource.type || "file").toLowerCase();
      const title = (resource.title || "").toLowerCase();
      const course = (resource.course || "").toLowerCase();
      const keyword = searchQuery.toLowerCase();

      const matchesType = filterType === "all" || type.includes(filterType.toLowerCase());
      const matchesQuery = !keyword || title.includes(keyword) || course.includes(keyword);

      return matchesType && matchesQuery;
    });
  }, [resources, filterType, searchQuery]);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resource Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Download live course materials and shared resources.</p>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input placeholder="Search resources..." className="pl-10 h-12 bg-white dark:bg-slate-950" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select
            className="h-12 w-full sm:w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="code">Code</option>
            <option value="image">Images</option>
            <option value="video">Video</option>
          </select>
          <Button variant="outline" className="h-12 px-4" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">Try changing your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResources.map((resource) => {
            const { Icon, color } = iconForType(resource.type || "file");
            const canPreview = (resource.type || "").toLowerCase().includes("pdf") || (resource.type || "").toLowerCase().includes("video");

            return (
              <Card key={resource.id} className="group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors bg-white dark:bg-slate-950">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] uppercase text-slate-400">{(resource.type || "file").replace("_", " ")}</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{resource.title}</h3>
                  <p className="text-xs text-indigo-600 font-medium mb-4">{resource.course || "General"}</p>

                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>{resource.size || "-"}</span>
                    <span>{resource.date ? new Date(resource.date).toLocaleDateString() : "-"}</span>
                  </div>
                </CardContent>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  {canPreview ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full text-xs h-9">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{resource.title}</DialogTitle>
                          <DialogDescription>{resource.course || "General"}</DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
                          Preview is available from the original resource URL.
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="secondary" className="w-full text-xs h-9" asChild>
                      <a href={resource.url || "#"} target="_blank" rel="noreferrer">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  )}

                  <Button className="w-full text-xs h-9" asChild>
                    <a href={resource.url || "#"} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
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
