import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import { Trophy, Medal, Star, TrendingUp, Award, Flame } from "lucide-react";

export function Leaderboard() {
  const topThree = [
    { rank: 2, name: "Emily Parker", xp: 18200, level: 12, avatar: "https://i.pravatar.cc/150?u=3", color: "from-slate-300 to-slate-400", badge: "Silver" },
    { rank: 1, name: "Alex Chen", xp: 21500, level: 14, avatar: "https://i.pravatar.cc/150?u=1", color: "from-amber-300 to-amber-500", badge: "Gold", isCurrentUser: true },
    { rank: 3, name: "David Kumar", xp: 16400, level: 11, avatar: "https://i.pravatar.cc/150?u=4", color: "from-amber-700 to-amber-900", badge: "Bronze" },
  ];

  const others = [
    { rank: 4, name: "Sarah Jenkins", xp: 15800, level: 11, avatar: "https://i.pravatar.cc/150?u=2", streak: 12 },
    { rank: 5, name: "Michael Chang", xp: 14200, level: 10, avatar: "https://i.pravatar.cc/150?u=5", streak: 5 },
    { rank: 6, name: "Jessica Smith", xp: 13900, level: 10, avatar: "https://i.pravatar.cc/150?u=6", streak: 8 },
    { rank: 7, name: "Tom Wilson", xp: 12500, level: 9, avatar: "https://i.pravatar.cc/150?u=7", streak: 3 },
    { rank: 8, name: "Lisa Wong", xp: 11800, level: 8, avatar: "https://i.pravatar.cc/150?u=8", streak: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Global Leaderboard</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Compete with your peers, earn XP by completing courses and quizzes, and climb the ranks to become the top learner.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-6 mt-16 mb-16 h-72">
        {topThree.map((user) => (
          <div key={user.rank} className={`flex flex-col items-center relative w-full md:w-48 ${user.rank === 1 ? 'order-1 md:order-2 z-10' : user.rank === 2 ? 'order-2 md:order-1' : 'order-3'}`}>
            {user.isCurrentUser && <Badge className="absolute -top-10 bg-indigo-600 animate-bounce">You</Badge>}
            
            <div className="relative mb-4">
              <Avatar className={`h-20 w-20 sm:h-24 sm:w-24 border-4 ring-4 ring-white dark:ring-slate-950 shadow-xl ${user.rank === 1 ? 'border-amber-400 h-28 w-28 sm:h-32 sm:w-32' : user.rank === 2 ? 'border-slate-300' : 'border-amber-700'}`}>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white dark:border-slate-950`}>
                {user.rank}
              </div>
            </div>
            
            <div className={`w-full rounded-t-2xl bg-gradient-to-b ${user.color} flex flex-col items-center justify-start pt-6 px-4 shadow-lg ${user.rank === 1 ? 'h-48' : user.rank === 2 ? 'h-36' : 'h-28'}`}>
              <h3 className="font-bold text-slate-900 text-center truncate w-full px-2" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{user.name}</h3>
              <p className="font-black text-slate-800 mt-1">{user.xp.toLocaleString()} XP</p>
              <Badge variant="outline" className="mt-2 bg-white/50 border-transparent text-slate-800 text-[10px]">Lv. {user.level}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the leaderboard */}
      <Card className="border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Rankings</CardTitle>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Season: Fall 2026</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {others.map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="font-bold text-slate-400 w-6 text-center text-lg">{user.rank}</span>
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-base">{user.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Level {user.level}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1 text-orange-500 font-medium"><Flame className="h-3 w-3" /> {user.streak} Day Streak</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{user.xp.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 ml-1">XP</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-slate-50 dark:bg-slate-900 justify-center rounded-b-xl border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost">Load More</Button>
        </CardFooter>
      </Card>
      
      {/* Current User Stats Floating Card */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-indigo-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-indigo-500 md:hidden z-40">
         <div className="flex items-center gap-3">
           <span className="font-bold text-xl text-indigo-200">#1</span>
           <div>
             <p className="font-bold">You</p>
             <p className="text-xs text-indigo-200">Level 14 • 21,500 XP</p>
           </div>
         </div>
         <Trophy className="h-8 w-8 text-amber-400" />
      </div>
    </div>
  );
}
