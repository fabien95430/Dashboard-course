-- =====================================================================
-- Mes courses — version famille : AJOUT n°7 — Bureau des agents
-- À coller une seule fois dans : SQL Editor > New query > Run
-- (après 06-famille.sql). Voir docs/BUREAU_AGENTS.md, « Mise en service ».
--
-- Chaque retour (idée ou correction) suit une étape :
--   recu → (idée : autorise par l'admin) → trieur → developpeur → testeur
--   → a_valider → valide (par l'admin) → publie        ou → refuse / echec
-- Le relais prévient GitHub (workflow bureau-agent) quand une correction arrive
-- ou quand l'admin autorise, valide ou refuse. Le jeton GitHub reste dans le
-- coffre Supabase (Vault), jamais dans le dépôt ni dans l'application.
-- =====================================================================

alter table public.retours add column if not exists etape text not null default 'recu';
alter table public.retours add column if not exists agent jsonb not null default '{}'::jsonb;
alter table public.retours add column if not exists etape_le timestamptz not null default now();

alter table public.retours drop constraint if exists retours_etape_check;
alter table public.retours add constraint retours_etape_check check (etape in
  ('recu','autorise','trieur','developpeur','testeur','a_valider','valide','refuse','publie','echec'));

-- Une famille envoie toujours un retour neuf : elle ne peut ni s'autoriser ni remplir le suivi des agents.
drop policy if exists retours_ajouter on public.retours;
create policy retours_ajouter on public.retours
  for insert to authenticated with check (
    famille = auth.uid() and statut = 'nouveau' and etape = 'recu' and agent = '{}'::jsonb
  );

create or replace function public.retours_etape_le()
returns trigger language plpgsql as $$
begin
  if new.etape is distinct from old.etape then new.etape_le := now(); end if;
  return new;
end; $$;

drop trigger if exists retours_etape on public.retours;
create trigger retours_etape before update on public.retours
  for each row execute function public.retours_etape_le();

-- Relais vers GitHub (repository_dispatch « bureau_agent »).
create extension if not exists pg_net;

create or replace function public.bureau_relais()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  jeton text;
begin
  if not (
    (tg_op = 'INSERT' and new.type = 'correction')
    or (tg_op = 'UPDATE' and new.etape is distinct from old.etape and new.etape in ('autorise','valide','refuse'))
  ) then
    return new;
  end if;
  select decrypted_secret into jeton from vault.decrypted_secrets where name = 'github_bureau' limit 1;
  if jeton is null then return new; end if;
  perform net.http_post(
    url := 'https://api.github.com/repos/fabien95430/Dashboard-course/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || jeton,
      'Accept', 'application/vnd.github+json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'courses-bureau',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('event_type', 'bureau_agent', 'client_payload', jsonb_build_object('id', new.id))
  );
  return new;
end; $$;

revoke all on function public.bureau_relais() from public, anon, authenticated;

drop trigger if exists retours_bureau_relais on public.retours;
create trigger retours_bureau_relais after insert or update of etape on public.retours
  for each row execute function public.bureau_relais();
