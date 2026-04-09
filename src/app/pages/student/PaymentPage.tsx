import { LegacyNotice } from "../../components/LegacyNotice";

export default function PaymentPage() {
  return (
    <LegacyNotice
      title="Legacy Payment Page Retired"
      description="Use the current support and settings flows for billing-related requests."
      primaryHref="/app/support"
      primaryLabel="Open Support"
      secondaryHref="/app/settings"
      secondaryLabel="Open Settings"
    />
  );
}
