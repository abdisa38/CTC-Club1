import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, CheckCircle, Clock, BookOpen, ChevronRight, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

export function InstructorQuizzes() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const quizzes = [
    { id: "q1", title: "React Fundamentals", course: "Advanced React Patterns", questions: 15, avgScore: "85%", passRate: "92%", status: "active" },
    { id: "q2", title: "State Management", course: "Advanced React Patterns", questions: 10, avgScore: "72%", passRate: "68%", status: "active" },
    { id: "q3", title: "JavaScript Basics", course: "Full-Stack Web Development", questions: 20, avgScore: "--", passRate: "--", status: "draft" },
  ];

  const quizDetails = {
    id: "q1",
    title: "React Fundamentals",
    course: "Advanced React Patterns",
    questions: [
      {
        id: "q1_1",
        text: "Which hook is used to perform side effects in a function component?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correct: 1
      },
      {
        id: "q1_2",
        text: "What is the purpose of the 'key' prop in React lists?",
        options: ["To style elements", "To uniquely identify elements", "To trigger re-renders", "To bind events"],
        correct: 1
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quiz Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Create assessments and analyze student performance.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Quiz
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quiz List */}
        <div className={`lg:col-span-1 space-y-4 ${activeQuiz ? 'hidden lg:block' : 'block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search quizzes..." className="pl-9" />
          </div>

          <div className="space-y-3">
            {quizzes.map(quiz => (
              <div 
                key={quiz.id}
                onClick={() => setActiveQuiz(quiz.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${activeQuiz === quiz.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{quiz.title}</h4>
                  <Badge variant={quiz.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                    {quiz.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><BookOpen className="h-3 w-3" /> {quiz.course}</p>
                
                <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{quiz.questions} Qs</span>
                  <div className="flex gap-3">
                    <span title="Average Score">Avg: {quiz.avgScore}</span>
                    <span title="Pass Rate">Pass: {quiz.passRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Editor / Details */}
        <div className={`lg:col-span-2 ${!activeQuiz ? 'hidden lg:block' : 'block'}`}>
          {!activeQuiz ? (
            <Card className="h-[500px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <CheckCircle className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select a quiz to edit</h3>
              <p className="text-slate-500 mt-2">Or create a new one to start adding questions.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 cursor-pointer lg:hidden" onClick={() => setActiveQuiz(null)}>
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to quizzes
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{quizDetails.title}</CardTitle>
                      <CardDescription>{quizDetails.course}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" /> Edit Info</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-6">
                    <div>
                      <p className="text-xs text-slate-500">Total Questions</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{quizDetails.questions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Average Score</p>
                      <p className="text-lg font-semibold text-emerald-600">85%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pass Rate</p>
                      <p className="text-lg font-semibold text-emerald-600">92%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Questions</h3>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
                    </div>
                    
                    {quizDetails.questions.map((q, i) => (
                      <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 relative group">
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-emerald-600"><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                        
                        <p className="font-medium text-slate-900 dark:text-white pr-16"><span className="text-slate-400 mr-2">{i + 1}.</span> {q.text}</p>
                        <div className="space-y-2 pl-6">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-3 p-2 rounded-md text-sm border ${q.correct === optIdx ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-slate-50 border-transparent text-slate-600 dark:bg-slate-900 dark:text-slate-400'}`}>
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${q.correct === optIdx ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                {q.correct === optIdx && <Check className="h-2.5 w-2.5" />}
                              </div>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
