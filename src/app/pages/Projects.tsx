import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Github, UploadCloud, Link as LinkIcon, CheckCircle2, Loader2, User, Clock, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { Course, Project, ProjectSubmission } from "../services/api";

export function Projects() {
  const { role, user } = useAuth();
  const isInstructor = role === "instructor" || role === "admin";

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createCourseId, setCreateCourseId] = useState("");
  const [createInstructions, setCreateInstructions] = useState("");
  const [createRequirements, setCreateRequirements] = useState("");
  const [createXpReward, setCreateXpReward] = useState("50");
  const [createMaxPoints, setCreateMaxPoints] = useState("100");
  const [createDeadline, setCreateDeadline] = useState("");
  const [createPublished, setCreatePublished] = useState(true);

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [comments, setComments] = useState("");

  const [activeReviewId, setActiveReviewId] = useState<string>("");
  const [reviewGrade, setReviewGrade] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const [projectData, submissionData, coursesData] = await Promise.all([
        apiService.getProjects(),
        apiService.getProjectSubmissions(),
        isInstructor ? apiService.getCourses({ page: 1, limit: 200 }) : Promise.resolve(null),
      ]);

      setProjects(projectData);
      setSubmissions(submissionData);

      if (coursesData) {
        const allCourses = Array.isArray(coursesData.items) ? coursesData.items : [];
        const scopedCourses = role === "instructor"
          ? allCourses.filter((course) => {
              const instructorId = course.instructor?._id;

              if (!instructorId || !user?._id) {
                return true;
              }

              return instructorId === user._id;
            })
          : allCourses;

        setCourses(scopedCourses);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isInstructor, role, user?._id]);

  useEffect(() => {
    if (!createCourseId && courses.length > 0) {
      setCreateCourseId(courses[0]._id);
    }
  }, [courses, createCourseId]);

  const submissionByProjectId = useMemo(() => {
    const map = new Map<string, ProjectSubmission>();
    for (const submission of submissions) {
      const projectId = submission.project?._id;
      if (projectId && !map.has(projectId)) {
        map.set(projectId, submission);
      }
    }
    return map;
  }, [submissions]);

  const reviewQueue = useMemo(
    () => submissions.filter((s) => s.status !== "graded"),
    [submissions]
  );
  const reviewed = useMemo(
    () => submissions.filter((s) => s.status === "graded"),
    [submissions]
  );

  const submissionCountByProject = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((submission) => {
      const projectId = submission.project?._id;
      if (!projectId) return;
      counts.set(projectId, (counts.get(projectId) || 0) + 1);
    });
    return counts;
  }, [submissions]);

  const resetSubmitForm = () => {
    setActiveProjectId("");
    setRepoUrl("");
    setLiveUrl("");
    setComments("");
  };

  const resetReviewForm = () => {
    setActiveReviewId("");
    setReviewGrade("");
    setReviewFeedback("");
  };

  const resetCreateForm = () => {
    setCreateTitle("");
    setCreateDescription("");
    setCreateInstructions("");
    setCreateRequirements("");
    setCreateXpReward("50");
    setCreateMaxPoints("100");
    setCreateDeadline("");
    setCreatePublished(true);
  };

  const handleCreateProject = async () => {
    if (!createTitle.trim() || !createDescription.trim() || !createCourseId) {
      setError("Project title, description, and course are required");
      return;
    }

    const xpReward = Number(createXpReward || 0);
    const maxPoints = Number(createMaxPoints || 0);

    if (!Number.isFinite(xpReward) || xpReward < 0) {
      setError("XP reward must be a valid number");
      return;
    }

    if (!Number.isFinite(maxPoints) || maxPoints <= 0) {
      setError("Max points must be greater than 0");
      return;
    }

    setCreatingProject(true);
    setError("");

    try {
      const created = await apiService.createProject({
        title: createTitle.trim(),
        description: createDescription.trim(),
        courseId: createCourseId,
        instructions: createInstructions.trim() || undefined,
        requirements: createRequirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        xpReward,
        maxPoints,
        deadline: createDeadline ? new Date(createDeadline).toISOString() : undefined,
        isPublished: createPublished,
      });

      const selectedCourse = courses.find((course) => course._id === createCourseId);
      const normalized: Project = {
        ...created,
        course: selectedCourse
          ? { _id: selectedCourse._id, title: selectedCourse.title }
          : created.course,
      };

      setProjects((prev) => [normalized, ...prev]);
      setCreateDialogOpen(false);
      resetCreateForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSubmitProject = async () => {
    if (!activeProjectId || !repoUrl.trim()) {
      setError("Project and repository URL are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const submission = await apiService.submitProject(activeProjectId, {
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim() || undefined,
        comments: comments.trim() || undefined,
      });

      setSubmissions((prev) => {
        const withoutCurrent = prev.filter((s) => s._id !== submission._id);
        return [submission, ...withoutCurrent];
      });
      resetSubmitForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewProject = async () => {
    if (!activeReviewId || !reviewGrade || !reviewFeedback.trim()) {
      setError("Grade and feedback are required");
      return;
    }

    const gradeValue = Number(reviewGrade);
    if (Number.isNaN(gradeValue) || gradeValue < 0) {
      setError("Please enter a valid numeric grade");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await apiService.reviewProject(activeReviewId, {
        grade: gradeValue,
        feedback: reviewFeedback.trim(),
      });

      setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      resetReviewForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Project Reviews</h1>
            <p className="text-slate-500 dark:text-slate-400">Create project assignments, monitor submissions, and publish grades from one page.</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create Project Assignment</DialogTitle>
                <DialogDescription>
                  This publishes a project students can submit from their Projects page.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Build a responsive portfolio website" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} placeholder="Short overview of what students need to deliver." rows={3} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course *</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                      value={createCourseId}
                      onChange={(e) => setCreateCourseId(e.target.value)}
                    >
                      {courses.length === 0 ? <option value="">No courses available</option> : null}
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <Input type="datetime-local" value={createDeadline} onChange={(e) => setCreateDeadline(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea value={createInstructions} onChange={(e) => setCreateInstructions(e.target.value)} placeholder="Detailed requirements, rubric, and submission rules." rows={4} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Checklist Requirements (one per line)</label>
                  <Textarea value={createRequirements} onChange={(e) => setCreateRequirements(e.target.value)} placeholder={"Responsive layout\nAt least 3 sections\nDeploy on Vercel"} rows={3} />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">XP Reward</label>
                    <Input type="number" min={0} value={createXpReward} onChange={(e) => setCreateXpReward(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Points</label>
                    <Input type="number" min={1} value={createMaxPoints} onChange={(e) => setCreateMaxPoints(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visibility</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                      value={createPublished ? "published" : "draft"}
                      onChange={(e) => setCreatePublished(e.target.value === "published")}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <p className="text-xs text-amber-600">Create at least one course first before posting projects.</p>
                ) : null}
              </div>

              <DialogFooter className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => void handleCreateProject()}
                  disabled={creatingProject || courses.length === 0}
                >
                  {creatingProject ? "Creating..." : "Post Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Page flow: create project assignment here, students submit from their Projects page, then submissions appear in Needs Review, and graded work moves to Graded.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full sm:w-[560px] grid-cols-3">
            <TabsTrigger value="review">Needs Review ({reviewQueue.length})</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({projects.length})</TabsTrigger>
            <TabsTrigger value="completed">Graded ({reviewed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4 mt-6">
            {reviewQueue.length === 0 ? (
              <EmptyState text="No submissions need review right now." />
            ) : (
              reviewQueue.map((submission) => (
                <ReviewCard
                  key={submission._id}
                  submission={submission}
                  isSubmitting={isSubmitting}
                  activeReviewId={activeReviewId}
                  setActiveReviewId={setActiveReviewId}
                  reviewGrade={reviewGrade}
                  setReviewGrade={setReviewGrade}
                  reviewFeedback={reviewFeedback}
                  setReviewFeedback={setReviewFeedback}
                  onSubmit={handleReviewProject}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 mt-6">
            {projects.length === 0 ? (
              <EmptyState text="No project assignments yet. Click Create Project to post one." />
            ) : (
              projects.map((project) => {
                const courseTitle = typeof project.course === "string" ? "Course" : project.course?.title || "Course";
                const requirementList = Array.isArray(project.requirements) ? project.requirements.filter(Boolean) : [];
                const submissionCount = submissionCountByProject.get(project._id) || 0;

                return (
                  <Card key={project._id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={project.isPublished ? "success" : "secondary"}>{project.isPublished ? "published" : "draft"}</Badge>
                        <Badge variant="outline">{courseTitle}</Badge>
                      </div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {project.instructions ? (
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{project.instructions}</p>
                      ) : null}

                      {requirementList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {requirementList.map((requirement, index) => (
                            <Badge key={`${project._id}-req-${index}`} variant="secondary" className="text-[11px]">
                              {requirement}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Submissions: {submissionCount}</span>
                        <span>Max Points: {project.maxPoints ?? 100}</span>
                        <span>XP Reward: {project.xpReward ?? 50}</span>
                        <span>
                          Deadline: {project.deadline ? new Date(project.deadline).toLocaleString() : "No deadline"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {reviewed.length === 0 ? (
              <EmptyState text="No graded submissions yet." />
            ) : (
              reviewed.map((submission) => <ReviewCard key={submission._id} submission={submission} readOnly />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">Submit assignments and track instructor feedback.</p>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full sm:w-[420px] grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        {(["pending", "review", "graded"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {projects
              .filter((project) => {
                const submission = submissionByProjectId.get(project._id);
                if (!submission) return tab === "pending";
                if (submission.status === "graded") return tab === "graded";
                return tab === "review";
              })
              .map((project) => {
                const submission = submissionByProjectId.get(project._id);
                const isGraded = submission?.status === "graded";

                return (
                  <Card key={project._id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {submission?.status || "pending"}
                          </Badge>
                          <span className="text-sm font-medium text-indigo-600">
                            {typeof project.course === "string" ? "Course" : project.course?.title || "Course"}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2 max-w-3xl mt-2 text-sm">{project.description}</CardDescription>
                      </div>
                      {isGraded && submission?.grade !== undefined ? (
                        <div className="text-right">
                          <span className="block text-sm text-slate-500 font-medium">Grade</span>
                          <span className="text-xl font-bold text-emerald-500">{submission.grade}</span>
                        </div>
                      ) : null}
                    </CardHeader>

                    <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {project.deadline ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        ) : null}
                        {submission?.updatedAt ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Updated: {new Date(submission.updatedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>

                      {!submission || submission.status !== "graded" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setActiveProjectId(project._id);
                                setRepoUrl(submission?.repoUrl || "");
                                setLiveUrl(submission?.liveUrl || "");
                                setComments(submission?.comments || "");
                              }}
                            >
                              <UploadCloud className="mr-2 h-4 w-4" />
                              {submission ? "Update Submission" : "Submit Project"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[520px]">
                            <DialogHeader>
                              <DialogTitle>{submission ? "Update Submission" : "Submit Project"}</DialogTitle>
                              <DialogDescription>
                                Submit your work for "{project.title}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">GitHub Repository URL *</label>
                                <div className="relative">
                                  <Github className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                  <Input
                                    value={repoUrl}
                                    onChange={(e) => {
                                      setRepoUrl(e.target.value);
                                    }}
                                    placeholder="https://github.com/username/repo"
                                    className="pl-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Live Demo URL</label>
                                <div className="relative">
                                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                  <Input
                                    value={liveUrl}
                                    onChange={(e) => {
                                      setLiveUrl(e.target.value);
                                    }}
                                    placeholder="https://your-app.vercel.app"
                                    className="pl-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Comments for Instructor</label>
                                <Textarea
                                  value={comments}
                                  onChange={(e) => {
                                    setComments(e.target.value);
                                  }}
                                  placeholder="Any implementation notes or challenges?"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSubmitProject}
                                disabled={isSubmitting || !repoUrl.trim() || activeProjectId !== project._id}
                              >
                                {isSubmitting ? "Submitting..." : "Save Submission"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" disabled>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Graded
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ReviewCard({
  submission,
  readOnly,
  isSubmitting,
  activeReviewId,
  setActiveReviewId,
  reviewGrade,
  setReviewGrade,
  reviewFeedback,
  setReviewFeedback,
  onSubmit,
}: {
  submission: ProjectSubmission;
  readOnly?: boolean;
  isSubmitting?: boolean;
  activeReviewId?: string;
  setActiveReviewId?: (id: string) => void;
  reviewGrade?: string;
  setReviewGrade?: (v: string) => void;
  reviewFeedback?: string;
  setReviewFeedback?: (v: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
              {submission.course?.title || "Course"}
            </Badge>
            <span className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
              <User className="h-3 w-3 mr-1" />
              {submission.student?.name || "Student"}
            </span>
          </div>
          <CardTitle className="text-lg">{submission.project?.title || "Project Submission"}</CardTitle>
        </div>
        {submission.grade !== undefined ? (
          <div className="text-right">
            <span className="block text-sm text-slate-500 font-medium">Grade</span>
            <span className="text-xl font-bold text-emerald-500">{submission.grade}</span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {submission.updatedAt ? (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Submitted: {new Date(submission.updatedAt).toLocaleDateString()}
            </span>
          ) : null}
          {submission.repoUrl ? (
            <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
              <Github className="h-4 w-4" />
              Repo
            </a>
          ) : null}
          {submission.liveUrl ? (
            <a href={submission.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
              <LinkIcon className="h-4 w-4" />
              Live Demo
            </a>
          ) : null}
        </div>

        {!readOnly && setActiveReviewId && setReviewGrade && setReviewFeedback && onSubmit ? (
          <Dialog open={activeReviewId === submission._id} onOpenChange={(open) => setActiveReviewId(open ? submission._id : "")}>
            <DialogTrigger asChild>
              <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Grade Submission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Grade Submission</DialogTitle>
                <DialogDescription>Student: {submission.student?.name || "Student"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Score / Grade *</label>
                  <Input value={reviewGrade || ""} onChange={(e) => setReviewGrade(e.target.value)} placeholder="e.g. 95" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback *</label>
                  <Textarea
                    value={reviewFeedback || ""}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Provide actionable feedback"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={onSubmit} disabled={isSubmitting || !(reviewGrade && reviewFeedback)}>
                  {isSubmitting ? "Submitting..." : "Submit Grade"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nothing here yet</h3>
      <p className="text-sm text-slate-500 mt-1">{text}</p>
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
