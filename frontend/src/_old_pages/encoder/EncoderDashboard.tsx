import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { mockQuestions, mockExams } from '../../data/mockData';

export default function EncoderDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ofijan - Data Encoder</h1>
              <p className="text-gray-400 text-sm">Question Management Portal</p>
            </div>
            <button className="px-4 py-2 bg-primary hover:bg-red-700 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Questions Created</p>
            <p className="text-3xl font-bold text-black">{mockQuestions.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-600">2</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {mockQuestions.length - 2}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Your Questions</h2>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition">
            <Plus className="w-5 h-5" />
            Create Question
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {mockQuestions.map((question) => {
            const exam = mockExams.find((e) => e.id === question.examId);
            return (
              <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {question.type}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Approved
                      </span>
                      <span className="text-sm text-gray-600">{exam?.name}</span>
                    </div>
                    <p className="font-semibold text-black">{question.question}</p>
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
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-sm ${
                          index === question.correctAnswer
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
