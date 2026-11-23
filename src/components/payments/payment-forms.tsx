"use client";

import { useActionState, useMemo, useState } from "react";
import {
  addPause,
  addPayment,
  adjustInvoice,
  completeLesson,
  updateBillingTerms,
  voidPayment,
} from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { azn } from "@/lib/payments";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Banknote,
  Calendar,
  CalendarX,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  RotateCcw,
  User,
  Wallet,
} from "lucide-react";

const field =
  "focus-ring mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-colors";
const today = new Date().toISOString().slice(0, 10);

function Message({ state }: { state: any }) {
  if (!state) return null;
  if (state.error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm font-medium text-rose-700">
        <AlertCircle className="size-4 shrink-0 text-rose-600" />
        <span>{state.error}</span>
      </div>
    );
  }
  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        <span>{state.message}</span>
      </div>
    );
  }
  return null;
}

export function PaymentForm({
  students,
  invoices,
  defaultStudentId,
}: {
  students: any[];
  invoices: any[];
  defaultStudentId?: string;
}) {
  const [state, action, pending] = useActionState(addPayment, null);
  const [studentId, setStudentId] = useState(defaultStudentId || "");
  const [amountInput, setAmountInput] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "OTHER">("CASH");

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId]
  );

  const summary = useMemo(() => {
    const rows = invoices.filter(
      (invoice) => invoice.student_id === studentId && invoice.status !== "VOID"
    );
    const billed = rows.reduce(
      (sum, invoice) => sum + Number(invoice.amount_cents || 0),
      0
    );
    const paid = rows.reduce(
      (sum, invoice) => sum + Number(invoice.paid_cents || 0),
      0
    );
    const debt = Math.max(0, billed - paid);
    const unpaid = rows.filter((i) => !["PAID", "VOID"].includes(i.status));
    return { rows, billed, paid, debt, unpaid };
  }, [invoices, studentId]);

  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    const rows = invoices.filter(
      (invoice) => invoice.student_id === id && invoice.status !== "VOID"
    );
    const billed = rows.reduce(
      (sum, invoice) => sum + Number(invoice.amount_cents || 0),
      0
    );
    const paid = rows.reduce(
      (sum, invoice) => sum + Number(invoice.paid_cents || 0),
      0
    );
    const debt = Math.max(0, billed - paid);
    if (debt > 0) {
      setAmountInput((debt / 100).toFixed(2));
    } else {
      setAmountInput("");
    }
  };

  const groupName =
    selectedStudent?.group_memberships?.[0]?.groups?.name || "Təyin edilməyib";

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Sol: Əsas Forma */}
      <form action={action} className="space-y-4 lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Şagird seçimi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Şagird
            </label>
            <select
              name="studentId"
              required
              value={studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className={field}
            >
              <option value="" disabled>
                Şagird seçin
              </option>
              {students.map((s) => {
                const g = s.group_memberships?.[0]?.groups?.name;
                return (
                  <option key={s.id} value={s.id}>
                    {s.full_name} {g ? `(${g})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Məbləğ */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Alınan Məbləğ (AZN)
              </label>
              {summary.debt > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountInput((summary.debt / 100).toFixed(2))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Tam borcu yaz: {azn(summary.debt)}
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <input
                name="amount"
                required
                inputMode="decimal"
                pattern="\d+(\.\d{1,2})?"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`${field} mt-0 pl-9 font-semibold text-slate-900 text-base`}
                placeholder={
                  summary.debt ? (summary.debt / 100).toFixed(2) : "0.00"
                }
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₼
              </span>
            </div>
          </div>

          {/* Alınma tarixi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Alınma tarixi
            </label>
            <input
              name="receivedAt"
              type="date"
              required
              max={today}
              defaultValue={today}
              className={field}
            />
          </div>

          {/* Ödəniş üsulu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Ödəniş üsulu
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod("CASH")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  method === "CASH"
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Banknote className="size-3.5" />
                <span>Nağd</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("BANK_TRANSFER")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  method === "BANK_TRANSFER"
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <CreditCard className="size-3.5" />
                <span>Köçürmə</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("OTHER")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  method === "OTHER"
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Wallet className="size-3.5" />
                <span>Digər</span>
              </button>
            </div>
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              <option value="CASH">Nağd</option>
              <option value="BANK_TRANSFER">Bank köçürməsi</option>
              <option value="OTHER">Digər</option>
            </select>
          </div>

          {/* Hesablaşma dövrü */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Hesablaşma dövrü
            </label>
            <select name="invoiceId" className={field}>
              <option value="">Avtomatik: ən köhnə borcdan başla (Tövsiyə olunur)</option>
              {summary.rows
                .filter((i) => !["PAID", "VOID"].includes(i.status))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.period_key} · qalıq borc:{" "}
                    {azn(Number(i.amount_cents) - Number(i.paid_cents))}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Ödəniş ilk olaraq ən köhnə borca yönəldiləcək, qalan hissə avans saxlanacaq.
            </p>
          </div>

          {/* Qeyd */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Qeyd (istəyə bağlı)
            </label>
            <input
              name="note"
              maxLength={500}
              placeholder="Məsələn: Valideyn kartla göndərdi"
              className={field}
            />
          </div>
        </div>

        <div>
          <Message state={state} />
        </div>

        <Button disabled={pending} className="w-full sm:w-auto min-w-[200px]">
          {pending ? "Saxlanılır..." : "Ödənişi qeydə al"}
        </Button>
      </form>

      {/* Sağ: Canlı Maliyyə İcmalı */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 lg:col-span-5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
          <User className="size-4.5 text-indigo-600 shrink-0" />
          <h4>Şagirdin Maliyyə Statusu</h4>
        </div>

        {selectedStudent ? (
          <div className="space-y-4">
            <div>
              <p className="text-base font-extrabold text-slate-900">
                {selectedStudent.full_name}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Qrup: <span className="text-indigo-600 font-semibold">{groupName}</span>
              </p>
            </div>

            {/* Borc və Ödəniş kartları */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-xl border p-3.5",
                  summary.debt > 0
                    ? "border-rose-200 bg-rose-50/80 text-rose-900"
                    : "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                )}
              >
                <span className="block text-[11px] font-bold uppercase tracking-wide opacity-80">
                  Cari Borc
                </span>
                <strong className="mt-1 block text-2xl font-black">
                  {azn(summary.debt)}
                </strong>
                <span className="text-[11px] opacity-75">
                  {summary.debt > 0 ? "Ödənilməli məbləğ" : "Borc yoxdur"}
                </span>
              </div>

              <div className="rounded-xl border border-indigo-150 bg-white p-3.5 shadow-2xs">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  İndiyədək Ödəyib
                </span>
                <strong className="mt-1 block text-xl font-extrabold text-slate-900">
                  {azn(summary.paid)}
                </strong>
                <span className="text-[11px] text-slate-400">
                  Hesablanıb: {azn(summary.billed)}
                </span>
              </div>
            </div>

            {/* Ödənilməmiş hesablar siyahısı */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">
                Açıq Hesablar ({summary.unpaid.length})
              </span>
              {summary.unpaid.length ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {summary.unpaid.map((inv) => {
                    const rem = Number(inv.amount_cents) - Number(inv.paid_cents);
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-2xs"
                      >
                        <div>
                          <strong className="font-semibold text-slate-800">
                            {inv.period_key}
                          </strong>
                          <span className="block text-[10px] text-slate-400">
                            Ümumi: {azn(inv.amount_cents)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-600">
                            Qalıq: {azn(rem)}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Ödənilib: {azn(inv.paid_cents)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-150 bg-emerald-50/60 p-3 text-xs text-emerald-800">
                  ✓ Bu şagirdin heç bir gecikmiş və ya açıq borc hesabı yoxdur.
                </div>
              )}
            </div>

            {/* Məlumat bildirişi */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900 flex items-start gap-2">
              <Info className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Qəbul edilən məbləğ avtomatik ən köhnə dövrün borcuna tətbiq olunacaq.
                Əgər məbləğ borcdan çox olarsa, qalan hissə avans olaraq saxlanılır.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
            <User className="size-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Şagird seçilməyib</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
              Sol tərəfdən şagird seçdikdə onun aktiv borcu, qrupu və ödənilməmiş hesabları burada
              canlı göstəriləcək.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

export function PauseForm({
  students,
  defaultStudentId,
}: {
  students: any[];
  defaultStudentId?: string;
}) {
  const [state, action, pending] = useActionState(addPause, null);
  const [studentId, setStudentId] = useState(defaultStudentId || "");
  const [kind, setKind] = useState<"UNPAID" | "COMPENSATED">("UNPAID");

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId]
  );

  const groupName =
    selectedStudent?.group_memberships?.[0]?.groups?.name || "Təyin edilməyib";

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Sol: Əsas Forma */}
      <form action={action} className="space-y-4 lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Şagird seçimi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Şagird
            </label>
            <select
              name="studentId"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={field}
            >
              <option value="" disabled>
                Şagird seçin
              </option>
              {students.map((s) => {
                const g = s.group_memberships?.[0]?.groups?.name;
                return (
                  <option key={s.id} value={s.id}>
                    {s.full_name} {g ? `(${g})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Fasilə Növü Seçimi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Fasilə növü
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Ödənişsiz fasilə kartı */}
              <button
                type="button"
                onClick={() => setKind("UNPAID")}
                className={cn(
                  "relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer",
                  kind === "UNPAID"
                    ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <CalendarX
                      className={cn(
                        "size-4 shrink-0",
                        kind === "UNPAID" ? "text-indigo-600" : "text-slate-400"
                      )}
                    />
                    <span>Ödənişsiz fasilə</span>
                  </div>
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center",
                      kind === "UNPAID"
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300"
                    )}
                  >
                    {kind === "UNPAID" && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <span className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Gələcək dövr borcu hesablanmır
                </span>
              </button>

              {/* Kompensasiya edilən fasilə kartı */}
              <button
                type="button"
                onClick={() => setKind("COMPENSATED")}
                className={cn(
                  "relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer",
                  kind === "COMPENSATED"
                    ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <RotateCcw
                      className={cn(
                        "size-4 shrink-0",
                        kind === "COMPENSATED" ? "text-indigo-600" : "text-slate-400"
                      )}
                    />
                    <span>Kompensasiya edilən fasilə</span>
                  </div>
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center",
                      kind === "COMPENSATED"
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300"
                    )}
                  >
                    {kind === "COMPENSATED" && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <span className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Buraxılmış dərslər sonradan keçiriləcək
                </span>
              </button>
            </div>

            {/* Standart select - sinxronlaşdırılmış və form data üçün təminat */}
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              <option value="UNPAID">Ödənişsiz fasilə</option>
              <option value="COMPENSATED">Kompensasiya edilən fasilə</option>
            </select>
          </div>

          {/* Başlanğıc tarixi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Başlanğıc tarixi
            </label>
            <input
              name="startsOn"
              type="date"
              required
              defaultValue={today}
              className={field}
            />
          </div>

          {/* Bitmə tarixi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Bitmə tarixi (istəyə bağlı)
            </label>
            <input name="endsOn" type="date" className={field} />
          </div>

          {/* Səbəb */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Səbəb
            </label>
            <textarea
              name="reason"
              required
              minLength={3}
              placeholder="Fasilənin səbəbini qeyd edin (məsələn: Xəstəlik, Tətil, Ailəvi səbəb)"
              className={`${field} min-h-20`}
            />
          </div>
        </div>

        <div>
          <Message state={state} />
        </div>

        <Button disabled={pending} className="w-full sm:w-auto min-w-[200px]">
          {pending ? "Saxlanılır..." : "Dərsləri dayandır"}
        </Button>
      </form>

      {/* Sağ: İNFO CARD - Fasilə növlərinin ətraflı izahı */}
      <aside className="flex flex-col gap-3 rounded-2xl border border-indigo-150 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/80 p-5 lg:col-span-5 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm border-b border-indigo-100/90 pb-3">
          <Info className="size-4.5 text-indigo-600 shrink-0" />
          <h4>Fasilə Növləri və Qaydalar</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Şagird dərslərdə iştirak etmədikdə düzgün növü seçmək maliyyə və davamiyyət
          hesablamalarının dəqiq aparılması üçün vacibdir.
        </p>

        <div className="mt-1 space-y-3">
          {/* Ödənişsiz fasilə kartı */}
          <div
            onClick={() => setKind("UNPAID")}
            className={cn(
              "cursor-pointer rounded-xl border p-3.5 transition-all duration-150",
              kind === "UNPAID"
                ? "border-indigo-500 bg-white shadow-xs ring-2 ring-indigo-500/15"
                : "border-slate-200/90 bg-white/70 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                <CalendarX className="size-3.5 text-indigo-600 shrink-0" />
                Ödənişsiz fasilə
              </span>
              {kind === "UNPAID" && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Hazırda seçilib
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
              Şagird həmin müddətdə dərsə gəlmir və fasilənin tam əhatə etdiyi gələcək aylar
              üçün yeni ödəniş hesabı yaranmır.
            </p>
            <div className="mt-2.5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 text-[11px] text-indigo-950 leading-relaxed">
              <strong>💡 Nümunə:</strong> Məsələn, dekabr boyu fasilədədirsə, dekabr üçün
              borc hesablanmır.
            </div>
          </div>

          {/* Kompensasiya edilən fasilə kartı */}
          <div
            onClick={() => setKind("COMPENSATED")}
            className={cn(
              "cursor-pointer rounded-xl border p-3.5 transition-all duration-150",
              kind === "COMPENSATED"
                ? "border-indigo-500 bg-white shadow-xs ring-2 ring-indigo-500/15"
                : "border-slate-200/90 bg-white/70 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="size-3.5 text-indigo-600 shrink-0" />
                Kompensasiya edilən fasilə
              </span>
              {kind === "COMPENSATED" && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Hazırda seçilib
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
              Şagird gəlmir, amma buraxdığı dərslər sonradan əlavə dərslərlə kompensasiya
              ediləcək.
            </p>
            <div className="mt-2.5 rounded-lg border border-amber-150 bg-amber-50/60 p-2 text-[11px] text-amber-950 leading-relaxed">
              <strong>💡 Qeyd:</strong> Şagirdin aylıq ödəniş və hesablaşması davam edir,
              müəllim buraxılmış dərsləri gələcəkdə əlavə saatlarla təşkil edir.
            </div>
          </div>
        </div>

        {selectedStudent && (
          <div className="mt-1 rounded-xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Seçilmiş şagird: {selectedStudent.full_name}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Qrup: <span className="font-medium text-slate-700">{groupName}</span>
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

export function BillingTermsForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(updateBillingTerms, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="text-sm font-semibold">
        Tətbiq tarixi
        <input
          name="effectiveFrom"
          type="date"
          min={today}
          defaultValue={today}
          required
          className={field}
        />
      </label>
      <label className="text-sm font-semibold">
        Fərdi qiymət (AZN)
        <input
          name="priceOverride"
          inputMode="decimal"
          className={field}
          placeholder="Boş = qrup qiyməti"
        />
      </label>
      <label className="text-sm font-semibold">
        Endirim növü
        <select name="discountKind" className={field}>
          <option value="">Endirim yoxdur</option>
          <option value="FIXED">Sabit AZN</option>
          <option value="PERCENT">Faiz</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Endirim dəyəri
        <input name="discountValue" inputMode="decimal" className={field} />
      </label>
      <label className="text-sm font-semibold">
        Tezlik
        <select name="discountFrequency" className={field}>
          <option value="">Seçin</option>
          <option value="ONE_TIME">Birdəfəlik</option>
          <option value="RECURRING">Davamlı</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Səbəb
        <input name="discountReason" className={field} />
      </label>
      <div className="sm:col-span-2">
        <Message state={state} />
      </div>
      <Button disabled={pending} className="sm:col-span-2">
        {pending ? "Saxlanılır..." : "Gələcək şərtləri saxla"}
      </Button>
    </form>
  );
}

export function CompletedLessonForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(completeLesson, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm font-semibold">
        Qrup
        <select name="groupId" required defaultValue="" className={field}>
          <option value="" disabled>
            Qrup seçin
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Tarix
        <input
          name="occursOn"
          type="date"
          max={today}
          defaultValue={today}
          required
          className={field}
        />
      </label>
      <label className="text-sm font-semibold">
        Başlama saatı
        <input name="startsAt" type="time" className={field} />
      </label>
      <div className="sm:col-span-3">
        <Message state={state} />
      </div>
      <Button disabled={pending} className="sm:col-span-3">
        {pending ? "Qeyd edilir..." : "Dərsi keçirilib kimi qeyd et"}
      </Button>
    </form>
  );
}

export function AdjustmentForm({
  studentId,
  invoices,
}: {
  studentId: string;
  invoices: any[];
}) {
  const [state, action, pending] = useActionState(adjustInvoice, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="text-sm font-semibold">
        Hesab
        <select name="invoiceId" required className={field}>
          {invoices
            .filter((i) => !["PAID", "VOID"].includes(i.status))
            .map((i) => (
              <option key={i.id} value={i.id}>
                {i.period_key}
              </option>
            ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Düzəliş
        <select name="kind" className={field}>
          <option value="CREDIT">Kredit / borcu azalt</option>
          <option value="DEBIT">Əlavə borc</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Məbləğ (AZN)
        <input name="amount" required inputMode="decimal" className={field} />
      </label>
      <label className="text-sm font-semibold">
        Səbəb
        <input name="reason" required minLength={3} className={field} />
      </label>
      <div className="sm:col-span-2">
        <Message state={state} />
      </div>
      <Button disabled={pending || !invoices.length} className="sm:col-span-2">
        {pending ? "Tətbiq edilir..." : "Düzəlişi tətbiq et"}
      </Button>
    </form>
  );
}

export function VoidPaymentForm({
  studentId,
  payments,
}: {
  studentId: string;
  payments: any[];
}) {
  const [state, action, pending] = useActionState(voidPayment, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="text-sm font-semibold">
        Ödəniş
        <select name="paymentId" required className={field}>
          {payments
            .filter((p) => !p.voided_at)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.received_at} · {(Number(p.amount_cents) / 100).toFixed(2)} AZN
              </option>
            ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Ləğv səbəbi
        <input name="reason" required minLength={3} className={field} />
      </label>
      <div className="sm:col-span-2">
        <Message state={state} />
      </div>
      <Button
        variant="danger"
        disabled={pending || !payments.length}
        className="sm:col-span-2"
      >
        {pending ? "Ləğv edilir..." : "Ödənişi auditlə ləğv et"}
      </Button>
    </form>
  );
}
