import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Users, Search, Edit2, Trash2, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import apiService, { AuthUser } from "../services/api";

export function AdminUsers() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "students" | "instructors" | "admins">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [newRole, setNewRole] = useState<AuthUser["role"]>("student");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string>("");

  const fetchUsers = async () => {
    try {
      setError("");
      setIsLoading(true);

      const roleParam =
        activeTab === "students" ? "student" : activeTab === "instructors" ? "instructor" : activeTab === "admins" ? "admin" : "all";

      const payload = await apiService.getUsers({
        page: currentPage,
        limit: 10,
        keyword: searchQuery || undefined,
        role: roleParam,
      });

      setUsers(payload.items);
      setTotalUsers(payload.total);
      setTotalPages(payload.pages);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      void fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === "student").length;
    const instructors = users.filter((u) => u.role === "instructor").length;
    const admins = users.filter((u) => u.role === "admin").length;

    return {
      total: totalUsers,
      active: users.length,
      students,
      instructors,
      admins,
    };
  }, [totalUsers, users]);

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const updated = await apiService.updateUserRole(editingUser._id, newRole);
      setUsers((prev) => prev.map((user) => (user._id === updated._id ? updated : user)));
      setEditingUser(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser & { isActive?: boolean }) => {
    const current = user.isActive !== false;

    setIsUpdating(true);
    try {
      const updated = await apiService.updateUserStatus(user._id, !current);
      setUsers((prev) => prev.map((u: any) => (u._id === updated._id ? { ...u, ...updated } : u)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update user status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsUpdating(true);
    try {
      await apiService.softDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setDeleteConfirmId("");
      setTotalUsers((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage platform roles and account access from live backend data.</p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.total} icon={<Users className="h-4 w-4 text-purple-500" />} subtitle="All registered accounts" />
        <StatCard title="Loaded This Page" value={stats.active} icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} subtitle="Current query result" />
        <StatCard title="Students" value={stats.students} icon={<Users className="h-4 w-4 text-indigo-500" />} subtitle="Students in current view" />
        <StatCard title="Instructors" value={stats.instructors} icon={<Users className="h-4 w-4 text-amber-500" />} subtitle="Instructors in current view" />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">All Users</CardTitle>
              <CardDescription>Search, filter, and update roles or access.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search name or email..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: "all", label: "All" },
              { key: "students", label: "Students" },
              { key: "instructors", label: "Instructors" },
              { key: "admins", label: "Admins" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveTab(tab.key as typeof activeTab);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <p className="text-slate-500">No users found.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: any) => {
                      const active = user.isActive !== false;
                      const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

                      return (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : user.role === "instructor" ? "secondary" : "outline"}>{roleLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={active ? "success" : "destructive"} className="text-[10px] uppercase">
                              {active ? "Active" : "Suspended"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-500">{user.email}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Dialog
                                open={editingUser?._id === user._id}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setEditingUser(user);
                                    setNewRole(user.role);
                                  } else {
                                    setEditingUser(null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-600" title="Edit Role">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Role: {user.name}</DialogTitle>
                                    <DialogDescription>Change this user role and permissions.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-2 py-3">
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
                                      value={newRole}
                                      onChange={(e) => setNewRole(e.target.value as AuthUser["role"])}
                                    >
                                      <option value="student">Student</option>
                                      <option value="instructor">Instructor</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateRole} disabled={isUpdating || newRole === user.role}>
                                      {isUpdating ? "Saving..." : "Save"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${active ? "text-slate-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"}`}
                                title={active ? "Suspend User" : "Activate User"}
                                onClick={() => void handleToggleStatus(user)}
                                disabled={isUpdating}
                              >
                                {active ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                              </Button>

                              <Dialog open={deleteConfirmId === user._id} onOpenChange={(open) => setDeleteConfirmId(open ? user._id : "")}> 
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" title="Delete User">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[400px]">
                                  <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                    <DialogDescription>
                                      Delete {user.name}? This will soft-delete the account from active lists.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirmId("")}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => void handleDeleteUser(user._id)} disabled={isUpdating}>
                                      {isUpdating ? "Deleting..." : "Delete"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
                <span className="text-sm text-slate-500">Page {currentPage} of {Math.max(1, totalPages)}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: number; icon: ReactNode; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}
