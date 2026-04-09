import { LegacyNotice } from "../components/LegacyNotice";

export default function ModeSelectionPage() {
  return (
    <LegacyNotice
      title="Mode Selection Has Moved"
      description="Use the live quiz center to choose your learning mode."
      primaryHref="/app/quizzes"
      primaryLabel="Go to Quizzes"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
