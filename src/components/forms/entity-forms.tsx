"use client";

import { useActionState, useState } from "react";
import { createExam, createGroup, createSchedule, createStudent, updateGroup, updateStudent } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { MultiSelect } from "@/components/ui/multi-select";

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

export function GroupForm() {
  const [state, action, pending] = useActionState(createGroup, null);
  return <form action={action} className="space-y-4"><label className={label}>Qrupun adı<input className={field} name="name" required placeholder="Məsələn, Abituriyent 2027" /></label><label className={label}>Hazırlıq səviyyəsi<input className={field} name="preparationLevel" placeholder="Məsələn, orta" /></label><label className={label}>Təsvir<textarea className="focus-ring min-h-24 w-full rounded-xl border p-3 text-sm outline-none" name="description" placeholder="Qrup haqqında qısa qeyd" /></label><label className={label}>Qrup rəngi<input className="h-11 w-full rounded-xl border p-1" type="color" name="color" defaultValue="#4f5fe7" /></label><Message state={state} /><Button disabled={pending} className="w-full">{pending ? "Yaradılır..." : "Qrup yarat"}</Button></form>;
}

export function GroupEditForm({ group }: { group: any }) {
  const action = updateGroup.bind(null, group.id);
  const [state, formAction, pending] = useActionState(action, null);
  return <form action={formAction} className="grid gap-4 sm:grid-cols-2"><label className={label}>Qrupun adı<input className={field} name="name" required defaultValue={group.name} /></label><label className={label}>Hazırlıq səviyyəsi<input className={field} name="preparationLevel" defaultValue={group.preparation_level || ""} placeholder="Məsələn, orta" /></label><label className={`${label} sm:col-span-2`}>Təsvir<textarea className="focus-ring min-h-24 w-full rounded-xl border bg-white p-3 text-sm outline-none" name="description" defaultValue={group.description || ""} placeholder="Qrup haqqında qısa qeyd" /></label><label className={`${label} sm:col-span-2`}>Qrup rəngi<div className="mt-1.5 flex items-center gap-3 rounded-xl border bg-white p-2"><input className="size-10 cursor-pointer rounded-lg border-0 p-0" type="color" name="color" defaultValue={group.color || "#4f5fe7"} /><span className="text-xs font-normal text-slate-500">Cədvəl və qrup kartlarında istifadə olunur</span></div></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Yadda saxlanılır..." : "Dəyişiklikləri yadda saxla"}</Button></form>;
}

export function StudentForm({ groups }: { groups: any[] }) {
  const [state, action, pending] = useActionState(createStudent, null);
  return <form action={action} className="grid gap-4 sm:grid-cols-2"><label className={label}>Ad və soyad<input className={field} name="fullName" required placeholder="Əli Məmmədov" /></label><div className={label}><span>Qrup</span><CustomSelect name="groupId" options={groupOptions(groups)} placeholder="Qrup seçin" ariaLabel="Şagird qrupu" /></div><label className={label}>E-poçt<input className={field} name="email" type="email" required autoComplete="email" placeholder="ali@example.com" /><span className="mt-1 block text-xs font-normal text-slate-500">Şagirdin kabinetə giriş e-poçtu.</span></label><label className={label}>Şifrə<input className={field} name="password" type="password" required minLength={6} placeholder="Ən azı 6 simvol" /><span className="mt-1 block text-xs font-normal text-slate-500">Şagirdin kabinetə daxil olacağı ilkin şifrə.</span></label><label className={label}>Şagirdin telefonu<input className={field} name="phone" type="tel" inputMode="tel" placeholder="+994 50 123 45 67" /></label><label className={label}>Hazırlıq səviyyəsi<input className={field} name="preparationLevel" /></label><div className="space-y-3 sm:col-span-2"><div><h3 className="text-sm font-bold text-slate-800">Valideyn əlaqələri</h3><p className="mt-1 text-xs text-slate-500">Ana və ata məlumatlarından istədiyinizi doldura bilərsiniz.</p></div><div className="grid gap-3 lg:grid-cols-2"><ParentContactFields type="mother" title="Ana" /><ParentContactFields type="father" title="Ata" /></div></div><label className={`${label} sm:col-span-2`}>Müəllim qeydi<input className={field} name="privateNotes" placeholder="Yalnız siz görəcəksiniz" /></label><div className="sm:col-span-2"><Message state={state} /></div><Button disabled={pending} className="sm:col-span-2">{pending ? "Hesab yaradılır..." : "Şagird əlavə et"}</Button></form>;
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
  const dayNames = ["Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"];

  const toggleDay = (weekday: number, checked: boolean) => {
    setSelectedDays((current) => checked ? [...current, weekday].sort((a, b) => a - b) : current.filter((day) => day !== weekday));
  };

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className={`${label} sm:col-span-2`}><span>Qrup</span><CustomSelect name="groupId" options={groupOptions(groups)} placeholder="Qrup seçin" ariaLabel="Dərs qrupu" required onValueChange={setSelectedGroup} /></div>
      <fieldset className="space-y-3 sm:col-span-2">
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
      </fieldset>
      <label className={`${label} sm:col-span-2`}>Məkan<input className={field} name="location" placeholder="İstəyə bağlı" /></label>
      <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2"><input className="size-4 accent-indigo-600" type="checkbox" name="allowConflict" value="true" />Məlum vaxt toqquşmasına qəsdən icazə ver</label>
      <div className="sm:col-span-2"><Message state={state} /></div>
      <Button disabled={pending || !selectedGroup || selectedDays.length === 0} className="sm:col-span-2">{pending ? "Əlavə edilir..." : !selectedGroup ? "Əvvəlcə qrup seçin" : `${selectedDays.length || ""} ${selectedDays.length ? "gün üçün dərs vaxtlarını əlavə et" : "Dərs vaxtlarını əlavə et"}`}</Button>
    </form>
  );
}
