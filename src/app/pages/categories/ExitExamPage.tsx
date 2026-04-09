import { LegacyNotice } from "../../components/LegacyNotice";

export default function ExitExamPage() {
  return (
    <LegacyNotice
      title="Legacy Exit Exam Page Retired"
      description="Use the current quizzes hub for live exit-exam content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
