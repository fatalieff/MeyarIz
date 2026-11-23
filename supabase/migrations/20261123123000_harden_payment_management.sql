-- Follow-up hardening after advisor review: financial and billing writes are RPC-only.
drop policy if exists student_billing_teacher_write on public.student_billing_settings;
drop policy if exists pauses_teacher_write on public.student_pauses;
drop policy if exists lessons_teacher_write on public.lesson_occurrences;
drop policy if exists attendance_teacher_write on public.lesson_attendance;

revoke insert, update, delete, truncate on public.student_billing_settings, public.student_pauses,
  public.lesson_occurrences, public.lesson_attendance from authenticated;

-- Cover foreign keys used by tenant checks, audit queries, and delete cascades.
create index if not exists student_billing_group_idx on public.student_billing_settings(group_id);
create index if not exists student_billing_created_by_idx on public.student_billing_settings(created_by);
create index if not exists workspace_billing_created_by_idx on public.workspace_billing_settings(created_by);
create index if not exists invoices_group_idx on public.invoices(group_id);
create index if not exists payments_created_by_idx on public.payments(created_by);
create index if not exists payments_voided_by_idx on public.payments(voided_by) where voided_by is not null;
create index if not exists allocations_workspace_idx on public.payment_allocations(workspace_id);
create index if not exists allocations_applied_by_idx on public.payment_allocations(applied_by) where applied_by is not null;
create index if not exists pauses_workspace_idx on public.student_pauses(workspace_id);
create index if not exists pauses_created_by_idx on public.student_pauses(created_by);
create index if not exists adjustments_workspace_idx on public.billing_adjustments(workspace_id);
create index if not exists adjustments_invoice_idx on public.billing_adjustments(invoice_id) where invoice_id is not null;
create index if not exists adjustments_created_by_idx on public.billing_adjustments(created_by);
create index if not exists occurrences_workspace_idx on public.lesson_occurrences(workspace_id);
create index if not exists occurrences_schedule_idx on public.lesson_occurrences(schedule_id) where schedule_id is not null;
create index if not exists occurrences_created_by_idx on public.lesson_occurrences(created_by) where created_by is not null;
create index if not exists attendance_workspace_idx on public.lesson_attendance(workspace_id);
create index if not exists attendance_marked_by_idx on public.lesson_attendance(marked_by);
create index if not exists billing_audit_actor_idx on public.billing_audit_logs(actor_id) where actor_id is not null;

-- Existing students get billing terms, but no historical invoice is invented. The next
-- idempotent generator run creates the current/future invoice after group prices are set.
insert into public.student_billing_settings(
  workspace_id,student_id,group_id,effective_from,anchor_day,created_by
)
select s.workspace_id,s.id,m.group_id,m.joined_at,extract(day from m.joined_at)::smallint,w.owner_id
from public.students s
join public.group_memberships m on m.student_id=s.id and m.active
join public.teacher_workspaces w on w.id=s.workspace_id
where s.status='active'
  and not exists(select 1 from public.student_billing_settings b where b.student_id=s.id and b.effective_to is null);
