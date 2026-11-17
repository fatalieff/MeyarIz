import { MeyarIzLogo, MeyarIzWordmark } from "@/components/ui/meyariz-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f8fafc] px-5 py-10 sm:px-8">
      <div className="relative w-full max-w-[28rem]">
        <div className="mb-8 flex flex-col items-center text-center">
          <MeyarIzLogo size={56} className="shadow-sm" />
          <MeyarIzWordmark className="mt-3 text-2xl" />
          <span className="mt-1 text-sm text-slate-500">Hər nəticənin bir izi var</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">© 2026 MeyarİZ · Təhlükəsiz sistem girişi</p>
      </div>
    </main>
  );
}
