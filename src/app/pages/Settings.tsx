import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Bell, User, Palette, Globe, Github, Linkedin, Shield, LogOut, AlertCircle, Loader2, Crown, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { NotificationPreferences, ThemePreference } from "../services/api";

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  courseUpdates: true,
  assignmentFeedback: true,
  communityMentions: false,
  weeklySummary: true,
};

const splitName = (fullName: string) => {
  const safeName = String(fullName || "").trim();
  if (!safeName) {
    return { firstName: "", lastName: "" };
  }

  const parts = safeName.split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

const applyThemePreference = (theme: ThemePreference) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
    return;
  }

  if (theme === "light") {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", prefersDark);
  localStorage.setItem("theme", "system");
};

const formatPremiumDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
};

const extractErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;
  const candidate = responseData?.message ?? responseData?.error ?? responseData;

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    const nestedMessage = (candidate as any).message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }

    try {
      return JSON.stringify(candidate);
    } catch {
      return fallback;
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export function Settings({ embedded = false }: { embedded?: boolean }) {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isStartingPremiumPayment, setIsStartingPremiumPayment] = useState(false);
  const [isVerifyingPremiumPayment, setIsVerifyingPremiumPayment] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    avatar: "",
    github: "",
    linkedin: "",
    website: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationForm, setNotificationForm] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");

  const containerClassName = embedded ? "space-y-6" : "max-w-4xl mx-auto space-y-6";

  const profileInitials = useMemo(() => {
    const base = `${profileForm.firstName} ${profileForm.lastName}`.trim() || user?.name || user?.email || "U";
    const initials = base
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    return initials || "U";
  }, [profileForm.firstName, profileForm.lastName, user?.name, user?.email]);

  const hydrateSettingsForm = (payload: any) => {
    const { firstName, lastName } = splitName(payload?.name || "");

    setProfileForm({
      firstName,
      lastName,
      headline: String(payload?.headline || ""),
      bio: String(payload?.bio || ""),
      avatar: String(payload?.avatar || ""),
      github: String(payload?.socialLinks?.github || ""),
      linkedin: String(payload?.socialLinks?.linkedin || ""),
      website: String(payload?.socialLinks?.website || ""),
    });

    setNotificationForm({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(payload?.preferences?.notifications || {}),
    });

    const nextTheme = (payload?.preferences?.appearance?.theme || "system") as ThemePreference;
    setThemePreference(nextTheme);
    applyThemePreference(nextTheme);
  };

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const currentUser = await apiService.getCurrentUser();
        if (ignore) {
          return;
        }

        hydrateSettingsForm(currentUser);
      } catch (error: any) {
        if (!ignore) {
          console.error('Settings load error:', error);
          setErrorMsg(extractErrorMessage(error, "Failed to load account settings."));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const params = new URLSearchParams(window.location.search);
    const shouldVerify = params.get("premium") === "verify";
    const txRef = params.get("tx_ref") || "";

    if (!shouldVerify || !txRef) {
      return;
    }

    const verifyPremium = async () => {
      setIsVerifyingPremiumPayment(true);
      setErrorMsg("");
      setSuccessMsg("");

      try {
        const verification = await apiService.verifyPremiumPayment(txRef);

        if (ignore) {
          return;
        }

        const refreshedUser = await apiService.getCurrentUser();
        if (ignore) {
          return;
        }

        login(refreshedUser as any);
        hydrateSettingsForm(refreshedUser);

        if (verification.paymentVerified && verification.isPremium) {
          setSuccessMsg("Premium payment verified. Your account is now premium.");
        } else {
          setErrorMsg(verification.reason || "Payment has not completed yet. If you already paid, try again in a few seconds.");
        }
      } catch (error: any) {
        if (!ignore) {
          console.error('Settings init/verify error:', error);
          setErrorMsg(extractErrorMessage(error, "Failed to verify premium payment."));
        }
      } finally {
        if (!ignore) {
          setIsVerifyingPremiumPayment(false);
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("premium");
        cleanUrl.searchParams.delete("tx_ref");
        window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
      }
    };

    void verifyPremium();

    return () => {
      ignore = true;
    };
  }, [login]);

  const updateProfile = async (input: {
    name?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    avatar?: string;
    socialLinks?: { github?: string; linkedin?: string; website?: string };
  }, successText: string) => {
    setIsSavingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const updatedUser = await apiService.updateCurrentUserProfile(input);
      login(updatedUser as any);
      hydrateSettingsForm(updatedUser);
      setSuccessMsg(successText);
    } catch (error: any) {
      setErrorMsg(extractErrorMessage(error, "Failed to update profile settings."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangeAvatar = async () => {
    const nextAvatar = window.prompt("Paste your profile image URL (http/https)", profileForm.avatar || "");
    if (nextAvatar === null) {
      return;
    }

    await updateProfile({ avatar: nextAvatar.trim() }, "Profile picture updated.");
  };

  const handleRemoveAvatar = async () => {
    await updateProfile({ avatar: "" }, "Profile picture removed.");
  };

  const handleSavePersonalInfo = async () => {
    await updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      headline: profileForm.headline,
      bio: profileForm.bio,
    }, "Personal information saved.");
  };

  const handleSaveSocialLinks = async () => {
    await updateProfile({
      socialLinks: {
        github: profileForm.github,
        linkedin: profileForm.linkedin,
        website: profileForm.website,
      },
    }, "Social links updated.");
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMsg("Please fill current password, new password, and confirm password.");
      setSuccessMsg("");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      setSuccessMsg("");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      setSuccessMsg("");
      return;
    }

    setIsSavingPassword(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiService.changeCurrentUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMsg("Password changed successfully.");
    } catch (error: any) {
      setErrorMsg(extractErrorMessage(error, "Failed to change password."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    const currentEmail = user?.email || "";
    const nextEmail = window.prompt("Enter your new email address", currentEmail);

    if (nextEmail === null) {
      return;
    }

    const trimmedEmail = nextEmail.trim();
    if (!trimmedEmail) {
      setErrorMsg("Email cannot be empty.");
      setSuccessMsg("");
      return;
    }

    setIsSavingEmail(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const updatedUser = await apiService.changeCurrentUserEmail(trimmedEmail);
      login(updatedUser as any);
      hydrateSettingsForm(updatedUser);
      setSuccessMsg("Email updated successfully.");
    } catch (error: any) {
      setErrorMsg(extractErrorMessage(error, "Failed to update email."));
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const updatedNotifications = await apiService.updateNotificationPreferences(notificationForm);
      setNotificationForm({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...updatedNotifications });

      if (user) {
        login({
          ...user,
          preferences: {
            ...(user as any).preferences,
            notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...updatedNotifications },
          },
        } as any);
      }

      setSuccessMsg("Notification preferences saved.");
    } catch (error: any) {
      setErrorMsg(extractErrorMessage(error, "Failed to save notification preferences."));
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleThemeSelect = async (nextTheme: ThemePreference) => {
    const previousTheme = themePreference;

    setThemePreference(nextTheme);
    applyThemePreference(nextTheme);
    setIsSavingTheme(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const savedAppearance = await apiService.updateAppearancePreference(nextTheme);
      const savedTheme = savedAppearance.theme || nextTheme;

      setThemePreference(savedTheme);
      applyThemePreference(savedTheme);

      if (user) {
        login({
          ...user,
          preferences: {
            ...(user as any).preferences,
            appearance: { theme: savedTheme },
          },
        } as any);
      }

      setSuccessMsg("Theme updated.");
    } catch (error: any) {
      setThemePreference(previousTheme);
      applyThemePreference(previousTheme);
      setErrorMsg(extractErrorMessage(error, "Failed to update theme preference."));
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleStartPremiumPayment = async () => {
    if (user?.isPremium) {
      setSuccessMsg("Premium access is already active on your account.");
      setErrorMsg("");
      return;
    }

    setIsStartingPremiumPayment(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const init = await apiService.initializePremiumPayment();

      if (init.alreadyPremium || init.isPremium) {
        const refreshedUser = await apiService.getCurrentUser();
        login(refreshedUser as any);
        hydrateSettingsForm(refreshedUser);
        setSuccessMsg("Premium access is already active on your account.");
        return;
      }

      if (!init.checkoutUrl) {
        throw new Error("Checkout URL was not returned by the server.");
      }

      window.location.href = init.checkoutUrl;
    } catch (error: any) {
      setErrorMsg(extractErrorMessage(error, "Failed to start premium checkout."));
    } finally {
      setIsStartingPremiumPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className={containerClassName}>
        {!embedded ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Loading your settings...</p>
          </div>
        ) : null}
        <Card>
          <CardContent className="py-10 flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Fetching account settings from database...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {!embedded ? (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your profile, preferences, and security.</p>
        </div>
      ) : null}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col md:flex-row gap-6">
          
          <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-64 bg-transparent justify-start gap-1 p-0 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'profile', icon: User, label: 'Public Profile' },
              { id: 'account', icon: Shield, label: 'Account Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'appearance', icon: Palette, label: 'Appearance' },
            ].map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className={`w-full justify-start text-left px-4 py-3 h-auto data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-800 rounded-lg ${
                  activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3 shrink-0" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1">
            <TabsContent value="profile" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a picture to help peers recognize you.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border border-slate-200 dark:border-slate-800">
                    <AvatarImage src={profileForm.avatar || undefined} alt="Profile" />
                    <AvatarFallback>{profileInitials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button onClick={handleChangeAvatar} disabled={isSavingProfile}>
                        {isSavingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Change Avatar
                      </Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={handleRemoveAvatar} disabled={isSavingProfile}>
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Use a public image URL (http/https).</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your basic profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline / Bio</label>
                    <Input
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, headline: e.target.value }))}
                      placeholder="Your short headline"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">About Me</label>
                    <Textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      placeholder="Write something about yourself"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button onClick={handleSavePersonalInfo} disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect your profiles to display on your public page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</label>
                    <Input
                      value={profileForm.github}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/your-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</label>
                    <Input
                      value={profileForm.linkedin}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Personal Website</label>
                    <Input
                      value={profileForm.website}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button onClick={handleSaveSocialLinks} disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Update Links
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Access Payments</CardTitle>
                  <CardDescription>Payments are now handled directly on each paid course page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-800/60 dark:bg-indigo-950/20 p-4 text-sm text-slate-700 dark:text-slate-300">
                    Open a paid course and click the payment button there. Free courses remain accessible without checkout.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>The email address associated with your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Input value={user?.email || ""} readOnly disabled className="bg-slate-50" />
                    <Button variant="outline" className="w-full sm:w-auto shrink-0" onClick={handleChangeEmail} disabled={isSavingEmail}>
                      {isSavingEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Change Email
                    </Button>
                  </div>
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Make sure you enter an email you can access.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button onClick={handleChangePassword} disabled={isSavingPassword}>
                    {isSavingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Update Password
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex justify-end">
                <Button variant="destructive" className="w-full sm:w-auto" onClick={() => void logout()}><LogOut className="h-4 w-4 mr-2" /> Log out</Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
               <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what you want to be notified about via email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'courseUpdates', title: 'Course Updates', desc: 'New modules, resources, and announcements from instructors.' },
                    { key: 'assignmentFeedback', title: 'Assignment Feedback', desc: 'When an instructor grades or leaves feedback on your project.' },
                    { key: 'communityMentions', title: 'Community Mentions', desc: 'When someone replies to your comment or mentions you.' },
                    { key: 'weeklySummary', title: 'Weekly Summary', desc: 'A summary of your learning progress and upcoming deadlines.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={Boolean(notificationForm[item.key as keyof NotificationPreferences])}
                          onChange={(e) => {
                            const key = item.key as keyof NotificationPreferences;
                            setNotificationForm((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white leading-none">{item.title}</span>
                        <span className="text-sm text-slate-500 mt-1">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                    {isSavingNotifications ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
               <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize how the platform looks.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => void handleThemeSelect("system")}
                      className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950 ${themePreference === "system" ? "border-indigo-600" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`}
                    >
                      <div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                      <span className={`text-sm font-medium ${themePreference === "system" ? "text-indigo-600" : "text-slate-600 dark:text-slate-400"}`}>System Match</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleThemeSelect("light")}
                      className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950 ${themePreference === "light" ? "border-indigo-600" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`}
                    >
                      <div className="h-12 w-full rounded bg-white border border-slate-200" />
                      <span className={`text-sm font-medium ${themePreference === "light" ? "text-indigo-600" : "text-slate-600 dark:text-slate-400"}`}>Light Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleThemeSelect("dark")}
                      className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950 ${themePreference === "dark" ? "border-indigo-600" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`}
                    >
                      <div className="h-12 w-full rounded bg-slate-950 border border-slate-800" />
                      <span className={`text-sm font-medium ${themePreference === "dark" ? "text-indigo-600" : "text-slate-600 dark:text-slate-400"}`}>Dark Mode</span>
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    {isSavingTheme ? "Saving theme preference..." : "Theme is saved automatically when you select an option."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
