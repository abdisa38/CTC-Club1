import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, Clock, Trophy, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { mockGamingQuestions, GamingQuestion } from '../../data/mockData';

export default function AdminGamingQuestions() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['All', 'General Knowledge', 'Grade 8', 'Grade 12', 'CoC', 'Exit Exam'];

  const filteredQuestions = selectedCategory === 'All'
    ? mockGamingQuestions
    : mockGamingQuestions.filter(q => q.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="admin" />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Gaming Mode Questions</h1>
              <p className="text-gray-600">
                Manage questions for gaming mode with custom time limits and weights
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              Add Gaming Question
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-1">
                {mockGamingQuestions.length}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {mockGamingQuestions.filter(q => q.difficulty === 'Easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy Questions</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {mockGamingQuestions.filter(q => q.difficulty === 'Medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Questions</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {mockGamingQuestions.filter(q => q.difficulty === 'Hard').length}
              </div>
              <div className="text-sm text-gray-600">Hard Questions</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-black">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Weight
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Time Limit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-black line-clamp-2">
                            {question.question}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {question.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          question.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-800'
                            : question.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                          <Trophy className="w-4 h-4" />
                          {question.weight}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                          <Clock className="w-4 h-4" />
                          {question.timeLimit}s
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl mt-6">
              <p className="text-gray-600 text-lg">No questions found in this category.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Add First Question
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Question Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-6">Add Gaming Question</h2>
            <AddQuestionForm onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function AddQuestionForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState('General Knowledge');
  const [type, setType] = useState('multiple-choice');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [weight, setWeight] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [difficulty, setDifficulty] = useState('Easy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log('New gaming question:', {
      category,
      type,
      question,
      options,
      correctAnswer,
      explanation,
      weight,
      timeLimit,
      difficulty,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option>General Knowledge</option>
          <option>Grade 8</option>
          <option>Grade 12</option>
          <option>CoC</option>
          <option>Exit Exam</option>
        </select>
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Question Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
        </select>
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          required
        />
      </div>

      {/* Options (if multiple choice) */}
      {type === 'multiple-choice' && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correctAnswer === index}
                  onChange={() => setCorrectAnswer(index)}
                  className="w-4 h-4 text-primary"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Select the correct answer</p>
        </div>
      )}

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Weight (Points): {weight}
        </label>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Time Limit */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Time Limit (Seconds): {timeLimit}
        </label>
        <input
          type="range"
          min="15"
          max="120"
          step="15"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>15s</span>
          <span>60s</span>
          <span>120s</span>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Difficulty</label>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficulty(diff)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                difficulty === diff
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
        >
          Add Question
        </button>
      </div>
    </form>
  );
}