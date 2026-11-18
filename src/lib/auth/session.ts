import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeRankingPeriod,
  type RankingPeriod,
} from "@/lib/calculations/ranking-period";

export type AppUserRole = "admin" | "teacher" | "student";

export interface SessionProfile {
  id: string;
  role: AppUserRole;
  full_name: string;
  status: "active" | "suspended";
}

export interface TeacherWorkspaceSummary {
  id: string;
  name: string;
  birthday_welcome_completed: boolean;
  settings: {
    defaultRankingPeriod: RankingPeriod;
    globalRankingVisible: boolean;
  };
}

type SessionContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  profile: SessionProfile;
  teacherWorkspace: TeacherWorkspaceSummary | null;
};

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

const getSessionContext = cache(
  async function getSessionContext(): Promise<SessionContext | null> {
    await connection();
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsError || typeof userId !== "string") return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, role, full_name, status, teacher_workspaces(id, name, birthday_welcome_completed, teacher_settings(default_ranking_period, global_ranking_visible))",
      )
      .eq("id", userId)
      .single();

    if (!profile) return null;
    const rawTeacherWorkspaces = Array.isArray(profile.teacher_workspaces)
      ? profile.teacher_workspaces
      : profile.teacher_workspaces
        ? [profile.teacher_workspaces]
        : [];
    const rawWorkspace = rawTeacherWorkspaces[0];
    const rawSettings = rawWorkspace
      ? Array.isArray(rawWorkspace.teacher_settings)
        ? rawWorkspace.teacher_settings[0]
        : rawWorkspace.teacher_settings
      : null;
    const teacherWorkspace: TeacherWorkspaceSummary | null = rawWorkspace
      ? {
          id: rawWorkspace.id,
          name: rawWorkspace.name,
          birthday_welcome_completed: rawWorkspace.birthday_welcome_completed,
          settings: {
            defaultRankingPeriod: normalizeRankingPeriod(
              rawSettings?.default_ranking_period,
            ),
            globalRankingVisible: rawSettings?.global_ranking_visible !== false,
          },
        }
      : null;

    return {
      supabase,
      teacherWorkspace,
      profile: {
        id: profile.id,
        role: (profile.role as AppUserRole) || "student",
        full_name: profile.full_name,
        status: profile.status === "suspended" ? "suspended" : "active",
      },
    };
  },
);

export const getSessionProfile = cache(
  async function getSessionProfile(): Promise<SessionProfile | null> {
    return (await getSessionContext())?.profile ?? null;
  },
);

export const getTeacherSessionContext = cache(
  async function getTeacherSessionContext() {
    const context = await getSessionContext();
    if (
      !context ||
      context.profile.role !== "teacher" ||
      context.profile.status !== "active" ||
      !context.teacherWorkspace
    ) {
      return null;
    }
    return {
      supabase: context.supabase,
      profile: context.profile,
      workspace: context.teacherWorkspace,
    };
  },
);

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
