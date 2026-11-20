import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const AZ_MONTHS_LONG = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"
];

const AZ_MONTHS_SHORT = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avq", "sen", "okt", "noy", "dek"
];

function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const azPercent = (value: number | null | undefined) => value == null ? "—" : `${new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 1 }).format(value)}%`;
export const azDate = (value: string | Date) => {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${AZ_MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
};
export const azMonthShort = (value: string | Date) => {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return AZ_MONTHS_SHORT[date.getMonth()] || "";
};
export function isLightColor(hexColor: string | null | undefined): boolean {
  if (!hexColor) return false;
  let hex = hexColor.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  // Standard relative luminance formula (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

export function normalizeAzPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `994${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `994${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("994")) return digits;
  return null;
}
