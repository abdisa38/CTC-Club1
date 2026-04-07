import { useState } from 'react';
import { Star, Send, MessageSquare, CheckCircle } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import AdBanner from '../../components/AdBanner';
import { mockFeedbackRatings, currentUser } from '../../data/mockData';

export default function StudentFeedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('Exam Quality');
  const [submitted, setSubmitted] = useState(false);

  // Get user's previous feedback
  const myFeedback = mockFeedbackRatings.filter(f => f.studentId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    console.log('Feedback submitted:', { rating, comment, category });
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setRating(0);
      setComment('');
      setCategory('Exam Quality');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Top Banner Ad */}
        <AdBanner position="top" />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-black">Feedback & Rating</h1>
          <p className="text-gray-600 mt-1">Help us improve by sharing your experience</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 text-lg mb-1">Thank You!</h3>
                  <p className="text-sm text-green-700">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Submit New Feedback</h2>
                  <p className="text-sm text-gray-600">Share your thoughts about our platform</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    How would you rate your experience?
                  </label>
                  <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700 mt-2">
                    {rating === 0 && 'Click to rate'}
                    {rating === 1 && '⭐ Poor'}
                    {rating === 2 && '⭐⭐ Fair'}
                    {rating === 3 && '⭐⭐⭐ Good'}
                    {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Feedback Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option>Exam Quality</option>
                    <option>Platform Usability</option>
                    <option>Gaming Mode</option>
                    <option>General</option>
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Your Comments
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={6}
                    placeholder="Tell us what you think... What did you like? What can we improve?"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Your feedback helps us make Ofijan better for everyone
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </button>
              </form>
            </div>

            {/* In-Content Ad */}
            <AdBanner position="in-content" />

            {/* My Previous Feedback */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-black">My Previous Feedback</h2>
                <p className="text-sm text-gray-600 mt-1">View your submitted feedback and admin responses</p>
              </div>

              {myFeedback.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {myFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {feedback.category}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
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
                              className={`w-4 h-4 ${
                                i < feedback.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{feedback.comment}</p>

                      {feedback.adminResponse && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Admin Response
                          </p>
                          <p className="text-sm text-blue-800">{feedback.adminResponse}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            Responded on {new Date(feedback.adminResponseAt!).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No previous feedback submitted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <AdBanner position="sidebar" />

            {/* Why Feedback Matters */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-black mb-3">Why Your Feedback Matters</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Helps us improve exam quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Influences new feature development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Creates a better learning experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>You'll receive admin responses</span>
                </li>
              </ul>
            </div>

            <AdBanner position="sidebar" />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-black mb-4">Feedback Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your Submissions</span>
                  <span className="text-lg font-bold text-primary">{myFeedback.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Admin Responses</span>
                  <span className="text-lg font-bold text-green-600">
                    {myFeedback.filter(f => f.adminResponse).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Rating Given</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {myFeedback.length > 0
                      ? (myFeedback.reduce((acc, f) => acc + f.rating, 0) / myFeedback.length).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}