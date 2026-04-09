import { LegacyNotice } from "../../components/LegacyNotice";

export default function StudentTestimony() {
  return (
    <LegacyNotice
      title="Legacy Testimony Page Retired"
      description="Community updates are now served from live backend data."
      primaryHref="/app/community"
      primaryLabel="Open Community"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
