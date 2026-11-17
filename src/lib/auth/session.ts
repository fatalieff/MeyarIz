import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AppUserRole = "admin" | "teacher" | "student";

export interface SessionProfile {
  id: string;
  role: AppUserRole;
  full_name: string;
  status: "active" | "suspended";
}

export function roleHomePath(role: AppUserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "student":
      return "/student/dashboard";
    case "teacher":
    default:
      return "/dashboard";
  }
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  await connection();
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, status")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return {
    id: profile.id,
    role: (profile.role as AppUserRole) || "student",
    full_name: profile.full_name,
    status: profile.status === "suspended" ? "suspended" : "active",
  };
}

export async function requireRole(role: AppUserRole): Promise<SessionProfile> {
  await connection();
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  // Dayandırılmış istifadəçilərin girişini dərhal blokla
  if (profile.status === "suspended") {
    const supabase = await createClient();
    await supabase?.auth.signOut({ scope: "local" });
    redirect("/login?suspended=1");
  }

  // Başqa rolun səhifəsinə daxil olmağa çalışdıqda öz uyğun dashboard-una yönləndir
  if (profile.role !== role) {
    redirect(roleHomePath(profile.role));
  }

  return profile;
}
