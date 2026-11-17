import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="w-full">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-600">Xoş gəlmisiniz</p>
        <h2 className="mt-3 text-[1.85rem] font-semibold leading-tight tracking-[-.045em] text-slate-950 sm:text-[2rem]">Hesabınıza daxil olun</h2>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-slate-500">Davam etmək üçün giriş məlumatlarınızı daxil edin.</p>
      </div>

      {params.reset === "success" && (
        <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm leading-5 text-emerald-700">Şifrəniz uğurla yeniləndi. Yeni şifrənizlə daxil ola bilərsiniz.</p>
      )}
      {params.error === "link" && (
        <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-sm leading-5 text-rose-700">Bərpa keçidi etibarsızdır və ya vaxtı bitib. Yeni keçid tələb edin.</p>
      )}

      <AuthForm />

      <div className="mt-5 text-center">
        <Link href="/forgot-password" className="focus-ring inline-block rounded-lg text-sm font-semibold text-indigo-600 transition hover:text-indigo-800">Şifrəni unutmusunuz?</Link>
      </div>
    </div>
  );
}
