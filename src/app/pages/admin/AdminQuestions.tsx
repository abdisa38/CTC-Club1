import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Image } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { mockQuestions, mockExams } from '../../data/mockData';

export default function AdminQuestions() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = mockQuestions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Questions Management</h1>
            <p className="text-gray-600">Create and manage exam questions</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition">
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search questions..."
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const exam = mockExams.find((e) => e.id === question.examId);
            return (
              <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {question.type}
                      </span>
                      <span className="text-sm text-gray-600">{exam?.name}</span>
                    </div>
                    <p className="font-semibold text-black mb-2">{question.question}</p>
                    {question.image && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <Image className="w-4 h-4" />
                        <span>Image attached</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {question.options && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          index === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="text-sm text-black">{option}</span>
                        {index === question.correctAnswer && (
                          <span className="ml-2 text-xs text-green-600 font-semibold">
                            ✓ Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Points:</strong> {question.points}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
