import { LegacyNotice } from "../../components/LegacyNotice";

export default function EUEEPage() {
  return (
    <LegacyNotice
      title="Legacy EUEE Page Retired"
      description="Use the current quizzes hub for EUEE preparation content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
