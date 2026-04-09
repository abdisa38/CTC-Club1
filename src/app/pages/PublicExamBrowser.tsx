import { LegacyNotice } from "../components/LegacyNotice";

export default function PublicExamBrowser() {
  return (
    <LegacyNotice
      title="Legacy Exam Browser Retired"
      description="Use the current courses and quizzes pages for live content."
      primaryHref="/app/courses"
      primaryLabel="Browse Courses"
      secondaryHref="/app/quizzes"
      secondaryLabel="Open Quizzes"
    />
  );
}
