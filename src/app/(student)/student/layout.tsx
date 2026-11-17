import { connection } from "next/server";
import { Sidebar } from "@/components/layout/sidebar";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await requireRole("student");
  }
  return (
    <div className="dashboard-shell min-h-screen lg:flex">
      <Sidebar role="student" />
      <div className="dashboard-stage">{children}</div>
    </div>
  );
}
