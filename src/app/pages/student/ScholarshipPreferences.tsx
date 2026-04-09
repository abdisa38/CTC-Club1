import { LegacyNotice } from "../../components/LegacyNotice";

export default function ScholarshipPreferences() {
  return (
    <LegacyNotice
      title="Legacy Scholarship Preferences Retired"
      description="Use the current resources and notifications pages for opportunity updates."
      primaryHref="/app/resources"
      primaryLabel="Open Resources"
      secondaryHref="/app/notifications"
      secondaryLabel="Open Notifications"
    />
  );
}
