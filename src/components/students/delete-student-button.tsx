"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteStudent } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(deleteStudent, null);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Bu şagird, bütün nəticələri və giriş hesabı həmişəlik silinəcək. Davam edirsiniz?",
        );
        if (!confirmed) event.preventDefault();
      }}
      className="flex flex-col items-start gap-2 sm:items-end"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <Button type="submit" variant="danger" disabled={pending}>
        <Trash2 className="size-4" />
        {pending ? "Silinir..." : "Şagirdi sil"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-sm text-rose-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
