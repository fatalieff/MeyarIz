import { describe, expect, it } from "vitest";
import {
  findOccurrenceConflicts,
  isScheduleOccurrencePast,
  nextScheduleOccurrenceDate,
} from "./schedules";

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

describe("isScheduleOccurrencePast", () => {
  it("uses the lesson end time in Baku", () => {
    expect(
      isScheduleOccurrencePast("2026-11-24", "15:00", new Date("2026-11-24T10:59:00Z")),
    ).toBe(false);
    expect(
      isScheduleOccurrencePast("2026-11-24", "15:00", new Date("2026-11-24T11:00:00Z")),
    ).toBe(true);
  });
});

describe("findOccurrenceConflicts", () => {
  const target = {
    id: "target",
    weekday: 2,
    start_time: "15:00",
    end_time: "17:00",
    is_extra: false,
  };

  it("finds weekly and dated lessons that overlap the occurrence", () => {
    const conflicts = findOccurrenceConflicts(target, [
      { id: "weekly", weekday: 2, start_time: "16:00", end_time: "18:00", is_extra: false },
      { id: "extra", weekday: 2, start_time: "14:00", end_time: "15:30", is_extra: true, session_date: "2026-11-24" },
      { id: "other-day", weekday: 3, start_time: "15:00", end_time: "17:00", is_extra: false },
    ], "2026-11-24");

    expect(conflicts.map((conflict) => conflict.id)).toEqual(["weekly", "extra"]);
  });

  it("ignores another lesson cancelled for the same date", () => {
    const conflicts = findOccurrenceConflicts(target, [{
      id: "cancelled",
      weekday: 2,
      start_time: "16:00",
      end_time: "18:00",
      is_extra: false,
      group_schedule_cancellations: [{ occurrence_date: "2026-11-24" }],
    }], "2026-11-24");

    expect(conflicts).toHaveLength(0);
  });
});
