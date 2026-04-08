import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, Activity, AlertCircle, Search, Edit2, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";

const userActivityData = [
  { name: 'Mon', active: 4000 },
  { name: 'Tue', active: 3000 },
  { name: 'Wed', active: 5000 },
  { name: 'Thu', active: 2780 },
  { name: 'Fri', active: 4890 },
  { name: 'Sat', active: 2390 },
  { name: 'Sun', active: 3490 },
];

const courseCompletionData = [
  { name: 'Web Dev', completed: 120 },
  { name: 'Data Sci', completed: 80 },
  { name: 'Security', completed: 45 },
  { name: 'Mobile', completed: 90 },
  { name: 'Cloud', completed: 60 },
];

type User = {
  id: number;
  name: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  joined: string;
};

export function AdminDashboard({ metrics }: { metrics?: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Alex Chen", role: "Student", status: "Active", joined: "2026-08-15" },
    { id: 2, name: "Prof. Sarah Jenkins", role: "Instructor", status: "Active", joined: "2026-01-10" },
    { id: 3, name: "Emily Parker", role: "Student", status: "Inactive", joined: "2026-08-20" },
    { id: 4, name: "David Kumar", role: "Admin", status: "Active", joined: "2025-11-05" },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRole = () => {
    if (!editingUser) return;
    setIsUpdating(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
      setIsUpdating(false);
      setEditingUser(null);
    }, 1000);
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id 
        ? { ...u, status: currentStatus === "Suspended" ? "Active" : "Suspended" } 
        : u
    ));
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Administration</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of system health, users, and engagement.</p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.totals?.users || "12,450"}</div>
            <p className="text-xs text-emerald-500 font-medium">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.totals?.courses || "145"}</div>
            <p className="text-xs text-emerald-500 font-medium">+4 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">4.2 hrs/wk</div>
            <p className="text-xs text-red-500 font-medium">-0.5 hrs from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">99.9%</div>
            <p className="text-xs text-slate-500 font-medium">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid key="grid-line" strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis key="xaxis-line" dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis key="yaxis-line" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip key="tooltip-line" contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line key="line-active" type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Completions by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid key="grid-bar" strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis key="xaxis-bar" dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <YAxis key="yaxis-bar" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip key="tooltip-bar" cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar key="bar-completed" dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">User Management</CardTitle>
            <CardDescription>Manage platform users, roles, and access.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search users..." 
              className="pl-8 bg-slate-50 dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No users found.</TableCell>
                </TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-white">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Instructor' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Suspended' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{user.joined}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                        if (open) {
                          setEditingUser(user);
                          setNewRole(user.role);
                        } else {
                          setEditingUser(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" title="Edit Role"><Edit2 className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Role: {user.name}</DialogTitle>
                            <DialogDescription>Assign a different role to change their platform permissions.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">New Role</label>
                              <select 
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                              >
                                <option value="Student">Student</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdateRole} disabled={isUpdating || newRole === user.role}>
                              {isUpdating ? "Updating..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${user.status === 'Suspended' ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-500 hover:text-red-600'}`}
                        title={user.status === 'Suspended' ? "Unsuspend User" : "Suspend User"}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === 'Suspended' ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => handleDeleteUser(user.id)} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" title="Delete User"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <span className="text-sm text-slate-500">Showing {filteredUsers.length} entries</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}