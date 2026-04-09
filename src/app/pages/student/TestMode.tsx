import { LegacyNotice } from "../../components/LegacyNotice";

export default function TestMode() {
  return (
    <LegacyNotice
      title="Legacy Test Mode Retired"
      description="Use the live quizzes module for timed assessments."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
