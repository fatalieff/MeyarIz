alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'schedule_created',
    'schedule_updated',
    'extra_lesson',
    'exam_created',
    'exam_result',
    'test'
  ));
