import Link from "next/link";
import { ArrowLeft, BookOpen } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ExamCard from '../../components/ExamCard';
import AdSidebar from '../../components/AdSidebar';
import { mockExams } from '../../data/mockData';

export default function MockExamPage() {
  const filteredExams = mockExams.filter((exam) => exam.category === 'Mock Exam');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Mock Exams</h1>
                <p className="text-gray-600 mt-1">
                  Practice exams to test your knowledge and prepare for the real thing
                </p>
              </div>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-sm text-pink-800">
                <strong>{filteredExams.length} exams</strong> available • Mock exams simulate real exam conditions
              </p>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Exams Content */}
            <div className="lg:col-span-3">
              {/* Exams Grid */}
              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <p className="text-gray-600 text-lg mb-4">
                    No mock exams available yet.
                  </p>
                  <p className="text-sm text-gray-500">Check back soon!</p>
                </div>
              )}

              {/* Info Section */}
              <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-black mb-4">About Mock Exams</h2>
                <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                  <div>
                    <h3 className="font-semibold mb-2">What are Mock Exams?</h3>
                    <p className="text-sm">
                      Mock exams are practice tests designed to simulate the actual exam experience. 
                      They help you understand the exam format, time management, and question types.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Why Take Mock Exams?</h3>
                    <p className="text-sm">
                      Mock exams help reduce anxiety, identify weak areas, and build confidence. 
                      Regular practice with mock exams significantly improves your performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AdSidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}