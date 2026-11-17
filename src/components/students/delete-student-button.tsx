"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteStudent } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";

export function DeleteStudentButton({
  studentId,
  studentName,
  compact = false,
}: {
  studentId: string;
  studentName?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(deleteStudent, null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={compact ? "inline-flex flex-col items-end gap-1" : "flex flex-col items-start gap-2 sm:items-end"}>
        <Button
          type="button"
          variant="danger"
          onClick={() => setOpen(true)}
          className={compact ? "min-h-9 px-3" : undefined}
          aria-label={studentName ? `${studentName} adlı şagirdi sil` : "Şagirdi sil"}
          title="Şagirdi sil"
        >
          <Trash2 className="size-4" />
          {compact ? <span className="sr-only">Şagirdi sil</span> : "Şagirdi sil"}
        </Button>
        {state?.error && (
          <p role="alert" className="text-sm text-rose-700">
            {state.error}
          </p>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="size-5 shrink-0" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Şagirdi Sil</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3.5 text-xs text-rose-900 leading-relaxed">
              <span className="font-semibold">{studentName ? `${studentName} adlı şagird` : "Bu şagird"}</span>,
              bütün imtahan nəticələri, nailiyyətləri və giriş hesabı həmişəlik silinəcək. Bu əməliyyat geri qaytarıla bilməz.
            </div>

            <p className="mt-4 text-xs font-medium text-slate-600">
              Davam etmək istədiyinizdən əminsiniz?
            </p>

            <form
              action={async (formData) => {
                await action(formData);
                setOpen(false);
              }}
              className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4"
            >
              <input type="hidden" name="studentId" value={studentId} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Xeyr, ləğv et
              </button>
              <Button
                type="submit"
                variant="danger"
                disabled={pending}
                className="min-h-9 px-4 text-xs font-semibold"
              >
                {pending ? "Silinir..." : "Bəli, sil"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
