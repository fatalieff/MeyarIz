import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const azPercent = (value: number | null | undefined) => value == null ? "—" : `${new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 1 }).format(value)}%`;
export const azDate = (value: string | Date) => new Intl.DateTimeFormat("az-AZ", { day:"2-digit", month:"long", year:"numeric", timeZone:"Asia/Baku" }).format(new Date(value));
export function normalizeAzPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `994${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `994${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("994")) return digits;
  return null;
}
