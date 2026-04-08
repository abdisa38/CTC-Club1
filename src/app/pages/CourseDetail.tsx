import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { 
  PlayCircle, CheckCircle, Lock, MessageSquare, 
  FileText, Download, ChevronRight, Star, Share2, BookmarkPlus, Send, UploadCloud, Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CourseEditor from "./instructor/CourseEditor";
import api from "../utils/api";

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  
  const isInstructor = role === 'instructor' || role === 'admin';
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState("content");
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (id === 'new') return;
    
    const fetchCourseData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/lessons`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (error) {
        console.error("Failed to load course details", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      // Update local state instead of re-fetching immediately
      setCourse({
        ...course,
        students: [...course.students, { _id: user._id, name: user.name }]
      });
    } catch (error) {
      console.error("Failed to enroll", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  // If we are creating a new course:
  if (id === 'new' && isInstructor) {
    return <CourseEditor />;
  }

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500">Course not found.</div>;
  }

  const isEnrolled = user && course.students?.some((s: any) => s._id === user._id);
  const progress = isEnrolled ? 15 : 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Video Player Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
        <div className="aspect-video bg-slate-900 relative group flex flex-col">
          <img 
            src={course.coverImage || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200"} 
            alt="Video Thumbnail" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isEnrolled || isInstructor ? (
              <Button size="icon" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-indigo-600 border border-white/30 text-white transition-all transform hover:scale-110">
                <PlayCircle className="h-8 w-8 ml-1" />
              </Button>
            ) : (
              <div className="text-center">
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-white max-w-sm">
                  <Lock className="h-8 w-8 mx-auto mb-3 opacity-80" />
                  <h3 className="font-bold text-xl mb-2">Enroll to Start Learning</h3>
                  <p className="text-sm opacity-80 mb-4">Join 12.5k students in mastering full-stack development.</p>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now - Free"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Mock Video Controls */}
          {(isEnrolled || isInstructor) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                <span className="text-sm font-medium">12:45 / 45:00</span>
              </div>
              <div className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer">
                <div className="h-full w-1/4 bg-indigo-500 rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                {isAdmin && <Badge variant="secondary">Manage Course</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor?.avatar || "https://i.pravatar.cc/150?u=instructor"} />
                    <AvatarFallback>{course.instructor?.name?.charAt(0) || "M"}</AvatarFallback>
                  </Avatar>
                  {course.instructor?.name || "Unknown Instructor"}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" /> 4.9 ({course.students?.length || 0} students)
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <Button variant="destructive" size="sm">Delete Course</Button>
              ) : (
                <>
                  <Button variant="outline" size="icon"><BookmarkPlus className="h-5 w-5" /></Button>
                  <Button variant="outline" size="icon"><Share2 className="h-5 w-5" /></Button>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
            <nav className="flex gap-6">
              {['content', 'overview', 'resources', 'discussion'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About this course</h3>
                <p>{course.description}</p>
                <h4 className="text-md font-semibold text-slate-900 dark:text-white mt-6 mb-2">What you'll learn</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {['Build scalable React apps', 'Master CSS layout techniques', 'Deploy full-stack apps to AWS', 'Implement authentication'].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "CSS Cheatsheet.pdf", size: "2.4 MB" },
                  { name: "Starter_Project_Files.zip", size: "15 MB" },
                  { name: "Lecture_Slides_M1.pptx", size: "5.1 MB" }
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea placeholder="Ask a question or share a thought..." className="min-h-[100px]" />
                    <div className="flex justify-end">
                      <Button><Send className="h-4 w-4 mr-2" /> Post Comment</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { author: "Emily Parker", time: "2 hours ago", text: "Can someone explain the difference between flex-basis and width? I'm getting confused around the 45-minute mark.", replies: 1 },
                    { author: "David Kumar", time: "Yesterday", text: "Great explanation of Grid areas! I finally understand how to layout complex dashboards.", replies: 0 }
                  ].map((comment, i) => (
                    <div key={i} className="flex gap-4">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{comment.author}</span>
                            <span className="text-xs text-slate-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 ml-2">
                          <button className="text-xs font-medium text-slate-500 hover:text-indigo-600">Reply</button>
                          <button className="text-xs font-medium text-slate-500 hover:text-indigo-600">Like</button>
                          {comment.replies > 0 && <button className="text-xs font-medium text-indigo-600">{comment.replies} Reply</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="lg:hidden text-center p-8 text-slate-500">
                <p>Course content is visible on the right sidebar on desktop, or scroll down on mobile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full lg:w-[400px] border-l border-slate-200 bg-white flex flex-col dark:border-slate-800 dark:bg-slate-950 h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Course Content</h3>
          <div className="flex justify-between items-center text-sm mb-1 text-slate-600 dark:text-slate-400">
            <span>Progress: {course.progress}%</span>
            <span>{isEnrolled ? "2" : "0"} / 12 Lessons</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module) => (
            <div key={module.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900 transition-colors">
                <div className="text-left">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{module.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{module.lessons.length} lessons • {module.duration}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
              </button>
              <div className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800/50">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id} 
                    className={`w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left ${
                      lesson.locked ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : lesson.locked ? (
                        <Lock className="h-5 w-5 text-slate-400" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        lesson.locked ? "text-slate-500" : "font-medium text-slate-900 dark:text-white"
                      }`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        {lesson.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseEditor() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/app/courses");
      }, 1500);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Course</h1>
        <p className="text-slate-500 dark:text-slate-400">Fill in the details to publish a new course to the platform.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-500" />
          <p className="font-medium">Course created successfully! Redirecting to course list...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Basic information about your new course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title <span className="text-red-500">*</span></label>
              <Input required placeholder="e.g. Advanced System Design" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Computer Science</option>
                  <option>Design</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Description <span className="text-red-500">*</span></label>
              <Textarea required placeholder="Describe what students will learn..." rows={5} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image Upload</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle>Curriculum Builder</CardTitle>
              <CardDescription>Add modules and lessons.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Module</Button>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/30">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-white">Module 1: Introduction</h4>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600"><Lock className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Welcome to the Course</span>
                  </div>
                  <Button type="button" variant="ghost" size="sm">Edit</Button>
                </div>
                <Button type="button" variant="outline" className="w-full mt-2 bg-transparent border-dashed border-slate-300 dark:border-slate-700 text-slate-600">
                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/app/courses")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSubmitting ? "Publishing..." : "Publish Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}