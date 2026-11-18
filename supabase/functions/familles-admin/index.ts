// Fonction Edge « familles-admin » (Supabase) — gestion des comptes famille depuis l'app.
// Appelée par l'écran Réglages › Familles avec la session du compte administrateur.
// Actions : create { prenom, password } · password { id, password } · delete { id }.
// Garde « Verify JWT » activé (par défaut). SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
// sont fournis automatiquement par Supabase : la clé secrète ne quitte jamais le serveur.
import { createClient } from 'npm:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const ORIGIN = 'https://fabien95430.github.io';
const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Prénom → identifiant de connexion : minuscules, sans accents (« Stéphany » → stephany).
function identifier(prenom: string) {
  return prenom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/[^a-z0-9.-]+/g, '').slice(0, 30);
}
async function isAdmin(userId: string) {
  const { data } = await db.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply({ error: 'Méthode refusée' }, 405);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await db.auth.getUser(token);
  if (!auth?.user || !(await isAdmin(auth.user.id))) return reply({ error: 'Réservé à l’administrateur' }, 403);

  let body: { action?: string; prenom?: string; password?: string; id?: string } = {};
  try { body = await req.json(); } catch (_) { /* corps invalide */ }
  const password = String(body.password || '');

  if (body.action === 'create') {
    const id = identifier(String(body.prenom || ''));
    if (id.length < 2) return reply({ error: 'Prénom invalide' }, 400);
    if (password.length < 6) return reply({ error: 'Mot de passe : 6 caractères minimum' }, 400);
    const { data, error } = await db.auth.admin.createUser({
      email: id + '@famille.invalid', password, email_confirm: true,
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return reply({ error: exists ? 'Ce prénom est déjà utilisé' : 'Création impossible' }, exists ? 409 : 400);
    }
    return reply({ id: data.user?.id, identifiant: id });
  }

  const target = String(body.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(target)) return reply({ error: 'Foyer inconnu' }, 400);
  if (await isAdmin(target)) return reply({ error: 'Compte administrateur protégé' }, 403);

  if (body.action === 'password') {
    if (password.length < 6) return reply({ error: 'Mot de passe : 6 caractères minimum' }, 400);
    const { error } = await db.auth.admin.updateUserById(target, { password });
    return error ? reply({ error: 'Modification impossible' }, 400) : reply({ ok: true });
  }
  if (body.action === 'delete') {
    // Les données du foyer (liste, appareils, demandes…) partent avec le compte (on delete cascade).
    const { error } = await db.auth.admin.deleteUser(target);
    return error ? reply({ error: 'Suppression impossible' }, 400) : reply({ ok: true });
  }
  return reply({ error: 'Action inconnue' }, 400);
});
