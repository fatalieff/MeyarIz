create or replace function public.delete_student_account(
  target_student_id uuid,
  target_workspace_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_auth_user_id uuid;
begin
  select s.auth_user_id
  into target_auth_user_id
  from public.students s
  where s.id = target_student_id
    and s.workspace_id = target_workspace_id
  for update;

  if not found then
    return false;
  end if;

  delete from public.exam_results
  where student_id = target_student_id;

  delete from public.group_memberships
  where student_id = target_student_id;

  delete from public.students
  where id = target_student_id
    and workspace_id = target_workspace_id;

  if target_auth_user_id is not null then
    delete from auth.users
    where id = target_auth_user_id;
  end if;

  return true;
end;
$$;

revoke all on function public.delete_student_account(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.delete_student_account(uuid, uuid)
to service_role;
