"use client";

import { useState, useTransition } from "react";
import {
  updateTeacher,
  toggleTeacherStatus,
  resetTeacherPassword,
  deleteTeacher,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Edit3,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

interface TeacherActionsProps {
  teacher: {
    id: string;
    fullName: string;
    workspaceName: string;
    status: "active" | "suspended";
  };
}

export function TeacherActions({ teacher }: TeacherActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Edit State
  const [fullName, setFullName] = useState(teacher.fullName);
  const [workspaceName, setWorkspaceName] = useState(teacher.workspaceName);
  const [editPending, startEdit] = useTransition();

  // Status State
  const [statusPending, startStatus] = useTransition();

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwPending, startPw] = useTransition();

  // Delete State
  const [confirmation, setConfirmation] = useState("");
  const [delPending, startDel] = useTransition();

  // 1. Update Profile & Workspace
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    startEdit(async () => {
      const fd = new FormData();
      fd.append("teacherId", teacher.id);
      fd.append("fullName", fullName);
      fd.append("workspaceName", workspaceName);
      const res = await updateTeacher(null, fd);
      if (res.ok) {
        toast.success(res.message || "Müəllim məlumatları yeniləndi.");
        setEditOpen(false);
      } else {
        toast.error(res.error || "Xəta baş verdi.");
      }
    });
  };

  // 2. Toggle Status
  const handleToggleStatus = () => {
    const nextStatus = teacher.status === "active" ? "suspended" : "active";
    startStatus(async () => {
      const fd = new FormData();
      fd.append("teacherId", teacher.id);
      fd.append("status", nextStatus);
      const res = await toggleTeacherStatus(null, fd);
      if (res.ok) {
        toast.success(res.message || "Status yeniləndi.");
      } else {
        toast.error(res.error || "Status yenilənə bilmədi.");
      }
    });
  };

  // 3. Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Şifrə və şifrə təkrarı eyni olmalıdır.");
      return;
    }
    if (password.length < 8) {
      toast.error("Şifrə ən azı 8 simvol olmalıdır.");
      return;
    }

    startPw(async () => {
      const fd = new FormData();
      fd.append("teacherId", teacher.id);
      fd.append("password", password);
      fd.append("confirmPassword", confirmPassword);
      const res = await resetTeacherPassword(null, fd);
      if (res.ok) {
        toast.success(res.message || "Yeni müvəqqəti şifrə təyin edildi.");
        setPassword("");
        setConfirmPassword("");
        setPasswordOpen(false);
      } else {
        toast.error(res.error || "Şifrə yenilənə bilmədi.");
      }
    });
  };

  // 4. Delete Teacher
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    startDel(async () => {
      const fd = new FormData();
      fd.append("teacherId", teacher.id);
      fd.append("confirmation", confirmation);
      const res = await deleteTeacher(null, fd);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Müəllim hesabı və əlaqəli məlumatları silindi.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Redaktə Düyməsi */}
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
      >
        <Edit3 className="size-3.5 text-slate-500" />
        Məlumatları Redaktə Et
      </button>

      {/* Şifrə Yeniləmə Düyməsi */}
      <button
        type="button"
        onClick={() => setPasswordOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
      >
        <KeyRound className="size-3.5 text-indigo-600" />
        Müvəqqəti Şifrə Təyin Et
      </button>

      {/* Status Toggle Düyməsi */}
      <button
        type="button"
        disabled={statusPending}
        onClick={handleToggleStatus}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
          teacher.status === "active"
            ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        }`}
      >
        {teacher.status === "active" ? (
          <>
            <ShieldAlert className="size-3.5 text-amber-600" />
            {statusPending ? "Yenilənir..." : "Hesabı Dayandır"}
          </>
        ) : (
          <>
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {statusPending ? "Yenilənir..." : "Hesabı Aktivləşdir"}
          </>
        )}
      </button>

      {/* Silmə Düyməsi */}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        <Trash2 className="size-3.5 text-rose-600" />
        Hesabı Sil
      </button>

      {/* MODAL 1: REDAKTƏ */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Müəllim Məlumatlarını Dəyiş</h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ad və Soyad
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  İş Sahəsi / Kurs Adı
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <Button type="submit" disabled={editPending}>
                  {editPending ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ŞİFRƏ TƏYİNİ */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Müvəqqəti Şifrə Təyin Et</h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Yeni şifrə təyin edildikdə müəllimin aktiv sessiyaları təhlükəsizlik üçün bağlanacaq. Şifrə bazada açıq formada saxlanılmır və loqlara yazılmır.
            </p>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Yeni Şifrə (ən azı 8 simvol)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Şifrə Təkrarı
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <Button type="submit" disabled={pwPending}>
                  {pwPending ? "Yenilənir..." : "Şifrəni Təyin Et"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TƏHLÜKƏLİ SİLMƏ */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3 text-rose-600">
              <AlertTriangle className="size-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Müəllim Hesabını Sil (Geri Qaytarılmır)</h3>
            </div>

            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800">
              <strong className="block font-bold">Xəbərdarlıq:</strong>
              Bu əməliyyat müəllimin hesabını, iş sahəsini, ona aid olan bütün qrupları, şagird hesablarını, sınaqları və nəticələri bazadan tamamilə siləcək. Bu əməliyyat geri qaytarıla bilməz!
            </div>

            <form onSubmit={handleDelete} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Təsdiq etmək üçün müəllimin tam adını (<strong>{teacher.fullName}</strong>) və ya <strong>SİL</strong> sözünü daxil edin:
                </label>
                <input
                  type="text"
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder={teacher.fullName}
                  className="mt-2 block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={delPending || (confirmation !== teacher.fullName && confirmation !== "SİL")}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {delPending ? "Silinir..." : "Bəli, tamamilə sil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
