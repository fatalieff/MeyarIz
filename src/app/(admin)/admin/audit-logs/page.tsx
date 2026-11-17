import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminAuditLogs } from "@/lib/queries/admin";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs(100);

  return (
    <>
      <AdminHeader title="Sistem Audit Jurnalı" />
      <main className="px-5 py-8 md:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">İnzibatçı Əməliyyatlarının Təhlükəsizlik Jurnalı</h2>
          <p className="mt-1 text-xs text-slate-500">
            Platformada icra olunan bütün admin əməliyyatları (müəllim yaradılması, status dəyişdirilməsi, şifrə təyini, silinmə) bu jurnalda qeydiyyata alınır. Şifrələr və şəxsi məlumatlar qətiyyən saxlanılmır.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Tarix və Saat</th>
                  <th className="px-5 py-3.5">Əməliyyat Növü</th>
                  <th className="px-5 py-3.5">Təhlükəsiz Xülasə</th>
                  <th className="px-5 py-3.5">Hədəf Müəllim ID</th>
                  <th className="px-5 py-3.5 text-center">Nəticə</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Hələ heç bir audit qeydi qeydə alınmayıb.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleDateString("az", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-slate-700">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-900 max-w-md">
                        {log.summary}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                        {log.targetTeacherId ? log.targetTeacherId.slice(0, 8) + "..." : "—"}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            log.status === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.status === "success" ? (
                            <>
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Uğurlu
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3 text-rose-600" />
                              Uğursuz
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
