import { LegacyNotice } from "../../components/LegacyNotice";

export default function GamingMode() {
  return (
    <LegacyNotice
      title="Legacy Gaming Mode Retired"
      description="Use the live quiz center for current gamified assessment flows."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/leaderboard"
      secondaryLabel="Open Leaderboard"
    />
  );
}
