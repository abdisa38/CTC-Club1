import { useState } from "react";
import { Link, useNavigate, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, Plus, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [courseData, setCourseData] = useState({
    title: isEditing ? "Advanced React Patterns 2026" : "",
    description: isEditing ? "Master advanced React component patterns and state management." : "",
    category: isEditing ? "web" : "",
    level: isEditing ? "advanced" : "beginner",
    price: isEditing ? "99.99" : "0",
    outcomes: isEditing ? ["Build scalable React apps", "Implement advanced hooks"] : [""],
    requirements: isEditing ? ["Basic React knowledge"] : [""]
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate("/app/instructor/courses");
    }, 1000);
  };

  const addOutcome = () => setCourseData({...courseData, outcomes: [...courseData.outcomes, ""]});
  const updateOutcome = (index: number, val: string) => {
    const newOutcomes = [...courseData.outcomes];
    newOutcomes[index] = val;
    setCourseData({...courseData, outcomes: newOutcomes});
  };
  const removeOutcome = (index: number) => {
    const newOutcomes = courseData.outcomes.filter((_, i) => i !== index);
    setCourseData({...courseData, outcomes: newOutcomes});
  };

  const steps = [
    { num: 1, title: "Basic Info" },
    { num: 2, title: "Details" },
    { num: 3, title: "Curriculum" },
    { num: 4, title: "Pricing & Publish" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Fill in the details to publish your course.</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => navigate("/app/instructor/courses")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Course</>}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 transition-all -translate-y-1/2 -z-10" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
        <div className="flex justify-between">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(s.num)}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${step >= s.num ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-950 dark:border-slate-700'}`}>
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Start with a strong title and engaging description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <Input 
                  placeholder="e.g. The Complete Web Development Bootcamp" 
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                  className="max-w-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Description</label>
                <textarea 
                  className="w-full min-h-[150px] rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800"
                  placeholder="What will students learn in this course?"
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950"
                    value={courseData.category}
                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile App</option>
                    <option value="design">Design</option>
                    <option value="data">Data Science</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <select 
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950"
                    value={courseData.level}
                    onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Details & Media</CardTitle>
              <CardDescription>Add cover image and learning outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Thumbnail</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer max-w-xl">
                  <Upload className="h-10 w-10 text-slate-400 mb-4" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </div>

              <div className="space-y-4 max-w-2xl">
                <label className="text-sm font-medium flex items-center justify-between">
                  What will students learn?
                  <Button variant="ghost" size="sm" onClick={addOutcome} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    <Plus className="h-4 w-4 mr-1" /> Add Outcome
                  </Button>
                </label>
                {courseData.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input 
                      placeholder="e.g. Build 5 real-world applications" 
                      value={outcome}
                      onChange={(e) => updateOutcome(idx, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeOutcome(idx)} className="text-slate-400 hover:text-red-500 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Builder</CardTitle>
              <CardDescription>Organize your course into sections and lessons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Section 1: Introduction</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {[1, 2].map((lesson) => (
                    <div key={lesson} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 shadow-sm group">
                      <div className="cursor-move text-slate-400 hover:text-slate-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                      </div>
                      <span className="text-sm font-medium flex-1">Lesson {lesson}: Getting Started</span>
                      <Badge variant="outline" className="text-xs">Video</Badge>
                      <Badge variant="outline" className="text-xs">10:45</Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4 text-slate-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Lesson</Button>
              </div>

              <Button variant="outline" className="w-full border-dashed text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><Plus className="h-4 w-4 mr-2" /> Add Section</Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Publish</CardTitle>
              <CardDescription>Set a price and configure visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8"
                    value={courseData.price}
                    onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                  />
                </div>
                <p className="text-xs text-slate-500">Set to 0 for a free course.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white">Course Status</h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <input type="radio" name="status" className="mt-1" defaultChecked />
                    <div>
                      <span className="block font-medium text-slate-900 dark:text-white">Draft</span>
                      <span className="block text-sm text-slate-500">Keep the course private while you work on it.</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <input type="radio" name="status" className="mt-1" />
                    <div>
                      <span className="block font-medium text-slate-900 dark:text-white">Submit for Review</span>
                      <span className="block text-sm text-slate-500">Submit to admins for approval. Once approved, it will be public.</span>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {step < steps.length ? (
          <Button onClick={() => setStep(step + 1)} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSaving ? "Saving..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Publish Course</>}
          </Button>
        )}
      </div>
    </div>
  );
}
