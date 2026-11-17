import { AppHeader } from "@/components/layout/app-header";
import { TeacherProfileForm } from "@/components/settings/teacher-profile-form";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { PageHeader } from "@/components/ui/page-header";
import { getTeacherProfileSettings } from "@/lib/queries/teacher";

const periodOptions = [
  { value: "last-3", label: "Son 3 sınaq" },
  { value: "month", label: "Cari ay" },
  { value: "all", label: "Bütün dövr" },
];

export const instant = false;

export default async function SettingsPage() {
  const profile = await getTeacherProfileSettings();
  return <><AppHeader title="Tənzimləmələr" /><main className="p-5 md:p-8"><PageHeader eyebrow="Hesab və seçimlər" title="Tənzimləmələr" description="İş sahəsinin görünüşünü, reytinq qaydalarını və cədvəl seçimlərini idarə edin." /><section className="grid gap-6 xl:grid-cols-2">{profile ? <TeacherProfileForm fullName={profile.fullName} workspaceName={profile.workspaceName} /> : <div className="card p-6 text-sm text-rose-700">Profil məlumatları yüklənə bilmədi.</div>}<form className="card p-6"><h3 className="font-bold">Reytinq seçimləri</h3><div className="mt-5 space-y-4"><div className="space-y-2 text-sm font-semibold">Standart dövr<CustomSelect ariaLabel="Standart reytinq dövrü" defaultValue="last-3" options={periodOptions} /></div><label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">Ümumi reytinq şagirdlərə görünsün<input className="size-4 accent-indigo-600" type="checkbox" defaultChecked /></label><label className="block text-sm font-semibold">Saat qurşağı<input className="mt-2 h-11 w-full rounded-xl border px-3" value="Asia/Baku" readOnly /></label><Button type="button">Seçimləri saxla</Button></div></form></section></main></>;
}
