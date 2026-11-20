import { describe, expect, it } from "vitest";
import { nextScheduleOccurrenceDate } from "./schedules";

describe("nextScheduleOccurrenceDate", () => {
  it("keeps today's occurrence while the lesson has not ended", () => {
    expect(
      nextScheduleOccurrenceDate(1, "15:00", new Date("2026-11-23T06:00:00Z")),
    ).toBe("2026-11-23");
  });

  it("moves to next week after today's lesson has ended", () => {
    expect(
      nextScheduleOccurrenceDate(1, "15:00", new Date("2026-11-23T12:00:00Z")),
    ).toBe("2026-11-30");
  });

  it("handles month boundaries in Baku time", () => {
    expect(
      nextScheduleOccurrenceDate(1, "15:00", new Date("2026-11-29T08:00:00Z")),
    ).toBe("2026-11-30");
  });
});
