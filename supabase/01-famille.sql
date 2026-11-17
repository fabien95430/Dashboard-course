-- =====================================================================
-- Mes courses — version famille : tables + règles d'accès (Supabase)
-- À coller une seule fois dans : SQL Editor > New query > Run
-- Un compte Supabase = une famille (identifiant partagé entre ses membres)
-- =====================================================================

-- ---------- Administrateurs (toi) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
-- aucune policy : personne ne lit/modifie cette table depuis l'app

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Mise à jour automatique de maj_le ----------
create or replace function public.touch_maj_le()
returns trigger language plpgsql as $$
begin new.maj_le := now(); return new; end; $$;

-- ---------- Liste de la famille ----------
create table if not exists public.articles (
  id         uuid primary key default gen_random_uuid(),
  famille    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type       text not null default 'produit' check (type in ('produit','plat')),
  nom        text not null,
  quantite   text,
  categorie  text,
  coche      boolean not null default false,
  cree_le    timestamptz not null default now(),
  maj_le     timestamptz not null default now()
);
create index if not exists articles_famille_idx on public.articles(famille);
create trigger articles_maj before update on public.articles
  for each row execute function public.touch_maj_le();

-- ---------- Produits / plats ajoutés par la famille ----------
create table if not exists public.catalogue_perso (
  id         uuid primary key default gen_random_uuid(),
  famille    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type       text not null check (type in ('produit','plat')),
  nom        text not null,
  categorie  text,
  donnees    jsonb not null default '{}'::jsonb,
  cree_le    timestamptz not null default now(),
  maj_le     timestamptz not null default now()
);
create index if not exists catalogue_perso_famille_idx on public.catalogue_perso(famille);
create trigger catalogue_perso_maj before update on public.catalogue_perso
  for each row execute function public.touch_maj_le();

-- ---------- Personnalisation des recettes ----------
create table if not exists public.personnalisations (
  famille    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recette_id text not null,
  donnees    jsonb not null default '{}'::jsonb,
  maj_le     timestamptz not null default now(),
  primary key (famille, recette_id)
);
create trigger personnalisations_maj before update on public.personnalisations
  for each row execute function public.touch_maj_le();

-- ---------- Préférences (+ sélections personnalisées, notifications) ----------
create table if not exists public.preferences (
  famille    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  donnees    jsonb not null default '{}'::jsonb,
  maj_le     timestamptz not null default now()
);
create trigger preferences_maj before update on public.preferences
  for each row execute function public.touch_maj_le();

-- ---------- Téléphones connectés ----------
create table if not exists public.appareils (
  id                uuid primary key default gen_random_uuid(),
  famille           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nom               text not null,
  cree_le           timestamptz not null default now(),
  derniere_activite timestamptz not null default now(),
  revoque           boolean not null default false
);
create index if not exists appareils_famille_idx on public.appareils(famille);

-- Seul l'admin peut changer « revoque » (déconnecter un téléphone)
create or replace function public.protege_revoque()
returns trigger language plpgsql as $$
begin
  if new.revoque is distinct from old.revoque and not public.is_admin() then
    raise exception 'Seul l''administrateur peut déconnecter un appareil';
  end if;
  return new;
end; $$;
create trigger appareils_revoque before update on public.appareils
  for each row execute function public.protege_revoque();

-- =====================================================================
-- Règles d'accès (RLS) : chaque famille ne voit que ses données
-- =====================================================================
alter table public.articles          enable row level security;
alter table public.catalogue_perso   enable row level security;
alter table public.personnalisations enable row level security;
alter table public.preferences       enable row level security;
alter table public.appareils         enable row level security;

-- Liste : tout pour sa propre famille
create policy articles_famille on public.articles
  for all to authenticated
  using (famille = auth.uid()) with check (famille = auth.uid());

-- Catalogue perso : lire, ajouter, modifier — PAS de suppression
create policy catalogue_lire on public.catalogue_perso
  for select to authenticated using (famille = auth.uid());
create policy catalogue_ajouter on public.catalogue_perso
  for insert to authenticated with check (famille = auth.uid());
create policy catalogue_modifier on public.catalogue_perso
  for update to authenticated
  using (famille = auth.uid()) with check (famille = auth.uid());

-- Personnalisations et préférences : tout pour sa propre famille
create policy perso_famille on public.personnalisations
  for all to authenticated
  using (famille = auth.uid()) with check (famille = auth.uid());
create policy prefs_famille on public.preferences
  for all to authenticated
  using (famille = auth.uid()) with check (famille = auth.uid());

-- Appareils : la famille voit les siens (lecture seule côté écran),
-- s'enregistre et met à jour sa dernière activité ; l'admin voit tout,
-- peut déconnecter (revoque) et supprimer.
create policy appareils_lire on public.appareils
  for select to authenticated using (famille = auth.uid() or public.is_admin());
create policy appareils_ajouter on public.appareils
  for insert to authenticated with check (famille = auth.uid());
create policy appareils_modifier on public.appareils
  for update to authenticated
  using (famille = auth.uid() or public.is_admin())
  with check (famille = auth.uid() or public.is_admin());
create policy appareils_supprimer on public.appareils
  for delete to authenticated using (public.is_admin());

-- =====================================================================
-- Temps réel (synchro instantanée entre téléphones + déconnexion immédiate)
-- =====================================================================
alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.appareils;

-- =====================================================================
-- « Ping » pour la tâche GitHub Actions anti-pause (aucune donnée exposée)
-- =====================================================================
create or replace function public.ping()
returns timestamptz language sql stable as $$ select now(); $$;
grant execute on function public.ping() to anon, authenticated;

-- =====================================================================
-- Droits des rôles sur les tables (les règles RLS ci-dessus filtrent)
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, update on public.catalogue_perso to authenticated;
grant select, insert, update, delete on public.personnalisations to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
grant select, insert, update, delete on public.appareils to authenticated;

-- =====================================================================
-- APRÈS avoir créé le compte admin dans Authentication > Users,
-- exécute ces lignes seules (adresse du compte admin) :
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'admin.maison@gmail.com';
-- =====================================================================
