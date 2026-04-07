import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Users, Search, Edit2, Trash2, ShieldAlert, ShieldCheck, UserPlus, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  joined: string;
  lastActive: string;
  courses: number;
};

const initialUsers: User[] = [
  { id: 1, name: "Alex Chen", email: "alex.chen@university.edu", role: "Student", status: "Active", joined: "2026-08-15", lastActive: "2 hours ago", courses: 4 },
  { id: 2, name: "Prof. Sarah Jenkins", email: "s.jenkins@university.edu", role: "Instructor", status: "Active", joined: "2026-01-10", lastActive: "30 min ago", courses: 6 },
  { id: 3, name: "Emily Parker", email: "e.parker@university.edu", role: "Student", status: "Inactive", joined: "2026-08-20", lastActive: "3 weeks ago", courses: 2 },
  { id: 4, name: "David Kumar", email: "d.kumar@university.edu", role: "Admin", status: "Active", joined: "2025-11-05", lastActive: "Just now", courses: 0 },
  { id: 5, name: "Maria Rodriguez", email: "m.rodriguez@university.edu", role: "Student", status: "Active", joined: "2026-09-01", lastActive: "1 day ago", courses: 3 },
  { id: 6, name: "Prof. James Wright", email: "j.wright@university.edu", role: "Instructor", status: "Active", joined: "2025-06-15", lastActive: "5 hours ago", courses: 8 },
  { id: 7, name: "Sofia Nguyen", email: "s.nguyen@university.edu", role: "Student", status: "Suspended", joined: "2026-07-22", lastActive: "2 months ago", courses: 1 },
  { id: 8, name: "Liam O'Brien", email: "l.obrien@university.edu", role: "Student", status: "Active", joined: "2026-09-10", lastActive: "4 hours ago", courses: 5 },
  { id: 9, name: "Prof. Aisha Patel", email: "a.patel@university.edu", role: "Instructor", status: "Inactive", joined: "2025-09-20", lastActive: "1 month ago", courses: 3 },
  { id: 10, name: "Ryan Kim", email: "r.kim@university.edu", role: "Student", status: "Active", joined: "2026-08-28", lastActive: "12 hours ago", courses: 4 },
];

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Student" });
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 5;

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
        ? { ...u, status: currentStatus === "Suspended" ? "Active" as const : "Suspended" as const }
        : u
    ));
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirmId(null);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    setIsAdding(true);
    setTimeout(() => {
      const user: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "Active",
        joined: new Date().toISOString().split("T")[0],
        lastActive: "Just now",
        courses: 0,
      };
      setUsers(prev => [user, ...prev]);
      setIsAdding(false);
      setAddDialogOpen(false);
      setNewUser({ name: "", email: "", role: "Student" });
    }, 1200);
  };

  const filteredByTab = activeTab === "all" ? users :
    activeTab === "students" ? users.filter(u => u.role === "Student") :
    activeTab === "instructors" ? users.filter(u => u.role === "Instructor") :
    users.filter(u => u.role === "Admin");

  const filteredUsers = filteredByTab.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "Active").length,
    students: users.filter(u => u.role === "Student").length,
    instructors: users.filter(u => u.role === "Instructor").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all platform users, roles, and permissions.</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new platform user account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <Input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="user@university.edu" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email || isAdding} className="bg-purple-600 hover:bg-purple-700">
                {isAdding ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-slate-500">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.active}</div>
            <p className="text-xs text-slate-500">{Math.round((stats.active / stats.total) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.students}</div>
            <p className="text-xs text-slate-500">Enrolled learners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.instructors}</div>
            <p className="text-xs text-slate-500">Teaching staff</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">All Users</CardTitle>
              <CardDescription>Browse, search, and manage user accounts.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, email, or role..."
                className="pl-8 bg-slate-50 dark:bg-slate-900"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All ({users.length})</TabsTrigger>
              <TabsTrigger value="students">Students ({stats.students})</TabsTrigger>
              <TabsTrigger value="instructors">Instructors ({stats.instructors})</TabsTrigger>
              <TabsTrigger value="admins">Admins ({users.filter(u => u.role === "Admin").length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                <TableHead className="hidden lg:table-cell">Courses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                      <p className="text-slate-500 font-medium">No users found</p>
                      <p className="text-sm text-slate-400">Try adjusting your search or filter.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : user.role === "Instructor" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "Active" ? "success" : user.status === "Suspended" ? "destructive" : "secondary"}
                      className="text-[10px] uppercase"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500">{user.joined}</TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500">{user.lastActive}</TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500">{user.courses}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                        if (open) { setEditingUser(user); setNewRole(user.role); }
                        else { setEditingUser(null); }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" title="Edit Role">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Role: {user.name}</DialogTitle>
                            <DialogDescription>Change this user's platform role and permissions.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">New Role</label>
                              <select
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 dark:border-slate-800 text-slate-900 dark:text-slate-100"
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
                            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                            <Button onClick={handleUpdateRole} disabled={isUpdating || newRole === user.role} className="bg-purple-600 hover:bg-purple-700">
                              {isUpdating ? "Updating..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${user.status === "Suspended" ? "text-emerald-500 hover:text-emerald-600" : "text-slate-500 hover:text-amber-600"}`}
                        title={user.status === "Suspended" ? "Unsuspend User" : "Suspend User"}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === "Suspended" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </Button>

                      <Dialog open={deleteConfirmId === user.id} onOpenChange={(open) => setDeleteConfirmId(open ? user.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" title="Delete User">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                          <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Delete User</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            <span className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={page === currentPage ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
