import { describe, expect, it } from "vitest";
import { classifyResultChanges } from "@/lib/notifications/result-changes";

const examId = "7c479a45-a75f-4fe0-9154-41e6a03e3b49";

describe("result notification changes", () => {
  it("does not classify an unchanged result as an update", () => {
    expect(classifyResultChanges(
      [{ examination_id: examId, student_id: "student-1", correct_answers: 18 }],
      [{ student_id: "student-1", correct_answers: 18 }],
    )).toEqual({
      changedRows: [],
      newlyPublishedStudentIds: [],
      updatedStudentIds: [],
    });
  });

  it("separates newly published and updated student results", () => {
    const newResult = { examination_id: examId, student_id: "student-2", correct_answers: 15 };
    const updatedResult = { examination_id: examId, student_id: "student-1", correct_answers: 19 };

    expect(classifyResultChanges(
      [newResult, updatedResult],
      [{ student_id: "student-1", correct_answers: 18 }],
    )).toEqual({
      changedRows: [newResult, updatedResult],
      newlyPublishedStudentIds: ["student-2"],
      updatedStudentIds: ["student-1"],
    });
  });
});
