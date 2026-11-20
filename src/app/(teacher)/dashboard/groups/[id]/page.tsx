import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Pencil,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { GroupEditForm } from "@/components/forms/entity-forms";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormPanel } from "@/components/ui/form-panel";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { getGroup } from "@/lib/queries/teacher";
import { weekDays } from "@/lib/calculations/schedules";
import { azDate, azPercent, isLightColor, cn } from "@/lib/utils";
import {
  normalizeRankingPeriod,
  rankingPeriodLabels,
} from "@/lib/calculations/ranking-period";

export const instant = false;

export default async function GroupDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const group: any = await getGroup(id);
  if (!group) notFound();
  const periodLabel =
    rankingPeriodLabels[normalizeRankingPeriod(group.rankingPeriod)];

  const members = (group.group_memberships || []).filter(
    (membership: any) => membership.active,
  );
  const weeklySchedules = (group.group_schedules || []).filter(
    (schedule: any) => !schedule.is_extra,
  );
  const extraSchedules = (group.group_schedules || []).filter(
    (schedule: any) => schedule.is_extra,
  );
  const scores = members.flatMap((membership: any) =>
    membership.students.exam_results
      .filter((result: any) => result.examinations.group_id === id)
      .map((result: any) => Number(result.normalized_score)),
  );
  const average = scores.length
    ? scores.reduce((sum: number, score: number) => sum + score, 0) /
      scores.length
    : null;

  return (
    <>
      <AppHeader title={group.name} />
      <main className="p-5 md:p-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-2xl shadow-sm transition-transform",
                isLightColor(group.color)
                  ? "border border-slate-300/80 ring-1 ring-slate-900/5 text-slate-900"
                  : "text-white shadow-md"
              )}
              style={{
                backgroundColor: group.color || "#4f46e5",
                color: isLightColor(group.color) ? "#0f172a" : "#ffffff",
              }}
            >
              <Users className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{group.name}</h2>
                <Badge tone={group.status === "active" ? "success" : "neutral"}>
                  {group.status === "active" ? "Aktiv" : "Arxiv"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {group.description || "Qrup təsviri əlavə edilməyib."}
              </p>
              {group.preparation_level && (
                <p className="mt-2 text-xs font-semibold text-indigo-600">
                  Hazırlıq səviyyəsi: {group.preparation_level}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <Link
              href={
                query.edit
                  ? `/dashboard/groups/${group.id}`
                  : `/dashboard/groups/${group.id}?edit=1`
              }
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
            >
              {query.edit ? (
                <>
                  <X className="size-4" />
                  Bağla
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Redaktə et
                </>
              )}
            </Link>
            <DeleteGroupButton groupId={group.id} groupName={group.name} />
          </div>
        </div>

        {query.edit && (
          <FormPanel title="Qrup məlumatlarını redaktə et">
            <GroupEditForm group={group} />
          </FormPanel>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Aktiv şagirdlər"
            value={String(members.length)}
            detail="hazırkı üzvlər"
            icon={Users}
          />
          <StatCard
            label="Qrup ortası"
            value={azPercent(average)}
            detail={`${periodLabel.toLocaleLowerCase("az-AZ")} · ${scores.length} nəticə`}
            icon={TrendingUp}
          />
          <StatCard
            label="Dərs vaxtları"
            value={String(group.group_schedules.length)}
            detail={`${weeklySchedules.length} həftəlik · ${extraSchedules.length} əlavə`}
            icon={CalendarDays}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <article className="card p-5">
            <h3 className="font-bold">Şagirdlər</h3>
            {members.length ? (
              <div className="mt-4 divide-y">
                {members.map((membership: any) => {
                  const studentScores = membership.students.exam_results
                    .filter(
                      (result: any) => result.examinations.group_id === id,
                    )
                    .map((result: any) => Number(result.normalized_score));
                  const studentAverage = studentScores.length
                    ? studentScores.reduce(
                        (sum: number, score: number) => sum + score,
                        0,
                      ) / studentScores.length
                    : null;
                  return (
                    <Link
                      key={membership.id}
                      href={`/dashboard/students/${membership.students.id}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                        {membership.students.full_name[0]}
                      </span>
                      <strong className="flex-1 text-sm">
                        {membership.students.full_name}
                      </strong>
                      <span className="text-sm font-bold text-indigo-600">
                        {azPercent(studentAverage)}
                      </span>
                      <ChevronRight className="size-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Qrupda şagird yoxdur"
                  description="Şagirdlər bölməsindən bu qrupa üzv əlavə edin."
                />
              </div>
            )}
          </article>

          <article className="card p-5">
            <h3 className="font-bold">Həftəlik cədvəl</h3>
            {group.group_schedules.length ? (
              <div className="mt-4 space-y-3">
                {group.group_schedules
                  .sort(
                    (a: any, b: any) =>
                      (a.session_date || "").localeCompare(
                        b.session_date || "",
                      ) ||
                      a.weekday - b.weekday ||
                      a.start_time.localeCompare(b.start_time),
                  )
                  .map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className={`rounded-xl p-3 ${schedule.is_extra ? "border border-amber-200 bg-amber-50" : "bg-slate-50"}`}
                    >
                      <strong className="text-sm">
                        {schedule.is_extra
                          ? `Əlavə · ${azDate(schedule.session_date)}`
                          : weekDays[schedule.weekday]}
                      </strong>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="size-3" />
                        {schedule.start_time.slice(0, 5)}–
                        {schedule.end_time.slice(0, 5)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Cədvəl yoxdur"
                  description="Bu qrupa dərs vaxtı əlavə edilməyib."
                />
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
