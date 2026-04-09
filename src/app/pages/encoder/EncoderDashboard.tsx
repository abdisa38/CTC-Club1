import { LegacyNotice } from "../../components/LegacyNotice";

export default function EncoderDashboard() {
  return (
    <LegacyNotice
      title="Legacy Encoder Dashboard Retired"
      description="Use the current admin dashboard for content management workflows."
      primaryHref="/app/admin"
      primaryLabel="Open Admin Dashboard"
      secondaryHref="/app/dashboard"
      secondaryLabel="Back to Dashboard"
    />
  );
}
