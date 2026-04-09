import { LegacyNotice } from "../components/LegacyNotice";

export default function RegisterPage() {
  return (
    <LegacyNotice
      title="Legacy Registration Page Retired"
      description="Registration now uses the unified auth screen."
      primaryHref="/register"
      primaryLabel="Open Registration"
      secondaryHref="/login"
      secondaryLabel="Go to Login"
    />
  );
}
