import { LegacyNotice } from "../../components/LegacyNotice";

export default function COCPage() {
  return (
    <LegacyNotice
      title="Legacy COC Page Retired"
      description="Use the current quizzes hub for live COC-related practice content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
