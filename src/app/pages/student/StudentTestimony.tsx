import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Heart, Star } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import AdBanner from '../../components/AdBanner';
import { currentUser, mockTestimonies } from '../../data/mockData';

export default function StudentTestimony() {
  const [title, setTitle] = useState('');
  const [testimony, setTestimony] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [allowPublish, setAllowPublish] = useState(true);

  // Get user's previous testimonies
  const myTestimonies = mockTestimonies.filter(t => t.studentId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !testimony.trim()) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Testimony submitted:', { title, testimony, allowPublish });
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setTitle('');
      setTestimony('');
      setAllowPublish(true);
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
          <h1 className="text-3xl font-bold text-black">Share Your Testimony</h1>
          <p className="text-gray-600 mt-1">Tell others about your success story with Ofijan</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Testimony Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 text-lg mb-1">Thank You!</h3>
                  <p className="text-sm text-green-700">
                    Your testimony has been submitted successfully. It will be reviewed before publishing.
                  </p>
                </div>
              </div>
            )}

            {/* Testimony Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Submit Your Testimony</h2>
                  <p className="text-sm text-gray-600">Share how Ofijan helped you achieve your goals</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Testimony Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Improved My Exam Score by 30%"
                    required
                  />
                </div>

                {/* Testimony */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Your Story *
                  </label>
                  <textarea
                    value={testimony}
                    onChange={(e) => setTestimony(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={8}
                    placeholder="Share your experience... How did Ofijan help you? What results did you achieve? What do you like most about the platform?"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be specific about your experience and achievements
                  </p>
                </div>

                {/* Allow Publishing Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="allowPublish"
                    checked={allowPublish}
                    onChange={(e) => setAllowPublish(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="allowPublish" className="text-sm text-gray-700 flex-1">
                    <span className="font-semibold text-black">Allow Ofijan to publish my testimony</span>
                    <span className="block text-gray-600 mt-1">
                      Your testimony may be featured on our website and marketing materials to inspire other students.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Testimony
                </button>
              </form>
            </div>

            {/* In-Content Ad */}
            <AdBanner position="in-content" />

            {/* My Previous Testimonies */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-black">My Testimonies</h2>
                <p className="text-sm text-gray-600 mt-1">View your submitted testimonies and their status</p>
              </div>

              {myTestimonies.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {myTestimonies.map((testimony) => (
                    <div key={testimony.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-black text-lg">{testimony.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted on {new Date(testimony.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          testimony.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : testimony.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {testimony.status.charAt(0).toUpperCase() + testimony.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{testimony.testimony}</p>

                      {testimony.isPublished && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-800">
                            This testimony is published and visible to the public
                          </p>
                        </div>
                      )}

                      {testimony.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Admin Note
                          </p>
                          <p className="text-sm text-blue-800">{testimony.adminNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No testimonies submitted yet</p>
                  <p className="text-sm text-gray-500 mt-1">Share your success story above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <AdBanner position="sidebar" />

            {/* Tips for Great Testimony */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-black mb-3">Tips for a Great Testimony</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Be specific about your achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Mention specific features you used</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Share measurable results if possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Be honest and authentic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Keep it positive and constructive</span>
                </li>
              </ul>
            </div>

            <AdBanner position="sidebar" />

            {/* Sample Testimony */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-black mb-3">Sample Testimony</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-black text-sm mb-2">
                  From Grade 8 to University Success
                </h4>
                <p className="text-sm text-gray-700">
                  "I started using Ofijan in Grade 8, and it completely transformed my study habits. 
                  The gaming mode made learning fun, and I improved my exam scores by 35%. 
                  Thanks to Ofijan, I aced my Exit Exam and got into my dream university!"
                </p>
                <p className="text-xs text-gray-500 mt-2">- Abebe K., Grade 12 Graduate</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-black mb-4">Your Testimony Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Submitted</span>
                  <span className="text-lg font-bold text-primary">{myTestimonies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="text-lg font-bold text-green-600">
                    {myTestimonies.filter(t => t.isPublished).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Review</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {myTestimonies.filter(t => t.status === 'pending').length}
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