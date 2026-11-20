alter policy student_exams_read on public.examinations
  to authenticated
  using (
    (select private.is_student_of_examination(id))
    or group_id in (
      select membership.group_id
      from public.group_memberships as membership
      where membership.student_id = (select private.my_student_id())
        and membership.active
    )
  );
