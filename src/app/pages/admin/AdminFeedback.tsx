import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminFeedback() {
  return (
    <LegacyNotice
      title="Legacy Admin Feedback Page Retired"
      description="Feedback monitoring is now part of live support and community tools."
      primaryHref="/app/support"
      primaryLabel="Open Support"
      secondaryHref="/app/community"
      secondaryLabel="Open Community"
    />
  );
}
