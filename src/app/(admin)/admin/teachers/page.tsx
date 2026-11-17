import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminTeachers } from "@/lib/queries/admin";
import { TeachersTable } from "@/components/admin/teachers-table";
import { UserPlus } from "lucide-react";

export default async function AdminTeachersPage() {
  const teachers = await getAdminTeachers();

  return (
    <>
      <AdminHeader title="Müəllimlər və İş Sahələri" />
      <main className="px-5 py-8 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Müəllim Hesablarının İdarə Edilməsi</h2>
            <p className="mt-1 text-xs text-slate-500">
              Platformadakı bütün müəllimlər, onların workspace-ləri və ümumi statistik sayları
            </p>
          </div>
          <Link
            href="/admin/teachers/new"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 self-start sm:self-auto"
          >
            <UserPlus className="size-4" /> Yeni müəllim əlavə et
          </Link>
        </div>

        <TeachersTable initialTeachers={teachers} />
      </main>
    </>
  );
}
