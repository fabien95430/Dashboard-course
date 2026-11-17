// Fonction Edge « notifier » (Supabase) — notifications Web Push des familles.
// Appelée par les déclencheurs de supabase/05-famille.sql :
//   { type:'article', id }  → article ajouté : les autres téléphones du foyer
//   { type:'demande', id }  → demande intégrée : tous les téléphones du foyer
// Secrets Supabase requis : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (clé réservée aux familles).
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement par Supabase.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});
webpush.setVapidDetails(
  'https://fabien95430.github.io/Dashboard-course/',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);
const APP_URL = 'https://fabien95430.github.io/Dashboard-course/';
const RECENT_MS = 3 * 60 * 1000; // seuls les événements récents sont notifiés

type Sub = { id: string; appareil: string | null; endpoint: string; p256dh: string; auth: string };

async function send(subs: Sub[], payload: Record<string, string>) {
  const gone: string[] = [];
  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 3600, urgency: 'normal' },
      );
    } catch (error) {
      const status = (error as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) gone.push(sub.id);
    }
  }));
  if (gone.length) await db.from('abonnements').delete().in('id', gone);
  return subs.length - gone.length;
}

async function subscriptionsFor(famille: string) {
  const { data } = await db.from('abonnements').select('id,appareil,endpoint,p256dh,auth').eq('famille', famille);
  return (data || []) as Sub[];
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  let body: { type?: string; id?: string } = {};
  try { body = await req.json(); } catch (_) { /* corps invalide */ }
  const id = String(body.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('id', { status: 400 });

  if (body.type === 'article') {
    const { data: row } = await db.from('articles').select('famille,nom,appareil,cree_le').eq('id', id).maybeSingle();
    if (!row || Date.now() - Date.parse(row.cree_le) > RECENT_MS) return new Response('ignored');
    const subs = (await subscriptionsFor(row.famille)).filter((sub) => !row.appareil || sub.appareil !== row.appareil);
    const sent = await send(subs, {
      title: 'Ajouté à la liste',
      body: String(row.nom || '').slice(0, 80),
      tag: 'courses-famille-article',
      url: APP_URL,
    });
    return Response.json({ sent });
  }

  if (body.type === 'demande') {
    const { data: row } = await db.from('catalogue_perso').select('famille,nom,type,statut,traite_le').eq('id', id).maybeSingle();
    if (!row || row.statut !== 'integre' || Date.now() - Date.parse(row.traite_le || '') > RECENT_MS) {
      return new Response('ignored');
    }
    const sent = await send(await subscriptionsFor(row.famille), {
      title: row.type === 'plat' ? 'Plat intégré' : 'Produit intégré',
      body: String(row.nom || '').slice(0, 60) + ' arrive dans l’application.',
      tag: 'courses-famille-demande-' + id,
      url: APP_URL,
    });
    return Response.json({ sent });
  }

  return new Response('type', { status: 400 });
});
