import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import {
  Settings, Shield, ToggleLeft, Database, Bell, Download, Upload,
  RefreshCw, CheckCircle, AlertCircle, Clock, Trash2, Save, Send
} from "lucide-react";
import { toast } from "sonner";

// Feature Flags
type FeatureFlag = { id: string; name: string; description: string; enabled: boolean; category: string };

const initialFlags: FeatureFlag[] = [
  { id: "quiz", name: "Quiz System", description: "Enable interactive quizzes in courses", enabled: true, category: "Learning" },
  { id: "comments", name: "Comments & Discussions", description: "Allow comments on courses and resources", enabled: true, category: "Social" },
  { id: "projects", name: "Project Submissions", description: "Enable student project submission system", enabled: true, category: "Learning" },
  { id: "leaderboard", name: "Leaderboard", description: "Show competitive leaderboard rankings", enabled: true, category: "Gamification" },
  { id: "certificates", name: "Auto Certificates", description: "Auto-generate certificates on course completion", enabled: false, category: "Learning" },
  { id: "ai_tutor", name: "AI Tutor (Beta)", description: "AI-powered tutoring assistant for students", enabled: false, category: "AI" },
  { id: "live_classes", name: "Live Classes", description: "Enable real-time video classes", enabled: false, category: "Learning" },
  { id: "dark_mode", name: "Dark Mode", description: "Allow users to switch to dark theme", enabled: true, category: "UI" },
  { id: "notifications", name: "Push Notifications", description: "Send browser push notifications", enabled: true, category: "Communication" },
  { id: "analytics_student", name: "Student Analytics", description: "Show analytics dashboard to students", enabled: true, category: "Analytics" },
];

// Backups
type Backup = { id: number; date: string; size: string; type: string; status: "Completed" | "Failed" | "In Progress" };

const initialBackups: Backup[] = [
  { id: 1, date: "2026-04-06 06:00 AM", size: "2.4 GB", type: "Full", status: "Completed" },
  { id: 2, date: "2026-04-05 06:00 AM", size: "2.3 GB", type: "Full", status: "Completed" },
  { id: 3, date: "2026-04-04 06:00 AM", size: "2.3 GB", type: "Full", status: "Completed" },
  { id: 4, date: "2026-04-03 06:00 AM", size: "2.2 GB", type: "Full", status: "Completed" },
  { id: 5, date: "2026-04-02 06:00 AM", size: "0 KB", type: "Full", status: "Failed" },
];

// Roles
type Permission = { id: string; name: string; student: boolean; instructor: boolean; admin: boolean };

const initialPermissions: Permission[] = [
  { id: "view_courses", name: "View Courses", student: true, instructor: true, admin: true },
  { id: "enroll_courses", name: "Enroll in Courses", student: true, instructor: false, admin: true },
  { id: "create_courses", name: "Create Courses", student: false, instructor: true, admin: true },
  { id: "publish_courses", name: "Publish Courses", student: false, instructor: false, admin: true },
  { id: "manage_users", name: "Manage Users", student: false, instructor: false, admin: true },
  { id: "view_analytics", name: "View Analytics", student: false, instructor: true, admin: true },
  { id: "submit_projects", name: "Submit Projects", student: true, instructor: false, admin: false },
  { id: "grade_projects", name: "Grade Projects", student: false, instructor: true, admin: true },
  { id: "moderate_content", name: "Moderate Content", student: false, instructor: false, admin: true },
  { id: "system_settings", name: "System Settings", student: false, instructor: false, admin: true },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [backups, setBackups] = useState<Backup[]>(initialBackups);
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [backingUp, setBackingUp] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState<Backup | null>(null);
  const [saving, setSaving] = useState(false);

  // General settings
  const [siteName, setSiteName] = useState("CTC Club Platform");
  const [supportEmail, setSupportEmail] = useState("support@ctcclub.edu");
  const [maxUploadSize, setMaxUploadSize] = useState("50");

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    newUser: true, coursePublished: true, ticketCreated: true, systemAlerts: true, weeklyReport: true, dailyDigest: false,
  });

  const [globalNotifText, setGlobalNotifText] = useState("");

  const handleToggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      const newBackup: Backup = { id: Date.now(), date: new Date().toLocaleString(), size: "2.4 GB", type: "Manual", status: "Completed" };
      setBackups(prev => [newBackup, ...prev]);
      setBackingUp(false);
      toast.success("Backup completed successfully!");
    }, 3000);
  };

  const handleRestore = () => {
    if (!restoreDialog) return;
    toast.success(`Restore from ${restoreDialog.date} initiated. This may take a few minutes.`);
    setRestoreDialog(null);
  };

  const handleSaveGeneral = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Settings saved!"); }, 1000);
  };

  const handleTogglePermission = (permId: string, role: "student" | "instructor" | "admin") => {
    setPermissions(prev => prev.map(p => p.id === permId ? { ...p, [role]: !p[role] } : p));
  };

  const handleSendGlobalNotif = () => {
    if (!globalNotifText.trim()) return;
    toast.success("Global notification sent to all users!");
    setGlobalNotifText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Configure platform settings, features, backups, and permissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Settings className="h-4 w-4 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="features"><ToggleLeft className="h-4 w-4 mr-1.5" />Features</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-1.5" />Roles</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="backups"><Database className="h-4 w-4 mr-1.5" />Backups</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
              <CardDescription>Core platform configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Name</label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Upload Size (MB)</label>
                  <Input type="number" value={maxUploadSize} onChange={(e) => setMaxUploadSize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800">
                    <option>System Default</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Flags</CardTitle>
              <CardDescription>Toggle platform features on or off.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{flag.name}</p>
                          <Badge variant="outline" className="text-[10px]">{flag.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                      </div>
                    </div>
                    <Switch checked={flag.enabled} onCheckedChange={() => handleToggleFlag(flag.id)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role-Based Permissions</CardTitle>
              <CardDescription>Configure access levels for each role.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Permission</th>
                      <th className="text-center py-3 px-4 font-medium text-indigo-600">Student</th>
                      <th className="text-center py-3 px-4 font-medium text-emerald-600">Instructor</th>
                      <th className="text-center py-3 px-4 font-medium text-purple-600">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <td className="py-3 px-4 text-slate-900 dark:text-white">{perm.name}</td>
                        <td className="text-center py-3 px-4">
                          <Switch checked={perm.student} onCheckedChange={() => handleTogglePermission(perm.id, "student")} />
                        </td>
                        <td className="text-center py-3 px-4">
                          <Switch checked={perm.instructor} onCheckedChange={() => handleTogglePermission(perm.id, "instructor")} />
                        </td>
                        <td className="text-center py-3 px-4">
                          <Switch checked={perm.admin} onCheckedChange={() => handleTogglePermission(perm.id, "admin")} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => toast.success("Permissions saved!")} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" /> Save Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>Configure which system notifications to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(notifSettings).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <span className="text-sm text-slate-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Switch checked={enabled} onCheckedChange={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Global Notification</CardTitle>
              <CardDescription>Send a notification to all platform users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Type notification message..."
                  value={globalNotifText}
                  onChange={(e) => setGlobalNotifText(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSendGlobalNotif} disabled={!globalNotifText.trim()} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups */}
        <TabsContent value="backups" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Backup & Recovery</CardTitle>
                  <CardDescription>Manage database backups and restore points.</CardDescription>
                </div>
                <Button onClick={handleBackup} disabled={backingUp} className="bg-purple-600 hover:bg-purple-700">
                  {backingUp ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Backing up...</> : <><Database className="h-4 w-4 mr-2" /> Create Backup</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${backup.status === "Completed" ? "bg-emerald-50 dark:bg-emerald-900/20" : backup.status === "Failed" ? "bg-red-50 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                        {backup.status === "Completed" ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : backup.status === "Failed" ? <AlertCircle className="h-4 w-4 text-red-600" /> : <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{backup.type} Backup</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{backup.date}</span>
                          <span>{backup.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === "Completed" ? "success" : backup.status === "Failed" ? "destructive" : "outline"} className="text-[10px] uppercase">{backup.status}</Badge>
                      {backup.status === "Completed" && (
                        <>
                          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3 w-3 mr-1" /> Download</Button>
                          <Button variant="outline" size="sm" className="text-xs text-amber-600 hover:text-amber-700" onClick={() => setRestoreDialog(backup)}>
                            <Upload className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Restore Dialog */}
          <Dialog open={!!restoreDialog} onOpenChange={() => setRestoreDialog(null)}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Restore Backup</DialogTitle>
                <DialogDescription>
                  This will restore the database to the state from {restoreDialog?.date}. All data after this point will be lost. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg my-2">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Warning: This is a destructive action
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRestoreDialog(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRestore}>Confirm Restore</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
