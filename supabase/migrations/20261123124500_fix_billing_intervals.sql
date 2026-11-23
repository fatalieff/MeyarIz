create or replace function private.generate_billing_invoices(p_as_of date default (now() at time zone 'Asia/Baku')::date)
returns integer language plpgsql security definer set search_path='' as $$
declare r record; model public.billing_model; start_on date; end_on date; key text; made integer:=0; before_count bigint; lesson_count integer; sequence integer;
begin
  for r in select s.id student_id,s.workspace_id,m.group_id,m.joined_at,bs.anchor_day,g.package_lesson_count
    from public.students s join public.group_memberships m on m.student_id=s.id and m.active
    join public.groups g on g.id=m.group_id
    join public.student_billing_settings bs on bs.student_id=s.id and bs.effective_to is null
    where s.status='active' and m.joined_at<=p_as_of
  loop
    select billing_model into model from public.workspace_billing_settings
      where workspace_id=r.workspace_id and effective_from<=p_as_of and (effective_to is null or effective_to>=p_as_of)
      order by effective_from desc limit 1;
    if model='CALENDAR_MONTH' then
      start_on:=date_trunc('month',p_as_of)::date; end_on:=(start_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM');
    elsif model='ANNIVERSARY_MONTH' then
      start_on:=make_date(extract(year from p_as_of)::int,extract(month from p_as_of)::int,
        least(r.anchor_day,extract(day from (date_trunc('month',p_as_of)+interval '1 month'-interval '1 day'))::int));
      if start_on>p_as_of then start_on:=(start_on-interval '1 month')::date; end if;
      end_on:=(make_date(extract(year from (start_on+interval '1 month'))::int,extract(month from (start_on+interval '1 month'))::int,
        least(r.anchor_day,extract(day from (date_trunc('month',start_on+interval '1 month')+interval '1 month'-interval '1 day'))::int))-1);
      key:=to_char(start_on,'YYYY-MM-DD');
    else
      select count(*) into lesson_count from public.lesson_attendance a join public.lesson_occurrences o on o.id=a.occurrence_id
        where a.student_id=r.student_id and a.status='ATTENDED' and o.status='COMPLETED';
      sequence:=greatest(1,(lesson_count/r.package_lesson_count)+1);
      start_on:=p_as_of; end_on:=p_as_of; key:='PKG-'||sequence;
      if sequence>1 and lesson_count < (sequence-1)*r.package_lesson_count then continue; end if;
    end if;
    select count(*) into before_count from public.invoices where student_id=r.student_id and billing_model=model and period_key=key;
    perform private.create_invoice(r.workspace_id,r.student_id,r.group_id,model,key,start_on,end_on,start_on,
      case when model='LESSON_PACKAGE' then sequence else null end,
      case when model='LESSON_PACKAGE' then (sequence-1)*r.package_lesson_count+1 else null end,
      case when model='LESSON_PACKAGE' then sequence*r.package_lesson_count else null end);
    if before_count=0 and exists(select 1 from public.invoices where student_id=r.student_id and billing_model=model and period_key=key) then made:=made+1; end if;
  end loop;
  update public.invoices set status='OVERDUE' where status='UNPAID' and due_date<p_as_of;
  return made;
end $$;
revoke all on function private.generate_billing_invoices(date) from public, anon, authenticated;

create or replace function public.initialize_student_billing(p_student uuid,p_group uuid,p_joined_on date default (now() at time zone 'Asia/Baku')::date)
returns uuid language plpgsql security definer set search_path='' as $$
declare ws uuid; model public.billing_model; result uuid; start_on date; end_on date; key text;
begin
  select s.workspace_id into ws from public.students s where s.id=p_student;
  if ws is null or not (select private.is_teacher_of_workspace(ws)) then raise exception 'İcazə yoxdur'; end if;
  if not exists(select 1 from public.groups where id=p_group and workspace_id=ws) then raise exception 'Qrup workspace-ə aid deyil'; end if;
  insert into public.student_billing_settings(workspace_id,student_id,group_id,effective_from,anchor_day,created_by)
    values(ws,p_student,p_group,p_joined_on,extract(day from p_joined_on)::int,(select auth.uid()))
    on conflict(student_id) where effective_to is null do nothing;
  select billing_model into model from public.workspace_billing_settings where workspace_id=ws and effective_from<=p_joined_on
    and (effective_to is null or effective_to>=p_joined_on) order by effective_from desc limit 1;
  if model is null then raise exception 'Workspace ödəniş modeli təyin edilməyib'; end if;
  if model='CALENDAR_MONTH' then start_on:=date_trunc('month',p_joined_on)::date; end_on:=(start_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM');
  elsif model='ANNIVERSARY_MONTH' then start_on:=p_joined_on; end_on:=(p_joined_on+interval '1 month'-interval '1 day')::date; key:=to_char(start_on,'YYYY-MM-DD');
  else start_on:=p_joined_on; end_on:=p_joined_on; key:='PKG-1'; end if;
  result:=private.create_invoice(ws,p_student,p_group,model,key,start_on,end_on,start_on,case when model='LESSON_PACKAGE' then 1 end,case when model='LESSON_PACKAGE' then 1 end,case when model='LESSON_PACKAGE' then (select package_lesson_count from public.groups where id=p_group) end);
  insert into public.billing_audit_logs(workspace_id,actor_id,action,entity_type,entity_id,new_value)
    values(ws,(select auth.uid()),'student_billing_initialized','student',p_student,jsonb_build_object('model',model,'joined_on',p_joined_on));
  return result;
end $$;
revoke all on function public.initialize_student_billing(uuid,uuid,date) from public, anon;
grant execute on function public.initialize_student_billing(uuid,uuid,date) to authenticated;
