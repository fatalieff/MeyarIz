alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('schedule_created', 'schedule_updated', 'extra_lesson', 'exam_result', 'test'));

create policy student_notification_test_create
  on public.notifications for insert to authenticated
  with check (
    student_id = (select private.my_student_id())
    and type = 'test'
    and event_key like 'push-test:%'
    and workspace_id = (
      select s.workspace_id
      from public.students s
      where s.id = (select private.my_student_id())
    )
  );

create or replace function public.notification_push_targets(p_notification_ids uuid[])
returns table (
  notification_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  title text,
  body text,
  link text
)
language sql
stable
security definer
set search_path = ''
as $$
  select n.id, ps.endpoint, ps.p256dh, ps.auth, n.title, n.body, n.link
  from public.notifications n
  join public.push_subscriptions ps on ps.student_id = n.student_id
  where n.id = any(p_notification_ids)
    and (
      private.is_teacher_of_workspace(n.workspace_id)
      or n.student_id = private.my_student_id()
    )
$$;

revoke all on function public.notification_push_targets(uuid[]) from public, anon;
grant execute on function public.notification_push_targets(uuid[]) to authenticated;
