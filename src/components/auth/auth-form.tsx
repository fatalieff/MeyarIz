"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { login, requestPasswordReset, updatePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Mode = "login" | "forgot" | "reset";
type AuthState = { error?: string; success?: string } | null;

export function AuthForm({ mode = "login" }: { mode?: Mode }) {
  const [showPassword, setShowPassword] = useState(false);
  const action = (mode === "login" ? login : mode === "forgot" ? requestPasswordReset : updatePassword) as (state: AuthState, payload: FormData) => Promise<AuthState>;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      {mode !== "reset" && (
        <label className="block" htmlFor="auth-email">
          <span className="mb-2 block text-sm font-semibold text-slate-700">E-poçt ünvanı</span>
          <span className="group relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
            <input id="auth-email" name="email" type="email" required autoComplete="email" placeholder="ad@example.com" className="h-13 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </span>
        </label>
      )}

      {mode !== "forgot" && (
        <label className="block" htmlFor="auth-password">
          <span className="mb-2 block text-sm font-semibold text-slate-700">{mode === "reset" ? "Yeni şifrə" : "Şifrə"}</span>
          <span className="group relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500" />
            <input id="auth-password" name="password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Ən azı 8 simvol" className="h-13 w-full rounded-2xl border bg-white pl-12 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="focus-ring absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}>
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </span>
        </label>
      )}

      {state?.error && <p role="alert" aria-live="polite" className="rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-sm leading-5 text-rose-700">{state.error}</p>}
      {state?.success && <p aria-live="polite" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm leading-5 text-emerald-700">{state.success}</p>}

      <Button disabled={pending} className="h-13 w-full rounded-2xl shadow-[0_12px_28px_rgba(79,70,229,.24)]">
        {pending ? <><LoaderCircle className="size-4 animate-spin" /> Gözləyin...</> : <>{mode === "login" ? "Daxil ol" : mode === "forgot" ? "Bərpa keçidi göndər" : "Şifrəni yenilə"}<ArrowRight className="size-4" /></>}
      </Button>
    </form>
  );
}
