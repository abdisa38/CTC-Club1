import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Search, Filter, Star, Clock, Users, PlayCircle, PlusCircle, X, Heart, ArrowLeft, ChevronRight, Lock, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { Course as ApiCourse } from "../services/api";
import { FIELD_PRIORITY, resolveLearningFieldFromCourse } from "../utils/learningFields";

type CourseType = ApiCourse;

const extractErrorMessage = (error: any, fallback: string) => {
  const candidate = error?.response?.data?.message ?? error?.message;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    try {
      return JSON.stringify(candidate);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const extractPhaseNumber = (title: string) => {
  const match = String(title || "").match(/phase\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const resolvePhaseOrderValue = (title: string, fallbackIndex: number) => {
  const extracted = extractPhaseNumber(title);
  return Number.isFinite(extracted) && extracted !== null ? extracted : fallbackIndex + 1;
};

const formatCoursePrice = (course: CourseType) => {
  const amount = Number(course.price || 0);
  const currency = course.currency || "ETB";

  if (amount <= 0) {
    return "Free";
  }

  return `${amount.toFixed(2)} ${currency}`;
};

export function CourseList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor' || isAdmin;
  const isAppCatalogRoute = location.pathname.startsWith("/app/");
  const catalogBasePath = isAppCatalogRoute ? "/app/courses" : "/courses";
  const queryField = new URLSearchParams(location.search).get("field")?.trim() || "";
  const courseDetailBasePath = catalogBasePath;

  const fieldDescriptions: Record<string, string> = {
    "Web Development": "All web phases grouped together in one learning field.",
    "Graphics Design": "Design-focused track for visual communication and UI/UX skills.",
    "App Development": "Application development track for mobile and cross-platform products.",
    "Maintenance": "Maintenance track for support, QA, reliability, and operations.",
    "General Technology": "General technology courses that are not assigned to a specific field yet.",
  };

  const fieldFallbackCovers: Record<string, string> = {
    "Web Development": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=900",
    "Graphics Design": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=900",
    "App Development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=900",
    "Maintenance": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=900",
    "General Technology": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=900",
  };

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState(queryField);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const payload = await apiService.getCourses({ limit: 100 });
        setCourses(payload.items || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    setSelectedField(queryField);
  }, [queryField]);

  const fieldOptions = useMemo(() => {
    const unique = new Set(
      courses.map((course) => resolveLearningFieldFromCourse({
        title: course.title,
        category: course.category,
        description: course.description,
      }))
    );

    return Array.from(unique).sort((left, right) => {
      const leftIndex = FIELD_PRIORITY.findIndex((item) => item.toLowerCase() === left.toLowerCase());
      const rightIndex = FIELD_PRIORITY.findIndex((item) => item.toLowerCase() === right.toLowerCase());

      const normalizedLeft = leftIndex >= 0 ? leftIndex : FIELD_PRIORITY.length + 1;
      const normalizedRight = rightIndex >= 0 ? rightIndex : FIELD_PRIORITY.length + 1;

      if (normalizedLeft !== normalizedRight) {
        return normalizedLeft - normalizedRight;
      }

      return left.localeCompare(right);
    });
  }, [courses]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || role !== 'student') {
        setFavorites(new Set());
        return;
      }

      try {
        const favoriteCourses = await apiService.getFavoriteCourses();
        setFavorites(new Set(favoriteCourses.map((course) => course._id)));
      } catch (error) {
        console.error("Failed to fetch favorite courses:", error);
      }
    };

    void fetchFavorites();
  }, [role, user?._id]);

  const filteredCourses = courses.filter(c => {
    const learningField = resolveLearningFieldFromCourse({
      title: c.title,
      category: c.category,
      description: c.description,
    });

    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedField && learningField !== selectedField) return false;
    if (selectedCategory && c.category !== selectedCategory) return false;
    return true;
  });

  const activeFilters = [selectedField, selectedCategory, selectedLevel, selectedDuration].filter(Boolean).length;
  const authNextPath = `${location.pathname}${location.search}`;
  const loginPath = `/login?next=${encodeURIComponent(authNextPath)}`;

  const groupedCoursesByField = useMemo(() => {
    const grouped = new Map<string, CourseType[]>();

    courses.forEach((course) => {
      const field = resolveLearningFieldFromCourse({
        title: course.title,
        category: course.category,
        description: course.description,
      });

      const existing = grouped.get(field);
      if (existing) {
        existing.push(course);
      } else {
        grouped.set(field, [course]);
      }
    });

    return grouped;
  }, [courses]);

  const overviewFields = useMemo(() => {
    const preferred = ["Web Development", "Graphics Design", "App Development", "Maintenance"];
    const discovered = Array.from(groupedCoursesByField.keys()).filter((field) => !preferred.includes(field));
    const ordered = [...preferred, ...discovered];

    return ordered.map((field) => {
      const fieldCourses = groupedCoursesByField.get(field) || [];
      const coverImage = fieldCourses[0]?.coverImage || fieldFallbackCovers[field] || fieldFallbackCovers["General Technology"];
      const totalStudents = fieldCourses.reduce((sum, item) => sum + (Array.isArray(item.students) ? item.students.length : 0), 0);

      return {
        field,
        courses: fieldCourses,
        coverImage,
        totalStudents,
      };
    });
  }, [groupedCoursesByField]);

  const sortedSelectedFieldCourses = useMemo(() => {
    if (!selectedField) {
      return [] as CourseType[];
    }

    const fieldCourses = groupedCoursesByField.get(selectedField) || [];
    return [...fieldCourses].sort((left, right) => {
      const leftPhase = extractPhaseNumber(String(left.title || "")) ?? -1;
      const rightPhase = extractPhaseNumber(String(right.title || "")) ?? -1;

      if (leftPhase !== rightPhase) {
        return leftPhase - rightPhase;
      }

      return String(left.title || "").localeCompare(String(right.title || ""));
    });
  }, [groupedCoursesByField, selectedField]);

  const isFieldOverviewMode = !selectedField && !searchQuery.trim() && !selectedCategory && !selectedLevel && !selectedDuration;
  const isFieldPhaseMode = Boolean(selectedField);

  const updateSelectedField = (field: string) => {
    const normalized = field.trim();
    const params = new URLSearchParams(location.search);

    if (normalized) {
      params.set("field", normalized);
    } else {
      params.delete("field");
    }

    const nextSearch = params.toString();
    setSelectedField(normalized);

    navigate(
      {
        pathname: catalogBasePath,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: false }
    );
  };

  const toggleFavorite = async (id: string) => {
    if (!user || role !== 'student') {
      return;
    }

    if (favoritingIds.has(id)) {
      return;
    }

    const isFavorite = favorites.has(id);

    setFavoritingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      if (isFavorite) {
        await apiService.removeFavoriteCourse(id);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await apiService.addFavoriteCourse(id);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const isUserEnrolled = (course: CourseType) => {
    if (!user || !Array.isArray(course.students)) return false;

    return course.students.some((student: any) => {
      if (typeof student === "string") return student === user._id;
      if (student && typeof student === "object" && student._id) return student._id === user._id;
      return String(student) === user._id;
    });
  };

  const markCourseEnrolledLocally = (id: string) => {
    if (!user) return;

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course._id !== id) return course;

        const students = Array.isArray(course.students) ? course.students : [];
        const alreadyEnrolled = students.some((student: any) =>
          typeof student === "string" ? student === user._id : student?._id === user._id
        );

        if (alreadyEnrolled) return course;

        return {
          ...course,
          students: [...students, user._id],
        };
      })
    );
  };

  const handleEnroll = async (course: CourseType) => {
    if (!user) return; // need to be logged in
    setActionSuccess("");
    setActionError("");

    const id = course._id;
    const isPaidCourse = Number(course.price || 0) > 0;

    setEnrollingId(id);
    try {
      if (isPaidCourse) {
        const init = await apiService.initializeCoursePayment(id);

        if (init.isEnrolled || init.alreadyEnrolled || init.requiresPayment === false) {
          markCourseEnrolledLocally(id);
          setActionSuccess("Course unlocked successfully. You can open this phase now.");
          return;
        }

        if (!init.checkoutUrl) {
          throw new Error("Checkout URL was not returned by the server.");
        }

        window.location.href = init.checkoutUrl;
        return;
      }

      await apiService.enrollCourse(id);
      markCourseEnrolledLocally(id);
      setActionSuccess("Enrollment successful. Phase unlocked.");
    } catch (error) {
      setActionError(extractErrorMessage(error, "Failed to start enrollment/checkout."));
      console.error("Failed to enroll:", error);
    } finally {
      setEnrollingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading courses...</div>;
  }

  return (
    <div className={`mx-auto w-full space-y-6 ${isAppCatalogRoute ? "max-w-[1160px]" : "max-w-[1080px] px-4 pb-10 pt-7 sm:px-6 lg:px-8"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isFieldPhaseMode ? `${selectedField} Phases` : "Course Catalog"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isFieldPhaseMode
              ? "Open any phase to continue learning in order."
              : "Browse by major learning fields, then open each field to view all phases."}
          </p>
        </div>
        {isInstructor && (
          <Button asChild className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/app/instructor/courses/new"><PlusCircle className="h-4 w-4 mr-2" /> Add Course</Link>
          </Button>
        )}
      </div>

      {!isFieldOverviewMode && !isFieldPhaseMode ? (
        <Card className="bg-white/50 dark:bg-slate-900/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search courses by title, instructor, or tags..."
                  className="pl-10 h-12 bg-white dark:bg-slate-950"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                className="h-12 px-4"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" /> Filters
                {activeFilters > 0 && (
                  <Badge className="ml-2 bg-white text-indigo-600 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <select
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  value={selectedField}
                  onChange={(e) => updateSelectedField(e.target.value)}
                >
                  <option value="">All Fields</option>
                  {fieldOptions.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                <select
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Web Dev">Web Development</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="Design">Design</option>
                  <option value="Cloud">Cloud / DevOps</option>
                  <option value="Tools">Tools</option>
                </select>
                <select
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                >
                  <option value="">Any Duration</option>
                  <option value="short">Short (&lt; 10h)</option>
                  <option value="medium">Medium (10-25h)</option>
                  <option value="long">Long (25h+)</option>
                </select>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => { updateSelectedField(""); setSelectedCategory(""); setSelectedLevel(""); setSelectedDuration(""); }}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </div>
      ) : null}

      {isFieldOverviewMode ? (
        <div className={`space-y-5 ${isAppCatalogRoute ? "" : "mx-auto max-w-6xl"}`}>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-500">Choose a field to open all its phases at once.</p>
            <p className="text-xs text-slate-400">Each card previews the ordered phases inside that learning field.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overviewFields.map((entry, index) => {
              const hasCourses = entry.courses.length > 0;
              const paidPhases = entry.courses.filter((course) => Number(course.price || 0) > 0).length;
              const orderedFieldCourses = [...entry.courses].sort((left, right) => {
                const leftOrder = extractPhaseNumber(String(left.title || "")) ?? Number.MAX_SAFE_INTEGER;
                const rightOrder = extractPhaseNumber(String(right.title || "")) ?? Number.MAX_SAFE_INTEGER;

                if (leftOrder !== rightOrder) {
                  return leftOrder - rightOrder;
                }

                return String(left.title || "").localeCompare(String(right.title || ""));
              });
              const previewCourses = orderedFieldCourses.slice(0, 3);

              return (
                <motion.div
                  key={entry.field}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={isAppCatalogRoute
                    ? `overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${hasCourses ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50"}`
                    : `overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 ${hasCourses ? "border-cyan-500/35 bg-slate-900/55" : "border-slate-700/70 bg-slate-900/40"}`
                  }>
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={entry.coverImage}
                        alt={entry.field}
                        className={`h-full w-full object-cover ${hasCourses ? "" : "grayscale"}`}
                      />
                      <div className={isAppCatalogRoute
                        ? "absolute inset-0 bg-gradient-to-tr from-slate-900/65 via-slate-900/25 to-transparent"
                        : "absolute inset-0 bg-gradient-to-tr from-black/70 via-slate-900/40 to-transparent"
                      } />

                      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                        <Badge className="border-0 bg-white/90 text-slate-900 text-[11px] font-bold">{entry.field}</Badge>
                        <Badge className={`border-0 text-[11px] font-bold ${hasCourses ? "bg-emerald-600 text-white" : "bg-slate-500 text-white"}`}>
                          {hasCourses ? "Active" : "Soon"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="space-y-3 p-4">
                      <div>
                        <p className={isAppCatalogRoute ? "text-[13px] text-slate-600 line-clamp-2" : "text-[13px] text-slate-300 line-clamp-2"}>
                          {fieldDescriptions[entry.field] || fieldDescriptions["General Technology"]}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className={isAppCatalogRoute ? "rounded-lg border border-slate-200 bg-slate-50 p-2" : "rounded-lg border border-white/10 bg-white/5 p-2"}>
                          <p className={isAppCatalogRoute ? "text-[10px] uppercase tracking-wide text-slate-500" : "text-[10px] uppercase tracking-wide text-slate-400"}>Phases</p>
                          <p className={isAppCatalogRoute ? "mt-1 text-base font-bold text-slate-900" : "mt-1 text-base font-bold text-white"}>{entry.courses.length}</p>
                        </div>
                        <div className={isAppCatalogRoute ? "rounded-lg border border-slate-200 bg-slate-50 p-2" : "rounded-lg border border-white/10 bg-white/5 p-2"}>
                          <p className={isAppCatalogRoute ? "text-[10px] uppercase tracking-wide text-slate-500" : "text-[10px] uppercase tracking-wide text-slate-400"}>Paid</p>
                          <p className={isAppCatalogRoute ? "mt-1 text-base font-bold text-slate-900" : "mt-1 text-base font-bold text-white"}>{paidPhases}</p>
                        </div>
                        <div className={isAppCatalogRoute ? "rounded-lg border border-slate-200 bg-slate-50 p-2" : "rounded-lg border border-white/10 bg-white/5 p-2"}>
                          <p className={isAppCatalogRoute ? "text-[10px] uppercase tracking-wide text-slate-500" : "text-[10px] uppercase tracking-wide text-slate-400"}>Students</p>
                          <p className={isAppCatalogRoute ? "mt-1 text-base font-bold text-slate-900" : "mt-1 text-base font-bold text-white"}>{entry.totalStudents}</p>
                        </div>
                      </div>

                      {hasCourses ? (
                        <div className="space-y-2">
                          {previewCourses.map((course, previewIndex) => {
                            const isPaidCourse = Number(course.price || 0) > 0;
                            const order = resolvePhaseOrderValue(String(course.title || ""), previewIndex);

                            return (
                              <div key={course._id} className={isAppCatalogRoute
                                ? "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                                : "flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2"
                              }>
                                <span className={isAppCatalogRoute
                                  ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-extrabold text-indigo-700"
                                  : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-extrabold text-cyan-200"
                                }>{order}</span>
                                <p className={isAppCatalogRoute ? "min-w-0 flex-1 truncate text-[13px] text-slate-800" : "min-w-0 flex-1 truncate text-[13px] text-slate-100"}>{course.title}</p>
                                <Badge className={`shrink-0 border-0 text-[10px] font-bold ${isPaidCourse ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
                                  {isPaidCourse ? formatCoursePrice(course) : "FREE"}
                                </Badge>
                              </div>
                            );
                          })}

                          {entry.courses.length > previewCourses.length ? (
                            <p className={isAppCatalogRoute ? "text-[12px] text-slate-500" : "text-[12px] text-slate-400"}>
                              +{entry.courses.length - previewCourses.length} more phases
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <div className={isAppCatalogRoute
                          ? "rounded-lg border border-dashed border-slate-300 bg-slate-100 px-3 py-3"
                          : "rounded-lg border border-dashed border-slate-600 bg-slate-800/60 px-3 py-3"
                        }>
                          <p className={isAppCatalogRoute ? "text-xs text-slate-600" : "text-xs text-slate-300"}>
                            This field will appear here once phases are published.
                          </p>
                        </div>
                      )}

                      <Button className={isAppCatalogRoute
                        ? "h-10 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        : "h-10 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-700 hover:to-cyan-600"
                      } asChild disabled={!hasCourses}>
                        {hasCourses ? (
                          <Link to={`${catalogBasePath}?field=${encodeURIComponent(entry.field)}`}>
                            Explore Field
                            <ChevronRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        ) : (
                          <span>Coming Soon</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : isFieldPhaseMode ? (
        <div className={`mx-auto w-full max-w-5xl space-y-4 ${isAppCatalogRoute ? "" : "px-0"}`}>
          <Card className={isAppCatalogRoute
            ? "rounded-2xl border border-slate-200 bg-white shadow-sm"
            : "rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/60"
          }>
            <CardContent className="space-y-4 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Learning Field</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selectedField}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Follow the ordered phase list from start to finish.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    updateSelectedField("");
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedLevel("");
                    setSelectedDuration("");
                  }}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  All Fields
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Phases</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{sortedSelectedFieldCourses.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Paid</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {sortedSelectedFieldCourses.filter((course) => Number(course.price || 0) > 0).length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 col-span-2 sm:col-span-1">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Progress</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Ordered Path</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!user ? (
            <Card className="rounded-2xl border border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">Please log in to open and continue any phase.</p>
              </CardContent>
            </Card>
          ) : null}

          {sortedSelectedFieldCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No phases available yet</h3>
              <p className="mt-1 text-sm text-slate-500">This field will appear here once phases are published.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSelectedFieldCourses.map((course, index) => {
                const phaseOrder = resolvePhaseOrderValue(String(course.title || ""), index);
                const courseHref = `${courseDetailBasePath}/${course._id}`;
                const isPaidCourse = Number(course.price || 0) > 0;
                const isPaidLocked = isPaidCourse && role === "student" && !isUserEnrolled(course);
                const showLockedIndicator = isPaidCourse && !isUserEnrolled(course);

                return (
                  <div key={course._id} className="relative">
                    {index < sortedSelectedFieldCourses.length - 1 ? (
                      <span className="pointer-events-none absolute left-5 top-14 hidden h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-indigo-300 to-slate-200 sm:block" />
                    ) : null}

                    <Card className={isAppCatalogRoute
                      ? "rounded-2xl border border-slate-200 bg-white shadow-sm"
                      : "rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/60"
                    }>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={isAppCatalogRoute
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-extrabold text-indigo-200"
                          }>
                            {phaseOrder}
                          </div>

                          <img
                            src={course.coverImage || fieldFallbackCovers[selectedField] || fieldFallbackCovers["General Technology"]}
                            alt={course.title}
                            className="hidden h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover sm:block"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phase {phaseOrder}</p>

                              <Badge className={`border-0 text-[10px] font-bold ${isPaidCourse ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
                                {isPaidCourse ? formatCoursePrice(course) : "FREE"}
                              </Badge>

                              {isPaidCourse ? (
                                showLockedIndicator ? (
                                  <Badge className="border-0 bg-amber-500 text-white text-[10px] font-bold">
                                    <Lock className="mr-1 h-3 w-3" />
                                    Locked
                                  </Badge>
                                ) : (
                                  <Badge className="border-0 bg-emerald-600 text-white text-[10px] font-bold">
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Unlocked
                                  </Badge>
                                )
                              ) : null}
                            </div>

                            <h3 className="mt-1 text-base font-semibold leading-tight text-slate-900 dark:text-white sm:text-lg">
                              {course.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                              {course.description || "Open this phase to see lessons, videos, resources, quizzes, and projects."}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {!user ? (
                                <Button asChild className="h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                                  <Link to={loginPath}>
                                    {isPaidCourse ? "Login to Pay" : "Login to Open"}
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                  </Link>
                                </Button>
                              ) : isPaidLocked ? (
                                <Button
                                  className="h-9 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                  onClick={() => void handleEnroll(course)}
                                  disabled={enrollingId === course._id}
                                >
                                  <CreditCard className="mr-1.5 h-4 w-4" />
                                  {enrollingId === course._id ? "Opening checkout..." : `Pay ${formatCoursePrice(course)} to Unlock`}
                                </Button>
                              ) : (
                                <Button asChild className="h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                                  <Link to={courseHref}>
                                    Open Phase
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <Search className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); updateSelectedField(""); setSelectedCategory(""); setSelectedLevel(""); setSelectedDuration(""); }}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, i) => {
              const hasRatings = Number(course.numReviews || 0) > 0;
              const ratingLabel = hasRatings ? Number(course.rating || 0).toFixed(1) : "N/A";
              const isPaidCourse = Number(course.price || 0) > 0;
              const learningField = resolveLearningFieldFromCourse({
                title: course.title,
                category: course.category,
                description: course.description,
              });
              const courseHref = `${courseDetailBasePath}/${course._id}`;

              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden group flex flex-col hover:border-indigo-200 hover:shadow-md transition-all dark:hover:border-indigo-800">
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={course.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800'}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" className="rounded-full h-12 w-12 bg-indigo-600 hover:bg-indigo-700" asChild>
                          <Link to={courseHref}><PlayCircle className="h-6 w-6 text-white" /></Link>
                        </Button>
                      </div>
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white">{learningField}</Badge>
                        <Badge className={`font-extrabold tracking-wide ${Number(course.price || 0) > 0 ? "bg-indigo-600 text-white hover:bg-indigo-600" : "bg-emerald-600 text-white hover:bg-emerald-600"}`}>
                          {Number(course.price || 0) > 0 ? "PAID COURSE" : "FREE COURSE"}
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); void toggleFavorite(course._id); }}
                        disabled={role !== 'student' || favoritingIds.has(course._id)}
                        className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        title={role === 'student' ? (favorites.has(course._id) ? 'Remove from favorites' : 'Add to favorites') : 'Favorites are available for students'}
                      >
                        <Heart className={`h-4 w-4 ${favorites.has(course._id) ? "text-red-500 fill-red-500" : "text-slate-600"}`} />
                      </button>
                      {isUserEnrolled(course) && (
                        <Badge className="absolute bottom-3 left-3 bg-emerald-600 text-white hover:bg-emerald-600">Enrolled</Badge>
                      )}
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mb-2">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span>{ratingLabel}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500">({Array.isArray(course.students) ? course.students.length : 0})</span>
                      </div>

                      <Link to={courseHref} className="block mb-2">
                        <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                      </Link>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{course.instructor?.name || 'Unknown Instructor'}</p>

                      <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {learningField}
                        </Badge>
                        {course.category ? (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {course.category}
                          </Badge>
                        ) : null}
                        <Badge className={`text-xs px-2 py-0.5 font-bold ${Number(course.price || 0) > 0 ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {Number(course.price || 0) > 0
                            ? `${Number(course.price || 0).toFixed(2)} ETB`
                            : "Free"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 10h</span>
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> All Levels</span>
                        </div>
                        {!isUserEnrolled(course) ? (
                          <Button
                            size="sm"
                            className={`h-9 px-4 text-[12px] font-extrabold rounded-xl border-0 shadow-md ${isPaidCourse
                              ? "bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white shadow-rose-500/30"
                              : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-emerald-500/30"}`}
                            onClick={() => handleEnroll(course)}
                            disabled={enrollingId === course._id}
                          >
                            {enrollingId === course._id
                              ? (isPaidCourse ? "Opening checkout..." : "Enrolling...")
                              : (isPaidCourse ? `Pay ${Number(course.price || 0).toFixed(2)} ETB` : "Enroll Free")}
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}