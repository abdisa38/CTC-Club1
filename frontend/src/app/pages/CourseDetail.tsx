import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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

type CurriculumLessonRow = {
  lesson: Lesson;
  globalIndex: number;
};

type CurriculumTopicGroup = {
  key: string;
  title: string;
  order: number;
  lessons: CurriculumLessonRow[];
};

type CurriculumWeekGroup = {
  key: string;
  title: string;
  order: number;
  topics: CurriculumTopicGroup[];
};

type NewLessonForm = {
  title: string;
  phaseTitle: string;
  phaseOrder: string;
  weekTitle: string;
  weekOrder: string;
  topicTitle: string;
  topicOrder: string;
  videoUrlsInput: string;
  duration: string;
  sectionBreakdownInput: string;
  classChecklistInput: string;
  classNotesInput: string;
  classQuestionsInput: string;
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
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (hostname.includes("youtube.com") || hostname.includes("youtube-nocookie.com")) {
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

    if (hostname.includes("vimeo.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const id = pathParts[pathParts.length - 1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
};

const getLessonVideoUrls = (lesson: Lesson | null | undefined): string[] => {
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

const toVideoLabel = (url: string, index: number): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return `Video ${index + 1} (${host})`;
  } catch {
    return `Video ${index + 1}`;
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

const parseVideoUrlsInput = (input: string): string[] => {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    return [];
  }

  const unique = new Set<string>();

  const extractedUrls = normalizedInput.match(/https?:\/\/[^\s,]+/g) || [];
  extractedUrls
    .map((item) => item.trim().replace(/[).,;]+$/g, ""))
    .filter(Boolean)
    .forEach((url) => unique.add(url));

  if (unique.size === 0) {
    normalizedInput
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((url) => unique.add(url));
  }

  return Array.from(unique);
};

const isDirectVideoFileUrl = (url: string): boolean => {
  const normalized = String(url || "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?|#|$)/i.test(normalized);
};

const parseOptionalOrderInput = (input: string): number | undefined => {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

const parseChecklistInput = (input: string): string[] => {
  if (!input.trim()) {
    return [];
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const parseSectionBreakdownInput = (input: string): Array<{ title: string; durationMinutes?: number }> => {
  if (!input.trim()) {
    return [];
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      const title = (parts[0] || "").trim();
      const durationRaw = (parts[1] || "").trim();

      if (!title) {
        return null;
      }

      const durationMinutes = Number(durationRaw);
      if (durationRaw && Number.isFinite(durationMinutes) && durationMinutes >= 0) {
        return {
          title,
          durationMinutes,
        };
      }

      return {
        title,
      };
    })
    .filter((entry): entry is { title: string; durationMinutes?: number } => Boolean(entry));
};

const parseClassNotesInput = (input: string): Array<{ title: string; url: string }> => {
  if (!input.trim()) {
    return [];
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      const title = (parts[0] || "").trim();
      const url = (parts[1] || "").trim();

      if (!title || !url) {
        return null;
      }

      return {
        title,
        url,
      };
    })
    .filter((entry): entry is { title: string; url: string } => Boolean(entry));
};

const parseClassQuestionsInput = (input: string): Array<{ question: string; answer?: string }> => {
  if (!input.trim()) {
    return [];
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      const question = (parts[0] || "").trim();
      const answer = (parts[1] || "").trim();

      if (!question) {
        return null;
      }

      if (answer) {
        return {
          question,
          answer,
        };
      }

      return {
        question,
      };
    })
    .filter((entry): entry is { question: string; answer?: string } => Boolean(entry));
};

const readOrder = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const sortCurriculumLessons = (left: Lesson, right: Lesson): number => {
  const leftPhaseOrder = readOrder(left.phaseOrder, 0);
  const rightPhaseOrder = readOrder(right.phaseOrder, 0);
  if (leftPhaseOrder !== rightPhaseOrder) {
    return leftPhaseOrder - rightPhaseOrder;
  }

  const leftWeekOrder = readOrder(left.weekOrder, 0);
  const rightWeekOrder = readOrder(right.weekOrder, 0);
  if (leftWeekOrder !== rightWeekOrder) {
    return leftWeekOrder - rightWeekOrder;
  }

  const leftTopicOrder = readOrder(left.topicOrder, 0);
  const rightTopicOrder = readOrder(right.topicOrder, 0);
  if (leftTopicOrder !== rightTopicOrder) {
    return leftTopicOrder - rightTopicOrder;
  }

  const leftLessonOrder = readOrder(left.order, 0);
  const rightLessonOrder = readOrder(right.order, 0);
  if (leftLessonOrder !== rightLessonOrder) {
    return leftLessonOrder - rightLessonOrder;
  }

  return String(left.title || "").localeCompare(String(right.title || ""));
};

const getProjectRefId = (value?: { _id: string } | string | null): string => {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value._id;
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
  phaseTitle: "",
  phaseOrder: "0",
  weekTitle: "",
  weekOrder: "0",
  topicTitle: "",
  topicOrder: "0",
  videoUrlsInput: "",
  duration: "",
  sectionBreakdownInput: "",
  classChecklistInput: "",
  classNotesInput: "",
  classQuestionsInput: "",
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
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const isInstructor = role === "instructor" || role === "admin";
  const isAdmin = role === "admin";
  const isStudent = role === "student";

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
  const [selectedLessonVideoIndex, setSelectedLessonVideoIndex] = useState(0);
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

  const curriculumLessons = useMemo(
    () => [...visibleLessons].sort(sortCurriculumLessons),
    [visibleLessons]
  );

  useEffect(() => {
    if (curriculumLessons.length === 0) {
      setSelectedLessonId("");
      return;
    }

    const exists = curriculumLessons.some((lesson) => lesson._id === selectedLessonId);
    if (!exists) {
      setSelectedLessonId(curriculumLessons[0]._id);
    }
  }, [curriculumLessons, selectedLessonId]);

  const selectedLesson = useMemo(
    () => curriculumLessons.find((lesson) => lesson._id === selectedLessonId) || curriculumLessons[0] || null,
    [curriculumLessons, selectedLessonId]
  );

  const groupedCurriculum = useMemo(() => {
    const weeks = new Map<string, { key: string; title: string; order: number; topics: Map<string, CurriculumTopicGroup> }>();

    curriculumLessons.forEach((lesson, globalIndex) => {
      const phaseOrder = readOrder(lesson.phaseOrder, 0);
      const phaseTitle = String(lesson.phaseTitle || "").trim();
      const weekOrder = readOrder(lesson.weekOrder, 0);
      const weekTitle = String(lesson.weekTitle || "").trim() || `Week ${weekOrder + 1}`;
      const weekDisplayTitle = phaseTitle ? `${phaseTitle} / ${weekTitle}` : weekTitle;
      const weekKey = `${phaseOrder}-${phaseTitle.toLowerCase()}-${weekOrder}-${weekTitle.toLowerCase()}`;

      const topicTitle = String(lesson.topicTitle || "").trim() || lesson.title;
      const topicOrder = readOrder(lesson.topicOrder, readOrder(lesson.order, globalIndex));
      const topicKey = `${topicOrder}-${topicTitle.toLowerCase()}`;

      let weekGroup = weeks.get(weekKey);
      if (!weekGroup) {
        weekGroup = {
          key: weekKey,
          title: weekDisplayTitle,
          order: globalIndex,
          topics: new Map<string, CurriculumTopicGroup>(),
        };
        weeks.set(weekKey, weekGroup);
      }

      let topicGroup = weekGroup.topics.get(topicKey);
      if (!topicGroup) {
        topicGroup = {
          key: topicKey,
          title: topicTitle,
          order: topicOrder,
          lessons: [],
        };
        weekGroup.topics.set(topicKey, topicGroup);
      }

      topicGroup.lessons.push({ lesson, globalIndex });
    });

    return Array.from(weeks.values())
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
      .map((weekGroup): CurriculumWeekGroup => ({
        key: weekGroup.key,
        title: weekGroup.title,
        order: weekGroup.order,
        topics: Array.from(weekGroup.topics.values()).sort(
          (left, right) => left.order - right.order || left.title.localeCompare(right.title)
        ),
      }));
  }, [curriculumLessons]);

  useEffect(() => {
    setSelectedLessonVideoIndex(0);
  }, [selectedLesson?._id]);

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
  const selectedLessonIndex = selectedLesson ? curriculumLessons.findIndex((lesson) => lesson._id === selectedLesson._id) : -1;
  const completedCount = canAccessLessons && selectedLessonIndex >= 0 ? selectedLessonIndex + 1 : 0;
  const progress = curriculumLessons.length > 0 ? Math.round((completedCount / curriculumLessons.length) * 100) : 0;

  const selectedLessonVideoUrls = useMemo(() => getLessonVideoUrls(selectedLesson), [selectedLesson]);
  const safeSelectedVideoIndex =
    selectedLessonVideoIndex >= 0 && selectedLessonVideoIndex < selectedLessonVideoUrls.length
      ? selectedLessonVideoIndex
      : 0;
  const selectedLessonVideoUrl = selectedLessonVideoUrls[safeSelectedVideoIndex] || "";
  const embedVideoUrl = selectedLessonVideoUrl ? getEmbedVideoUrl(selectedLessonVideoUrl) : null;

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, selectedLessonId]);

  useEffect(() => {
    const availableTabs = canAccessLessons
      ? ["overview", "resources", "quizzes", "projects", "discussion"]
      : ["overview"];

    if (!availableTabs.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, canAccessLessons]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get("tab");
    if (!requestedTab) {
      return;
    }

    const availableTabs = canAccessLessons
      ? ["overview", "resources", "quizzes", "projects", "discussion"]
      : ["overview"];

    if (availableTabs.includes(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [location.search, canAccessLessons, activeTab]);

  useEffect(() => {
    if (!id || !canAccessLessons) {
      setCourseQuizzes([]);
      setCourseProjects([]);
      setCourseProjectSubmissions([]);
      return;
    }

    let cancelled = false;

    const fetchCourseContent = async () => {
      setIsCourseContentLoading(true);

      try {
        const [quizzes, projects] = await Promise.all([
          apiService.getQuizzes(id),
          apiService.getProjects(id),
        ]);

        const submissions = await apiService.getProjectSubmissions();
        const courseProjectIds = new Set(projects.map((project) => project._id));
        const filteredSubmissions = submissions.filter((submission) => {
          const projectId = getProjectRefId(submission.project);
          return Boolean(projectId) && courseProjectIds.has(projectId);
        });

        if (cancelled) {
          return;
        }

        setCourseQuizzes(Array.isArray(quizzes) ? quizzes : []);
        setCourseProjects(Array.isArray(projects) ? projects : []);
        setCourseProjectSubmissions(Array.isArray(filteredSubmissions) ? filteredSubmissions : []);
      } catch (contentError: any) {
        if (!cancelled) {
          setError(extractErrorMessage(contentError, "Failed to load quizzes and projects for this course"));
        }
      } finally {
        if (!cancelled) {
          setIsCourseContentLoading(false);
        }
      }
    };

    void fetchCourseContent();

    return () => {
      cancelled = true;
    };
  }, [id, canAccessLessons]);

  useEffect(() => {
    if (quizMode !== "taking") {
      return;
    }

    if (quizTimeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setQuizTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [quizMode, quizTimeLeft]);

  const courseResources = useMemo(() => {
    const resources: CourseResource[] = [];

    curriculumLessons.forEach((lesson) => {
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
  }, [curriculumLessons]);

  const projectSubmissionByProjectId = useMemo(() => {
    const map = new Map<string, ProjectSubmission>();

    courseProjectSubmissions.forEach((submission) => {
      const projectId = getProjectRefId(submission.project);
      if (!projectId || map.has(projectId)) {
        return;
      }

      map.set(projectId, submission);
    });

    return map;
  }, [courseProjectSubmissions]);

  const pendingProjectSubmissions = useMemo(
    () => courseProjectSubmissions.filter((submission) => submission.status !== "graded"),
    [courseProjectSubmissions],
  );

  const activeQuizQuestion = useMemo(() => {
    if (!activeQuiz || !Array.isArray(activeQuiz.questions)) {
      return null;
    }

    return activeQuiz.questions[activeQuizQuestionIndex] || null;
  }, [activeQuiz, activeQuizQuestionIndex]);

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

  const handleUploadNewLessonResources = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setIsUploadingLessonResources(true);
    setError("");

    const uploadedAttachments: NewLessonForm["attachments"] = [];

    for (const file of files) {
      try {
        const uploaded = await apiService.uploadLessonResource(file);
        uploadedAttachments.push({
          title: uploaded.originalName || file.name,
          url: uploaded.url,
          fileType: uploaded.fileType || file.type || "file",
        });
      } catch (uploadError: any) {
        setError(extractErrorMessage(uploadError, `Failed to upload resource: ${file.name}`));
      }
    }

    if (uploadedAttachments.length > 0) {
      setNewLessonForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedAttachments],
      }));
    }

    setIsUploadingLessonResources(false);
    event.target.value = "";
  };

  const handleCreateLessonInCourse = async () => {
    if (!id) {
      return;
    }

    if (!newLessonForm.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    setContentActionBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const parsedVideoUrls = parseVideoUrlsInput(newLessonForm.videoUrlsInput);
      const parsedPhaseTitle = newLessonForm.phaseTitle.trim();
      const parsedPhaseOrder = parseOptionalOrderInput(newLessonForm.phaseOrder);
      const parsedWeekTitle = newLessonForm.weekTitle.trim();
      const parsedWeekOrder = parseOptionalOrderInput(newLessonForm.weekOrder);
      const parsedTopicTitle = newLessonForm.topicTitle.trim();
      const parsedTopicOrder = parseOptionalOrderInput(newLessonForm.topicOrder);
      const parsedSectionBreakdown = parseSectionBreakdownInput(newLessonForm.sectionBreakdownInput);
      const parsedChecklist = parseChecklistInput(newLessonForm.classChecklistInput);
      const parsedClassNotes = parseClassNotesInput(newLessonForm.classNotesInput);
      const parsedClassQuestions = parseClassQuestionsInput(newLessonForm.classQuestionsInput);

      const createdLesson = await apiService.createLesson(id, {
        title: newLessonForm.title.trim(),
        content: newLessonForm.title.trim(),
        videoUrl: parsedVideoUrls[0] || undefined,
        videoUrls: parsedVideoUrls.length > 0 ? parsedVideoUrls : undefined,
        duration: parseDurationInput(newLessonForm.duration),
        order: lessons.length,
        isPublished: newLessonForm.isPublished,
        attachments: newLessonForm.attachments,
        ...(parsedPhaseTitle ? { phaseTitle: parsedPhaseTitle } : {}),
        ...(parsedPhaseOrder !== undefined ? { phaseOrder: parsedPhaseOrder } : {}),
        ...(parsedWeekTitle ? { weekTitle: parsedWeekTitle } : {}),
        ...(parsedWeekOrder !== undefined ? { weekOrder: parsedWeekOrder } : {}),
        ...(parsedTopicTitle ? { topicTitle: parsedTopicTitle } : {}),
        ...(parsedTopicOrder !== undefined ? { topicOrder: parsedTopicOrder } : {}),
        ...(parsedSectionBreakdown.length > 0 ? { sectionBreakdown: parsedSectionBreakdown } : {}),
        ...(parsedChecklist.length > 0 ? { classChecklist: parsedChecklist } : {}),
        ...(parsedClassNotes.length > 0 ? { classNotes: parsedClassNotes } : {}),
        ...(parsedClassQuestions.length > 0 ? { classQuestions: parsedClassQuestions } : {}),
      });

      setLessons((prev) => [...prev, createdLesson].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setSelectedLessonId(createdLesson._id);
      setShowLessonCreator(false);
      setNewLessonForm(defaultLessonForm);
      setSuccessMsg("Lesson and resources added inside this course.");
    } catch (lessonSaveError: any) {
      setError(extractErrorMessage(lessonSaveError, "Failed to create lesson"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleCreateCourseQuiz = async () => {
    if (!id) {
      return;
    }

    if (!quizForm.title.trim()) {
      setError("Quiz title is required");
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const createdQuiz = await apiService.createQuiz({
        title: quizForm.title.trim(),
        description: quizForm.description.trim() || undefined,
        courseId: id,
        passingScore: Number(quizForm.passingScore) || 70,
        timeLimit: Number(quizForm.timeLimit) || 30,
        maxAttempts: Number(quizForm.maxAttempts) || 3,
        xpReward: Number(quizForm.xpReward) || 10,
        isPublished: quizForm.isPublished,
      });

      setCourseQuizzes((prev) => [createdQuiz, ...prev]);
      setQuizForm(defaultQuizForm);
      setSuccessMsg("Quiz created for this course.");
    } catch (quizCreateError: any) {
      setError(extractErrorMessage(quizCreateError, "Failed to create quiz"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleToggleQuizPublish = async (quiz: Quiz) => {
    if (!id) {
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const updated = await apiService.updateQuiz(quiz._id, {
        courseId: id,
        isPublished: !quiz.isPublished,
      });

      setCourseQuizzes((prev) => prev.map((item) => (item._id === quiz._id ? updated : item)));
      if (activeQuiz?._id === quiz._id) {
        setActiveQuiz(updated);
      }
    } catch (quizUpdateError: any) {
      setError(extractErrorMessage(quizUpdateError, "Failed to update quiz"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleDeleteCourseQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) {
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      await apiService.deleteQuiz(quizId);
      setCourseQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));

      if (activeQuiz?._id === quizId) {
        setActiveQuiz(null);
        setQuizMode("list");
        setQuizResult(null);
      }

      if (questionQuizId === quizId) {
        setQuestionQuizId("");
        setQuizQuestionForm(defaultQuestionForm);
      }
    } catch (quizDeleteError: any) {
      setError(extractErrorMessage(quizDeleteError, "Failed to delete quiz"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const buildQuizQuestionPayload = () => {
    if (!quizQuestionForm.questionText.trim()) {
      throw new Error("Question text is required");
    }

    const normalizedPoints = Math.max(1, Number(quizQuestionForm.points) || 1);

    if (quizQuestionForm.type === "short-answer") {
      if (!quizQuestionForm.correctAnswerText.trim()) {
        throw new Error("Short-answer questions require a correct answer");
      }

      return {
        questionText: quizQuestionForm.questionText.trim(),
        type: quizQuestionForm.type,
        correctAnswerText: quizQuestionForm.correctAnswerText.trim(),
        points: normalizedPoints,
      };
    }

    if (quizQuestionForm.type === "true-false") {
      const correctAnswerIndex = Number(quizQuestionForm.correctAnswerIndex);
      if (![0, 1].includes(correctAnswerIndex)) {
        throw new Error("True/false questions require answer index 0 or 1");
      }

      return {
        questionText: quizQuestionForm.questionText.trim(),
        type: quizQuestionForm.type,
        correctAnswerIndex,
        points: normalizedPoints,
      };
    }

    const options = quizQuestionForm.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 2) {
      throw new Error("Multiple-choice questions require at least 2 options");
    }

    const correctAnswerIndex = Number(quizQuestionForm.correctAnswerIndex);
    if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      throw new Error("Select a valid correct answer option");
    }

    return {
      questionText: quizQuestionForm.questionText.trim(),
      type: quizQuestionForm.type,
      options,
      correctAnswerIndex,
      points: normalizedPoints,
    };
  };

  const handleAddQuestionToCourseQuiz = async () => {
    if (!questionQuizId) {
      setError("Select a quiz before adding a question");
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const payload = buildQuizQuestionPayload();
      const updatedQuiz = await apiService.addQuizQuestion(questionQuizId, payload);

      setCourseQuizzes((prev) => prev.map((quiz) => (quiz._id === questionQuizId ? updatedQuiz : quiz)));
      if (activeQuiz?._id === questionQuizId) {
        setActiveQuiz(updatedQuiz);
      }

      setQuizQuestionForm(defaultQuestionForm);
      setSuccessMsg("Question added to quiz.");
    } catch (questionError: any) {
      setError(extractErrorMessage(questionError, "Failed to add question"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const startCourseQuiz = async (quizId: string) => {
    setContentActionBusy(true);
    setError("");

    try {
      const quiz = await apiService.getQuizById(quizId);
      setActiveQuiz(quiz);
      setQuizMode("taking");
      setActiveQuizQuestionIndex(0);
      setQuizAnswerMap({});
      setQuizResult(null);
      setQuizTimeLeft((Number(quiz.timeLimit) || 10) * 60);
    } catch (startError: any) {
      setError(extractErrorMessage(startError, "Failed to start quiz"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const resetQuizExperience = () => {
    setQuizMode("list");
    setActiveQuiz(null);
    setActiveQuizQuestionIndex(0);
    setQuizAnswerMap({});
    setQuizResult(null);
    setQuizTimeLeft(0);
  };

  const handleSubmitActiveQuiz = async () => {
    if (!activeQuiz) {
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const totalTime = (Number(activeQuiz.timeLimit) || 10) * 60;
      const answers = activeQuiz.questions.map((question, index) => {
        const userAnswer = quizAnswerMap[index];

        if (question.type === "short-answer") {
          return {
            questionId: question._id,
            userAnswerText: typeof userAnswer === "string" ? userAnswer : "",
          };
        }

        const parsedIndex = typeof userAnswer === "number" ? userAnswer : Number(userAnswer);
        return {
          questionId: question._id,
          userAnswerIndex: Number.isInteger(parsedIndex) ? parsedIndex : undefined,
        };
      });

      const result = await apiService.submitQuiz(activeQuiz._id, {
        answers,
        timeSpent: Math.max(0, totalTime - quizTimeLeft),
      });

      setQuizResult(result);
      setQuizMode("results");
    } catch (submitError: any) {
      setError(extractErrorMessage(submitError, "Failed to submit quiz"));
      setQuizMode("list");
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleNextQuizQuestion = async () => {
    if (!activeQuiz) {
      return;
    }

    const lastQuestionIndex = activeQuiz.questions.length - 1;
    if (activeQuizQuestionIndex >= lastQuestionIndex) {
      await handleSubmitActiveQuiz();
      return;
    }

    setActiveQuizQuestionIndex((prev) => prev + 1);
  };

  const handleCreateCourseProject = async () => {
    if (!id) {
      return;
    }

    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      setError("Project title and description are required");
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const createdProject = await apiService.createProject({
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        courseId: id,
        instructions: projectForm.instructions.trim() || undefined,
        requirements: projectForm.requirements
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        xpReward: Math.max(0, Number(projectForm.xpReward) || 0),
        maxPoints: Math.max(1, Number(projectForm.maxPoints) || 100),
        deadline: projectForm.deadline ? new Date(projectForm.deadline).toISOString() : undefined,
        isPublished: projectForm.isPublished,
      });

      const normalizedProject: Project = {
        ...createdProject,
        course: {
          _id: id,
          title: course?.title || (typeof createdProject.course === "string" ? "Course" : createdProject.course?.title || "Course"),
        },
      };

      setCourseProjects((prev) => [normalizedProject, ...prev]);
      setProjectForm(defaultProjectForm);
      setSuccessMsg("Project created inside this course.");
    } catch (projectCreateError: any) {
      setError(extractErrorMessage(projectCreateError, "Failed to create project"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleToggleProjectPublish = async (project: Project) => {
    setContentActionBusy(true);
    setError("");

    try {
      const updated = await apiService.updateProject(project._id, {
        isPublished: !project.isPublished,
      });

      setCourseProjects((prev) => prev.map((item) => (item._id === project._id ? updated : item)));
    } catch (projectUpdateError: any) {
      setError(extractErrorMessage(projectUpdateError, "Failed to update project"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const handleDeleteCourseProject = async (projectId: string) => {
    if (!confirm("Delete this project?")) {
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      await apiService.deleteProject(projectId);
      setCourseProjects((prev) => prev.filter((project) => project._id !== projectId));
      setCourseProjectSubmissions((prev) => prev.filter((submission) => getProjectRefId(submission.project) !== projectId));
    } catch (projectDeleteError: any) {
      setError(extractErrorMessage(projectDeleteError, "Failed to delete project"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const updateProjectSubmissionDraft = (projectId: string, field: "repoUrl" | "liveUrl" | "comments", value: string) => {
    setProjectSubmissionDrafts((prev) => {
      const existing = prev[projectId] || { repoUrl: "", liveUrl: "", comments: "" };
      return {
        ...prev,
        [projectId]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleSubmitCourseProject = async (projectId: string) => {
    const draft = projectSubmissionDrafts[projectId] || { repoUrl: "", liveUrl: "", comments: "" };
    const repoUrl = draft.repoUrl.trim();

    if (!repoUrl) {
      setError("Repository URL is required for project submission");
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const submission = await apiService.submitProject(projectId, {
        repoUrl,
        liveUrl: draft.liveUrl.trim() || undefined,
        comments: draft.comments.trim() || undefined,
      });

      setCourseProjectSubmissions((prev) => {
        const submittedProjectId = getProjectRefId(submission.project) || projectId;
        const withoutCurrent = prev.filter((item) => {
          const currentProjectId = getProjectRefId(item.project);
          return currentProjectId !== submittedProjectId;
        });

        return [submission, ...withoutCurrent];
      });

      setProjectSubmissionDrafts((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      setSuccessMsg("Project submission saved.");
    } catch (submissionError: any) {
      setError(extractErrorMessage(submissionError, "Failed to submit project"));
    } finally {
      setContentActionBusy(false);
    }
  };

  const updateGradingDraft = (submissionId: string, field: "grade" | "feedback", value: string) => {
    setGradingDrafts((prev) => {
      const existing = prev[submissionId] || { grade: "", feedback: "" };
      return {
        ...prev,
        [submissionId]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleGradeCourseSubmission = async (submissionId: string) => {
    const draft = gradingDrafts[submissionId] || { grade: "", feedback: "" };
    const grade = Number(draft.grade);

    if (!Number.isFinite(grade) || grade < 0) {
      setError("Enter a valid numeric grade");
      return;
    }

    if (!draft.feedback.trim()) {
      setError("Feedback is required");
      return;
    }

    setContentActionBusy(true);
    setError("");

    try {
      const updated = await apiService.reviewProject(submissionId, {
        grade,
        feedback: draft.feedback.trim(),
      });

      setCourseProjectSubmissions((prev) => prev.map((submission) => (
        submission._id === updated._id ? updated : submission
      )));

      setGradingDrafts((prev) => {
        const next = { ...prev };
        delete next[submissionId];
        return next;
      });
      setSuccessMsg("Submission graded.");
    } catch (gradingError: any) {
      setError(extractErrorMessage(gradingError, "Failed to grade submission"));
    } finally {
      setContentActionBusy(false);
    }
  };

  useEffect(() => {
    if (quizMode !== "taking" || quizTimeLeft > 0 || contentActionBusy) {
      return;
    }

    void handleSubmitActiveQuiz();
  }, [quizMode, quizTimeLeft, contentActionBusy]);

  const formatQuizTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
        <div className="relative w-full min-h-[280px] sm:min-h-[340px] lg:min-h-[400px] bg-slate-900 overflow-hidden">
          {!canAccessLessons ? (
            <>
              <img
                src={course.coverImage || FALLBACK_COVER_IMAGE}
                alt="Course cover"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
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
          ) : selectedLessonVideoUrl ? (
            embedVideoUrl ? (
              <iframe
                title={selectedLesson.title}
                src={embedVideoUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isDirectVideoFileUrl(selectedLessonVideoUrl) ? (
              <video
                className="absolute inset-0 w-full h-full"
                controls
                src={selectedLessonVideoUrl}
                poster={course.coverImage || FALLBACK_COVER_IMAGE}
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <>
                <img
                  src={course.coverImage || FALLBACK_COVER_IMAGE}
                  alt="Course cover"
                  className="absolute inset-0 w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="rounded-xl border border-white/20 bg-black/55 px-5 py-4 text-center text-white max-w-md">
                    <p className="text-sm mb-3">This video link cannot be embedded inline. Open it directly:</p>
                    <Button
                      type="button"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => window.open(selectedLessonVideoUrl, "_blank", "noopener,noreferrer")}
                    >
                      Open Video Link
                    </Button>
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={course.coverImage || FALLBACK_COVER_IMAGE}
                alt="Course cover"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/30">
                No video URL available for the selected lesson.
              </div>
            </div>
          )}
        </div>

        {canAccessLessons && selectedLessonVideoUrls.length > 1 ? (
          <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Lesson videos:</span>
              {selectedLessonVideoUrls.map((videoUrl, index) => {
                const isSelectedVideo = index === safeSelectedVideoIndex;

                return (
                  <button
                    key={`course-lesson-video-${index}`}
                    type="button"
                    onClick={() => setSelectedLessonVideoIndex(index)}
                    title={videoUrl}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      isSelectedVideo
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    {toVideoLabel(videoUrl, index)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

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

          {canAccessLessons && selectedLesson && selectedLessonVideoUrls.length > 0 ? (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Lesson Videos</h3>
              </div>
              {selectedLessonVideoUrls.map((videoUrl, index) => {
                const isSelectedVideo = index === safeSelectedVideoIndex;

                return (
                  <div
                    key={`course-detail-video-row-${index}`}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      isSelectedVideo
                        ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{toVideoLabel(videoUrl, index)}</p>
                      <p className="text-xs text-slate-500 truncate">{videoUrl}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelectedVideo ? "default" : "outline"}
                      onClick={() => setSelectedLessonVideoIndex(index)}
                      className="ml-3 shrink-0"
                    >
                      {isSelectedVideo ? "Playing" : "Play"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
            <nav className="flex gap-6">
              {["overview", "resources", "quizzes", "projects", "discussion"].map((tab) => (
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
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About this course</h3>
                  <p>{course.description}</p>
                </div>

                {selectedLesson ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Current Lesson Structure</h4>
                      {selectedLesson.phaseTitle ? <Badge variant="secondary">{selectedLesson.phaseTitle}</Badge> : null}
                      {selectedLesson.weekTitle ? <Badge variant="secondary">{selectedLesson.weekTitle}</Badge> : null}
                      {selectedLesson.topicTitle ? <Badge variant="outline">{selectedLesson.topicTitle}</Badge> : null}
                    </div>

                    {selectedLessonVideoUrls.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lesson Videos</p>
                        <div className="space-y-1">
                          {selectedLessonVideoUrls.map((videoUrl, index) => (
                            <div key={`${selectedLesson._id}-video-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                              <span className="text-slate-700 dark:text-slate-200 truncate pr-2">{toVideoLabel(videoUrl, index)}</span>
                              <Button size="sm" variant="outline" onClick={() => setSelectedLessonVideoIndex(index)}>
                                {index === safeSelectedVideoIndex ? "Playing" : "Play"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(selectedLesson.sectionBreakdown) && selectedLesson.sectionBreakdown.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Section by Section</p>
                        <div className="space-y-1">
                          {selectedLesson.sectionBreakdown.map((section, index) => (
                            <div key={`${selectedLesson._id}-section-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                              <span className="text-slate-700 dark:text-slate-200">{section.title}</span>
                              <span className="text-xs text-slate-500">{section.durationMinutes !== undefined ? `${section.durationMinutes}m` : "-"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(selectedLesson.classChecklist) && selectedLesson.classChecklist.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Class Checklist</p>
                        <ul className="space-y-1">
                          {selectedLesson.classChecklist.map((item, index) => (
                            <li key={`${selectedLesson._id}-check-${index}`} className="text-sm text-slate-700 dark:text-slate-200">
                              {index + 1}. {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(selectedLesson.classNotes) && selectedLesson.classNotes.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Class Notes</p>
                        <div className="space-y-1">
                          {selectedLesson.classNotes.map((note, index) => (
                            <div key={`${selectedLesson._id}-note-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                              <span className="text-slate-700 dark:text-slate-200">{note.title}</span>
                              <Button size="sm" variant="outline" onClick={() => window.open(note.url, "_blank", "noopener,noreferrer")}>
                                Open
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(selectedLesson.classQuestions) && selectedLesson.classQuestions.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Questions Asked In Class</p>
                        <div className="space-y-2">
                          {selectedLesson.classQuestions.map((questionItem, index) => (
                            <div key={`${selectedLesson._id}-qa-${index}`} className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Q: {questionItem.question}</p>
                              {questionItem.answer ? (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">A: {questionItem.answer}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedLessonVideoUrls.length === 0
                    && (!Array.isArray(selectedLesson.sectionBreakdown) || selectedLesson.sectionBreakdown.length === 0)
                    && (!Array.isArray(selectedLesson.classChecklist) || selectedLesson.classChecklist.length === 0)
                    && (!Array.isArray(selectedLesson.classNotes) || selectedLesson.classNotes.length === 0)
                    && (!Array.isArray(selectedLesson.classQuestions) || selectedLesson.classQuestions.length === 0) ? (
                      <p className="text-sm text-slate-500">No extra lesson structure has been added yet.</p>
                    ) : null}
                  </div>
                ) : null}
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

            {activeTab === "quizzes" ? (
              <div className="space-y-6">
                {isCourseContentLoading ? (
                  <div className="text-sm text-slate-500">Loading quizzes...</div>
                ) : null}

                {isInstructor ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">Create Quiz In This Course</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Quiz title</label>
                        <Input
                          value={quizForm.title}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="Module 1 Knowledge Check"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Description</label>
                        <Textarea
                          value={quizForm.description}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, description: event.target.value }))}
                          placeholder="Short context for learners"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Passing score (%)</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={quizForm.passingScore}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, passingScore: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Time limit (min)</label>
                        <Input
                          type="number"
                          min={0}
                          value={quizForm.timeLimit}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, timeLimit: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Max attempts</label>
                        <Input
                          type="number"
                          min={1}
                          value={quizForm.maxAttempts}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, maxAttempts: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">XP reward</label>
                        <Input
                          type="number"
                          min={0}
                          value={quizForm.xpReward}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, xpReward: event.target.value }))}
                        />
                      </div>
                      <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={quizForm.isPublished}
                          onChange={(event) => setQuizForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                        />
                        Publish immediately
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => void handleCreateCourseQuiz()} disabled={contentActionBusy}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Quiz
                      </Button>
                    </div>
                  </div>
                ) : null}

                {isInstructor && courseQuizzes.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Add Question To Quiz</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Target quiz</label>
                      <select
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                        value={questionQuizId}
                        onChange={(event) => setQuestionQuizId(event.target.value)}
                      >
                        <option value="">Select quiz</option>
                        {courseQuizzes.map((quiz) => (
                          <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Question</label>
                      <Textarea
                        value={quizQuestionForm.questionText}
                        onChange={(event) => setQuizQuestionForm((prev) => ({ ...prev, questionText: event.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Type</label>
                        <select
                          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={quizQuestionForm.type}
                          onChange={(event) => setQuizQuestionForm((prev) => ({ ...prev, type: event.target.value as CourseQuizQuestionForm["type"] }))}
                        >
                          <option value="multiple-choice">Multiple choice</option>
                          <option value="true-false">True / False</option>
                          <option value="short-answer">Short answer</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Points</label>
                        <Input
                          type="number"
                          min={1}
                          value={quizQuestionForm.points}
                          onChange={(event) => setQuizQuestionForm((prev) => ({ ...prev, points: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Correct index</label>
                        <Input
                          type="number"
                          min={0}
                          value={quizQuestionForm.correctAnswerIndex}
                          onChange={(event) => setQuizQuestionForm((prev) => ({ ...prev, correctAnswerIndex: event.target.value }))}
                          disabled={quizQuestionForm.type === "short-answer"}
                        />
                      </div>
                    </div>

                    {quizQuestionForm.type === "short-answer" ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Correct answer text</label>
                        <Input
                          value={quizQuestionForm.correctAnswerText}
                          onChange={(event) => setQuizQuestionForm((prev) => ({ ...prev, correctAnswerText: event.target.value }))}
                          placeholder="Expected student answer"
                        />
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {quizQuestionForm.options.map((option, index) => (
                          <Input
                            key={`option-${index}`}
                            value={option}
                            onChange={(event) => {
                              const nextOptions = [...quizQuestionForm.options];
                              nextOptions[index] = event.target.value;
                              setQuizQuestionForm((prev) => ({ ...prev, options: nextOptions }));
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={() => void handleAddQuestionToCourseQuiz()} disabled={contentActionBusy}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                ) : null}

                {quizMode === "taking" && activeQuiz && activeQuizQuestion ? (
                  <div className="rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-800/50 dark:bg-slate-950 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{activeQuiz.title}</h3>
                      <span className={`text-sm font-mono ${quizTimeLeft <= 60 ? "text-red-500" : "text-slate-500"}`}>
                        Time left: {formatQuizTimer(quizTimeLeft)}
                      </span>
                    </div>

                    <Progress
                      value={((activeQuizQuestionIndex + 1) / Math.max(activeQuiz.questions.length, 1)) * 100}
                      className="h-2"
                    />

                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">
                        Question {activeQuizQuestionIndex + 1} of {activeQuiz.questions.length}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">{activeQuizQuestion.questionText}</p>

                      {activeQuizQuestion.type === "short-answer" ? (
                        <Textarea
                          value={typeof quizAnswerMap[activeQuizQuestionIndex] === "string" ? String(quizAnswerMap[activeQuizQuestionIndex]) : ""}
                          onChange={(event) => setQuizAnswerMap((prev) => ({
                            ...prev,
                            [activeQuizQuestionIndex]: event.target.value,
                          }))}
                          placeholder="Type your answer"
                        />
                      ) : (
                        <div className="space-y-2">
                          {activeQuizQuestion.options?.map((option, index) => {
                            const selectedValue = quizAnswerMap[activeQuizQuestionIndex];
                            const isSelected = Number(selectedValue) === index;

                            return (
                              <button
                                key={`${activeQuizQuestion._id || activeQuizQuestionIndex}-option-${index}`}
                                type="button"
                                onClick={() => setQuizAnswerMap((prev) => ({
                                  ...prev,
                                  [activeQuizQuestionIndex]: index,
                                }))}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                                    : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveQuizQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeQuizQuestionIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button onClick={() => void handleNextQuizQuestion()} disabled={contentActionBusy}>
                        {activeQuizQuestionIndex === activeQuiz.questions.length - 1 ? "Submit Quiz" : "Next Question"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {quizMode === "results" && activeQuiz && quizResult ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/10 space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Quiz Complete</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Score: <span className="font-semibold">{Math.round(quizResult.percentage || 0)}%</span>
                      {quizResult.xpEarned > 0 ? ` • XP earned: ${quizResult.xpEarned}` : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={resetQuizExperience}>Back to quiz list</Button>
                      <Button onClick={() => void startCourseQuiz(activeQuiz._id)}>Retake quiz</Button>
                    </div>
                  </div>
                ) : null}

                {(quizMode === "list" || isInstructor) ? (
                  courseQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {courseQuizzes.map((quiz) => (
                        <div key={quiz._id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={quiz.isPublished ? "outline" : "secondary"}>
                                  {quiz.isPublished ? "Published" : "Draft"}
                                </Badge>
                                <span className="text-xs text-slate-500">{quiz.questions?.length || 0} questions</span>
                              </div>
                              <p className="font-medium text-slate-900 dark:text-white">{quiz.title}</p>
                              {quiz.description ? (
                                <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {isStudent ? (
                                <Button onClick={() => void startCourseQuiz(quiz._id)} disabled={contentActionBusy || !quiz.isPublished}>
                                  Start Quiz
                                </Button>
                              ) : (
                                <>
                                  <Button variant="outline" onClick={() => void handleToggleQuizPublish(quiz)} disabled={contentActionBusy}>
                                    {quiz.isPublished ? "Move to Draft" : "Publish"}
                                  </Button>
                                  <Button variant="destructive" onClick={() => void handleDeleteCourseQuiz(quiz._id)} disabled={contentActionBusy}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      {isInstructor
                        ? "No quizzes yet. Create the first quiz for this course above."
                        : "No quizzes are available for this course yet."}
                    </div>
                  )
                ) : null}
              </div>
            ) : null}

            {activeTab === "projects" ? (
              <div className="space-y-6">
                {isCourseContentLoading ? (
                  <div className="text-sm text-slate-500">Loading projects...</div>
                ) : null}

                {isInstructor ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-4">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">Create Project In This Course</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Project title</label>
                        <Input
                          value={projectForm.title}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="Build a portfolio website"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Description</label>
                        <Textarea
                          value={projectForm.description}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Instructions</label>
                        <Textarea
                          value={projectForm.instructions}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, instructions: event.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500">Requirements (one per line)</label>
                        <Textarea
                          value={projectForm.requirements}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, requirements: event.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">XP reward</label>
                        <Input
                          type="number"
                          min={0}
                          value={projectForm.xpReward}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, xpReward: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Max points</label>
                        <Input
                          type="number"
                          min={1}
                          value={projectForm.maxPoints}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, maxPoints: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Deadline</label>
                        <Input
                          type="datetime-local"
                          value={projectForm.deadline}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, deadline: event.target.value }))}
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={projectForm.isPublished}
                          onChange={(event) => setProjectForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                        />
                        Publish immediately
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => void handleCreateCourseProject()} disabled={contentActionBusy}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    </div>
                  </div>
                ) : null}

                {courseProjects.length > 0 ? (
                  <div className="space-y-3">
                    {courseProjects.map((project) => {
                      const submission = projectSubmissionByProjectId.get(project._id);
                      const submissionDraft = projectSubmissionDrafts[project._id] || {
                        repoUrl: submission?.repoUrl || "",
                        liveUrl: submission?.liveUrl || "",
                        comments: submission?.comments || "",
                      };

                      return (
                        <div key={project._id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={project.isPublished ? "outline" : "secondary"}>
                                  {project.isPublished ? "Published" : "Draft"}
                                </Badge>
                                {project.deadline ? (
                                  <span className="text-xs text-slate-500">Due {new Date(project.deadline).toLocaleDateString()}</span>
                                ) : null}
                              </div>
                              <p className="font-medium text-slate-900 dark:text-white">{project.title}</p>
                              <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                            </div>

                            {isInstructor ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" onClick={() => void handleToggleProjectPublish(project)} disabled={contentActionBusy}>
                                  {project.isPublished ? "Move to Draft" : "Publish"}
                                </Button>
                                <Button variant="destructive" onClick={() => void handleDeleteCourseProject(project._id)} disabled={contentActionBusy}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : null}
                          </div>

                          {!isInstructor ? (
                            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Status: {submission?.status || "pending"}</span>
                                {submission?.grade !== undefined ? <span>Grade: {submission.grade}</span> : null}
                              </div>
                              <Input
                                placeholder="Repository URL"
                                value={submissionDraft.repoUrl}
                                onChange={(event) => updateProjectSubmissionDraft(project._id, "repoUrl", event.target.value)}
                              />
                              <Input
                                placeholder="Live URL (optional)"
                                value={submissionDraft.liveUrl}
                                onChange={(event) => updateProjectSubmissionDraft(project._id, "liveUrl", event.target.value)}
                              />
                              <Textarea
                                placeholder="Comments for instructor"
                                rows={2}
                                value={submissionDraft.comments}
                                onChange={(event) => updateProjectSubmissionDraft(project._id, "comments", event.target.value)}
                              />
                              <Button onClick={() => void handleSubmitCourseProject(project._id)} disabled={contentActionBusy || submission?.status === "graded"}>
                                {submission ? "Update Submission" : "Submit Project"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    {isInstructor
                      ? "No projects yet. Create the first project for this course above."
                      : "No projects are available for this course yet."}
                  </div>
                )}

                {isInstructor ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Submissions Needing Review</h3>
                    {pendingProjectSubmissions.length > 0 ? (
                      pendingProjectSubmissions.map((submission) => {
                        const draft = gradingDrafts[submission._id] || { grade: "", feedback: "" };
                        const projectTitle = typeof submission.project === "string"
                          ? "Project"
                          : submission.project?.title || "Project";

                        return (
                          <div key={submission._id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <p className="font-medium text-slate-900 dark:text-white">{projectTitle}</p>
                              <span className="text-xs text-slate-500">{submission.student?.name || "Student"}</span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                type="number"
                                min={0}
                                placeholder="Grade"
                                value={draft.grade}
                                onChange={(event) => updateGradingDraft(submission._id, "grade", event.target.value)}
                              />
                              <Input
                                placeholder="Feedback"
                                value={draft.feedback}
                                onChange={(event) => updateGradingDraft(submission._id, "feedback", event.target.value)}
                              />
                            </div>
                            <Button onClick={() => void handleGradeCourseSubmission(submission._id)} disabled={contentActionBusy}>
                              Grade Submission
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-slate-500">No pending submissions right now.</div>
                    )}
                  </div>
                ) : null}
              </div>
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
            <span>{completedCount} / {curriculumLessons.length} Lessons</span>
          </div>
          <Progress value={progress} className="h-2" />

          {isInstructor ? (
            <div className="mt-4 space-y-3">
              <Button variant="outline" className="w-full" onClick={() => setShowLessonCreator((prev) => !prev)}>
                <Plus className="mr-2 h-4 w-4" />
                {showLessonCreator ? "Close Lesson Creator" : "Add Lesson In Course"}
              </Button>

              {showLessonCreator ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950 max-h-[52vh] overflow-y-auto">
                  <Input
                    placeholder="Lesson title"
                    value={newLessonForm.title}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Phase title (optional)"
                      value={newLessonForm.phaseTitle}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, phaseTitle: event.target.value }))}
                    />
                    <Input
                      placeholder="Phase order (0, 1, 2...)"
                      value={newLessonForm.phaseOrder}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, phaseOrder: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Week title (optional)"
                      value={newLessonForm.weekTitle}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, weekTitle: event.target.value }))}
                    />
                    <Input
                      placeholder="Week order (0, 1, 2...)"
                      value={newLessonForm.weekOrder}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, weekOrder: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Topic title (optional)"
                      value={newLessonForm.topicTitle}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, topicTitle: event.target.value }))}
                    />
                    <Input
                      placeholder="Topic order (0, 1, 2...)"
                      value={newLessonForm.topicOrder}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, topicOrder: event.target.value }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Video links (optional). Add one URL per line for multiple YouTube/Vimeo videos."
                    value={newLessonForm.videoUrlsInput}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, videoUrlsInput: event.target.value }))}
                    rows={3}
                  />
                  <Input
                    placeholder="Duration in minutes (or hh:mm:ss)"
                    value={newLessonForm.duration}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, duration: event.target.value }))}
                  />
                  <Textarea
                    placeholder="Section by section (one per line): Title | Minutes"
                    value={newLessonForm.sectionBreakdownInput}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, sectionBreakdownInput: event.target.value }))}
                    rows={3}
                  />
                  <Textarea
                    placeholder="Class checklist (one item per line)"
                    value={newLessonForm.classChecklistInput}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, classChecklistInput: event.target.value }))}
                    rows={3}
                  />
                  <Textarea
                    placeholder="Class notes (one per line): Title | URL"
                    value={newLessonForm.classNotesInput}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, classNotesInput: event.target.value }))}
                    rows={3}
                  />
                  <Textarea
                    placeholder="Class questions (one per line): Question | Answer (optional)"
                    value={newLessonForm.classQuestionsInput}
                    onChange={(event) => setNewLessonForm((prev) => ({ ...prev, classQuestionsInput: event.target.value }))}
                    rows={3}
                  />

                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newLessonForm.isPublished}
                      onChange={(event) => setNewLessonForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                    />
                    Publish lesson immediately
                  </label>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => lessonResourceInputRef.current?.click()}
                      disabled={isUploadingLessonResources}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isUploadingLessonResources ? "Uploading Resources..." : "Attach Resource Files"}
                    </Button>
                    <input
                      ref={lessonResourceInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(event) => void handleUploadNewLessonResources(event)}
                    />

                    {newLessonForm.attachments.length > 0 ? (
                      <div className="space-y-1">
                        {newLessonForm.attachments.map((attachment, index) => (
                          <div key={`${attachment.url}-${index}`} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-800">
                            <span className="truncate pr-2">{attachment.title}</span>
                            <button
                              type="button"
                              className="text-red-600"
                              onClick={() => setNewLessonForm((prev) => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, itemIndex) => itemIndex !== index),
                              }))}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <Button className="w-full sticky bottom-0" onClick={() => void handleCreateLessonInCourse()} disabled={contentActionBusy || isUploadingLessonResources}>
                    Save Lesson
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900 transition-colors">
              <div className="text-left">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">All Lectures</h4>
                <p className="text-xs text-slate-500 mt-0.5">{curriculumLessons.length} lessons</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
            </button>
            <div className="bg-white dark:bg-slate-950">
              {curriculumLessons.length > 0 ? (
                groupedCurriculum.map((weekGroup) => (
                  <div key={weekGroup.key} className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
                    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/70 dark:bg-slate-900/30 dark:text-slate-400">
                      {weekGroup.title}
                    </div>

                    {weekGroup.topics.map((topicGroup) => (
                      <div key={`${weekGroup.key}-${topicGroup.key}`}>
                        <div className="px-4 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100/70 dark:border-slate-800/50">
                          {topicGroup.title}
                        </div>

                        {topicGroup.lessons.map(({ lesson, globalIndex }) => {
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
                                {canAccessLessons && globalIndex < completedCount ? (
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
                        })}
                      </div>
                    ))}
                  </div>
                ))
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