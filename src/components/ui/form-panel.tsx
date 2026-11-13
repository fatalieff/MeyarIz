import { ReactNode } from "react";
export function FormPanel({title,children}:{title:string;children:ReactNode}){return <section className="card mb-6 p-5 sm:p-6"><div className="mb-5"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">Məlumatları doldurun və yadda saxlayın.</p></div>{children}</section>}
