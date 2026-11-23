"use server";

import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pauseSchema } from "@/lib/validations/payments";

type Result = { ok?: true; message?: string; error?: string };
const money = z.string().regex(/^\d+(\.\d{1,2})?$/, "Məbləği düzgün daxil edin.").transform((v) => Math.round(Number(v) * 100)).refine((v) => v > 0, "Məbləğ müsbət olmalıdır.");
const friendly = (e: unknown) => e instanceof ZodError ? e.issues[0]?.message : e instanceof Error ? e.message : "Əməliyyat tamamlanmadı.";

async function client() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase bağlantısı qurulmayıb.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessiya bitib.");
  return supabase;
}

export async function addPayment(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = z.object({ studentId: z.string().uuid(), amount: money, receivedAt: z.string().date(), method: z.enum(["CASH", "BANK_TRANSFER", "OTHER"]), invoiceId: z.string().uuid().optional().or(z.literal("")), note: z.string().trim().max(500).optional() }).parse(Object.fromEntries(formData));
    const supabase = await client();
    const { error } = await supabase.rpc("record_payment", { p_student: input.studentId, p_amount_cents: input.amount, p_received_at: input.receivedAt, p_method: input.method, p_invoice: input.invoiceId || null, p_note: input.note || null });
    if (error) throw new Error(error.message || "Ödəniş qeydə alına bilmədi.");
    revalidatePath("/dashboard/payments"); revalidatePath(`/dashboard/students/${input.studentId}`);
    return { ok: true, message: "Ödəniş qeydə alındı və borca tətbiq edildi." };
  } catch (e) { return { error: friendly(e) }; }
}

export async function addPause(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = pauseSchema.parse(Object.fromEntries(formData));
    const supabase = await client();
    const { error } = await supabase.rpc("set_student_pause", { p_student: input.studentId, p_starts_on: input.startsOn, p_ends_on: input.endsOn || null, p_kind: input.kind, p_reason: input.reason });
    if (error) throw new Error(error.message || "Fasilə qeydə alına bilmədi.");
    revalidatePath("/dashboard/payments"); revalidatePath(`/dashboard/students/${input.studentId}`);
    return { ok: true, message: "Fasilə tarixçəyə əlavə edildi." };
  } catch (e) { return { error: friendly(e) }; }
}

export async function updateBillingTerms(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = z.object({ studentId: z.string().uuid(), effectiveFrom: z.string().date(), priceOverride: z.string().optional(), discountKind: z.enum(["FIXED", "PERCENT"]).optional().or(z.literal("")), discountValue: z.string().optional(), discountFrequency: z.enum(["ONE_TIME", "RECURRING"]).optional().or(z.literal("")), discountReason: z.string().trim().max(500).optional() }).parse(Object.fromEntries(formData));
    const price = input.priceOverride ? money.parse(input.priceOverride) : null;
    const discount = input.discountValue ? (input.discountKind === "FIXED" ? money.parse(input.discountValue) : Math.round(Number(input.discountValue) * 100)) : null;
    if (input.discountKind && (!input.discountFrequency || discount === null)) throw new Error("Endirim dəyəri və tezliyini seçin.");
    const supabase = await client();
    const { error } = await supabase.rpc("set_student_billing_terms", { p_student: input.studentId, p_effective_from: input.effectiveFrom, p_price_override_cents: price, p_discount_kind: input.discountKind || null, p_discount_value: discount, p_discount_frequency: input.discountFrequency || null, p_discount_reason: input.discountReason || null });
    if (error) throw new Error(error.message || "Ödəniş şərtləri yenilənə bilmədi.");
    revalidatePath(`/dashboard/students/${input.studentId}`); revalidatePath("/dashboard/payments");
    return { ok: true, message: "Yeni qiymət və endirim yalnız gələcək dövrlər üçün saxlanıldı." };
  } catch (e) { return { error: friendly(e) }; }
}

export async function completeLesson(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = z.object({ groupId: z.string().uuid(), occursOn: z.string().date(), startsAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal("")) }).parse(Object.fromEntries(formData));
    const supabase = await client();
    const { error } = await supabase.rpc("complete_group_lesson", { p_group: input.groupId, p_occurs_on: input.occursOn, p_starts_at: input.startsAt || null });
    if (error) throw new Error(error.message || "Dərs qeydə alına bilmədi.");
    revalidatePath("/dashboard/payments");
    return { ok: true, message: "Keçirilmiş dərs aktiv qrup üzvləri üçün qeydə alındı." };
  } catch (e) { return { error: friendly(e) }; }
}

export async function adjustInvoice(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = z.object({ invoiceId: z.string().uuid(), kind: z.enum(["DEBIT", "CREDIT"]), amount: money, reason: z.string().trim().min(3).max(500), studentId: z.string().uuid() }).parse(Object.fromEntries(formData));
    const supabase = await client();
    const { error } = await supabase.rpc("add_invoice_adjustment", { p_invoice: input.invoiceId, p_kind: input.kind, p_amount_cents: input.amount, p_reason: input.reason });
    if (error) throw new Error(error.message || "Düzəliş tətbiq edilə bilmədi.");
    revalidatePath(`/dashboard/students/${input.studentId}`); revalidatePath("/dashboard/payments");
    return { ok: true, message: "Əsaslandırılmış düzəliş audit tarixçəsi ilə saxlanıldı." };
  } catch (e) { return { error: friendly(e) }; }
}

export async function voidPayment(_: unknown, formData: FormData): Promise<Result> {
  try {
    const input = z.object({ paymentId: z.string().uuid(), reason: z.string().trim().min(3).max(500), studentId: z.string().uuid() }).parse(Object.fromEntries(formData));
    const supabase = await client();
    const { error } = await supabase.rpc("void_payment", { p_payment: input.paymentId, p_reason: input.reason });
    if (error) throw new Error(error.message || "Ödəniş ləğv edilə bilmədi.");
    revalidatePath(`/dashboard/students/${input.studentId}`); revalidatePath("/dashboard/payments");
    return { ok: true, message: "Ödəniş silinmədən ləğv edildi və borc yenidən hesablandı." };
  } catch (e) { return { error: friendly(e) }; }
}
