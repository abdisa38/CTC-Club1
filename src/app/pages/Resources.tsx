import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search, Download, FileText, Image as ImageIcon, Code, Link as LinkIcon, Filter, Loader2, FolderOpen, Heart } from "lucide-react";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  size?: string;
  course?: string;
  courseCategory?: string;
  url?: string;
  date?: string;
};

type ResourceKind = "pdf" | "word" | "sheet" | "slide" | "archive" | "image" | "code" | "file";

const isVideoLike = (resource: ResourceItem) => {
  const type = String(resource.type || "").toLowerCase();
  const url = String(resource.url || "").toLowerCase();
  return type.includes("video") || /(\.mp4|\.mov|\.avi|\.mkv|\.webm)(\?|$)/i.test(url);
};

const toResourceKind = (resource: ResourceItem): ResourceKind => {
  const raw = `${resource.type || ""} ${resource.url || ""} ${resource.title || ""}`.toLowerCase();

  if (raw.includes("pdf") || raw.includes(".pdf")) return "pdf";
  if (raw.includes("msword") || raw.includes("word") || raw.includes("officedocument.wordprocessingml") || raw.includes(".doc") || raw.includes(".docx")) return "word";
  if (raw.includes("spreadsheet") || raw.includes("excel") || raw.includes("csv") || raw.includes(".xls") || raw.includes(".xlsx") || raw.includes(".csv")) return "sheet";
  if (raw.includes("presentation") || raw.includes("powerpoint") || raw.includes(".ppt") || raw.includes(".pptx")) return "slide";
  if (raw.includes("zip") || raw.includes("rar") || raw.includes("7z") || raw.includes("tar") || raw.includes("gzip")) return "archive";
  if (raw.includes("image") || raw.includes(".png") || raw.includes(".jpg") || raw.includes(".jpeg") || raw.includes(".gif") || raw.includes(".webp")) return "image";
  if (raw.includes("json") || raw.includes("javascript") || raw.includes("typescript") || raw.includes("xml") || raw.includes("yaml") || raw.includes(".js") || raw.includes(".ts")) return "code";
  return "file";
};

const kindLabel: Record<ResourceKind, string> = {
  pdf: "PDF",
  word: "Word",
  sheet: "Spreadsheet",
  slide: "Presentation",
  archive: "Archive",
  image: "Image",
  code: "Code",
  file: "File",
};

const iconForKind = (kind: ResourceKind) => {
  if (kind === "pdf") return { Icon: FileText, color: "text-red-500" };
  if (kind === "word") return { Icon: FileText, color: "text-blue-600" };
  if (kind === "sheet") return { Icon: FileText, color: "text-emerald-600" };
  if (kind === "slide") return { Icon: FileText, color: "text-orange-500" };
  if (kind === "archive" || kind === "code") return { Icon: Code, color: "text-indigo-500" };
  if (kind === "image") return { Icon: ImageIcon, color: "text-purple-500" };
  return { Icon: FileText, color: "text-slate-500" };
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

export function Resources() {
  const { role } = useAuth();
  const canFavorite = role === "student";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [favoriteResourceIds, setFavoriteResourceIds] = useState<Set<string>>(new Set());
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [payload, resourceFavorites] = await Promise.all([
          apiService.getDashboardResources(),
          canFavorite ? apiService.getFavoriteResources() : Promise.resolve([] as string[]),
        ]);

        const fileOnly = (Array.isArray(payload) ? payload : []).filter((item: ResourceItem) => !isVideoLike(item));
        setResources(fileOnly as ResourceItem[]);
        setFavoriteResourceIds(new Set(Array.isArray(resourceFavorites) ? resourceFavorites : []));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    };

    void loadResources();
  }, [canFavorite]);

  const toggleFavoriteResource = async (resourceId: string) => {
    if (!canFavorite || favoritingIds.has(resourceId)) {
      return;
    }

    const currentlyFavorite = favoriteResourceIds.has(resourceId);

    setFavoritingIds((prev) => {
      const next = new Set(prev);
      next.add(resourceId);
      return next;
    });

    try {
      if (currentlyFavorite) {
        await apiService.removeFavoriteResource(resourceId);
        setFavoriteResourceIds((prev) => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
      } else {
        await apiService.addFavoriteResource(resourceId);
        setFavoriteResourceIds((prev) => {
          const next = new Set(prev);
          next.add(resourceId);
          return next;
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update resource favorite");
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
    }
  };

  const courseOptions = useMemo(() => {
    return Array.from(new Set(resources.map((resource) => resource.course || "General"))).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const title = (resource.title || "").toLowerCase();
      const course = (resource.course || "").toLowerCase();
      const courseCategory = (resource.courseCategory || "").toLowerCase();
      const keyword = searchQuery.toLowerCase();
      const kind = toResourceKind(resource);

      const matchesType = filterType === "all" || kind === filterType;
      const matchesCourse = filterCourse === "all" || (resource.course || "General") === filterCourse;
      const matchesQuery = !keyword || title.includes(keyword) || course.includes(keyword) || courseCategory.includes(keyword);

      return matchesType && matchesCourse && matchesQuery;
    });
  }, [resources, filterType, filterCourse, searchQuery]);

  const groupedResources = useMemo(() => {
    const groups = new Map<string, ResourceItem[]>();

    filteredResources
      .slice()
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .forEach((resource) => {
        const key = resource.course || "General";
        const existing = groups.get(key) || [];
        existing.push(resource);
        groups.set(key, existing);
      });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredResources]);

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
          <p className="text-slate-500 dark:text-slate-400">Browse downloadable lesson resources by course. Video lessons are not listed here.</p>
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
            className="h-12 w-full sm:w-44 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="sheet">Spreadsheet</option>
            <option value="slide">Presentation</option>
            <option value="archive">Archive</option>
            <option value="image">Images</option>
            <option value="code">Code</option>
            <option value="file">Other Files</option>
          </select>
          <select
            className="h-12 w-full sm:w-56 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <Button variant="outline" className="h-12 px-4" size="icon" type="button">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {groupedResources.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">Try a different course, file type, or search keyword.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedResources.map(([courseName, items]) => (
            <section key={courseName} className="space-y-3">
              <Card className="bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                <CardHeader className="py-4">
                  <CardTitle className="text-base text-slate-900 dark:text-white">{courseName}</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(items[0]?.courseCategory || "General")} category • {items.length} resource{items.length === 1 ? "" : "s"}
                  </p>
                </CardHeader>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((resource) => {
                  const kind = toResourceKind(resource);
                  const { Icon, color } = iconForKind(kind);
                  const hasUrl = Boolean(resource.url);
                  const isFavorite = favoriteResourceIds.has(resource.id);

                  return (
                    <Card key={resource.id} className="group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors bg-white dark:bg-slate-950">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${color}`}>
                            <Icon className="h-8 w-8" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase text-slate-400">{kindLabel[kind]}</span>
                            {canFavorite ? (
                              <button
                                type="button"
                                onClick={() => void toggleFavoriteResource(resource.id)}
                                disabled={favoritingIds.has(resource.id)}
                                className="rounded-full p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60"
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isFavorite ? "text-red-500 fill-red-500" : "text-slate-500"}`} />
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{resource.title}</h3>
                        <p className="text-xs text-indigo-600 font-medium mb-4">{resource.courseCategory || "General"}</p>

                        <div className="mt-auto flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span>{resource.size || "-"}</span>
                          <span>{formatDate(resource.date)}</span>
                        </div>
                      </CardContent>

                      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="w-full text-xs h-9" asChild={hasUrl} disabled={!hasUrl}>
                          {hasUrl ? (
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          ) : (
                            <span>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Open
                            </span>
                          )}
                        </Button>

                        <Button className="w-full text-xs h-9" asChild={hasUrl} disabled={!hasUrl}>
                          {hasUrl ? (
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          ) : (
                            <span>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </span>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
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
