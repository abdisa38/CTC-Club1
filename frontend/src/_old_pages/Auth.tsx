import { useState } from "react";
import { Link, useNavigate } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import ctcLogo from "figma:asset/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";
import { motion } from "framer-motion";
import { ArrowRight, Github, Mail } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0c0f1a] px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-indigo-400/10 via-violet-400/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] space-y-8 relative"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <img src={ctcLogo} alt="CTC Club" className="h-10 w-10 rounded-xl transition-transform group-hover:scale-105" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              CTC <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Club</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Sign in to continue your learning journey" : "Start your tech learning journey today"}
          </p>
        </div>

        <Card className="border-slate-200/60 dark:border-white/[0.06] shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="h-10 rounded-xl text-[13px] font-semibold">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
                <Button type="button" variant="outline" className="h-10 rounded-xl text-[13px] font-semibold">
                  <Mail className="h-4 w-4 mr-2" /> Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-slate-400">or continue with email</span>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <Input type="text" placeholder="John Doe" required className="h-10 rounded-xl" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  University Email
                </label>
                <Input type="email" placeholder="student@university.edu" required className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input type="password" placeholder="••••••••" required className="h-10 rounded-xl" />
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </label>
                  <select className="flex h-10 w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-input-background px-3.5 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:border-ring dark:bg-input/30 text-slate-900 dark:text-slate-100">
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-[13px] text-slate-600 dark:text-slate-400">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/20">
                {isLogin ? "Sign in" : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-[13px] text-slate-500 text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {isLogin ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
