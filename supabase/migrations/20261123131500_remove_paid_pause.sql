-- Remove the retired PAID pause kind without rewriting historical meaning.
-- The migration intentionally stops if legacy PAID rows require a manual decision.
do $$
begin
  if exists (
    select 1
    from public.student_pauses
    where kind::text = 'PAID'
  ) then
    raise exception using
      message = 'Migration dayandırıldı: student_pauses cədvəlində PAID fasilə sətrləri var.',
      detail = 'Mövcud PAID sətrlərinin mənası manual qərarla müəyyən edilməlidir; avtomatik çevrilmə aparılmadı.',
      hint = 'PAID sətrlərini yoxlayın, uyğun biznes qərarı verin və sonra migration-ı yenidən başladın.';
  end if;
end $$;

drop function if exists public.set_student_pause(uuid, date, date, public.pause_kind, text);

create type public.pause_kind_v2 as enum ('UNPAID', 'COMPENSATED');

alter table public.student_pauses
  alter column kind type public.pause_kind_v2
  using kind::text::public.pause_kind_v2;

drop type public.pause_kind;
alter type public.pause_kind_v2 rename to pause_kind;

create or replace function public.set_student_pause(
  p_student uuid,
  p_starts_on date,
  p_ends_on date,
  p_kind public.pause_kind,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  ws uuid;
  pause_id uuid;
begin
  select workspace_id into ws
  from public.students
  where id = p_student;

  if ws is null or not (select private.is_teacher_of_workspace(ws)) then
    raise exception 'İcazə yoxdur';
  end if;

  if p_kind is null or p_kind not in ('UNPAID'::public.pause_kind, 'COMPENSATED'::public.pause_kind) then
    raise exception 'Fasilə növü düzgün deyil';
  end if;

  if p_starts_on is null then
    raise exception 'Başlanğıc tarixi daxil edilməlidir';
  end if;

  if p_ends_on is not null and p_ends_on < p_starts_on then
    raise exception 'Bitmə tarixi başlama tarixindən əvvəl ola bilməz';
  end if;

  if p_reason is null or length(trim(p_reason)) < 3 then
    raise exception 'Səbəb daxil edin';
  end if;

  insert into public.student_pauses (
    workspace_id, student_id, starts_on, ends_on, kind, reason, created_by
  ) values (
    ws, p_student, p_starts_on, p_ends_on, p_kind, trim(p_reason), (select auth.uid())
  )
  returning id into pause_id;

  insert into public.billing_audit_logs (
    workspace_id, actor_id, action, entity_type, entity_id, new_value
  ) values (
    ws,
    (select auth.uid()),
    'student_paused',
    'pause',
    pause_id,
    jsonb_build_object('kind', p_kind, 'starts_on', p_starts_on, 'ends_on', p_ends_on)
  );

  return pause_id;
end
$$;

revoke all on function public.set_student_pause(uuid, date, date, public.pause_kind, text) from public, anon;
grant execute on function public.set_student_pause(uuid, date, date, public.pause_kind, text) to authenticated;
