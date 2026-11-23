import { isScheduleVisible } from "@/lib/calculations/schedules";
import {
  filterStudentResultsByPeriod,
  filterWorkspaceResultsByPeriod,
} from "@/lib/calculations/ranking-period";
import { getTeacherSessionContext } from "@/lib/auth/session";

async function workspace() {
  const context = await getTeacherSessionContext();
  return context ? { supabase: context.supabase, ws: context.workspace } : null;
}
export async function getTeacherProfileSettings() {
  const context = await getTeacherSessionContext();
  if (!context) return null;
  return {
    fullName: context.profile.full_name,
    workspaceName: context.workspace.name,
    defaultRankingPeriod: context.workspace.settings.defaultRankingPeriod,
    globalRankingVisible: context.workspace.settings.globalRankingVisible,
  };
}
export async function getGroups() {
  const ctx = await workspace();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("groups")
    .select(
      "id,name,description,preparation_level,color,status,price_cents,package_lesson_count,group_schedules(id,weekday,start_time,end_time,is_extra,session_date),group_memberships(count)",
    )
    .eq("workspace_id", ctx.ws.id)
    .order("created_at", { ascending: false });
  return (data || []).map((group: any) => ({
    ...group,
    group_schedules: (group.group_schedules || []).filter((schedule: any) =>
      isScheduleVisible(schedule),
    ),
  }));
}
export async function getStudents() {
  const ctx = await workspace();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("students")
    .select(
      "id,full_name,email,phone,status,auth_user_id,preparation_level,profiles:auth_user_id(role),group_memberships!inner(active,groups(id,name,color))",
    )
    .eq("workspace_id", ctx.ws.id)
    .eq("group_memberships.active", true)
    .order("full_name");
  return (data || []).filter(
    (s: any) => !s.profiles || s.profiles.role !== "admin",
  );
}
export async function getExams() {
  const ctx = await workspace();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("examinations")
    .select(
      "id,title,exam_date,total_questions,status,groups!inner(id,name,workspace_id,color),exam_results(normalized_score)",
    )
    .eq("groups.workspace_id", ctx.ws.id)
    .order("exam_date", { ascending: false });
  return data || [];
}
export async function getSchedules() {
  const ctx = await workspace();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("group_schedules")
    .select(
      "id,weekday,start_time,end_time,location,is_extra,session_date,group_schedule_cancellations(occurrence_date),groups!inner(id,name,color,workspace_id,group_memberships(count))",
    )
    .eq("groups.workspace_id", ctx.ws.id)
    .order("weekday")
    .order("start_time");
  return (data || []).filter((schedule: any) => isScheduleVisible(schedule));
}
export async function getDashboard() {
  const ctx = await workspace();
  if (!ctx)
    return {
      configured: false,
      workspace: null,
      rankingPeriod: "last_3" as const,
      students: 0,
      groups: 0,
      exams: 0,
      average: null,
      results: [],
      recentExams: [],
      schedules: [],
      leaders: [],
    };
  const [groups, students, exams, results, schedules, leaders, recent] =
    await Promise.all([
      ctx.supabase
        .from("groups")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ctx.ws.id)
        .eq("status", "active"),
      ctx.supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ctx.ws.id)
        .eq("status", "active"),
      ctx.supabase
        .from("examinations")
        .select("id,groups!inner(workspace_id)", { count: "exact" })
        .eq("groups.workspace_id", ctx.ws.id)
        .order("id")
        .limit(1),
      ctx.supabase
        .from("exam_results")
        .select(
          "student_id,normalized_score,examinations!inner(exam_date,groups!inner(workspace_id))",
        )
        .eq("examinations.groups.workspace_id", ctx.ws.id),
      ctx.supabase
        .from("group_schedules")
        .select(
          "id,weekday,start_time,end_time,location,is_extra,session_date,groups!inner(id,name,color,workspace_id,group_memberships(count))",
        )
        .eq("groups.workspace_id", ctx.ws.id),
      ctx.supabase
        .from("safe_leaderboard")
        .select(
          "student_id,full_name,group_name,examination_count,ranking_score",
        )
        .eq("workspace_id", ctx.ws.id)
        .order("ranking_score", { ascending: false })
        .limit(5),
      ctx.supabase
        .from("examinations")
        .select(
          "id,title,exam_date,total_questions,groups!inner(name,workspace_id),exam_results(normalized_score)",
        )
        .eq("groups.workspace_id", ctx.ws.id)
        .order("exam_date", { ascending: false })
        .limit(5),
    ]);
  const filteredResults = filterWorkspaceResultsByPeriod(
    (results.data || []) as any[],
    ctx.ws.settings.defaultRankingPeriod,
  );
  const scores = filteredResults.map((r: any) => Number(r.normalized_score));
  return {
    configured: true,
    workspace: ctx.ws,
    rankingPeriod: ctx.ws.settings.defaultRankingPeriod,
    students: students.count || 0,
    groups: groups.count || 0,
    exams: exams.count || 0,
    average: scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null,
    results: filteredResults,
    recentExams: recent.data || [],
    schedules: (schedules.data || []).filter((schedule: any) =>
      isScheduleVisible(schedule),
    ),
    leaders: leaders.data || [],
  };
}
export async function getAnalyticsData() {
  const ctx = await workspace();
  if (!ctx)
    return {
      configured: false,
      results: [],
      rankingPeriod: "last_3" as const,
      average: null,
      top: null,
    };
  const [results, leaders] = await Promise.all([
    ctx.supabase
      .from("exam_results")
      .select(
        "student_id,normalized_score,examinations!inner(exam_date,groups!inner(workspace_id))",
      )
      .eq("examinations.groups.workspace_id", ctx.ws.id),
    ctx.supabase
      .from("safe_leaderboard")
      .select("student_id,full_name,ranking_score")
      .eq("workspace_id", ctx.ws.id)
      .order("ranking_score", { ascending: false })
      .limit(1),
  ]);
  const rows = filterWorkspaceResultsByPeriod(
    (results.data || []) as any[],
    ctx.ws.settings.defaultRankingPeriod,
  );
  const scores = rows.map((result: any) => Number(result.normalized_score));
  return {
    configured: true,
    results: rows,
    rankingPeriod: ctx.ws.settings.defaultRankingPeriod,
    average: scores.length
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : null,
    top: leaders.data?.[0] || null,
  };
}
export async function getExam(id: string) {
  const ctx = await workspace();
  if (!ctx) return null;
  const { data: exam } = await ctx.supabase
    .from("examinations")
    .select(
      "id,title,exam_date,total_questions,description,groups!inner(id,name,workspace_id,color)",
    )
    .eq("id", id)
    .eq("groups.workspace_id", ctx.ws.id)
    .single();
  if (!exam) return null;
  const [{ data: members }, { data: results }] = await Promise.all([
    ctx.supabase
      .from("group_memberships")
      .select("student_id,students(id,full_name,status)")
      .eq("group_id", (exam.groups as any).id)
      .eq("active", true),
    ctx.supabase
      .from("exam_results")
      .select("id,student_id,correct_answers,normalized_score")
      .eq("examination_id", id),
  ]);
  return { exam, members: members || [], results: results || [] };
}
export async function getStudent(id: string) {
  const ctx = await workspace();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("students")
    .select(
      "*,parent_contacts(*),group_memberships(*,groups(id,name,color,group_schedules(*))),exam_results(correct_answers,normalized_score,examinations(id,title,exam_date,total_questions)),invoices(*,payment_allocations(amount_cents,payment_id)),payments(*,payment_allocations(amount_cents,invoice_id)),student_pauses(*)",
    )
    .eq("id", id)
    .eq("workspace_id", ctx.ws.id)
    .maybeSingle();
  if (error)
    throw new Error("Şagird profili yüklənə bilmədi.", { cause: error });
  if (data)
    ((data.group_memberships as any[]) || []).forEach((membership: any) => {
      if (membership.groups)
        membership.groups.group_schedules = (
          membership.groups.group_schedules || []
        ).filter((schedule: any) => isScheduleVisible(schedule));
    });
  return data
    ? {
        ...data,
        rankingPeriod: ctx.ws.settings.defaultRankingPeriod,
        rankingResults: filterStudentResultsByPeriod(
          (data.exam_results || []) as any[],
          ctx.ws.settings.defaultRankingPeriod,
        ),
      }
    : null;
}
export async function getRankings() {
  const ctx = await workspace();
  if (!ctx) return { rows: [], rankingPeriod: "last_3" as const };
  const { data } = await ctx.supabase
    .from("safe_leaderboard")
    .select(
      "student_id,full_name,group_id,group_name,examination_count,ranking_score",
    )
    .eq("workspace_id", ctx.ws.id)
    .order("ranking_score", { ascending: false });
  return {
    rows: data || [],
    rankingPeriod: ctx.ws.settings.defaultRankingPeriod,
  };
}
export async function getGroup(id: string) {
  const ctx = await workspace();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("groups")
    .select(
      "*,group_schedules(*),group_memberships(*,students(id,full_name,status,exam_results(normalized_score,examinations(exam_date,group_id))))",
    )
    .eq("id", id)
    .eq("workspace_id", ctx.ws.id)
    .single();
  if (!data) return null;
  const memberships = (data.group_memberships || []).map((membership: any) => ({
    ...membership,
    students: {
      ...membership.students,
      exam_results: filterStudentResultsByPeriod(
        (membership.students?.exam_results || []).filter(
          (result: any) => result.examinations.group_id === id,
        ),
        ctx.ws.settings.defaultRankingPeriod,
      ),
    },
  }));
  return {
    ...data,
    rankingPeriod: ctx.ws.settings.defaultRankingPeriod,
    group_memberships: memberships,
    group_schedules: (data.group_schedules || []).filter((schedule: any) =>
      isScheduleVisible(schedule),
    ),
  };
}
