import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await requireRole("admin");
  }

  return (
    <div className="dashboard-shell min-h-screen lg:flex">
      <AdminSidebar />
      <div className="dashboard-stage min-w-0 flex-1">{children}</div>
    </div>
  );
}
