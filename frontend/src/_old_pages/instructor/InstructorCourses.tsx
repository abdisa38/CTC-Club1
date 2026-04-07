import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Edit, Trash2, MoreVertical, Eye, FileVideo, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/DropdownMenu";

export function InstructorCourses() {
  const [courses, setCourses] = useState([
    {
      id: "1",
      title: "Advanced React Patterns 2026",
      status: "Published",
      students: 450,
      revenue: "$12,400",
      rating: 4.8,
      lastUpdated: "2 days ago",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "2",
      title: "Full-Stack Web Development Bootcamp",
      status: "Under Review",
      students: 0,
      revenue: "$0",
      rating: 0,
      lastUpdated: "5 hours ago",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "3",
      title: "CSS Architecture for Large Apps",
      status: "Draft",
      students: 0,
      revenue: "$0",
      rating: 0,
      lastUpdated: "1 week ago",
      image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=400"
    }
  ]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your created courses, lessons, and content.</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/app/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search your courses..." className="pl-9" />
        </div>
        <select className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="review">Under Review</option>
        </select>
      </div>

      <div className="grid gap-6">
        {courses.map(course => (
          <Card key={course.id} className="overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full md:w-64 h-40 object-cover rounded-lg bg-slate-100"
              />
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/instructor/courses/${course.id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Course
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/app/courses/${course.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/app/instructor/courses/${course.id}/lessons`} className="cursor-pointer">
                            <FileVideo className="mr-2 h-4 w-4 text-slate-500" /> Manage Lessons
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer" onClick={() => handleDelete(course.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <Badge variant={course.status === 'Published' ? 'success' : course.status === 'Draft' ? 'secondary' : 'outline'}>
                      {course.status}
                    </Badge>
                    <span>Updated {course.lastUpdated}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Students</p>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      {course.students}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Revenue</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{course.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Rating</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{course.rating > 0 ? course.rating : 'N/A'}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Button variant="outline" asChild>
                      <Link to={`/app/instructor/courses/${course.id}/edit`}>
                        Edit Content
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
