import { useState } from "react";
import { Search, MessageSquare, Reply, Trash2, Star, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";

export function InstructorComments() {
  const [activeFilter, setActiveFilter] = useState("unanswered");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const comments = [
    {
      id: "c1",
      studentName: "Emily Parker",
      avatar: "https://i.pravatar.cc/150?u=4",
      course: "Advanced React Patterns",
      lesson: "Higher-Order Components",
      time: "2 hours ago",
      text: "I'm having trouble understanding how to type the wrapped component props in TypeScript. Any tips?",
      status: "unanswered",
      isImportant: false
    },
    {
      id: "c2",
      studentName: "David Kumar",
      avatar: "https://i.pravatar.cc/150?u=3",
      course: "Full-Stack Web Development",
      lesson: "JWT Authentication",
      time: "1 day ago",
      text: "Is it secure to store the JWT in localStorage instead of an HttpOnly cookie? I've seen both approaches.",
      status: "answered",
      isImportant: true,
      reply: "Great question! Storing JWT in HttpOnly cookies is generally safer against XSS attacks, but localStorage is often used for ease of cross-domain requests if CSRF isn't an issue. We cover this trade-off in the next module!"
    },
    {
      id: "c3",
      studentName: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?u=1",
      course: "CSS Architecture",
      lesson: "Tailwind vs BEM",
      time: "3 days ago",
      text: "The audio in the last 5 minutes of this video is slightly out of sync.",
      status: "unanswered",
      isImportant: false
    }
  ];

  const filteredComments = comments.filter(c => activeFilter === "all" || c.status === activeFilter);

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    alert("Reply posted successfully!");
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Discussions & Q&A
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Answer student questions, manage lesson discussions, and highlight top answers.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg w-full sm:w-auto">
          <button 
            onClick={() => setActiveFilter("unanswered")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === "unanswered" ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Needs Reply <Badge className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">2</Badge>
          </button>
          <button 
            onClick={() => setActiveFilter("answered")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === "answered" ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Answered
          </button>
          <button 
            onClick={() => setActiveFilter("all")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === "all" ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search discussions..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.map(comment => (
          <Card key={comment.id} className={comment.status === 'unanswered' ? 'border-orange-200 dark:border-orange-900/30' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="mt-1">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.studentName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{comment.studentName}</h4>
                      <span className="text-xs text-slate-500 flex items-center"><Clock className="h-3 w-3 mr-1"/> {comment.time}</span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {comment.course} &gt; {comment.lesson}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 mt-3 text-sm">
                      {comment.text}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className={`${comment.isImportant ? 'text-amber-500' : 'text-slate-400'} hover:text-amber-500`}>
                    <Star className={`h-4 w-4 ${comment.isImportant ? 'fill-amber-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {comment.reply && (
                <div className="mt-4 ml-12 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-sm text-slate-900 dark:text-white">Your Reply</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{comment.reply}</p>
                </div>
              )}

              {comment.status === 'unanswered' && replyingTo !== comment.id && (
                <div className="mt-4 ml-12">
                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(comment.id)}>
                    <Reply className="h-4 w-4 mr-2" /> Write Reply
                  </Button>
                </div>
              )}

              {replyingTo === comment.id && (
                <div className="mt-4 ml-12 space-y-3">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-300 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleReply(comment.id)}>Post Reply</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredComments.length === 0 && (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p>No comments to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
