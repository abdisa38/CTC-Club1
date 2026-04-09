import { LegacyNotice } from "../../components/LegacyNotice";

export default function Grade6Page() {
  return (
    <LegacyNotice
      title="Legacy Grade 6 Page Retired"
      description="Use live quizzes and courses for up-to-date Grade 6 content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
