import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Github, UploadCloud, Link as LinkIcon, CheckCircle2, MessageSquare, AlertCircle, User, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Project = {
  id: number;
  title: string;
  course: string;
  status: "pending" | "review" | "completed";
  due?: string;
  submitted?: string;
  description: string;
  grade?: string;
  feedback?: string;
  studentName?: string;
  repoUrl?: string;
  demoUrl?: string;
};

const initialProjects: Project[] = [
  { id: 1, title: "E-Commerce REST API", course: "Advanced Node.js", status: "pending", due: "Oct 20, 2026", description: "Build a scalable REST API using Express, MongoDB, and JWT authentication. Must include at least 5 endpoints with validation.", studentName: "Student" },
  { id: 2, title: "React Portfolio", course: "Frontend Fundamentals", status: "review", submitted: "Oct 10, 2026", description: "Create a personal portfolio using React and Tailwind CSS. Must be responsive and accessible.", studentName: "Student", repoUrl: "https://github.com/student/portfolio" },
  { id: 3, title: "CSS Grid Layout", course: "CSS Mastery", status: "completed", grade: "95/100", feedback: "Excellent use of grid-template-areas. Consider optimizing mobile breakpoint spacing.", submitted: "Sep 15, 2026", studentName: "Student", repoUrl: "https://github.com/student/css-grid" },
  
  // Extra for instructors
  { id: 4, title: "React Portfolio", course: "Frontend Fundamentals", status: "review", submitted: "Oct 11, 2026", description: "Create a personal portfolio...", studentName: "Alex Chen", repoUrl: "https://github.com/alex/portfolio" },
  { id: 5, title: "E-Commerce REST API", course: "Advanced Node.js", status: "review", submitted: "Oct 12, 2026", description: "Build a scalable REST API...", studentName: "Emily Parker", repoUrl: "https://github.com/emily/api", demoUrl: "https://emily-api.herokuapp.com" },
];

export function Projects() {
  const { role } = useAuth();
  const isInstructor = role === 'instructor' || role === 'admin';
  
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [comments, setComments] = useState("");

  const [reviewGrade, setReviewGrade] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);

  const myProjects = isInstructor ? projects : projects.filter(p => p.studentName === 'Student');
  const reviewProjects = projects.filter(p => p.status === 'review' && p.studentName !== 'Student' || (isInstructor && p.status === 'review'));

  const handleSubmitProject = (projectId: number) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: "review", submitted: "Just now", repoUrl, demoUrl } 
          : p
      ));
      setIsSubmitting(false);
      setRepoUrl("");
      setDemoUrl("");
      setComments("");
      // Close dialog handled by DialogTrigger asChild or we can manage it with state, but keeping it simple for now
    }, 1500);
  };

  const handleReviewProject = (projectId: number) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: "completed", grade: reviewGrade, feedback: reviewFeedback } 
          : p
      ));
      setIsSubmitting(false);
      setReviewGrade("");
      setReviewFeedback("");
      setActiveReviewId(null);
    }, 1500);
  };

  if (isInstructor) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Project Reviews</h1>
            <p className="text-slate-500 dark:text-slate-400">Review and grade student submissions.</p>
          </div>
        </div>

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="review">Needs Review ({reviewProjects.length})</TabsTrigger>
            <TabsTrigger value="completed">Graded</TabsTrigger>
          </TabsList>
          
          {['review', 'completed'].map((tabStatus) => (
            <TabsContent key={tabStatus} value={tabStatus} className="space-y-4 mt-6">
              {projects.filter(p => p.status === tabStatus && (tabStatus === 'review' ? true : p.grade)).length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">No projects to review</h3>
                  <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
                </div>
              ) : (
                projects.filter(p => p.status === tabStatus && (tabStatus === 'review' ? true : p.grade)).map((project) => (
                  <Card key={project.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">{project.course}</Badge>
                          <span className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                            <User className="h-3 w-3 mr-1"/> {project.studentName}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </div>
                      {project.grade && (
                        <div className="text-right">
                          <span className="block text-sm text-slate-500 font-medium">Grade</span>
                          <span className="text-xl font-bold text-emerald-500">{project.grade}</span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {project.submitted && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Submitted: {project.submitted}</span>}
                        {project.repoUrl && (
                          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                            <Github className="h-4 w-4" /> View Repo
                          </a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                            <LinkIcon className="h-4 w-4" /> Live Demo
                          </a>
                        )}
                      </div>

                      {project.status === 'review' && (
                        <Dialog open={activeReviewId === project.id} onOpenChange={(open) => setActiveReviewId(open ? project.id : null)}>
                          <DialogTrigger asChild>
                            <Button><CheckCircle2 className="mr-2 h-4 w-4" /> Grade Submission</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Grade: {project.title}</DialogTitle>
                              <DialogDescription>
                                Student: {project.studentName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Score / Grade <span className="text-red-500">*</span></label>
                                <Input required value={reviewGrade} onChange={(e) => setReviewGrade(e.target.value)} placeholder="e.g. 95/100 or A" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Constructive Feedback <span className="text-red-500">*</span></label>
                                <Textarea required value={reviewFeedback} onChange={(e) => setReviewFeedback(e.target.value)} placeholder="Provide actionable feedback for the student..." rows={4} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => handleReviewProject(project.id)} disabled={!reviewGrade || !reviewFeedback || isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Grade'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Student View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">Submit assignments and track instructor feedback.</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {['pending', 'review', 'completed'].map((tabStatus) => (
          <TabsContent key={tabStatus} value={tabStatus} className="space-y-4 mt-6">
            {myProjects.filter(p => p.status === tabStatus).length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No projects here</h3>
                <p className="text-sm text-slate-500 mt-1">You're all caught up with this section!</p>
              </div>
            ) : (
              myProjects.filter(p => p.status === tabStatus).map((project) => (
                <Card key={project.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={project.status === 'completed' ? 'success' : project.status === 'review' ? 'secondary' : 'default'} className="text-[10px] uppercase">
                          {project.status === 'review' ? 'Under Review' : project.status}
                        </Badge>
                        <span className="text-sm font-medium text-indigo-600">{project.course}</span>
                      </div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2 max-w-3xl mt-2 text-sm">
                        {project.description}
                      </CardDescription>
                    </div>
                    {project.grade && (
                      <div className="text-right">
                        <span className="block text-sm text-slate-500 font-medium">Grade</span>
                        <span className="text-xl font-bold text-emerald-500">{project.grade}</span>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      {project.due && <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Due: {project.due}</span>}
                      {project.submitted && <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Submitted: {project.submitted}</span>}
                    </div>

                    {project.status === 'pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button><UploadCloud className="mr-2 h-4 w-4" /> Submit Project</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Submit Project</DialogTitle>
                            <DialogDescription>
                              Submit your work for "{project.title}". Ensure your repository is public or accessible to instructors.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">GitHub Repository URL <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <Github className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input required value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/username/repo" className="pl-9" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Live Demo URL (Optional)</label>
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://my-project.vercel.app" className="pl-9" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Comments for Instructor</label>
                              <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Any challenges faced or specific areas you want feedback on?" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => handleSubmitProject(project.id)} disabled={!repoUrl || isSubmitting}>
                              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {project.status === 'completed' && project.feedback && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> View Feedback</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Instructor Feedback</DialogTitle>
                            <DialogDescription>Feedback for {project.title}</DialogDescription>
                          </DialogHeader>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                            "{project.feedback}"
                          </div>
                          <div className="mt-4 flex gap-4">
                            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 flex items-center gap-1 hover:underline"><Github className="h-4 w-4" /> Submitted Repo</a>}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}