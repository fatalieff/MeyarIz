import { describe, expect, it } from "vitest";
import {
  filterStudentResultsByPeriod,
  filterWorkspaceResultsByPeriod,
  normalizeRankingPeriod,
} from "@/lib/calculations/ranking-period";

const result = (studentId: string, examDate: string, score: number) => ({
  student_id: studentId,
  normalized_score: score,
  examinations: { exam_date: examDate },
});

describe("ranking period filters", () => {
  it("keeps each student's latest three results", () => {
    const rows = [
      result("a", "2026-11-01", 10),
      result("a", "2026-11-02", 20),
      result("a", "2026-11-03", 30),
      result("a", "2026-11-04", 40),
      result("b", "2026-10-01", 50),
      result("b", "2026-10-02", 60),
    ];

    expect(filterWorkspaceResultsByPeriod(rows, "last_3")).toEqual([
      rows[3],
      rows[2],
      rows[1],
      rows[5],
      rows[4],
    ]);
  });

  it("filters the current Baku calendar month", () => {
    const rows = [
      result("a", "2026-10-31", 10),
      result("a", "2026-11-01", 20),
      result("a", "2026-11-30", 30),
      result("a", "2026-12-01", 40),
    ];

    expect(filterStudentResultsByPeriod(rows, "month", "2026-11")).toEqual([
      rows[2],
      rows[1],
    ]);
  });

  it("falls back to the safe default for unknown database values", () => {
    expect(normalizeRankingPeriod("last-3")).toBe("last_3");
    expect(normalizeRankingPeriod("all")).toBe("all");
  });
});
