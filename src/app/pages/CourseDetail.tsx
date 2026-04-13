import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import {
  PlayCircle,
  CheckCircle,
  Lock,
  HelpCircle,
  MessageSquare,
  FileText,
  Download,
  FolderKanban,
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  Star,
  Share2,
  Heart,
  BookmarkPlus,
  Send,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CourseEditor } from "./instructor/CourseEditor";
import apiService, { CommunityPost, Course, Lesson, Project, ProjectSubmission, Quiz, QuizResultItem } from "../services/api";

const FALLBACK_COVER_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200";

type CourseResource = {
  id: string;
  name: string;
  url: string;
  fileType: string;
  lessonTitle: string;
};

type NewLessonForm = {
  title: string;
  videoUrl: string;
  duration: string;
  isPublished: boolean;
  attachments: Array<{
    title: string;
    url: string;
    fileType: string;
  }>;
};

type CourseQuizForm = {
  title: string;
  description: string;
  passingScore: string;
  timeLimit: string;
  maxAttempts: string;
  xpReward: string;
  isPublished: boolean;
};

type CourseQuizQuestionForm = {
  questionText: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options: string[];
  correctAnswerIndex: string;
  correctAnswerText: string;
  points: string;
};

type CourseProjectForm = {
  title: string;
  description: string;
  instructions: string;
  requirements: string;
  xpReward: string;
  maxPoints: string;
  deadline: string;
  isPublished: boolean;
};

const getEmbedVideoUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "shorts" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }

      if (pathParts[0] === "embed" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const id = pathParts[pathParts.length - 1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
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

const parseDurationInput = (input: string): number | undefined => {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.includes(":")) {
    const parts = trimmed
      .split(":")
      .map((part) => Number(part))
      .filter((part) => Number.isFinite(part));

    if (parts.length === 2) {
      const [mm, ss] = parts;
      return Math.round(mm + ss / 60);
    }

    if (parts.length === 3) {
      const [hh, mm, ss] = parts;
      return Math.round(hh * 60 + mm + ss / 60);
    }
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.round(numeric);
  }

  return undefined;
};

const getProjectRefId = (value?: { _id: string } | string | null): string => {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value._id;
};

const toDateTimeLocal = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

const formatPostTime = (value: string): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const initials = (name?: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

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

const defaultLessonForm: NewLessonForm = {
  title: "",
  videoUrl: "",
  duration: "",
  isPublished: true,
  attachments: [],
};

const defaultQuizForm: CourseQuizForm = {
  title: "",
  description: "",
  passingScore: "70",
  timeLimit: "30",
  maxAttempts: "3",
  xpReward: "10",
  isPublished: false,
};

const defaultQuestionForm: CourseQuizQuestionForm = {
  questionText: "",
  type: "multiple-choice",
  options: ["", "", "", ""],
  correctAnswerIndex: "0",
  correctAnswerText: "",
  points: "1",
};

const defaultProjectForm: CourseProjectForm = {
  title: "",
  description: "",
  instructions: "",
  requirements: "",
  xpReward: "50",
  maxPoints: "100",
  deadline: "",
  isPublished: true,
};

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const isInstructor = role === "instructor" || role === "admin";
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [discussionPosts, setDiscussionPosts] = useState<CommunityPost[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isStartingCoursePayment, setIsStartingCoursePayment] = useState(false);
  const [isVerifyingCoursePayment, setIsVerifyingCoursePayment] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [courseProjects, setCourseProjects] = useState<Project[]>([]);
  const [courseProjectSubmissions, setCourseProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [isCourseContentLoading, setIsCourseContentLoading] = useState(false);
  const [contentActionBusy, setContentActionBusy] = useState(false);

  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [newLessonForm, setNewLessonForm] = useState<NewLessonForm>(defaultLessonForm);
  const [isUploadingLessonResources, setIsUploadingLessonResources] = useState(false);
  const lessonResourceInputRef = useRef<HTMLInputElement | null>(null);

  const [quizForm, setQuizForm] = useState<CourseQuizForm>(defaultQuizForm);
  const [questionQuizId, setQuestionQuizId] = useState("");
  const [quizQuestionForm, setQuizQuestionForm] = useState<CourseQuizQuestionForm>(defaultQuestionForm);
  const [quizMode, setQuizMode] = useState<"list" | "taking" | "results">("list");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuizQuestionIndex, setActiveQuizQuestionIndex] = useState(0);
  const [quizAnswerMap, setQuizAnswerMap] = useState<Record<number, string | number>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResultItem | null>(null);

  const [projectForm, setProjectForm] = useState<CourseProjectForm>(defaultProjectForm);
  const [projectSubmissionDrafts, setProjectSubmissionDrafts] = useState<Record<string, { repoUrl: string; liveUrl: string; comments: string }>>({});
  const [gradingDrafts, setGradingDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});

  useEffect(() => {
    if (id === "new") return;

    const fetchCourseData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setLoadError("");

      try {
        const courseRes = await apiService.getCourseById(id);
        setCourse(courseRes);

        try {
          const lessonsRes = await apiService.getLessons(id);
          const sortedLessons = [...(Array.isArray(lessonsRes) ? lessonsRes : [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setLessons(sortedLessons);

          if (sortedLessons.length > 0) {
            setSelectedLessonId((prev) => prev || sortedLessons[0]._id);
          }
        } catch (lessonError: any) {
          const status = Number(lessonError?.response?.status || 0);

          // Paid courses can return 403 for lesson access before enrollment/payment.
          if (status === 403 || status === 401) {
            setLessons([]);
          } else {
            setError(extractErrorMessage(lessonError, "Failed to load lessons"));
          }
        }
      } catch (fetchError: any) {
        const message = extractErrorMessage(fetchError, "Failed to load course details");
        setError(message);
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setDiscussionPosts([]);
      return;
    }

    const fetchDiscussion = async () => {
      setIsDiscussionLoading(true);
      try {
        const posts = await apiService.getCommunityPosts({
          category: "qna",
          course: id,
          page: 1,
          limit: 50,
        });
        setDiscussionPosts(posts.items);
      } catch (discussionError: any) {
        setError(discussionError?.response?.data?.message || "Failed to load discussion");
      } finally {
        setIsDiscussionLoading(false);
      }
    };

    void fetchDiscussion();
  }, [id, user]);

  const visibleLessons = useMemo(
    () => lessons.filter((lesson) => isInstructor || lesson.isPublished !== false),
    [lessons, isInstructor]
  );

  useEffect(() => {
    if (visibleLessons.length === 0) {
      setSelectedLessonId("");
      return;
    }

    const exists = visibleLessons.some((lesson) => lesson._id === selectedLessonId);
    if (!exists) {
      setSelectedLessonId(visibleLessons[0]._id);
    }
  }, [visibleLessons, selectedLessonId]);

  const selectedLesson = useMemo(
    () => visibleLessons.find((lesson) => lesson._id === selectedLessonId) || visibleLessons[0] || null,
    [visibleLessons, selectedLessonId]
  );

  const isEnrolled =
    !!user &&
    Array.isArray(course?.students) &&
    course.students.some((student) => {
      if (typeof student === "string") return student === user._id;
      if (student && typeof student === "object" && student._id) return student._id === user._id;
      return String(student) === user._id;
    });

  const coursePrice = Number(course?.price || 0);
  const courseCurrency = "ETB";
  const isPaidCourse = coursePrice > 0;

  const canAccessLessons = isEnrolled || isInstructor || !isPaidCourse;
  const selectedLessonIndex = selectedLesson ? visibleLessons.findIndex((lesson) => lesson._id === selectedLesson._id) : -1;
  const completedCount = canAccessLessons && selectedLessonIndex >= 0 ? selectedLessonIndex + 1 : 0;
  const progress = visibleLessons.length > 0 ? Math.round((completedCount / visibleLessons.length) * 100) : 0;

  const embedVideoUrl = selectedLesson?.videoUrl ? getEmbedVideoUrl(selectedLesson.videoUrl) : null;

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, selectedLessonId]);

  useEffect(() => {
    const availableTabs = canAccessLessons ? ["overview", "resources", "discussion"] : ["overview"];
    if (!availableTabs.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, canAccessLessons]);

  const courseResources = useMemo(() => {
    const resources: CourseResource[] = [];

    visibleLessons.forEach((lesson) => {
      if (!Array.isArray(lesson.attachments)) {
        return;
      }

      lesson.attachments.forEach((attachment, index) => {
        if (!attachment?.url) {
          return;
        }

        resources.push({
          id: `${lesson._id}-${index}`,
          name: attachment.title || toResourceName(attachment.url, `${lesson.title} Resource`),
          url: attachment.url,
          fileType: attachment.fileType || "file",
          lessonTitle: lesson.title,
        });
      });
    });

    return resources;
  }, [visibleLessons]);

  const selectedLessonResources = useMemo(() => {
    if (!selectedLesson || !Array.isArray(selectedLesson.attachments)) {
      return [];
    }

    return selectedLesson.attachments
      .filter((attachment) => Boolean(attachment?.url))
      .map((attachment, index) => ({
        id: `${selectedLesson._id}-selected-${index}`,
        name: attachment.title || toResourceName(attachment.url, `${selectedLesson.title} Resource`),
        url: attachment.url,
        fileType: attachment.fileType || "file",
      }));
  }, [selectedLesson]);

  const ratingValue = typeof course?.rating === "number" ? course.rating : 0;
  const reviewCount = typeof course?.numReviews === "number" ? course.numReviews : 0;

  useEffect(() => {
    if (!id || role !== "student") {
      setMyRating(0);
      setIsFavorite(false);
      return;
    }

    let cancelled = false;

    const fetchStudentCourseState = async () => {
      try {
        const [favoriteCourses, rating] = await Promise.all([
          apiService.getFavoriteCourses(),
          apiService.getMyCourseRating(id),
        ]);

        if (cancelled) {
          return;
        }

        setIsFavorite(Array.isArray(favoriteCourses) && favoriteCourses.some((item) => item._id === id));
        setMyRating(Number(rating?.rating || 0));
      } catch {
        if (!cancelled) {
          setMyRating(0);
        }
      }
    };

    void fetchStudentCourseState();

    return () => {
      cancelled = true;
    };
  }, [id, role, user?._id]);

  useEffect(() => {
    if (!id || !user) {
      return;
    }

    let ignore = false;
    const params = new URLSearchParams(window.location.search);
    const shouldVerify = params.get("payment") === "verify" || params.has("tx_ref") || params.has("amp;tx_ref");
    const txRef = (params.get("tx_ref") || params.get("amp;tx_ref") || "").trim();

    if (!shouldVerify || !txRef) {
      return;
    }

    const verifyCourseCheckout = async () => {
      setIsVerifyingCoursePayment(true);
      setError("");
      setSuccessMsg("");

      try {
        const verification = await apiService.verifyCoursePayment(id, txRef);

        if (ignore) {
          return;
        }

        const refreshedCourse = await apiService.getCourseById(id);
        if (ignore) {
          return;
        }

        setCourse(refreshedCourse);

        try {
          const lessonsRes = await apiService.getLessons(id);
          if (!ignore) {
            const sortedLessons = [...(Array.isArray(lessonsRes) ? lessonsRes : [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setLessons(sortedLessons);
          }
        } catch {
          // If lessons are still unavailable, keep current state and message from verification.
        }

        if (verification.paymentVerified && verification.isEnrolled) {
          setSuccessMsg("Payment verified. Course access unlocked.");
        } else {
          setError(verification.reason || "Payment has not completed yet. Please try again in a few seconds.");
        }
      } catch (verificationError: any) {
        if (!ignore) {
          setError(extractErrorMessage(verificationError, "Failed to verify course payment."));
        }
      } finally {
        if (!ignore) {
          setIsVerifyingCoursePayment(false);
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("payment");
        cleanUrl.searchParams.delete("amp;payment");
        cleanUrl.searchParams.delete("tx_ref");
        cleanUrl.searchParams.delete("amp;tx_ref");
        window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
      }
    };

    void verifyCourseCheckout();

    return () => {
      ignore = true;
    };
  }, [id, user?._id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!id || !course) return;

    setError("");
    setSuccessMsg("");

    if (isPaidCourse) {
      setIsStartingCoursePayment(true);

      try {
        const init = await apiService.initializeCoursePayment(id);

        if (init.isEnrolled || init.alreadyEnrolled || init.requiresPayment === false) {
          const updatedCourse = await apiService.getCourseById(id);
          setCourse(updatedCourse);
          setSuccessMsg("Course access activated.");
          return;
        }

        if (!init.checkoutUrl) {
          throw new Error("Checkout URL was not returned by the server.");
        }

        window.location.href = init.checkoutUrl;
      } catch (checkoutError: any) {
        setError(extractErrorMessage(checkoutError, "Failed to start course checkout."));
      } finally {
        setIsStartingCoursePayment(false);
      }

      return;
    }

    setIsEnrolling(true);
    try {
      await apiService.enrollCourse(id);
      const updatedCourse = await apiService.getCourseById(id);
      setCourse(updatedCourse);
      setSuccessMsg("Successfully enrolled. Start learning now.");
    } catch (enrollError: any) {
      setError(extractErrorMessage(enrollError, "Failed to enroll in this course"));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePostComment = async () => {
    if (!id || !newComment.trim() || isPostingComment) {
      return;
    }

    setIsPostingComment(true);
    setError("");
    try {
      const created = await apiService.createCommunityPost({
        title: `Discussion: ${course?.title || "Course"}`,
        content: newComment.trim(),
        category: "qna",
        tags: [course?.title || "course", "course-discussion"],
        course: id,
      });

      setDiscussionPosts((prev) => [created, ...prev]);
      setNewComment("");
    } catch (postError: any) {
      setError(postError?.response?.data?.message || "Failed to post discussion message");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || role !== "student" || favoriteBusy) {
      return;
    }

    setFavoriteBusy(true);
    setError("");

    try {
      if (isFavorite) {
        await apiService.removeFavoriteCourse(id);
        setIsFavorite(false);
      } else {
        await apiService.addFavoriteCourse(id);
        setIsFavorite(true);
      }
    } catch (favoriteError: any) {
      setError(favoriteError?.response?.data?.message || "Failed to update favorite");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleRateCourse = async (value: number) => {
    if (!id || role !== "student" || ratingBusy) {
      return;
    }

    setRatingBusy(true);
    setError("");

    try {
      const summary = await apiService.rateCourse(id, { rating: value });
      setMyRating(Number(summary.myRating || value));
      setCourse((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          rating: Number(summary.rating || prev.rating || 0),
          numReviews: Number(summary.numReviews || prev.numReviews || 0),
        };
      });
    } catch (ratingError: any) {
      setError(ratingError?.response?.data?.message || "Failed to save rating");
    } finally {
      setRatingBusy(false);
    }
  };

  if (id === "new" && isInstructor) {
    return <CourseEditor />;
  }

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500">{loadError || "Course not found."}</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={scrollContainerRef} className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
        <div className="aspect-video bg-slate-900 relative overflow-hidden">
          {!canAccessLessons ? (
            <>
              <img
                src={course.coverImage || FALLBACK_COVER_IMAGE}
                alt="Course cover"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-white max-w-sm">
                    <Lock className="h-8 w-8 mx-auto mb-3 opacity-80" />
                    <h3 className="font-bold text-xl mb-2">{isPaidCourse ? "Purchase to Start Learning" : "Enroll to Start Learning"}</h3>
                    <p className="text-sm opacity-80 mb-4">
                      {isPaidCourse
                        ? `This paid course unlocks after checkout (${coursePrice.toFixed(2)} ${courseCurrency}).`
                        : "This lesson video is available after free enrollment."}
                    </p>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      size="lg"
                      onClick={() => void handleEnroll()}
                      disabled={isEnrolling || isStartingCoursePayment || isVerifyingCoursePayment}
                    >
                      {isVerifyingCoursePayment
                        ? "Verifying Payment..."
                        : isStartingCoursePayment
                          ? "Opening Checkout..."
                          : isEnrolling
                            ? "Enrolling..."
                            : isPaidCourse
                              ? `Pay ${coursePrice.toFixed(2)} ${courseCurrency}`
                              : "Enroll Free"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : selectedLesson?.videoUrl ? (
            embedVideoUrl ? (
              <iframe
                title={selectedLesson.title}
                src={embedVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full"
                controls
                src={selectedLesson.videoUrl}
                poster={course.coverImage || FALLBACK_COVER_IMAGE}
              >
                Your browser does not support video playback.
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={course.coverImage || FALLBACK_COVER_IMAGE}
                alt="Course cover"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/30">
                No video URL available for the selected lesson.
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMsg ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMsg}
            </div>
          ) : null}

          {isVerifyingCoursePayment ? (
            <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying your payment and unlocking course access...
            </div>
          ) : null}

          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                <Badge className={`font-extrabold tracking-wide ${isPaidCourse ? "bg-indigo-600 text-white hover:bg-indigo-600" : "bg-emerald-600 text-white hover:bg-emerald-600"}`}>
                  {isPaidCourse ? `PAID ${coursePrice.toFixed(2)} ${courseCurrency}` : "FREE COURSE"}
                </Badge>
                {isAdmin ? <Badge variant="secondary">Manage Course</Badge> : null}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor?.avatar || "https://i.pravatar.cc/150?u=instructor"} />
                    <AvatarFallback>{initials(course.instructor?.name)}</AvatarFallback>
                  </Avatar>
                  {course.instructor?.name || "Unknown Instructor"}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  {reviewCount > 0 ? `${ratingValue.toFixed(1)} (${reviewCount} reviews)` : "No ratings yet"}
                </span>
                <span>{Array.isArray(course.students) ? course.students.length : 0} students</span>
                <span className={`font-semibold ${isPaidCourse ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {isPaidCourse ? `${coursePrice.toFixed(2)} ${courseCurrency}` : "Free"}
                </span>
              </div>
              {role === "student" && isEnrolled ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Your rating:</span>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={`rate-${value}`}
                      type="button"
                      onClick={() => void handleRateCourse(value)}
                      disabled={ratingBusy}
                      className="rounded p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star className={`h-4 w-4 ${value <= myRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500">{ratingBusy ? "Saving..." : (myRating > 0 ? `${myRating}/5` : "Tap a star")}</span>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <Button variant="destructive" size="sm">Delete Course</Button>
              ) : (
                <>
                  {role === "student" && !canAccessLessons ? (
                    <Button
                      size="sm"
                      onClick={() => void handleEnroll()}
                      disabled={isEnrolling || isStartingCoursePayment || isVerifyingCoursePayment}
                    >
                      {isStartingCoursePayment
                        ? "Opening Checkout..."
                        : isEnrolling
                          ? "Enrolling..."
                          : isPaidCourse
                            ? `Pay ${coursePrice.toFixed(2)} ${courseCurrency}`
                            : "Enroll Free"}
                    </Button>
                  ) : null}

                  {role === "student" ? (
                    <Button variant="outline" size="icon" onClick={() => void handleToggleFavorite()} disabled={favoriteBusy}>
                      <Heart className={`h-5 w-5 ${isFavorite ? "text-red-500 fill-red-500" : ""}`} />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon">
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
            <nav className="flex gap-6">
              {["overview", "resources", "discussion"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={!canAccessLessons && tab !== "overview"}
                  className={`pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  } ${!canAccessLessons && tab !== "overview" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {tab === "overview" ? tab : (!canAccessLessons ? `${tab} (locked)` : tab)}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "overview" ? (
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About this course</h3>
                <p>{course.description}</p>
              </div>
            ) : null}

            {activeTab === "resources" ? (
              courseResources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courseResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{resource.name}</p>
                          <p className="text-xs text-slate-500 truncate">From: {resource.lessonTitle}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(resource.url, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No uploaded resources available yet.</div>
              )
            ) : null}

            {activeTab === "discussion" ? (
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage src={user?.avatar || "https://i.pravatar.cc/150?u=current-user"} />
                    <AvatarFallback>{initials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Ask a question or share a thought..."
                      className="min-h-[100px]"
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={() => void handlePostComment()} disabled={isPostingComment || !newComment.trim()}>
                        {isPostingComment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        {isPostingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </div>

                {isDiscussionLoading ? (
                  <div className="text-sm text-slate-500">Loading discussion...</div>
                ) : discussionPosts.length > 0 ? (
                  <div className="space-y-4">
                    {discussionPosts.map((post) => (
                      <div key={post._id} className="flex gap-4">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={post.user?.avatar || ""} />
                          <AvatarFallback>{initials(post.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1 gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">{post.user?.name || "User"}</span>
                              <span className="text-xs text-slate-500">{formatPostTime(post.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 ml-2 text-xs text-slate-500">
                            <span>{post.repliesCount || 0} replies</span>
                            <span>{post.upvotes?.length || 0} upvotes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No discussion yet. Be the first to post.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] border-l border-slate-200 bg-white flex flex-col dark:border-slate-800 dark:bg-slate-950 h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Course Content</h3>
          <div className="flex justify-between items-center text-sm mb-1 text-slate-600 dark:text-slate-400">
            <span>Progress: {progress}%</span>
            <span>{completedCount} / {visibleLessons.length} Lessons</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900 transition-colors">
              <div className="text-left">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">All Lectures</h4>
                <p className="text-xs text-slate-500 mt-0.5">{visibleLessons.length} lessons</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
            </button>
            <div className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800/50">
              {visibleLessons.length > 0 ? (
                visibleLessons.map((lesson, i) => {
                  const isSelected = selectedLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      className={`w-full flex items-start gap-3 p-4 transition-colors text-left ${
                        !canAccessLessons
                          ? "opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                      onClick={() => {
                        if (!canAccessLessons) return;
                        setSelectedLessonId(lesson._id);
                      }}
                    >
                      <div className="mt-0.5">
                        {canAccessLessons && i < completedCount ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : !canAccessLessons ? (
                          <Lock className="h-5 w-5 text-slate-400" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            !canAccessLessons ? "text-slate-500" : "font-medium text-slate-900 dark:text-white"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <PlayCircle className="h-3 w-3" />
                          <span>{formatDuration(lesson.duration)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  {isInstructor ? "Add lessons from instructor dashboard to populate this course." : "No lessons available yet."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}