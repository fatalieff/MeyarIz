alter table public.teacher_settings
  drop constraint if exists teacher_settings_default_ranking_period_check;

alter table public.teacher_settings
  add constraint teacher_settings_default_ranking_period_check
  check (default_ranking_period in ('last_3', 'month', 'all'));

create policy student_settings_read on public.teacher_settings
  for select to authenticated
  using (
    workspace_id = (
      select s.workspace_id
      from public.students s
      where s.id = (select private.my_student_id())
    )
  );

drop policy if exists leaderboard_workspace_read on public.safe_leaderboard;
create policy leaderboard_workspace_read on public.safe_leaderboard
  for select to authenticated
  using (
    workspace_id = (select private.my_workspace_id())
    or (
      workspace_id = (
        select s.workspace_id
        from public.students s
        where s.id = (select private.my_student_id())
      )
      and exists (
        select 1
        from public.teacher_settings settings
        where settings.workspace_id = safe_leaderboard.workspace_id
          and settings.global_ranking_visible
      )
    )
  );

create or replace function private.refresh_leaderboard_student(target_student_id uuid)
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
  ranking_period text;
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

  select coalesce(settings.default_ranking_period, 'last_3')
  into ranking_period
  from public.teacher_settings settings
  where settings.workspace_id = target_workspace;

  ranking_period := coalesce(ranking_period, 'last_3');

  select count(scoped.normalized_score)::integer, round(avg(scoped.normalized_score), 2)
  into result_count, result_average
  from (
    select r.normalized_score
    from public.exam_results r
    join public.examinations e on e.id = r.examination_id
    where r.student_id = target_student_id
      and (
        ranking_period <> 'month'
        or (
          e.exam_date >= date_trunc('month', now() at time zone 'Asia/Baku')::date
          and e.exam_date < (date_trunc('month', now() at time zone 'Asia/Baku') + interval '1 month')::date
        )
      )
    order by e.exam_date desc, r.updated_at desc, r.id desc
    limit case when ranking_period = 'last_3' then 3 else null end
  ) scoped;

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

create or replace function private.refresh_leaderboard_from_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  student record;
begin
  if old.default_ranking_period is distinct from new.default_ranking_period then
    for student in
      select id from public.students where workspace_id = new.workspace_id
    loop
      perform private.refresh_leaderboard_student(student.id);
    end loop;
  end if;
  return new;
end;
$$;

create or replace function private.refresh_leaderboard_from_exam_date()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  result record;
begin
  if old.exam_date is distinct from new.exam_date then
    for result in
      select student_id from public.exam_results where examination_id = new.id
    loop
      perform private.refresh_leaderboard_student(result.student_id);
    end loop;
  end if;
  return new;
end;
$$;

revoke all on function private.refresh_leaderboard_from_settings(),
  private.refresh_leaderboard_from_exam_date()
from public, anon, authenticated;

drop trigger if exists leaderboard_after_settings on public.teacher_settings;
create trigger leaderboard_after_settings
after update of default_ranking_period on public.teacher_settings
for each row execute function private.refresh_leaderboard_from_settings();

drop trigger if exists leaderboard_after_exam_date on public.examinations;
create trigger leaderboard_after_exam_date
after update of exam_date on public.examinations
for each row execute function private.refresh_leaderboard_from_exam_date();

select private.refresh_leaderboard_student(id) from public.students;
