import { useEffect, useMemo, useState } from "react";
import { Search, MessageSquare, Reply, Trash2, Star, Clock, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import apiService, { CommunityPost } from "../../services/api";

const initials = (name?: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
};

const toCourseLabel = (post: CommunityPost): string => {
  if (!post.course) return "General Discussion";
  if (typeof post.course === "string") return "Course Discussion";
  return post.course.title || "Course Discussion";
};

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "";
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return "";

  const diff = Date.now() - target;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(iso).toLocaleDateString();
};

export function InstructorComments() {
  const [activeFilter, setActiveFilter] = useState<"unanswered" | "answered" | "all">("unanswered");
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const payload = await apiService.getCommunityPosts({
        category: "qna",
        managed: true,
        page: 1,
        limit: 200,
      });
      setPosts(payload.items);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load discussions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const unansweredCount = useMemo(() => posts.filter((post) => (post.repliesCount || 0) === 0).length, [posts]);

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeFilter === "unanswered" && (post.repliesCount || 0) > 0) return false;
      if (activeFilter === "answered" && (post.repliesCount || 0) === 0) return false;

      if (!keyword) return true;
      const haystack = [
        post.title,
        post.content,
        post.user?.name || "",
        toCourseLabel(post),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [posts, activeFilter, searchTerm]);

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;

    setBusyPostId(postId);
    setError("");
    try {
      await apiService.addCommunityReply(postId, replyText.trim());
      setPosts((prev) => prev.map((post) => (
        post._id === postId
          ? { ...post, repliesCount: (post.repliesCount || 0) + 1 }
          : post
      )));
      setReplyingTo(null);
      setReplyText("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to post reply");
    } finally {
      setBusyPostId(null);
    }
  };

  const handlePinToggle = async (post: CommunityPost) => {
    setBusyPostId(post._id);
    setError("");
    try {
      const updated = await apiService.pinCommunityPost(post._id, !post.isPinned);
      setPosts((prev) => prev.map((item) => (item._id === post._id ? updated : item)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update pinned state");
    } finally {
      setBusyPostId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this discussion post?")) return;

    setBusyPostId(postId);
    setError("");
    try {
      await apiService.deleteCommunityPost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      if (replyingTo === postId) {
        setReplyingTo(null);
        setReplyText("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setBusyPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Discussions & Q&A</h1>
        <p className="text-slate-500 dark:text-slate-400">Answer student questions, manage lesson discussions, and highlight top answers.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter("unanswered")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === "unanswered"
                ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Needs Reply
            <Badge className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">{unansweredCount}</Badge>
          </button>

          <button
            onClick={() => setActiveFilter("answered")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === "answered"
                ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Answered
          </button>

          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search discussions..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post._id} className={(post.repliesCount || 0) === 0 ? "border-orange-200 dark:border-orange-900/30" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="mt-1">
                    <AvatarImage src={post.user?.avatar} />
                    <AvatarFallback>{initials(post.user?.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{post.user?.name || "Student"}</h4>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {formatRelativeTime(post.createdAt)}
                      </span>
                      {post.isPinned ? <Badge variant="success">Pinned</Badge> : null}
                    </div>

                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">{toCourseLabel(post)}</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-3 text-sm whitespace-pre-wrap">{post.content}</p>

                    <p className="text-xs text-slate-500 mt-2">
                      Replies: {post.repliesCount || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${post.isPinned ? "text-amber-500" : "text-slate-400"} hover:text-amber-500`}
                    onClick={() => void handlePinToggle(post)}
                    disabled={busyPostId === post._id}
                  >
                    <Star className={`h-4 w-4 ${post.isPinned ? "fill-amber-500" : ""}`} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => void handleDelete(post._id)}
                    disabled={busyPostId === post._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {replyingTo !== post._id ? (
                <div className="mt-4 ml-12">
                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(post._id)}>
                    <Reply className="h-4 w-4 mr-2" /> Write Reply
                  </Button>
                </div>
              ) : (
                <div className="mt-4 ml-12 space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-300 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => void handleReply(post._id)}
                      disabled={busyPostId === post._id || !replyText.trim()}
                    >
                      {busyPostId === post._id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Post Reply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p>No discussions to display.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}