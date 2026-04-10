import { Link, useLocation } from "react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import api from "../utils/api";
import ctcLogo from "../../assets/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";
import {
  ArrowRight, CheckCircle2, Star, Users, BookOpen, GitMerge,
  LifeBuoy, Shield, Award, TrendingUp, Code2, Terminal,
  Database, Play, Search, ChevronRight,
  Zap, Rocket, MessageSquare, Calendar,
  Heart, Github, ExternalLink, Mail, Monitor,
  Clock, FileText, Headphones, Sparkles
} from "lucide-react";

// ─── Animated Section Wrapper ───
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter Animation ───
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Section Header ───
function SectionHeader({ badge, badgeColor = "indigo", title, highlight, description }: {
  badge: string; badgeColor?: string; title: string; highlight?: string; description?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    purple: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  };
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <Badge variant="outline" className={`mb-5 py-1 px-3.5 text-xs font-semibold border ${colorMap[badgeColor] || colorMap.indigo}`}>
        {badge}
      </Badge>
      <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
        {title}{" "}
        {highlight && <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{highlight}</span>}
      </h2>
      {description && (
        <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Premium Card ───
function PremiumCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl border border-slate-200/60 bg-white dark:border-white/[0.06] dark:bg-white/[0.02] backdrop-blur-sm transition-shadow duration-300 ${hover ? "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Course Card ───
type FeaturedCourse = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  numReviews: number;
  students: string;
  category: string;
  image: string;
  description?: string;
};

function CourseCard({ course }: { course: FeaturedCourse }) {
  const hasRatings = Number(course.numReviews || 0) > 0;

  return (
    <PremiumCard className="group overflow-hidden">
      <div className="relative overflow-hidden aspect-video">
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold border-0 shadow-sm">{course.category}</Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1.5 line-clamp-1">{course.title}</h3>
        <p className="text-[13px] text-slate-500 mb-3">{course.instructor}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {hasRatings ? Number(course.rating || 0).toFixed(1) : "N/A"}
            </span>
            <span className="text-[11px] text-slate-400">({course.students})</span>
          </div>
          <Button size="sm" className="text-[11px] h-8 px-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/20" asChild>
            <Link to="/app/courses">Enroll</Link>
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
}

type HomeAnnouncement = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category?: string;
};

const features = [
  { title: "Structured Courses", desc: "Follow curated learning paths with video lessons, quizzes, and hands-on labs.", icon: BookOpen, color: "from-blue-500 to-indigo-600", lightBg: "bg-blue-50 dark:bg-blue-500/10" },
  { title: "Track Progress", desc: "XP system, daily streaks, and detailed analytics to keep you motivated.", icon: TrendingUp, color: "from-emerald-500 to-teal-600", lightBg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { title: "Earn Certificates", desc: "Get verified certificates upon completion to showcase your skills.", icon: Award, color: "from-amber-500 to-orange-600", lightBg: "bg-amber-50 dark:bg-amber-500/10" },
  { title: "Submit Projects", desc: "Build real-world projects and submit via GitHub for review.", icon: GitMerge, color: "from-violet-500 to-purple-600", lightBg: "bg-violet-50 dark:bg-violet-500/10" },
  { title: "Get Support", desc: "24/7 support tickets, discussion forums, and peer-to-peer help.", icon: LifeBuoy, color: "from-rose-500 to-pink-600", lightBg: "bg-rose-50 dark:bg-rose-500/10" },
  { title: "Role-Based Access", desc: "Tailored dashboards for students, instructors, and admins.", icon: Shield, color: "from-indigo-500 to-blue-600", lightBg: "bg-indigo-50 dark:bg-indigo-500/10" },
];

const howItWorks = [
  { step: 1, title: "Sign Up", desc: "Create your free account in seconds", icon: Rocket },
  { step: 2, title: "Enroll", desc: "Browse and join courses that interest you", icon: BookOpen },
  { step: 3, title: "Learn & Practice", desc: "Watch lessons, take quizzes, build projects", icon: Code2 },
  { step: 4, title: "Complete Projects", desc: "Submit real projects via GitHub", icon: GitMerge },
  { step: 5, title: "Get Certified", desc: "Earn certificates and level up", icon: Award },
];

export function Home() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const [realCourses, setRealCourses] = useState<FeaturedCourse[]>([]);
  const [announcements, setAnnouncements] = useState<HomeAnnouncement[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    videoCourses: 0,
    instructors: 0,
    certificates: 0
  });

  const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, coursesRes, announcementsRes] = await Promise.all([
          api.get('/dashboard/public-stats'),
          api.get('/courses?limit=4'),
          api.get('/dashboard/announcements')
        ]);

        if (statsRes.data) {
          const payload = statsRes.data?.data ?? statsRes.data;
          setStats((prev) => ({
            activeStudents: toNumber(payload?.activeStudents, prev.activeStudents),
            videoCourses: toNumber(payload?.videoCourses, prev.videoCourses),
            instructors: toNumber(payload?.instructors, prev.instructors),
            certificates: toNumber(payload?.certificates, prev.certificates),
          }));
        }

        const coursesPayload = coursesRes.data?.data ?? coursesRes.data;
        const rawCourses = Array.isArray(coursesPayload?.courses)
          ? coursesPayload.courses
          : Array.isArray(coursesPayload)
            ? coursesPayload
            : [];

        if (rawCourses.length > 0) {
          // Map backend course data to featuredCourses format
          const mappedCourses = rawCourses.map((c: any) => ({
            id: String(c._id),
            title: c.title,
            instructor: c.instructor?.name || 'Instructor',
            rating: toNumber(c.rating, 0),
            numReviews: toNumber(c.numReviews, 0),
            students: `${Array.isArray(c.students) ? c.students.length : 0}`,
            category: c.category || 'Tech',
            image: c.coverImage || 'https://images.unsplash.com/photo-1637937459053-c788742455be?w=600&h=340&fit=crop',
            description: c.shortDescription || c.description || ''
          }));
          setRealCourses(mappedCourses);
        }

        const announcementPayload = announcementsRes.data?.data ?? announcementsRes.data;
        const rawAnnouncements = Array.isArray(announcementPayload) ? announcementPayload : [];

        if (rawAnnouncements.length > 0) {
          const mappedAnnouncements = rawAnnouncements.map((item: any, index: number) => ({
            id: item.id || item._id || `announcement-${index}`,
            title: item.title || 'Platform update',
            content: item.content || 'New updates are available on CTC Club.',
            author: item.author || 'CTC Team',
            createdAt: item.createdAt || new Date().toISOString(),
            category: item.category,
          }));

          setAnnouncements(mappedAnnouncements);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };
    fetchHomeData();
  }, []);

  const searchSuggestions = ["Web Development", "Python", "React", "Data Science", "UI/UX Design", "Machine Learning"].filter(s =>
    searchQuery && s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const communityCards = useMemo(() => {
    if (announcements.length > 0) {
      return announcements.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.content,
        author: item.author,
        category: item.category || 'announcement',
        date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      }));
    }

    return realCourses.slice(0, 3).map((course: any, index: number) => ({
      id: String(course.id || `course-update-${index}`),
      title: `New Course: ${course.title}`,
      description: course.description || `${course.category} track is now available for learners.`,
      author: course.instructor || 'CTC Team',
      category: 'course update',
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
  }, [announcements, realCourses]);

  const projectShowcase = useMemo(() => {
    return realCourses.slice(0, 3).map((course: any, index: number) => ({
      id: String(course.id || `project-${index}`),
      title: course.title,
      tech: `${course.category} • ${course.instructor}`,
      image: course.image,
      href: typeof course.id === 'string' ? `/app/courses/${course.id}` : '/app/courses',
    }));
  }, [realCourses]);

  const eventCards = useMemo(() => {
    const source = announcements.length > 0
      ? announcements
      : realCourses.slice(0, 3).map((course: any, index: number) => ({
          id: String(course.id || `event-${index}`),
          title: `Course Launch: ${course.title}`,
          content: `${course.category} learning track is open for enrollment.`,
          author: course.instructor || 'CTC Team',
          createdAt: new Date().toISOString(),
          category: 'launch',
        }));

    return source.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.category || 'announcement',
      desc: item.content,
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }, [announcements, realCourses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.pathname === "/features") document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      else if (location.pathname === "/pricing") document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      else if (location.pathname === "/events") document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
      else if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, location.key]);

  return (
    <div className="flex-1 overflow-x-hidden">

      {/* ═══ 1. HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32 dark:bg-[#0c0f1a]">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_100%)]" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-indigo-400/15 via-violet-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-400/5 rounded-full blur-3xl" />

        <div className="max-w-[1200px] relative mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge variant="outline" className="mb-8 py-1.5 px-4 text-[13px] font-semibold bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Spring 2026 Registration Open
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
              >
                Learn Tech Skills.{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Build Real Projects.</span>{" "}
                Grow Your Career.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                The ultimate learning platform for university students. Access structured courses, earn certificates, build portfolio projects, and join a thriving tech community.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-[15px] font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 rounded-xl" asChild>
                  <Link to="/register">
                    Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-[15px] font-semibold border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300" asChild>
                  <Link to="/app/courses">Browse Courses</Link>
                </Button>
              </motion.div>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 relative max-w-md mx-auto lg:mx-0"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search courses, topics..."
                    className="pl-11 pr-4 h-12 rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:bg-white/5 dark:border-white/10 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                  />
                </div>
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#131827] border border-slate-200/60 dark:border-white/10 rounded-xl shadow-lg shadow-black/5 z-50 overflow-hidden">
                    {searchSuggestions.map((s, i) => (
                      <Link key={i} to="/app/courses" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm text-slate-600 dark:text-slate-400">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Trust Avatars */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {["photo-1535713875002-d1d0cf377fde", "photo-1573497620166-aef748c8c792", "photo-1568880893176-fb2bdab44e41", "photo-1472099645785-5658abf4ff4e"].map((id, i) => (
                    <img key={i} src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&crop=face`} alt="" className="h-8 w-8 rounded-full border-2 border-white dark:border-[#0c0f1a] object-cover" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">{stats.activeStudents.toLocaleString()}+</span>
                  <span className="text-slate-500 ml-1">students already learning</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/40 dark:border-white/[0.06] shadow-2xl shadow-slate-900/10">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1753613648137-602c669cbe07?w=700&h=500&fit=crop" alt="Students learning" className="w-full h-auto" />
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -bottom-5 -left-5 bg-white/90 dark:bg-[#131827]/90 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 border border-slate-200/40 dark:border-white/[0.06] p-3.5 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Course Completed!</p>
                    <p className="text-[11px] text-slate-500">+250 XP earned</p>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 bg-white/90 dark:bg-[#131827]/90 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 border border-slate-200/40 dark:border-white/[0.06] p-3.5 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Certificate Earned</p>
                    <p className="text-[11px] text-slate-500">Web Development</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 2. TRUSTED BY / STATS ═══ */}
      <section className="py-20 bg-slate-50/50 dark:bg-[#0c0f1a] border-y border-slate-100 dark:border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: stats.activeStudents, suffix: "+", label: "Active Students", icon: Users, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
              { value: stats.videoCourses, suffix: "+", label: "Video Courses", icon: BookOpen, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
              { value: stats.instructors, suffix: "+", label: "Expert Instructors", icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { value: stats.certificates, suffix: "+", label: "Certificates Issued", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. FEATURE HIGHLIGHTS ═══ */}
      <section id="features" className="py-24 lg:py-32 bg-white dark:bg-[#0c0f1a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Platform Features"
              title="Everything You Need to"
              highlight="Succeed"
              description="A complete learning ecosystem designed specifically for university students and tech enthusiasts."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.06}>
                <PremiumCard className="p-6 h-full">
                  <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-sm`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. COURSE DISCOVERY ═══ */}
      <section className="py-24 lg:py-32 bg-slate-50/50 dark:bg-[#0a0d17]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
              <div>
                <Badge variant="outline" className="mb-5 py-1 px-3.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                  Top Courses
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Featured Courses</h2>
                <p className="mt-3 text-base text-slate-500 dark:text-slate-400">Handpicked courses to accelerate your learning journey.</p>
              </div>
              <Button variant="outline" className="rounded-xl font-semibold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5" asChild>
                <Link to="/app/courses">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </AnimatedSection>

          {realCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
              No published courses available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {realCourses.map((course, i) => (
                <AnimatedSection key={course.id} delay={i * 0.08}>
                  <CourseCard course={course} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ 5. LEARNING PATHS ═══ */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#0c0f1a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Learning Paths"
              badgeColor="purple"
              title="Choose Your"
              highlight="Path"
              description="Follow structured roadmaps to become a professional developer."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Frontend Developer", steps: ["HTML & CSS", "JavaScript ES6+", "React & Next.js", "UI/UX Design", "Portfolio Projects"], color: "from-blue-500 to-indigo-600", icon: Monitor },
              { title: "Backend Developer", steps: ["Python Fundamentals", "Databases & SQL", "REST APIs", "Node.js & Express", "DevOps & Deployment"], color: "from-emerald-500 to-teal-600", icon: Terminal },
            ].map((path, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <PremiumCard className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${path.color} p-6`}>
                    <path.icon className="h-7 w-7 mb-3 text-white/90" />
                    <h3 className="text-xl font-bold text-white">Become a {path.title}</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {path.steps.map((step, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/[0.06]">
                            <span className="text-[11px] font-semibold text-slate-500">{j + 1}</span>
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{step}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/20" asChild>
                      <Link to="/register">Start Path <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. HOW IT WORKS ═══ */}
      <section className="py-24 lg:py-32 bg-slate-50/50 dark:bg-[#0a0d17]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="How It Works"
              title="Your Learning"
              highlight="Journey"
              description="From sign up to certification in 5 simple steps."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="text-center relative">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+35px)] hidden lg:block w-[calc(100%-70px)]">
                      <div className="h-[2px] bg-gradient-to-r from-indigo-200 to-violet-200 dark:from-indigo-800 dark:to-violet-800 w-full" />
                    </div>
                  )}
                  <span className="inline-block mb-2.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step {item.step}
                  </span>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#0c0f1a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Community Updates"
              badgeColor="amber"
              title="Latest Platform"
              highlight="Highlights"
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {communityCards.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.08}>
                <PremiumCard className="p-6 h-full flex flex-col">
                  <Badge variant="outline" className="mb-3 w-fit text-[11px] capitalize bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                    {item.category}
                  </Badge>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-[14px] leading-relaxed flex-1 line-clamp-4">{item.description}</p>
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.author}</p>
                      <p className="text-[12px] text-slate-500">{item.date}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-[11px]" asChild>
                      <Link to="/app/community">Discuss</Link>
                    </Button>
                  </div>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. STUDENT PROJECTS ═══ */}
      <section className="py-24 lg:py-32 bg-slate-50/50 dark:bg-[#0a0d17]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Real Projects"
              badgeColor="emerald"
              title="Build Real Projects,"
              highlight="Not Just Theory"
              description="Our students build production-ready projects that impress employers."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {projectShowcase.map((p, i) => (
              <AnimatedSection key={p.id} delay={i * 0.08}>
                <PremiumCard className="overflow-hidden group">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1">{p.title}</h3>
                    <p className="text-[13px] text-slate-500 mb-4">{p.tech}</p>
                    <div className="flex gap-2.5">
                      <Button size="sm" variant="outline" className="text-[11px] flex-1 h-8 rounded-lg border-slate-200/60 dark:border-white/10" asChild>
                        <Link to={p.href}>View Course</Link>
                      </Button>
                      <Button size="sm" className="text-[11px] flex-1 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20" asChild>
                        <Link to="/app/courses">Explore</Link>
                      </Button>
                    </div>
                  </div>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. COMMUNITY ═══ */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <AnimatedSection className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-6 leading-tight tracking-tight">
                Join a Thriving<br />Tech Community
              </h2>
              <p className="text-indigo-100/80 text-lg mb-10 max-w-lg leading-relaxed">
                Connect with fellow learners, join study groups, participate in discussions, and grow together.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { icon: MessageSquare, text: "Discussion Forums & Q&A" },
                  { icon: Users, text: "Study Groups & Peer Support" },
                  { icon: Heart, text: "Mentorship & Code Reviews" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[15px] font-medium text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 rounded-xl h-12 px-8 font-semibold shadow-lg shadow-black/10 transition-all duration-300" asChild>
                <Link to="/register">Join the Community <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </AnimatedSection>
            <AnimatedSection delay={0.15} className="flex-1 hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <ImageWithFallback src="https://images.unsplash.com/photo-1759884247144-53d52c31f859?w=600&h=400&fit=crop" alt="Community" className="w-full h-auto" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 10. SUPPORT ═══ */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#0c0f1a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Support"
              badgeColor="rose"
              title="We're Here to"
              highlight="Help"
              description="Get help instantly with our multi-channel support system."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Headphones, title: "Submit a Ticket", desc: "Create a support ticket and get a response within 24 hours.", cta: "Get Help", color: "from-rose-500 to-pink-600" },
              { icon: MessageSquare, title: "Community Forum", desc: "Ask questions and get answers from the community.", cta: "Visit Forum", color: "from-violet-500 to-purple-600" },
              { icon: FileText, title: "Knowledge Base", desc: "Browse FAQs, tutorials, and troubleshooting guides.", cta: "Browse Docs", color: "from-blue-500 to-indigo-600" },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <PremiumCard className="p-6 text-center">
                  <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-sm`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-5 leading-relaxed">{item.desc}</p>
                  <Button variant="outline" size="sm" className="rounded-lg font-semibold border-slate-200/60 dark:border-white/10" asChild>
                    <Link to="/app/support">{item.cta}</Link>
                  </Button>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. EVENTS ═══ */}
      <section id="events" className="py-24 lg:py-32 bg-slate-50/50 dark:bg-[#0a0d17]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Events"
              title="Upcoming Events &"
              highlight="Workshops"
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {eventCards.map((e, i) => (
              <AnimatedSection key={e.id} delay={i * 0.08}>
                <PremiumCard className="p-6">
                  <Badge variant="outline" className="mb-4 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 capitalize">{e.type}</Badge>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-2">{e.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{e.desc}</p>
                  <div className="flex items-center gap-4 text-[12px] text-slate-400 mb-5">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {e.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                  </div>
                  <Button size="sm" className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/20" asChild>
                    <Link to="/app/community">Read Update</Link>
                  </Button>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 12. PRICING ═══ */}
      <section id="pricing" className="py-24 lg:py-32 bg-white dark:bg-[#0c0f1a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Pricing"
              title="Simple, Transparent"
              highlight="Pricing"
              description="100% free for university students."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AnimatedSection>
              <PremiumCard hover={false} className="p-8 h-full">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student</h3>
                <p className="mt-2 text-sm text-slate-500">Perfect for individual learning.</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">$0</span>
                  <span className="text-base text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {["All basic courses", "Community access", "GitHub project submissions", "Support tickets", "Certificates"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl h-11 font-semibold" variant="outline" asChild>
                  <Link to="/register">Get Started Free</Link>
                </Button>
              </PremiumCard>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-500/5 dark:to-[#0c0f1a] p-8 relative h-full shadow-lg shadow-indigo-500/5">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 px-4 py-1 text-[11px] font-semibold shadow-lg shadow-indigo-500/25">
                    Most Popular
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">University Partner</h3>
                <p className="mt-2 text-sm text-slate-500">For institutions and large clubs.</p>
                <div className="my-8">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Custom</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {["Unlimited student accounts", "Custom course creation", "Advanced analytics", "Priority 24/7 support", "Custom branding", "Admin dashboard"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl h-11 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/20">
                  Contact Sales
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 13. FINAL CTA ═══ */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative text-center">
          <AnimatedSection>
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-lg">
                <img src={ctcLogo} alt="CTC Club" className="h-10 w-10 rounded-lg" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-5 leading-tight tracking-tight">
                Start Your Journey Today<br />with CTC Club
              </h2>
              <p className="text-indigo-100/80 text-lg mb-10 leading-relaxed">
                Join thousands of students who are building their tech careers with us.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-white/90 px-8 h-12 rounded-xl font-semibold shadow-lg shadow-black/10 transition-all duration-300" asChild>
                  <Link to="/register">Register Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300" asChild>
                  <Link to="/app/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
