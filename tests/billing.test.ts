import { describe, expect, it } from "vitest";
import { allocateOldestFirst, anniversaryPeriod, calculateInvoiceCents } from "@/lib/calculations/billing";

describe("billing calculations", () => {
  it("qoşulma tarixindən asılı olmayaraq tam məbləği saxlayır", () => {
    expect(calculateInvoiceCents(8000, null).totalCents).toBe(8000);
  });
  it("20 faiz endirimi qəpiklə hesablayır", () => {
    expect(calculateInvoiceCents(10000, { kind: "PERCENT", value: 2000 })).toEqual({ baseCents: 10000, discountCents: 2000, totalCents: 8000 });
  });
  it("sabit endirim mənfi invoice yaratmır", () => {
    expect(calculateInvoiceCents(1000, { kind: "FIXED", value: 1500 }).totalCents).toBe(0);
  });
  it("30 + 50 hissəli ödəniş məntiqini qoruyur", () => {
    expect(allocateOldestFirst(3000, [8000])).toEqual({ allocations: [3000], advanceCents: 0 });
    expect(allocateOldestFirst(5000, [5000])).toEqual({ allocations: [5000], advanceCents: 0 });
  });
  it("160 AZN-in 80 AZN-ni avans saxlayır", () => {
    expect(allocateOldestFirst(16000, [8000])).toEqual({ allocations: [8000], advanceCents: 8000 });
  });
  it.each([
    [29, "2025-02-28", { start: "2025-02-28", end: "2025-03-28" }],
    [30, "2025-02-28", { start: "2025-02-28", end: "2025-03-29" }],
    [31, "2025-02-28", { start: "2025-02-28", end: "2025-03-30" }],
    [31, "2025-03-31", { start: "2025-03-31", end: "2025-04-29" }],
  ])("%i anchor gününü qısa aylarda qoruyur", (anchor, asOf, expected) => {
    expect(anniversaryPeriod(anchor, asOf)).toEqual(expected);
  });
  it("mənfi ödənişi bloklayır", () => {
    expect(() => allocateOldestFirst(-1, [8000])).toThrow();
  });
});
