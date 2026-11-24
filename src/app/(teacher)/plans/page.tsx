import type { Metadata } from "next";
import { Info, Layers3 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PricingPlans } from "@/components/plans/pricing-plans";

export const metadata: Metadata = {
  title: "Abunəlik planları",
  description: "MeyarİZ Basic, Plus və Ultra abunəlik planları.",
};

export default function PlansPage() {
  return (
    <>
      <AppHeader title="Abunəlik planları" />
      <main className="overflow-x-hidden p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white px-5 py-8 text-center shadow-[0_18px_55px_-38px_rgba(79,70,229,0.5)] sm:px-8 sm:py-10">
            <div aria-hidden="true" className="absolute -left-20 -top-24 size-64 rounded-full bg-indigo-100/60 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-32 -right-24 size-72 rounded-full bg-violet-100/50 blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Layers3 className="size-5" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">MeyarİZ planları</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">Sizə uyğun planı seçin</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Tədrisinizi daha rahat idarə edin. Şagird sayınıza və ehtiyaclarınıza uyğun MeyarİZ planını seçin.</p>
            </div>
          </header>

          <PricingPlans />

          <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 sm:px-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Info className="size-4" /></span>
            <p className="pt-1 leading-6">Abunəlik planları hazırda tanıtım məqsədilə təqdim olunur. Qiymətlər və paket şərtləri gələcəkdə dəyişə bilər.</p>
          </aside>
        </div>
      </main>
    </>
  );
}
