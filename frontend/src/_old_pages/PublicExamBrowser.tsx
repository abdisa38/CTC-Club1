import { useState } from 'react';
import { Link } from 'react-router';
import { Search, BookOpen, Clock, FileText, Lock, LogIn, UserPlus } from 'lucide-react';
import { mockExams } from '../data/mockData';
import AdBanner from '../components/AdBanner';

export default function PublicExamBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General Knowledge', 'Grade 6', 'Grade 8', 'Grade 12', 'Mock Exam', 'Exit Exam', 'Model Exam', 'CoC'];

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = exam.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
                         exam.topic?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
                         false;
    const matchesCategory = selectedCategory === 'All' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-black">Ofijan</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Banner Ad */}
        <AdBanner position="top" className="mb-8" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Browse Exams</h1>
          <p className="text-lg text-gray-600">
            Explore our comprehensive exam library. <Link to="/register" className="text-primary hover:underline">Sign up</Link> to start taking exams!
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Exam List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-black">{filteredExams.length}</span> exams
              </p>
            </div>

            {filteredExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExams.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                    {/* Exam Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-primary text-xs font-semibold rounded-full">
                          {exam.category}
                        </span>
                        {exam.isPremium && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-black mb-2">{exam.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.topic}</p>

                      {/* Exam Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{exam.totalQuestions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{exam.duration} min</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to="/register"
                          className="flex-1 py-2 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition"
                        >
                          Start Exam
                        </Link>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-primary hover:text-primary transition"
                          title="View Details"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Login Prompt */}
                    <div className="px-6 pb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-900">
                          <Link to="/login" className="font-semibold hover:underline">Login</Link> or{' '}
                          <Link to="/register" className="font-semibold hover:underline">Sign up</Link> to take this exam
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black mb-2">No exams found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* In-Content Ad */}
            <div className="mt-8">
              <AdBanner position="in-content" />
            </div>

            {/* Call to Action */}
            <div className="mt-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-3">Ready to Start Learning?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of students preparing for exams with Ofijan
              </p>
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-bold hover:bg-blue-50 transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Right Sidebar - Ads & Info */}
          <div className="space-y-6">
            <AdBanner position="sidebar" />

            {/* Platform Features */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-black mb-4">Why Choose Ofijan?</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Comprehensive exam preparation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Multiple exam modes (Study, Test, Gaming)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Track your progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Compete on leaderboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Instant results & feedback</span>
                </li>
              </ul>
            </div>

            <AdBanner position="sidebar" />

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-black mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total Exams</span>
                  <span className="text-xl font-bold text-primary">{mockExams.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Active Students</span>
                  <span className="text-xl font-bold text-primary">1,250+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Exams Taken</span>
                  <span className="text-xl font-bold text-primary">10,500+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}