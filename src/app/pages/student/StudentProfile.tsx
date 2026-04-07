import { useState } from 'react';
import { User, Mail, Phone, MessageCircle, BookOpen, Save, Edit2 } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import AdBanner from '../../components/AdBanner';
import { currentUser } from '../../data/mockData';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '0912345678',
    telegramId: '@abebe_k',
    preferredCategories: ['Grade 12', 'Exit Exam', 'General Knowledge'],
  });

  const allCategories = [
    'General Knowledge',
    'Grade 6',
    'Grade 8',
    'Grade 12',
    'Mock Exam',
    'Exit Exam',
    'Model Exam',
    'CoC',
  ];

  const handleCategoryToggle = (category: string) => {
    if (formData.preferredCategories.includes(category)) {
      setFormData({
        ...formData,
        preferredCategories: formData.preferredCategories.filter(c => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        preferredCategories: [...formData.preferredCategories, category],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated profile:', formData);
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Top Banner Ad */}
        <AdBanner position="top" />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  {/* Telegram ID */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Telegram Username
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.telegramId}
                        onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      We'll send you exam updates and notifications via Telegram
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Preferences */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-black">Exam Category Preferences</h2>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Select the exam categories you're interested in. You'll receive notifications about new content in these categories.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => isEditing && handleCategoryToggle(category)}
                      disabled={!isEditing}
                      className={`p-4 rounded-lg border-2 font-medium text-sm transition ${
                        formData.preferredCategories.includes(category)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                      } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>{formData.preferredCategories.length}</strong> categories selected
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <AdBanner position="sidebar" />

            {/* Account Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-black mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-semibold text-black">Jan 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Exams</span>
                  <span className="text-sm font-semibold text-black">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gaming Points</span>
                  <span className="text-sm font-semibold text-primary">1,250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Rank</span>
                  <span className="text-sm font-semibold text-purple-600">#12</span>
                </div>
              </div>
            </div>

            <AdBanner position="sidebar" />

            {/* Security Info */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-black mb-2">Account Security</h3>
              <p className="text-sm text-gray-700 mb-4">
                Your account is secure. Last login was today at 10:30 AM.
              </p>
              <button className="text-sm font-medium text-primary hover:underline">
                Change Password →
              </button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}