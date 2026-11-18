import { AppHeader } from "@/components/layout/app-header";
import { RankingSettingsForm } from "@/components/settings/ranking-settings-form";
import { TeacherProfileForm } from "@/components/settings/teacher-profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { getTeacherProfileSettings } from "@/lib/queries/teacher";

export const instant = false;

export default async function SettingsPage() {
  const profile = await getTeacherProfileSettings();
  return <><AppHeader title="Tənzimləmələr" /><main className="p-5 md:p-8"><PageHeader eyebrow="Hesab və seçimlər" title="Tənzimləmələr" description="İş sahəsinin görünüşünü, reytinq qaydalarını və cədvəl seçimlərini idarə edin." /><section className="grid gap-6 xl:grid-cols-2">{profile ? <><TeacherProfileForm fullName={profile.fullName} workspaceName={profile.workspaceName} /><RankingSettingsForm defaultRankingPeriod={profile.defaultRankingPeriod} globalRankingVisible={profile.globalRankingVisible} /></> : <div className="card p-6 text-sm text-rose-700">Profil məlumatları yüklənə bilmədi.</div>}</section></main></>;
}
