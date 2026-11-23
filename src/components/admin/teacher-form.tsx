"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTeacher } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Check,
  GraduationCap,
  Info,
  KeyRound,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BillingModelKey = "CALENDAR_MONTH" | "ANNIVERSARY_MONTH" | "LESSON_PACKAGE";

export function CreateTeacherForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTeacher, null);
  const [billingModel, setBillingModel] = useState<BillingModelKey>("CALENDAR_MONTH");

  useEffect(() => {
    if (state?.ok && state.teacherId) {
      toast.success(state.message || "Müəllim hesabı uğurla yaradıldı.");
      router.push(`/admin/teachers/${state.teacherId}`);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="size-5 shrink-0 text-rose-600" />
          <p>{state.error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Ad və Soyad <span className="text-rose-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="məs. Aysel Məmmədova"
            className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            E-poçt ünvanı <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="muellim@example.com"
            className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div>
        <label htmlFor="workspaceName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          İş Sahəsi / Kurs Adı <span className="text-rose-500">*</span>
        </label>
        <input
          id="workspaceName"
          name="workspaceName"
          type="text"
          required
          placeholder="məs. Zəfər Riyaziyyat Mərkəzi"
          className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />
        <p className="mt-1 text-xs text-slate-500">
          Hər müəllimin yalnız özünə aid ayrıca workspace-i olur. Şagird və qruplar bu sahədə cəmlənəcək.
        </p>
      </div>

      {/* ÖDƏNİŞ MODELİ SEÇİMİ VƏ INFO CARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="billingModel" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Ödəniş modeli <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-slate-400">Workspace üzrə vahid model</span>
        </div>

        {/* 3 Model Seçim Kartları */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Təqvim ayı üzrə */}
          <button
            type="button"
            onClick={() => setBillingModel("CALENDAR_MONTH")}
            className={cn(
              "relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer",
              billingModel === "CALENDAR_MONTH"
                ? "border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  billingModel === "CALENDAR_MONTH" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <Calendar className="size-4" />
                </div>
                <span className="font-bold text-xs text-slate-900">Təqvim ayı üzrə</span>
              </div>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  billingModel === "CALENDAR_MONTH"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300"
                )}
              >
                {billingModel === "CALENDAR_MONTH" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <span className="mt-2 text-[11px] text-slate-500 leading-normal">
              Hər ayın 1-dən son gününə qədər hesablanır
            </span>
          </button>

          {/* Qoşulma gününə görə aylıq */}
          <button
            type="button"
            onClick={() => setBillingModel("ANNIVERSARY_MONTH")}
            className={cn(
              "relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer",
              billingModel === "ANNIVERSARY_MONTH"
                ? "border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  billingModel === "ANNIVERSARY_MONTH" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <CalendarDays className="size-4" />
                </div>
                <span className="font-bold text-xs text-slate-900">Qoşulma gününə görə</span>
              </div>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  billingModel === "ANNIVERSARY_MONTH"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300"
                )}
              >
                {billingModel === "ANNIVERSARY_MONTH" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <span className="mt-2 text-[11px] text-slate-500 leading-normal">
              Şagirdin qrupa qoşulduğu gündən aylıq dövr
            </span>
          </button>

          {/* Dərs paketi üzrə */}
          <button
            type="button"
            onClick={() => setBillingModel("LESSON_PACKAGE")}
            className={cn(
              "relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer",
              billingModel === "LESSON_PACKAGE"
                ? "border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  billingModel === "LESSON_PACKAGE" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <GraduationCap className="size-4" />
                </div>
                <span className="font-bold text-xs text-slate-900">Dərs paketi üzrə</span>
              </div>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  billingModel === "LESSON_PACKAGE"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300"
                )}
              >
                {billingModel === "LESSON_PACKAGE" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <span className="mt-2 text-[11px] text-slate-500 leading-normal">
              Təyin edilmiş dərs sayına əsasən hesablanır
            </span>
          </button>
        </div>

        {/* Form submit üçün gizli select */}
        <select
          id="billingModel"
          name="billingModel"
          required
          value={billingModel}
          onChange={(e) => setBillingModel(e.target.value as BillingModelKey)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="CALENDAR_MONTH">Təqvim ayı üzrə</option>
          <option value="ANNIVERSARY_MONTH">Qoşulma gününə görə aylıq</option>
          <option value="LESSON_PACKAGE">Dərs paketi üzrə</option>
        </select>

        {/* İNFO CARD - Seçilmiş Ödəniş Modeli və Ortaq Qeyd */}
        <div className="rounded-2xl border border-indigo-150 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/80 p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Info className="size-4.5 text-indigo-600 shrink-0" />
              <h4>Ödəniş Modeli Bələdçisi</h4>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
              {billingModel === "CALENDAR_MONTH" && "Təqvim ayı üzrə"}
              {billingModel === "ANNIVERSARY_MONTH" && "Qoşulma gününə görə aylıq"}
              {billingModel === "LESSON_PACKAGE" && "Dərs paketi üzrə"}
            </span>
          </div>

          <div className="mt-3.5 space-y-3">
            {/* Təqvim ayı üzrə izah */}
            {billingModel === "CALENDAR_MONTH" && (
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Ödəniş dövrü hər ayın 1-dən ayın son gününə qədər hesablanır.
                </p>
                <div className="rounded-xl border border-indigo-100 bg-white/90 p-3 shadow-2xs">
                  <p className="font-semibold text-slate-800 mb-1">
                    Məsələn, aylıq qiymət 80 AZN-dirsə:
                  </p>
                  <ul className="space-y-1 text-slate-600 pl-1">
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>Noyabr: 1–30 noyabr — 80 AZN</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>Dekabr: 1–31 dekabr — 80 AZN</span>
                    </li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500">
                  📌 Şagird ayın ortasında qoşulsa belə, ilk ay üçün tam məbləğ hesablanır.
                </p>
              </div>
            )}

            {/* Qoşulma gününə görə aylıq izah */}
            {billingModel === "ANNIVERSARY_MONTH" && (
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Hər şagirdin aylıq ödəniş dövrü onun qrupa qoşulduğu gündən başlayır.
                </p>
                <div className="rounded-xl border border-indigo-100 bg-white/90 p-3 shadow-2xs">
                  <p className="font-semibold text-slate-800 mb-1">
                    Məsələn, şagird 12 noyabrda qoşulubsa:
                  </p>
                  <ul className="space-y-1 text-slate-600 pl-1">
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>12 noyabr – 11 dekabr — 80 AZN</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>12 dekabr – 11 yanvar — 80 AZN</span>
                    </li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500">
                  📌 Ayın 29, 30 və ya 31-də qoşulan şagirdlər üçün qısa aylarda ayın son günü istifadə olunur.
                </p>
              </div>
            )}

            {/* Dərs paketi üzrə izah */}
            {billingModel === "LESSON_PACKAGE" && (
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Ödəniş təyin edilmiş dərs sayına əsasən hesablanır.
                </p>
                <div className="rounded-xl border border-indigo-100 bg-white/90 p-3 shadow-2xs">
                  <p className="font-semibold text-slate-800 mb-1">
                    Məsələn:
                  </p>
                  <ul className="space-y-1 text-slate-600 pl-1">
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>Paket: 8 dərs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <span>Paket qiyməti: 80 AZN</span>
                    </li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500">
                  📌 İlk 8 dərs üçün bir ödəniş hesabı yaradılır. Paket tamamlandıqda növbəti paket üçün yeni hesab açılır. Yalnız keçirilmiş və uyğun dərslər paketə daxil edilir; ləğv edilmiş və keçirilməmiş dərslər sayılmır.
                </p>
              </div>
            )}

            {/* Info Card üçün ortaq qeyd */}
            <div className="mt-3 rounded-xl border border-indigo-150 bg-indigo-50/70 p-3 text-xs leading-relaxed text-indigo-950">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                <Sparkles className="size-3.5 text-indigo-600 shrink-0" />
                <span>Ortaq Qeyd</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Seçilmiş ödəniş modeli workspace-dəki bütün qruplara tətbiq olunur. Məbləğ hər qrup üçün ayrıca müəyyən edilir və şagirdə fərdi endirim tətbiq oluna bilər. Şagird ilk dəfə qoşulduqda ilk ödəniş həmişə tam məbləğdə hesablanır.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex items-center gap-2 text-slate-800">
          <KeyRound className="size-4 text-indigo-600" />
          <h3 className="text-sm font-bold">Müvəqqəti Giriş Şifrəsi</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Müəllim üçün təyin edəcəyiniz müvəqqəti şifrəni daxil edin. Bu şifrə təhlükəsizlik qaydalarına əsasən heç bir cədvəldə açıq saxlanılmır və loqlara yazılmır.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Müvəqqəti şifrə (ən azı 8 simvol) <span className="text-rose-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
              Şifrə təkrarı <span className="text-rose-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          İlkin Hesab Statusu
        </label>
        <select
          id="status"
          name="status"
          defaultValue="active"
          className="mt-2 block w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="active">Aktiv (dərhal daxil ola bilər)</option>
          <option value="suspended">Dayandırılmış (giriş bağlıdır)</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
        >
          Ləğv et
        </button>
        <Button type="submit" disabled={isPending} className="flex items-center gap-2 cursor-pointer">
          <UserPlus className="size-4" />
          {isPending ? "Yaradılır..." : "Müəllim Hesabını Yarat"}
        </Button>
      </div>
    </form>
  );
}
