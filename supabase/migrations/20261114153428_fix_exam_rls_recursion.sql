create or replace function private.is_teacher_of_examination(target_examination_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.examinations e
    join public.groups g on g.id = e.group_id
    join public.teacher_workspaces w on w.id = g.workspace_id
    where e.id = target_examination_id
      and w.owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_student_of_examination(target_examination_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.exam_results r
    join public.students s on s.id = r.student_id
    where r.examination_id = target_examination_id
      and s.auth_user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_teacher_of_examination(uuid)
from public, anon;
revoke all on function private.is_student_of_examination(uuid)
from public, anon;

grant execute on function private.is_teacher_of_examination(uuid)
to authenticated, service_role;
grant execute on function private.is_student_of_examination(uuid)
to authenticated, service_role;

alter policy student_exams_read on public.examinations
  using ((select private.is_student_of_examination(id)));

alter policy teacher_results_all on public.exam_results
  using ((select private.is_teacher_of_examination(examination_id)))
  with check ((select private.is_teacher_of_examination(examination_id)));
