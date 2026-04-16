import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Plus, GripVertical, Video, FileText, Lock, Unlock, Edit, Trash2, Clock, Upload, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Switch } from "../../components/ui/switch";
import { motion, Reorder } from "motion/react";
import apiService, { Lesson } from "../../services/api";

type LessonType = "video" | "document";

type LessonAttachment = {
  title: string;
  url: string;
  fileType: string;
};

type LessonForm = {
  title: string;
  lessonType: LessonType;
  videoUrls: string[];
  duration: string;
  isLocked: boolean;
  attachments: LessonAttachment[];
};

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

const formatDuration = (value?: number | string): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return "-";
    const totalMinutes = Math.round(value);
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "-";
};

const parseDurationInput = (input: string): number | undefined => {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

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

const defaultForm: LessonForm = {
  title: "",
  lessonType: "video",
  videoUrls: [],
  duration: "",
  isLocked: false,
  attachments: [],
};

export function InstructorLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("Course");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingResources, setIsUploadingResources] = useState(false);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [form, setForm] = useState<LessonForm>(defaultForm);

  const resourceInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const currentLesson = useMemo(() => {
    if (!isEditing || isEditing === "new") {
      return null;
    }

    return lessons.find((lesson) => lesson._id === isEditing) || null;
  }, [isEditing, lessons]);

  const loadLessonData = async () => {
    if (!id) {
      setError("Course ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [course, lessonList] = await Promise.all([
        apiService.getCourseById(id),
        apiService.getLessons(id),
      ]);

      setCourseTitle(course.title || "Course");
      setLessons([...lessonList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLessonData();
  }, [id]);

  const openNewLessonEditor = () => {
    setForm(defaultForm);
    setIsEditing("new");
  };

  const openEditLesson = (lessonId: string) => {
    const lesson = lessons.find((item) => item._id === lessonId);
    if (!lesson) return;

    const lessonVideoUrls = getLessonVideoUrls(lesson);

    setForm({
      title: lesson.title || "",
      lessonType: lessonVideoUrls.length > 0 ? "video" : "document",
      videoUrls: lessonVideoUrls,
      duration: lesson.duration !== undefined ? String(lesson.duration) : "",
      isLocked: lesson.isPublished === false,
      attachments: (lesson.attachments || []).map((item) => ({
        title: item.title || "Attachment",
        url: item.url,
        fileType: item.fileType || "file",
      })),
    });
    setIsEditing(lessonId);
  };

  const handleDelete = async (lessonId: string) => {
    if (!id) return;
    if (!confirm("Delete this lesson?")) return;

    try {
      await apiService.deleteLesson(id, lessonId);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      if (isEditing === lessonId) {
        setIsEditing(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete lesson");
    }
  };

  const toggleLock = async (lesson: Lesson) => {
    if (!id) return;

    const nextIsPublished = lesson.isPublished === false;
    try {
      const updated = await apiService.updateLesson(id, lesson._id, { isPublished: nextIsPublished });
      setLessons((prev) => prev.map((item) => (item._id === lesson._id ? updated : item)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update lesson lock state");
    }
  };

  const handleAttachResources = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploadingResources(true);
    setError("");

    const converted: LessonAttachment[] = [];
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        setError(`File ${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      try {
        const uploaded = await apiService.uploadLessonResource(file);
        converted.push({
          title: uploaded.originalName || file.name,
          url: uploaded.url,
          fileType: uploaded.fileType || file.type || "file",
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }

    if (converted.length > 0) {
      setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...converted] }));
    }

    setIsUploadingResources(false);
    event.target.value = "";
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setError("Video file is too large. Max size is 2GB.");
      event.target.value = "";
      return;
    }

    setIsUploadingVideo(true);
    setError("");

    try {
      const uploaded = await apiService.uploadLessonVideo(file);
      setForm((prev) => ({
        ...prev,
        lessonType: "video",
        videoUrls: [...prev.videoUrls, uploaded.url],
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload selected video file.");
    }

    setIsUploadingVideo(false);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveLesson = async () => {
    if (!id) return;
    if (!form.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    const normalizedVideoUrls = form.lessonType === "video"
      ? form.videoUrls.map((url) => url.trim()).filter(Boolean)
      : [];

    if (form.lessonType === "video" && normalizedVideoUrls.length === 0) {
      setError("Video lessons require at least one YouTube/Vimeo URL or uploaded video file");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const durationInMinutes = parseDurationInput(form.duration);
      const payload = {
        title: form.title.trim(),
        content: `${form.lessonType === "video" ? "Video" : "Document"} lesson: ${form.title.trim()}`,
        videoUrl: normalizedVideoUrls[0] || undefined,
        videoUrls: normalizedVideoUrls.length > 0 ? normalizedVideoUrls : undefined,
        duration: durationInMinutes,
        order: currentLesson?.order ?? lessons.length,
        isPublished: !form.isLocked,
        attachments: form.attachments,
      };

      if (isEditing === "new") {
        const created = await apiService.createLesson(id, payload);
        setLessons((prev) => [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } else if (isEditing) {
        const updated = await apiService.updateLesson(id, isEditing, payload);
        setLessons((prev) => prev.map((item) => (item._id === isEditing ? updated : item)));
      }

      setIsEditing(null);
      setForm(defaultForm);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <motion.div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/instructor/courses')}>
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Manage Lessons <Badge variant="secondary">Course: {courseTitle}</Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Drag to reorder, add content, and manage drip schedules.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lesson List (Drag and Drop) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>Drag the handle to reorder lessons</CardDescription>
            </div>
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900" onClick={openNewLessonEditor}>
              <Plus className="h-4 w-4 mr-2" /> Add Lesson
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <Reorder.Group axis="y" values={lessons} onReorder={setLessons} className="space-y-3">
              {lessons.map((lesson) => (
                <Reorder.Item key={lesson._id} value={lesson} className="relative">
                  {(() => {
                    const hasVideoLinks = getLessonVideoUrls(lesson).length > 0;
                    return (
                  <div className={`flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border transition-all ${isEditing === lesson._id ? 'border-emerald-500 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <div className={`p-2 rounded-md ${hasVideoLinks ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'}`}>
                      {hasVideoLinks ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{lesson.title}</h4>
                        {lesson.isPublished === false && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {(lesson.attachments || []).length} resources</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs font-medium text-slate-500">{lesson.isPublished === false ? 'Locked' : 'Unlocked'}</span>
                        <Switch checked={lesson.isPublished !== false} onCheckedChange={() => void toggleLock(lesson)} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson._id)} className="text-slate-400 hover:text-emerald-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void handleDelete(lesson._id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                    );
                  })()}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            {lessons.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Video className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No lessons yet</p>
                <p className="text-sm text-slate-400 mb-4">Add your first lesson to start building the curriculum</p>
                <Button onClick={openNewLessonEditor}><Plus className="h-4 w-4 mr-2" /> Add Lesson</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Panel */}
        {isEditing && (
          <Card className="lg:col-span-1 border-emerald-200 dark:border-emerald-800/50 shadow-md sticky top-6">
            <CardHeader className="flex flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 pb-4 border-b border-emerald-100 dark:border-emerald-900/50">
              <CardTitle className="text-lg text-emerald-800 dark:text-emerald-400">
                {isEditing === 'new' ? 'New Lesson' : 'Edit Lesson'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(null)} className="text-emerald-600 -mr-2">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson Title</label>
                <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Introduction to Hooks" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20 transition-all">
                    <input
                      type="radio"
                      name="type"
                      className="hidden"
                      checked={form.lessonType === "video"}
                      onChange={() => setForm((prev) => ({ ...prev, lessonType: "video" }))}
                    />
                    <Video className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Video</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20 transition-all">
                    <input
                      type="radio"
                      name="type"
                      className="hidden"
                      checked={form.lessonType === "document"}
                      onChange={() => setForm((prev) => ({ ...prev, lessonType: "document" }))}
                    />
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Document</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Video URL / Upload</label>
                  <button
                  type="button"
                  className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <p className="text-xs font-medium mb-1">Click to upload video</p>
                    <p className="text-[10px] text-slate-500">MP4, WebM (Max 2GB)</p>
                </button>
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  {isUploadingVideo ? <p className="text-xs text-emerald-600">Uploading video...</p> : null}
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or embed</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {form.videoUrls.map((url, index) => (
                    <div key={`video-url-${index}`} className="flex items-center gap-2">
                      <Input
                        value={url}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            videoUrls: prev.videoUrls.map((item, itemIndex) =>
                              itemIndex === index ? e.target.value : item,
                            ),
                          }))
                        }
                        placeholder={`YouTube/Vimeo URL #${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            videoUrls: prev.videoUrls.filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        lessonType: "video",
                        videoUrls: [...prev.videoUrls, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Video Link
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 15:00 or 25" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">Drip Access <Lock className="h-3 w-3 text-slate-400"/></label>
                  <div className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">{form.isLocked ? "Locked" : "Available immediately"}</span>
                    <Switch checked={!form.isLocked} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isLocked: !checked }))} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium">Resources (Optional)</label>
                <Button variant="outline" className="w-full border-dashed" onClick={() => resourceInputRef.current?.click()}><Plus className="h-4 w-4 mr-2" /> Attach File</Button>
                <input ref={resourceInputRef} type="file" className="hidden" multiple onChange={handleAttachResources} />
                {isUploadingResources ? <p className="text-xs text-emerald-600">Uploading resource files...</p> : null}

                {form.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {form.attachments.map((item, index) => (
                      <div key={`${item.title}-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs">
                        <span className="truncate mr-2">{item.title}</span>
                        <button type="button" onClick={() => removeAttachment(index)} className="text-red-600 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(null)}>Cancel</Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void handleSaveLesson()} disabled={isSaving || isUploadingVideo || isUploadingResources}><Save className="h-4 w-4 mr-2"/> {isSaving ? "Saving..." : "Save"}</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
