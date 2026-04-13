import { Link, useLocation } from "react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import api from "../utils/api";
import "../../styles/home.css";
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
    indigo: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
    purple: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    rose: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20",
  };
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <Badge variant="outline" className={`mb-5 py-1 px-3.5 text-xs font-semibold border ${colorMap[badgeColor] || colorMap.indigo}`}>
        {badge}
      </Badge>
      <h2 className="home-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-tight">
        {title}{" "}
        {highlight && <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">{highlight}</span>}
      </h2>
      {description && (
        <p className="home-copy mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
      className={`home-luxe-card rounded-2xl backdrop-blur-sm transition-shadow duration-300 ${hover ? "hover:shadow-[0_20px_50px_-30px_rgba(2,132,199,0.45)] dark:hover:shadow-[0_24px_60px_-34px_rgba(0,0,0,0.85)]" : ""} ${className}`}
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
  students: number;
  category: string;
  price: number;
  currency: string;
  image: string;
  description?: string;
};

function CourseCard({ course }: { course: FeaturedCourse }) {
  const isPaid = Number(course.price || 0) > 0;
  const hasRatings = Number(course.numReviews || 0) > 0;

  return (
    <PremiumCard className="group overflow-hidden">
      <div className="relative overflow-hidden aspect-video">
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold border-0 shadow-sm">{course.category}</Badge>
          <Badge className={`text-[11px] font-bold border-0 shadow-sm ${isPaid ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
            {isPaid ? `PAID ${Number(course.price || 0).toFixed(2)} ${course.currency || "ETB"}` : "FREE"}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-white mb-1.5 line-clamp-1">{course.title}</h3>
        <p className="text-[13px] text-slate-500 mb-3">{course.instructor}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {hasRatings ? Number(course.rating || 0).toFixed(1) : "N/A"}
            </span>
            <span className="text-[11px] text-slate-400">({Number(course.numReviews || 0)} reviews)</span>
          </div>
          <span className="text-[11px] text-slate-400">{Number(course.students || 0)} students</span>
        </div>
        <Button size="sm" className={`w-full h-10 text-[12px] font-bold rounded-lg shadow-sm ${isPaid ? "bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white" : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"}`} asChild>
          <Link to={`/app/courses/${course.id}`}>{isPaid ? `Pay ${Number(course.price || 0).toFixed(2)} ${course.currency || "ETB"}` : "Enroll Free"}</Link>
        </Button>
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

type HomeEvent = {
  id: string;
  title: string;
  description: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
};

const features = [
  { title: "Structured Courses", desc: "Follow curated learning paths with video lessons, quizzes, and hands-on labs.", icon: BookOpen, color: "from-sky-500 to-cyan-600", lightBg: "bg-sky-50 dark:bg-sky-500/10" },
  { title: "Track Progress", desc: "XP system, daily streaks, and detailed analytics to keep you motivated.", icon: TrendingUp, color: "from-emerald-500 to-teal-600", lightBg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { title: "Mentor Feedback", desc: "Get practical project feedback from mentors and improve faster.", icon: MessageSquare, color: "from-amber-500 to-orange-600", lightBg: "bg-amber-50 dark:bg-amber-500/10" },
  { title: "Submit Projects", desc: "Build real-world projects and submit via GitHub for review.", icon: GitMerge, color: "from-cyan-500 to-sky-600", lightBg: "bg-cyan-50 dark:bg-cyan-500/10" },
  { title: "Get Support", desc: "24/7 support tickets, discussion forums, and peer-to-peer help.", icon: LifeBuoy, color: "from-rose-500 to-pink-600", lightBg: "bg-rose-50 dark:bg-rose-500/10" },
  { title: "Role-Based Access", desc: "Tailored dashboards for students, instructors, and admins.", icon: Shield, color: "from-slate-600 to-cyan-600", lightBg: "bg-slate-100 dark:bg-slate-500/10" },
];

const howItWorks = [
  { step: 1, title: "Sign Up", desc: "Create your free account in seconds", icon: Rocket },
  { step: 2, title: "Enroll", desc: "Browse and join courses that interest you", icon: BookOpen },
  { step: 3, title: "Learn & Practice", desc: "Watch lessons, take quizzes, build projects", icon: Code2 },
  { step: 4, title: "Complete Projects", desc: "Submit real projects via GitHub", icon: GitMerge },
  { step: 5, title: "Join Community", desc: "Get mentor feedback and keep improving", icon: Users },
];

export function Home() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const [realCourses, setRealCourses] = useState<FeaturedCourse[]>([]);
  const [announcements, setAnnouncements] = useState<HomeAnnouncement[]>([]);
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    videoCourses: 0,
    instructors: 0,
  });

  const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, coursesRes, announcementsRes, eventsRes] = await Promise.all([
          api.get('/dashboard/public-stats'),
          api.get('/courses?limit=4'),
          api.get('/dashboard/announcements'),
          api.get('/events?upcoming=true')
        ]);

        if (statsRes.data) {
          const payload = statsRes.data?.data ?? statsRes.data;
          setStats((prev) => ({
            activeStudents: toNumber(payload?.activeStudents, prev.activeStudents),
            videoCourses: toNumber(payload?.videoCourses, prev.videoCourses),
            instructors: toNumber(payload?.instructors, prev.instructors),
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
            students: Array.isArray(c.students) ? c.students.length : 0,
            category: c.category || 'Tech',
            price: toNumber(c.price, 0),
            currency: String(c.currency || 'ETB'),
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

        const eventsPayload = eventsRes.data?.data ?? eventsRes.data;
        const rawEvents = Array.isArray(eventsPayload) ? eventsPayload : [];

        const mappedEvents: HomeEvent[] = rawEvents.map((item: any, index: number) => ({
          id: String(item._id || item.id || `event-${index}`),
          title: String(item.title || 'Event'),
          description: String(item.description || ''),
          location: item.location ? String(item.location) : undefined,
          startsAt: item.startsAt || new Date().toISOString(),
          endsAt: item.endsAt,
        }));

        setEvents(mappedEvents);
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
      price: Number(course.price || 0),
      currency: String(course.currency || 'ETB'),
      rating: Number(course.rating || 0),
      numReviews: Number(course.numReviews || 0),
      href: typeof course.id === 'string' ? `/app/courses/${course.id}` : '/app/courses',
    }));
  }, [realCourses]);

  const eventCards = useMemo(() => {
    return events.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.location ? 'scheduled event' : 'event',
      desc: item.description,
      date: new Date(item.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }, [events]);

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
    <div className="home-shell home-copy flex-1 overflow-x-hidden">

      {/* ═══ 1. HERO SECTION ═══ */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle grid */}
        <div className="home-hero-grid absolute inset-0 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_100%)]" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[860px] h-[520px] bg-gradient-to-br from-sky-400/20 via-cyan-300/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[440px] h-[420px] bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="max-w-[1200px] relative mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge variant="outline" className="mb-8 py-1.5 px-4 text-[13px] font-semibold bg-cyan-50/90 text-cyan-700 border-cyan-200/70 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Spring 2026 Registration Open
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="home-display text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-white leading-[1.05]"
              >
                Learn Tech Skills.{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Build Real Projects.</span><br />
                Become Future-Ready.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Experience a premium, immersive learning ecosystem. Master front-end, back-end, and everything in between with real-world projects and a thriving community of tech builders.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-[15px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-purple-500/30 transition-all duration-300 rounded-xl text-white" asChild>
                  <Link to="/register">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-[15px] font-semibold border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white" asChild>
                  <Link to="/app/courses">Explore Courses</Link>
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
                    className="pl-11 pr-4 h-12 rounded-xl border-slate-300/70 bg-white/85 backdrop-blur-sm shadow-sm dark:bg-slate-900/70 dark:border-white/10 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-400"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                  />
                </div>
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-[#131827]/95 border border-slate-200/70 dark:border-white/10 rounded-xl shadow-lg shadow-black/10 z-50 overflow-hidden backdrop-blur-md">
                    {searchSuggestions.map((s, i) => (
                      <Link key={i} to="/app/courses" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm text-slate-300">
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
                    <img key={i} src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&crop=face`} alt="" className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-white">{stats.activeStudents.toLocaleString()}+</span>
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
                  <div className="absolute -inset-4 bg-gradient-to-br from-sky-500/15 to-emerald-500/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/40 dark:border-white/[0.06] shadow-2xl shadow-slate-900/10">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&h=500&fit=crop" alt="Students learning" className="w-full h-auto" />
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -bottom-5 -left-5 bg-white/95 dark:bg-[#131827]/90 backdrop-blur-xl rounded-xl shadow-lg shadow-black/10 border border-slate-200/60 dark:border-white/[0.08] p-3.5 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Course Completed!</p>
                    <p className="text-[11px] text-slate-500">+250 XP earned</p>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 bg-white/95 dark:bg-[#131827]/90 backdrop-blur-xl rounded-xl shadow-lg shadow-black/10 border border-slate-200/60 dark:border-white/[0.08] p-3.5 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <GitMerge className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Project Submitted</p>
                    <p className="text-[11px] text-slate-500">Awaiting mentor review</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 2. TRUSTED BY / STATS ═══ */}
      <section className="py-20 bg-transparent border-y border-slate-100 dark:border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { value: stats.activeStudents, suffix: "+", label: "Active Students", icon: Users, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/10" },
              { value: stats.videoCourses, suffix: "+", label: "Video Courses", icon: BookOpen, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
              { value: stats.instructors, suffix: "+", label: "Expert Instructors", icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
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
      <section id="features" className="py-24 lg:py-32 bg-transparent">
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
                  <h3 className="mb-2 text-[15px] font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.desc}</p>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. COURSE DISCOVERY ═══ */}
      <section className="py-24 lg:py-32 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
              <div>
                <Badge variant="outline" className="mb-5 py-1 px-3.5 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20">
                  Top Courses
                </Badge>
                <h2 className="home-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Featured Courses</h2>
                <p className="home-copy mt-3 text-base text-slate-300">Handpicked courses to accelerate your learning journey.</p>
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
      <section className="py-24 lg:py-32 bg-transparent">
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
              { title: "Frontend Developer", steps: ["HTML", "CSS", "JavaScript", "React", "Bootstrap"], color: "from-blue-500 to-indigo-600", icon: Monitor, price: 0, currency: "ETB" },
              { title: "Backend Developer", steps: ["Node.js", "Express.js", "MySQL", "REST API"], color: "from-emerald-500 to-teal-600", icon: Terminal, price: 200, currency: "ETB" },
            ].map((path, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <PremiumCard className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${path.color} p-6`}>
                    <path.icon className="h-7 w-7 mb-3 text-white/90" />
                    <h3 className="text-xl font-bold text-white">Become a {path.title}</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <Badge className={`text-[11px] font-bold border-0 shadow-sm ${path.price > 0 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
                        {path.price > 0 ? `PAID ${path.price.toFixed(2)} ${path.currency}` : "FREE"}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {path.steps.map((step, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/[0.06]">
                            <span className="text-[11px] font-semibold text-slate-500">{j + 1}</span>
                          </div>
                          <span className="text-sm text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full mt-6 h-11 rounded-xl text-[13px] font-bold ${path.price > 0 ? "bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white" : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"}`}
                      asChild
                    >
                      <Link to="/app/courses">{path.price > 0 ? `Pay ${path.price.toFixed(2)} ${path.currency}` : "Enroll Free"} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </PremiumCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. HOW IT WORKS ═══ */}
      <section className="py-24 lg:py-32 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="How It Works"
              title="Your Learning"
              highlight="Journey"
              description="From sign up to real projects in 5 simple steps."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="text-center relative">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+35px)] hidden lg:block w-[calc(100%-70px)]">
                      <div className="h-[2px] bg-gradient-to-r from-sky-200 to-emerald-200 dark:from-sky-900/80 dark:to-emerald-900/80 w-full" />
                    </div>
                  )}
                  <span className="inline-block mb-2.5 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    Step {item.step}
                  </span>
                  <h3 className="text-[15px] font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section className="py-24 lg:py-32 bg-transparent">
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
                  <h3 className="text-[15px] font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 mb-6 text-[14px] leading-relaxed flex-1 line-clamp-4">{item.description}</p>
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.author}</p>
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
      <section className="py-24 lg:py-32 bg-transparent">
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
                    <h3 className="text-[15px] font-semibold text-white mb-1">{p.title}</h3>
                    <p className="text-[13px] text-slate-500 mb-4">{p.tech}</p>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`text-[11px] font-bold border-0 shadow-sm ${p.price > 0 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
                        {p.price > 0 ? `PAID ${p.price.toFixed(2)} ${p.currency}` : "FREE"}
                      </Badge>
                      <div className="flex items-center gap-1 text-[12px] text-slate-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {p.numReviews > 0 ? p.rating.toFixed(1) : "N/A"}
                        </span>
                        <span>({p.numReviews})</span>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <Button size="sm" variant="outline" className="text-[11px] flex-1 h-8 rounded-lg border-slate-200/60 dark:border-white/10" asChild>
                        <Link to={p.href}>View Course</Link>
                      </Button>
                      <Button
                        size="sm"
                        className={`text-[11px] flex-1 h-8 rounded-lg font-bold ${p.price > 0 ? "bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white" : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"}`}
                        asChild
                      >
                        <Link to={p.href}>{p.price > 0 ? `Pay ${p.price.toFixed(2)} ${p.currency}` : "Enroll Free"}</Link>
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
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-300/10 rounded-full blur-3xl" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <AnimatedSection className="flex-1 text-center lg:text-left">
              <h2 className="home-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-6 leading-tight tracking-tight">
                Join a Thriving<br />Tech Community
              </h2>
              <p className="home-copy text-cyan-50/85 text-lg mb-10 max-w-lg leading-relaxed">
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
              <Button size="lg" className="bg-white text-slate-900 hover:bg-cyan-50 rounded-xl h-12 px-8 font-semibold shadow-lg shadow-black/10 transition-all duration-300" asChild>
                <a href="https://t.me/officialCTCclub" target="_blank" rel="noreferrer">
                  Join on Telegram <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </AnimatedSection>
            <AnimatedSection delay={0.15} className="flex-1 hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-cyan-200/20">
                <ImageWithFallback src="https://images.unsplash.com/photo-1759884247144-53d52c31f859?w=600&h=400&fit=crop" alt="Community" className="w-full h-auto" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 10. SUPPORT ═══ */}
      <section className="py-24 lg:py-32 bg-transparent">
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
              { icon: MessageSquare, title: "Community Forum", desc: "Ask questions and get answers from the community.", cta: "Visit Forum", color: "from-cyan-500 to-sky-600" },
              { icon: FileText, title: "Knowledge Base", desc: "Browse FAQs, tutorials, and troubleshooting guides.", cta: "Browse Docs", color: "from-sky-500 to-teal-600" },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <PremiumCard className="p-6 text-center">
                  <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-sm`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white mb-2">{item.title}</h3>
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
      <section id="events" className="py-24 lg:py-32 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Events"
              title="Upcoming Events &"
              highlight="Workshops"
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {eventCards.length === 0 ? (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">
                No upcoming events are published yet.
              </div>
            ) : (
              eventCards.map((e, i) => (
                <AnimatedSection key={e.id} delay={i * 0.08}>
                  <PremiumCard className="p-6">
                    <Badge variant="outline" className="mb-4 text-[11px] font-semibold bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20 capitalize">{e.type}</Badge>
                    <h3 className="text-[15px] font-semibold text-white mb-2">{e.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{e.desc}</p>
                    <div className="flex items-center gap-4 text-[12px] text-slate-400 mb-5">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {e.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                    </div>
                    <Button size="sm" className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white shadow-sm shadow-cyan-500/20" asChild>
                      <Link to="/events">View Events</Link>
                    </Button>
                  </PremiumCard>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══ 12. PRICING ═══ */}
      <section id="pricing" className="py-24 lg:py-32 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Pricing"
              title="Simple, Transparent"
              highlight="Pricing"
              description="Frontend track is completely free. Backend track costs 200 ETB."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AnimatedSection>
              <PremiumCard hover={false} className="p-8 h-full">
                <h3 className="text-xl font-bold text-white">Frontend Track</h3>
                <p className="mt-2 text-sm text-slate-500">HTML, CSS, JavaScript, React, and Bootstrap.</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white tracking-tight">Free</span>
                  <span className="text-base text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {["Frontend learning path", "Community access", "GitHub project submissions", "Support tickets", "Beginner-friendly roadmap"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl h-11 font-semibold" variant="outline" asChild>
                  <Link to="/register">Start Frontend Free</Link>
                </Button>
              </PremiumCard>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <div className="rounded-2xl border-2 border-sky-500/30 bg-gradient-to-b from-sky-50/50 to-white dark:from-sky-500/5 dark:to-[#0c0f1a] p-8 relative h-full shadow-lg shadow-sky-500/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-0 px-4 py-1 text-[11px] font-semibold shadow-lg shadow-cyan-500/25">
                    Most Popular
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white">Backend Track</h3>
                <p className="mt-2 text-sm text-slate-500">Node.js, Express.js, MySQL, and REST API training.</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white tracking-tight">200 ETB</span>
                  <span className="text-base text-slate-500 ml-1">/ backend track</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {["Backend learning path", "Hands-on API projects", "MySQL database modules", "Priority mentor feedback", "Backend assessment support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl h-11 font-semibold bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 shadow-sm shadow-cyan-500/20" asChild>
                  <Link to="/register">Enroll Backend Track</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 13. FINAL CTA ═══ */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/10 rounded-full blur-3xl" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative text-center">
          <AnimatedSection>
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-lg">
                <img src={ctcLogo} alt="CTC Club" className="h-10 w-10 rounded-lg" />
              </div>
              <h2 className="home-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-5 leading-tight tracking-tight">
                Start Your Tech Journey Today
              </h2>
              <p className="home-copy text-cyan-50/85 text-lg mb-10 leading-relaxed">
                Be among the first students building tech careers with us.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-cyan-50 px-8 h-12 rounded-xl font-semibold shadow-lg shadow-black/10 transition-all duration-300" asChild>
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
