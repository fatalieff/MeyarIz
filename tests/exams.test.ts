import { describe, expect, it } from "vitest";
import { activeExamFilterCount, defaultExamFilters, examAverage, filterAndSortExams, type ExamForFiltering } from "@/lib/calculations/exams";

const exams: ExamForFiltering[] = [
  { id: "1", title: "Noyabr sınağı", exam_date: "2026-11-10", groups: { id: "g1", name: "A qrupu" }, exam_results: [{ normalized_score: 80 }, { normalized_score: 60 }] },
  { id: "2", title: "Oktyabr sınağı", exam_date: "2026-10-15", groups: { id: "g2", name: "B qrupu" }, exam_results: [] },
  { id: "3", title: "Noyabr təkrar", exam_date: "2026-11-05", groups: { id: "g1", name: "A qrupu" }, exam_results: [{ normalized_score: 90 }] },
];

describe("exam filtering and sorting", () => {
  it("calculates the displayed average", () => expect(examAverage(exams[0])).toBe(70));
  it("filters by month and group", () => expect(filterAndSortExams(exams, { ...defaultExamFilters, month: "2026-11", groupId: "g1" })).toHaveLength(2));
  it("filters exams without announced results", () => expect(filterAndSortExams(exams, { ...defaultExamFilters, resultStatus: "unannounced" }).map((exam) => exam.id)).toEqual(["2"]));
  it("sorts averages from high to low", () => expect(filterAndSortExams(exams, { ...defaultExamFilters, sort: "score-desc" }).map((exam) => exam.id)).toEqual(["3", "1", "2"]));
  it("sorts averages from low to high and leaves missing results last", () => expect(filterAndSortExams(exams, { ...defaultExamFilters, sort: "score-asc" }).map((exam) => exam.id)).toEqual(["1", "3", "2"]));
  it("counts only non-default filters", () => expect(activeExamFilterCount({ ...defaultExamFilters, query: "noyabr", groupId: "g1", sort: "oldest" })).toBe(3));
});
