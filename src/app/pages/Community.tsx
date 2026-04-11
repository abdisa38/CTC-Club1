import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { MessageSquare, ArrowUp, ArrowDown, Search, User, Award, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiService, { CommunityPost, CommunityReply, LeaderboardEntry } from "../services/api";

export function Community() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [contributors, setContributors] = useState<LeaderboardEntry[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<CommunityPost["category"]>("general");
  const [newTags, setNewTags] = useState("");

  const [expandedPostId, setExpandedPostId] = useState<string>("");
  const [replies, setReplies] = useState<Record<string, CommunityReply[]>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, { upvotes: number; downvotes: number }>>({});

  const loadData = async () => {
    try {
      setError("");
      const [postData, leaderboard] = await Promise.all([
        apiService.getCommunityPosts({ limit: 50 }),
        apiService.getLeaderboard(),
      ]);
      setPosts(postData.items);
      setContributors(leaderboard.slice(0, 5));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load community feed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = category === "all" || post.category === category;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.tags.some((tag) => tag.toLowerCase().includes(keyword));

      return matchesCategory && matchesSearch;
    });
  }, [posts, category, search]);

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setError("Post title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiService.createCommunityPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setPosts((prev) => [created, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setNewCategory("general");
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId: string, vote: "up" | "down") => {
    try {
      const result = await apiService.voteCommunityPost(postId, vote);
      setVoteCounts((prev) => ({
        ...prev,
        [postId]: { upvotes: result.upvotes, downvotes: result.downvotes },
      }));
    } catch {
      // Keep UI responsive even if voting fails silently.
    }
  };

  const handleToggleReplies = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId("");
      return;
    }

    setExpandedPostId(postId);
    if (replies[postId]) return;

    try {
      const postReplies = await apiService.getCommunityReplies(postId);
      setReplies((prev) => ({ ...prev, [postId]: postReplies }));
    } catch {
      setReplies((prev) => ({ ...prev, [postId]: [] }));
    }
  };

  const handleReply = async (postId: string) => {
    const draft = (replyDraft[postId] || "").trim();
    if (!draft) return;

    try {
      const created = await apiService.addCommunityReply(postId, draft);
      setReplies((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setReplyDraft((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, repliesCount: Number(post.repliesCount || 0) + 1 } : post
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to post reply");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Community Forum</h1>
          <p className="text-slate-500 dark:text-slate-400">Discuss courses, ask questions, and help each other grow.</p>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <Card className="border-2 border-indigo-100 dark:border-indigo-900/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <Input placeholder="Post title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <Textarea placeholder="Share your question or idea..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CommunityPost["category"])}
                className="h-10 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-800"
              >
                <option value="general">General</option>
                <option value="qna">Q&A</option>
                <option value="showcase">Showcase</option>
              </select>
              <Input
                className="sm:col-span-2"
                placeholder="Tags (comma separated, e.g. react, hooks)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreatePost} disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}>
                {isSubmitting ? "Posting..." : "Create Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input className="pl-9" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <EmptyState text="No posts match your filters." />
          ) : (
            filteredPosts.map((post) => {
              const upvotes = voteCounts[post._id]?.upvotes ?? (Array.isArray(post.upvotes) ? post.upvotes.length : 0);
              const downvotes = voteCounts[post._id]?.downvotes ?? (Array.isArray(post.downvotes) ? post.downvotes.length : 0);
              const postReplies = replies[post._id] || [];

              return (
                <Card key={post._id} className={post.isPinned ? "border-amber-200 dark:border-amber-900/30" : ""}>
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="flex flex-row sm:flex-col items-center justify-start gap-1 p-3 bg-slate-50 dark:bg-slate-900/50 sm:border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800 sm:w-16 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleVote(post._id, "up")}>
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="font-bold text-sm text-slate-900 dark:text-white my-1">{upvotes - downvotes}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleVote(post._id, "down")}>
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.user?.avatar} />
                            <AvatarFallback>{post.user?.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{post.user?.name || "User"}</span>
                          {post.user?.role ? (
                            <Badge variant="secondary" className="text-[10px] h-5 capitalize">
                              {post.user.role}
                            </Badge>
                          ) : null}
                          <span className="text-xs text-slate-500 ml-2">• {new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                        {post.isPinned ? <Badge variant="outline">Pinned</Badge> : null}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{post.content}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={`${post._id}-${tag}`} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => void handleToggleReplies(post._id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {post.repliesCount || 0} Replies
                        </Button>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {post.category}
                        </Badge>
                      </div>

                      {expandedPostId === post._id ? (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                          {postReplies.length === 0 ? (
                            <p className="text-sm text-slate-500">No replies yet.</p>
                          ) : (
                            postReplies.map((reply) => (
                              <div key={reply._id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{reply.user?.name || "User"}</span>
                                  <span>•</span>
                                  <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</p>
                              </div>
                            ))
                          )}

                          <div className="flex gap-2">
                            <Input
                              placeholder="Write a reply..."
                              value={replyDraft[post._id] || ""}
                              onChange={(e) => setReplyDraft((prev) => ({ ...prev, [post._id]: e.target.value }))}
                            />
                            <Button onClick={() => void handleReply(post._id)} disabled={!(replyDraft[post._id] || "").trim()}>
                              Reply
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["general", "qna", "showcase"].map((name) => (
                <Badge key={name} variant="secondary" className="cursor-pointer capitalize" onClick={() => setCategory(name)}>
                  {name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contributors.length === 0 ? (
              <p className="text-sm text-slate-500">No contributor data available.</p>
            ) : (
              contributors.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold w-4">{entry.rank}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{entry.name}</p>
                    <p className="text-xs text-indigo-600">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nothing to show</h3>
      <p className="text-sm text-slate-500 mt-1">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}
