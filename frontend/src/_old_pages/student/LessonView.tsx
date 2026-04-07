import { useState } from "react";
import { Link, useParams } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { Textarea } from "../../components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  PlayCircle, CheckCircle, Lock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MessageSquare, FileText, Download, StickyNote, BookOpen, Send, ThumbsUp, Clock,
  Maximize2, Volume2, Settings, SkipForward, Pause, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const lessonData = {
  courseTitle: "Full-Stack Web Development Bootcamp",
  courseId: "1",
  modules: [
    {
      id: "m1",
      title: "Module 1: Frontend Fundamentals",
      lessons: [
        { id: "l1", title: "Introduction to the Course", duration: "10:00", completed: true },
        { id: "l2", title: "HTML5 Semantic Tags", duration: "45:00", completed: true },
        { id: "l3", title: "CSS Flexbox & Grid", duration: "1:20:00", completed: false, active: true },
        { id: "l4", title: "Assignment: Build a Landing Page", duration: "1:00:00", completed: false, type: "assignment" },
      ]
    },
    {
      id: "m2",
      title: "Module 2: React Core Concepts",
      lessons: [
        { id: "l5", title: "JSX & Components", duration: "1:10:00", completed: false },
        { id: "l6", title: "State and Props", duration: "1:30:00", completed: false },
        { id: "l7", title: "Quiz: React Basics", duration: "20:00", completed: false, type: "quiz" },
      ]
    },
    {
      id: "m3",
      title: "Module 3: Backend with Node.js",
      lessons: [
        { id: "l8", title: "Express.js Setup", duration: "55:00", completed: false },
        { id: "l9", title: "RESTful API Design", duration: "1:15:00", completed: false },
        { id: "l10", title: "MongoDB Integration", duration: "1:45:00", completed: false },
      ]
    }
  ]
};

const resources = [
  { name: "CSS Cheatsheet.pdf", size: "2.4 MB" },
  { name: "Starter_Project.zip", size: "15 MB" },
  { name: "Lecture_Slides.pptx", size: "5.1 MB" },
];

const initialNotes = [
  { id: 1, text: "Flexbox uses main axis and cross axis - remember justify-content for main, align-items for cross", time: "12:34" },
  { id: 2, text: "grid-template-areas is very powerful for complex layouts", time: "35:20" },
];

const comments = [
  { id: 1, author: "Emily Parker", avatar: "https://i.pravatar.cc/150?u=3", text: "Can someone explain the difference between flex-basis and width?", time: "2 hours ago", likes: 5, replies: [
    { id: 11, author: "David Kumar", avatar: "https://i.pravatar.cc/150?u=4", text: "flex-basis sets the initial size before flex-grow/shrink kicks in. Width is a hard constraint.", time: "1 hour ago", likes: 3 }
  ]},
  { id: 2, author: "Alex Chen", avatar: "https://i.pravatar.cc/150?u=1", text: "Great explanation of Grid areas! I finally understand how to layout complex dashboards.", time: "1 day ago", likes: 12, replies: [] },
];

export function LessonView() {
  const { courseId, lessonId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"curriculum" | "notes" | "resources" | "discussion">("curriculum");
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ m1: true, m2: true, m3: true });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(["l1", "l2"]));
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);

  const totalLessons = lessonData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const handleMarkComplete = () => {
    if (!lessonCompleted) {
      setLessonCompleted(true);
      setCompletedLessons(prev => new Set([...prev, "l3"]));
      setShowCompleteBanner(true);
      setTimeout(() => setShowCompleteBanner(false), 3000);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now(), text: newNote, time: "45:12" }]);
    setNewNote("");
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm -m-4 md:-m-6 lg:-m-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/app/courses/${courseId || "1"}`}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to Course
              </Link>
            </Button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
              {lessonData.courseTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{completedCount}/{totalLessons} lessons</span>
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
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-slate-900 relative group shrink-0">
          <img
            src="https://images.unsplash.com/photo-1597239450996-ea7c2c564412?auto=format&fit=crop&q=80&w=1200"
            alt="Lesson Video"
            className="w-full h-full object-cover opacity-50"
          />

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-indigo-600 border border-white/30 text-white transition-colors flex items-center justify-center"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
            </motion.button>
          </div>

          {/* Video Controls */}
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
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-indigo-400 transition-colors">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button className="hover:text-indigo-400 transition-colors"><SkipForward className="h-5 w-5" /></button>
                <button className="hover:text-indigo-400 transition-colors"><Volume2 className="h-5 w-5" /></button>
                <span className="text-xs font-mono">36:12 / 1:20:00</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="hover:text-indigo-400 transition-colors"><Settings className="h-5 w-5" /></button>
                <button className="hover:text-indigo-400 transition-colors"><Maximize2 className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info & Below-Video Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">
            {/* Completion Banner */}
            <AnimatePresence>
              {showCompleteBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Lesson marked as complete! +50 XP earned
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lesson Title & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">CSS Flexbox & Grid</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 1h 20m</span>
                  <span>Module 1, Lesson 3</span>
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
                <Button variant="outline" asChild>
                  <Link to={`/app/courses/1/lessons/l4`}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile Panel Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 lg:hidden overflow-x-auto">
              {(["notes", "resources", "discussion"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivePanel(tab)}
                  className={`px-4 py-3 text-sm font-medium capitalize border-b-2 whitespace-nowrap transition-colors ${
                    activePanel === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab === "notes" && <StickyNote className="h-4 w-4 inline mr-1.5" />}
                  {tab === "resources" && <FileText className="h-4 w-4 inline mr-1.5" />}
                  {tab === "discussion" && <MessageSquare className="h-4 w-4 inline mr-1.5" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Notes Panel */}
            {(activePanel === "notes" || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
              <div className={activePanel !== "notes" ? "hidden lg:block" : ""}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-amber-500" /> My Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                        <Badge variant="outline" className="shrink-0 h-6 text-[10px] font-mono text-amber-700 border-amber-300">{note.time}</Badge>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{note.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note at current timestamp..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <Button size="icon" className="shrink-0 h-10 w-10" onClick={handleAddNote} disabled={!newNote.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Resources Panel */}
            {activePanel === "resources" && (
              <div className="lg:hidden">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" /> Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {resources.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Discussion Panel */}
            {activePanel === "discussion" && (
              <div className="lg:hidden">
                <DiscussionPanel newComment={newComment} setNewComment={setNewComment} />
              </div>
            )}

            {/* Desktop-only: always show notes, resources, discussion below */}
            <div className="hidden lg:block space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" /> Lesson Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {resources.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <DiscussionPanel newComment={newComment} setNewComment={setNewComment} />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Curriculum */}
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-[360px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full absolute lg:relative z-20 lg:z-0 top-0 right-0`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Course Content</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Progress: {progressPct}%</span>
            <span>{completedCount} / {totalLessons} Lessons</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessonData.modules.map(module => (
            <div key={module.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{module.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {module.lessons.filter(l => completedLessons.has(l.id)).length}/{module.lessons.length} completed
                  </p>
                </div>
                {expandedModules[module.id] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              <AnimatePresence>
                {expandedModules[module.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {module.lessons.map(lesson => {
                      const isActive = lesson.id === "l3";
                      const isCompleted = completedLessons.has(lesson.id) || (lesson.id === "l3" && lessonCompleted);
                      return (
                        <Link
                          key={lesson.id}
                          to={`/app/courses/1/lessons/${lesson.id}`}
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
                            <p className={`text-sm ${isActive ? "font-semibold text-indigo-600 dark:text-indigo-400" : isCompleted ? "text-slate-500 line-through" : "text-slate-700 dark:text-slate-300"}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                              {lesson.type === "quiz" && <Badge variant="secondary" className="text-[9px] h-4 px-1">Quiz</Badge>}
                              {lesson.type === "assignment" && <Badge variant="secondary" className="text-[9px] h-4 px-1">Assignment</Badge>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscussionPanel({ newComment, setNewComment }: { newComment: string; setNewComment: (v: string) => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" /> Discussion ({comments.reduce((s, c) => s + 1 + c.replies.length, 0)})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment */}
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[50px] text-sm" />
            <Button size="icon" className="shrink-0 h-10 w-10" disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments */}
        {comments.map(comment => (
          <div key={comment.id} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback>{comment.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl rounded-tl-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{comment.author}</span>
                    <span className="text-xs text-slate-500">{comment.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                </div>
                <div className="flex items-center gap-4 mt-1.5 ml-2">
                  <button className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {comment.likes}
                  </button>
                  <button className="text-xs font-medium text-slate-500 hover:text-indigo-600">Reply</button>
                </div>

                {/* Replies */}
                {comment.replies.map(reply => (
                  <div key={reply.id} className="flex gap-3 mt-3 ml-4">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={reply.avatar} />
                      <AvatarFallback>{reply.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl rounded-tl-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{reply.author}</span>
                          <span className="text-[10px] text-slate-500">{reply.time}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{reply.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-2">
                        <button className="text-[10px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                          <ThumbsUp className="h-2.5 w-2.5" /> {reply.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
