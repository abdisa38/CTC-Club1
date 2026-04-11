import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import ctcLogo from "../../assets/f6c46c16a776a1f63a42e49b36947669f8dcc942.png";
import { motion } from "motion/react";
import { ArrowRight, Github, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";

type OAuthProvider = "google" | "github";

export function Auth() {
  const { pathname, search } = useLocation();
  const [isLogin, setIsLogin] = useState(pathname === "/login");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<OAuthProvider | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotFormData, setForgotFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
  });
  const [isSendingResetCode, setIsSendingResetCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    setIsLogin(pathname === "/login" || pathname === "/");
    setErrorMsg("");
    setForgotMsg("");
    setForgotOpen(false);
  }, [pathname]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const oauthStatus = params.get("oauth");
    const oauthEmail = params.get("email");
    const oauthMessage = params.get("message");

    if (oauthEmail) {
      setFormData((prev) => ({ ...prev, email: oauthEmail }));
      setForgotFormData((prev) => ({ ...prev, email: oauthEmail }));
    }

    if (!oauthStatus) {
      return;
    }

    if (oauthStatus === "success") {
      void (async () => {
        try {
          const currentUser = await apiService.getCurrentUser();
          login(currentUser);
          redirectByRole(currentUser.role);
        } catch {
          setErrorMsg("Social login completed, but we could not load your account. Please try again.");
          navigate(pathname, { replace: true });
        }
      })();

      return;
    }

    setErrorMsg(oauthMessage || "Social login failed. Please try again.");
    navigate(pathname, { replace: true });
  }, [search, pathname, navigate, login]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg("");
    setForgotMsg("");
    setForgotOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    if (name === "email") {
      setForgotFormData((prev) => ({ ...prev, email: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const user = await apiService.loginUser(formData.email, formData.password);
        login(user);
        redirectByRole(user.role);
      } else {
        const user = await apiService.registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        login(user);
        redirectByRole(user.role);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: OAuthProvider) => {
    setErrorMsg("");
    setForgotMsg("");
    setSocialLoadingProvider(provider);
    window.location.assign(apiService.getOAuthLoginUrl(provider));
  };

  const toggleForgotPassword = () => {
    const nextOpen = !forgotOpen;
    setForgotOpen(nextOpen);
    setErrorMsg("");
    setForgotMsg("");

    if (nextOpen) {
      setForgotFormData((prev) => ({
        ...prev,
        email: formData.email || prev.email,
      }));
    }
  };

  const handleForgotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setFormData((prev) => ({ ...prev, email: value }));
    }
  };

  const handleSendResetCode = async () => {
    if (!forgotFormData.email.trim()) {
      setErrorMsg("Please enter your email address first.");
      return;
    }

    setErrorMsg("");
    setForgotMsg("");
    setIsSendingResetCode(true);

    try {
      await apiService.requestPasswordResetCode(forgotFormData.email.trim());
      setForgotMsg("Reset code sent. Check your email and enter the code below.");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsSendingResetCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotFormData.email.trim() || !forgotFormData.code.trim() || !forgotFormData.newPassword.trim()) {
      setErrorMsg("Email, reset code, and new password are required.");
      return;
    }

    setErrorMsg("");
    setForgotMsg("");
    setIsResettingPassword(true);

    try {
      const user = await apiService.resetPasswordWithCode({
        email: forgotFormData.email.trim(),
        code: forgotFormData.code.trim(),
        newPassword: forgotFormData.newPassword,
      });

      login(user);
      redirectByRole(user.role);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/app/admin");
        break;
      case "instructor":
        navigate("/app/instructor/courses");
        break;
      case "student":
      default:
        navigate("/app/dashboard"); // The Dashboard acts as traffic controller or default student view
        break;
    }
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
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <img src={ctcLogo} alt="CTC Club" className="h-10 w-10 rounded-xl transition-transform group-hover:scale-105" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              CTC <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Club</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-4">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Sign in to continue your learning journey" : "Start your tech learning journey today"}
          </p>
        </div>

        <Card className="border-slate-200/60 dark:border-white/[0.06] shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          {errorMsg && (
            <div className="bg-red-100 text-red-700 text-sm text-center font-medium mx-6 mt-4 p-2 rounded-lg break-words">
              {errorMsg}
            </div>
          )}
          {forgotMsg && (
            <div className="bg-emerald-100 text-emerald-700 text-sm text-center font-medium mx-6 mt-4 p-2 rounded-lg break-words">
              {forgotMsg}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl text-[13px] font-semibold"
                  onClick={() => handleOAuth("github")}
                  disabled={Boolean(socialLoadingProvider)}
                >
                  <Github className="h-4 w-4 mr-2" />
                  {socialLoadingProvider === "github" ? "Connecting..." : "GitHub"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl text-[13px] font-semibold"
                  onClick={() => handleOAuth("google")}
                  disabled={Boolean(socialLoadingProvider)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {socialLoadingProvider === "google" ? "Connecting..." : "Google"}
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
                  <Input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    required={!isLogin} 
                    className="h-10 rounded-xl" 
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@university.edu" 
                  autoComplete="email"
                  required 
                  className="h-10 rounded-xl" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  required 
                  className="h-10 rounded-xl" 
                />
              </div>

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
                  </button>
                </div>
              )}

              {isLogin && forgotOpen && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] p-3 space-y-3 bg-slate-50/70 dark:bg-white/[0.02]">
                  <p className="text-xs text-slate-500">Send a reset code to your email, then set a new password.</p>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={forgotFormData.email}
                      onChange={handleForgotInputChange}
                      placeholder="student@university.edu"
                      autoComplete="email"
                      className="h-9 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">Reset Code</label>
                    <Input
                      type="text"
                      name="code"
                      value={forgotFormData.code}
                      onChange={handleForgotInputChange}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      className="h-9 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">New Password</label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={forgotFormData.newPassword}
                      onChange={handleForgotInputChange}
                      placeholder="Enter a new password"
                      className="h-9 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg text-xs"
                      onClick={() => { void handleSendResetCode(); }}
                      disabled={isSendingResetCode || isResettingPassword}
                    >
                      {isSendingResetCode ? "Sending..." : "Send Code"}
                    </Button>
                    <Button
                      type="button"
                      className="h-9 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => { void handleResetPassword(); }}
                      disabled={isResettingPassword || isSendingResetCode}
                    >
                      {isResettingPassword ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button disabled={isLoading || isSendingResetCode || isResettingPassword || Boolean(socialLoadingProvider)} type="submit" className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/20">
                {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <p className="text-[13px] text-slate-500 text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
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
