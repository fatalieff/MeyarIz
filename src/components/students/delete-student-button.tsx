"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
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

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `${studentName ? `${studentName} adlı şagird` : "Bu şagird"}, bütün nəticələri və giriş hesabı həmişəlik silinəcək. Davam edirsiniz?`,
        );
        if (!confirmed) event.preventDefault();
      }}
      className={compact ? "inline-flex flex-col items-end gap-1" : "flex flex-col items-start gap-2 sm:items-end"}
    >
      <input type="hidden" name="studentId" value={studentId} />
      <Button
        type="submit"
        variant="danger"
        disabled={pending}
        className={compact ? "min-h-9 px-3" : undefined}
        aria-label={studentName ? `${studentName} adlı şagirdi sil` : "Şagirdi sil"}
        title="Şagirdi sil"
      >
        <Trash2 className="size-4" />
        {compact ? <span className="sr-only">{pending ? "Silinir..." : "Şagirdi sil"}</span> : pending ? "Silinir..." : "Şagirdi sil"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-sm text-rose-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
