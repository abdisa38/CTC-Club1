import { LegacyNotice } from "../../components/LegacyNotice";

export default function MockExamPage() {
  return (
    <LegacyNotice
      title="Legacy Category Page Retired"
      description="Mock-exam content now lives in the live quizzes and courses experience."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
