import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Textarea } from "../components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import {
  PlayCircle,
  CheckCircle,
  Lock,
  MessageSquare,
  FileText,
  Download,
  ChevronRight,
  Star,
  Share2,
  BookmarkPlus,
  Send,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CourseEditor } from "./instructor/CourseEditor";
import apiService, { CommunityPost, Course, Lesson } from "../services/api";

const FALLBACK_COVER_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200";

type CourseResource = {
  id: string;
  name: string;
  url: string;
  fileType: string;
  lessonTitle: string;
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

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const isInstructor = role === "instructor" || role === "admin";
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState("content");
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [discussionPosts, setDiscussionPosts] = useState<CommunityPost[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id === "new") return;

    const fetchCourseData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [courseRes, lessonsRes] = await Promise.all([
          apiService.getCourseById(id),
          apiService.getLessons(id),
        ]);

        const sortedLessons = [...(Array.isArray(lessonsRes) ? lessonsRes : [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCourse(courseRes);
        setLessons(sortedLessons);

        if (sortedLessons.length > 0) {
          setSelectedLessonId((prev) => prev || sortedLessons[0]._id);
        }
      } catch (fetchError: any) {
        setError(fetchError?.response?.data?.message || "Failed to load course details");
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
      return student?._id === user._id;
    });

  const canAccessLessons = isEnrolled || isInstructor;
  const selectedLessonIndex = selectedLesson ? visibleLessons.findIndex((lesson) => lesson._id === selectedLesson._id) : -1;
  const completedCount = canAccessLessons && selectedLessonIndex >= 0 ? selectedLessonIndex + 1 : 0;
  const progress = visibleLessons.length > 0 ? Math.round((completedCount / visibleLessons.length) * 100) : 0;

  const embedVideoUrl = selectedLesson?.videoUrl ? getEmbedVideoUrl(selectedLesson.videoUrl) : null;

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

  const ratingValue = typeof course?.rating === "number" ? course.rating : 0;
  const reviewCount = typeof course?.numReviews === "number" ? course.numReviews : 0;

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!id) return;

    setIsEnrolling(true);
    setError("");
    try {
      await apiService.enrollCourse(id);
      const updatedCourse = await apiService.getCourseById(id);
      setCourse(updatedCourse);
    } catch (enrollError: any) {
      setError(enrollError?.response?.data?.message || "Failed to enroll in this course");
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

  if (id === "new" && isInstructor) {
    return <CourseEditor />;
  }

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500">Course not found.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
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
                    <h3 className="font-bold text-xl mb-2">Enroll to Start Learning</h3>
                    <p className="text-sm opacity-80 mb-4">This lesson video is available after enrollment.</p>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      size="lg"
                      onClick={() => void handleEnroll()}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
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

          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
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
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <Button variant="destructive" size="sm">Delete Course</Button>
              ) : (
                <>
                  <Button variant="outline" size="icon">
                    <BookmarkPlus className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
            <nav className="flex gap-6">
              {["content", "overview", "resources", "discussion"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  {tab}
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

            {activeTab === "content" ? (
              <div className="lg:hidden text-center p-8 text-slate-500">
                <p>Course content is visible on the right sidebar on desktop, or scroll down on mobile.</p>
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