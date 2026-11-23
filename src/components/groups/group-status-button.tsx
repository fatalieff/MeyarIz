"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { updateGroupStatus } from "@/app/actions/teacher";
import { cn } from "@/lib/utils";

interface GroupStatusButtonProps {
  groupId: string;
  groupName: string;
  status: "active" | "archived";
  compact?: boolean;
}

export function GroupStatusButton({
  groupId,
  groupName,
  status,
  compact = false,
}: GroupStatusButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isArchiving = status === "active";
  const nextStatus = isArchiving ? "archived" : "active";
  const label = isArchiving ? "Arxivlə" : "Aktiv et";

  function changeStatus() {
    if (
      isArchiving &&
      !window.confirm(
        `“${groupName}” qrupu arxivə köçürülsün? Məlumatlar silinməyəcək və qrupu istənilən vaxt yenidən aktiv edə bilərsiniz.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateGroupStatus(groupId, nextStatus);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  const Icon = pending ? LoaderCircle : isArchiving ? Archive : ArchiveRestore;

  return (
    <button
      type="button"
      onClick={changeStatus}
      disabled={pending}
      aria-label={`${groupName}: ${label}`}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        compact ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm",
        isArchiving
          ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100",
      )}
    >
      <Icon className={cn("size-4", pending && "animate-spin")} />
      {pending ? "Gözləyin..." : label}
    </button>
  );
}
