import { useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ExamCard from '../../components/ExamCard';
import AdSidebar from '../../components/AdSidebar';
import { mockExams } from '../../data/mockData';

export default function ExamsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Grade 6', 'Grade 8', 'Grade 12', 'Model Exam', 'Exit Exam', 'Mock Exam'];

  const filteredExams = mockExams.filter((exam) => {
    const matchesCategory = selectedCategory === 'All' || exam.category === selectedCategory;
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Browse Exams</h1>
            <p className="text-gray-600">Choose from our collection of exams</p>
          </div>

          {/* Main Content with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Search exams by name or topic..."
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-white text-black border border-gray-300 hover:border-primary'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="mb-4">
                <p className="text-gray-600">
                  Showing {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Exams Grid */}
              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No exams found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchTerm('');
                    }}
                    className="mt-4 px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
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