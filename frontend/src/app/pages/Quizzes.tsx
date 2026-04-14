import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import { Clock, HelpCircle, CheckCircle2, ChevronRight, RotateCcw, Award } from "lucide-react";
import apiService from "../services/api";

type QuizState = 'list' | 'taking' | 'results';

export function Quizzes() {
  const [view, setView] = useState<QuizState>('list');
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await apiService.getQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const handleStart = async (quizId: string) => {
    setLoading(true);
    try {
      const data = await apiService.getQuizById(quizId);
      setCurrentQuizData(data);
      setTimeLeft(data.timeLimit ? data.timeLimit * 60 : 600);
      setActiveQuestion(0);
      setSelectedAnswers({});
      setView('taking');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async () => {
    if (!currentQuizData) return;

    setLoading(true);
    try {
      const answersOutput = currentQuizData.questions.map((q: any, i: number) => ({
        questionId: q._id,
        userAnswerIndex: selectedAnswers[i]
      }));
      const timeSpent = (currentQuizData.timeLimit ? currentQuizData.timeLimit * 60 : 600) - timeLeft;

      const data = await apiService.submitQuiz(currentQuizData._id, {
        answers: answersOutput,
        timeSpent
      });
      
      setQuizResult(data);
      setView('results');
    } catch (error) {
      console.error(error);
      setView('list');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading && view === 'list') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card><CardContent className="p-12"><Skeleton className="h-32 w-full mb-6" /><Skeleton className="h-12 w-1/2" /></CardContent></Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="p-12 text-center"><h3>Loading...</h3></CardContent></Card>
      </div>
    );
  }

  if (view === 'taking' && currentQuizData) {
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
              {q.questionText || q.text}
            </h3>
            
            <div className="space-y-3">
              {q.options?.map((opt: string, idx: number) => (
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

  if (view === 'results' && currentQuizData && quizResult) {
    const scorePct = quizResult.totalPoints
      ? Math.round((quizResult.score / quizResult.totalPoints) * 100)
      : Math.round(quizResult.percentage || 0);

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
            <Award className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h2>
          <p className="text-lg text-slate-500">You scored <strong className="text-indigo-600">{scorePct}%</strong></p>
          {quizResult.xpEarned > 0 && <p className="text-md text-purple-600 font-bold">+{quizResult.xpEarned} XP Earned!</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuizData.questions.map((q: any, idx: number) => {
              const isCorrect = quizResult.answers[idx]?.isCorrect;
              return (
                <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50'}`}>
                  <div className="flex gap-3">
                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <HelpCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">{q.questionText}</p>
                      <p className="text-sm">
                        <span className="text-slate-500">Your answer: </span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600 line-through'}`}>{q.options ? q.options[selectedAnswers[idx] as number] : selectedAnswers[idx]}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm mt-1">
                          <span className="text-slate-500">Correct answer: </span>
                          <span className="font-semibold text-emerald-600">{q.options[q.correctAnswerIndex]}</span>
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
          <Button variant="outline" onClick={() => { setView('list'); fetchQuizzes(); }}>Back to Quizzes</Button>
          <Button onClick={() => handleStart(currentQuizData._id)}><RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz</Button>
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

      {quizzes.length === 0 && !loading && (
          <p className="text-slate-500">No quizzes available.</p>
      )}

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className={`transition-all hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-800`}>
            <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={quiz.isPublished ? 'outline' : 'secondary'} className="text-[10px] uppercase">
                    {quiz.isPublished ? 'Available' : 'Draft'}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">{quiz.course?.title}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {quiz.questions?.length || 0} Questions</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {quiz.timeLimit || 'No limit'} mins</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <Button onClick={() => handleStart(quiz._id)} >
                  Start Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
