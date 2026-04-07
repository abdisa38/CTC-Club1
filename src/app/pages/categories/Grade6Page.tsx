import { Link } from 'react-router';
import { ArrowLeft, Smile } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ExamCard from '../../components/ExamCard';
import { mockExams } from '../../data/mockData';

export default function Grade6Page() {
  const filteredExams = mockExams.filter((exam) => exam.category === 'Grade 6');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Smile className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Grade 6 Exams</h1>
                <p className="text-gray-600 mt-1">
                  Foundation exams for primary school students
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{filteredExams.length} exams</strong> available • Build a strong foundation with Grade 6 assessments
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
                No Grade 6 exams available yet.
              </p>
              <p className="text-sm text-gray-500">Check back soon!</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-black mb-4">About Grade 6 Exams</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Primary Education Assessment</h3>
                <p className="text-sm">
                  Grade 6 assessments focus on fundamental skills in Mathematics, English, 
                  Science, and other core subjects. These exams help identify areas for 
                  improvement and build confidence.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fun Learning Experience</h3>
                <p className="text-sm">
                  Our platform makes learning fun! Use Gaming Mode to earn points and badges 
                  while practicing for your exams. Study Mode helps you learn at your own pace.
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
