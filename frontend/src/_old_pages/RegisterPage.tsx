import { Link, useNavigate } from 'react-router';
import { Trophy, Mail, Lock, User, Phone, MessageCircle, CheckCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { getExamCountByCategory, getGamingQuestionCountByCategory } from '../data/mockData';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [showResourceCount, setShowResourceCount] = useState(false);

  const examCategories = [
    'General Knowledge',
    'Grade 6',
    'Grade 8',
    'Grade 12',
    'Mock Exam',
    'Exit Exam',
    'Model Exam',
    'CoC',
  ];

  const handleCategoryToggle = (category: string) => {
    if (preferredCategories.includes(category)) {
      setPreferredCategories(preferredCategories.filter(c => c !== category));
    } else {
      setPreferredCategories([...preferredCategories, category]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferredCategories.length === 0) {
      alert('Please select at least one exam category');
      return;
    }
    setShowResourceCount(true);
  };

  const handleFinalSubmit = () => {
    // In a real app, this would register with backend
    console.log('Registration data:', {
      name,
      email,
      password,
      phone,
      telegramId,
      preferredCategories,
    });
    navigate('/student/dashboard');
  };

  const getTotalResources = () => {
    let totalExams = 0;
    let totalGamingQuestions = 0;

    preferredCategories.forEach(category => {
      totalExams += getExamCountByCategory(category);
      totalGamingQuestions += getGamingQuestionCountByCategory(category);
    });

    return { totalExams, totalGamingQuestions };
  };

  const { totalExams, totalGamingQuestions } = getTotalResources();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Linkhref= className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Ofijan</span>
        </Link>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              2
            </div>
          </div>
          <div className="flex items-center justify-center gap-16 mt-2">
            <span className={`text-xs ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
              Basic Info
            </span>
            <span className={`text-xs ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
              Preferences
            </span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-black">Create Account</h1>
              <p className="text-center text-gray-600 mb-8">Start your learning journey today</p>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Abebe Kebede"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0912345678"
                      required
                    />
                  </div>
                </div>

                {/* Telegram ID */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Telegram Username
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="@your_telegram"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send you exam updates and notifications via Telegram
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Continue to Preferences
                </button>
              </form>
            </>
          )}

          {step === 2 && !showResourceCount && (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-black">Select Your Interests</h1>
              <p className="text-center text-gray-600 mb-8">
                Choose exam categories you want to focus on
              </p>

              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Exam Categories ({preferredCategories.length} selected)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {examCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`p-4 rounded-lg border-2 font-medium text-sm transition ${
                          preferredCategories.includes(category)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{category}</span>
                          {preferredCategories.includes(category) && (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Select at least one category to personalize your experience
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Why select categories?
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Get personalized exam recommendations</li>
                    <li>• Receive notifications for new content in your interests</li>
                    <li>• Track your progress by category</li>
                  </ul>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    Show Available Resources
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && showResourceCount && (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-black">
                Your Learning Resources
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Based on your selected categories
              </p>

              {/* Resource Count Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">{totalExams}</div>
                  <div className="text-blue-100 text-sm">
                    Exams Available
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">{totalGamingQuestions}</div>
                  <div className="text-purple-100 text-sm">
                    Gaming Questions
                  </div>
                </div>
              </div>

              {/* Selected Categories */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-black mb-3">Your Selected Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {preferredCategories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">
                      Great! You're all set
                    </p>
                    <p className="text-sm text-green-700">
                      We'll notify you via email and Telegram when new exams and resources 
                      are added to your selected categories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowResourceCount(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
                >
                  Edit Preferences
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Complete Registration
                </button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Linkhref= className="text-primary hover:text-red-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}