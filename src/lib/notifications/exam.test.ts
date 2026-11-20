import { describe, expect, it } from "vitest";
import {
  buildExamNotificationBody,
  examinationIdFromEventKey,
  parseExamNotificationBody,
} from "@/lib/notifications/exam";

describe("exam notification content", () => {
  it("formats and parses the exam date and teacher description", () => {
    const body = buildExamNotificationBody(
      "2026-11-25",
      "Mövzular: funksiya və törəmə.",
    );

    expect(body).toBe(
      "Tarix: 25 noyabr 2026\nAçıqlama: Mövzular: funksiya və törəmə.",
    );
    expect(parseExamNotificationBody(body)).toEqual({
      date: "25 noyabr 2026",
      description: "Mövzular: funksiya və törəmə.",
      examTitle: null,
      questionCount: null,
    });
  });

  it("uses a clear fallback when the teacher leaves the description empty", () => {
    expect(buildExamNotificationBody("2026-11-25", " ")).toContain(
      "Açıqlama: Açıqlama əlavə edilməyib.",
    );
  });

  it("converts legacy exam notifications to the structured card format", () => {
    expect(
      parseExamNotificationBody("Noyabr sınağı · 2026-11-25 · 30 sual"),
    ).toEqual({
      date: "25 noyabr 2026",
      description: null,
      examTitle: "Noyabr sınağı",
      questionCount: 30,
    });
  });

  it("extracts only valid examination ids from notification event keys", () => {
    expect(
      examinationIdFromEventKey(
        "exam-create:7c479a45-a75f-4fe0-9154-41e6a03e3b49",
      ),
    ).toBe("7c479a45-a75f-4fe0-9154-41e6a03e3b49");
    expect(examinationIdFromEventKey("exam-result:not-a-uuid")).toBeNull();
  });
});
