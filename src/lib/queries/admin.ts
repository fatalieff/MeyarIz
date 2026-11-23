import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export interface AdminOverviewStats {
  totalTeachers: number;
  activeTeachers: number;
  suspendedTeachers: number;
  totalWorkspaces: number;
  totalStudents: number;
  totalGroups: number;
  totalExams: number;
}

export interface AdminTeacherSummary {
  id: string;
  fullName: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  status: "active" | "suspended";
  createdAt: string;
  studentCount: number;
  groupCount: number;
  examCount: number;
}

export interface AdminTeacherDetails extends AdminTeacherSummary {
  lastSignInAt?: string | null;
  billingModel?: "CALENDAR_MONTH" | "ANNIVERSARY_MONTH" | "LESSON_PACKAGE" | null;
  auditLogs: AdminAuditLog[];
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetTeacherId: string | null;
  summary: string;
  status: "success" | "failure";
  details: Record<string, unknown>;
  createdAt: string;
}

async function adminContext() {
  await connection();
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    return null;
  }
  return { supabase, user };
}

export async function getAdminOverview(): Promise<{
  stats: AdminOverviewStats;
  recentTeachers: AdminTeacherSummary[];
  recentAuditLogs: AdminAuditLog[];
}> {
  const ctx = await adminContext();
  const emptyStats: AdminOverviewStats = {
    totalTeachers: 0,
    activeTeachers: 0,
    suspendedTeachers: 0,
    totalWorkspaces: 0,
    totalStudents: 0,
    totalGroups: 0,
    totalExams: 0,
  };
  if (!ctx) return { stats: emptyStats, recentTeachers: [], recentAuditLogs: [] };

  // 1. RPC yoxla (əgər DB-də mövcuddursa)
  let stats = emptyStats;
  const { data: rpcStats, error: rpcErr } = await ctx.supabase.rpc("admin_get_overview_stats");
  if (!rpcErr && rpcStats) {
    stats = {
      totalTeachers: Number(rpcStats.total_teachers || 0),
      activeTeachers: Number(rpcStats.active_teachers || 0),
      suspendedTeachers: Number(rpcStats.suspended_teachers || 0),
      totalWorkspaces: Number(rpcStats.total_workspaces || 0),
      totalStudents: Number(rpcStats.total_students || 0),
      totalGroups: Number(rpcStats.total_groups || 0),
      totalExams: Number(rpcStats.total_exams || 0),
    };
  } else {
    // Fallback: birbaşa say sorğuları
    const [
      teachersTotal,
      teachersActive,
      teachersSuspended,
      workspaces,
      students,
      groups,
      exams,
    ] = await Promise.all([
      ctx.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
      ctx.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher").eq("status", "active"),
      ctx.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher").eq("status", "suspended"),
      ctx.supabase.from("teacher_workspaces").select("id", { count: "exact", head: true }),
      ctx.supabase.from("students").select("id", { count: "exact", head: true }),
      ctx.supabase.from("groups").select("id", { count: "exact", head: true }),
      ctx.supabase.from("examinations").select("id", { count: "exact", head: true }),
    ]);

    stats = {
      totalTeachers: teachersTotal.count || 0,
      activeTeachers: teachersActive.count || 0,
      suspendedTeachers: teachersSuspended.count || 0,
      totalWorkspaces: workspaces.count || 0,
      totalStudents: students.count || 0,
      totalGroups: groups.count || 0,
      totalExams: exams.count || 0,
    };
  }

  // 2. Son müəllimlər
  const recentTeachers = (await getAdminTeachers()).slice(0, 5);

  // 3. Son audit qeydləri
  const { data: auditLogs } = await ctx.supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  const recentAuditLogs: AdminAuditLog[] = (auditLogs || []).map((l: any) => ({
    id: l.id,
    adminId: l.admin_id,
    action: l.action,
    targetTeacherId: l.target_teacher_id,
    summary: l.summary,
    status: l.status,
    details: l.details || {},
    createdAt: l.created_at,
  }));

  return { stats, recentTeachers, recentAuditLogs };
}

export async function getAdminTeachers(): Promise<AdminTeacherSummary[]> {
  const ctx = await adminContext();
  if (!ctx) return [];

  // RPC ilə təhlükəsiz şəkildə əldə et
  const { data: rpcData, error: rpcErr } = await ctx.supabase.rpc("admin_get_teachers_summary");
  if (!rpcErr && Array.isArray(rpcData)) {
    return rpcData.map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      email: item.email || "—",
      workspaceId: item.workspace_id,
      workspaceName: item.workspace_name,
      status: item.status === "suspended" ? "suspended" : "active",
      createdAt: item.created_at,
      studentCount: Number(item.student_count || 0),
      groupCount: Number(item.group_count || 0),
      examCount: Number(item.exam_count || 0),
    }));
  }

  // Fallback: profiles və teacher_workspaces vasitəsilə
  const { data: profiles } = await ctx.supabase
    .from("profiles")
    .select("id, full_name, status, created_at, teacher_workspaces(id, name)")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  if (!profiles) return [];

  return profiles.map((p: any) => {
    const ws = Array.isArray(p.teacher_workspaces) ? p.teacher_workspaces[0] : p.teacher_workspaces;
    return {
      id: p.id,
      fullName: p.full_name,
      email: "—",
      workspaceId: ws?.id || "",
      workspaceName: ws?.name || "Müəllim İş Sahəsi",
      status: p.status === "suspended" ? "suspended" : "active",
      createdAt: p.created_at,
      studentCount: 0,
      groupCount: 0,
      examCount: 0,
    };
  });
}

export async function getAdminTeacherDetails(id: string): Promise<AdminTeacherDetails | null> {
  const ctx = await adminContext();
  if (!ctx) return null;

  // 1. RPC yoxla
  const { data: rpcData, error: rpcErr } = await ctx.supabase.rpc("admin_get_teacher_details", {
    target_id: id,
  });

  let base: any = null;
  if (!rpcErr && rpcData) {
    base = {
      id: rpcData.id,
      fullName: rpcData.full_name,
      email: rpcData.email || "—",
      workspaceId: rpcData.workspace_id,
      workspaceName: rpcData.workspace_name,
      status: rpcData.status === "suspended" ? "suspended" : "active",
      createdAt: rpcData.created_at,
      lastSignInAt: rpcData.last_sign_in_at,
      studentCount: Number(rpcData.student_count || 0),
      groupCount: Number(rpcData.group_count || 0),
      examCount: Number(rpcData.exam_count || 0),
    };
  } else {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("id, full_name, status, created_at, teacher_workspaces(id, name)")
      .eq("id", id)
      .eq("role", "teacher")
      .maybeSingle();

    if (!profile) return null;
    const ws = Array.isArray(profile.teacher_workspaces) ? profile.teacher_workspaces[0] : profile.teacher_workspaces;

    base = {
      id: profile.id,
      fullName: profile.full_name,
      email: "—",
      workspaceId: ws?.id || "",
      workspaceName: ws?.name || "Müəllim İş Sahəsi",
      status: profile.status === "suspended" ? "suspended" : "active",
      createdAt: profile.created_at,
      lastSignInAt: null,
      studentCount: 0,
      groupCount: 0,
      examCount: 0,
    };
  }

  const { data: billing } = base.workspaceId ? await ctx.supabase
    .from("workspace_billing_settings")
    .select("billing_model")
    .eq("workspace_id", base.workspaceId)
    .is("effective_to", null)
    .maybeSingle() : { data: null };

  // 2. Bu müəllim üzrə audit logları gətir
  const { data: logs } = await ctx.supabase
    .from("admin_audit_logs")
    .select("*")
    .eq("target_teacher_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const auditLogs: AdminAuditLog[] = (logs || []).map((l: any) => ({
    id: l.id,
    adminId: l.admin_id,
    action: l.action,
    targetTeacherId: l.target_teacher_id,
    summary: l.summary,
    status: l.status,
    details: l.details || {},
    createdAt: l.created_at,
  }));

  return { ...base, billingModel: billing?.billing_model || null, auditLogs };
}

export async function getAdminAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
  const ctx = await adminContext();
  if (!ctx) return [];

  const { data: logs } = await ctx.supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (logs || []).map((l: any) => ({
    id: l.id,
    adminId: l.admin_id,
    action: l.action,
    targetTeacherId: l.target_teacher_id,
    summary: l.summary,
    status: l.status,
    details: l.details || {},
    createdAt: l.created_at,
  }));
}
