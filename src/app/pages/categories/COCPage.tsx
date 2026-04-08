import { Link } from 'react-router';
import { ArrowLeft, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ExamCard from '../../components/ExamCard';
import { mockExams } from '../../data/mockData';

export default function COCPage() {
  const filteredExams = mockExams.filter((exam) => 
    exam.topic.toLowerCase().includes('coc') || exam.name.toLowerCase().includes('coc')
  );

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
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">COC Exams</h1>
                <p className="text-gray-600 mt-1">
                  Certificate of Competence - Professional certification exams
                </p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>{filteredExams.length} exams</strong> available • Get certified with COC examination preparation
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
                No COC exams available yet.
              </p>
              <p className="text-sm text-gray-500">Check back soon!</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-black mb-4">About COC Certification</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">What is COC?</h3>
                <p className="text-sm">
                  Certificate of Competence (COC) is a professional certification that validates 
                  your skills and knowledge in specific vocational and technical fields. It's 
                  recognized by employers and institutions nationwide.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Certification Levels</h3>
                <p className="text-sm">
                  COC certifications are available at multiple levels (Level I-V) depending on 
                  your field. Each level requires passing a comprehensive examination that tests 
                  both theoretical knowledge and practical skills.
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
