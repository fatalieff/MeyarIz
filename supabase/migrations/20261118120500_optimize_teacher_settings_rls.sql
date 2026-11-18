drop policy if exists teacher_settings_all on public.teacher_settings;
drop policy if exists student_settings_read on public.teacher_settings;

create policy teacher_settings_read on public.teacher_settings
  for select to authenticated
  using (
    (select private.is_teacher_of_workspace(workspace_id))
    or workspace_id = (
      select s.workspace_id
      from public.students s
      where s.id = (select private.my_student_id())
    )
  );

create policy teacher_settings_insert on public.teacher_settings
  for insert to authenticated
  with check ((select private.is_teacher_of_workspace(workspace_id)));

create policy teacher_settings_update on public.teacher_settings
  for update to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)))
  with check ((select private.is_teacher_of_workspace(workspace_id)));

create policy teacher_settings_delete on public.teacher_settings
  for delete to authenticated
  using ((select private.is_teacher_of_workspace(workspace_id)));
