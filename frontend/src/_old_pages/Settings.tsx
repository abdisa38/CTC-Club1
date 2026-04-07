import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Bell, Lock, User, Palette, Globe, Github, Linkedin, Shield, LogOut } from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile, preferences, and security.</p>
      </div>

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
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button>Change Avatar</Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600">Remove</Button>
                    </div>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size 2MB.</p>
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
                      <Input defaultValue="Alex" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input defaultValue="Chen" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline / Bio</label>
                    <Input defaultValue="Computer Science Student, Junior" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">About Me</label>
                    <Textarea defaultValue="Passionate about web development and artificial intelligence. Currently learning React and Node.js." rows={4} />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button>Save Changes</Button>
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
                    <Input defaultValue="https://github.com/alexchen" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</label>
                    <Input defaultValue="https://linkedin.com/in/alexchen" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Personal Website</label>
                    <Input placeholder="https://" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button>Update Links</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>The email address associated with your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Input value="alex.chen@university.edu" readOnly disabled className="bg-slate-50" />
                    <Button variant="outline" className="w-full sm:w-auto shrink-0">Change Email</Button>
                  </div>
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Changing email requires verification.
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
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input type="password" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>

              <div className="flex justify-end">
                <Button variant="destructive" className="w-full sm:w-auto"><LogOut className="h-4 w-4 mr-2" /> Log out everywhere</Button>
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
                    { title: 'Course Updates', desc: 'New modules, resources, and announcements from instructors.', checked: true },
                    { title: 'Assignment Feedback', desc: 'When an instructor grades or leaves feedback on your project.', checked: true },
                    { title: 'Community Mentions', desc: 'When someone replies to your comment or mentions you.', checked: false },
                    { title: 'Weekly Summary', desc: 'A summary of your learning progress and upcoming deadlines.', checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="flex items-center h-5">
                        <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white leading-none">{item.title}</span>
                        <span className="text-sm text-slate-500 mt-1">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
                  <Button>Save Preferences</Button>
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
                    <button className="border-2 border-indigo-600 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950">
                      <div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                      <span className="text-sm font-medium text-indigo-600">System Match</span>
                    </button>
                    <button className="border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950">
                      <div className="h-12 w-full rounded bg-white border border-slate-200" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Light Mode</span>
                    </button>
                    <button className="border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-950">
                      <div className="h-12 w-full rounded bg-slate-950 border border-slate-800" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Dark Mode</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
