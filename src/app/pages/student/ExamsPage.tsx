import { LegacyNotice } from "../../components/LegacyNotice";

export default function ExamsPage() {
  return (
    <LegacyNotice
      title="Legacy Exams Page Retired"
      description="Use the live quizzes hub for exam sessions and results."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
