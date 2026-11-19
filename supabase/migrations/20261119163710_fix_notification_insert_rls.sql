create or replace function private.can_create_notification(
  target_workspace_id uuid,
  target_student_id uuid,
  target_type text,
  target_event_key text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      private.is_teacher_of_workspace(target_workspace_id)
      and exists (
        select 1
        from public.students s
        where s.id = target_student_id
          and s.workspace_id = target_workspace_id
      )
    )
    or
    (
      target_student_id = private.my_student_id()
      and target_type = 'test'
      and target_event_key like 'push-test:%'
      and exists (
        select 1
        from public.students s
        where s.id = target_student_id
          and s.workspace_id = target_workspace_id
      )
    )
$$;

revoke all on function private.can_create_notification(uuid, uuid, text, text)
  from public, anon;
grant execute on function private.can_create_notification(uuid, uuid, text, text)
  to authenticated, service_role;

drop policy if exists teacher_notifications_create on public.notifications;
drop policy if exists student_notification_test_create on public.notifications;
drop policy if exists authenticated_notifications_create on public.notifications;

create policy authenticated_notifications_create
  on public.notifications
  for insert
  to authenticated
  with check (
    (select private.can_create_notification(
      workspace_id,
      student_id,
      type,
      event_key
    ))
  );
