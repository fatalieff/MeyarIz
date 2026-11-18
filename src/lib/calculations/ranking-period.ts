import { bakuDateTime } from "@/lib/calculations/schedules";

export const rankingPeriods = ["last_3", "month", "all"] as const;
export type RankingPeriod = (typeof rankingPeriods)[number];

export const defaultRankingPeriod: RankingPeriod = "last_3";

export const rankingPeriodLabels: Record<RankingPeriod, string> = {
  last_3: "Son 3 sınaq",
  month: "Cari ay",
  all: "Bütün dövr",
};

export function normalizeRankingPeriod(value: unknown): RankingPeriod {
  return rankingPeriods.includes(value as RankingPeriod)
    ? (value as RankingPeriod)
    : defaultRankingPeriod;
}

type ResultWithExamDate = {
  examinations: { exam_date: string } | { exam_date: string }[] | null;
};

type WorkspaceResult = ResultWithExamDate & { student_id: string };

function examDate(result: ResultWithExamDate): string {
  const examination = Array.isArray(result.examinations)
    ? result.examinations[0]
    : result.examinations;
  return examination?.exam_date ?? "";
}

function currentBakuMonth(): string {
  return bakuDateTime().date.slice(0, 7);
}

export function filterStudentResultsByPeriod<T extends ResultWithExamDate>(
  results: T[],
  period: RankingPeriod,
  bakuMonth = currentBakuMonth(),
): T[] {
  const ordered = [...results].sort((a, b) =>
    examDate(b).localeCompare(examDate(a)),
  );
  if (period === "last_3") return ordered.slice(0, 3);
  if (period === "month") {
    return ordered.filter((result) => examDate(result).startsWith(bakuMonth));
  }
  return ordered;
}

export function filterWorkspaceResultsByPeriod<T extends WorkspaceResult>(
  results: T[],
  period: RankingPeriod,
  bakuMonth = currentBakuMonth(),
): T[] {
  if (period === "month") {
    return results.filter((result) => examDate(result).startsWith(bakuMonth));
  }
  if (period === "all") return results;

  const byStudent = new Map<string, T[]>();
  for (const result of results) {
    const rows = byStudent.get(result.student_id) ?? [];
    rows.push(result);
    byStudent.set(result.student_id, rows);
  }
  return [...byStudent.values()].flatMap((rows) =>
    rows.sort((a, b) => examDate(b).localeCompare(examDate(a))).slice(0, 3),
  );
}
