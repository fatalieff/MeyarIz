export type ExamForFiltering = {
  id: string;
  title: string;
  exam_date: string;
  groups: { id: string; name: string };
  exam_results: { normalized_score: number | string }[];
};

export type ExamFilters = {
  query: string;
  month: string;
  groupId: string;
  resultStatus: "all" | "announced" | "unannounced";
  sort: "newest" | "oldest" | "score-desc" | "score-asc";
};

export const defaultExamFilters: ExamFilters = { query: "", month: "all", groupId: "all", resultStatus: "all", sort: "newest" };

export function examAverage(exam: Pick<ExamForFiltering, "exam_results">) {
  const scores = exam.exam_results.map((result) => Number(result.normalized_score)).filter(Number.isFinite);
  return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
}

export function filterAndSortExams<T extends ExamForFiltering>(exams: T[], filters: ExamFilters) {
  const query = filters.query.trim().toLocaleLowerCase("az-AZ");
  const filtered = exams.filter((exam) => {
    if (query && !exam.title.toLocaleLowerCase("az-AZ").includes(query)) return false;
    if (filters.month !== "all" && exam.exam_date.slice(0, 7) !== filters.month) return false;
    if (filters.groupId !== "all" && exam.groups.id !== filters.groupId) return false;
    const hasResults = exam.exam_results.length > 0;
    if (filters.resultStatus === "announced" && !hasResults) return false;
    if (filters.resultStatus === "unannounced" && hasResults) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "newest") return b.exam_date.localeCompare(a.exam_date) || a.title.localeCompare(b.title, "az-AZ");
    if (filters.sort === "oldest") return a.exam_date.localeCompare(b.exam_date) || a.title.localeCompare(b.title, "az-AZ");
    const aAverage = examAverage(a);
    const bAverage = examAverage(b);
    if (aAverage === null && bAverage === null) return b.exam_date.localeCompare(a.exam_date);
    if (aAverage === null) return 1;
    if (bAverage === null) return -1;
    return filters.sort === "score-desc" ? bAverage - aAverage : aAverage - bAverage;
  });
}

export function activeExamFilterCount(filters: ExamFilters) {
  return Number(Boolean(filters.query.trim())) + Number(filters.month !== "all") + Number(filters.groupId !== "all") + Number(filters.resultStatus !== "all") + Number(filters.sort !== "newest");
}
