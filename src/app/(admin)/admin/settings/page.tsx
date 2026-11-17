import { AdminHeader } from "@/components/admin/admin-header";
import { getSessionProfile } from "@/lib/auth/session";
import { ShieldCheck, User, Server } from "lucide-react";

export default async function AdminSettingsPage() {
  const profile = await getSessionProfile();

  return (
    <>
      <AdminHeader title="İnzibatçı Tənzimləmələri" />
      <main className="px-5 py-8 md:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">İnzibatçı Hesabı və Sistem Məlumatları</h2>
          <p className="mt-1 text-xs text-slate-500">
            Cari admin profili və platformanın təhlükəsizlik parametrləri
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profil Məlumatları */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white">
                <User className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Profil Məlumatları</h3>
                <p className="text-xs text-slate-400">İnzibatçı hesabının detalları</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[10px]">Ad və Soyad</span>
                <p className="mt-1 font-semibold text-slate-800 text-sm">{profile?.full_name ?? "İnzibatçı"}</p>
              </div>

              <div>
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[10px]">Rol</span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 font-bold uppercase text-[10px] text-white">
                  <ShieldCheck className="size-3 text-indigo-400" />
                  Sistem İnzibatçısı (admin)
                </span>
              </div>

              <div>
                <span className="block font-bold uppercase tracking-wider text-slate-400 text-[10px]">Status</span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-[10px] text-emerald-700">
                  Aktiv
                </span>
              </div>
            </div>
          </div>

          {/* Sistem və Təhlükəsizlik */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Server className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Məlumat Təhlükəsizliyi Qaydaları</h3>
                <p className="text-xs text-slate-400">Multi-tenant mühitin qorunması</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-slate-600 leading-5">
              <p>
                • <strong>İzolyasiya:</strong> Hər bir müəllim yalnız öz qruplarına, şagirdlərinə və nəticələrinə çıxış əldə edir.
              </p>
              <p>
                • <strong>Məxfilik:</strong> İnzibatçı paneli müəllimlərin şagird adlarını, test suallarını və qiymətlərini görə və redaktə edə bilməz.
              </p>
              <p>
                • <strong>Müvəqqəti Şifrələr:</strong> Yeni müəllim yaradılarkən və ya şifrə sıfırlanarkən şifrələr heç vaxt bazada açıq saxlanılmır və loqlara yazılmır.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
