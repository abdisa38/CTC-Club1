import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminPayments() {
  return (
    <LegacyNotice
      title="Legacy Admin Payments Page Retired"
      description="Billing and operational reviews now run through live admin analytics."
      primaryHref="/app/admin/analytics"
      primaryLabel="Open Admin Analytics"
      secondaryHref="/app/admin"
      secondaryLabel="Admin Dashboard"
    />
  );
}
