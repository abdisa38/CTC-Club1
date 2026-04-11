import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Star, Clock, Users, PlayCircle, Heart, FileText, Bookmark, Loader2, Trash2 } from "lucide-react";
import apiService from "../../services/api";

type CourseItem = {
  _id: string;
  title: string;
  coverImage?: string;
  category?: string;
  instructor?: { name?: string };
  students?: Array<string | { _id: string }>;
  rating?: number;
  numReviews?: number;
};

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  size?: string;
  course?: string;
  url?: string;
  date?: string;
};

export function Favorites() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  const [removingCourseIds, setRemovingCourseIds] = useState<Set<string>>(new Set());
  const [removingResourceIds, setRemovingResourceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const [favoriteCourses, favoriteResourceIds, resourcesData] = await Promise.all([
          apiService.getFavoriteCourses(),
          apiService.getFavoriteResources(),
          apiService.getDashboardResources(),
        ]);

        const mappedCourses: CourseItem[] = Array.isArray(favoriteCourses)
          ? favoriteCourses.map((course: any) => ({
              _id: String(course._id),
              title: String(course.title || "Course"),
              coverImage: course.coverImage,
              category: course.category,
              instructor: course.instructor,
              students: Array.isArray(course.students) ? course.students : [],
              rating: Number(course.rating || 0),
              numReviews: Number(course.numReviews || 0),
            }))
          : [];

        const favoriteResourceSet = new Set(Array.isArray(favoriteResourceIds) ? favoriteResourceIds : []);

        const mappedResources: ResourceItem[] = Array.isArray(resourcesData)
          ? resourcesData.map((resource: any) => ({
              id: String(resource.id),
              title: String(resource.title || "Resource"),
              type: String(resource.type || "file"),
              size: resource.size,
              course: resource.course,
              url: resource.url,
              date: resource.date,
            })).filter((resource) => favoriteResourceSet.has(resource.id))
          : [];

        setCourses(mappedCourses);
        setResources(mappedResources);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    void loadFavorites();
  }, []);

  const visibleCourses = courses;

  const visibleResources = useMemo(() => resources, [resources]);

  const removeCourse = async (courseId: string) => {
    if (removingCourseIds.has(courseId)) {
      return;
    }

    setRemovingCourseIds((prev) => {
      const next = new Set(prev);
      next.add(courseId);
      return next;
    });

    try {
      await apiService.removeFavoriteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove favorite");
    } finally {
      setRemovingCourseIds((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const removeResource = async (resourceId: string) => {
    if (removingResourceIds.has(resourceId)) {
      return;
    }

    setRemovingResourceIds((prev) => {
      const next = new Set(prev);
      next.add(resourceId);
      return next;
    });

    try {
      await apiService.removeFavoriteResource(resourceId);
      setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove favorite resource");
    } finally {
      setRemovingResourceIds((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Favorites</h1>
        <p className="text-slate-500 dark:text-slate-400">Your saved learning content from live platform activity.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Tabs defaultValue="courses">
        <TabsList className="grid w-full sm:w-[420px] grid-cols-2">
          <TabsTrigger value="courses">
            <Bookmark className="h-4 w-4 mr-2" /> Courses ({visibleCourses.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" /> Resources ({visibleResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {visibleCourses.length === 0 ? (
            <EmptyState
              icon={<Heart className="mx-auto h-12 w-12 text-slate-400 mb-4" />}
              title="No saved courses"
              subtitle="Tap the heart icon on the Courses page to save courses here."
              ctaHref="/app/courses"
              ctaLabel="Browse Courses"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden group flex flex-col hover:border-indigo-200 hover:shadow-md transition-all dark:hover:border-indigo-800">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={course.coverImage || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" className="rounded-full h-12 w-12 bg-indigo-600 hover:bg-indigo-700" asChild>
                        <Link to={`/app/courses/${course._id}`}>
                          <PlayCircle className="h-6 w-6 text-white" />
                        </Link>
                      </Button>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white">{course.category || "Course"}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 h-8 w-8 rounded-full"
                      onClick={() => { void removeCourse(course._id); }}
                      disabled={removingCourseIds.has(course._id)}
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    {Number(course.numReviews || 0) > 0 ? (
                      <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mb-2">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span>{Number(course.rating || 0).toFixed(1)}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500">({course.numReviews || 0})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-slate-400 font-medium mb-2">
                        <Star className="h-4 w-4" />
                        <span>N/A</span>
                      </div>
                    )}
                    <Link to={`/app/courses/${course._id}`} className="block mb-2">
                      <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500 mb-4">{course.instructor?.name || "Instructor"}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> On demand
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {Array.isArray(course.students) ? course.students.length : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          {visibleResources.length === 0 ? (
            <EmptyState
              icon={<FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />}
              title="No saved resources"
              subtitle="Resources from your lessons will appear here."
              ctaHref="/app/resources"
              ctaLabel="Browse Resources"
            />
          ) : (
            <div className="space-y-3">
              {visibleResources.map((resource) => (
                <Card key={resource.id} className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{resource.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {resource.course || "General"} · {resource.size || "-"} · {resource.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {resource.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noreferrer">Open</a>
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => { void removeResource(resource.id); }}
                        disabled={removingResourceIds.has(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
      {icon}
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">{subtitle}</p>
      <Button asChild>
        <Link to={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
