import { LegacyNotice } from "../../components/LegacyNotice";

export default function StudentFeedback() {
  return (
    <LegacyNotice
      title="Legacy Feedback Page Retired"
      description="Use support tickets and community discussions for feedback workflows."
      primaryHref="/app/support"
      primaryLabel="Open Support"
      secondaryHref="/app/community"
      secondaryLabel="Open Community"
    />
  );
}
