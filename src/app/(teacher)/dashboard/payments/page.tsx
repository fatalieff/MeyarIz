import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CompletedLessonForm, PaymentForm, PauseForm } from "@/components/payments/payment-forms";
import { getPaymentsData } from "@/lib/queries/payments";
import { azn, billingModelLabel, invoiceStatusLabel, type InvoiceStatus } from "@/lib/payments";
import { Banknote, CircleDollarSign, Clock3, PauseCircle, Plus, TrendingUp, WalletCards } from "lucide-react";

export const instant = false;

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [data, params] = await Promise.all([getPaymentsData(), searchParams]);
  if (!data) return null;
  const now = new Date(); const today = now.toISOString().slice(0, 10); const month = today.slice(0, 7);
  const q = (params.q || "").toLocaleLowerCase("az");
  const invoices = data.invoices.filter((i: any) => (!params.status || i.status === params.status) && (!params.group || i.group_id === params.group) && (!q || i.students?.full_name?.toLocaleLowerCase("az").includes(q)));
  const current = data.invoices.filter((i: any) => i.period_start <= today && i.period_end >= today);
  const currentBilled = current.reduce((s: number, i: any) => s + Number(i.amount_cents), 0);
  const currentAllocated = current.reduce((s: number, i: any) => s + Number(i.paid_cents), 0);
  const cashCollected = data.payments.filter((p: any) => String(p.received_at).startsWith(month)).reduce((s: number, p: any) => s + Number(p.amount_cents), 0);
  const totalAllocations = data.payments.reduce((sum: number, p: any) => sum + (p.payment_allocations || []).reduce((a: number, x: any) => a + Number(x.amount_cents), 0), 0);
  const totalCash = data.payments.reduce((s: number, p: any) => s + Number(p.amount_cents), 0);
  const advance = totalCash - totalAllocations;
  const oldDebt = data.invoices.filter((i: any) => i.period_end < today && !["PAID","VOID"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.amount_cents) - Number(i.paid_cents), 0);
  const unpaidPauseCount = data.pauses.filter((p: any) => p.kind === "UNPAID" && p.starts_on <= today && (!p.ends_on || p.ends_on >= today)).length;
  const paidStudents = new Set(current.filter((i:any) => i.status === "PAID").map((i:any) => i.student_id)).size;
  const partialStudents = new Set(current.filter((i:any) => i.status === "PARTIALLY_PAID").map((i:any) => i.student_id)).size;
  const unpaidStudents = new Set(current.filter((i:any) => ["UNPAID","OVERDUE"].includes(i.status)).map((i:any) => i.student_id)).size;
  const monthly = Array.from({ length: 6 }, (_, idx) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + idx, 1); const key = d.toISOString().slice(0,7); return { key, label: d.toLocaleDateString("az-AZ", { month: "short" }), value: data.payments.filter((p:any) => String(p.received_at).startsWith(key)).reduce((s:number,p:any)=>s+Number(p.amount_cents),0) }; });
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.value));
  const cards = [
    ["Cari dövr hesablanıb", currentBilled, CircleDollarSign, "bg-indigo-50 text-indigo-600"],
    ["Bu ay faktiki alınıb", cashCollected, Banknote, "bg-emerald-50 text-emerald-600"],
    ["Cari dövr borcu", currentBilled-currentAllocated, Clock3, "bg-amber-50 text-amber-600"],
    ["Keçmiş borclar", oldDebt, TrendingUp, "bg-rose-50 text-rose-600"],
    ["Tətbiq olunmamış avans", advance, WalletCards, "bg-sky-50 text-sky-600"],
  ] as const;
  return <><AppHeader title="Ödənişlər" /><main className="mx-auto max-w-[1600px] space-y-7 p-5 md:p-8">
    <PageHeader eyebrow={data.settings ? billingModelLabel[data.settings.billing_model as keyof typeof billingModelLabel] : "Ödəniş modeli yoxdur"} title="Ödənişlərin idarə edilməsi" description="Hesablanan borcları, real daxilolmaları, avansları və fasilələri ayrı-ayrılıqda izləyin." action={<Link href="?add=1" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" />Ödəniş əlavə et</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([title,value,Icon,tone]) => <article key={title} className="card p-5"><div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div><p className="mt-4 text-xs font-semibold text-slate-500">{title}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{azn(value)}</p></article>)}</section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="card p-4 text-sm"><strong className="text-2xl text-emerald-600">{paidStudents}</strong><span className="ml-2 text-slate-500">tam ödəyib</span></div><div className="card p-4 text-sm"><strong className="text-2xl text-amber-600">{partialStudents}</strong><span className="ml-2 text-slate-500">qismən ödəyib</span></div><div className="card p-4 text-sm"><strong className="text-2xl text-rose-600">{unpaidStudents}</strong><span className="ml-2 text-slate-500">ödəməyib</span></div><div className="card p-4 text-sm"><strong className="text-2xl text-sky-600">{unpaidPauseCount}</strong><span className="ml-2 text-slate-500">ödənişsiz fasilədə</span></div></section>
    <div className="flex flex-wrap gap-2"><Link href="?pause=1" className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold">Fasilə əlavə et</Link>{data.settings?.billing_model === "LESSON_PACKAGE" && <Link href="?lesson=1" className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold">Keçirilmiş dərs əlavə et</Link>}</div>
    <section className="grid gap-5 lg:grid-cols-2">{params.add && <article className="card p-5"><h2 className="mb-4 font-bold">Yeni ödəniş</h2><PaymentForm students={data.students} invoices={data.invoices} defaultStudentId={params.student} /></article>}{params.pause && <article className="card p-5"><h2 className="mb-4 font-bold">Dərsləri dayandır</h2><PauseForm students={data.students} defaultStudentId={params.student} /></article>}{params.lesson && <article className="card p-5 lg:col-span-2"><h2 className="mb-4 font-bold">Keçirilmiş paket dərsi</h2><CompletedLessonForm groups={data.groups} /></article>}</section>
    <section className="grid gap-5 xl:grid-cols-[2fr_1fr]"><article className="card overflow-hidden"><div className="border-b p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Şagird hesabları</h2><Link href="?pause=1" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"><PauseCircle className="size-4" />Fasilə əlavə et</Link></div><form className="mt-4 grid gap-3 sm:grid-cols-3"><input name="q" defaultValue={params.q} placeholder="Şagird adı" className="rounded-xl border px-3 py-2 text-sm" /><select name="group" defaultValue={params.group || ""} className="rounded-xl border px-3 py-2 text-sm"><option value="">Bütün qruplar</option>{data.groups.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}</select><select name="status" defaultValue={params.status || ""} className="rounded-xl border px-3 py-2 text-sm"><option value="">Bütün statuslar</option>{["PAID","PARTIALLY_PAID","UNPAID","OVERDUE"].map(s=><option key={s} value={s}>{invoiceStatusLabel[s as InvoiceStatus]}</option>)}</select><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white sm:col-span-3">Filtrlə</button></form></div>{invoices.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">Şagird</th><th>Dövr</th><th>Hesab</th><th>Ödənib</th><th>Qalıq</th><th>Status</th></tr></thead><tbody className="divide-y">{invoices.map((i:any)=><tr key={i.id}><td className="p-4 font-semibold"><Link className="hover:text-indigo-600" href={`/dashboard/students/${i.student_id}`}>{i.students?.full_name}</Link><span className="block text-xs font-normal text-slate-400">{i.groups?.name}</span></td><td>{i.period_key}</td><td>{azn(i.amount_cents)}</td><td>{azn(i.paid_cents)}</td><td className="font-semibold">{azn(Number(i.amount_cents)-Number(i.paid_cents))}</td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${i.status==="PAID"?"bg-emerald-50 text-emerald-700":i.status==="OVERDUE"?"bg-rose-50 text-rose-700":"bg-amber-50 text-amber-700"}`}>{invoiceStatusLabel[i.status as InvoiceStatus]}</span></td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="Hesab tapılmadı" description="Filtrlərə uyğun hesablaşma yoxdur." /></div>}</article>
    <article className="card p-5"><h2 className="font-bold">Aylıq real daxilolma</h2><p className="mt-1 text-xs text-slate-500">Avans daxil olmaqla pulun alındığı tarix üzrə</p><div className="mt-6 flex h-52 items-end gap-3">{monthly.map(m=><div key={m.key} className="flex flex-1 flex-col items-center gap-2"><span className="text-[10px] font-semibold text-slate-500">{m.value?azn(m.value):""}</span><div className="w-full rounded-t-lg bg-indigo-500" style={{height:`${Math.max(4,m.value/maxMonthly*150)}px`}} /><span className="text-xs text-slate-500">{m.label}</span></div>)}</div><div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm"><strong>{unpaidPauseCount}</strong> şagird hazırda ödənişsiz fasilədədir.</div></article></section>
  </main></>;
}
