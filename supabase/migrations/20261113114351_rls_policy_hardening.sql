revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

alter policy profile_self_read on public.profiles to authenticated
  using (id = (select auth.uid()));
alter policy teacher_workspace_all on public.teacher_workspaces to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
alter policy teacher_groups_all on public.groups to authenticated;
alter policy student_group_read on public.groups to authenticated
  using (
    exists (
      select 1
      from public.group_memberships m
      join public.students s on s.id = m.student_id
      where m.group_id = groups.id
        and m.active
        and s.auth_user_id = (select auth.uid())
    )
  );
alter policy teacher_students_all on public.students to authenticated;
alter policy student_self_read on public.students to authenticated
  using (auth_user_id = (select auth.uid()));
alter policy teacher_memberships_all on public.group_memberships to authenticated;
alter policy student_membership_read on public.group_memberships to authenticated;
alter policy teacher_schedules_all on public.group_schedules to authenticated;
alter policy student_schedule_read on public.group_schedules to authenticated;
alter policy teacher_contacts_all on public.parent_contacts to authenticated;
alter policy teacher_exams_all on public.examinations to authenticated;
alter policy student_exams_read on public.examinations to authenticated;
alter policy teacher_results_all on public.exam_results to authenticated;
alter policy student_result_read on public.exam_results to authenticated;
alter policy teacher_student_achievements_all on public.student_achievements to authenticated;
alter policy student_achievements_read on public.student_achievements to authenticated;
alter policy teacher_settings_all on public.teacher_settings to authenticated;
alter policy teacher_templates_all on public.examination_templates to authenticated;
