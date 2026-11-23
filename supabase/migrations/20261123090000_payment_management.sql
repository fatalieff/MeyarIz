-- Workspace-scoped payment management. All monetary values are integer qepik.
create type public.billing_model as enum ('CALENDAR_MONTH', 'ANNIVERSARY_MONTH', 'LESSON_PACKAGE');
create type public.invoice_status as enum ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');
create type public.payment_method as enum ('CASH', 'BANK_TRANSFER', 'OTHER');
create type public.discount_kind as enum ('FIXED', 'PERCENT');
create type public.discount_frequency as enum ('ONE_TIME', 'RECURRING');
create type public.pause_kind as enum ('UNPAID', 'COMPENSATED');
create type public.lesson_status as enum ('SCHEDULED', 'COMPLETED', 'CANCELLED');
create type public.attendance_status as enum ('ATTENDED', 'ABSENT', 'EXCUSED');
create type public.adjustment_kind as enum ('DEBIT', 'CREDIT');

create table public.workspace_billing_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  billing_model public.billing_model not null,
  effective_from date not null default current_date,
  effective_to date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);
create unique index workspace_one_active_billing_model
  on public.workspace_billing_settings(workspace_id) where effective_to is null;
create index workspace_billing_history_idx
  on public.workspace_billing_settings(workspace_id, effective_from desc);

insert into public.workspace_billing_settings(workspace_id,billing_model,effective_from,created_by)
select w.id,'CALENDAR_MONTH',current_date,w.owner_id from public.teacher_workspaces w
where not exists(select 1 from public.workspace_billing_settings b where b.workspace_id=w.id);

alter table public.groups
  add column price_cents bigint not null default 0 check (price_cents >= 0),
  add column package_lesson_count integer not null default 8 check (package_lesson_count between 1 and 100);

create table public.student_billing_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  group_id uuid not null references public.groups(id),
  effective_from date not null,
  effective_to date,
  price_override_cents bigint check (price_override_cents is null or price_override_cents >= 0),
  discount_kind public.discount_kind,
  discount_value bigint check (discount_value is null or discount_value >= 0),
  discount_frequency public.discount_frequency,
  discount_reason text,
  discount_applied_at date,
  anchor_day smallint not null check (anchor_day between 1 and 31),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((discount_kind is null and discount_value is null and discount_frequency is null)
    or (discount_kind is not null and discount_value is not null and discount_frequency is not null)),
  check (discount_kind <> 'PERCENT' or discount_value <= 10000),
  check (effective_to is null or effective_to >= effective_from)
);
create unique index student_one_active_billing_setting
  on public.student_billing_settings(student_id) where effective_to is null;
create index student_billing_workspace_idx
  on public.student_billing_settings(workspace_id, student_id, effective_from desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id),
  group_id uuid not null references public.groups(id),
  billing_model public.billing_model not null,
  period_key text not null,
  period_start date not null,
  period_end date not null,
  due_date date not null,
  amount_cents bigint not null check (amount_cents >= 0),
  base_amount_cents bigint not null check (base_amount_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  paid_cents bigint not null default 0 check (paid_cents >= 0 and paid_cents <= amount_cents),
  status public.invoice_status not null default 'UNPAID',
  package_sequence integer,
  lesson_from integer,
  lesson_to integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  check (discount_cents <= base_amount_cents),
  unique (student_id, billing_model, period_key)
);
create index invoices_workspace_period_idx on public.invoices(workspace_id, period_start desc);
create index invoices_student_status_idx on public.invoices(student_id, status, due_date);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id),
  amount_cents bigint not null check (amount_cents > 0),
  received_at date not null,
  method public.payment_method not null,
  note text,
  voided_at timestamptz,
  voided_by uuid references public.profiles(id),
  void_reason text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((voided_at is null and voided_by is null and void_reason is null)
    or (voided_at is not null and voided_by is not null and length(trim(void_reason)) > 2))
);
create index payments_workspace_received_idx on public.payments(workspace_id, received_at desc);
create index payments_student_idx on public.payments(student_id, created_at desc);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  payment_id uuid not null references public.payments(id),
  invoice_id uuid not null references public.invoices(id),
  amount_cents bigint not null check (amount_cents > 0),
  applied_at timestamptz not null default now(),
  applied_by uuid references public.profiles(id),
  unique(payment_id, invoice_id)
);
create index allocations_invoice_idx on public.payment_allocations(invoice_id);
create index allocations_payment_idx on public.payment_allocations(payment_id);

create table public.student_pauses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  starts_on date not null,
  ends_on date,
  kind public.pause_kind not null,
  reason text not null check (length(trim(reason)) >= 3),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);
create index student_pauses_active_idx on public.student_pauses(student_id, starts_on, ends_on);

create table public.billing_adjustments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id),
  invoice_id uuid references public.invoices(id),
  kind public.adjustment_kind not null,
  amount_cents bigint not null check (amount_cents > 0),
  reason text not null check (length(trim(reason)) >= 3),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index billing_adjustments_student_idx on public.billing_adjustments(student_id, created_at desc);

create table public.lesson_occurrences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  schedule_id uuid references public.group_schedules(id) on delete set null,
  occurs_on date not null,
  starts_at time,
  status public.lesson_status not null default 'SCHEDULED',
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(group_id, occurs_on, starts_at)
);
create index lesson_occurrences_group_idx on public.lesson_occurrences(group_id, occurs_on desc, status);

create table public.lesson_attendance (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  occurrence_id uuid not null references public.lesson_occurrences(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null,
  marked_by uuid not null references public.profiles(id),
  marked_at timestamptz not null default now(),
  unique(occurrence_id, student_id)
);
create index lesson_attendance_student_idx on public.lesson_attendance(student_id, status);

create table public.billing_audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index billing_audit_workspace_idx on public.billing_audit_logs(workspace_id, created_at desc);

create trigger invoices_touch before update on public.invoices for each row execute function private.touch_updated_at();
create trigger student_pauses_touch before update on public.student_pauses for each row execute function private.touch_updated_at();

-- Shared tenant checks used by RLS and privileged RPCs.
create or replace function private.is_billing_member(target_workspace uuid)
returns boolean stable language sql security definer set search_path = '' as $$
  select (select private.is_teacher_of_workspace(target_workspace))
    or (select private.is_admin())
$$;
revoke all on function private.is_billing_member(uuid) from public, anon;
grant execute on function private.is_billing_member(uuid) to authenticated, service_role;

alter table public.workspace_billing_settings enable row level security;
alter table public.student_billing_settings enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.student_pauses enable row level security;
alter table public.billing_adjustments enable row level security;
alter table public.lesson_occurrences enable row level security;
alter table public.lesson_attendance enable row level security;
alter table public.billing_audit_logs enable row level security;

do $$
declare t text;
begin
  foreach t in array array['workspace_billing_settings','student_billing_settings','invoices','payments','payment_allocations','student_pauses','billing_adjustments','lesson_occurrences','lesson_attendance','billing_audit_logs'] loop
    execute format('create policy %I on public.%I for select to authenticated using ((select private.is_billing_member(workspace_id)))', t || '_select', t);
  end loop;
end $$;

create policy workspace_billing_admin_insert on public.workspace_billing_settings for insert to authenticated
  with check ((select private.is_admin()));
create policy workspace_billing_admin_update on public.workspace_billing_settings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy student_billing_teacher_write on public.student_billing_settings for all to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)))
  with check ((select private.is_teacher_of_workspace(workspace_id)));
create policy pauses_teacher_write on public.student_pauses for all to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)))
  with check ((select private.is_teacher_of_workspace(workspace_id)));
create policy lessons_teacher_write on public.lesson_occurrences for all to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)))
  with check ((select private.is_teacher_of_workspace(workspace_id)));
create policy attendance_teacher_write on public.lesson_attendance for all to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)))
  with check ((select private.is_teacher_of_workspace(workspace_id)));

-- Financial ledger tables are append-only through RPCs. Direct client mutations stay revoked.
revoke all on public.invoices, public.payments, public.payment_allocations, public.billing_adjustments, public.billing_audit_logs from anon;
revoke insert, update, delete, truncate on public.invoices, public.payments, public.payment_allocations, public.billing_adjustments, public.billing_audit_logs from authenticated;
grant select on public.workspace_billing_settings, public.student_billing_settings, public.invoices, public.payments,
  public.payment_allocations, public.student_pauses, public.billing_adjustments, public.lesson_occurrences,
  public.lesson_attendance, public.billing_audit_logs to authenticated;
grant insert, update, delete on public.student_billing_settings, public.student_pauses, public.lesson_occurrences, public.lesson_attendance to authenticated;

create or replace function private.invoice_amount(p_student uuid, p_group uuid, p_date date)
returns table(base_cents bigint, discount_cents bigint, total_cents bigint)
language plpgsql security definer set search_path = '' as $$
declare s public.student_billing_settings; g public.groups; d bigint := 0;
begin
  select * into s from public.student_billing_settings
   where student_id=p_student and effective_from<=p_date and (effective_to is null or effective_to>=p_date)
   order by effective_from desc limit 1;
  select * into g from public.groups where id=p_group;
  base_cents := coalesce(s.price_override_cents, g.price_cents, 0);
  if s.discount_kind is not null and (s.discount_frequency='RECURRING' or s.discount_applied_at is null) then
    d := case when s.discount_kind='FIXED' then s.discount_value
      else (base_cents * s.discount_value / 10000) end;
  end if;
  discount_cents := least(base_cents, coalesce(d,0));
  total_cents := greatest(0, base_cents-discount_cents);
  return next;
end $$;
revoke all on function private.invoice_amount(uuid,uuid,date) from public, anon, authenticated;

create or replace function private.refresh_invoice(p_invoice uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare paid bigint; inv public.invoices;
begin
  select * into inv from public.invoices where id=p_invoice for update;
  select coalesce(sum(a.amount_cents),0) into paid from public.payment_allocations a
    join public.payments p on p.id=a.payment_id where a.invoice_id=p_invoice and p.voided_at is null;
  update public.invoices set paid_cents=least(amount_cents,paid), status=case
    when status='VOID' then 'VOID'::public.invoice_status
    when paid>=amount_cents then 'PAID'::public.invoice_status
    when paid>0 then 'PARTIALLY_PAID'::public.invoice_status
    when due_date < (now() at time zone 'Asia/Baku')::date then 'OVERDUE'::public.invoice_status
    else 'UNPAID'::public.invoice_status end where id=p_invoice;
end $$;
revoke all on function private.refresh_invoice(uuid) from public, anon, authenticated;

create or replace function private.apply_student_credit(p_student uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare pay record; inv record; available bigint; needed bigint; used bigint;
begin
  for pay in select p.id,p.workspace_id,p.amount_cents-coalesce(sum(a.amount_cents),0) available
    from public.payments p left join public.payment_allocations a on a.payment_id=p.id
    where p.student_id=p_student and p.voided_at is null group by p.id order by p.received_at,p.created_at
  loop
    available := pay.available;
    for inv in select i.id,i.amount_cents-i.paid_cents remaining from public.invoices i
      where i.student_id=p_student and i.status not in ('PAID','VOID') order by i.period_start,i.created_at for update
    loop
      exit when available<=0;
      needed:=inv.remaining; used:=least(available,needed);
      if used>0 then
        insert into public.payment_allocations(workspace_id,payment_id,invoice_id,amount_cents)
          values(pay.workspace_id,pay.id,inv.id,used)
          on conflict(payment_id,invoice_id) do update set amount_cents=public.payment_allocations.amount_cents+excluded.amount_cents;
        available:=available-used;
        perform private.refresh_invoice(inv.id);
      end if;
    end loop;
  end loop;
end $$;
revoke all on function private.apply_student_credit(uuid) from public, anon, authenticated;

create or replace function private.create_invoice(
  p_workspace uuid,p_student uuid,p_group uuid,p_model public.billing_model,p_key text,
  p_start date,p_end date,p_due date,p_package_sequence integer default null,
  p_lesson_from integer default null,p_lesson_to integer default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare amounts record; invoice_id uuid;
begin
  if exists(select 1 from public.student_pauses where student_id=p_student and kind='UNPAID'
    and starts_on<=p_start and (ends_on is null or ends_on>=p_end)) then return null; end if;
  select * into amounts from private.invoice_amount(p_student,p_group,p_start);
  if amounts.base_cents <= 0 then return null; end if;
  insert into public.invoices(workspace_id,student_id,group_id,billing_model,period_key,period_start,period_end,due_date,
    amount_cents,base_amount_cents,discount_cents,package_sequence,lesson_from,lesson_to)
  values(p_workspace,p_student,p_group,p_model,p_key,p_start,p_end,p_due,amounts.total_cents,amounts.base_cents,
    amounts.discount_cents,p_package_sequence,p_lesson_from,p_lesson_to)
  on conflict(student_id,billing_model,period_key) do nothing returning id into invoice_id;
  if invoice_id is not null then
    update public.student_billing_settings set discount_applied_at=p_start
      where student_id=p_student and effective_to is null and discount_frequency='ONE_TIME' and discount_applied_at is null;
    perform private.apply_student_credit(p_student);
  end if;
  return invoice_id;
end $$;
revoke all on function private.create_invoice(uuid,uuid,uuid,public.billing_model,text,date,date,date,integer,integer,integer) from public, anon, authenticated;

create or replace function private.generate_billing_invoices(p_as_of date default (now() at time zone 'Asia/Baku')::date)
returns integer language plpgsql security definer set search_path='' as $$
declare r record; model public.billing_model; start_on date; end_on date; key text; made integer:=0; before_count bigint; lesson_count integer; sequence integer;
begin
  for r in select s.id student_id,s.workspace_id,m.group_id,m.joined_at,bs.anchor_day,g.package_lesson_count
    from public.students s join public.group_memberships m on m.student_id=s.id and m.active
    join public.groups g on g.id=m.group_id
    join public.student_billing_settings bs on bs.student_id=s.id and bs.effective_to is null
    where s.status='active' and m.joined_at<=p_as_of
  loop
    select billing_model into model from public.workspace_billing_settings
      where workspace_id=r.workspace_id and effective_from<=p_as_of and (effective_to is null or effective_to>=p_as_of)
      order by effective_from desc limit 1;
    if model='CALENDAR_MONTH' then
      start_on:=date_trunc('month',p_as_of)::date; end_on:=(start_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM');
    elsif model='ANNIVERSARY_MONTH' then
      start_on:=make_date(extract(year from p_as_of)::int,extract(month from p_as_of)::int,
        least(r.anchor_day,extract(day from (date_trunc('month',p_as_of)+interval '1 month'-interval '1 day'))::int));
      if start_on>p_as_of then start_on:=(start_on-interval '1 month')::date; end if;
      end_on:=(make_date(extract(year from (start_on+interval '1 month'))::int,extract(month from (start_on+interval '1 month'))::int,
        least(r.anchor_day,extract(day from (date_trunc('month',start_on+interval '1 month')+interval '1 month'-interval '1 day'))::int))-1);
      key:=to_char(start_on,'YYYY-MM-DD');
    else
      select count(*) into lesson_count from public.lesson_attendance a join public.lesson_occurrences o on o.id=a.occurrence_id
        where a.student_id=r.student_id and a.status='ATTENDED' and o.status='COMPLETED';
      sequence:=greatest(1,(lesson_count/r.package_lesson_count)+1);
      start_on:=p_as_of; end_on:=p_as_of; key:='PKG-'||sequence;
      if sequence>1 and lesson_count < (sequence-1)*r.package_lesson_count then continue; end if;
    end if;
    select count(*) into before_count from public.invoices where student_id=r.student_id and billing_model=model and period_key=key;
    perform private.create_invoice(r.workspace_id,r.student_id,r.group_id,model,key,start_on,end_on,start_on,
      case when model='LESSON_PACKAGE' then sequence else null end,
      case when model='LESSON_PACKAGE' then (sequence-1)*r.package_lesson_count+1 else null end,
      case when model='LESSON_PACKAGE' then sequence*r.package_lesson_count else null end);
    if before_count=0 and exists(select 1 from public.invoices where student_id=r.student_id and billing_model=model and period_key=key) then made:=made+1; end if;
  end loop;
  update public.invoices set status='OVERDUE' where status='UNPAID' and due_date<p_as_of;
  return made;
end $$;
revoke all on function private.generate_billing_invoices(date) from public, anon, authenticated;

create or replace function public.initialize_student_billing(p_student uuid,p_group uuid,p_joined_on date default (now() at time zone 'Asia/Baku')::date)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; model public.billing_model; result uuid; start_on date; end_on date; key text;
begin
  select s.workspace_id into ws from public.students s where s.id=p_student;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  if not exists(select 1 from public.groups where id=p_group and workspace_id=ws) then raise exception 'Qrup workspace-ə aid deyil'; end if;
  insert into public.student_billing_settings(workspace_id,student_id,group_id,effective_from,anchor_day,created_by)
    values(ws,p_student,p_group,p_joined_on,extract(day from p_joined_on)::int,(select auth.uid()))
    on conflict(student_id) where effective_to is null do nothing;
  select billing_model into model from public.workspace_billing_settings where workspace_id=ws and effective_from<=p_joined_on
    and (effective_to is null or effective_to>=p_joined_on) order by effective_from desc limit 1;
  if model is null then raise exception 'Workspace ödəniş modeli təyin edilməyib'; end if;
  if model='CALENDAR_MONTH' then start_on:=date_trunc('month',p_joined_on)::date; end_on:=(start_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM');
  elsif model='ANNIVERSARY_MONTH' then start_on:=p_joined_on; end_on:=(p_joined_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM-DD');
  else start_on:=p_joined_on; end_on:=p_joined_on; key:='PKG-1'; end if;
  result:=private.create_invoice(ws,p_student,p_group,model,key,start_on,end_on,start_on,case when model='LESSON_PACKAGE' then 1 end,case when model='LESSON_PACKAGE' then 1 end,case when model='LESSON_PACKAGE' then (select package_lesson_count from public.groups where id=p_group) end);
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,new_value)
    values(ws,(select auth.uid()),'student_billing_initialized','student',p_student,jsonb_build_object('model',model,'joined_on',p_joined_on));
  return result;
end $$;
revoke all on function public.initialize_student_billing(uuid,uuid,date) from public, anon;
grant execute on function public.initialize_student_billing(uuid,uuid,date) to authenticated;

create or replace function public.record_payment(p_student uuid,p_amount_cents bigint,p_received_at date,p_method public.payment_method,p_invoice uuid default null,p_note text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; payment_id uuid; available bigint; inv record; used bigint;
begin
  if p_amount_cents<=0 then raise exception 'Məbləğ müsbət olmalıdır'; end if;
  if p_received_at>(now() at time zone 'Asia/Baku')::date then raise exception 'Gələcək tarixə ödəniş yazmaq olmaz'; end if;
  select workspace_id into ws from public.students where id=p_student;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  insert into public.payments(workspace_id,student_id,amount_cents,received_at,method,note,created_by)
    values(ws,p_student,p_amount_cents,p_received_at,p_method,nullif(trim(p_note),''),(select auth.uid())) returning id into payment_id;
  available:=p_amount_cents;
  for inv in select id,amount_cents-paid_cents remaining from public.invoices where student_id=p_student and workspace_id=ws
    and status not in ('PAID','VOID') order by case when id=p_invoice then 0 else 1 end,period_start,created_at for update
  loop
    exit when available<=0; used:=least(available,inv.remaining);
    if used>0 then
      insert into public.payment_allocations(workspace_id,payment_id,invoice_id,amount_cents,applied_by)
        values(ws,payment_id,inv.id,used,(select auth.uid()));
      available:=available-used; perform private.refresh_invoice(inv.id);
    end if;
  end loop;
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,new_value)
    values(ws,(select auth.uid()),'payment_recorded','payment',payment_id,jsonb_build_object('amount_cents',p_amount_cents,'unallocated_cents',available));
  return payment_id;
end $$;
revoke all on function public.record_payment(uuid,bigint,date,public.payment_method,uuid,text) from public, anon;
grant execute on function public.record_payment(uuid,bigint,date,public.payment_method,uuid,text) to authenticated;

create or replace function public.set_student_pause(p_student uuid,p_starts_on date,p_ends_on date,p_kind public.pause_kind,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; pause_id uuid;
begin
  select workspace_id into ws from public.students where id=p_student;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  if p_kind is null or p_kind not in ('UNPAID'::public.pause_kind, 'COMPENSATED'::public.pause_kind) then raise exception 'Fasilə növü düzgün deyil'; end if;
  if p_ends_on is not null and p_ends_on<p_starts_on then raise exception 'Bitmə tarixi başlama tarixindən əvvəl ola bilməz'; end if;
  if length(trim(p_reason))<3 then raise exception 'Səbəb daxil edin'; end if;
  insert into public.student_pauses(workspace_id,student_id,starts_on,ends_on,kind,reason,created_by)
    values(ws,p_student,p_starts_on,p_ends_on,p_kind,trim(p_reason),(select auth.uid())) returning id into pause_id;
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,new_value)
    values(ws,(select auth.uid()),'student_paused','pause',pause_id,jsonb_build_object('kind',p_kind,'starts_on',p_starts_on,'ends_on',p_ends_on));
  return pause_id;
end $$;
revoke all on function public.set_student_pause(uuid,date,date,public.pause_kind,text) from public, anon;
grant execute on function public.set_student_pause(uuid,date,date,public.pause_kind,text) to authenticated;

create or replace function public.set_student_billing_terms(
  p_student uuid,p_effective_from date,p_price_override_cents bigint default null,
  p_discount_kind public.discount_kind default null,p_discount_value bigint default null,
  p_discount_frequency public.discount_frequency default null,p_discount_reason text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; current_setting public.student_billing_settings; result uuid;
begin
  select workspace_id into ws from public.students where id=p_student;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  if p_effective_from<(now() at time zone 'Asia/Baku')::date then raise exception 'Dəyişiklik yalnız bu gün və ya gələcək tarixdən tətbiq edilə bilər'; end if;
  if p_price_override_cents is not null and p_price_override_cents<0 then raise exception 'Qiymət mənfi ola bilməz'; end if;
  if p_discount_kind is null and (p_discount_value is not null or p_discount_frequency is not null) then raise exception 'Endirim növünü seçin'; end if;
  if p_discount_kind='PERCENT' and (p_discount_value<0 or p_discount_value>10000) then raise exception 'Faiz 0-100 aralığında olmalıdır'; end if;
  select * into current_setting from public.student_billing_settings where student_id=p_student and effective_to is null for update;
  if current_setting.id is null then raise exception 'Şagirdin billing sazlaması yoxdur'; end if;
  if current_setting.effective_from>=p_effective_from then
    update public.student_billing_settings set price_override_cents=p_price_override_cents,discount_kind=p_discount_kind,
      discount_value=p_discount_value,discount_frequency=p_discount_frequency,discount_reason=nullif(trim(p_discount_reason),''),discount_applied_at=null
      where id=current_setting.id returning id into result;
  else
    update public.student_billing_settings set effective_to=p_effective_from-1 where id=current_setting.id;
    insert into public.student_billing_settings(workspace_id,student_id,group_id,effective_from,price_override_cents,
      discount_kind,discount_value,discount_frequency,discount_reason,anchor_day,created_by)
    values(ws,p_student,current_setting.group_id,p_effective_from,p_price_override_cents,p_discount_kind,p_discount_value,
      p_discount_frequency,nullif(trim(p_discount_reason),''),current_setting.anchor_day,(select auth.uid())) returning id into result;
  end if;
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,new_value)
    values(ws,(select auth.uid()),'billing_terms_changed','student_billing_settings',result,jsonb_build_object('effective_from',p_effective_from,'price_override_cents',p_price_override_cents,'discount_kind',p_discount_kind,'discount_value',p_discount_value,'discount_frequency',p_discount_frequency));
  return result;
end $$;
revoke all on function public.set_student_billing_terms(uuid,date,bigint,public.discount_kind,bigint,public.discount_frequency,text) from public, anon;
grant execute on function public.set_student_billing_terms(uuid,date,bigint,public.discount_kind,bigint,public.discount_frequency,text) to authenticated;

create or replace function public.complete_group_lesson(p_group uuid,p_occurs_on date,p_starts_at time default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; occurrence uuid;
begin
  select workspace_id into ws from public.groups where id=p_group;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  if p_occurs_on>(now() at time zone 'Asia/Baku')::date then raise exception 'Gələcək dərs tamamlanmış sayıla bilməz'; end if;
  insert into public.lesson_occurrences(workspace_id,group_id,occurs_on,starts_at,status,completed_at,created_by)
    values(ws,p_group,p_occurs_on,p_starts_at,'COMPLETED',now(),(select auth.uid()))
    on conflict(group_id,occurs_on,starts_at) do update set status='COMPLETED',completed_at=now()
    returning id into occurrence;
  insert into public.lesson_attendance(workspace_id,occurrence_id,student_id,status,marked_by)
    select ws,occurrence,m.student_id,'ATTENDED',(select auth.uid()) from public.group_memberships m
    where m.group_id=p_group and m.active
    on conflict(occurrence_id,student_id) do update set status='ATTENDED',marked_by=(select auth.uid()),marked_at=now();
  perform private.generate_billing_invoices((now() at time zone 'Asia/Baku')::date);
  return occurrence;
end $$;
revoke all on function public.complete_group_lesson(uuid,date,time) from public, anon;
grant execute on function public.complete_group_lesson(uuid,date,time) to authenticated;

-- Run once daily at 00:15 Asia/Baku (20:15 UTC). Safe to retry because invoice keys are unique.
do $$ begin
  if exists(select 1 from pg_available_extensions where name='pg_cron') then
    create extension if not exists pg_cron;
    if not exists(select 1 from cron.job where jobname='generate-daily-billing-invoices') then
      perform cron.schedule('generate-daily-billing-invoices','15 20 * * *',$cron$select private.generate_billing_invoices((now() at time zone 'Asia/Baku')::date)$cron$);
    end if;
  end if;
exception when insufficient_privilege then null;
end $$;
