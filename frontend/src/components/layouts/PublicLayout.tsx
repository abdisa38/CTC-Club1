import { Outlet, Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Menu, X, Github, Twitter, Linkedin, Youtube, Instagram, Mail, ArrowRight, ArrowUpRight } from "lucide-react";
import { Input } from "../ui/input";
import ctcLogo from "figma:asset/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";

export function PublicLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/app/courses" },
    { label: "Resources", to: "/app/resources" },
    { label: "Community", to: "/app/community" },
    { label: "About", to: "/features" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0c0f1a]">
      {!isAuthPage && (
        <header
          className={`sticky top-0 z-50 w-full transition-all duration-500 ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border-b border-slate-200/60 dark:bg-[#0c0f1a]/80 dark:border-slate-800/40 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex h-16 items-center px-6 lg:px-8 gap-10 max-w-[1400px] w-full">
            <Linkhref= className="flex items-center gap-2.5 shrink-0 mr-auto group">
              <div className="relative">
                <img src={ctcLogo} alt="CTC Club" className="h-9 w-9 rounded-xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CTC <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Club</span>
              </span>
            </Link>

            <nav className="hidden md:flex gap-0.5 justify-end">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                    location.pathname === link.to
                      ? "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex font-semibold text-[13px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white h-9 px-4 rounded-lg"
              >
                <Linkhref=>Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hidden md:inline-flex font-semibold text-[13px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/25 h-9 px-5 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/30"
              >
                <Linkhref=>Get Started Free</Link>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        location.pathname === link.to
                          ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <Button variant="outline" className="w-full h-11 rounded-xl font-semibold" asChild>
                      <Linkhref=>Log in</Link>
                    </Button>
                    <Button className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600" asChild>
                      <Linkhref=>Get Started Free</Link>
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
        <footer className="bg-[#0c0f1a] text-slate-400 pt-20 pb-10 border-t border-slate-800/50">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
              {/* Brand */}
              <div className="lg:col-span-1">
                <Linkhref= className="flex items-center gap-2.5 mb-5 group">
                  <img src={ctcLogo} alt="CTC Club" className="h-9 w-9 rounded-xl transition-transform group-hover:scale-105" />
                  <span className="text-lg font-bold text-white">
                    CTC <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Club</span>
                  </span>
                </Link>
                <p className="text-sm leading-relaxed text-slate-500 mb-6">
                  The ultimate tech learning platform for university students. Learn, build, and grow your career.
                </p>
                <div className="flex gap-2">
                  {[
                    { Icon: Twitter, href: "#" },
                    { Icon: Github, href: "#" },
                    { Icon: Linkedin, href: "#" },
                    { Icon: Youtube, href: "#" },
                    { Icon: Instagram, href: "#" },
                  ].map(({ Icon, href }, i) => (
                    <a
                      key={i}
                      href={href}
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
                  {["Courses", "Resources", "Community", "Leaderboard", "Projects"].map((link) => (
                    <li key={link}>
                      <Link
                        to={`/app/${link.toLowerCase()}`}
                        className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                      >
                        {link}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Company</h4>
                <ul className="space-y-3">
                  {["About", "Contact", "Privacy Policy", "Terms of Service", "Support"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group">
                        {link}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Stay Updated</h4>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Get the latest courses and events delivered to your inbox.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="you@email.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-sm h-10 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shrink-0 h-10 px-3.5 rounded-xl">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-600">
                &copy; {new Date().getFullYear()} CTC Club Learning Platform. All rights reserved.
              </p>
              <div className="flex gap-6">
                {["Privacy", "Terms", "Cookies"].map((link) => (
                  <a key={link} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
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
