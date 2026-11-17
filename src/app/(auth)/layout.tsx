import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7fb] px-5 py-10 sm:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent" />
      <div className="absolute left-1/2 top-[-18rem] size-[34rem] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-[100px]" />
      <div className="absolute bottom-[-14rem] right-[-10rem] size-[28rem] rounded-full bg-violet-200/20 blur-[110px]" />

      <div className="relative w-full max-w-[28rem]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative block size-16 overflow-hidden rounded-[1.15rem] bg-black shadow-[0_12px_30px_rgba(17,22,42,.2)] ring-1 ring-white/10">
            <Image src="/mathrank-logo.png" alt="MathRank loqosu" fill priority sizes="64px" className="object-cover" />
          </span>
          <strong className="mt-3 text-lg tracking-[-.035em] text-slate-950">MathRank</strong>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[.24em] text-slate-400">ağıllı inkişaf</span>
        </div>

        <div className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_24px_70px_rgba(31,38,72,.09)] ring-1 ring-slate-900/[.025] backdrop-blur-xl sm:p-9">
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">© 2026 MathRank · Təhlükəsiz giriş</p>
      </div>
    </main>
  );
}
