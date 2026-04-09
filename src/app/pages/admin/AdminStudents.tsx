import { LegacyNotice } from "../../components/LegacyNotice";

export default function AdminStudents() {
  return (
    <LegacyNotice
      title="Legacy Admin Students Page Retired"
      description="Use the live admin users and dashboard sections for student management."
      primaryHref="/app/admin/users"
      primaryLabel="Manage Users"
      secondaryHref="/app/admin"
      secondaryLabel="Admin Dashboard"
    />
  );
}
