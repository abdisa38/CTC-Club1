import { useState } from "react";
import { Search, Filter, CheckCircle2, XCircle, Clock, ExternalLink, Github, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";

export function InstructorProjects() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [feedback, setFeedback] = useState("");

  const projects = [
    {
      id: "p1",
      studentName: "Alex Chen",
      studentAvatar: "https://i.pravatar.cc/150?u=1",
      course: "Advanced React Patterns",
      projectTitle: "E-Commerce Storefront",
      submittedAt: "2 hours ago",
      status: "pending",
      githubUrl: "https://github.com/alexchen/ecommerce",
      demoUrl: "https://ecommerce-alex.vercel.app",
      description: "Implemented a full e-commerce storefront using React, Context API, and Tailwind CSS. Features include a shopping cart, product filtering, and simulated checkout.",
      history: []
    },
    {
      id: "p2",
      studentName: "Sarah Smith",
      studentAvatar: "https://i.pravatar.cc/150?u=2",
      course: "Full-Stack Web Development",
      projectTitle: "Task Management API",
      submittedAt: "1 day ago",
      status: "pending",
      githubUrl: "https://github.com/sarahs/task-api",
      demoUrl: "",
      description: "RESTful API built with Node.js and Express. Includes user authentication (JWT) and CRUD operations for tasks.",
      history: [
        { date: "3 days ago", type: "rejected", feedback: "Good start, but missing input validation on the POST /tasks endpoint." }
      ]
    },
    {
      id: "p3",
      studentName: "David Kumar",
      studentAvatar: "https://i.pravatar.cc/150?u=3",
      course: "Advanced React Patterns",
      projectTitle: "Weather Dashboard",
      submittedAt: "3 days ago",
      status: "approved",
      githubUrl: "https://github.com/dkumar/weather",
      demoUrl: "https://weather-dk.netlify.app",
      description: "Weather dashboard fetching data from OpenWeather API.",
      history: [
        { date: "2 days ago", type: "approved", feedback: "Excellent use of custom hooks for data fetching! Clean UI." }
      ]
    }
  ];

  const filteredProjects = projects.filter(p => activeTab === "all" || p.status === activeTab);

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!feedback.trim()) return alert("Please provide feedback");
    
    // Simulate updating
    alert(`Project ${status}! Feedback sent to student.`);
    setSelectedProject(null);
    setFeedback("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Project Reviews
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Review student submissions, provide feedback, and grade projects.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className={`lg:col-span-1 space-y-4 ${selectedProject ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Pending <span className="ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-xs">2</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'approved' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              All
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search students or projects..." className="pl-9" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedProject?.id === project.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.studentAvatar} />
                      <AvatarFallback>{project.studentName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{project.studentName}</span>
                  </div>
                  {project.status === 'pending' ? (
                    <Badge variant="outline" className="text-[10px] text-orange-600 bg-orange-50 border-orange-200">Pending</Badge>
                  ) : project.status === 'approved' ? (
                    <Badge variant="success" className="text-[10px]">Approved</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{project.projectTitle}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{project.course}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <Clock className="h-3 w-3" /> {project.submittedAt}
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                No projects found.
              </div>
            )}
          </div>
        </div>

        {/* Review Panel */}
        <div className={`lg:col-span-2 ${!selectedProject ? 'hidden lg:flex' : 'block'} items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[600px]`}>
          {!selectedProject ? (
            <div className="text-center">
              <CheckSquareIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select a project to review</h3>
              <p className="text-slate-500 max-w-sm mt-2">Choose a pending submission from the list to view details, code, and provide feedback.</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 cursor-pointer lg:hidden" onClick={() => setSelectedProject(null)}>
                  <ChevronRight className="h-4 w-4 rotate-180" /> Back to list
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedProject.projectTitle}</h2>
                    <p className="text-slate-500 mt-1">{selectedProject.course}</p>
                  </div>
                  {selectedProject.status === 'pending' ? (
                    <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200"><Clock className="h-3 w-3 mr-1" /> Needs Review</Badge>
                  ) : (
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedProject.studentAvatar} />
                      <AvatarFallback>{selectedProject.studentName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedProject.studentName}</p>
                      <p className="text-xs text-slate-500">Submitted {selectedProject.submittedAt}</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                        <Github className="h-4 w-4 mr-2" /> Repository
                      </a>
                    </Button>
                    {selectedProject.demoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Student's Notes</h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    {selectedProject.description}
                  </div>
                </div>

                {selectedProject.history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Previous Feedback</h3>
                    <div className="space-y-4">
                      {selectedProject.history.map((h: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                          <div className={`mt-0.5 ${h.type === 'rejected' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {h.type === 'rejected' ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">{h.type === 'rejected' ? 'Changes Requested' : 'Approved'}</span>
                              <span className="text-xs text-slate-500">{h.date}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{h.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.status === 'pending' && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Your Review
                    </h3>
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide constructive feedback, point out areas of improvement, or praise good practices..."
                      className="w-full min-h-[150px] p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-transparent text-sm resize-y"
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleReview('rejected')}>
                        <XCircle className="h-4 w-4 mr-2" /> Request Changes
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleReview('approved')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Project
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CheckSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)
