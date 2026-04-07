import { useState } from 'react';
import Link from "next/link";
import { 
  Calendar, MapPin, DollarSign, CheckCircle, ExternalLink, Filter, Bell, Settings,
  Search, SlidersHorizontal, Bookmark, BookmarkCheck, Clock, TrendingUp, X, Eye,
  Globe, GraduationCap, ArrowUpDown, ChevronDown, Heart, Share2
} from 'lucide-react';
import { mockScholarships, Scholarship, getUnreadScholarshipCount, currentUser, mockScholarshipNotifications } from '../data/mockData';

type SortOption = 'deadline' | 'amount' | 'newest' | 'relevant';
type ViewMode = 'grid' | 'list';

export default function ScholarshipPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedDeadline, setSelectedDeadline] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [savedScholarships, setSavedScholarships] = useState<string[]>(['1', '3']); // Mock saved IDs
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  const unreadCount = getUnreadScholarshipCount(currentUser.id);
  
  const categories = ['All', 'Undergraduate', 'Graduate', 'PhD', 'High School', 'Research'];
  const countries = ['All', 'Ethiopia', 'USA', 'UK', 'Canada', 'Germany', 'China', 'Australia'];
  const deadlineOptions = [
    { label: 'All', value: 'All' },
    { label: 'This Week', value: '7' },
    { label: 'This Month', value: '30' },
    { label: 'Next 3 Months', value: '90' },
    { label: 'Next 6 Months', value: '180' },
  ];

  const isDeadlineNear = (deadline: string) => {
    const today = new Date('2026-03-02');
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date('2026-03-02');
    const deadlineDate = new Date(deadline);
    return Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const toggleSaveScholarship = (id: string) => {
    setSavedScholarships(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Get scholarships with notifications
  const notifiedScholarshipIds = mockScholarshipNotifications
    .filter(n => n.studentId === currentUser.id && !n.isRead)
    .map(n => n.scholarshipId);

  // Filter scholarships
  let filteredScholarships = mockScholarships.filter((scholarship) => {
    // Category filter
    const matchesCategory = selectedCategory === 'All' || scholarship.category === selectedCategory;
    
    // Country filter
    const matchesCountry = selectedCountry === 'All' || scholarship.country === selectedCountry;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scholarship.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Deadline filter
    let matchesDeadline = true;
    if (selectedDeadline !== 'All') {
      const daysUntil = getDaysUntilDeadline(scholarship.deadline);
      matchesDeadline = daysUntil <= parseInt(selectedDeadline) && daysUntil >= 0;
    }
    
    return matchesCategory && matchesCountry && matchesSearch && matchesDeadline;
  });

  // Sort scholarships
  filteredScholarships = [...filteredScholarships].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'amount':
        const getAmount = (amountStr: string) => {
          const match = amountStr.match(/[\d,]+/);
          return match ? parseInt(match[0].replace(/,/g, '')) : 0;
        };
        return getAmount(b.amount) - getAmount(a.amount);
      case 'newest':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      case 'relevant':
        // Prioritize notified scholarships
        const aNotified = notifiedScholarshipIds.includes(a.id);
        const bNotified = notifiedScholarshipIds.includes(b.id);
        if (aNotified && !bNotified) return -1;
        if (!aNotified && bNotified) return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return 0;
    }
  });

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedCountry !== 'All' ? 1 : 0) +
    (selectedDeadline !== 'All' ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Preferences Button */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Scholarship Opportunities</h1>
              <p className="text-gray-600 text-lg">
                Discover {mockScholarships.length}+ funding opportunities to support your educational journey
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSavedScholarships([])}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 hover:border-primary text-gray-700 rounded-xl font-semibold transition"
              >
                <BookmarkCheck className="w-5 h-5" />
                <span className="hidden sm:inline">Saved</span>
                {savedScholarships.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {savedScholarships.length}
                  </span>
                )}
              </button>
              <Linkhref=
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white rounded-xl font-semibold transition shadow-lg"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Preferences</span>
                {unreadCount > 0 && (
                  <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Notification Banner */}
          {unreadCount > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary animate-pulse" />
                <div className="flex-1">
                  <p className="font-semibold text-black">
                    🎉 {unreadCount} New Matching {unreadCount === 1 ? 'Scholarship' : 'Scholarships'}!
                  </p>
                  <p className="text-sm text-gray-700">
                    We found scholarships that match your preferences. Check them out below (marked with 🔔).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-1">{mockScholarships.length}</div>
              <div className="text-blue-100 text-sm">Total Scholarships</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 opacity-80" />
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {mockScholarships.filter(s => isDeadlineNear(s.deadline)).length}
              </div>
              <div className="text-green-100 text-sm">Closing Soon</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-8 h-8 opacity-80" />
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {mockScholarships.filter(s => s.country === 'Ethiopia').length}
              </div>
              <div className="text-purple-100 text-sm">Local Opportunities</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 opacity-80" />
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-1">{savedScholarships.length}</div>
              <div className="text-orange-100 text-sm">Saved Scholarships</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarships by title, organization, or keywords..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-black">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedCountry('All');
                        setSelectedDeadline('All');
                        setSearchQuery('');
                      }}
                      className="text-sm text-primary hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    {showFilters ? 'Hide' : 'Show'} Filters
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                          selectedCategory === category
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country & Deadline Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                    <select
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    >
                      {deadlineOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="deadline">Deadline (Soonest)</option>
                  <option value="amount">Amount (Highest)</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-black">{filteredScholarships.length}</span> {filteredScholarships.length === 1 ? 'scholarship' : 'scholarships'}
              </div>
            </div>
          </div>

          {/* Scholarships Grid */}
          {filteredScholarships.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredScholarships.map((scholarship) => (
                <ScholarshipCard 
                  key={scholarship.id} 
                  scholarship={scholarship}
                  isNotified={notifiedScholarshipIds.includes(scholarship.id)}
                  isSaved={savedScholarships.includes(scholarship.id)}
                  onToggleSave={toggleSaveScholarship}
                  onViewDetails={setSelectedScholarship}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-xl">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No scholarships found</p>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCountry('All');
                  setSelectedDeadline('All');
                  setSearchQuery('');
                }}
                className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-12 bg-gradient-to-br from-primary to-blue-700 rounded-xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-7 h-7" />
              Scholarship Application Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  Before You Apply
                </h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li>• Read all eligibility requirements carefully</li>
                  <li>• Prepare required documents in advance</li>
                  <li>• Check deadlines and mark your calendar</li>
                  <li>• Research the organization thoroughly</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  Application Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li>• Start early - don't wait until the deadline</li>
                  <li>• Tailor your essays to each scholarship</li>
                  <li>• Get strong recommendation letters</li>
                  <li>• Proofread everything multiple times</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  After Submission
                </h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li>• Keep track of all your applications</li>
                  <li>• Follow up with the organization</li>
                  <li>• Prepare for potential interviews</li>
                  <li>• Apply to multiple scholarships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scholarship Detail Modal */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
          isSaved={savedScholarships.includes(selectedScholarship.id)}
          onToggleSave={toggleSaveScholarship}
        />
      )}
    </div>
  );
}

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isNotified: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onViewDetails: (scholarship: Scholarship) => void;
  viewMode: ViewMode;
}

function ScholarshipCard({ scholarship, isNotified, isSaved, onToggleSave, onViewDetails, viewMode }: ScholarshipCardProps) {
  const isDeadlineNear = (deadline: string) => {
    const today = new Date('2026-03-02');
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date('2026-03-02');
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'Expired';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return '1 day';
    if (daysUntil < 7) return `${daysUntil} days`;
    if (daysUntil < 30) return `${Math.floor(daysUntil / 7)} weeks`;
    return `${Math.floor(daysUntil / 30)} months`;
  };

  const deadlineNear = isDeadlineNear(scholarship.deadline);
  const daysLeft = getDaysUntilDeadline(scholarship.deadline);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={scholarship.imageUrl}
          alt={scholarship.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg">
              {scholarship.category}
            </span>
            {deadlineNear && (
              <span className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-semibold rounded-full shadow-lg">
                ⏰ {daysLeft} left
              </span>
            )}
            {isNotified && (
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg animate-pulse">
                🔔 New Match
              </span>
            )}
          </div>
          
          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(scholarship.id);
            }}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Organization Logo Placeholder */}
        <div className="absolute bottom-4 left-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition line-clamp-2">
          {scholarship.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
          <Globe className="w-4 h-4" />
          {scholarship.organization}
        </p>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{scholarship.description}</p>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-bold text-gray-900">{scholarship.amount.split(' ')[0]}</p>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <Calendar className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Deadline</p>
            <p className="text-sm font-bold text-gray-900">
              {new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="text-center">
            <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Country</p>
            <p className="text-sm font-bold text-gray-900">{scholarship.country}</p>
          </div>
        </div>

        {/* Eligibility Preview */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Requirements:</p>
          <ul className="space-y-1">
            {scholarship.eligibility.slice(0, 2).map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{req}</span>
              </li>
            ))}
          </ul>
          {scholarship.eligibility.length > 2 && (
            <button
              onClick={() => onViewDetails(scholarship)}
              className="text-xs text-primary hover:text-blue-700 font-medium mt-1 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View all requirements
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={scholarship.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => onViewDetails(scholarship)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Posted {new Date(scholarship.postedDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

interface ScholarshipDetailModalProps {
  scholarship: Scholarship;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

function ScholarshipDetailModal({ scholarship, onClose, isSaved, onToggleSave }: ScholarshipDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header Image */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <img
            src={scholarship.imageUrl}
            alt={scholarship.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                {scholarship.category}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{scholarship.title}</h2>
            <p className="text-white/90 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {scholarship.organization}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scholarship Amount</p>
                <p className="font-bold text-gray-900">{scholarship.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-bold text-gray-900">
                  {new Date(scholarship.deadline).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Study Location</p>
                <p className="font-bold text-gray-900">{scholarship.country}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-3">About This Scholarship</h3>
            <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
          </div>

          {/* Eligibility */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Eligibility Requirements</h3>
            <div className="space-y-3">
              {scholarship.eligibility.map((req, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={scholarship.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
            >
              Apply Now
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => onToggleSave(scholarship.id)}
              className={`px-6 py-4 rounded-xl font-semibold transition shadow-lg ${
                isSaved
                  ? 'bg-primary text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSaved ? (
                <><BookmarkCheck className="w-5 h-5 inline mr-2" />Saved</>
              ) : (
                <><Bookmark className="w-5 h-5 inline mr-2" />Save</>
              )}
            </button>
            <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition shadow-lg">
              <Share2 className="w-5 h-5 inline mr-2" />
              Share
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Posted on {new Date(scholarship.postedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}