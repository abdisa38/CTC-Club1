import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { mockLeaderboard, currentUser } from '../data/mockData';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Leaderboard</h1>
            <p className="text-gray-600">Compete with students across the platform</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            {/* Second Place */}
            <div className="pt-8">
              <div className="bg-white border-2 border-gray-300 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-3xl mb-2">🥈</div>
                <h3 className="font-bold text-black mb-1">
                  {mockLeaderboard[1].name.split(' ')[0]}
                </h3>
                <p className="text-2xl font-bold text-gray-600 mb-1">
                  {mockLeaderboard[1].points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>

            {/* First Place */}
            <div className="col-start-2">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-500 rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <div className="text-4xl mb-2">👑</div>
                <h3 className="font-bold text-white mb-1">
                  {mockLeaderboard[0].name.split(' ')[0]}
                </h3>
                <p className="text-3xl font-bold text-white mb-1">
                  {mockLeaderboard[0].points.toLocaleString()}
                </p>
                <p className="text-xs text-white/90">points</p>
              </div>
            </div>

            {/* Third Place */}
            <div className="pt-12">
              <div className="bg-white border-2 border-orange-300 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-orange-400" />
                </div>
                <div className="text-3xl mb-2">🥉</div>
                <h3 className="font-bold text-black mb-1">
                  {mockLeaderboard[2].name.split(' ')[0]}
                </h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {mockLeaderboard[2].points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Top Players</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Badge
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockLeaderboard.map((entry) => {
                    const isCurrentUser = entry.id === currentUser.id;
                    return (
                      <tr
                        key={entry.id}
                        className={`${
                          isCurrentUser
                            ? 'bg-primary/5 border-l-4 border-primary'
                            : 'hover:bg-gray-50'
                        } transition`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-lg font-bold ${
                                entry.rank === 1
                                  ? 'text-yellow-600'
                                  : entry.rank === 2
                                  ? 'text-gray-500'
                                  : entry.rank === 3
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              #{entry.rank}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-gray-600">
                                {entry.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-black">{entry.name}</p>
                              {isCurrentUser && (
                                <p className="text-xs text-gray-500">Keep climbing!</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-lg font-bold text-black">
                              {entry.points.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-3xl">{entry.badge}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-br from-primary to-red-700 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">How to Earn Points</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Complete exams in Gaming Mode to earn points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Answer quickly for time bonus points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Build streaks by answering correctly in a row</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>The more you play, the higher you climb!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}