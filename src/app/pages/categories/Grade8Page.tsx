import { LegacyNotice } from "../../components/LegacyNotice";

export default function Grade8Page() {
  return (
    <LegacyNotice
      title="Legacy Grade 8 Page Retired"
      description="Use live quizzes and courses for up-to-date Grade 8 content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
