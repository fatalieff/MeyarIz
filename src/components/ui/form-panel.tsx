import { ReactNode } from "react";

export function FormPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card mb-7 p-5 sm:p-7">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">Məlumatları doldurun və yadda saxlayın.</p>
      </div>
      {children}
    </section>
  );
}
