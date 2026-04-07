import { Link } from 'react-router';
import { Trophy, BookOpen, Zap, Users, Star } from 'lucide-react';
import ExamCard from '../components/ExamCard';
import { mockExams } from '../data/mockData';

export default function LandingPage() {
  const featuredExams = mockExams.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary rounded-full text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>Modern Gamified Learning Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              Learn. Test. <span className="text-primary">Compete.</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Master your exams with interactive study modes, real-time testing, and competitive gaming features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary hover:bg-blue-700 rounded-lg text-lg font-semibold transition"
              >
                Get Started Free
              </Link>
              <Link
                to="/exams"
                className="px-8 py-4 bg-white hover:bg-gray-100 text-black rounded-lg text-lg font-semibold transition"
              >
                Browse Exams
              </Link>
            </div>
            
            <p className="text-sm text-gray-400 pt-2">
              No registration required to browse exams
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Why Choose Ofijan?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Study Mode</h3>
              <p className="text-gray-600">
                Learn at your own pace with immediate feedback and detailed explanations for every question.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Test Mode</h3>
              <p className="text-gray-600">
                Experience real exam conditions with timed tests and comprehensive result analysis.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Gaming Mode</h3>
              <p className="text-gray-600">
                Compete with peers, earn points, climb the leaderboard, and unlock achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-black">Exam Categories</h2>
          <p className="text-center text-gray-600 mb-12">Choose from various exam types tailored to your needs</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Grade 6', 'Grade 8', 'Grade 12', 'Model Exams', 'Exit Exams', 'Mock Exams'].map((category) => (
              <div
                key={category}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition cursor-pointer"
              >
                <h4 className="font-semibold text-black">{category}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-black">Featured Exams</h2>
          <p className="text-center text-gray-600 mb-12">Popular exams to get you started</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} showActions={false} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              View All Exams
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">What Students Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Abebe Kebede',
                rating: 5,
                text: 'Ofijan helped me ace my Grade 12 exams! The gaming mode made studying fun and competitive.',
              },
              {
                name: 'Tigist Haile',
                rating: 5,
                text: 'Best exam preparation platform I\'ve used. The study mode with instant feedback is incredibly helpful.',
              },
              {
                name: 'Dawit Teklu',
                rating: 4,
                text: 'Great platform with comprehensive questions. The leaderboard feature keeps me motivated!',
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.text}</p>
                <p className="font-semibold text-black">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300">
            Join thousands of students already improving their grades with Ofijan.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-primary hover:bg-red-700 rounded-lg text-lg font-semibold transition"
          >
            Register Now - It's Free!
          </Link>
        </div>
      </section>
    </div>
  );
}