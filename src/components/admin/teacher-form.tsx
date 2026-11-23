"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTeacher } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, KeyRound, UserPlus } from "lucide-react";

export function CreateTeacherForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTeacher, null);

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

      <div>
        <label htmlFor="billingModel" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Ödəniş modeli <span className="text-rose-500">*</span>
        </label>
        <select id="billingModel" name="billingModel" required defaultValue="CALENDAR_MONTH" className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none">
          <option value="CALENDAR_MONTH">Təqvim ayı üzrə</option>
          <option value="ANNIVERSARY_MONTH">Qoşulma gününə görə aylıq</option>
          <option value="LESSON_PACKAGE">Dərs paketi üzrə</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">Model workspace yaradılarkən serverdə saxlanılır.</p>
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
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Ləğv et
        </button>
        <Button type="submit" disabled={isPending} className="flex items-center gap-2">
          <UserPlus className="size-4" />
          {isPending ? "Yaradılır..." : "Müəllim Hesabını Yarat"}
        </Button>
      </div>
    </form>
  );
}
