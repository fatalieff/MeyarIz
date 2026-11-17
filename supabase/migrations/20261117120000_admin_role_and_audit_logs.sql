-- Admin rolu və audit qeydləri miqrasiyası

-- 1. public.user_role tipinə 'admin' dəyəri əlavə et
alter type public.user_role add value if not exists 'admin';

-- 2. profiles cədvəlinə status sütunu əlavə et
alter table public.profiles
add column if not exists status text not null default 'active'
check (status in ('active','suspended'));

-- 3. Admin audit qeydləri cədvəli
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_teacher_id uuid references public.profiles(id) on delete set null,
  summary text not null,
  status text not null default 'success' check (status in ('success','failure')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- İndekslər
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_target_idx on public.admin_audit_logs(target_teacher_id, created_at desc);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs(action, created_at desc);
create index if not exists profiles_role_status_idx on public.profiles(role, status);

-- 4. İnzibatçı yoxlama funksiyası
create or replace function private.is_admin()
returns boolean stable language sql security definer set search_path='' as $$
  select exists(
    select 1 from public.profiles
    where id = (select auth.uid()) and role::text = 'admin' and status = 'active'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- 5. handle_new_user triggerini admin roluna uyğunlaşdır
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  resolved_role public.user_role;
begin
  begin
    resolved_role := (new.raw_app_meta_data->>'role')::public.user_role;
  exception when others then
    resolved_role := 'student'::public.user_role;
  end;

  insert into public.profiles (id, role, full_name, status)
  values (
    new.id,
    coalesce(resolved_role, 'student'::public.user_role),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'active'
  )
  on conflict (id) do update set
    role = coalesce(excluded.role, profiles.role),
    full_name = coalesce(excluded.full_name, profiles.full_name);

  return new;
end $$;

-- 6. RLS: admin_audit_logs
alter table public.admin_audit_logs enable row level security;

drop policy if exists admin_audit_logs_read on public.admin_audit_logs;
create policy admin_audit_logs_read on public.admin_audit_logs
  for select to authenticated
  using ((select private.is_admin()));

drop policy if exists admin_audit_logs_insert on public.admin_audit_logs;
create policy admin_audit_logs_insert on public.admin_audit_logs
  for insert to authenticated
  with check ((select private.is_admin()) and admin_id = (select auth.uid()));

-- 7. Təhlükəsiz Xülasə RPC funksiyaları (Admin üçün ümumi saylar, heç bir şagird PII qaytarmır)

-- Dashboard icmal statistikası
create or replace function public.admin_get_overview_stats()
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_total_teachers int;
  v_active_teachers int;
  v_suspended_teachers int;
  v_total_workspaces int;
  v_total_students int;
  v_total_groups int;
  v_total_exams int;
begin
  if not (select private.is_admin()) then
    raise exception 'İcazə verilmədi: yalnız aktiv inzibatçılar daxil ola bilər' using errcode = '42501';
  end if;

  select count(*) into v_total_teachers from public.profiles where role::text = 'teacher';
  select count(*) into v_active_teachers from public.profiles where role::text = 'teacher' and status = 'active';
  select count(*) into v_suspended_teachers from public.profiles where role::text = 'teacher' and status = 'suspended';
  select count(*) into v_total_workspaces from public.teacher_workspaces;
  select count(*) into v_total_students from public.students;
  select count(*) into v_total_groups from public.groups;
  select count(*) into v_total_exams from public.examinations;

  return jsonb_build_object(
    'total_teachers', v_total_teachers,
    'active_teachers', v_active_teachers,
    'suspended_teachers', v_suspended_teachers,
    'total_workspaces', v_total_workspaces,
    'total_students', v_total_students,
    'total_groups', v_total_groups,
    'total_exams', v_total_exams
  );
end $$;

revoke all on function public.admin_get_overview_stats() from public, anon;
grant execute on function public.admin_get_overview_stats() to authenticated, service_role;

-- Müəllimlər siyahısı və say xülasəsi
create or replace function public.admin_get_teachers_summary()
returns table (
  id uuid,
  full_name text,
  email text,
  workspace_id uuid,
  workspace_name text,
  status text,
  created_at timestamptz,
  student_count bigint,
  group_count bigint,
  exam_count bigint
) language plpgsql security definer set search_path='' as $$
begin
  if not (select private.is_admin()) then
    raise exception 'İcazə verilmədi: yalnız aktiv inzibatçılar daxil ola bilər' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.full_name,
    u.email::text,
    w.id as workspace_id,
    coalesce(w.name, 'Müəllim İş Sahəsi') as workspace_name,
    p.status,
    p.created_at,
    coalesce(st_count.cnt, 0) as student_count,
    coalesce(gp_count.cnt, 0) as group_count,
    coalesce(ex_count.cnt, 0) as exam_count
  from public.profiles p
  left join auth.users u on u.id = p.id
  left join public.teacher_workspaces w on w.owner_id = p.id
  left join lateral (
    select count(*) as cnt from public.students s where s.workspace_id = w.id
  ) st_count on true
  left join lateral (
    select count(*) as cnt from public.groups g where g.workspace_id = w.id
  ) gp_count on true
  left join lateral (
    select count(*) as cnt from public.examinations e
    join public.groups g2 on g2.id = e.group_id
    where g2.workspace_id = w.id
  ) ex_count on true
  where p.role::text = 'teacher'
  order by p.created_at desc;
end $$;

revoke all on function public.admin_get_teachers_summary() from public, anon;
grant execute on function public.admin_get_teachers_summary() to authenticated, service_role;

-- Tək müəllim detalları xülasəsi
create or replace function public.admin_get_teacher_details(target_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_teacher record;
  v_student_count bigint;
  v_group_count bigint;
  v_exam_count bigint;
begin
  if not (select private.is_admin()) then
    raise exception 'İcazə verilmədi: yalnız aktiv inzibatçılar daxil ola bilər' using errcode = '42501';
  end if;

  select
    p.id,
    p.full_name,
    u.email,
    w.id as workspace_id,
    w.name as workspace_name,
    p.status,
    p.created_at,
    u.last_sign_in_at
  into v_teacher
  from public.profiles p
  left join auth.users u on u.id = p.id
  left join public.teacher_workspaces w on w.owner_id = p.id
  where p.id = target_id and p.role::text = 'teacher';

  if v_teacher.id is null then
    return null;
  end if;

  select count(*) into v_student_count from public.students where workspace_id = v_teacher.workspace_id;
  select count(*) into v_group_count from public.groups where workspace_id = v_teacher.workspace_id;
  select count(*) into v_exam_count
  from public.examinations e
  join public.groups g on g.id = e.group_id
  where g.workspace_id = v_teacher.workspace_id;

  return jsonb_build_object(
    'id', v_teacher.id,
    'full_name', v_teacher.full_name,
    'email', v_teacher.email,
    'workspace_id', v_teacher.workspace_id,
    'workspace_name', v_teacher.workspace_name,
    'status', v_teacher.status,
    'created_at', v_teacher.created_at,
    'last_sign_in_at', v_teacher.last_sign_in_at,
    'student_count', v_student_count,
    'group_count', v_group_count,
    'exam_count', v_exam_count
  );
end $$;

revoke all on function public.admin_get_teacher_details(uuid) from public, anon;
grant execute on function public.admin_get_teacher_details(uuid) to authenticated, service_role;
