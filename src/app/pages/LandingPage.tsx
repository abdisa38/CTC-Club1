import { LegacyNotice } from "../components/LegacyNotice";

export default function LandingPage() {
  return (
    <LegacyNotice
      title="Legacy Landing Page Retired"
      description="The modern homepage now serves the live backend-powered experience."
      primaryHref="/"
      primaryLabel="Open Homepage"
      secondaryHref="/app/courses"
      secondaryLabel="Browse Courses"
    />
  );
}
