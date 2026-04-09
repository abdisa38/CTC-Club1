import { LegacyNotice } from "../../components/LegacyNotice";

export default function StudentProfile() {
  return (
    <LegacyNotice
      title="Legacy Student Profile Retired"
      description="Use the live profile page for account and achievement data."
      primaryHref="/app/profile"
      primaryLabel="Open Profile"
      secondaryHref="/app/settings"
      secondaryLabel="Open Settings"
    />
  );
}
