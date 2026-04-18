import { Outlet, Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { Menu, X, Github, Twitter, Linkedin, Instagram, Mail, ArrowRight, ArrowUpRight } from "lucide-react";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import ctcLogo from "../../../assets/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";

export function PublicLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletterFeedback, setNewsletterFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      const message = "Please enter a valid email address.";
      setNewsletterFeedback({ type: "error", message });
      toast.error(message);
      return;
    }

    try {
      const rawStored = localStorage.getItem("ctc-newsletter-subscribers");
      const existingList = rawStored ? JSON.parse(rawStored) : [];
      const subscribers = Array.isArray(existingList) ? existingList : [];

      if (!subscribers.includes(normalizedEmail)) {
        subscribers.push(normalizedEmail);
        localStorage.setItem("ctc-newsletter-subscribers", JSON.stringify(subscribers));
      }

      const message = "Thanks. Your email has been saved for updates.";
      setNewsletterFeedback({ type: "success", message });
      setEmail("");
      toast.success(message);
    } catch {
      const message = "Could not save your email right now. Please try again.";
      setNewsletterFeedback({ type: "error", message });
      toast.error(message);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const TELEGRAM_CHANNEL_URL = "https://t.me/officialCTCclub";

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Community", href: TELEGRAM_CHANNEL_URL, external: true },
    { label: "About", to: "/about" },
  ];

  return (
    <div className="dark flex min-h-screen flex-col bg-[#050117] text-white">
      {!isAuthPage && (
        <header
          className={`sticky top-0 z-50 w-full transition-all duration-500 ${
            scrolled
              ? "bg-[#08061a]/60 backdrop-blur-2xl border-b border-purple-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex h-16 items-center px-6 lg:px-8 gap-10 max-w-[1400px] w-full">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-auto group">
              <div className="relative">
                <img src={ctcLogo} alt="CTC Club" className="h-9 w-9 rounded-xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                CTC <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Club</span>
              </span>
            </Link>

            <nav className="hidden md:flex gap-0.5 justify-end">
              {navLinks.map((link) => {
                const isActive = Boolean(link.to)
                  && (link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to));

                const navClassName = `relative px-3.5 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`;

                if (link.external) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={navClassName}
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link key={link.label} to={link.to || "/"} className={navClassName}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex font-semibold text-[13px] text-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white h-9 px-4 rounded-lg"
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hidden md:inline-flex font-semibold text-[13px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/25 h-9 px-5 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/30"
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5 text-slate-700 dark:text-slate-300" /> : <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden bg-white/95 backdrop-blur-xl dark:bg-[#0c0f1a]/95 border-t border-slate-100 dark:border-slate-800/50 overflow-hidden"
              >
                <div className="px-6 py-5 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = Boolean(link.to)
                      && (link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to));

                    const navClassName = `block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                    }`;

                    if (link.external) {
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={navClassName}
                        >
                          {link.label}
                        </a>
                      );
                    }

                    return (
                      <Link key={link.label} to={link.to || "/"} className={navClassName}>
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <Button variant="outline" className="w-full h-11 rounded-xl font-semibold" asChild>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600" asChild>
                      <Link to="/register">Get Started Free</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {!isAuthPage && (
        <footer className="bg-[#09090b] text-slate-400 pt-20 pb-10 border-t border-purple-500/10">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
              {/* Brand */}
              <div className="lg:col-span-1">
                <Link to="/" className="flex items-center gap-2.5 mb-5 group">
                  <img src={ctcLogo} alt="CTC Club" className="h-9 w-9 rounded-xl transition-transform group-hover:scale-105" />
                  <span className="text-lg font-bold text-white">
                    CTC <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Club</span>
                  </span>
                </Link>
                <p className="text-sm leading-relaxed text-slate-400 mb-6">
                  The ultimate tech learning platform for university students. Learn, build, and grow your career.
                </p>
                <div className="flex gap-2">
                  {[
                    { Icon: Github, href: "https://github.com/abdisa38" },
                    { Icon: Twitter, href: "https://x.com/bdi3889" },
                    { Icon: Linkedin, href: "https://www.linkedin.com/in/abdisa-awel-92b963383/" },
                    { Icon: Instagram, href: "https://www.instagram.com/abdisa3889/" },
                  ].map(({ Icon, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Platform Links */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Platform</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Courses", to: "/courses" },
                    { label: "Learning Paths", to: "/courses" },
                    { label: "Community", href: TELEGRAM_CHANNEL_URL, external: true },
                    { label: "About", to: "/about" },
                  ].map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                        >
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <Link
                          to={link.to || "/"}
                          className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                        >
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Company</h4>
                <ul className="space-y-3">
                  <li className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">About:</span> CTC Club helps students build practical tech skills with real projects and mentor support.
                  </li>
                  <li className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Privacy Policy:</span> We protect your personal information and only use it for learning platform services.
                  </li>
                  <li className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Terms of Service:</span> Use the platform respectfully, submit original work, and follow community guidelines.
                  </li>
                  <li className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Support:</span> For help with courses or your account, use the support page in your dashboard.
                  </li>
                  <li className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Contact:</span>{" "}
                    <a href="tel:0986182779" className="hover:text-white transition-colors">0986182779</a>
                    {" "}|{" "}
                    <a href="mailto:abdisaawel82@gmail.com" className="hover:text-white transition-colors">abdisaawel82@gmail.com</a>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Stay Updated</h4>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  Get the latest courses and events delivered to your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-300 text-sm h-10 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 shrink-0 h-10 px-3.5 rounded-xl">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  {newsletterFeedback ? (
                    <p className={`text-xs ${newsletterFeedback.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                      {newsletterFeedback.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-300">
                &copy; {new Date().getFullYear()} CTC Club Learning Platform. All rights reserved.
              </p>
              <div className="flex gap-6">
                {["Privacy", "Terms", "Cookies"].map((link) => (
                  <a key={link} href="#" className="text-xs text-slate-300 hover:text-slate-400 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
