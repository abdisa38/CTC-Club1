import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Plus, GripVertical, Video, FileText, Lock, Unlock, Edit, Trash2, Clock, Upload, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Switch } from "../../components/ui/switch";
import { motion, Reorder } from "motion/react";

export function InstructorLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([
    { id: "l1", title: "Introduction to React", type: "video", duration: "10:45", isLocked: false, completions: 420 },
    { id: "l2", title: "Setting up your environment", type: "video", duration: "15:20", isLocked: false, completions: 380 },
    { id: "l3", title: "Component Architecture PDF", type: "document", duration: "5:00", isLocked: true, completions: 310 },
    { id: "l4", title: "State Management Deep Dive", type: "video", duration: "45:00", isLocked: true, completions: 150 },
  ]);

  const [isEditing, setIsEditing] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("Delete this lesson?")) {
      setLessons(lessons.filter(l => l.id !== id));
    }
  };

  const toggleLock = (id: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, isLocked: !l.isLocked } : l));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/instructor/courses')}>
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Manage Lessons <Badge variant="secondary">Course: Advanced React Patterns</Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Drag to reorder, add content, and manage drip schedules.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lesson List (Drag and Drop) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>Drag the handle to reorder lessons</CardDescription>
            </div>
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900" onClick={() => setIsEditing('new')}>
              <Plus className="h-4 w-4 mr-2" /> Add Lesson
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <Reorder.Group axis="y" values={lessons} onReorder={setLessons} className="space-y-3">
              {lessons.map((lesson) => (
                <Reorder.Item key={lesson.id} value={lesson} className="relative">
                  <div className={`flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border transition-all ${isEditing === lesson.id ? 'border-emerald-500 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <div className={`p-2 rounded-md ${lesson.type === 'video' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'}`}>
                      {lesson.type === 'video' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{lesson.title}</h4>
                        {lesson.isLocked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> {lesson.completions} completions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs font-medium text-slate-500">{lesson.isLocked ? 'Locked' : 'Unlocked'}</span>
                        <Switch checked={!lesson.isLocked} onCheckedChange={() => toggleLock(lesson.id)} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(lesson.id)} className="text-slate-400 hover:text-emerald-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            {lessons.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Video className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No lessons yet</p>
                <p className="text-sm text-slate-400 mb-4">Add your first lesson to start building the curriculum</p>
                <Button onClick={() => setIsEditing('new')}><Plus className="h-4 w-4 mr-2" /> Add Lesson</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Panel */}
        {isEditing && (
          <Card className="lg:col-span-1 border-emerald-200 dark:border-emerald-800/50 shadow-md sticky top-6">
            <CardHeader className="flex flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 pb-4 border-b border-emerald-100 dark:border-emerald-900/50">
              <CardTitle className="text-lg text-emerald-800 dark:text-emerald-400">
                {isEditing === 'new' ? 'New Lesson' : 'Edit Lesson'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(null)} className="text-emerald-600 -mr-2">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson Title</label>
                <Input defaultValue={isEditing !== 'new' ? lessons.find(l => l.id === isEditing)?.title : ''} placeholder="e.g. Introduction to Hooks" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20 transition-all">
                    <input type="radio" name="type" className="hidden" defaultChecked={isEditing === 'new' || lessons.find(l => l.id === isEditing)?.type === 'video'} />
                    <Video className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Video</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20 transition-all">
                    <input type="radio" name="type" className="hidden" defaultChecked={isEditing !== 'new' && lessons.find(l => l.id === isEditing)?.type === 'document'} />
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Document</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Video URL / Upload</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center">
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <p className="text-xs font-medium mb-1">Click to upload video</p>
                  <p className="text-[10px] text-slate-500">MP4, WebM (Max 2GB)</p>
                </div>
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or embed</span>
                  </div>
                </div>
                <Input placeholder="YouTube or Vimeo URL" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input defaultValue={isEditing !== 'new' ? lessons.find(l => l.id === isEditing)?.duration : ''} placeholder="e.g. 15:00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">Drip Access <Lock className="h-3 w-3 text-slate-400"/></label>
                  <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950">
                    <option value="none">Available immediately</option>
                    <option value="days">After X days</option>
                    <option value="prereq">Requires previous</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium">Resources (Optional)</label>
                <Button variant="outline" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Attach File</Button>
              </div>

              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(null)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="h-4 w-4 mr-2"/> Save</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
