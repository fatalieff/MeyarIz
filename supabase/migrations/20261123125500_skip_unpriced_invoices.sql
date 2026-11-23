create or replace function private.create_invoice(
  p_workspace uuid,p_student uuid,p_group uuid,p_model public.billing_model,p_key text,
  p_start date,p_end date,p_due date,p_package_sequence integer default null,
  p_lesson_from integer default null,p_lesson_to integer default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare amounts record; invoice_id uuid;
begin
  if exists(select 1 from public.student_pauses where student_id=p_student and kind='UNPAID'
    and starts_on<=p_start and (ends_on is null or ends_on>=p_end)) then return null; end if;
  select * into amounts from private.invoice_amount(p_student,p_group,p_start);
  if amounts.base_cents <= 0 then return null; end if;
  insert into public.invoices(workspace_id,student_id,group_id,billing_model,period_key,period_start,period_end,due_date,
    amount_cents,base_amount_cents,discount_cents,package_sequence,lesson_from,lesson_to)
  values(p_workspace,p_student,p_group,p_model,p_key,p_start,p_end,p_due,amounts.total_cents,amounts.base_cents,
    amounts.discount_cents,p_package_sequence,p_lesson_from,p_lesson_to)
  on conflict(student_id,billing_model,period_key) do nothing returning id into invoice_id;
  if invoice_id is not null then
    update public.student_billing_settings set discount_applied_at=p_start
      where student_id=p_student and effective_to is null and discount_frequency='ONE_TIME' and discount_applied_at is null;
    perform private.apply_student_credit(p_student);
  end if;
  return invoice_id;
end $$;
revoke all on function private.create_invoice(uuid,uuid,uuid,public.billing_model,text,date,date,date,integer,integer,integer) from public, anon, authenticated;
