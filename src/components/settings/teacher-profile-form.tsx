"use client";

import { useActionState } from "react";
import { updateTeacherProfile } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";

export function TeacherProfileForm({fullName,workspaceName}:{fullName:string;workspaceName:string}){
  const[state,action,pending]=useActionState(updateTeacherProfile,null);
  return <form action={action} className="card p-6">
    <h3 className="font-bold">Müəllim profili</h3>
    <div className="mt-5 space-y-4">
      <label className="block text-sm font-semibold">Ad və soyad<input className="mt-2 h-11 w-full rounded-xl border px-3" name="fullName" defaultValue={fullName} required minLength={3} maxLength={100}/></label>
      <label className="block text-sm font-semibold">İş sahəsinin adı<input className="mt-2 h-11 w-full rounded-xl border px-3" name="workspaceName" defaultValue={workspaceName} required minLength={2} maxLength={100}/></label>
      {state?.error?<p aria-live="polite" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{state.error}</p>:state?.ok?<p aria-live="polite" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.message}</p>:null}
      <Button disabled={pending}>{pending?"Saxlanılır...":"Dəyişiklikləri saxla"}</Button>
    </div>
  </form>;
}
