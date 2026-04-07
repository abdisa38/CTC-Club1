// Mock data for Ofijan platform

export interface Exam {
  id: string;
  name: string;
  category: 'Grade 6' | 'Grade 8' | 'Grade 12' | 'Model Exam' | 'Exit Exam' | 'Mock Exam';
  topic: string;
  totalQuestions: number;
  duration: number; // in minutes
  hasGamingMode: boolean;
  isPremium: boolean;
  examPassword?: string;
}

export interface Question {
  id: string;
  examId: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'essay';
  question: string;
  image?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface GamingQuestion {
  id: string;
  category: 'General Knowledge' | 'Grade 8' | 'Grade 12' | 'CoC' | 'Exit Exam';
  type: 'multiple-choice' | 'true-false';
  question: string;
  image?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  weight: number; // Custom points value (e.g., 10, 20, 50)
  timeLimit: number; // Custom time limit in seconds (e.g., 30, 60)
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdBy: string;
  createdAt: string;
}

export interface FeedbackRating {
  id: string;
  studentId: string;
  studentName: string;
  examId?: string;
  examName?: string;
  rating: number; // 1-5 stars
  comment: string;
  category: 'Exam Quality' | 'Platform Usability' | 'Gaming Mode' | 'General';
  createdAt: string;
  adminResponse?: string;
  adminResponseAt?: string;
}

export interface Testimony {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  testimony: string;
  status: 'pending' | 'published' | 'rejected';
  isPublished: boolean;
  allowPublish: boolean;
  createdAt: string;
  publishedAt?: string;
  adminNote?: string;
}

export interface UserRegistration {
  id: string;
  name: string;
  email: string;
  password: string;
  preferredCategories: string[];
  telegramId: string;
  phone?: string;
  registeredAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  totalExams: number;
  averageScore: number;
  gamingPoints: number;
  rank: number;
  isPremium: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  badge: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  status: 'pending' | 'approved' | 'failed';
  date: string;
  examId: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  position: 'sidebar' | 'banner';
}

export interface Scholarship {
  id: string;
  title: string;
  organization: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  applicationLink: string;
  country: string;
  imageUrl: string;
  postedDate: string;
  category: 'Undergraduate' | 'Graduate' | 'PhD' | 'High School' | 'Research';
}

export interface ScholarshipPreference {
  id: string;
  studentId: string;
  categories: string[];
  countries: string[];
  fieldsOfStudy: string[];
  minAmount?: number;
  maxAmount?: number;
  notificationEnabled: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipNotification {
  id: string;
  studentId: string;
  scholarshipId: string;
  isRead: boolean;
  createdAt: string;
}

// Mock Exams
export const mockExams: Exam[] = [
  {
    id: '1',
    name: 'Mathematics Final Exam',
    category: 'Grade 12',
    topic: 'Algebra & Calculus',
    totalQuestions: 50,
    duration: 120,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '2',
    name: 'English Grammar Test',
    category: 'Grade 8',
    topic: 'Grammar',
    totalQuestions: 30,
    duration: 60,
    hasGamingMode: true,
    isPremium: true,
  },
  {
    id: '3',
    name: 'Science Mock Exam',
    category: 'Mock Exam',
    topic: 'Physics & Chemistry',
    totalQuestions: 40,
    duration: 90,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '4',
    name: 'History Exit Exam',
    category: 'Exit Exam',
    topic: 'World History',
    totalQuestions: 35,
    duration: 75,
    hasGamingMode: false,
    isPremium: false,
  },
  {
    id: '5',
    name: 'Biology Model Test',
    category: 'Model Exam',
    topic: 'Biology',
    totalQuestions: 45,
    duration: 100,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '6',
    name: 'Mathematics Basic',
    category: 'Grade 6',
    topic: 'Arithmetic',
    totalQuestions: 25,
    duration: 45,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '7',
    name: 'EUEE Mathematics Practice',
    category: 'Exit Exam',
    topic: 'EUEE Mathematics',
    totalQuestions: 60,
    duration: 150,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '8',
    name: 'EUEE Natural Science',
    category: 'Exit Exam',
    topic: 'EUEE Natural Sciences',
    totalQuestions: 55,
    duration: 140,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '9',
    name: 'Grade 8 National Exam - Math',
    category: 'Grade 8',
    topic: 'Mathematics',
    totalQuestions: 40,
    duration: 90,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '10',
    name: 'Grade 6 Mathematics',
    category: 'Grade 6',
    topic: 'Basic Mathematics',
    totalQuestions: 30,
    duration: 60,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '11',
    name: 'GAT Aptitude Test',
    category: 'Model Exam',
    topic: 'General Aptitude',
    totalQuestions: 50,
    duration: 120,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '12',
    name: 'COC Level 1 Practice',
    category: 'Model Exam',
    topic: 'COC Certification',
    totalQuestions: 35,
    duration: 90,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '13',
    name: 'Mock Exam - Natural Science',
    category: 'Mock Exam',
    topic: 'Natural Sciences',
    totalQuestions: 45,
    duration: 100,
    hasGamingMode: true,
    isPremium: false,
  },
  {
    id: '14',
    name: 'Mock Exam - Social Studies',
    category: 'Mock Exam',
    topic: 'Social Sciences',
    totalQuestions: 40,
    duration: 90,
    hasGamingMode: true,
    isPremium: false,
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    examId: '1',
    type: 'multiple-choice',
    question: 'What is the derivative of x²?',
    options: ['x', '2x', 'x²', '2'],
    correctAnswer: 1,
    explanation: 'The derivative of x² is 2x using the power rule.',
    points: 2,
  },
  {
    id: 'q2',
    examId: '1',
    type: 'true-false',
    question: 'The integral of 1/x is ln(x) + C',
    correctAnswer: 'true',
    explanation: 'This is correct. The natural logarithm is the antiderivative of 1/x.',
    points: 1,
  },
  {
    id: 'q3',
    examId: '2',
    type: 'multiple-choice',
    question: 'Which of the following is a verb?',
    options: ['Beautiful', 'Running', 'Quick', 'Happiness'],
    correctAnswer: 1,
    explanation: 'Running is a verb (action word).',
    points: 1,
  },
  {
    id: 'q4',
    examId: '3',
    type: 'multiple-choice',
    question: 'What is the chemical formula for water?',
    options: ['CO2', 'H2O', 'O2', 'NaCl'],
    correctAnswer: 1,
    explanation: 'Water is composed of two hydrogen atoms and one oxygen atom (H2O).',
    points: 2,
  },
];

// Mock Gaming Questions
export const mockGamingQuestions: GamingQuestion[] = [
  {
    id: 'gq1',
    category: 'General Knowledge',
    type: 'multiple-choice',
    question: 'What is the capital city of Ethiopia?',
    options: ['Addis Ababa', 'Nairobi', 'Cairo', 'Khartoum'],
    correctAnswer: 0,
    explanation: 'Addis Ababa is the capital and largest city of Ethiopia.',
    weight: 10,
    timeLimit: 30,
    difficulty: 'Easy',
    createdBy: 'admin1',
    createdAt: '2026-02-15',
  },
  {
    id: 'gq2',
    category: 'Grade 12',
    type: 'multiple-choice',
    question: 'What is the derivative of x²?',
    options: ['2x', 'x', '2', 'x²'],
    correctAnswer: 0,
    explanation: 'Using the power rule, the derivative of x² is 2x.',
    weight: 20,
    timeLimit: 45,
    difficulty: 'Medium',
    createdBy: 'admin1',
    createdAt: '2026-02-16',
  },
  {
    id: 'gq3',
    category: 'Grade 8',
    type: 'true-false',
    question: 'Water boils at 100°C at sea level.',
    correctAnswer: 0,
    explanation: 'True. At standard atmospheric pressure (sea level), water boils at 100°C or 212°F.',
    weight: 10,
    timeLimit: 20,
    difficulty: 'Easy',
    createdBy: 'admin1',
    createdAt: '2026-02-17',
  },
  {
    id: 'gq4',
    category: 'Exit Exam',
    type: 'multiple-choice',
    question: 'Which organ in the human body is primarily responsible for filtering blood?',
    options: ['Heart', 'Liver', 'Kidneys', 'Lungs'],
    correctAnswer: 2,
    explanation: 'The kidneys filter blood to remove waste products and excess water, producing urine.',
    weight: 30,
    timeLimit: 60,
    difficulty: 'Hard',
    createdBy: 'admin1',
    createdAt: '2026-02-18',
  },
  {
    id: 'gq5',
    category: 'CoC',
    type: 'multiple-choice',
    question: 'In programming, what does CPU stand for?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit'],
    correctAnswer: 0,
    explanation: 'CPU stands for Central Processing Unit, the primary component of a computer that performs instructions.',
    weight: 15,
    timeLimit: 30,
    difficulty: 'Easy',
    createdBy: 'admin1',
    createdAt: '2026-02-19',
  },
  {
    id: 'gq6',
    category: 'General Knowledge',
    type: 'multiple-choice',
    question: 'Who wrote the famous novel "Things Fall Apart"?',
    options: ['Wole Soyinka', 'Chinua Achebe', 'Ngugi wa Thiongo', 'Ben Okri'],
    correctAnswer: 1,
    explanation: 'Chinua Achebe wrote "Things Fall Apart" in 1958, one of the most widely read African novels.',
    weight: 20,
    timeLimit: 40,
    difficulty: 'Medium',
    createdBy: 'admin1',
    createdAt: '2026-02-20',
  },
  {
    id: 'gq7',
    category: 'Grade 12',
    type: 'multiple-choice',
    question: 'What is the chemical formula for sulfuric acid?',
    options: ['H₂SO₄', 'HCl', 'HNO₃', 'H₂CO₃'],
    correctAnswer: 0,
    explanation: 'Sulfuric acid has the chemical formula H₂SO₄.',
    weight: 25,
    timeLimit: 50,
    difficulty: 'Hard',
    createdBy: 'admin1',
    createdAt: '2026-02-21',
  },
  {
    id: 'gq8',
    category: 'Grade 8',
    type: 'true-false',
    question: 'The Earth is the third planet from the Sun.',
    correctAnswer: 0,
    explanation: 'True. The order from the Sun is: Mercury, Venus, Earth, Mars...',
    weight: 10,
    timeLimit: 20,
    difficulty: 'Easy',
    createdBy: 'admin1',
    createdAt: '2026-02-22',
  },
];

// Mock Feedback Ratings
export const mockFeedbackRatings: FeedbackRating[] = [
  {
    id: 'fb1',
    studentId: 's1',
    studentName: 'Abebe Kebede',
    examId: 'exam1',
    examName: 'Grade 12 Mathematics Mock Exam',
    rating: 5,
    comment: 'Excellent exam! The questions were well-structured and covered all important topics.',
    category: 'Exam Quality',
    createdAt: '2026-03-01',
    adminResponse: 'Thank you for your positive feedback! We are glad you found the exam helpful.',
    adminResponseAt: '2026-03-02',
  },
  {
    id: 'fb2',
    studentId: 's2',
    studentName: 'Rahel Melaku',
    rating: 4,
    comment: 'Great platform! The gaming mode is very engaging and helps with learning.',
    category: 'Gaming Mode',
    createdAt: '2026-03-02',
  },
  {
    id: 'fb3',
    studentId: 's3',
    studentName: 'Samuel Tadesse',
    examId: 'exam2',
    examName: 'Exit Exam English',
    rating: 3,
    comment: 'The exam is good but could use more practice questions.',
    category: 'Exam Quality',
    createdAt: '2026-03-03',
  },
];

// Mock Testimonies
export const mockTestimonies: Testimony[] = [
  {
    id: 'test1',
    studentId: 's1',
    studentName: 'Abebe Kebede',
    title: 'Best Learning Experience',
    testimony: 'I have been using Ofijan for a few months now and it has been a game-changer in my studies. The exams are well-structured and the gaming mode is incredibly engaging. Highly recommend!',
    status: 'published',
    isPublished: true,
    allowPublish: true,
    createdAt: '2026-03-01',
    publishedAt: '2026-03-02',
  },
  {
    id: 'test2',
    studentId: 's2',
    studentName: 'Rahel Melaku',
    title: 'Engaging Gaming Mode',
    testimony: 'The gaming mode is a great way to learn and practice. It keeps me motivated and helps me retain information better.',
    status: 'pending',
    isPublished: false,
    allowPublish: true,
    createdAt: '2026-03-02',
  },
  {
    id: 'test3',
    studentId: 's3',
    studentName: 'Samuel Tadesse',
    title: 'Good but Needs Improvement',
    testimony: 'The exam is good but could use more practice questions. It would be helpful to have more variety in the questions.',
    status: 'rejected',
    isPublished: false,
    allowPublish: false,
    createdAt: '2026-03-03',
    adminNote: 'The exam has been updated with more practice questions.',
  },
];

// Mock User Registrations
export const mockUserRegistrations: UserRegistration[] = [
  {
    id: 'ur1',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    password: 'password123',
    preferredCategories: ['Grade 12', 'Mock Exam'],
    telegramId: 'abebe_kebede',
    phone: '0912345678',
    registeredAt: '2026-01-10',
  },
  {
    id: 'ur2',
    name: 'Tigist Haile',
    email: 'tigist@example.com',
    password: 'password456',
    preferredCategories: ['Grade 8', 'Model Exam'],
    telegramId: 'tigist_haile',
    phone: '0987654321',
    registeredAt: '2026-01-15',
  },
  {
    id: 'ur3',
    name: 'Dawit Teklu',
    email: 'dawit@example.com',
    password: 'password789',
    preferredCategories: ['Grade 6', 'Exit Exam'],
    telegramId: 'dawit_teklu',
    phone: '0911223344',
    registeredAt: '2026-01-20',
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    totalExams: 12,
    averageScore: 85,
    gamingPoints: 2450,
    rank: 1,
    isPremium: true,
  },
  {
    id: 's2',
    name: 'Tigist Haile',
    email: 'tigist@example.com',
    totalExams: 10,
    averageScore: 82,
    gamingPoints: 2200,
    rank: 2,
    isPremium: true,
  },
  {
    id: 's3',
    name: 'Dawit Teklu',
    email: 'dawit@example.com',
    totalExams: 15,
    averageScore: 78,
    gamingPoints: 2100,
    rank: 3,
    isPremium: false,
  },
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, id: 's1', name: 'Abebe Kebede', points: 2450, badge: '🏆' },
  { rank: 2, id: 's2', name: 'Tigist Haile', points: 2200, badge: '🥈' },
  { rank: 3, id: 's3', name: 'Dawit Teklu', points: 2100, badge: '🥉' },
  { rank: 4, id: 's4', name: 'Sara Ahmed', points: 1950, badge: '⭐' },
  { rank: 5, id: 's5', name: 'Michael Desta', points: 1850, badge: '⭐' },
  { rank: 6, id: 's6', name: 'Helen Girma', points: 1750, badge: '⭐' },
  { rank: 7, id: 's7', name: 'Yohannes Mamo', points: 1650, badge: '⭐' },
  { rank: 8, id: 's8', name: 'Rahel Alemu', points: 1550, badge: '⭐' },
  { rank: 9, id: 's9', name: 'Daniel Bekele', points: 1450, badge: '⭐' },
  { rank: 10, id: 's10', name: 'Selam Tesfaye', points: 1350, badge: '⭐' },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'p1',
    studentId: 's1',
    amount: 200,
    status: 'approved',
    date: '2026-02-20',
    examId: '2',
  },
  {
    id: 'p2',
    studentId: 's2',
    amount: 200,
    status: 'pending',
    date: '2026-02-25',
    examId: '2',
  },
];

// Current logged-in user (for demo purposes)
export const currentUser: Student = mockStudents[0];

// Mock Advertisements
export const mockAds: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Premium Membership - 50% OFF!',
    description: 'Unlock all exams and gaming mode features',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=200&fit=crop',
    link: '/student/payment',
    startDate: '2026-02-01',
    expiryDate: '2026-03-31',
    isActive: true,
    position: 'sidebar',
  },
  {
    id: 'ad2',
    title: 'New EUEE Practice Tests Available',
    description: 'Prepare for university entrance exams',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop',
    link: '/category/euee',
    startDate: '2026-02-15',
    expiryDate: '2026-04-15',
    isActive: true,
    position: 'sidebar',
  },
  {
    id: 'ad3',
    title: 'Join Our Study Community',
    description: 'Connect with fellow students on Telegram',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    link: 'https://t.me/ofijan',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    isActive: true,
    position: 'sidebar',
  },
  {
    id: 'ad4',
    title: 'COC Certification Courses',
    description: 'Get certified with our comprehensive materials',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
    link: '/category/coc',
    startDate: '2026-02-01',
    expiryDate: '2026-02-20',
    isActive: true,
    position: 'sidebar',
  },
];

// Mock Scholarships
export const mockScholarships: Scholarship[] = [
  {
    id: 'sch1',
    title: 'Ethiopian Government Full Scholarship',
    organization: 'Ministry of Education',
    description: 'Full scholarship covering tuition, accommodation, and living expenses for outstanding students pursuing undergraduate degrees in Ethiopian public universities.',
    amount: 'Full Tuition + ETB 3,000/month',
    deadline: '2026-04-30',
    eligibility: [
      'Ethiopian citizenship',
      'EUEE score of 550 or above',
      'Age below 25 years',
      'Good academic record',
    ],
    applicationLink: 'https://moe.gov.et/scholarships',
    country: 'Ethiopia',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop',
    postedDate: '2026-01-15',
    category: 'Undergraduate',
  },
  {
    id: 'sch2',
    title: 'Mastercard Foundation Scholars Program',
    organization: 'Mastercard Foundation',
    description: 'Comprehensive scholarship for academically talented but economically disadvantaged students from Africa to pursue university education.',
    amount: 'Full Tuition + Accommodation + Stipend',
    deadline: '2026-03-15',
    eligibility: [
      'African citizenship',
      'Demonstrated financial need',
      'Strong academic performance',
      'Leadership potential',
      'Admission to partner universities',
    ],
    applicationLink: 'https://mastercardfdn.org/scholars-program',
    country: 'Multiple Countries',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop',
    postedDate: '2026-01-20',
    category: 'Undergraduate',
  },
  {
    id: 'sch3',
    title: 'African Union STEM Scholarship',
    organization: 'African Union Commission',
    description: 'Scholarship for African students pursuing Science, Technology, Engineering, and Mathematics programs at African universities.',
    amount: 'USD 10,000 per year',
    deadline: '2026-05-30',
    eligibility: [
      'African Union member state citizenship',
      'Pursuing STEM fields',
      'Minimum 3.5 GPA',
      'Age below 30',
    ],
    applicationLink: 'https://au.int/scholarships',
    country: 'Pan-African',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
    postedDate: '2026-02-01',
    category: 'Graduate',
  },
  {
    id: 'sch4',
    title: 'Addis Ababa University Excellence Award',
    organization: 'Addis Ababa University',
    description: 'Merit-based scholarship for top-performing students admitted to graduate programs at AAU.',
    amount: 'ETB 50,000 + Tuition Waiver',
    deadline: '2026-04-15',
    eligibility: [
      'CGPA of 3.75 or higher',
      'Admission to AAU graduate program',
      'Research proposal approval',
    ],
    applicationLink: 'https://www.aau.edu.et/scholarships',
    country: 'Ethiopia',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop',
    postedDate: '2026-01-25',
    category: 'Graduate',
  },
  {
    id: 'sch5',
    title: 'UK Government Chevening Scholarship',
    organization: 'UK Foreign Office',
    description: 'Fully funded scholarship for outstanding emerging leaders from around the world to pursue one-year master\'s degrees in the UK.',
    amount: 'Full Tuition + Living Expenses + Travel',
    deadline: '2026-11-02',
    eligibility: [
      'Bachelor\'s degree',
      'Minimum 2 years work experience',
      'Return to home country for 2 years after study',
      'Leadership potential',
    ],
    applicationLink: 'https://www.chevening.org/apply',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=600&h=400&fit=crop',
    postedDate: '2026-02-10',
    category: 'Graduate',
  },
  {
    id: 'sch6',
    title: 'High School Excellence Scholarship',
    organization: 'Ethiopian Education Foundation',
    description: 'Financial support for high-achieving high school students to continue their education.',
    amount: 'ETB 15,000 per year',
    deadline: '2026-03-20',
    eligibility: [
      'Grade 9-12 students',
      'Average grade of 85% or above',
      'Financial need demonstrated',
    ],
    applicationLink: 'https://eef.org.et/apply',
    country: 'Ethiopia',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop',
    postedDate: '2026-01-30',
    category: 'High School',
  },
];

// Helper function to check if ad is expired
export const isAdExpired = (expiryDate: string): boolean => {
  const today = new Date('2026-03-02'); // Current date from context
  const expiry = new Date(expiryDate);
  return expiry < today;
};

// Get active ads (not expired)
export const getActiveAds = (): Advertisement[] => {
  return mockAds.filter(ad => ad.isActive && !isAdExpired(ad.expiryDate));
};

// Mock Scholarship Preferences
export const mockScholarshipPreferences: ScholarshipPreference[] = [
  {
    id: 'pref1',
    studentId: 's1',
    categories: ['Undergraduate', 'Graduate'],
    countries: ['Ethiopia', 'Multiple Countries'],
    fieldsOfStudy: ['Engineering', 'Computer Science', 'STEM'],
    notificationEnabled: true,
    emailNotification: true,
    smsNotification: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-02-15',
  },
];

// Mock Scholarship Notifications
export const mockScholarshipNotifications: ScholarshipNotification[] = [
  {
    id: 'notif1',
    studentId: 's1',
    scholarshipId: 'sch1',
    isRead: false,
    createdAt: '2026-02-28',
  },
  {
    id: 'notif2',
    studentId: 's1',
    scholarshipId: 'sch3',
    isRead: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'notif3',
    studentId: 's1',
    scholarshipId: 'sch2',
    isRead: true,
    createdAt: '2026-02-20',
  },
];

// Get unread scholarship notifications count
export const getUnreadScholarshipCount = (studentId: string): number => {
  return mockScholarshipNotifications.filter(
    n => n.studentId === studentId && !n.isRead
  ).length;
};

// Match scholarships with user preferences
export const getMatchingScholarships = (preference: ScholarshipPreference): Scholarship[] => {
  return mockScholarships.filter(scholarship => {
    const matchesCategory = preference.categories.length === 0 || 
      preference.categories.includes(scholarship.category);
    
    const matchesCountry = preference.countries.length === 0 || 
      preference.countries.includes(scholarship.country) ||
      preference.countries.includes('Any Country');
    
    return matchesCategory && matchesCountry;
  });
};

// Get gaming questions by category
export const getGamingQuestionsByCategory = (category: string): GamingQuestion[] => {
  if (category === 'All') return mockGamingQuestions;
  return mockGamingQuestions.filter(q => q.category === category);
};

// Get exam count by category
export const getExamCountByCategory = (category: string): number => {
  return mockExams.filter(exam => exam.category === category).length;
};

// Get gaming question count by category
export const getGamingQuestionCountByCategory = (category: string): number => {
  return mockGamingQuestions.filter(q => q.category === category).length;
};

// Get average rating for an exam
export const getAverageRating = (examId: string): number => {
  const ratings = mockFeedbackRatings.filter(r => r.examId === examId);
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
};