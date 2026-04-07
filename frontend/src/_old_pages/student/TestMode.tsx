import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Clock, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { mockExams, mockQuestions } from '../../data/mockData';

export default function TestMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = mockExams.find((e) => e.id === id);
  const questions = mockQuestions.filter((q) => q.examId === id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number | string }>({});
  const [timeLeft, setTimeLeft] = useState(exam?.duration ? exam.duration * 60 : 0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} userRole="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">No questions available for this exam</p>
            <Link href=
              className="inline-block px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg transition"
            >
              Browse Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSelectAnswer = (answer: number | string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      incorrect: questions.length - correct,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const results = isSubmitted ? calculateResults() : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} userRole="student" />
        <main className="flex-1 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-black mb-2">Test Complete!</h1>
              <p className="text-gray-600 mb-8">Here are your results</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Score</p>
                  <p className="text-3xl font-bold text-black">{results.percentage}%</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Correct</p>
                  <p className="text-3xl font-bold text-green-600">{results.correct}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Incorrect</p>
                  <p className="text-3xl font-bold text-red-600">{results.incorrect}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold transition"
                >
                  Download Results
                </button>
                <Link href=
                  className="px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Back to Exams
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div>
                <Link href=
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Exams
                </Link>
                <h1 className="text-2xl font-bold text-black">{exam.name}</h1>
                <p className="text-gray-600">Test Mode</p>
              </div>

              {/* Timer */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-black">Time Remaining</span>
                  </div>
                  <span className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-black'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="mb-6">
                  <span className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <h2 className="text-xl font-semibold text-black mt-2">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition ${
                          answers[currentQuestionIndex] === index
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        <span className="text-black">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-3">
                    {['true', 'false'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition ${
                          answers[currentQuestionIndex] === option
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        <span className="text-black capitalize">{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar - Question Navigator */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
                <h3 className="font-semibold text-black mb-4">Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition ${
                        currentQuestionIndex === index
                          ? 'bg-primary text-white'
                          : answers[index] !== undefined
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded bg-gray-100" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
