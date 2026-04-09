import { LegacyNotice } from "../components/LegacyNotice";

export default function LeaderboardPage() {
  return (
    <LegacyNotice
      title="Leaderboard View Has Moved"
      description="Open the current leaderboard page for live rankings."
      primaryHref="/app/leaderboard"
      primaryLabel="Open Leaderboard"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
