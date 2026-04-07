import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Search, Filter, Star, Clock, Users, PlayCircle, PlusCircle, X, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function CourseList() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor' || isAdmin;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "5"]));
  const [enrolledIds] = useState<Set<string>>(new Set(["1", "2"]));
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const courses = [
    {
      id: "1",
      title: "Full-Stack Web Development Boot-camp",
      instructor: "Prof. Michael Jordan",
      rating: 4.9,
      students: "12.5k",
      duration: "40h 30m",
      durationHours: 40,
      level: "Beginner",
      category: "Web Dev",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["React", "Node.js", "MongoDB"]
    },
    {
      id: "2",
      title: "Advanced Data Structures & Algorithms",
      instructor: "Dr. Alan Turing",
      rating: 4.8,
      students: "8.2k",
      duration: "25h 15m",
      durationHours: 25,
      level: "Advanced",
      category: "Computer Science",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["C++", "Algorithms", "DSA"]
    },
    {
      id: "3",
      title: "UI/UX Design for Developers",
      instructor: "Sarah Jenkins",
      rating: 4.7,
      students: "5.4k",
      duration: "12h 00m",
      durationHours: 12,
      level: "Intermediate",
      category: "Design",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["Figma", "Design Systems", "CSS"]
    },
    {
      id: "4",
      title: "DevOps Masterclass: Docker & Kubernetes",
      instructor: "Alex Chen",
      rating: 4.9,
      students: "3.1k",
      duration: "18h 45m",
      durationHours: 18,
      level: "Advanced",
      category: "Cloud",
      image: "https://images.unsplash.com/photo-1620912189868-30761e649ce4?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["Docker", "K8s", "CI/CD"]
    },
    {
      id: "5",
      title: "Machine Learning Foundations A-Z",
      instructor: "Dr. Andrew Ng",
      rating: 4.9,
      students: "22k",
      duration: "45h 00m",
      durationHours: 45,
      level: "Beginner",
      category: "AI/ML",
      image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["Python", "TensorFlow", "Math"]
    },
    {
      id: "6",
      title: "Mastering Command Line Interface",
      instructor: "Linus T.",
      rating: 4.6,
      students: "4.8k",
      duration: "5h 30m",
      durationHours: 5,
      level: "Beginner",
      category: "Tools",
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800",
      price: "Free",
      tags: ["Bash", "Linux", "Scripting"]
    }
  ];

  const filteredCourses = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) && !c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (selectedLevel && c.level !== selectedLevel) return false;
    if (selectedDuration === "short" && c.durationHours > 10) return false;
    if (selectedDuration === "medium" && (c.durationHours <= 10 || c.durationHours > 25)) return false;
    if (selectedDuration === "long" && c.durationHours <= 25) return false;
    return true;
  });

  const activeFilters = [selectedCategory, selectedLevel, selectedDuration].filter(Boolean).length;

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnroll = (id: string) => {
    setEnrollingId(id);
    setTimeout(() => setEnrollingId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Course Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Discover hundreds of university-grade courses.</p>
        </div>
        {isInstructor && (
          <Button asChild className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/app/courses/new"><PlusCircle className="h-4 w-4 mr-2" /> Add Course</Link>
          </Button>
        )}
      </div>

      <Card className="bg-white/50 dark:bg-slate-900/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search courses by title, instructor, or tags..."
                className="pl-10 h-12 bg-white dark:bg-slate-950"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              className="h-12 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2" /> Filters
              {activeFilters > 0 && (
                <Badge className="ml-2 bg-white text-indigo-600 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200 dark:border-slate-800"
            >
              <select
                className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Web Dev">Web Development</option>
                <option value="Computer Science">Computer Science</option>
                <option value="AI/ML">AI / ML</option>
                <option value="Design">Design</option>
                <option value="Cloud">Cloud / DevOps</option>
                <option value="Tools">Tools</option>
              </select>
              <select
                className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
              >
                <option value="">Any Duration</option>
                <option value="short">Short (&lt; 10h)</option>
                <option value="medium">Medium (10-25h)</option>
                <option value="long">Long (25h+)</option>
              </select>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(""); setSelectedLevel(""); setSelectedDuration(""); }}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <Search className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory(""); setSelectedLevel(""); setSelectedDuration(""); }}>Clear all filters</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden group flex flex-col hover:border-indigo-200 hover:shadow-md transition-all dark:hover:border-indigo-800">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" className="rounded-full h-12 w-12 bg-indigo-600 hover:bg-indigo-700" asChild>
                        <Link to={`/app/courses/${course.id}`}><PlayCircle className="h-6 w-6 text-white" /></Link>
                      </Button>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 hover:bg-white">{course.category}</Badge>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(course.id); }}
                      className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(course.id) ? "text-red-500 fill-red-500" : "text-slate-600"}`} />
                    </button>
                    {enrolledIds.has(course.id) && (
                      <Badge className="absolute bottom-3 left-3 bg-emerald-600 text-white hover:bg-emerald-600">Enrolled</Badge>
                    )}
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

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{course.instructor}</p>

                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      {course.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.level}</span>
                      </div>
                      {!enrolledIds.has(course.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                        >
                          {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}