"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Users, X } from "lucide-react";
import { cancelNextScheduleOccurrence, createExam, createGroup, createSchedule, createStudent, deleteSchedule, updateGroup, updateSchedule, updateStudent } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn, isLightColor } from "@/lib/utils";

const field = "focus-ring h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none";
const label = "space-y-1.5 text-sm font-semibold text-slate-700";
const hours = Array.from({ length: 24 }, (_, hour) => ({ value: String(hour).padStart(2, "0"), label: String(hour).padStart(2, "0") }));
const minutes = Array.from({ length: 60 }, (_, minute) => ({ value: String(minute).padStart(2, "0"), label: String(minute).padStart(2, "0") }));
const groupOptions = (groups: any[]) => groups.map((group) => ({ value: group.id as string, label: group.name as string }));

function DayTimeField({ weekday, labelText, prefix }: { weekday: number; labelText: string; prefix: "start" | "end" }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-slate-500">{labelText}</legend>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <CustomSelect name={`day-${weekday}-${prefix}Hour`} options={hours} placeholder="Saat" ariaLabel={`${labelText} saat`} />
        <span className="font-bold text-slate-400">:</span>
        <CustomSelect name={`day-${weekday}-${prefix}Minute`} options={minutes} placeholder="Dəq." ariaLabel={`${labelText} dəqiqə`} />
      </div>
    </fieldset>
  );
}

function Message({ state }: { state: any }) {
  return state?.error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{state.error}</p> : state?.warning ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{state.warning}</p> : state?.ok ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{state.message || "Əməliyyat uğurla tamamlandı."}</p> : null;
}

function ParentContactFields({ type, title, contact }: { type: "mother" | "father"; title: string; contact?: any }) {
  return <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><legend className="px-2 text-sm font-bold text-slate-800">{title}</legend><div className="grid gap-3 sm:grid-cols-2"><label className={label}>Ad və soyad<input className={field} name={`${type}Name`} defaultValue={contact?.full_name || ""} placeholder={`${title}nın adı və soyadı`} /></label><label className={label}>Əlaqə nömrəsi<input className={field} name={`${type}Phone`} type="tel" inputMode="tel" autoComplete="tel" defaultValue={contact?.phone || ""} placeholder="+994 50 123 45 67" /></label></div></fieldset>;
}

const PRESET_COLORS = [
  "#4f46e5", // İndigo
  "#7c3aed", // Bənövşəyi
  "#0284c7", // Mavi
  "#059669", // Zümrüd
  "#d97706", // Kəhrəba
  "#e11d48", // Qırmızı
  "#db2777", // Çəhrayı
  "#475569", // Slate
];

function GroupColorField({ defaultValue = "#4f46e5" }: { defaultValue?: string }) {
  const [color, setColor] = useState(defaultValue || "#4f46e5");
  const isLight = isLightColor(color);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        {/* Canlı Önizləmə İkonu */}
        <div
          className={cn(
            "grid size-11 place-items-center rounded-xl transition-colors shrink-0",
            isLight
              ? "border border-slate-300 ring-1 ring-slate-900/10 text-slate-900 shadow-2xs bg-white"
              : "text-white shadow-sm"
          )}
          style={{
            backgroundColor: color,
          }}
          title="Qrup ikonunun görünüşü"
        >
          <Users className={cn("size-5", isLight ? "text-slate-900" : "text-white")} />
        </div>

        {/* Xüsusi rəng seçici */}
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
          <input
            className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            type="color"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <span className="font-mono text-xs font-semibold uppercase text-slate-700">
            {color}
          </span>
          <span className="ml-auto text-[11px] text-slate-400 hidden sm:inline">
            {isLight ? "Açıq rəng (tünd ikon)" : "Tünd rəng (ağ ikon)"}
          </span>
        </div>
      </div>

      {/* Hazır Tövsiyə Rənglər */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] font-medium text-slate-500 mr-1">Tövsiyə rənglər:</span>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={cn(
              "size-6 rounded-lg transition-transform hover:scale-110",
              color.toLowerCase() === c.toLowerCase()
                ? "ring-2 ring-indigo-500 ring-offset-2 scale-105"
                : "opacity-85 hover:opacity-100"
            )}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

export function GroupForm() {
  const [state, action, pending] = useActionState(createGroup, null);
  return (
    <form action={action} className="space-y-4">
      <label className={label}>
        Qrupun adı
        <input className={field} name="name" required placeholder="Məsələn, Abituriyent 2027" />
      </label>
      <label className={label}>
        Hazırlıq səviyyəsi
        <input className={field} name="preparationLevel" placeholder="Məsələn, orta" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Standart qiymət (AZN)<input className={field} name="priceManat" type="number" min="0" step="0.01" required defaultValue="80" /></label>
        <label className={label}>Paketdə dərs sayı<input className={field} name="packageLessonCount" type="number" min="1" max="100" required defaultValue="8" /></label>
      </div>
      <label className={label}>
        Təsvir
        <textarea
          className="focus-ring min-h-24 w-full rounded-xl border p-3 text-sm outline-none"
          name="description"
          placeholder="Qrup haqqında qısa qeyd"
        />
      </label>
      <div className={label}>
        <span>Qrup rəngi və ikonu</span>
        <GroupColorField defaultValue="#4f46e5" />
      </div>
      <Message state={state} />
      <Button disabled={pending} className="w-full">
        {pending ? "Yaradılır..." : "Qrup yarat"}
      </Button>
    </form>
  );
}

export function GroupEditForm({ group }: { group: any }) {
  const action = updateGroup.bind(null, group.id);
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <label className={label}>
        Qrupun adı
        <input className={field} name="name" required defaultValue={group.name} />
      </label>
      <label className={label}>
        Hazırlıq səviyyəsi
        <input className={field} name="preparationLevel" defaultValue={group.preparation_level || ""} placeholder="Məsələn, orta" />
      </label>
      <label className={label}>Standart qiymət (AZN)<input className={field} name="priceManat" type="number" min="0" step="0.01" required defaultValue={(Number(group.price_cents || 0) / 100).toFixed(2)} /></label>
      <label className={label}>Paketdə dərs sayı<input className={field} name="packageLessonCount" type="number" min="1" max="100" required defaultValue={group.package_lesson_count || 8} /></label>
      <label className={`${label} sm:col-span-2`}>
        Təsvir
        <textarea
          className="focus-ring min-h-24 w-full rounded-xl border bg-white p-3 text-sm outline-none"
          name="description"
          defaultValue={group.description || ""}
          placeholder="Qrup haqqında qısa qeyd"
        />
      </label>
      <div className={`${label} sm:col-span-2`}>
        <span>Qrup rəngi və ikonu</span>
        <GroupColorField defaultValue={group.color || "#4f46e5"} />
      </div>
      <div className="sm:col-span-2">
        <Message state={state} />
      </div>
      <Button disabled={pending} className="sm:col-span-2">
        {pending ? "Yadda saxlanılır..." : "Dəyişiklikləri yadda saxla"}
      </Button>
    </form>
  );
}

export function StudentForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(createStudent, null);
  return <form action={action} className="grid gap-4 sm:grid-cols-2"><label className={label}>Ad və soyad<input className={field} name="fullName" required placeholder="Əli Məmmədov" /></label><div className={label}><span>Qrup</span><CustomSelect name="groupId" options={groupOptions(groups)} placeholder="Qrup seçin" ariaLabel="Şagird qrupu" /></div><label className={label}>E-poçt<input className={field} name="email" type="email" required autoComplete="email" placeholder="ali@example.com" /></label><label className={label}>Şifrə<input className={field} name="password" type="password" required minLength={6} /></label><label className={label}>Qoşulma tarixi<input className={field} name="joinedAt" type="date" required defaultValue={new Date().toISOString().slice(0,10)} /></label><label className={label}>Şagirdin telefonu<input className={field} name="phone" type="tel" /></label><label className={label}>Hazırlıq səviyyəsi<input className={field} name="preparationLevel" /></label><label className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-semibold text-indigo-900"><input type="checkbox" name="paymentNow" className="size-4 accent-indigo-600" />İlk ödəniş indi alındı</label><label className={label}>Ödəniş üsulu<select className={field} name="paymentMethod" defaultValue="CASH"><option value="CASH">Nağd</option><option value="BANK_TRANSFER">Bank köçürməsi</option><option value="OTHER">Digər</option></select></label><div className="space-y-3 sm:col-span-2"><div><h3 className="text-sm font-bold text-slate-800">Valideyn əlaqələri</h3></div><div className="grid gap-3 lg:grid-cols-2"><ParentContactFields type="mother" title="Ana" /><ParentContactFields type="father" title="Ata" /></div></div><label className={`${label} sm:col-span-2`}>Müəllim qeydi<input className={field} name="privateNotes" /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Hesab yaradılır..." : "Şagird əlavə et"}</Button></form>;
}

export function StudentEditForm({ student, groups, currentGroupId }: { student: any; groups: any[]; currentGroupId?: string }) {
  const action = updateStudent.bind(null, student.id);
  const [state, formAction, pending] = useActionState(action, null);
  const mother=student.parent_contacts?.find((contact:any)=>contact.contact_type==="mother");
  const father=student.parent_contacts?.find((contact:any)=>contact.contact_type==="father");
  return <form action={formAction} className="grid gap-4 sm:grid-cols-2"><label className={label}>Ad və soyad<input className={field} name="fullName" required defaultValue={student.full_name} /></label><div className={label}><span>Qrup</span><CustomSelect name="groupId" options={groupOptions(groups)} defaultValue={currentGroupId || ""} placeholder="Qrup seçin" ariaLabel="Şagird qrupu" /></div><label className={label}>E-poçt<input className={`${field} cursor-not-allowed bg-slate-50 text-slate-500`} value={student.email || "Giriş hesabı yoxdur"} disabled /><span className="mt-1 block text-xs font-normal text-slate-500">Giriş e-poçtu təhlükəsizlik üçün burada dəyişdirilmir.</span></label><label className={label}>Şagirdin telefonu<input className={field} name="phone" type="tel" inputMode="tel" defaultValue={student.phone || ""} placeholder="+994 50 123 45 67" /></label><label className={label}>Hazırlıq səviyyəsi<input className={field} name="preparationLevel" defaultValue={student.preparation_level || ""} /></label><div className="space-y-3 sm:col-span-2"><div><h3 className="text-sm font-bold text-slate-800">Valideyn əlaqələri</h3><p className="mt-1 text-xs text-slate-500">Ana və ata məlumatlarını ayrıca redaktə edin. Hər iki sahəni boş saxladıqda həmin əlaqə silinir.</p></div><div className="grid gap-3 lg:grid-cols-2"><ParentContactFields type="mother" title="Ana" contact={mother} /><ParentContactFields type="father" title="Ata" contact={father} /></div></div><label className={`${label} sm:col-span-2`}>Müəllim qeydi<textarea className="focus-ring min-h-24 w-full rounded-xl border bg-white p-3 text-sm outline-none" name="privateNotes" defaultValue={student.private_notes || ""} placeholder="Yalnız siz görəcəksiniz" /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Yadda saxlanılır..." : "Dəyişiklikləri yadda saxla"}</Button></form>;
}

export function ExamForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(createExam, null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  return <form action={action} className="grid gap-4 sm:grid-cols-2"><label className={label}>Sınağın adı<input className={field} name="title" required placeholder="Noyabr aylıq sınağı" /></label><div className={label}><span>Qruplar</span><MultiSelect name="groupIds" options={groupOptions(groups)} placeholder="Bir və ya bir neçə qrup seçin" ariaLabel="Sınaq qrupları" onValueChange={setSelectedGroups} /><span className="mt-1 block text-xs font-normal text-slate-500">Hər seçilən qrup üçün ayrıca nəticə səhifəsi yaradılacaq.</span></div><div className={label}><span>Tarix</span><DatePicker name="examDate" ariaLabel="Sınaq tarixi" /></div><label className={label}>Sual sayı<input className={field} name="totalQuestions" type="number" min="1" max="500" required /></label><label className={`${label} sm:col-span-2`}>Təsvir<textarea className="focus-ring min-h-20 w-full rounded-xl border p-3 text-sm outline-none" name="description" /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending || selectedGroups.length === 0} className="sm:col-span-2">{pending ? "Yaradılır..." : selectedGroups.length ? `Sınağı ${selectedGroups.length} qrup üçün yarat` : "Əvvəlcə qrup seçin"}</Button></form>;
}

export function ScheduleForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(createSchedule, null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [scheduleType, setScheduleType] = useState<"weekly" | "extra">("weekly");
  const dayNames = ["Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"];

  const toggleDay = (weekday: number, checked: boolean) => {
    setSelectedDays((current) => checked ? [...current, weekday].sort((a, b) => a - b) : current.filter((day) => day !== weekday));
  };

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className={`${label} sm:col-span-2`}><span>Qrup</span><CustomSelect name="groupId" options={groupOptions(groups)} placeholder="Qrup seçin" ariaLabel="Dərs qrupu" required onValueChange={setSelectedGroup} /></div>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold text-slate-700">Dərs növü</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${scheduleType === "weekly" ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100" : "bg-white hover:border-slate-300"}`}>
            <span className="flex items-start gap-3"><input className="mt-1 size-4 accent-indigo-600" type="radio" name="scheduleType" value="weekly" checked={scheduleType === "weekly"} onChange={() => setScheduleType("weekly")} /><span><strong className="block text-sm text-slate-800">Həftəlik dərs</strong><span className="mt-1 block text-xs font-normal text-slate-500">Seçilən günlərdə hər həftə təkrarlanır.</span></span></span>
          </label>
          <label className={`cursor-pointer rounded-2xl border p-4 transition ${scheduleType === "extra" ? "border-amber-300 bg-amber-50 ring-2 ring-amber-100" : "bg-white hover:border-slate-300"}`}>
            <span className="flex items-start gap-3"><input className="mt-1 size-4 accent-amber-600" type="radio" name="scheduleType" value="extra" checked={scheduleType === "extra"} onChange={() => setScheduleType("extra")} /><span><strong className="block text-sm text-slate-800">Əlavə dərs</strong><span className="mt-1 block text-xs font-normal text-slate-500">Bir dəfə keçirilir və vaxtı bitəndə cədvəldən avtomatik çıxır.</span></span></span>
          </label>
        </div>
      </fieldset>
      {scheduleType === "weekly" ? <fieldset className="space-y-3 sm:col-span-2">
        <legend className="text-sm font-semibold text-slate-700">Günlər və saatlar</legend>
        <p className="-mt-2 text-xs text-slate-500">Hər günü seçin və həmin günə uyğun dərs saatını ayrıca təyin edin.</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {dayNames.map((dayName, index) => {
            const weekday = index + 1;
            const selected = selectedDays.includes(weekday);
            return (
              <div key={dayName} className={`rounded-2xl border p-3.5 transition ${selected ? "border-indigo-200 bg-indigo-50/40 shadow-sm" : "bg-white hover:border-slate-300"}`}>
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700"><input className="size-4 accent-indigo-600" type="checkbox" name="weekdays" value={weekday} checked={selected} onChange={(event) => toggleDay(weekday, event.target.checked)} />{dayName}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${selected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>{selected ? "Saat seçin" : "Seçilməyib"}</span>
                </label>
                {selected && <div className="mt-3 grid gap-3 border-t border-indigo-100 pt-3 sm:grid-cols-2"><DayTimeField weekday={weekday} labelText="Başlama" prefix="start" /><DayTimeField weekday={weekday} labelText="Bitmə" prefix="end" /></div>}
              </div>
            );
          })}
        </div>
      </fieldset> : <fieldset className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:col-span-2">
        <legend className="px-2 text-sm font-semibold text-amber-900">Əlavə dərsin tarixi və saatı</legend>
        <p className="text-xs text-amber-800/80">Dərs bitənə qədər müəllim və qrup şagirdlərinin cədvəlində görünəcək.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className={label}><span>Tarix</span><DatePicker name="sessionDate" ariaLabel="Əlavə dərsin tarixi" /></div>
          <DayTimeField weekday={0} labelText="Başlama" prefix="start" />
          <DayTimeField weekday={0} labelText="Bitmə" prefix="end" />
        </div>
      </fieldset>}
      <label className={`${label} sm:col-span-2`}>Məkan<input className={field} name="location" placeholder="İstəyə bağlı" /></label>
      <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2"><input className="size-4 accent-indigo-600" type="checkbox" name="allowConflict" value="true" />Məlum vaxt toqquşmasına qəsdən icazə ver</label>
      <div className="sm:col-span-2"><Message state={state} /></div>
      <Button disabled={pending || !selectedGroup || (scheduleType === "weekly" && selectedDays.length === 0)} className="sm:col-span-2">{pending ? "Əlavə edilir..." : !selectedGroup ? "Əvvəlcə qrup seçin" : scheduleType === "extra" ? "Əlavə dərsi yarat" : `${selectedDays.length || ""} ${selectedDays.length ? "gün üçün dərs vaxtlarını əlavə et" : "Dərs vaxtlarını əlavə et"}`}</Button>
    </form>
  );
}

export function ScheduleEditForm({ schedule }: { schedule: any }) {
  const action = updateSchedule.bind(null, schedule.id);
  const [state, formAction, pending] = useActionState(action, null);
  const occurrenceAction = cancelNextScheduleOccurrence.bind(null, schedule.id);
  const [occurrenceState, occurrenceFormAction, occurrencePending] = useActionState(occurrenceAction, null);
  const cancelAction = deleteSchedule.bind(null, schedule.id);
  const [cancelState, cancelFormAction, cancelPending] = useActionState(cancelAction, null);
  const [confirmation, setConfirmation] = useState<"occurrence" | "permanent" | null>(null);
  const [startHour, startMinute] = schedule.start_time.slice(0, 5).split(":");
  const [endHour, endMinute] = schedule.end_time.slice(0, 5).split(":");
  return <div className="space-y-4">
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-slate-50 p-3 text-sm sm:col-span-2"><strong>{schedule.groups.name}</strong><span className="ml-2 text-slate-500">{schedule.is_extra ? "Əlavə dərs" : "Həftəlik dərs"}</span></div>
      {schedule.is_extra && <div className={`${label} sm:col-span-2`}><span>Tarix</span><DatePicker name="sessionDate" defaultValue={schedule.session_date} ariaLabel="Əlavə dərsin yeni tarixi" /></div>}
      <fieldset className="space-y-2"><legend className="text-xs font-semibold text-slate-500">Başlama</legend><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><CustomSelect name="startHour" options={hours} defaultValue={startHour} ariaLabel="Başlama saatı"/><span className="font-bold text-slate-400">:</span><CustomSelect name="startMinute" options={minutes} defaultValue={startMinute} ariaLabel="Başlama dəqiqəsi"/></div></fieldset>
      <fieldset className="space-y-2"><legend className="text-xs font-semibold text-slate-500">Bitmə</legend><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><CustomSelect name="endHour" options={hours} defaultValue={endHour} ariaLabel="Bitmə saatı"/><span className="font-bold text-slate-400">:</span><CustomSelect name="endMinute" options={minutes} defaultValue={endMinute} ariaLabel="Bitmə dəqiqəsi"/></div></fieldset>
      <label className={`${label} sm:col-span-2`}>Məkan<input className={field} name="location" defaultValue={schedule.location || ""} placeholder="İstəyə bağlı" /></label>
      <div className="sm:col-span-2"><Message state={state}/></div>
      <Button disabled={pending} className="sm:col-span-2">{pending ? "Yenilənir..." : "Dəyişikliyi yadda saxla və bildir"}</Button>
    </form>
    {!schedule.is_extra && <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span><strong className="block text-sm text-amber-950">Yalnız növbəti dərsi ləğv et</strong><span className="mt-1 block text-xs leading-5 text-amber-800">Növbəti dərs baş tutmayacaq, amma həftəlik vaxt cədvəldə qalacaq və gələn həftə yenidən davam edəcək.</span></span>
        <button type="button" onClick={() => setConfirmation("occurrence")} disabled={occurrencePending || cancelPending} className="focus-ring shrink-0 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60">{occurrencePending ? "Ləğv edilir..." : "Yalnız növbəti dərsi ləğv et"}</button>
      </div>
      <Message state={occurrenceState}/>
    </div>}
    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span><strong className="block text-sm text-rose-900">{schedule.is_extra ? "Əlavə dərsi ləğv et" : "Cədvəldən tam çıxar"}</strong><span className="mt-1 block text-xs leading-5 text-rose-700">{schedule.is_extra ? "Əlavə dərs cədvəldən çıxarılacaq və şagirdlərə “Dərs ləğv edildi” bildirişi gedəcək." : "Təkrarlanan dərs bütün gələcək həftələr üçün cədvəldən çıxarılacaq və şagirdlərə “Dərs ləğv edildi” bildirişi gedəcək."}</span></span>
        <button type="button" onClick={() => setConfirmation("permanent")} disabled={cancelPending || occurrencePending} className="focus-ring shrink-0 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60">{cancelPending ? "Ləğv edilir..." : schedule.is_extra ? "Əlavə dərsi ləğv et" : "Cədvəldən tam çıxar"}</button>
      </div>
      <Message state={cancelState}/>
    </div>
    {confirmation && <div role="dialog" aria-modal="true" aria-labelledby="schedule-confirmation-title" aria-describedby="schedule-confirmation-description" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl ${confirmation === "occurrence" ? "border-amber-200" : "border-rose-200"}`}>
        <div className={`flex items-start justify-between gap-3 border-b pb-4 ${confirmation === "occurrence" ? "border-amber-100" : "border-rose-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${confirmation === "occurrence" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"}`}><AlertTriangle className="size-5"/></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Təsdiq tələb olunur</p><h3 id="schedule-confirmation-title" className="mt-0.5 text-base font-bold text-slate-900">{confirmation === "occurrence" ? "Növbəti dərs ləğv edilsin?" : schedule.is_extra ? "Əlavə dərs ləğv edilsin?" : "Dərs cədvəldən tam çıxarılsın?"}</h3></div>
          </div>
          <button type="button" onClick={() => setConfirmation(null)} className="focus-ring rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Popup-u bağla"><X className="size-4"/></button>
        </div>
        <div id="schedule-confirmation-description" className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${confirmation === "occurrence" ? "border-amber-100 bg-amber-50/70 text-amber-950" : "border-rose-100 bg-rose-50/70 text-rose-950"}`}>
          {confirmation === "occurrence" ? "Yalnız növbəti dərs baş tutmayacaq. Həftəlik dərs vaxtı cədvəldə qalacaq, gələn həftə yenidən davam edəcək və şagirdlərə bildiriş göndəriləcək." : schedule.is_extra ? "Bu əlavə dərs cədvəldən çıxarılacaq və şagirdlərə “Dərs ləğv edildi” bildirişi göndəriləcək." : "Bu təkrarlanan dərs bütün gələcək həftələr üçün cədvəldən çıxarılacaq və şagirdlərə “Dərs ləğv edildi” bildirişi göndəriləcək."}
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">Davam etmək istəyirsiniz?</p>
        <form action={confirmation === "occurrence" ? occurrenceFormAction : cancelFormAction} onSubmit={() => setConfirmation(null)} className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setConfirmation(null)} className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Xeyr</button>
          <button type="submit" className={`focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${confirmation === "occurrence" ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"}`}>{confirmation === "occurrence" ? "Bəli, növbəti dərsi ləğv et" : schedule.is_extra ? "Bəli, əlavə dərsi ləğv et" : "Bəli, cədvəldən çıxar"}</button>
        </form>
      </div>
    </div>}
  </div>;
}
