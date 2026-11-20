create table public.group_schedule_cancellations (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.group_schedules(id) on delete cascade,
  occurrence_date date not null,
  created_at timestamptz not null default now(),
  constraint group_schedule_cancellations_unique_occurrence
    unique (schedule_id, occurrence_date)
);

comment on table public.group_schedule_cancellations is
  'One-off cancellations for recurring weekly lessons. The base schedule remains active.';
comment on column public.group_schedule_cancellations.occurrence_date is
  'The exact Baku calendar date on which this recurring lesson is cancelled.';

alter table public.group_schedule_cancellations enable row level security;

create policy teacher_schedule_cancellations_all
on public.group_schedule_cancellations
for all
to authenticated
using (
  exists (
    select 1
    from public.group_schedules s
    join public.groups g on g.id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and (select private.is_teacher_of_workspace(g.workspace_id))
  )
)
with check (
  exists (
    select 1
    from public.group_schedules s
    join public.groups g on g.id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and (select private.is_teacher_of_workspace(g.workspace_id))
  )
);

create policy student_schedule_cancellations_read
on public.group_schedule_cancellations
for select
to authenticated
using (
  exists (
    select 1
    from public.group_schedules s
    join public.group_memberships m on m.group_id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and m.student_id = (select private.my_student_id())
      and m.active
  )
);

revoke all on public.group_schedule_cancellations from anon, authenticated;
grant select, insert, delete on public.group_schedule_cancellations to authenticated;

alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'schedule_created',
    'schedule_updated',
    'schedule_cancelled',
    'schedule_occurrence_cancelled',
    'extra_lesson',
    'exam_created',
    'exam_result',
    'exam_result_updated',
    'test'
  ));
