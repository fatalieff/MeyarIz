revoke update on table public.profiles from authenticated;
grant update(full_name) on table public.profiles to authenticated;

drop policy if exists profile_self_update on public.profiles;

create policy profile_self_update
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
