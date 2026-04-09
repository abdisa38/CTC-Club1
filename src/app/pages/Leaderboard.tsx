import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Trophy, Flame, Loader2 } from "lucide-react";
import apiService, { LeaderboardEntry } from "../services/api";

export function Leaderboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiService.getLeaderboard();
        setEntries(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLeaderboard();
  }, []);

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);
  const others = useMemo(() => entries.slice(3, visibleCount), [entries, visibleCount]);

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Global Leaderboard</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Rankings are now generated from real learner XP and activity.
        </p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {topThree.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((entry, index) => {
            const rankLabel = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";
            return (
              <Card key={entry.id} className="text-center">
                <CardContent className="pt-6">
                  <Badge className="mb-3">#{entry.rank} {rankLabel}</Badge>
                  <Avatar className="h-20 w-20 mx-auto border-4 border-amber-300">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{entry.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{entry.role}</p>
                  <p className="mt-2 text-xl font-extrabold text-indigo-600">{entry.xp.toLocaleString()} XP</p>
                  <p className="text-xs text-slate-500">Level {entry.level}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState text="Leaderboard data is currently unavailable." />
      )}

      <Card className="border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <CardTitle className="text-lg">All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {others.length === 0 ? (
            <EmptyState text="No additional ranked users yet." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {others.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-bold text-slate-400 w-6 text-center text-lg">{entry.rank}</span>
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-base">{entry.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Level {entry.level}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="capitalize">{entry.role}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="flex items-center gap-1 text-orange-500 font-medium">
                          <Flame className="h-3 w-3" />
                          Active
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{entry.xp.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-1">XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-slate-50 dark:bg-slate-900 justify-center rounded-b-xl border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setVisibleCount((prev) => Math.min(prev + 15, entries.length))} disabled={visibleCount >= entries.length}>
            {visibleCount >= entries.length ? "All Loaded" : "Load More"}
          </Button>
        </CardFooter>
      </Card>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-indigo-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-indigo-500 md:hidden z-40">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-indigo-200">#{entries[0]?.rank || "-"}</span>
          <div>
            <p className="font-bold">{entries[0]?.name || "Top Learner"}</p>
            <p className="text-xs text-indigo-200">Level {entries[0]?.level || 0} • {(entries[0]?.xp || 0).toLocaleString()} XP</p>
          </div>
        </div>
        <Trophy className="h-8 w-8 text-amber-400" />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No data yet</h3>
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
