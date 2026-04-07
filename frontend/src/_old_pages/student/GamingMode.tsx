import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Trophy, Zap, Target, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../../components/Navbar';
import { mockExams, mockQuestions, mockLeaderboard } from '../../data/mockData';

export default function GamingMode() {
  const { id } = useParams();
  const exam = mockExams.find((e) => e.id === id);
  const questions = mockQuestions.filter((q) => q.examId === id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showFeedback && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, showFeedback, isGameOver]);

  if (!exam || questions.length === 0 || !exam.hasGamingMode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
        <Navbar isLoggedIn={true} userRole="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-white mb-4">
              {!exam?.hasGamingMode
                ? 'Gaming mode not available for this exam'
                : 'No questions available'}
            </p>
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

  const handleTimeUp = () => {
    setShowFeedback(true);
    setStreak(0);
    setTimeout(() => handleNext(), 2000);
  };

  const handleSelectAnswer = (answer: number | string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect =
      (typeof currentQuestion.correctAnswer === 'number' &&
        answer === currentQuestion.correctAnswer) ||
      (typeof currentQuestion.correctAnswer === 'string' &&
        answer === currentQuestion.correctAnswer);

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = streak * 10;
      const totalPoints = currentQuestion.points * 10 + timeBonus + streakBonus;
      setScore(score + totalPoints);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => handleNext(), 2000);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(20);
    } else {
      setIsGameOver(true);
    }
  };

  const isCorrect =
    selectedAnswer !== null &&
    ((typeof currentQuestion.correctAnswer === 'number' &&
      selectedAnswer === currentQuestion.correctAnswer) ||
      (typeof currentQuestion.correctAnswer === 'string' &&
        selectedAnswer === currentQuestion.correctAnswer));

  if (isGameOver) {
    const rank = mockLeaderboard.findIndex((entry) => score >= entry.points) + 1 || mockLeaderboard.length + 1;
    
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
        <Navbar isLoggedIn={true} userRole="student" />
        <main className="flex-1 py-8 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full mx-4"
          >
            <div className="bg-white rounded-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-3xl font-bold text-black mb-2">Game Over!</h1>
              <p className="text-gray-600 mb-8">Amazing performance! 🎉</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary to-red-700 rounded-xl p-6 text-white">
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm mb-1">Total Points</p>
                  <p className="text-3xl font-bold">{score.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-white">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm mb-1">Your Rank</p>
                  <p className="text-3xl font-bold">#{rank}</p>
                </div>
              </div>

              {/* Mini Leaderboard */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-black mb-4">Top Players</h3>
                <div className="space-y-2">
                  {mockLeaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{entry.badge}</span>
                        <div>
                          <p className="font-semibold text-black">{entry.name}</p>
                          <p className="text-sm text-gray-600">Rank #{entry.rank}</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">{entry.points.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold transition"
                >
                  Play Again
                </button>
                <Link href=
                  className="flex-1 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div>
                <Link href=
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Exams
                </Link>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{exam.name}</h1>
                    <p className="text-gray-400">Gaming Mode 🎮</p>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold">{score.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Timer and Progress */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    {streak > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        <Star className="w-4 h-4" />
                        {streak}x Streak
                      </motion.div>
                    )}
                    <motion.div
                      animate={{
                        scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
                        color: timeLeft <= 5 ? '#EF4444' : '#FFFFFF',
                      }}
                      transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
                      className="text-2xl font-bold text-white"
                    >
                      {timeLeft}s
                    </motion.div>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-yellow-400'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 20) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white rounded-xl p-8"
              >
                <h2 className="text-xl font-semibold text-black mb-6">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.type === 'multiple-choice' &&
                    currentQuestion.options &&
                    currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={showFeedback}
                        whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                        whileTap={{ scale: showFeedback ? 1 : 0.98 }}
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
                        <span className="text-black">{option}</span>
                      </motion.button>
                    ))}

                  {currentQuestion.type === 'true-false' &&
                    ['true', 'false'].map((option) => (
                      <motion.button
                        key={option}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={showFeedback}
                        whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                        whileTap={{ scale: showFeedback ? 1 : 0.98 }}
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
                        <span className="text-black capitalize">{option}</span>
                      </motion.button>
                    ))}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-lg ${
                      isCorrect
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <p className="font-semibold text-black mb-2">
                      {isCorrect ? '🎉 Correct! +' + (currentQuestion.points * 10 + Math.floor(timeLeft * 2)) + ' points' : '❌ Incorrect'}
                    </p>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Sidebar - Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 sticky top-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Live Leaderboard
                </h3>
                <div className="space-y-2">
                  {mockLeaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.badge}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {entry.name.split(' ')[0]}
                          </p>
                          <p className="text-xs text-gray-400">#{entry.rank}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-yellow-400">
                        {entry.points.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
