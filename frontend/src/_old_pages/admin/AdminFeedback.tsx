import { useState } from 'react';
import { Star, MessageSquare, Filter, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { mockFeedbackRatings } from '../../data/mockData';

export default function AdminFeedback() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');
  const [responseModal, setResponseModal] = useState<string | null>(null);

  const categories = ['All', 'Exam Quality', 'Platform Usability', 'Gaming Mode', 'General'];
  const ratings = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  const filteredFeedback = mockFeedbackRatings.filter(feedback => {
    const matchesCategory = selectedCategory === 'All' || feedback.category === selectedCategory;
    const matchesRating = selectedRating === 'All' || 
      feedback.rating === parseInt(selectedRating.charAt(0));
    return matchesCategory && matchesRating;
  });

  const averageRating = mockFeedbackRatings.reduce((acc, f) => acc + f.rating, 0) / mockFeedbackRatings.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="admin" />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Feedback & Ratings</h1>
            <p className="text-gray-600">
              Monitor student feedback and improve platform quality
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-black mb-1">
                {mockFeedbackRatings.length}
              </div>
              <div className="text-sm text-gray-600">Total Feedback</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-3xl font-bold text-yellow-500">
                  {averageRating.toFixed(1)}
                </div>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {mockFeedbackRatings.filter(f => f.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Positive Reviews</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {mockFeedbackRatings.filter(f => f.adminResponse).length}
              </div>
              <div className="text-sm text-gray-600">Responded</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-black">Filters</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
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

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
                <div className="flex flex-wrap gap-2">
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        selectedRating === rating
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-black">{feedback.studentName}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {feedback.category}
                      </span>
                    </div>
                    {feedback.examName && (
                      <p className="text-sm text-gray-600">
                        Exam: <strong>{feedback.examName}</strong>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <p className="text-gray-700">{feedback.comment}</p>
                </div>

                {/* Admin Response */}
                {feedback.adminResponse ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Admin Response
                        </p>
                        <p className="text-sm text-green-800">{feedback.adminResponse}</p>
                        <p className="text-xs text-green-600 mt-2">
                          Responded on {new Date(feedback.adminResponseAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResponseModal(feedback.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Respond to Feedback
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-600 text-lg">No feedback found with selected filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Response Modal */}
      {responseModal && (
        <ResponseModal
          feedbackId={responseModal}
          onClose={() => setResponseModal(null)}
          onSubmit={(response) => {
            console.log('Admin response:', response);
            setResponseModal(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function ResponseModal({
  feedbackId,
  onClose,
  onSubmit,
}: {
  feedbackId: string;
  onClose: () => void;
  onSubmit: (response: string) => void;
}) {
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(response);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-black mb-6">Respond to Feedback</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Your Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={5}
              placeholder="Thank you for your feedback..."
              required
            />
          </div>

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
              Send Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
