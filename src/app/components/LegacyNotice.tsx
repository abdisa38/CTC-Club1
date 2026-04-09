import { Link } from "react-router";
import { Button } from "./ui/Button";

interface LegacyNoticeProps {
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function LegacyNotice({
  title,
  description = "This legacy page has been retired and replaced by the current backend-driven experience.",
  primaryHref = "/app/dashboard",
  primaryLabel = "Go to Dashboard",
  secondaryHref = "/app/courses",
  secondaryLabel = "Browse Courses",
}: LegacyNoticeProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button asChild>
          <Link to={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
