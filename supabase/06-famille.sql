-- =====================================================================
-- Mes courses — version famille : AJOUT n°6 — idées et corrections
-- À coller une seule fois dans : SQL Editor > New query > Run
-- Les familles envoient leurs retours depuis Réglages ; l'admin les lit
-- dans Réglages › Familles › (foyer) › Demandes et les marque « traités ».
-- =====================================================================

create table if not exists public.retours (
  id        uuid primary key default gen_random_uuid(),
  famille   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type      text not null check (type in ('idee','correction')),
  message   text not null check (char_length(message) between 3 and 1000),
  contexte  jsonb not null default '{}'::jsonb,
  statut    text not null default 'nouveau' check (statut in ('nouveau','traite')),
  cree_le   timestamptz not null default now(),
  traite_le timestamptz
);
create index if not exists retours_famille_idx on public.retours(famille);
create index if not exists retours_statut_idx on public.retours(statut);
alter table public.retours enable row level security;

-- La famille lit ses propres retours ; l'admin lit tout.
drop policy if exists retours_lire on public.retours;
create policy retours_lire on public.retours
  for select to authenticated using (famille = auth.uid() or public.is_admin());

-- La famille envoie un retour (toujours « nouveau ») ; aucune modification ensuite.
drop policy if exists retours_ajouter on public.retours;
create policy retours_ajouter on public.retours
  for insert to authenticated with check (famille = auth.uid() and statut = 'nouveau');

-- Seul l'admin marque un retour comme traité.
drop policy if exists retours_admin_traiter on public.retours;
create policy retours_admin_traiter on public.retours
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update on public.retours to authenticated;

create or replace function public.retours_traite_le()
returns trigger language plpgsql as $$
begin
  if new.statut is distinct from old.statut then
    new.traite_le := case when new.statut = 'traite' then now() else null end;
  end if;
  return new;
end; $$;

drop trigger if exists retours_traite on public.retours;
create trigger retours_traite before update on public.retours
  for each row execute function public.retours_traite_le();

-- Nouveaux retours en direct dans l'écran admin (pastille rouge).
do $$ begin
  alter publication supabase_realtime add table public.retours;
exception when duplicate_object then null; end $$;
