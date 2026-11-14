"use client";

import { useActionState } from "react";
import { ArrowRight,LockKeyhole,Mail } from "lucide-react";
import { login,requestPasswordReset,updatePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Mode="login"|"forgot"|"reset";
type AuthState={error?:string;success?:string}|null;

export function AuthForm({mode="login"}:{mode?:Mode}){
  const action=(mode==="login"?login:mode==="forgot"?requestPasswordReset:updatePassword) as (state:AuthState,payload:FormData)=>Promise<AuthState>;
  const[state,formAction,pending]=useActionState<AuthState,FormData>(action,null);
  return <form action={formAction} className="mt-8 space-y-5">
    {mode!=="reset"&&<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">E-poçt ünvanı</span><span className="relative block"><Mail className="absolute left-4 top-4 size-4.5 text-slate-400"/><input name="email" type="email" required autoComplete="email" placeholder="ad@example.com" className="focus-ring h-13 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm outline-none placeholder:text-slate-400"/></span></label>}
    {mode!=="forgot"&&<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{mode==="reset"?"Yeni şifrə":"Şifrə"}</span><span className="relative block"><LockKeyhole className="absolute left-4 top-4 size-4.5 text-slate-400"/><input name="password" type="password" minLength={8} required autoComplete={mode==="login"?"current-password":"new-password"} placeholder="Ən azı 8 simvol" className="focus-ring h-13 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm outline-none placeholder:text-slate-400"/></span></label>}
    {state?.error&&<p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-sm text-rose-700">{state.error}</p>}
    {state?.success&&<p className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-700">{state.success}</p>}
    <Button disabled={pending} className="h-13 w-full">{pending?"Gözləyin...":mode==="login"?"Daxil ol":mode==="forgot"?"Bərpa keçidi göndər":"Şifrəni yenilə"}<ArrowRight className="size-4"/></Button>
  </form>;
}
