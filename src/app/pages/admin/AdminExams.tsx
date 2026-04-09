import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminExams() {
  return (
    <LegacyNotice
      title="Legacy Admin Exams Page Retired"
      description="Use live admin and instructor quiz flows for exam operations."
      primaryHref="/app/instructor/quizzes"
      primaryLabel="Open Quiz Builder"
      secondaryHref="/app/admin"
      secondaryLabel="Admin Dashboard"
    />
  );
}
