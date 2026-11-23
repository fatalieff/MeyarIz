export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID";
export type PauseKind = "UNPAID" | "COMPENSATED";

export const azn = (cents: number | string | null | undefined) =>
  new Intl.NumberFormat("az-AZ", { style: "currency", currency: "AZN" }).format(Number(cents || 0) / 100);

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  UNPAID: "Ödənilməyib",
  PARTIALLY_PAID: "Qismən ödənilib",
  PAID: "Ödənilib",
  OVERDUE: "Gecikib",
  VOID: "Ləğv edilib",
};

export const pauseKindLabel: Record<PauseKind, string> = {
  UNPAID: "Ödənişsiz fasilə",
  COMPENSATED: "Kompensasiya edilən fasilə",
};

export const billingModelLabel = {
  CALENDAR_MONTH: "Təqvim ayı",
  ANNIVERSARY_MONTH: "Fərdi aylıq dövr",
  LESSON_PACKAGE: "Dərs paketi",
} as const;
