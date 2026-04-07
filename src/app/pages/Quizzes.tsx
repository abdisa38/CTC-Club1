import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import { Clock, HelpCircle, CheckCircle2, ChevronRight, RotateCcw, Award } from "lucide-react";

type QuizState = 'list' | 'taking' | 'results';

export function Quizzes() {
  const [view, setView] = useState<QuizState>('list');
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  // Mock data
  const quizzes = [
    { id: 1, title: "React Fundamentals", module: "Module 2", questions: 10, duration: "10 mins", score: null, status: "available" },
    { id: 2, title: "CSS Layouts (Flexbox & Grid)", module: "Module 1", questions: 15, duration: "15 mins", score: 95, status: "completed" },
    { id: 3, title: "Advanced Node.js Patterns", module: "Module 5", questions: 20, duration: "25 mins", score: null, status: "locked" },
  ];

  const currentQuizData = {
    title: "React Fundamentals",
    questions: [
      { id: 1, text: "What hook is used to manage local state in functional components?", options: ["useEffect", "useState", "useContext", "useReducer"], correct: 1 },
      { id: 2, text: "Which method is used to pass data deeply through the component tree without passing props down manually at every level?", options: ["Context API", "Redux", "Prop drilling", "Portals"], correct: 0 },
      { id: 3, text: "What is the virtual DOM?", options: ["A direct copy of the real DOM", "A lightweight copy of the real DOM kept in memory", "A React native plugin", "A browser API"], correct: 1 },
    ]
  };

  useEffect(() => {
    let timer: any;
    if (view === 'taking' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && view === 'taking') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('taking');
      setTimeLeft(600);
      setActiveQuestion(0);
      setSelectedAnswers({});
    }, 1000);
  };

  const handleSelect = (optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [activeQuestion]: optionIdx });
  };

  const handleNext = () => {
    if (activeQuestion < currentQuizData.questions.length - 1) {
      setActiveQuestion(q => q + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('results');
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card><CardContent className="p-12"><Skeleton className="h-32 w-full mb-6" /><Skeleton className="h-12 w-1/2" /></CardContent></Card>
      </div>
    );
  }

  if (view === 'taking') {
    const q = currentQuizData.questions[activeQuestion];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentQuizData.title}</h2>
          <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
            <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
          </div>
        </div>

        <Progress value={((activeQuestion) / currentQuizData.questions.length) * 100} className="h-2" />

        <Card className="border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8 sm:p-12">
            <Badge variant="outline" className="mb-6">Question {activeQuestion + 1} of {currentQuizData.questions.length}</Badge>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-8 leading-relaxed">
              {q.text}
            </h3>
            
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    selectedAnswers[activeQuestion] === idx 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-medium">{opt}</span>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[activeQuestion] === idx ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {selectedAnswers[activeQuestion] === idx && <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setActiveQuestion(q => Math.max(0, q - 1))} disabled={activeQuestion === 0}>
            Previous
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={selectedAnswers[activeQuestion] === undefined}
            className="px-8"
          >
            {activeQuestion === currentQuizData.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    // Calculate score
    const correctAnswers = currentQuizData.questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correct ? 1 : 0);
    }, 0);
    const scorePct = Math.round((correctAnswers / currentQuizData.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
            <Award className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h2>
          <p className="text-lg text-slate-500">You scored <strong className="text-indigo-600">{scorePct}%</strong></p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuizData.questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correct;
              return (
                <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50'}`}>
                  <div className="flex gap-3">
                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <HelpCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">{q.text}</p>
                      <p className="text-sm">
                        <span className="text-slate-500">Your answer: </span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600 line-through'}`}>{q.options[selectedAnswers[idx]]}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm mt-1">
                          <span className="text-slate-500">Correct answer: </span>
                          <span className="font-semibold text-emerald-600">{q.options[q.correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setView('list')}>Back to Quizzes</Button>
          <Button onClick={handleStart}><RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz</Button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Knowledge Checks</h1>
        <p className="text-slate-500 dark:text-slate-400">Test your understanding of the course material.</p>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className={`transition-all ${quiz.status === 'locked' ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : 'hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-800'}`}>
            <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={quiz.status === 'completed' ? 'success' : quiz.status === 'locked' ? 'secondary' : 'default'} className="text-[10px] uppercase">
                    {quiz.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">{quiz.module}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {quiz.questions} Questions</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {quiz.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {quiz.score !== null && (
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">Best Score</span>
                    <span className="text-lg font-bold text-emerald-500">{quiz.score}%</span>
                  </div>
                )}
                <Button 
                  onClick={handleStart} 
                  disabled={quiz.status === 'locked'}
                  variant={quiz.status === 'completed' ? 'outline' : 'default'}
                >
                  {quiz.status === 'completed' ? 'Retake' : quiz.status === 'locked' ? 'Locked' : 'Start Quiz'}
                  {quiz.status !== 'locked' && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
