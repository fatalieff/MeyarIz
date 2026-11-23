"use client";

import { useActionState, useMemo, useState } from "react";
import { addPause, addPayment, adjustInvoice, completeLesson, updateBillingTerms, voidPayment } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { azn } from "@/lib/payments";

const field = "focus-ring mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm";
const today = new Date().toISOString().slice(0, 10);
function Message({ state }: { state: any }) { return state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : state?.ok ? <p className="text-sm text-emerald-700">{state.message}</p> : null; }

export function PaymentForm({ students, invoices, defaultStudentId }: { students: any[]; invoices: any[]; defaultStudentId?: string }) {
  const [state, action, pending] = useActionState(addPayment, null);
  const [studentId, setStudentId] = useState(defaultStudentId || "");
  const summary = useMemo(() => {
    const rows = invoices.filter((invoice) => invoice.student_id === studentId && invoice.status !== "VOID");
    const billed = rows.reduce((sum, invoice) => sum + Number(invoice.amount_cents || 0), 0);
    const paid = rows.reduce((sum, invoice) => sum + Number(invoice.paid_cents || 0), 0);
    return { rows, billed, paid, debt: Math.max(0, billed - paid) };
  }, [invoices, studentId]);
  return <form action={action} className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Şagird<select name="studentId" required value={studentId} onChange={(event) => setStudentId(event.target.value)} className={field}><option value="" disabled>Şagird seçin</option>{students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></label>
    <label className="text-sm font-semibold">İndi alınan məbləğ (AZN)<input name="amount" required inputMode="decimal" pattern="\d+(\.\d{1,2})?" className={field} placeholder={summary.debt ? (summary.debt / 100).toFixed(2) : "80.00"} /></label>
    {studentId && <div className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:col-span-2 sm:grid-cols-3">
      <div><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">Ümumi hesablanıb</span><strong className="mt-1 block text-lg text-slate-900">{azn(summary.billed)}</strong></div>
      <div><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">İndiyədək ödəyib</span><strong className="mt-1 block text-lg text-emerald-700">{azn(summary.paid)}</strong></div>
      <div><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">Qalıq borc</span><strong className="mt-1 block text-lg text-rose-700">{azn(summary.debt)}</strong></div>
      {!summary.rows.length && <p className="text-xs text-amber-700 sm:col-span-3">Bu şagird üçün hələ ödəniş hesabı yaradılmayıb.</p>}
    </div>}
    <label className="text-sm font-semibold">Alınma tarixi<input name="receivedAt" type="date" required max={today} defaultValue={today} className={field} /></label>
    <label className="text-sm font-semibold">Üsul<select name="method" className={field}><option value="CASH">Nağd</option><option value="BANK_TRANSFER">Bank köçürməsi</option><option value="OTHER">Digər</option></select></label>
    <label className="text-sm font-semibold sm:col-span-2">Hesablaşma dövrü<select name="invoiceId" className={field}><option value="">Avtomatik: ən köhnə borcdan başla</option>{summary.rows.filter((i) => !["PAID","VOID"].includes(i.status)).map((i) => <option key={i.id} value={i.id}>{i.period_key} · qalıq {azn(Number(i.amount_cents) - Number(i.paid_cents))}</option>)}</select></label>
    <label className="text-sm font-semibold sm:col-span-2">Qeyd<input name="note" maxLength={500} className={field} /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Saxlanılır..." : "Ödənişi qeydə al"}</Button>
  </form>;
}

export function PauseForm({ students, defaultStudentId }: { students: any[]; defaultStudentId?: string }) {
  const [state, action, pending] = useActionState(addPause, null);
  return <form action={action} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Şagird<select name="studentId" required defaultValue={defaultStudentId || ""} className={field}><option value="" disabled>Şagird seçin</option>{students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></label><label className="text-sm font-semibold">Fasilə növü<select name="kind" className={field}><option value="UNPAID">Ödənişsiz fasilə</option><option value="COMPENSATED">Kompensasiya edilən fasilə</option></select><span className="mt-1 block text-xs font-normal text-slate-500">Ödənişsiz fasilə gələcək tam dövr hesabını saxlayır; kompensasiya edilən fasilədə hesablaşma davam edir.</span></label><label className="text-sm font-semibold">Başlanğıc<input name="startsOn" type="date" required defaultValue={today} className={field} /></label><label className="text-sm font-semibold">Bitmə (istəyə bağlı)<input name="endsOn" type="date" className={field} /></label><label className="text-sm font-semibold sm:col-span-2">Səbəb<textarea name="reason" required minLength={3} className={`${field} min-h-20`} /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Saxlanılır..." : "Dərsləri dayandır"}</Button></form>;
}

export function BillingTermsForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(updateBillingTerms, null);
  return <form action={action} className="grid gap-3 sm:grid-cols-2"><input type="hidden" name="studentId" value={studentId} /><label className="text-sm font-semibold">Tətbiq tarixi<input name="effectiveFrom" type="date" min={today} defaultValue={today} required className={field} /></label><label className="text-sm font-semibold">Fərdi qiymət (AZN)<input name="priceOverride" inputMode="decimal" className={field} placeholder="Boş = qrup qiyməti" /></label><label className="text-sm font-semibold">Endirim növü<select name="discountKind" className={field}><option value="">Endirim yoxdur</option><option value="FIXED">Sabit AZN</option><option value="PERCENT">Faiz</option></select></label><label className="text-sm font-semibold">Endirim dəyəri<input name="discountValue" inputMode="decimal" className={field} /></label><label className="text-sm font-semibold">Tezlik<select name="discountFrequency" className={field}><option value="">Seçin</option><option value="ONE_TIME">Birdəfəlik</option><option value="RECURRING">Davamlı</option></select></label><label className="text-sm font-semibold">Səbəb<input name="discountReason" className={field} /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Saxlanılır..." : "Gələcək şərtləri saxla"}</Button></form>;
}

export function CompletedLessonForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(completeLesson, null);
  return <form action={action} className="grid gap-3 sm:grid-cols-3"><label className="text-sm font-semibold">Qrup<select name="groupId" required defaultValue="" className={field}><option value="" disabled>Qrup seçin</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label className="text-sm font-semibold">Tarix<input name="occursOn" type="date" max={today} defaultValue={today} required className={field} /></label><label className="text-sm font-semibold">Başlama saatı<input name="startsAt" type="time" className={field} /></label><div className="sm:col-span-3"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-3">{pending ? "Qeyd edilir..." : "Dərsi keçirilib kimi qeyd et"}</Button></form>;
}

export function AdjustmentForm({ studentId, invoices }: { studentId: string; invoices: any[] }) {
  const [state, action, pending] = useActionState(adjustInvoice, null);
  return <form action={action} className="grid gap-3 sm:grid-cols-2"><input type="hidden" name="studentId" value={studentId} /><label className="text-sm font-semibold">Hesab<select name="invoiceId" required className={field}>{invoices.filter(i=>!["PAID","VOID"].includes(i.status)).map(i=><option key={i.id} value={i.id}>{i.period_key}</option>)}</select></label><label className="text-sm font-semibold">Düzəliş<select name="kind" className={field}><option value="CREDIT">Kredit / borcu azalt</option><option value="DEBIT">Əlavə borc</option></select></label><label className="text-sm font-semibold">Məbləğ (AZN)<input name="amount" required inputMode="decimal" className={field} /></label><label className="text-sm font-semibold">Səbəb<input name="reason" required minLength={3} className={field} /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending || !invoices.length} className="sm:col-span-2">{pending ? "Tətbiq edilir..." : "Düzəlişi tətbiq et"}</Button></form>;
}

export function VoidPaymentForm({ studentId, payments }: { studentId: string; payments: any[] }) {
  const [state, action, pending] = useActionState(voidPayment, null);
  return <form action={action} className="grid gap-3 sm:grid-cols-2"><input type="hidden" name="studentId" value={studentId} /><label className="text-sm font-semibold">Ödəniş<select name="paymentId" required className={field}>{payments.filter(p=>!p.voided_at).map(p=><option key={p.id} value={p.id}>{p.received_at} · {(Number(p.amount_cents)/100).toFixed(2)} AZN</option>)}</select></label><label className="text-sm font-semibold">Ləğv səbəbi<input name="reason" required minLength={3} className={field} /></label><div className="sm:col-span-2"><Message state={state} /></div><Button variant="danger" disabled={pending || !payments.length} className="sm:col-span-2">{pending ? "Ləğv edilir..." : "Ödənişi auditlə ləğv et"}</Button></form>;
}
