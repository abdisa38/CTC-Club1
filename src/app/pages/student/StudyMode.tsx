import { LegacyNotice } from "../../components/LegacyNotice";

export default function StudyMode() {
  return (
    <LegacyNotice
      title="Legacy Study Mode Retired"
      description="Use courses and quizzes for the current study flow."
      primaryHref="/app/courses"
      primaryLabel="Browse Courses"
      secondaryHref="/app/quizzes"
      secondaryLabel="Open Quizzes"
    />
  );
}
