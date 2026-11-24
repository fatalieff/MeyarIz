alter table public.notifications
  drop constraint notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'schedule_created',
    'schedule_updated',
    'schedule_cancelled',
    'schedule_occurrence_cancelled',
    'schedule_occurrence_reactivated',
    'extra_lesson',
    'exam_created',
    'exam_result',
    'exam_result_updated',
    'test'
  ));
