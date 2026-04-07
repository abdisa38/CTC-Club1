import { useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Bell, Save, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { mockScholarshipPreferences, currentUser, ScholarshipPreference } from '../../data/mockData';

export default function ScholarshipPreferences() {
  const existingPreference = mockScholarshipPreferences.find(
    p => p.studentId === currentUser.id
  );

  const [formData, setFormData] = useState<Partial<ScholarshipPreference>>({
    categories: existingPreference?.categories || [],
    countries: existingPreference?.countries || [],
    fieldsOfStudy: existingPreference?.fieldsOfStudy || [],
    notificationEnabled: existingPreference?.notificationEnabled ?? true,
    emailNotification: existingPreference?.emailNotification ?? true,
    smsNotification: existingPreference?.smsNotification ?? false,
  });

  const [saved, setSaved] = useState(false);

  const categoryOptions = ['Undergraduate', 'Graduate', 'PhD', 'High School', 'Research'];
  
  const countryOptions = [
    'Ethiopia',
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'Australia',
    'Multiple Countries',
    'Pan-African',
    'Any Country',
  ];

  const fieldOptions = [
    'Engineering',
    'Computer Science',
    'STEM',
    'Medicine',
    'Business Administration',
    'Social Sciences',
    'Arts & Humanities',
    'Law',
    'Education',
    'Agriculture',
    'Natural Sciences',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Any Field',
  ];

  const handleCategoryToggle = (category: string) => {
    const current = formData.categories || [];
    if (current.includes(category)) {
      setFormData({
        ...formData,
        categories: current.filter(c => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...current, category],
      });
    }
  };

  const handleCountryToggle = (country: string) => {
    const current = formData.countries || [];
    if (current.includes(country)) {
      setFormData({
        ...formData,
        countries: current.filter(c => c !== country),
      });
    } else {
      setFormData({
        ...formData,
        countries: [...current, country],
      });
    }
  };

  const handleFieldToggle = (field: string) => {
    const current = formData.fieldsOfStudy || [];
    if (current.includes(field)) {
      setFormData({
        ...formData,
        fieldsOfStudy: current.filter(f => f !== field),
      });
    } else {
      setFormData({
        ...formData,
        fieldsOfStudy: [...current, field],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log('Saving preferences:', formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link href=
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scholarships
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-700 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Scholarship Preferences</h1>
                <p className="text-gray-600">
                  Set your preferences and get notified about matching scholarships
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Preferences Saved!</p>
                <p className="text-sm text-green-700">
                  You'll receive notifications when matching scholarships are posted.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-black">Enable Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive alerts when scholarships match your preferences
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, notificationEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-black">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send updates to {currentUser.email}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotification}
                      onChange={(e) =>
                        setFormData({ ...formData, emailNotification: e.target.checked })
                      }
                      className="sr-only peer"
                      disabled={!formData.notificationEnabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-black">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Get instant alerts via text message</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsNotification}
                      onChange={(e) =>
                        setFormData({ ...formData, smsNotification: e.target.checked })
                      }
                      className="sr-only peer"
                      disabled={!formData.notificationEnabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Scholarship Categories */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-2">Scholarship Level</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select the education levels you're interested in
              </p>

              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      formData.categories?.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-2">Preferred Countries</h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose countries where you'd like to study
              </p>

              <div className="flex flex-wrap gap-2">
                {countryOptions.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleCountryToggle(country)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      formData.countries?.includes(country)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields of Study */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-2">Fields of Study</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select your areas of academic interest
              </p>

              <div className="flex flex-wrap gap-2">
                {fieldOptions.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleFieldToggle(field)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      formData.fieldsOfStudy?.includes(field)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• We'll match new scholarships against your preferences</li>
                <li>• You'll receive notifications via your selected channels</li>
                <li>• Update your preferences anytime to refine matches</li>
                <li>• The more specific your preferences, the better the matches</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-4 px-6 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
              <Link href=
                className="py-4 px-6 bg-gray-200 hover:bg-gray-300 text-black rounded-xl font-semibold text-lg transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
