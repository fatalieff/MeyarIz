drop policy teacher_schedule_cancellations_all
on public.group_schedule_cancellations;

drop policy student_schedule_cancellations_read
on public.group_schedule_cancellations;

create policy schedule_cancellations_read
on public.group_schedule_cancellations
for select
to authenticated
using (
  exists (
    select 1
    from public.group_schedules s
    join public.groups g on g.id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and (
        (select private.is_teacher_of_workspace(g.workspace_id))
        or exists (
          select 1
          from public.group_memberships m
          where m.group_id = s.group_id
            and m.student_id = (select private.my_student_id())
            and m.active
        )
      )
  )
);

create policy teacher_schedule_cancellations_insert
on public.group_schedule_cancellations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.group_schedules s
    join public.groups g on g.id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and (select private.is_teacher_of_workspace(g.workspace_id))
  )
);

create policy teacher_schedule_cancellations_delete
on public.group_schedule_cancellations
for delete
to authenticated
using (
  exists (
    select 1
    from public.group_schedules s
    join public.groups g on g.id = s.group_id
    where s.id = group_schedule_cancellations.schedule_id
      and (select private.is_teacher_of_workspace(g.workspace_id))
  )
);
