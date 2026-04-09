import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminQuestions() {
  return (
    <LegacyNotice
      title="Legacy Admin Questions Page Retired"
      description="Question management now runs through the live course and quiz tooling."
      primaryHref="/app/admin/courses"
      primaryLabel="Manage Courses"
      secondaryHref="/app/instructor/quizzes"
      secondaryLabel="Open Quiz Builder"
    />
  );
}
