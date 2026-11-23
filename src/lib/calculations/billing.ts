export type Discount = { kind: "FIXED" | "PERCENT"; value: number } | null;

const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const anchoredDate = (year: number, month: number, anchorDay: number) => {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(anchorDay, last)));
};

export function anniversaryPeriod(anchorDay: number, asOf: string) {
  if (!Number.isInteger(anchorDay) || anchorDay < 1 || anchorDay > 31) throw new Error("Anchor günü düzgün deyil.");
  const date = new Date(`${asOf}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Tarix düzgün deyil.");
  let start = anchoredDate(date.getUTCFullYear(), date.getUTCMonth(), anchorDay);
  if (start > date) start = anchoredDate(date.getUTCFullYear(), date.getUTCMonth() - 1, anchorDay);
  const next = anchoredDate(start.getUTCFullYear(), start.getUTCMonth() + 1, anchorDay);
  const end = new Date(next.getTime() - 86_400_000);
  return { start: iso(start), end: iso(end) };
}

export function calculateInvoiceCents(baseCents: number, discount: Discount) {
  if (!Number.isSafeInteger(baseCents) || baseCents < 0) throw new Error("Məbləğ düzgün deyil.");
  if (!discount) return { baseCents, discountCents: 0, totalCents: baseCents };
  if (!Number.isSafeInteger(discount.value) || discount.value < 0) throw new Error("Endirim düzgün deyil.");
  const raw = discount.kind === "FIXED" ? discount.value : Math.floor(baseCents * Math.min(discount.value, 10_000) / 10_000);
  const discountCents = Math.min(baseCents, raw);
  return { baseCents, discountCents, totalCents: baseCents - discountCents };
}

export function allocateOldestFirst(paymentCents: number, balances: number[]) {
  if (!Number.isSafeInteger(paymentCents) || paymentCents <= 0 || balances.some((b) => !Number.isSafeInteger(b) || b < 0)) throw new Error("Məbləğ düzgün deyil.");
  let remaining = paymentCents;
  const allocations = balances.map((balance) => { const used = Math.min(balance, remaining); remaining -= used; return used; });
  return { allocations, advanceCents: remaining };
}
