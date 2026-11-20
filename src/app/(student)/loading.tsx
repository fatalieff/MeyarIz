import { Sidebar } from "@/components/layout/sidebar";
import { DashboardLoadingSkeleton } from "@/components/ui/dashboard-loading-skeleton";

export default function StudentGroupLoading() {
  return (
    <div className="dashboard-shell min-h-screen lg:flex">
      <Sidebar role="student" />
      <div className="dashboard-stage">
        <DashboardLoadingSkeleton />
      </div>
    </div>
  );
}
