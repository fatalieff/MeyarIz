alter table public.group_schedules
  add column is_extra boolean not null default false,
  add column session_date date;

alter table public.group_schedules
  add constraint group_schedules_extra_date_check
  check ((is_extra and session_date is not null) or (not is_extra and session_date is null));

alter table public.group_schedules
  drop constraint group_schedules_group_id_weekday_start_time_end_time_key;

create unique index group_schedules_weekly_unique
  on public.group_schedules(group_id, weekday, start_time, end_time)
  where not is_extra;

create unique index group_schedules_extra_unique
  on public.group_schedules(group_id, session_date, start_time, end_time)
  where is_extra;

create index group_schedules_extra_date_idx
  on public.group_schedules(session_date, start_time)
  where is_extra;

comment on column public.group_schedules.is_extra is 'True for a one-time extra lesson instead of a recurring weekly lesson.';
comment on column public.group_schedules.session_date is 'Local Asia/Baku calendar date for a one-time extra lesson.';
