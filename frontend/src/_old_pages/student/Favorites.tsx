import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Star, Clock, Users, PlayCircle, Heart, FileText, Bookmark, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const savedCourses = [
  {
    id: "1", title: "Full-Stack Web Development Bootcamp", instructor: "Prof. Michael Jordan",
    rating: 4.9, students: "12.5k", duration: "40h 30m", level: "Beginner to Pro", category: "Web Dev",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    tags: ["React", "Node.js", "MongoDB"]
  },
  {
    id: "3", title: "UI/UX Design for Developers", instructor: "Sarah Jenkins",
    rating: 4.7, students: "5.4k", duration: "12h", level: "Intermediate", category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
    tags: ["Figma", "Design Systems", "CSS"]
  },
  {
    id: "5", title: "Machine Learning Foundations A-Z", instructor: "Dr. Andrew Ng",
    rating: 4.9, students: "22k", duration: "45h", level: "Beginner", category: "AI/ML",
    image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "TensorFlow", "Math"]
  },
];

const savedResources = [
  { id: 1, title: "React Architecture Cheatsheet", type: "PDF", size: "2.4 MB", course: "Advanced React", date: "Oct 12, 2026" },
  { id: 2, title: "Express Server Starter Code", type: "Code", size: "1.2 MB", course: "Node.js API", date: "Sep 28, 2026" },
  { id: 3, title: "Data Structures Study Guide", type: "PDF", size: "4.1 MB", course: "CS 201", date: "Sep 15, 2026" },
];

export function Favorites() {
  const [courses, setCourses] = useState(savedCourses);
  const [resources, setResources] = useState(savedResources);
  const [removingId, setRemovingId] = useState<string | number | null>(null);

  const removeCourse = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setCourses(prev => prev.filter(c => c.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const removeResource = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setResources(prev => prev.filter(r => r.id !== id));
      setRemovingId(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Favorites
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Your bookmarked courses and resources.</p>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="courses">
            <Bookmark className="h-4 w-4 mr-2" /> Courses ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" /> Resources ({resources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {courses.length === 0 ? (
            <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <Heart className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No saved courses</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Browse courses and bookmark the ones you like.</p>
              <Button asChild><Linkhref=>Browse Courses</Link></Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {courses.map(course => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden group flex flex-col hover:border-indigo-200 hover:shadow-md transition-all dark:hover:border-indigo-800">
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="icon" className="rounded-full h-12 w-12 bg-indigo-600 hover:bg-indigo-700" asChild>
                            <Link to={`/app/courses/${course.id}`}><PlayCircle className="h-6 w-6 text-white" /></Link>
                          </Button>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white">{course.category}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 h-8 w-8 rounded-full"
                          onClick={() => removeCourse(course.id)}
                        >
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        </Button>
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mb-2">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span>{course.rating}</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-500">({course.students})</span>
                        </div>
                        <Link to={`/app/courses/${course.id}`} className="block mb-2">
                          <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>
                        <div className="flex items-center justify-between text-sm text-slate-500 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.level}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          {resources.length === 0 ? (
            <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No saved resources</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Bookmark resources from your courses to access them quickly.</p>
              <Button asChild><Linkhref=>Browse Resources</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {resources.map(res => (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{res.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{res.course} · {res.size} · {res.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 hidden sm:inline">{res.date}</span>
                          <Button variant="outline" size="sm">Download</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeResource(res.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
