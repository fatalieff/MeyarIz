create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  type text not null check (type in ('schedule_created', 'schedule_updated', 'extra_lesson', 'exam_result')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  link text not null default '/student/dashboard' check (link like '/student/%'),
  event_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (student_id, event_key)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_student_created_idx
  on public.notifications(student_id, created_at desc);
create index notifications_student_unread_idx
  on public.notifications(student_id, created_at desc)
  where read_at is null;
create index push_subscriptions_student_idx
  on public.push_subscriptions(student_id);

alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

create policy student_notifications_read
  on public.notifications for select to authenticated
  using (student_id = (select private.my_student_id()));

create policy student_notifications_mark_read
  on public.notifications for update to authenticated
  using (student_id = (select private.my_student_id()))
  with check (student_id = (select private.my_student_id()));

create policy teacher_notifications_create
  on public.notifications for insert to authenticated
  with check (
    (select private.is_teacher_of_workspace(workspace_id))
    and exists (
      select 1 from public.students s
      where s.id = student_id and s.workspace_id = notifications.workspace_id
    )
  );

create policy student_push_subscriptions_all
  on public.push_subscriptions for all to authenticated
  using (student_id = (select private.my_student_id()))
  with check (student_id = (select private.my_student_id()));

revoke all on public.notifications from anon, authenticated;
grant select, insert on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create trigger touch_push_subscriptions
  before update on public.push_subscriptions
  for each row execute function private.touch_updated_at();

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
    and private.is_teacher_of_workspace(n.workspace_id)
$$;

revoke all on function public.notification_push_targets(uuid[]) from public, anon;
grant execute on function public.notification_push_targets(uuid[]) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
