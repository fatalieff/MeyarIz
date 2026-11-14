import { BarChart3,CheckCircle2,Sigma,Sparkles,TrendingUp } from "lucide-react";

export default function AuthLayout({children}:{children:React.ReactNode}){
  return <main className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-[1.08fr_.92fr]">
    <section className="relative hidden overflow-hidden bg-[#090e1c] p-12 text-white lg:flex lg:flex-col">
      <div className="absolute -left-32 -top-32 size-[34rem] rounded-full bg-indigo-600/25 blur-3xl"/>
      <div className="absolute -bottom-48 -right-32 size-[38rem] rounded-full bg-cyan-500/15 blur-3xl"/>
      <div className="absolute inset-0 opacity-[.05] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:48px_48px]"/>
      <div className="relative flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_16px_36px_rgba(79,70,229,.4)]"><Sigma/></span><div><strong className="block text-xl tracking-tight">MathRank</strong><span className="text-[10px] uppercase tracking-[.22em] text-slate-400">ağıllı inkişaf</span></div></div>
      <div className="relative my-auto max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles className="size-3.5"/>Müəllimlər üçün premium idarəetmə</div>
        <h1 className="max-w-xl text-5xl font-bold leading-[1.06] tracking-[-.045em]">Nəticələri sadəcə qeyd etməyin. İnkişafı görünən edin.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Qruplar, dərs cədvəli, sınaqlar və şagird performansı — bir fokuslu və zərif iş məkanında.</p>
        <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
          {[["Aydın analitika",BarChart3],["Canlı inkişaf",TrendingUp],["Təhlükəsiz məlumat",CheckCircle2]].map(([label,Icon])=><div key={label as string} className="rounded-2xl border border-white/[.08] bg-white/[.045] p-4 backdrop-blur"><Icon className="mb-3 size-5 text-indigo-300"/><p className="text-sm font-semibold text-slate-200">{label as string}</p></div>)}
        </div>
      </div>
      <p className="relative text-xs uppercase tracking-[.18em] text-slate-500">Peşəkar riyaziyyat müəllimləri üçün hazırlanıb</p>
    </section>
    <section className="relative grid place-items-center overflow-hidden px-6 py-12"><div className="absolute -right-28 -top-28 size-80 rounded-full bg-indigo-200/30 blur-3xl"/><div className="relative w-full max-w-md rounded-[2rem] border border-white bg-white/82 p-7 shadow-[0_30px_80px_rgba(31,38,72,.12)] backdrop-blur-xl sm:p-9">{children}</div></section>
  </main>;
}
