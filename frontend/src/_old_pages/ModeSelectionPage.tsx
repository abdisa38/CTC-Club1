import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, FileCheck, Gamepad2, Clock, FileText, Lock, Zap, Trophy, Target } from 'lucide-react';
import { mockExams } from '../data/mockData';

export default function ModeSelectionPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const exam = mockExams.find((e) => e.id === examId);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Exam Not Found</h2>
          <Link href= className="text-primary hover:underline">
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const modes = [
    {
      id: 'study',
      name: 'Study Mode',
      icon: BookOpen,
      color: 'blue',
      description: 'Learn at your own pace with instant feedback',
      features: [
        'See correct answers immediately',
        'Detailed explanations for each question',
        'No time pressure',
        'Track your progress',
      ],
      path: `/student/exam/${examId}/study`,
      available: true,
    },
    {
      id: 'test',
      name: 'Test Mode',
      icon: FileCheck,
      color: 'green',
      description: 'Simulate real exam conditions',
      features: [
        'Timed examination',
        'Results shown at the end',
        'Performance analytics',
        'Certificate upon completion',
      ],
      path: `/student/exam/${examId}/test`,
      available: true,
    },
    {
      id: 'gaming',
      name: 'Gaming Mode',
      icon: Gamepad2,
      color: 'red',
      description: 'Compete and earn rewards',
      features: [
        'Earn points and badges',
        'Compete on leaderboards',
        'Time-based scoring',
        'Unlock achievements',
      ],
      path: exam.isPremium ? `/student/payment/${examId}` : `/student/exam/${examId}/gaming`,
      available: exam.hasGamingMode,
      isPremium: exam.isPremium,
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      text: 'text-green-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      button: 'bg-primary hover:bg-red-700',
      text: 'text-red-600',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href=
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </Link>

        {/* Exam Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{exam.name}</h1>
          <p className="text-gray-600 mb-4">{exam.topic}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>{exam.totalQuestions} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{exam.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>{exam.category}</span>
            </div>
          </div>
        </div>

        {/* Mode Selection Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Choose Your Mode</h2>
          <p className="text-gray-600">Select how you want to take this exam</p>
        </div>

        {/* Modes Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {modes.map((mode) => {
            const colors = colorClasses[mode.color as keyof typeof colorClasses];
            const Icon = mode.icon;

            return (
              <div
                key={mode.id}
                className={`bg-white border-2 ${
                  mode.available ? colors.border : 'border-gray-200'
                } rounded-xl p-6 ${
                  mode.available ? 'hover:shadow-lg transition-all' : 'opacity-60'
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${colors.icon} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                  {mode.name}
                  {mode.isPremium && <Lock className="w-4 h-4 text-yellow-600" />}
                  {!mode.available && <span className="text-xs text-gray-500">(Coming Soon)</span>}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{mode.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Zap className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {mode.available ? (
                  <Link
                    to={mode.path}
                    className={`block w-full py-3 px-4 ${colors.button} text-white rounded-lg font-semibold text-center transition`}
                  >
                    {mode.isPremium ? 'Unlock Premium' : `Start ${mode.name}`}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-primary to-red-700 rounded-xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Pro Tip!</h3>
              <p className="text-white/90 text-sm mb-4">
                Start with <strong>Study Mode</strong> to learn the material, then use{' '}
                <strong>Test Mode</strong> to assess your knowledge. Once you're confident, 
                try <strong>Gaming Mode</strong> to compete with others and earn rewards!
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Learn First</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Then Test</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Finally Compete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
