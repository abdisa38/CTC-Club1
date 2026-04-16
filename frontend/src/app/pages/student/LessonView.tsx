import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  PlayCircle,
  Send,
  Settings,
  SkipForward,
  StickyNote,
  Volume2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { Textarea } from "../../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import apiService, { Course, Lesson } from "../../services/api";

const NOTES_STORAGE_PREFIX = "ctc.lesson.notes";
const FALLBACK_COVER_IMAGE = "https://images.unsplash.com/photo-1597239450996-ea7c2c564412?auto=format&fit=crop&q=80&w=1200";

type LessonNote = {
  id: number;
  text: string;
  time: string;
};

type LessonResource = {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
};

const asId = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "_id" in value && typeof (value as { _id?: unknown })._id === "string") {
    return (value as { _id: string })._id;
  }

  return "";
};

const formatDuration = (duration?: number | string): string => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    if (duration < 60) {
      return `${Math.round(duration)}m`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = Math.round(duration % 60);
    return `${hours}h ${minutes}m`;
  }

  if (typeof duration === "string" && duration.trim()) {
    return duration;
  }

  return "Self-paced";
};

const formatNoteTime = (): string =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const getYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
};

const getLessonVideoUrls = (lesson: Lesson | null): string[] => {
  if (!lesson) {
    return [];
  }

  const fromArray = Array.isArray(lesson.videoUrls) ? lesson.videoUrls : [];
  const fromLegacy = lesson.videoUrl ? [lesson.videoUrl] : [];
  const unique = new Set<string>();

  [...fromArray, ...fromLegacy].forEach((url) => {
    const normalized = String(url || "").trim();
    if (normalized) {
      unique.add(normalized);
    }
  });

  return Array.from(unique);
};

const toResourceName = (url: string, fallback: string): string => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return lastPart || fallback;
  } catch {
    return fallback;
  }
};

const getLessonResources = (lesson: Lesson | null): LessonResource[] => {
  if (!lesson) {
    return [];
  }

  const resources: LessonResource[] = [];

  getLessonVideoUrls(lesson).forEach((videoUrl, index) => {
    resources.push({
      id: `video-${lesson._id}-${index}`,
      name: `${lesson.title} Video${index > 0 ? ` ${index + 1}` : ""}`,
      size: "-",
      url: videoUrl,
      type: "video",
    });
  });

  if (Array.isArray(lesson.attachments)) {
    lesson.attachments.forEach((attachment, index) => {
      if (!attachment?.url) {
        return;
      }

      resources.push({
        id: `attachment-${lesson._id}-${index}`,
        name: attachment.title || toResourceName(attachment.url, `${lesson.title} Resource`),
        size: "-",
        url: attachment.url,
        type: attachment.fileType || "file",
      });
    });
  }

  return resources;
};

export function LessonView() {
  const { courseId, lessonId } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"notes" | "resources" | "discussion">("notes");
  const [isPlaying, setIsPlaying] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [optimisticCompletedLessons, setOptimisticCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ "course-lessons": true });
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!courseId) {
      setError("Course id is missing.");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchLessonData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [courseData, lessonData, metrics] = await Promise.all([
          apiService.getCourseById(courseId),
          apiService.getLessons(courseId),
          apiService.getDashboardMetrics().catch(() => null),
        ]);

        if (isCancelled) {
          return;
        }

        const orderedLessons = [...lessonData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCourse(courseData);
        setLessons(orderedLessons);

        const activeCourses = Array.isArray((metrics as any)?.activeCourses)
          ? ((metrics as any).activeCourses as Array<Record<string, any>>)
          : [];

        const matchedProgress = activeCourses.find((progressItem) => {
          const progressCourseId = asId(progressItem?.course);
          return progressCourseId === courseId;
        });

        const completedIds = Array.isArray(matchedProgress?.completedLessons)
          ? matchedProgress.completedLessons.map(asId).filter(Boolean)
          : [];

        setCompletedLessons(new Set(completedIds));
        setOptimisticCompletedLessons(new Set());
        setExpandedModules({ "course-lessons": true });
      } catch (err: any) {
        if (isCancelled) {
          return;
        }

        setError(err?.response?.data?.message || "Failed to load lesson details.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchLessonData();

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  const activeLesson = useMemo(() => {
    if (lessons.length === 0) {
      return null;
    }

    if (!lessonId) {
      return lessons[0];
    }

    return lessons.find((lesson) => lesson._id === lessonId) || lessons[0];
  }, [lessonId, lessons]);

  const notesStorageKey = useMemo(() => {
    if (!courseId || !activeLesson?._id) {
      return "";
    }

    return `${NOTES_STORAGE_PREFIX}.${courseId}.${activeLesson._id}`;
  }, [activeLesson?._id, courseId]);

  useEffect(() => {
    if (!notesStorageKey || typeof window === "undefined") {
      setNotes([]);
      return;
    }

    try {
      const stored = window.localStorage.getItem(notesStorageKey);
      if (!stored) {
        setNotes([]);
        return;
      }

      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        setNotes([]);
        return;
      }

      const normalized = parsed
        .filter((item): item is LessonNote => {
          return (
            !!item &&
            typeof item === "object" &&
            typeof (item as LessonNote).id === "number" &&
            typeof (item as LessonNote).text === "string" &&
            typeof (item as LessonNote).time === "string"
          );
        })
        .slice(-30);

      setNotes(normalized);
    } catch {
      setNotes([]);
    }
  }, [notesStorageKey]);

  useEffect(() => {
    if (!notesStorageKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(notesStorageKey, JSON.stringify(notes));
  }, [notes, notesStorageKey]);

  const mergedCompletedLessons = useMemo(
    () => new Set([...completedLessons, ...optimisticCompletedLessons]),
    [completedLessons, optimisticCompletedLessons]
  );

  const totalLessons = lessons.length;
  const completedCount = mergedCompletedLessons.size;
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const activeLessonIndex = activeLesson ? lessons.findIndex((lesson) => lesson._id === activeLesson._id) : -1;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex < lessons.length - 1 ? lessons[activeLessonIndex + 1] : null;

  const lessonCompleted = !!activeLesson && mergedCompletedLessons.has(activeLesson._id);
  const lessonResources = useMemo(() => getLessonResources(activeLesson), [activeLesson]);
  const lessonVideoUrls = useMemo(() => getLessonVideoUrls(activeLesson), [activeLesson]);
  const primaryLessonVideoUrl = lessonVideoUrls[0] || "";
  const youtubeEmbedUrl = primaryLessonVideoUrl ? getYoutubeEmbedUrl(primaryLessonVideoUrl) : null;

  const modules = useMemo(
    () => [
      {
        id: "course-lessons",
        title: "Course Lessons",
        lessons,
      },
    ],
    [lessons]
  );

  const handleMarkComplete = () => {
    if (!activeLesson || lessonCompleted) {
      return;
    }

    setOptimisticCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(activeLesson._id);
      return next;
    });

    setShowCompleteBanner(true);
    window.setTimeout(() => setShowCompleteBanner(false), 2800);
  };

  const handleAddNote = () => {
    const trimmed = newNote.trim();
    if (!trimmed) {
      return;
    }

    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        time: formatNoteTime(),
      },
    ]);
    setNewNote("");
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link to="/app/courses">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  if (!activeLesson || !courseId) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
          No lessons are available for this course yet.
        </div>
        <Button variant="outline" asChild>
          <Link to="/app/courses">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm -m-4 md:-m-6 lg:-m-8">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/app/courses/${courseId}`}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to Course
              </Link>
            </Button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:inline truncate">
              {course?.title || "Course"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">
              {completedCount}/{totalLessons} lessons
            </span>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="aspect-video bg-slate-900 relative group shrink-0">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={activeLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : primaryLessonVideoUrl ? (
            <video src={primaryLessonVideoUrl} controls className="w-full h-full object-cover" />
          ) : (
            <>
              <img
                src={course?.coverImage || FALLBACK_COVER_IMAGE}
                alt="Lesson cover"
                className="w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-indigo-600 border border-white/30 text-white transition-colors flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                </motion.button>
              </div>
            </>
          )}

          {!youtubeEmbedUrl && !primaryLessonVideoUrl ? (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group/bar">
                  <div className="h-full w-[45%] bg-indigo-500 rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying((prev) => !prev)} className="hover:text-indigo-400 transition-colors">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button className="hover:text-indigo-400 transition-colors">
                    <SkipForward className="h-5 w-5" />
                  </button>
                  <button className="hover:text-indigo-400 transition-colors">
                    <Volume2 className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-mono">- / {formatDuration(activeLesson.duration)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="hover:text-indigo-400 transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button className="hover:text-indigo-400 transition-colors">
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">
            <AnimatePresence>
              {showCompleteBanner ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Lesson marked as complete in your current session.
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{activeLesson.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {formatDuration(activeLesson.duration)}
                  </span>
                  <span>
                    Lesson {activeLessonIndex + 1} of {Math.max(totalLessons, 1)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleMarkComplete}
                    variant={lessonCompleted ? "outline" : "default"}
                    className={lessonCompleted ? "border-emerald-500 text-emerald-600" : ""}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {lessonCompleted ? "Completed" : "Mark Complete"}
                  </Button>
                </motion.div>

                {nextLesson ? (
                  <Button variant="outline" asChild>
                    <Link to={`/app/courses/${courseId}/lessons/${nextLesson._id}`}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Course Complete
                  </Button>
                )}
              </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 lg:hidden overflow-x-auto">
              {(["notes", "resources", "discussion"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePanel(tab)}
                  className={`px-4 py-3 text-sm font-medium capitalize border-b-2 whitespace-nowrap transition-colors ${
                    activePanel === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab === "notes" ? <StickyNote className="h-4 w-4 inline mr-1.5" /> : null}
                  {tab === "resources" ? <FileText className="h-4 w-4 inline mr-1.5" /> : null}
                  {tab === "discussion" ? <MessageSquare className="h-4 w-4 inline mr-1.5" /> : null}
                  {tab}
                </button>
              ))}
            </div>

            {activePanel === "notes" ? (
              <div className="lg:hidden">
                <NotesPanel notes={notes} newNote={newNote} setNewNote={setNewNote} onAddNote={handleAddNote} />
              </div>
            ) : null}

            {activePanel === "resources" ? (
              <div className="lg:hidden">
                <ResourcesPanel resources={lessonResources} />
              </div>
            ) : null}

            {activePanel === "discussion" ? (
              <div className="lg:hidden">
                <DiscussionPanel
                  courseId={courseId}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  lessonTitle={activeLesson.title}
                />
              </div>
            ) : null}

            <div className="hidden lg:block space-y-4">
              <NotesPanel notes={notes} newNote={newNote} setNewNote={setNewNote} onAddNote={handleAddNote} />
              <ResourcesPanel resources={lessonResources} />
              <DiscussionPanel
                courseId={courseId}
                newComment={newComment}
                setNewComment={setNewComment}
                lessonTitle={activeLesson.title}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-[360px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full absolute lg:relative z-20 lg:z-0 top-0 right-0`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Course Content</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Progress: {progressPct}%</span>
            <span>
              {completedCount} / {totalLessons} Lessons
            </span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.map((module) => (
            <div key={module.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{module.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {module.lessons.filter((lesson) => mergedCompletedLessons.has(lesson._id)).length}/{module.lessons.length} completed
                  </p>
                </div>
                {expandedModules[module.id] ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {expandedModules[module.id] ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {module.lessons.map((lesson) => {
                      const isActive = lesson._id === activeLesson._id;
                      const isCompleted = mergedCompletedLessons.has(lesson._id);

                      return (
                        <Link
                          key={lesson._id}
                          to={`/app/courses/${courseId}/lessons/${lesson._id}`}
                          className={`flex items-start gap-3 p-3 px-4 transition-colors text-left border-l-2 ${
                            isActive
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-indigo-600"
                              : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : isActive ? (
                              <PlayCircle className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <PlayCircle className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                isActive
                                  ? "font-semibold text-indigo-600 dark:text-indigo-400"
                                  : isCompleted
                                    ? "text-slate-500"
                                    : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(lesson.duration)}</span>
                              {getLessonVideoUrls(lesson).length > 0 ? (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                  Video
                                </Badge>
                              ) : null}
                              {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 ? (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                  Resource
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesPanel({
  notes,
  newNote,
  setNewNote,
  onAddNote,
}: {
  notes: LessonNote[];
  newNote: string;
  setNewNote: (value: string) => void;
  onAddNote: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-500" /> My Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <Badge variant="outline" className="shrink-0 h-6 text-[10px] font-mono text-amber-700 border-amber-300">
                {note.time}
              </Badge>
              <p className="text-sm text-slate-700 dark:text-slate-300">{note.text}</p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-amber-200 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:text-amber-300">
            No notes yet for this lesson.
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Add a note for this lesson..."
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button size="icon" className="shrink-0 h-10 w-10" onClick={onAddNote} disabled={!newNote.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourcesPanel({ resources }: { resources: LessonResource[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-500" /> Lesson Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{resource.name}</p>
                    <p className="text-xs text-slate-500">{resource.type} • {resource.size}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" type="button">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No resources are attached to this lesson yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscussionPanel({
  courseId,
  newComment,
  setNewComment,
  lessonTitle,
}: {
  courseId: string;
  newComment: string;
  setNewComment: (value: string) => void;
  lessonTitle: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" /> Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
          Discussion is now centralized in Community. Open Community and mention this lesson so other learners can find your thread quickly.
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder={`Draft a question about \"${lessonTitle}\"...`}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button size="sm" variant="outline" asChild>
            <Link to={`/app/community?courseId=${courseId}`}>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Open
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
