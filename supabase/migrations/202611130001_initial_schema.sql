create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create type public.user_role as enum ('teacher','student');
create type public.record_status as enum ('active','archived');
create type public.contact_type as enum ('mother','father','guardian');
create type public.exam_status as enum ('draft','published','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null check (length(trim(full_name)) >= 2),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.teacher_workspaces (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references public.profiles(id),
  name text not null default 'MathRank', timezone text not null default 'Asia/Baku',
  birthday_welcome_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.groups (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.teacher_workspaces(id),
  name text not null, description text, preparation_level text, color text not null default '#4f5fe7', icon text,
  status public.record_status not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id,name)
);
create table public.group_schedules (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  weekday smallint not null check(weekday between 1 and 7), start_time time not null, end_time time not null, location text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(end_time > start_time), unique(group_id,weekday,start_time,end_time)
);
create table public.students (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.teacher_workspaces(id), auth_user_id uuid unique references public.profiles(id),
  full_name text not null, email text, phone text, preparation_level text, date_of_birth date, private_notes text,
  status public.record_status not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id,email)
);
create table public.group_memberships (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id), group_id uuid not null references public.groups(id),
  joined_at date not null default current_date, left_at date, active boolean not null default true, created_at timestamptz not null default now()
);
create unique index one_active_group_per_student on public.group_memberships(student_id) where active;
create table public.parent_contacts (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  contact_type public.contact_type not null, full_name text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(student_id,contact_type)
);
create table public.examination_templates (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.teacher_workspaces(id), title text not null, created_at timestamptz not null default now());
create table public.examinations (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id), shared_template_id uuid references public.examination_templates(id),
  title text not null, exam_date date not null, total_questions integer not null check(total_questions > 0 and total_questions <= 500), description text, category text,
  status public.exam_status not null default 'published', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.exam_results (
  id uuid primary key default gen_random_uuid(), examination_id uuid not null references public.examinations(id) on delete cascade, student_id uuid not null references public.students(id),
  correct_answers integer not null check(correct_answers >= 0), normalized_score numeric(7,4) not null check(normalized_score between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(examination_id,student_id)
);
create table public.achievements (id uuid primary key default gen_random_uuid(), code text not null unique, name_az text not null, description_az text not null, icon text not null, threshold jsonb not null default '{}');
create table public.student_achievements (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade, achievement_id uuid not null references public.achievements(id), examination_id uuid references public.examinations(id), earned_at timestamptz not null default now(), unique(student_id,achievement_id,examination_id));
create unique index one_periodless_achievement on public.student_achievements(student_id,achievement_id) where examination_id is null;
create table public.teacher_settings (
  workspace_id uuid primary key references public.teacher_workspaces(id) on delete cascade, theme text not null default 'system', default_ranking_period text not null default 'last_3',
  global_ranking_visible boolean not null default true, private_display_names boolean not null default false, week_starts_on smallint not null default 1 check(week_starts_on between 1 and 7), updated_at timestamptz not null default now()
);

create index groups_workspace_idx on public.groups(workspace_id,status);
create index students_workspace_idx on public.students(workspace_id,status);
create index memberships_group_idx on public.group_memberships(group_id,active);
create index exams_group_date_idx on public.examinations(group_id,exam_date desc);
create index results_student_idx on public.exam_results(student_id,created_at desc);
create index schedules_weekday_idx on public.group_schedules(weekday,start_time);
create index memberships_student_idx on public.group_memberships(student_id);
create index examination_templates_workspace_idx on public.examination_templates(workspace_id);
create index examinations_shared_template_idx on public.examinations(shared_template_id) where shared_template_id is not null;
create index student_achievements_achievement_idx on public.student_achievements(achievement_id);
create index student_achievements_exam_idx on public.student_achievements(examination_id) where examination_id is not null;

create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create function private.calculate_exam_score() returns trigger language plpgsql security definer set search_path='' as $$
declare total integer; begin select total_questions into total from public.examinations where id=new.examination_id; if total is null then raise exception 'Examination not found'; end if; if new.correct_answers > total then raise exception 'Correct answers exceed total questions'; end if; new.normalized_score=round((new.correct_answers::numeric/total)*100,4); return new; end $$;
revoke all on function private.calculate_exam_score() from public, anon, authenticated;
create trigger score_result before insert or update of correct_answers,examination_id on public.exam_results for each row execute function private.calculate_exam_score();

create function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,role,full_name) values(new.id,coalesce((new.raw_app_meta_data->>'role')::public.user_role,'student'),coalesce(new.raw_user_meta_data->>'full_name',split_part(coalesce(new.email,''),'@',1))); return new; end $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create function private.my_workspace_id() returns uuid stable language sql security definer set search_path='' as $$ select id from public.teacher_workspaces where owner_id=(select auth.uid()) $$;
create function private.my_student_id() returns uuid stable language sql security definer set search_path='' as $$ select id from public.students where auth_user_id=(select auth.uid()) $$;
create function private.is_teacher_of_workspace(target uuid) returns boolean stable language sql security definer set search_path='' as $$ select exists(select 1 from public.teacher_workspaces where id=target and owner_id=(select auth.uid())) $$;
revoke all on function private.my_workspace_id(), private.my_student_id(), private.is_teacher_of_workspace(uuid) from public, anon;
grant execute on function private.my_workspace_id(), private.my_student_id(), private.is_teacher_of_workspace(uuid) to authenticated, service_role;

alter table public.profiles enable row level security; alter table public.teacher_workspaces enable row level security; alter table public.groups enable row level security;
alter table public.group_schedules enable row level security; alter table public.students enable row level security; alter table public.group_memberships enable row level security;
alter table public.parent_contacts enable row level security; alter table public.examination_templates enable row level security; alter table public.examinations enable row level security;
alter table public.exam_results enable row level security; alter table public.achievements enable row level security; alter table public.student_achievements enable row level security; alter table public.teacher_settings enable row level security;

create policy profile_self_read on public.profiles for select using(id=auth.uid());
create policy teacher_workspace_all on public.teacher_workspaces for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy teacher_groups_all on public.groups for all using((select private.is_teacher_of_workspace(workspace_id))) with check((select private.is_teacher_of_workspace(workspace_id)));
create policy student_group_read on public.groups for select using(exists(select 1 from public.group_memberships m join public.students s on s.id=m.student_id where m.group_id=groups.id and m.active and s.auth_user_id=auth.uid()));
create policy teacher_students_all on public.students for all using((select private.is_teacher_of_workspace(workspace_id))) with check((select private.is_teacher_of_workspace(workspace_id)));
create policy student_self_read on public.students for select using(auth_user_id=auth.uid());
create policy teacher_memberships_all on public.group_memberships for all using(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id)))) with check(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id))));
create policy student_membership_read on public.group_memberships for select using(student_id=(select private.my_student_id()));
create policy teacher_schedules_all on public.group_schedules for all using(exists(select 1 from public.groups g where g.id=group_id and (select private.is_teacher_of_workspace(g.workspace_id)))) with check(exists(select 1 from public.groups g where g.id=group_id and (select private.is_teacher_of_workspace(g.workspace_id))));
create policy student_schedule_read on public.group_schedules for select using(exists(select 1 from public.group_memberships m where m.group_id=group_schedules.group_id and m.student_id=(select private.my_student_id()) and m.active));
create policy teacher_contacts_all on public.parent_contacts for all using(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id)))) with check(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id))));
create policy teacher_exams_all on public.examinations for all using(exists(select 1 from public.groups g where g.id=group_id and (select private.is_teacher_of_workspace(g.workspace_id)))) with check(exists(select 1 from public.groups g where g.id=group_id and (select private.is_teacher_of_workspace(g.workspace_id))));
create policy student_exams_read on public.examinations for select using(exists(select 1 from public.exam_results r where r.examination_id=examinations.id and r.student_id=(select private.my_student_id())));
create policy teacher_results_all on public.exam_results for all using(exists(select 1 from public.examinations e join public.groups g on g.id=e.group_id where e.id=examination_id and (select private.is_teacher_of_workspace(g.workspace_id)))) with check(exists(select 1 from public.examinations e join public.groups g on g.id=e.group_id where e.id=examination_id and (select private.is_teacher_of_workspace(g.workspace_id))));
create policy student_result_read on public.exam_results for select using(student_id=(select private.my_student_id()));
create policy achievement_read on public.achievements for select to authenticated using(true);
create policy teacher_student_achievements_all on public.student_achievements for all using(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id)))) with check(exists(select 1 from public.students s where s.id=student_id and (select private.is_teacher_of_workspace(s.workspace_id))));
create policy student_achievements_read on public.student_achievements for select using(student_id=(select private.my_student_id()));
create policy teacher_settings_all on public.teacher_settings for all using((select private.is_teacher_of_workspace(workspace_id))) with check((select private.is_teacher_of_workspace(workspace_id)));
create policy teacher_templates_all on public.examination_templates for all using((select private.is_teacher_of_workspace(workspace_id))) with check((select private.is_teacher_of_workspace(workspace_id)));

create view public.safe_leaderboard with (security_barrier=true) as
select s.workspace_id,s.id student_id,s.full_name,g.id group_id,g.name group_name,count(r.id)::int examination_count,round(avg(r.normalized_score),2) ranking_score
from public.students s join public.group_memberships m on m.student_id=s.id and m.active join public.groups g on g.id=m.group_id left join public.exam_results r on r.student_id=s.id
where s.status='active' and s.workspace_id=coalesce((select private.my_workspace_id()),(select workspace_id from public.students where id=(select private.my_student_id())))
group by s.workspace_id,s.id,s.full_name,g.id,g.name;
revoke all on public.safe_leaderboard from anon;
grant select on public.safe_leaderboard to authenticated;

insert into public.achievements(code,name_az,description_az,icon,threshold) values
('perfect_score','Mükəmməl nəticə','Sınaqda 100% nəticə əldə et','target','{"score":100}'),
('consistency','Sabit performans','Ardıcıl üç sınaqda ən azı 80% nəticə göstər','activity','{"score":80,"count":3}'),
('rising_star','Yüksələn ulduz','Son müqayisəli sınaqlarda ən böyük inkişafı göstər','trending-up','{}'),
('math_champion','Riyaziyyat çempionu','Tamamlanmış dövrdə qrup reytinqində birinci ol','trophy','{"rank":1}');

create function private.award_result_achievements() returns trigger language plpgsql security definer set search_path='' as $$
declare perfect_id uuid; consistency_id uuid; recent_count integer;
begin
  select id into perfect_id from public.achievements where code='perfect_score';
  select id into consistency_id from public.achievements where code='consistency';
  if new.normalized_score=100 then
    insert into public.student_achievements(student_id,achievement_id,examination_id) values(new.student_id,perfect_id,new.examination_id) on conflict do nothing;
  end if;
  select count(*) into recent_count from (
    select r.normalized_score from public.exam_results r join public.examinations e on e.id=r.examination_id
    where r.student_id=new.student_id order by e.exam_date desc limit 3
  ) recent where normalized_score>=80;
  if recent_count=3 then
    insert into public.student_achievements(student_id,achievement_id) values(new.student_id,consistency_id) on conflict do nothing;
  end if;
  return new;
end $$;
revoke all on function private.award_result_achievements() from public, anon, authenticated;
create trigger award_after_result after insert or update of correct_answers on public.exam_results for each row execute function private.award_result_achievements();

create trigger touch_profiles before update on public.profiles for each row execute function private.touch_updated_at();
create trigger touch_workspaces before update on public.teacher_workspaces for each row execute function private.touch_updated_at();
create trigger touch_groups before update on public.groups for each row execute function private.touch_updated_at();
create trigger touch_schedules before update on public.group_schedules for each row execute function private.touch_updated_at();
create trigger touch_students before update on public.students for each row execute function private.touch_updated_at();
create trigger touch_contacts before update on public.parent_contacts for each row execute function private.touch_updated_at();
create trigger touch_examinations before update on public.examinations for each row execute function private.touch_updated_at();
create trigger touch_results before update on public.exam_results for each row execute function private.touch_updated_at();
create trigger touch_settings before update on public.teacher_settings for each row execute function private.touch_updated_at();
