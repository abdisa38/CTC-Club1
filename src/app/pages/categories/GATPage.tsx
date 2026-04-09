import { LegacyNotice } from "../../components/LegacyNotice";

export default function GATPage() {
  return (
    <LegacyNotice
      title="Legacy GAT Page Retired"
      description="Use the current quizzes hub for GAT preparation content."
      primaryHref="/app/quizzes"
      primaryLabel="Open Quizzes"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
