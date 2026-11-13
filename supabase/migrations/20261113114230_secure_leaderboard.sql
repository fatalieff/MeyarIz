drop view if exists public.safe_leaderboard;

create table public.safe_leaderboard (
  student_id uuid primary key references public.students(id) on delete cascade,
  workspace_id uuid not null references public.teacher_workspaces(id) on delete cascade,
  full_name text not null,
  group_id uuid not null references public.groups(id) on delete cascade,
  group_name text not null,
  examination_count integer not null default 0 check (examination_count >= 0),
  ranking_score numeric(7,2),
  updated_at timestamptz not null default now()
);

create index safe_leaderboard_workspace_score_idx
  on public.safe_leaderboard(workspace_id, ranking_score desc nulls last);
create index safe_leaderboard_group_score_idx
  on public.safe_leaderboard(group_id, ranking_score desc nulls last);

alter table public.safe_leaderboard enable row level security;
revoke all on public.safe_leaderboard from anon, authenticated;
grant select on public.safe_leaderboard to authenticated;

create policy leaderboard_workspace_read on public.safe_leaderboard
  for select to authenticated
  using (
    workspace_id = coalesce(
      (select private.my_workspace_id()),
      (select s.workspace_id from public.students s where s.id = (select private.my_student_id()))
    )
  );

create function private.refresh_leaderboard_student(target_student_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace uuid;
  target_name text;
  target_group uuid;
  target_group_name text;
  result_count integer;
  result_average numeric(7,2);
begin
  select s.workspace_id, s.full_name, m.group_id, g.name
  into target_workspace, target_name, target_group, target_group_name
  from public.students s
  join public.group_memberships m on m.student_id = s.id and m.active
  join public.groups g on g.id = m.group_id
  where s.id = target_student_id and s.status = 'active';

  if not found then
    delete from public.safe_leaderboard where student_id = target_student_id;
    return;
  end if;

  select count(r.id)::integer, round(avg(r.normalized_score), 2)
  into result_count, result_average
  from public.exam_results r
  where r.student_id = target_student_id;

  insert into public.safe_leaderboard(
    student_id, workspace_id, full_name, group_id, group_name,
    examination_count, ranking_score, updated_at
  ) values (
    target_student_id, target_workspace, target_name, target_group, target_group_name,
    result_count, result_average, now()
  )
  on conflict (student_id) do update set
    workspace_id = excluded.workspace_id,
    full_name = excluded.full_name,
    group_id = excluded.group_id,
    group_name = excluded.group_name,
    examination_count = excluded.examination_count,
    ranking_score = excluded.ranking_score,
    updated_at = now();
end;
$$;

revoke all on function private.refresh_leaderboard_student(uuid) from public, anon, authenticated;

create function private.refresh_leaderboard_from_result()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.refresh_leaderboard_student(coalesce(new.student_id, old.student_id));
  return null;
end;
$$;

create function private.refresh_leaderboard_from_student()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.refresh_leaderboard_student(new.id);
  return new;
end;
$$;

create function private.refresh_leaderboard_from_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op <> 'DELETE' then
    perform private.refresh_leaderboard_student(new.student_id);
  end if;
  if tg_op <> 'INSERT' and (tg_op = 'DELETE' or old.student_id is distinct from new.student_id) then
    perform private.refresh_leaderboard_student(old.student_id);
  end if;
  return null;
end;
$$;

create function private.refresh_leaderboard_from_group()
returns trigger language plpgsql security definer set search_path = '' as $$
declare member record;
begin
  for member in select student_id from public.group_memberships where group_id = new.id and active loop
    perform private.refresh_leaderboard_student(member.student_id);
  end loop;
  return new;
end;
$$;

revoke all on function private.refresh_leaderboard_from_result(),
  private.refresh_leaderboard_from_student(),
  private.refresh_leaderboard_from_membership(),
  private.refresh_leaderboard_from_group()
from public, anon, authenticated;

create trigger leaderboard_after_result
after insert or update or delete on public.exam_results
for each row execute function private.refresh_leaderboard_from_result();

create trigger leaderboard_after_student
after update of full_name, status on public.students
for each row execute function private.refresh_leaderboard_from_student();

create trigger leaderboard_after_membership
after insert or update or delete on public.group_memberships
for each row execute function private.refresh_leaderboard_from_membership();

create trigger leaderboard_after_group_name
after update of name on public.groups
for each row execute function private.refresh_leaderboard_from_group();

select private.refresh_leaderboard_student(id) from public.students;
