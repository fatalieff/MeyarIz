import { connection } from "next/server";
import { Sidebar } from "@/components/layout/sidebar";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function PlansLayout({ children }: { children: React.ReactNode }) {
  await connection();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await requireRole("teacher");
  }

  return (
    <div className="dashboard-shell min-h-screen lg:flex">
      <Sidebar />
      <div className="dashboard-stage">{children}</div>
    </div>
  );
}
