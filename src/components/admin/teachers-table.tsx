"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminTeacherSummary } from "@/lib/queries/admin";
import { Search, ChevronRight, ShieldCheck, ShieldAlert } from "lucide-react";

export function TeachersTable({ initialTeachers }: { initialTeachers: AdminTeacherSummary[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((t) => {
      const matchesSearch =
        search.trim() === "" ||
        t.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.workspaceName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialTeachers, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Axtarış və Filtr Barı */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-poçt və ya workspace adına görə axtar..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Hamısı ({initialTeachers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Aktiv ({initialTeachers.filter((t) => t.status === "active").length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("suspended")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "suspended"
                ? "bg-amber-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Dayandırılmış ({initialTeachers.filter((t) => t.status === "suspended").length})
          </button>
        </div>
      </div>

      {/* Cədvəl */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Müəllim / Ad və Soyad</th>
                <th className="px-5 py-3.5">İş Sahəsi (Workspace)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Şagird</th>
                <th className="px-5 py-3.5 text-center">Qrup</th>
                <th className="px-5 py-3.5 text-center">Sınaq</th>
                <th className="px-5 py-3.5">Qeydiyyat Tarixi</th>
                <th className="px-5 py-3.5 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Axtarışa uyğun müəllim hesabı tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {t.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400">{t.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800">{t.workspaceName}</span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          t.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {t.status === "active" ? (
                          <>
                            <ShieldCheck className="size-3" />
                            Aktiv
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="size-3" />
                            Dayandırılıb
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center font-bold text-slate-800">
                      {t.studentCount}
                    </td>

                    <td className="px-5 py-4 text-center font-bold text-slate-800">
                      {t.groupCount}
                    </td>

                    <td className="px-5 py-4 text-center font-bold text-slate-800">
                      {t.examCount}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("az", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-200"
                      >
                        Detallara bax
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
