import {
  filterStudentResultsByPeriod,
  normalizeRankingPeriod,
} from "@/lib/calculations/ranking-period";
import { isScheduleVisible } from "@/lib/calculations/schedules";
import { createClient } from "@/lib/supabase/server";

export async function getStudentData() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return null;

  const { data: student } = await supabase
    .from("students")
    .select(
      "id,workspace_id,full_name,email,phone,auth_user_id,group_memberships!inner(active,groups(id,name,color,group_schedules(id,weekday,start_time,end_time,location,is_extra,session_date,group_schedule_cancellations(occurrence_date)))),exam_results(correct_answers,normalized_score,examinations(id,title,exam_date,total_questions)),student_achievements(earned_at,achievements(code,name_az,description_az,icon))",
    )
    .eq("auth_user_id", userId)
    .eq("group_memberships.active", true)
    .single();
  if (!student) return null;

  const membership = (student.group_memberships as any[])[0];
  if (membership?.groups) {
    membership.groups.group_schedules = (
      membership.groups.group_schedules || []
    ).filter((schedule: any) => isScheduleVisible(schedule));
  }

  const [{ data: leaderboard }, { data: rawSettings }] = await Promise.all([
    supabase
      .from("safe_leaderboard")
      .select(
        "student_id,full_name,group_id,group_name,examination_count,ranking_score",
      )
      .eq("workspace_id", student.workspace_id)
      .order("ranking_score", { ascending: false }),
    supabase
      .from("teacher_settings")
      .select("default_ranking_period,global_ranking_visible")
      .eq("workspace_id", student.workspace_id)
      .maybeSingle(),
  ]);

  const settings = {
    defaultRankingPeriod: normalizeRankingPeriod(
      rawSettings?.default_ranking_period,
    ),
    globalRankingVisible: rawSettings?.global_ranking_visible === true,
  };
  const rankingResults = filterStudentResultsByPeriod(
    (student.exam_results || []) as any[],
    settings.defaultRankingPeriod,
  );

  return {
    student,
    membership,
    settings,
    rankingResults,
    leaderboard: settings.globalRankingVisible ? leaderboard || [] : [],
  };
}
