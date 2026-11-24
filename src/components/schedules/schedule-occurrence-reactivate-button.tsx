"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, CalendarCheck2, Clock3, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { reactivateScheduleOccurrence } from "@/app/actions/teacher";
import { weekDays } from "@/lib/calculations/schedules";
import { azDate } from "@/lib/utils";

type Conflict = {
  scheduleId: string;
  groupName: string;
  occurrenceDate: string;
  startTime: string;
  endTime: string;
};

type Props = {
  cancellationId: string;
  occurrenceDate: string;
  groupName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  expired?: boolean;
  compact?: boolean;
};

export function ScheduleOccurrenceReactivateButton({
  cancellationId,
  occurrenceDate,
  groupName,
  weekday,
  startTime,
  endTime,
  location,
  expired = false,
  compact = false,
}: Props) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [feedback, setFeedback] = useState<{ error?: string; warning?: string } | null>(null);

  const close = useCallback(() => {
    if (pending) return;
    setOpen(false);
    setConflicts([]);
    setFeedback(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [pending]);

  const showConfirmation = () => {
    setConflicts([]);
    setFeedback(null);
    setOpen(true);
  };

  const activate = (allowConflict: boolean) => {
    startTransition(async () => {
      const result = await reactivateScheduleOccurrence(
        cancellationId,
        allowConflict,
      );
      if (result.conflicts?.length) {
        setConflicts(result.conflicts);
        setFeedback({ error: result.error });
        return;
      }
      if (result.ok) {
        setOpen(false);
        setFeedback(result.warning ? { warning: result.warning } : null);
        router.refresh();
        return;
      }
      setFeedback({ error: result.error || "Dərs aktiv edilə bilmədi." });
    });
  };

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={showConfirmation}
        disabled={expired || pending}
        title={expired ? "Vaxtı keçmiş dərsi aktivləşdirmək mümkün deyil" : undefined}
        className={compact
          ? "focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          : "focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"}
      >
        <CalendarCheck2 className="size-4" />
        {expired ? "Vaxtı keçib" : "Dərsi yenidən aktiv et"}
      </button>

      {feedback?.warning && !open && (
        <p className="mt-2 text-xs text-amber-700">{feedback.warning}</p>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reactivate-schedule-title"
          aria-describedby="reactivate-schedule-description"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs animate-in fade-in"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            className={`w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl ${conflicts.length ? "border-amber-200" : "border-emerald-200"}`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${conflicts.length ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {conflicts.length ? <AlertTriangle className="size-5" /> : <CalendarCheck2 className="size-5" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {conflicts.length ? "Vaxt toqquşması" : "Təsdiq tələb olunur"}
                  </p>
                  <h3 id="reactivate-schedule-title" className="mt-0.5 text-base font-bold text-slate-900">
                    {conflicts.length ? "Bu vaxtda başqa dərs mövcuddur" : "Dərs yenidən aktiv edilsin?"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="focus-ring rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Popup-u bağla"
              >
                <X className="size-4" />
              </button>
            </div>

            <div id="reactivate-schedule-description" className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-slate-700">
              <strong className="block text-base text-slate-900">{groupName}</strong>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <span className="flex items-center gap-2"><CalendarCheck2 className="size-4 text-emerald-600" />{azDate(occurrenceDate)} · {weekDays[weekday]}</span>
                <span className="flex items-center gap-2"><Clock3 className="size-4 text-emerald-600" />{startTime.slice(0, 5)}–{endTime.slice(0, 5)}</span>
                {location && <span className="flex items-center gap-2 sm:col-span-2"><MapPin className="size-4 text-emerald-600" />{location}</span>}
              </div>
              <p className="mt-3 border-t border-emerald-100 pt-3 text-xs leading-5 text-emerald-900">
                Dərs yenidən aktiv ediləcək və qrupun şagirdlərinə “Dərs aktiv olundu” bildirişi göndəriləcək.
              </p>
            </div>

            {conflicts.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-950">Toqquşan dərslər</p>
                <ul className="mt-2 space-y-2">
                  {conflicts.map((conflict) => (
                    <li key={conflict.scheduleId} className="rounded-lg bg-white px-3 py-2 text-sm text-amber-950 shadow-sm">
                      <strong>{conflict.groupName}</strong>
                      <span className="ml-2 text-amber-800">{azDate(conflict.occurrenceDate)} · {conflict.startTime}–{conflict.endTime}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-5 text-amber-900">Dərsi aktiv etsəniz müəllimin cədvəlində eyni vaxtda bir neçə dərs olacaq.</p>
              </div>
            )}

            {feedback?.error && (
              <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {feedback.error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {conflicts.length ? "Geri qayıt" : "Xeyr"}
              </button>
              <button
                type="button"
                onClick={() => activate(conflicts.length > 0)}
                disabled={pending}
                className={`focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${conflicts.length ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {pending
                  ? "Aktiv edilir..."
                  : conflicts.length
                    ? "Toqquşmaya baxmayaraq aktiv et"
                    : "Bəli, dərsi aktiv et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
