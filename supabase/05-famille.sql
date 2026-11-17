-- =====================================================================
-- Mes courses — version famille : AJOUT n°5 — notifications des familles
-- À coller une seule fois dans : SQL Editor > New query > Run
-- (après avoir créé la fonction Edge « notifier », voir docs/VERSION_FAMILLE.md)
-- =====================================================================

-- ---------- 1. Abonnements Web Push des téléphones famille ----------
create table if not exists public.abonnements (
  id        uuid primary key default gen_random_uuid(),
  famille   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  appareil  uuid references public.appareils(id) on delete cascade,
  endpoint  text not null unique,
  p256dh    text not null,
  auth      text not null,
  cree_le   timestamptz not null default now()
);
create index if not exists abonnements_famille_idx on public.abonnements(famille);
alter table public.abonnements enable row level security;

drop policy if exists abonnements_famille on public.abonnements;
create policy abonnements_famille on public.abonnements
  for all to authenticated
  using (famille = auth.uid()) with check (famille = auth.uid());
grant select, insert, update, delete on public.abonnements to authenticated;

-- ---------- 2. Qui a ajouté l'article (pour ne pas notifier ce téléphone) ----------
alter table public.articles
  add column if not exists appareil uuid references public.appareils(id) on delete set null;

-- ---------- 3. Déclencheurs → fonction « notifier » ----------
create extension if not exists pg_net;

create or replace function public.notifier_famille()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'articles' then
    perform net.http_post(
      url := 'https://tbzcvyxvoxburuuoodvh.supabase.co/functions/v1/notifier',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('type','article','id',new.id)
    );
  elsif tg_table_name = 'catalogue_perso'
        and new.statut = 'integre' and old.statut is distinct from 'integre' then
    perform net.http_post(
      url := 'https://tbzcvyxvoxburuuoodvh.supabase.co/functions/v1/notifier',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('type','demande','id',new.id)
    );
  end if;
  return new;
end; $$;

drop trigger if exists articles_notifier on public.articles;
create trigger articles_notifier after insert on public.articles
  for each row execute function public.notifier_famille();

drop trigger if exists catalogue_perso_notifier on public.catalogue_perso;
create trigger catalogue_perso_notifier after update on public.catalogue_perso
  for each row execute function public.notifier_famille();
