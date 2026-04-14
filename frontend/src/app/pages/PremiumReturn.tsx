import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const REDIRECT_SECONDS = 6;

export function PremiumReturn() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const txRef = (params.get("tx_ref") || params.get("amp;tx_ref") || params.get("trx_ref") || params.get("amp;trx_ref") || "").trim();
  const status = (params.get("status") || "").trim().toLowerCase();

  const targetUrl = useMemo(() => {
    if (!txRef) {
      return "/app/settings";
    }

    const target = new URLSearchParams();
    target.set("premium", "verify");
    target.set("tx_ref", txRef);
    return `/app/settings?${target.toString()}`;
  }, [txRef]);

  const statusLabel = status === "success" || status === "successful"
    ? "Payment completed"
    : status
      ? `Payment status: ${status}`
      : "Payment received";

  useEffect(() => {
    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      navigate(targetUrl, { replace: true });
    }, REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, targetUrl]);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <Card className="border-emerald-200 dark:border-emerald-900/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            Premium payment received
          </CardTitle>
          <CardDescription>
            {statusLabel}. We are confirming your transaction and upgrading your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/40 text-sm text-slate-700 dark:text-slate-300">
            Redirecting you to account settings in <strong>{secondsLeft}</strong> second{secondsLeft === 1 ? "" : "s"}.
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Finalizing premium verification...
          </div>

          <Button onClick={() => navigate(targetUrl, { replace: true })}>
            Continue now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
