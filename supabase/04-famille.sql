-- =====================================================================
-- Mes courses — version famille : AJOUT n°4
-- Écran admin « Familles » : liste des foyers (nom = identifiant).
-- À coller une seule fois dans : SQL Editor > New query > Run
-- =====================================================================
create or replace function public.familles()
returns table (id uuid, email text)
language sql stable security definer set search_path = public, auth as $$
  select u.id, u.email::text
  from auth.users u
  where public.is_admin()
    and not exists (select 1 from public.admins a where a.user_id = u.id)
  order by u.email;
$$;
revoke all on function public.familles() from public, anon;
grant execute on function public.familles() to authenticated;
