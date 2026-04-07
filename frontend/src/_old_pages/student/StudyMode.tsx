import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle, XCircle, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { mockExams, mockQuestions } from '../../data/mockData';

export default function StudyMode() {
  const { id } = useParams();
  const exam = mockExams.find((e) => e.id === id);
  const questions = mockQuestions.filter((q) => q.examId === id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

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
  const isCorrect =
    selectedAnswer !== null &&
    ((typeof currentQuestion.correctAnswer === 'number' &&
      selectedAnswer === currentQuestion.correctAnswer) ||
      (typeof currentQuestion.correctAnswer === 'string' &&
        selectedAnswer === currentQuestion.correctAnswer));

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link href=
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exams
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">{exam.name}</h1>
                <p className="text-gray-600">Study Mode</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-black mb-6">
              {currentQuestion.question}
            </h2>

            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!showFeedback) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left border-2 rounded-lg transition ${
                      selectedAnswer === index
                        ? showFeedback
                          ? index === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-primary bg-primary/5'
                        : showFeedback && index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-primary'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-black">{option}</span>
                      {showFeedback && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {showFeedback &&
                        selectedAnswer === index &&
                        index !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* True/False Options */}
            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['true', 'false'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      if (!showFeedback) {
                        setSelectedAnswer(option);
                      }
                    }}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left border-2 rounded-lg transition ${
                      selectedAnswer === option
                        ? showFeedback
                          ? option === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-primary bg-primary/5'
                        : showFeedback && option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-primary'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-black capitalize">{option}</span>
                      {showFeedback && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {showFeedback &&
                        selectedAnswer === option &&
                        option !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Feedback Section */}
            {showFeedback && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-black mb-2">
                      {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                    </h4>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {!showFeedback ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="flex-1 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex-1 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finished' : 'Next Question'}
                {currentQuestionIndex < questions.length - 1 && (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {currentQuestionIndex === questions.length - 1 && showFeedback && (
            <div className="mt-6 text-center">
              <Link href=
                className="inline-block px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition"
              >
                Back to Exams
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
