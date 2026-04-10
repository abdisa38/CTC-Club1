import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, CheckCircle, BookOpen, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Textarea } from "../../components/ui/Textarea";
import { useAuth } from "../../context/AuthContext";
import apiService, { Course, Quiz, QuizQuestion, QuizQuestionType, QuizResultItem } from "../../services/api";

type QuizStats = {
  averageScoreText: string;
  passRateText: string;
  attempts: number;
};

type QuizForm = {
  title: string;
  description: string;
  courseId: string;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  xpReward: number;
  isPublished: boolean;
};

type QuestionForm = {
  questionText: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerText: string;
  points: number;
};

const defaultStats: QuizStats = {
  averageScoreText: "--",
  passRateText: "--",
  attempts: 0,
};

const defaultQuestionForm: QuestionForm = {
  questionText: "",
  type: "multiple-choice",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  correctAnswerText: "",
  points: 1,
};

const toCourseId = (quiz: Quiz): string => {
  if (!quiz.course) return "";
  return typeof quiz.course === "string" ? quiz.course : quiz.course._id;
};

const toCourseTitle = (quiz: Quiz, courses: Course[]): string => {
  if (!quiz.course) return "Unknown Course";
  if (typeof quiz.course !== "string") return quiz.course.title || "Unknown Course";
  return courses.find((course) => course._id === quiz.course)?.title || "Unknown Course";
};

const calculateQuizStats = (results: QuizResultItem[]): QuizStats => {
  if (!Array.isArray(results) || results.length === 0) {
    return defaultStats;
  }

  const average = results.reduce((total, result) => total + (Number(result.percentage) || 0), 0) / results.length;
  const passed = results.filter((result) => result.isPassed).length;
  const passRate = (passed / results.length) * 100;

  return {
    averageScoreText: `${Math.round(average)}%`,
    passRateText: `${Math.round(passRate)}%`,
    attempts: results.length,
  };
};

const normalizeQuestionOptions = (input: string[]): string[] => {
  const values = input.map((option) => option.trim()).filter(Boolean);
  return values;
};

const createQuizForm = (courseId: string): QuizForm => ({
  title: "",
  description: "",
  courseId,
  passingScore: 70,
  timeLimit: 30,
  maxAttempts: 3,
  xpReward: 10,
  isPublished: false,
});

const toQuestionForm = (question: QuizQuestion): QuestionForm => {
  const options = Array.isArray(question.options) ? [...question.options] : [];
  while (options.length < 4) {
    options.push("");
  }

  return {
    questionText: question.questionText || "",
    type: question.type || "multiple-choice",
    options,
    correctAnswerIndex: Number(question.correctAnswerIndex ?? 0),
    correctAnswerText: question.correctAnswerText || "",
    points: Number(question.points || 1),
  };
};

export function InstructorQuizzes() {
  const { role, user } = useAuth();

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizStats, setQuizStats] = useState<Record<string, QuizStats>>({});

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [quizForm, setQuizForm] = useState<QuizForm>(createQuizForm(""));

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(defaultQuestionForm);

  const visibleQuizzes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return quizzes;

    return quizzes.filter((quiz) => {
      const titleMatch = quiz.title.toLowerCase().includes(keyword);
      const courseTitle = toCourseTitle(quiz, courses).toLowerCase();
      const courseMatch = courseTitle.includes(keyword);
      return titleMatch || courseMatch;
    });
  }, [search, quizzes, courses]);

  const activeQuizStats = activeQuizId ? quizStats[activeQuizId] || defaultStats : defaultStats;

  const loadQuizStats = async (quizItems: Quiz[]) => {
    const statEntries = await Promise.all(
      quizItems.map(async (quiz) => {
        try {
          const results = await apiService.getQuizResults(quiz._id);
          return [quiz._id, calculateQuizStats(results)] as const;
        } catch {
          return [quiz._id, defaultStats] as const;
        }
      })
    );

    setQuizStats(Object.fromEntries(statEntries));
  };

  const loadActiveQuiz = async (quizId: string) => {
    setIsQuizLoading(true);
    try {
      const [quiz, results] = await Promise.all([
        apiService.getQuizById(quizId),
        apiService.getQuizResults(quizId),
      ]);

      setActiveQuiz(quiz);
      setQuizStats((prev) => ({
        ...prev,
        [quizId]: calculateQuizStats(results),
      }));
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Failed to load selected quiz");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const loadData = async (preferredQuizId?: string | null) => {
    setIsLoading(true);
    setError("");

    try {
      const [courseData, quizItems] = await Promise.all([
        apiService.getCourses({ limit: 200 }),
        apiService.getQuizzes(),
      ]);

      const filteredCourses = role === "admin"
        ? courseData.items
        : courseData.items.filter((course) => course.instructor?._id === user?._id);

      setCourses(filteredCourses);
      setQuizzes(quizItems);
      await loadQuizStats(quizItems);

      setActiveQuizId((previous) => {
        const target = preferredQuizId ?? previous;
        if (target && quizItems.some((quiz) => quiz._id === target)) {
          return target;
        }
        return quizItems[0]?._id || null;
      });

      if (quizItems.length === 0) {
        setActiveQuiz(null);
      }
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [role, user?._id]);

  useEffect(() => {
    if (!activeQuizId) {
      setActiveQuiz(null);
      return;
    }

    void loadActiveQuiz(activeQuizId);
  }, [activeQuizId]);

  useEffect(() => {
    if (!activeQuiz || isCreatingQuiz || isEditingInfo) return;

    setQuizForm({
      title: activeQuiz.title,
      description: activeQuiz.description || "",
      courseId: toCourseId(activeQuiz),
      passingScore: Number(activeQuiz.passingScore || 70),
      timeLimit: Number(activeQuiz.timeLimit || 30),
      maxAttempts: Number(activeQuiz.maxAttempts || 3),
      xpReward: Number(activeQuiz.xpReward || 10),
      isPublished: !!activeQuiz.isPublished,
    });
  }, [activeQuiz, isCreatingQuiz, isEditingInfo]);

  const startCreateQuiz = () => {
    setIsCreatingQuiz(true);
    setIsEditingInfo(false);
    setActiveQuizId(null);
    setActiveQuiz(null);
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuizForm(createQuizForm(courses[0]?._id || ""));
    setError("");
  };

  const cancelCreateQuiz = () => {
    setIsCreatingQuiz(false);
    setError("");
    if (quizzes.length > 0) {
      setActiveQuizId(quizzes[0]._id);
    }
  };

  const startEditInfo = () => {
    if (!activeQuiz) return;

    setIsEditingInfo(true);
    setIsCreatingQuiz(false);
    setQuizForm({
      title: activeQuiz.title,
      description: activeQuiz.description || "",
      courseId: toCourseId(activeQuiz),
      passingScore: Number(activeQuiz.passingScore || 70),
      timeLimit: Number(activeQuiz.timeLimit || 30),
      maxAttempts: Number(activeQuiz.maxAttempts || 3),
      xpReward: Number(activeQuiz.xpReward || 10),
      isPublished: !!activeQuiz.isPublished,
    });
  };

  const cancelEditInfo = () => {
    setIsEditingInfo(false);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      setError("Quiz title is required");
      return;
    }

    if (!quizForm.courseId) {
      setError("Please select a course");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (isCreatingQuiz) {
        const created = await apiService.createQuiz({
          title: quizForm.title.trim(),
          description: quizForm.description.trim(),
          courseId: quizForm.courseId,
          passingScore: quizForm.passingScore,
          timeLimit: quizForm.timeLimit,
          maxAttempts: quizForm.maxAttempts,
          xpReward: quizForm.xpReward,
          isPublished: quizForm.isPublished,
        });

        setIsCreatingQuiz(false);
        await loadData(created._id);
        setActiveQuizId(created._id);
      } else if (activeQuiz) {
        await apiService.updateQuiz(activeQuiz._id, {
          title: quizForm.title.trim(),
          description: quizForm.description.trim(),
          courseId: quizForm.courseId,
          passingScore: quizForm.passingScore,
          timeLimit: quizForm.timeLimit,
          maxAttempts: quizForm.maxAttempts,
          xpReward: quizForm.xpReward,
          isPublished: quizForm.isPublished,
        });

        setIsEditingInfo(false);
        await loadData(activeQuiz._id);
        await loadActiveQuiz(activeQuiz._id);
      }
    } catch (saveError: any) {
      setError(saveError?.response?.data?.message || "Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!activeQuiz) return;
    if (!confirm("Delete this quiz?")) return;

    setIsSaving(true);
    setError("");
    try {
      await apiService.deleteQuiz(activeQuiz._id);
      setIsEditingInfo(false);
      setShowQuestionForm(false);
      setEditingQuestionId(null);
      await loadData();
    } catch (deleteError: any) {
      setError(deleteError?.response?.data?.message || "Failed to delete quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddQuestion = () => {
    setShowQuestionForm(true);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
  };

  const openEditQuestion = (question: QuizQuestion) => {
    if (!question._id) return;
    setShowQuestionForm(true);
    setEditingQuestionId(question._id);
    setQuestionForm(toQuestionForm(question));
  };

  const cancelQuestionEdit = () => {
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
  };

  const buildQuestionPayload = () => {
    if (!questionForm.questionText.trim()) {
      throw new Error("Question text is required");
    }

    if (questionForm.type === "short-answer") {
      if (!questionForm.correctAnswerText.trim()) {
        throw new Error("Short answer requires a correct answer text");
      }

      return {
        questionText: questionForm.questionText.trim(),
        type: questionForm.type,
        correctAnswerText: questionForm.correctAnswerText.trim(),
        points: questionForm.points,
      };
    }

    if (questionForm.type === "true-false") {
      if (![0, 1].includes(questionForm.correctAnswerIndex)) {
        throw new Error("True/false question requires a valid answer selection");
      }

      return {
        questionText: questionForm.questionText.trim(),
        type: questionForm.type,
        correctAnswerIndex: questionForm.correctAnswerIndex,
        points: questionForm.points,
      };
    }

    const options = normalizeQuestionOptions(questionForm.options);
    if (options.length < 2) {
      throw new Error("Multiple-choice questions require at least 2 options");
    }

    if (questionForm.correctAnswerIndex < 0 || questionForm.correctAnswerIndex >= options.length) {
      throw new Error("Correct answer selection is invalid");
    }

    return {
      questionText: questionForm.questionText.trim(),
      type: questionForm.type,
      options,
      correctAnswerIndex: questionForm.correctAnswerIndex,
      points: questionForm.points,
    };
  };

  const handleSaveQuestion = async () => {
    if (!activeQuiz) return;

    setIsSaving(true);
    setError("");

    try {
      const payload = buildQuestionPayload();

      if (editingQuestionId) {
        await apiService.updateQuizQuestion(activeQuiz._id, editingQuestionId, payload);
      } else {
        await apiService.addQuizQuestion(activeQuiz._id, payload);
      }

      setShowQuestionForm(false);
      setEditingQuestionId(null);
      setQuestionForm(defaultQuestionForm);

      await loadData(activeQuiz._id);
      await loadActiveQuiz(activeQuiz._id);
    } catch (questionError: any) {
      setError(questionError?.response?.data?.message || questionError?.message || "Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId?: string) => {
    if (!activeQuiz || !questionId) return;
    if (!confirm("Delete this question?")) return;

    setIsSaving(true);
    setError("");
    try {
      await apiService.deleteQuizQuestion(activeQuiz._id, questionId);
      await loadData(activeQuiz._id);
      await loadActiveQuiz(activeQuiz._id);
    } catch (questionDeleteError: any) {
      setError(questionDeleteError?.response?.data?.message || "Failed to delete question");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quiz Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Create assessments and analyze student performance.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={startCreateQuiz}>
          <Plus className="mr-2 h-4 w-4" /> Create Quiz
        </Button>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 space-y-4 ${(activeQuizId || isCreatingQuiz) ? "hidden lg:block" : "block"}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search quizzes..." className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          <div className="space-y-3">
            {visibleQuizzes.length > 0 ? (
              visibleQuizzes.map((quiz) => {
                const stats = quizStats[quiz._id] || defaultStats;

                return (
                  <div
                    key={quiz._id}
                    onClick={() => {
                      setIsCreatingQuiz(false);
                      setIsEditingInfo(false);
                      setActiveQuizId(quiz._id);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeQuizId === quiz._id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{quiz.title}</h4>
                      <Badge variant={quiz.isPublished ? "success" : "secondary"} className="text-[10px]">
                        {quiz.isPublished ? "active" : "draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {toCourseTitle(quiz, courses)}
                    </p>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{Array.isArray(quiz.questions) ? quiz.questions.length : 0} Qs</span>
                      <div className="flex gap-3">
                        <span title="Average Score">Avg: {stats.averageScoreText}</span>
                        <span title="Pass Rate">Pass: {stats.passRateText}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-sm text-slate-500 text-center">
                No quizzes found.
              </div>
            )}
          </div>
        </div>

        <div className={`lg:col-span-2 ${(!activeQuizId && !isCreatingQuiz) ? "hidden lg:block" : "block"}`}>
          {!activeQuizId && !isCreatingQuiz ? (
            <Card className="h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <CheckCircle className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select a quiz to edit</h3>
              <p className="text-slate-500 mt-2">Or create a new one to start adding questions.</p>
            </Card>
          ) : isCreatingQuiz ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2 cursor-pointer lg:hidden" onClick={cancelCreateQuiz}>
                  <ChevronRight className="h-4 w-4 rotate-180" /> Back to quizzes
                </div>
                <CardTitle>Create New Quiz</CardTitle>
                <CardDescription>Fill quiz information before adding questions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={quizForm.title} onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={quizForm.description}
                    onChange={(event) => setQuizForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course</label>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                      value={quizForm.courseId}
                      onChange={(event) => setQuizForm((prev) => ({ ...prev, courseId: event.target.value }))}
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Passing Score (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.passingScore}
                      onChange={(event) => setQuizForm((prev) => ({ ...prev, passingScore: Number(event.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Limit (minutes)</label>
                    <Input
                      type="number"
                      min={1}
                      value={quizForm.timeLimit}
                      onChange={(event) => setQuizForm((prev) => ({ ...prev, timeLimit: Number(event.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Attempts</label>
                    <Input
                      type="number"
                      min={1}
                      value={quizForm.maxAttempts}
                      onChange={(event) => setQuizForm((prev) => ({ ...prev, maxAttempts: Number(event.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">XP Reward</label>
                    <Input
                      type="number"
                      min={0}
                      value={quizForm.xpReward}
                      onChange={(event) => setQuizForm((prev) => ({ ...prev, xpReward: Number(event.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={quizForm.isPublished}
                    onChange={(event) => setQuizForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                  />
                  Publish immediately
                </label>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={cancelCreateQuiz}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void handleSaveQuiz()} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isQuizLoading || !activeQuiz ? (
            <Card className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 cursor-pointer lg:hidden" onClick={() => setActiveQuizId(null)}>
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to quizzes
                  </div>

                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <CardTitle>{activeQuiz.title}</CardTitle>
                      <CardDescription>{toCourseTitle(activeQuiz, courses)}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={startEditInfo}>
                        <Edit className="h-4 w-4 mr-2" /> Edit Info
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void handleDeleteQuiz()} disabled={isSaving}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {isEditingInfo ? (
                    <div className="space-y-4 mb-6 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Edit Quiz Info</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input value={quizForm.title} onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={quizForm.description}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, description: event.target.value }))}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Course</label>
                          <select
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                            value={quizForm.courseId}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, courseId: event.target.value }))}
                          >
                            <option value="">Select course</option>
                            {courses.map((course) => (
                              <option key={course._id} value={course._id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Passing Score (%)</label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={quizForm.passingScore}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, passingScore: Number(event.target.value) || 0 }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time Limit (minutes)</label>
                          <Input
                            type="number"
                            min={1}
                            value={quizForm.timeLimit}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, timeLimit: Number(event.target.value) || 1 }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max Attempts</label>
                          <Input
                            type="number"
                            min={1}
                            value={quizForm.maxAttempts}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, maxAttempts: Number(event.target.value) || 1 }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">XP Reward</label>
                          <Input
                            type="number"
                            min={0}
                            value={quizForm.xpReward}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, xpReward: Number(event.target.value) || 0 }))}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-7">
                          <input
                            type="checkbox"
                            checked={quizForm.isPublished}
                            onChange={(event) => setQuizForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                          />
                          <span className="text-sm font-medium">Published</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={cancelEditInfo}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void handleSaveQuiz()} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-6">
                    <div>
                      <p className="text-xs text-slate-500">Total Questions</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{activeQuiz.questions?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Average Score</p>
                      <p className="text-lg font-semibold text-emerald-600">{activeQuizStats.averageScoreText}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pass Rate</p>
                      <p className="text-lg font-semibold text-emerald-600">{activeQuizStats.passRateText}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Questions</h3>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={openAddQuestion}>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </div>

                    {showQuestionForm ? (
                      <div className="p-4 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-4 bg-emerald-50/40 dark:bg-emerald-900/10">
                        <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                          {editingQuestionId ? "Edit Question" : "Add Question"}
                        </h4>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Question Text</label>
                          <Textarea
                            value={questionForm.questionText}
                            onChange={(event) => setQuestionForm((prev) => ({ ...prev, questionText: event.target.value }))}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Question Type</label>
                            <select
                              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                              value={questionForm.type}
                              onChange={(event) =>
                                setQuestionForm((prev) => ({
                                  ...prev,
                                  type: event.target.value as QuizQuestionType,
                                  correctAnswerIndex: 0,
                                }))
                              }
                            >
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="true-false">True / False</option>
                              <option value="short-answer">Short Answer</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Points</label>
                            <Input
                              type="number"
                              min={1}
                              value={questionForm.points}
                              onChange={(event) => setQuestionForm((prev) => ({ ...prev, points: Number(event.target.value) || 1 }))}
                            />
                          </div>
                        </div>

                        {questionForm.type === "multiple-choice" ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Options</p>
                            {questionForm.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={questionForm.correctAnswerIndex === index}
                                  onChange={() => setQuestionForm((prev) => ({ ...prev, correctAnswerIndex: index }))}
                                />
                                <Input
                                  value={option}
                                  onChange={(event) => {
                                    const next = [...questionForm.options];
                                    next[index] = event.target.value;
                                    setQuestionForm((prev) => ({ ...prev, options: next }));
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                />
                              </div>
                            ))}
                            <p className="text-xs text-slate-500">Select the correct option using the radio button.</p>
                          </div>
                        ) : null}

                        {questionForm.type === "true-false" ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Correct Answer</label>
                            <select
                              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                              value={questionForm.correctAnswerIndex}
                              onChange={(event) => setQuestionForm((prev) => ({ ...prev, correctAnswerIndex: Number(event.target.value) }))}
                            >
                              <option value={0}>True</option>
                              <option value={1}>False</option>
                            </select>
                          </div>
                        ) : null}

                        {questionForm.type === "short-answer" ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Correct Answer Text</label>
                            <Input
                              value={questionForm.correctAnswerText}
                              onChange={(event) => setQuestionForm((prev) => ({ ...prev, correctAnswerText: event.target.value }))}
                              placeholder="Expected short answer"
                            />
                          </div>
                        ) : null}

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={cancelQuestionEdit}>Cancel</Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void handleSaveQuestion()} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingQuestionId ? "Update Question" : "Add Question"}
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(activeQuiz.questions) && activeQuiz.questions.length > 0 ? (
                      activeQuiz.questions.map((question, index) => (
                        <div key={question._id || `${question.questionText}-${index}`} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 relative group">
                          <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-emerald-600"
                              onClick={() => openEditQuestion(question)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-red-600"
                              onClick={() => void handleDeleteQuestion(question._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="font-medium text-slate-900 dark:text-white pr-16">
                            <span className="text-slate-400 mr-2">{index + 1}.</span>
                            {question.questionText}
                          </p>

                          <div className="text-xs text-slate-500">Type: {question.type} | Points: {question.points}</div>

                          {question.type === "short-answer" ? (
                            <div className="pl-6 text-sm text-slate-700 dark:text-slate-300">
                              Correct answer: <span className="font-medium">{question.correctAnswerText || "N/A"}</span>
                            </div>
                          ) : (
                            <div className="space-y-2 pl-6">
                              {(question.options || []).map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`flex items-center gap-3 p-2 rounded-md text-sm border ${
                                    Number(question.correctAnswerIndex) === optionIndex
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50"
                                      : "bg-slate-50 border-transparent text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${Number(question.correctAnswerIndex) === optionIndex ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                                    {Number(question.correctAnswerIndex) === optionIndex ? <Check className="h-2.5 w-2.5" /> : null}
                                  </div>
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-sm text-slate-500 text-center">
                        No questions yet. Click Add Question to start building this quiz.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
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