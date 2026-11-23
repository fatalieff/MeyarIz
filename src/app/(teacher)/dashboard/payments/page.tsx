import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CompletedLessonForm,
  PaymentForm,
  PauseForm,
} from "@/components/payments/payment-forms";
import { getPaymentsData } from "@/lib/queries/payments";
import {
  azn,
  billingModelLabel,
  invoiceStatusLabel,
  type InvoiceStatus,
} from "@/lib/payments";
import {
  Banknote,
  BookOpenCheck,
  CircleDollarSign,
  Clock3,
  PauseCircle,
  Plus,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [data, params] = await Promise.all([getPaymentsData(), searchParams]);
  if (!data) return null;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const q = (params.q || "").toLocaleLowerCase("az");
  const invoices = data.invoices.filter(
    (i: any) =>
      (!params.status || i.status === params.status) &&
      (!params.group || i.group_id === params.group) &&
      (!q || i.students?.full_name?.toLocaleLowerCase("az").includes(q))
  );

  const current = data.invoices.filter(
    (i: any) => i.period_start <= today && i.period_end >= today
  );
  const currentBilled = current.reduce(
    (s: number, i: any) => s + Number(i.amount_cents),
    0
  );
  const currentAllocated = current.reduce(
    (s: number, i: any) => s + Number(i.paid_cents),
    0
  );
  const cashCollected = data.payments
    .filter((p: any) => String(p.received_at).startsWith(month))
    .reduce((s: number, p: any) => s + Number(p.amount_cents), 0);
  const totalAllocations = data.payments.reduce(
    (sum: number, p: any) =>
      sum +
      (p.payment_allocations || []).reduce(
        (a: number, x: any) => a + Number(x.amount_cents),
        0
      ),
    0
  );
  const totalCash = data.payments.reduce(
    (s: number, p: any) => s + Number(p.amount_cents),
    0
  );
  const advance = totalCash - totalAllocations;
  const oldDebt = data.invoices
    .filter(
      (i: any) => i.period_end < today && !["PAID", "VOID"].includes(i.status)
    )
    .reduce(
      (s: number, i: any) =>
        s + Number(i.amount_cents) - Number(i.paid_cents),
      0
    );
  const unpaidPauseCount = data.pauses.filter(
    (p: any) =>
      p.kind === "UNPAID" &&
      p.starts_on <= today &&
      (!p.ends_on || p.ends_on >= today)
  ).length;

  const paidStudents = new Set(
    current.filter((i: any) => i.status === "PAID").map((i: any) => i.student_id)
  ).size;
  const partialStudents = new Set(
    current
      .filter((i: any) => i.status === "PARTIALLY_PAID")
      .map((i: any) => i.student_id)
  ).size;
  const unpaidStudents = new Set(
    current
      .filter((i: any) => ["UNPAID", "OVERDUE"].includes(i.status))
      .map((i: any) => i.student_id)
  ).size;

  const monthly = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + idx, 1);
    const key = d.toISOString().slice(0, 7);
    return {
      key,
      label: d.toLocaleDateString("az-AZ", { month: "short" }),
      value: data.payments
        .filter((p: any) => String(p.received_at).startsWith(key))
        .reduce((s: number, p: any) => s + Number(p.amount_cents), 0),
    };
  });
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.value));

  const cards = [
    [
      "Cari dövr hesablanıb",
      currentBilled,
      CircleDollarSign,
      "bg-indigo-50 text-indigo-600",
    ],
    [
      "Bu ay faktiki alınıb",
      cashCollected,
      Banknote,
      "bg-emerald-50 text-emerald-600",
    ],
    [
      "Cari dövr borcu",
      currentBilled - currentAllocated,
      Clock3,
      "bg-amber-50 text-amber-600",
    ],
    ["Keçmiş borclar", oldDebt, TrendingUp, "bg-rose-50 text-rose-600"],
    ["Tətbiq olunmamış avans", advance, WalletCards, "bg-sky-50 text-sky-600"],
  ] as const;

  const isAnyFormOpen = Boolean(params.add || params.pause || params.lesson);

  return (
    <>
      <AppHeader title="Ödənişlər" />
      <main className="mx-auto max-w-[1600px] space-y-7 p-5 md:p-8">
        <PageHeader
          eyebrow={
            data.settings
              ? billingModelLabel[
                  data.settings.billing_model as keyof typeof billingModelLabel
                ]
              : "Ödəniş modeli yoxdur"
          }
          title="Ödənişlərin idarə edilməsi"
          description="Hesablanan borcları, real daxilolmaları, avansları və fasilələri ayrı-ayrılıqda izləyin."
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={params.add ? "/dashboard/payments" : "?add=1"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 shadow-xs",
                  params.add
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                )}
              >
                {params.add ? <X className="size-4" /> : <Plus className="size-4" />}
                <span>{params.add ? "Paneli bağla" : "Ödəniş əlavə et"}</span>
              </Link>

              <Link
                href={params.pause ? "/dashboard/payments" : "?pause=1"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-150 shadow-2xs",
                  params.pause
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <PauseCircle className="size-4 text-sky-600" />
                <span>{params.pause ? "Paneli bağla" : "Fasilə əlavə et"}</span>
              </Link>

              {data.settings?.billing_model === "LESSON_PACKAGE" && (
                <Link
                  href={params.lesson ? "/dashboard/payments" : "?lesson=1"}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all shadow-2xs",
                    params.lesson
                      ? "border-slate-300 bg-slate-100 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <BookOpenCheck className="size-4 text-slate-600" />
                  <span>Dərs qeyd et</span>
                </Link>
              )}
            </div>
          }
        />

        {/* FOKUS PANİELİ: Ödəniş, Fasilə və ya Dərs Əlavə Ediləndə Hər Şey Göz Qabağında */}
        {isAnyFormOpen && (
          <section className="animate-in fade-in slide-in-from-top-2 duration-200">
            {params.add && (
              <article className="card border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-5 sm:p-7 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
                      <Banknote className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Yeni Ödəniş Qeydiyyatı
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Şagirddən alınan nağd və ya köçürmə ödənişini daxil edin. Məbləğ avtomatik borca tətbiq olunacaq.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                  >
                    <X className="size-4" />
                    <span>Bağla</span>
                  </Link>
                </div>
                <PaymentForm
                  students={data.students}
                  invoices={data.invoices}
                  defaultStudentId={params.student}
                />
              </article>
            )}

            {params.pause && (
              <article className="card border-sky-200/90 bg-gradient-to-b from-sky-50/40 via-white to-white p-5 sm:p-7 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-100 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs">
                      <PauseCircle className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Dərsləri Dayandır / Fasilə Təyini
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Müvəqqəti dərslərdə iştirak etməyən şagirdlər üçün fasilə qeydiyyatı və hesablaşma nizamlanması.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                  >
                    <X className="size-4" />
                    <span>Bağla</span>
                  </Link>
                </div>
                <PauseForm
                  students={data.students}
                  defaultStudentId={params.student}
                />
              </article>
            )}

            {params.lesson && (
              <article className="card border-slate-200 bg-gradient-to-b from-slate-50/50 via-white to-white p-5 sm:p-7 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
                      <BookOpenCheck className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Keçirilmiş Paket Dərsi
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Qrup üçün keçirilmiş dərsi qeyd edin və davamiyyəti avtomatik təsdiqləyin.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                  >
                    <X className="size-4" />
                    <span>Bağla</span>
                  </Link>
                </div>
                <CompletedLessonForm groups={data.groups} />
              </article>
            )}
          </section>
        )}

        {/* Maliyyə KPI Kartları */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(([title, value, Icon, tone]) => (
            <article key={title} className="card p-5">
              <div
                className={`grid size-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon className="size-5" />
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                {title}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {azn(value)}
              </p>
            </article>
          ))}
        </section>

        {/* Şagirdlərin status icmalı */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4 text-sm">
            <strong className="text-2xl text-emerald-600">{paidStudents}</strong>
            <span className="ml-2 text-slate-500">tam ödəyib</span>
          </div>
          <div className="card p-4 text-sm">
            <strong className="text-2xl text-amber-600">{partialStudents}</strong>
            <span className="ml-2 text-slate-500">qismən ödəyib</span>
          </div>
          <div className="card p-4 text-sm">
            <strong className="text-2xl text-rose-600">{unpaidStudents}</strong>
            <span className="ml-2 text-slate-500">ödəməyib</span>
          </div>
          <div className="card p-4 text-sm">
            <strong className="text-2xl text-sky-600">{unpaidPauseCount}</strong>
            <span className="ml-2 text-slate-500">ödənişsiz fasilədə</span>
          </div>
        </section>

        {/* Hesablar və Aylıq daxilolma cədvəli */}
        <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          <article className="card overflow-hidden">
            <div className="border-b p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-slate-900">Şagird hesabları</h2>
                <Link
                  href="?pause=1"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <PauseCircle className="size-4 text-sky-600" />
                  <span>Fasilə əlavə et</span>
                </Link>
              </div>

              <form className="mt-4 grid gap-3 sm:grid-cols-3">
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Şagird adı ilə axtar..."
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <select
                  name="group"
                  defaultValue={params.group || ""}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="">Bütün qruplar</option>
                  {data.groups.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <select
                  name="status"
                  defaultValue={params.status || ""}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="">Bütün statuslar</option>
                  {["PAID", "PARTIALLY_PAID", "UNPAID", "OVERDUE"].map((s) => (
                    <option key={s} value={s}>
                      {invoiceStatusLabel[s as InvoiceStatus]}
                    </option>
                  ))}
                </select>
                <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:col-span-3 cursor-pointer">
                  Filtrlə
                </button>
              </form>
            </div>

            {invoices.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-4">Şagird</th>
                      <th>Dövr</th>
                      <th>Hesab</th>
                      <th>Ödənib</th>
                      <th>Qalıq</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((i: any) => (
                      <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-semibold">
                          <Link
                            className="hover:text-indigo-600 transition-colors text-slate-900"
                            href={`/dashboard/students/${i.student_id}`}
                          >
                            {i.students?.full_name}
                          </Link>
                          <span className="block text-xs font-normal text-slate-400">
                            {i.groups?.name}
                          </span>
                        </td>
                        <td className="text-slate-600">{i.period_key}</td>
                        <td className="text-slate-900 font-medium">
                          {azn(i.amount_cents)}
                        </td>
                        <td className="text-emerald-700 font-medium">
                          {azn(i.paid_cents)}
                        </td>
                        <td className="font-semibold text-slate-900">
                          {azn(Number(i.amount_cents) - Number(i.paid_cents))}
                        </td>
                        <td>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-semibold",
                              i.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : i.status === "OVERDUE"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {invoiceStatusLabel[i.status as InvoiceStatus]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  title="Hesab tapılmadı"
                  description="Filtrlərə uyğun hesablaşma yoxdur."
                />
              </div>
            )}
          </article>

          {/* Real daxilolma bar qrafiki */}
          <article className="card p-5">
            <h2 className="font-bold text-slate-900">Aylıq real daxilolma</h2>
            <p className="mt-1 text-xs text-slate-500">
              Avans daxil olmaqla pulun alındığı tarix üzrə
            </p>
            <div className="mt-6 flex h-52 items-end gap-3">
              {monthly.map((m) => (
                <div
                  key={m.key}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-semibold text-slate-500">
                    {m.value ? azn(m.value) : ""}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-indigo-500 transition-all duration-300 hover:bg-indigo-600"
                    style={{
                      height: `${Math.max(4, (m.value / maxMonthly) * 150)}px`,
                    }}
                  />
                  <span className="text-xs text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-sm text-sky-950">
              <strong>{unpaidPauseCount}</strong> şagird hazırda ödənişsiz fasilədədir.
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
