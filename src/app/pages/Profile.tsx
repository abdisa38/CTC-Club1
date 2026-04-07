import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import { 
  Github, Linkedin, Mail, MapPin, Briefcase, 
  GraduationCap, Award, Calendar, BookOpen, ExternalLink
} from "lucide-react";

export function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Profile Section */}
      <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-950">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="relative px-6 sm:px-8 pb-8 pt-0 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-950 -mt-16 bg-white shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250" alt="Student" />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alex Chen</h1>
                <p className="text-lg text-slate-500 font-medium mt-1">Computer Science Student, Junior</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> University Campus</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Expected 2027</span>
                  <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> alex.chen@uni.edu</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon"><Github className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon"><Linkedin className="h-5 w-5" /></Button>
                <Button>Edit Profile</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (About & Stats) */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-2">
                  <span className="text-slate-900 dark:text-white flex items-center gap-2"><Award className="h-4 w-4 text-purple-500" /> Level 8</span>
                  <span className="text-indigo-600">2,450 XP</span>
                </div>
                <Progress value={65} className="h-2" indicatorColor="bg-purple-500" />
                <p className="text-xs text-slate-500 mt-2 text-right">550 XP to Level 9</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">12</span>
                  <span className="text-xs text-slate-500 font-medium">Courses Done</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">8</span>
                  <span className="text-xs text-slate-500 font-medium">Projects</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "Python", "C++", "Docker", "UI/UX", "Tailwind"].map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Activity & Certificates) */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Portfolio / Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "E-Commerce REST API", desc: "Built a fully functional e-commerce API using Express and MongoDB with JWT auth.", tags: ["Node.js", "MongoDB", "Express"], date: "Sep 2026" },
                { name: "University Event App", desc: "A mobile-responsive web app to track campus events. Features calendar integration.", tags: ["React", "Tailwind", "Firebase"], date: "Aug 2026" }
              ].map((project, i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors bg-white dark:bg-slate-950">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{project.name}</h4>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900"><ExternalLink className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{project.desc}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> {project.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificates & Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Advanced React Patterns", issuer: "CTC Club", date: "Oct 2026", color: "from-blue-500 to-indigo-500" },
                  { title: "Data Structures Mastery", issuer: "Computer Science Dept", date: "May 2026", color: "from-emerald-500 to-teal-500" }
                ].map((cert, i) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className={`h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-inner`}>
                      <Award className="h-8 w-8 text-white opacity-90" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{cert.title}</h5>
                      <p className="text-xs text-slate-500">{cert.issuer}</p>
                      <p className="text-xs text-slate-400 mt-1">{cert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
