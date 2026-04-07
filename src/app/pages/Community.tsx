import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { MessageSquare, ArrowUp, ArrowDown, Share2, MoreHorizontal, User, Award } from "lucide-react";

export function Community() {
  const [activeTab, setActiveTab] = useState('trending');
  
  const posts = [
    {
      id: 1,
      author: { name: "Alex Chen", avatar: "https://i.pravatar.cc/150?u=1", role: "Student" },
      title: "How do you structure your React project folders?",
      content: "I've been working on a few projects and my folder structure always ends up being a mess. Do you prefer grouping by feature or by file type (components, hooks, utils)?",
      upvotes: 145,
      comments: 32,
      tags: ["React", "Architecture", "Discussion"],
      time: "2 hours ago"
    },
    {
      id: 2,
      author: { name: "Prof. Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=2", role: "Instructor" },
      title: "New Course Announcement: Advanced Node.js Patterns",
      content: "Excited to announce that the new Node.js course will drop next Monday! We'll cover microservices, advanced event loops, and clustering. Make sure you complete the prerequisites.",
      upvotes: 380,
      comments: 56,
      tags: ["Announcement", "Node.js"],
      time: "5 hours ago",
      pinned: true
    },
    {
      id: 3,
      author: { name: "Emily Parker", avatar: "https://i.pravatar.cc/150?u=3", role: "Student" },
      title: "Help with CSS Grid layout issue",
      content: "I'm trying to create a masonry layout using pure CSS Grid but I'm getting weird gaps between my rows. Here is my current CSS snippet...",
      upvotes: 24,
      comments: 12,
      tags: ["CSS", "Help"],
      time: "1 day ago"
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Community Forum</h1>
            <p className="text-slate-500 dark:text-slate-400">Discuss courses, ask for help, and connect with peers.</p>
          </div>
        </div>

        <Card className="border-2 border-indigo-100 dark:border-indigo-900/30">
          <CardContent className="p-4 flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Input placeholder="Create a new post..." className="h-12 bg-slate-50 dark:bg-slate-900 border-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" readOnly />
            </div>
          </CardContent>
        </Card>

        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {['Trending', 'Latest', 'Following'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.toLowerCase() 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className={`hover:border-slate-300 dark:hover:border-slate-700 transition-colors ${post.pinned ? 'border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10' : ''}`}>
              <CardContent className="p-0 flex flex-col sm:flex-row">
                {/* Vote Sidebar */}
                <div className="flex flex-row sm:flex-col items-center justify-start gap-1 p-3 bg-slate-50 dark:bg-slate-900/50 sm:border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800 sm:w-16 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600"><ArrowUp className="h-5 w-5" /></Button>
                  <span className="font-bold text-sm text-slate-900 dark:text-white my-1">{post.upvotes}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600"><ArrowDown className="h-5 w-5" /></Button>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{post.author.name}</span>
                      <Badge variant={post.author.role === 'Instructor' ? 'default' : 'secondary'} className="text-[10px] h-5">{post.author.role}</Badge>
                      <span className="text-xs text-slate-500 ml-2">• {post.time}</span>
                    </div>
                    {post.pinned && <Badge variant="warning" className="text-[10px] bg-amber-500 hover:bg-amber-600 h-5">Pinned</Badge>}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                    {post.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-500">
                    <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {post.comments} Comments
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["React", "Help", "Showcase", "Discussion", "Node.js", "CSS", "TypeScript"].map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 transition-colors px-3 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-purple-500" /> Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Alex Chen", xp: 15420, avatar: "https://i.pravatar.cc/150?u=1" },
              { name: "Emily Parker", xp: 12890, avatar: "https://i.pravatar.cc/150?u=3" },
              { name: "David Kumar", xp: 11200, avatar: "https://i.pravatar.cc/150?u=4" }
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-400 font-bold w-4">{i + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-indigo-600">{user.xp.toLocaleString()} XP</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
