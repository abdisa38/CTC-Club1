import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Loader2, Pin, PinOff, Trash2, ShieldCheck, MessageSquare, CalendarDays, Megaphone } from "lucide-react";
import apiService, { CommunityPost } from "../../services/api";

const toAuthor = (post: CommunityPost) => post.user?.name || "User";

const toScore = (post: CommunityPost) => {
  const upvotes = Array.isArray(post.upvotes) ? post.upvotes.length : 0;
  const downvotes = Array.isArray(post.downvotes) ? post.downvotes.length : 0;
  return upvotes - downvotes;
};

export function AdminModeration() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "general" | "qna" | "showcase">("all");
  const [busyPostId, setBusyPostId] = useState<string | null>(null);

  const loadPosts = async () => {
    setError("");
    setLoading(true);
    try {
      // Backend excludes announcement category by default, keeping moderation separate.
      const payload = await apiService.getCommunityPosts({ limit: 200, page: 1 });
      setPosts(payload.items);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load moderation feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "all" || post.category === category;
      const matchesSearch = !keyword || [post.title, post.content, toAuthor(post), ...(post.tags || [])].join(" ").toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [posts, search, category]);

  const summary = useMemo(() => {
    const pinned = posts.filter((post) => post.isPinned).length;
    const qna = posts.filter((post) => post.category === "qna").length;
    const showcase = posts.filter((post) => post.category === "showcase").length;
    return { total: posts.length, pinned, qna, showcase };
  }, [posts]);

  const handleTogglePin = async (post: CommunityPost) => {
    setBusyPostId(post._id);
    setError("");
    try {
      const updated = await apiService.pinCommunityPost(post._id, !post.isPinned);
      setPosts((prev) => prev.map((item) => (item._id === post._id ? updated : item)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update pin state");
    } finally {
      setBusyPostId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this community post?")) return;

    setBusyPostId(postId);
    setError("");
    try {
      await apiService.deleteCommunityPost(postId);
      setPosts((prev) => prev.filter((item) => item._id !== postId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setBusyPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Moderation</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Moderate community discussions only (General, Q&A, Showcase). Events, Announcements, and Broadcast Notifications are managed in their own pages.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Discussions</CardDescription>
            <CardTitle className="text-2xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pinned Posts</CardDescription>
            <CardTitle className="text-2xl">{summary.pinned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Q&A Threads</CardDescription>
            <CardTitle className="text-2xl">{summary.qna}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Showcase Threads</CardDescription>
            <CardTitle className="text-2xl">{summary.showcase}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Separation Guide</CardTitle>
          <CardDescription>Use the right module so content does not appear in the wrong place.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-600" /> Moderation</p>
            <p className="text-xs text-slate-500 mt-1">Student/instructor discussion cleanup, pinning, and policy enforcement.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-600" /> Events</p>
            <p className="text-xs text-slate-500 mt-1">Scheduled webinars, workshops, and date-based sessions.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Megaphone className="h-4 w-4 text-indigo-600" /> Announcements</p>
            <p className="text-xs text-slate-500 mt-1">Platform update posts for the announcements feed.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare className="h-4 w-4 text-indigo-600" /> Broadcast Notifications</p>
            <p className="text-xs text-slate-500 mt-1">Inbox push notices delivered to users without creating announcement/event records.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input className="pl-9" placeholder="Search community posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "all" | "general" | "qna" | "showcase")}
              className="h-10 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
            >
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="qna">Q&A</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">No moderation items match this filter.</CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post._id} className={post.isPinned ? "border-amber-200 dark:border-amber-900/30" : ""}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{post.title}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{post.category}</Badge>
                      {post.isPinned ? <Badge variant="outline">Pinned</Badge> : null}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{post.content}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>By {toAuthor(post)}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Score {toScore(post)}</span>
                      <span>•</span>
                      <span>{post.repliesCount || 0} replies</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => void handleTogglePin(post)} disabled={busyPostId === post._id}>
                      {post.isPinned ? <PinOff className="h-3.5 w-3.5 mr-1" /> : <Pin className="h-3.5 w-3.5 mr-1" />}
                      {post.isPinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => void handleDelete(post._id)} disabled={busyPostId === post._id}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
