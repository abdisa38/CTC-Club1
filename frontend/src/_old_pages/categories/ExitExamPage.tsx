import Link from "next/link";
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ExamCard from '../../components/ExamCard';
import { mockExams } from '../../data/mockData';

export default function ExitExamPage() {
  const filteredExams = mockExams.filter((exam) => exam.category === 'Exit Exam');

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
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Exit Exams</h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive exit exams for graduating students
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>{filteredExams.length} exams</strong> available • Exit exams are crucial for graduation
              </p>
            </div>
          </div>

          {/* Exams Grid */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-600 text-lg mb-4">
                No exit exams available yet.
              </p>
              <p className="text-sm text-gray-500">Check back soon!</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-black mb-4">About Exit Exams</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">What are Exit Exams?</h3>
                <p className="text-sm">
                  Exit exams are comprehensive assessments required for graduation. They test your 
                  understanding of all key subjects and determine your readiness for the next level.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Prepare Effectively</h3>
                <p className="text-sm">
                  Success in exit exams requires thorough preparation. Use our study materials, 
                  practice tests, and gaming mode to master all subjects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
