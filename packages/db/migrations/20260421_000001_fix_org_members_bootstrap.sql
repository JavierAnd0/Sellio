-- Fix: the "owners manage members" FOR ALL policy used its USING clause as
-- the implicit WITH CHECK for INSERT.  That means org_role_of() is called
-- BEFORE the row exists, always returning NULL → insert blocked (bootstrap
-- deadlock).  Add an explicit INSERT policy that allows a user to claim
-- ownership of a brand-new org (no existing members yet).

create policy "bootstrap org owner"
  on public.organization_members
  for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from public.organization_members existing
      where existing.org_id = org_id
    )
  );
