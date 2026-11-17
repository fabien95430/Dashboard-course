-- =====================================================================
-- Mes courses — version famille : AJOUT n°3
-- La liste famille garde les notes de plats et l'ordre choisi.
-- À coller une seule fois dans : SQL Editor > New query > Run
-- =====================================================================
alter table public.articles
  add column if not exists description text,
  add column if not exists ordre integer;
create index if not exists articles_famille_ordre_idx on public.articles(famille, ordre);
