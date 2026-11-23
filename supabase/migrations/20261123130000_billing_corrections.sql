create or replace function public.void_payment(p_payment uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare pay public.payments; allocation record;
begin
  select * into pay from public.payments where id=p_payment for update;
  if pay.id is null or not (select private.is_teacher_of_workspace(pay.workspace_id)) then raise exception 'İcazə yoxdur'; end if;
  if pay.voided_at is not null then raise exception 'Ödəniş artıq ləğv edilib'; end if;
  if length(trim(p_reason))<3 then raise exception 'Ləğv səbəbini daxil edin'; end if;
  update public.payments set voided_at=now(),voided_by=(select auth.uid()),void_reason=trim(p_reason) where id=p_payment;
  for allocation in select invoice_id from public.payment_allocations where payment_id=p_payment loop
    perform private.refresh_invoice(allocation.invoice_id);
  end loop;
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,old_value,new_value)
    values(pay.workspace_id,(select auth.uid()),'payment_voided','payment',p_payment,jsonb_build_object('amount_cents',pay.amount_cents),jsonb_build_object('reason',trim(p_reason)));
end $$;
revoke all on function public.void_payment(uuid,text) from public, anon;
grant execute on function public.void_payment(uuid,text) to authenticated;

create or replace function public.add_invoice_adjustment(p_invoice uuid,p_kind public.adjustment_kind,p_amount_cents bigint,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare inv public.invoices; adjustment_id uuid; applied bigint;
begin
  select * into inv from public.invoices where id=p_invoice for update;
  if inv.id is null or not (select private.is_teacher_of_workspace(inv.workspace_id)) then raise exception 'İcazə yoxdur'; end if;
  if inv.status='VOID' then raise exception 'Ləğv edilmiş hesaba düzəliş olmaz'; end if;
  if p_amount_cents<=0 or length(trim(p_reason))<3 then raise exception 'Məbləğ və səbəb düzgün deyil'; end if;
  if p_kind='CREDIT' then
    applied:=least(p_amount_cents,inv.amount_cents-inv.paid_cents);
    if applied<=0 then raise exception 'Tam ödənilmiş hesaba kredit tətbiq edilə bilməz'; end if;
    update public.invoices set amount_cents=amount_cents-applied where id=p_invoice;
  else
    applied:=p_amount_cents;
    update public.invoices set amount_cents=amount_cents+applied,base_amount_cents=base_amount_cents+applied where id=p_invoice;
  end if;
  insert into public.billing_adjustments(workspace_id,student_id,invoice_id,kind,amount_cents,reason,created_by)
    values(inv.workspace_id,inv.student_id,p_invoice,p_kind,applied,trim(p_reason),(select auth.uid())) returning id into adjustment_id;
  perform private.refresh_invoice(p_invoice);
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,old_value,new_value)
    values(inv.workspace_id,(select auth.uid()),'invoice_adjusted','invoice',p_invoice,jsonb_build_object('amount_cents',inv.amount_cents),jsonb_build_object('kind',p_kind,'adjustment_cents',applied,'reason',trim(p_reason)));
  return adjustment_id;
end $$;
revoke all on function public.add_invoice_adjustment(uuid,public.adjustment_kind,bigint,text) from public, anon;
grant execute on function public.add_invoice_adjustment(uuid,public.adjustment_kind,bigint,text) to authenticated;
