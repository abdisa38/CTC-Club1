import { AdminDashboard as UnifiedAdminDashboard } from "./admin/AdminDashboard";

export function AdminDashboard({ metrics }: { metrics?: any }) {
  return <UnifiedAdminDashboard metrics={metrics} />;
}
