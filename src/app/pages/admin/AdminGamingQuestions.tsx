import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminGamingQuestions() {
  return (
    <LegacyNotice
      title="Legacy Gaming Questions Page Retired"
      description="Use the live quiz management workflow for all question authoring."
      primaryHref="/app/instructor/quizzes"
      primaryLabel="Open Quiz Builder"
      secondaryHref="/app/admin"
      secondaryLabel="Admin Dashboard"
    />
  );
}
