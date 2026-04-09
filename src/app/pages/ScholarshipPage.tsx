import { LegacyNotice } from "../components/LegacyNotice";

export default function ScholarshipPage() {
  return (
    <LegacyNotice
      title="Legacy Scholarship Page Retired"
      description="Scholarship-style updates now appear in resources and community channels."
      primaryHref="/app/resources"
      primaryLabel="Open Resources"
      secondaryHref="/app/community"
      secondaryLabel="Open Community"
    />
  );
}
