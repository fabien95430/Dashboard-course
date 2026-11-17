-- =====================================================================
-- Mes courses — version famille : AJOUT n°2
-- Demandes d'ajout intégrées par l'admin + infos pour améliorer les données
-- À coller une seule fois dans : SQL Editor > New query > Run
-- (le premier script supabase/01-famille.sql doit déjà avoir été exécuté)
-- =====================================================================

-- ---------- 1. Les ajouts des familles deviennent des DEMANDES ----------
-- La famille demande ; seul l'admin intègre (OpenAI / ChatGPT) ou refuse.
alter table public.catalogue_perso
  add column if not exists statut text not null default 'en_attente'
    check (statut in ('en_attente','integre','refuse')),
  add column if not exists traite_le timestamptz;

-- Seul l'admin peut changer le statut d'une demande
create or replace function public.protege_statut()
returns trigger language plpgsql as $$
begin
  if new.statut is distinct from old.statut and not public.is_admin() then
    raise exception 'Seul l''administrateur peut intégrer ou refuser une demande';
  end if;
  if new.statut is distinct from old.statut then new.traite_le := now(); end if;
  return new;
end; $$;
drop trigger if exists catalogue_perso_statut on public.catalogue_perso;
create trigger catalogue_perso_statut before update on public.catalogue_perso
  for each row execute function public.protege_statut();

-- L'admin voit toutes les demandes et peut les marquer intégrées / refusées
drop policy if exists catalogue_admin_lire on public.catalogue_perso;
create policy catalogue_admin_lire on public.catalogue_perso
  for select to authenticated using (public.is_admin());
drop policy if exists catalogue_admin_traiter on public.catalogue_perso;
create policy catalogue_admin_traiter on public.catalogue_perso
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- 2. Plats modifiés : lecture seule pour l'admin ----------
-- La modification reste une couche par-dessus le plat de base (jamais modifié).
drop policy if exists perso_admin_lire on public.personnalisations;
create policy perso_admin_lire on public.personnalisations
  for select to authenticated using (public.is_admin());

-- ---------- 3. Historique de courses (produits cochés) ----------
create table if not exists public.achats (
  id        uuid primary key default gen_random_uuid(),
  famille   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type      text not null default 'produit' check (type in ('produit','plat')),
  nom       text not null,
  quantite  text,
  categorie text,
  coche_le  timestamptz not null default now()
);
create index if not exists achats_famille_idx on public.achats(famille, coche_le desc);
alter table public.achats enable row level security;

drop policy if exists achats_famille_ajouter on public.achats;
create policy achats_famille_ajouter on public.achats
  for insert to authenticated with check (famille = auth.uid());
drop policy if exists achats_famille_lire on public.achats;
create policy achats_famille_lire on public.achats
  for select to authenticated using (famille = auth.uid() or public.is_admin());
-- pas de modification ni de suppression par les familles

grant select, insert on public.achats to authenticated;
grant update on public.catalogue_perso to authenticated;

-- ---------- 4. Nouvelles demandes en direct dans l'écran admin ----------
do $$ begin
  alter publication supabase_realtime add table public.catalogue_perso;
exception when duplicate_object then null; end $$;
