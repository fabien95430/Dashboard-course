(()=>{
'use strict';
/* Service famille (Supabase) : comptes famille, liste partagée en temps réel, préférences,
   personnalisation des recettes, demandes d'ajout, historique de courses et appareils.
   Source unique pour tout ce qui touche au service famille. Le mode administrateur
   (coffre local + Home Assistant) n'en dépend jamais : la bibliothèque n'est chargée
   qu'à la connexion d'un compte famille ou à l'ouverture de l'écran admin « Familles ». */

const CONFIG=Object.freeze({
  url:'https://tbzcvyxvoxburuuoodvh.supabase.co',
  // Clé publishable : publique par conception, l'accès aux données est protégé par RLS.
  key:'sb_publishable_OCoP4SmvfqxVPKdJbhdHsA_BFraB-fh',
  emailDomain:'@famille.invalid',
  // Compte administrateur Supabase : son mot de passe est aussi celui de l'accès « admin » de l'app.
  adminEmail:'admin.maison@gmail.com',
  // Clé publique Web Push réservée aux téléphones famille (la clé privée est un secret Supabase).
  vapidPublicKey:'BPONs8dXD96tiHA8HA5LjIb17wPp4Roa8OhK0Jpyhx-8R-TUV00HN1jP3893gsU6JpexdFa0gOLfxDf8cf7ORZg',
  library:'./vendor/supabase.min.js?v=2119'
});
const KEYS=Object.freeze({
  auth:'courses-family-auth-v1',
  adminAuth:'courses-family-admin-auth-v1',
  device:'courses-family-device-v1',
  list:'courses-external-demo-items-v2',
  customizations:'courses-dish-customizations-v1'
});
// Données locales de la famille reflétées dans `preferences.donnees` (aucune donnée secrète).
const PREFERENCE_KEYS=Object.freeze([
  'courses-preferences-v1',
  'courses-dish-favorites-v1',
  'courses-dish-servings-v1',
  'courses-dish-preferred-servings-v1',
  'courses-dish-need-overrides-v2',
  'courses-dish-contributions-v1',
  'courses-external-usage-v1',
  'courses-purchase-intelligence-enabled-v1',
  'courses-purchase-intelligence-v1'
]);
const MISSING_KEYS=Object.freeze({product:'courses-missing-products-v1',dish:'courses-missing-dishes-v1'});
const LIST_EVENT='courses:family-list-updated';
const REVOKED_EVENT='courses:family-revoked';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOCAL_SYNC_DELAY_MS=15000;

let libraryPromise=null,client=null,adminClient=null;
let session=null,device=null,listChannel=null,deviceChannel=null;
let serverRows=new Map(),pushTimer=0,pushing=null,pushAgain=false,localTimer=0;
let preferenceSnapshot='',customizationSnapshot='';

function readJson(key,fallback=null){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_){return fallback}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
function removeKey(key){try{localStorage.removeItem(key)}catch(_){}}
function uuid(){
  if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
  const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
/* « camille » → camille@famille.invalid ; une adresse complète est utilisée telle quelle. */
function emailFor(identifier){
  const id=String(identifier||'').trim().toLowerCase();
  if(!id)return '';
  return id.includes('@')?id:id+CONFIG.emailDomain;
}
/* Nom du foyer = premier mot de l'identifiant : « stephany.maison@hotmail.fr » → « Stephany ».
   Seule implémentation : l'écran admin « Familles » s'en sert aussi. */
function displayName(identifier){
  const words=String(identifier||'').split('@')[0].split(/[._\-\s\d]+/).filter(Boolean);
  const first=(/^famille$/i.test(words[0]||'')?words[1]:words[0])||'';
  return first?first.charAt(0).toUpperCase()+first.slice(1).toLowerCase():'';
}
function loadLibrary(){
  if(window.supabase?.createClient)return Promise.resolve(window.supabase);
  if(libraryPromise)return libraryPromise;
  libraryPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=CONFIG.library;script.async=true;
    script.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Service famille indisponible'));
    script.onerror=()=>{libraryPromise=null;reject(new Error('Service famille indisponible'))};
    document.head.appendChild(script);
  });
  return libraryPromise;
}
async function familyClient(){
  if(client)return client;
  const lib=await loadLibrary();
  client=lib.createClient(CONFIG.url,CONFIG.key,{auth:{storageKey:KEYS.auth,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  return client;
}

/* ---------- Liste (table articles) ---------- */
function rowToItem(row){
  const item={uid:row.id,summary:row.nom,status:row.coche?'completed':'needs_action'};
  if(row.description)item.description=row.description;
  return item;
}
function itemToRow(item,index){
  return {
    id:item.uid,
    nom:String(item.summary||'').slice(0,120),
    coche:item.status==='completed',
    description:item.description?String(item.description).slice(0,2000):null,
    ordre:index
  };
}
function sameRow(a,b){return !!a&&!!b&&a.nom===b.nom&&!!a.coche===!!b.coche&&(a.description||null)===(b.description||null)&&Number(a.ordre)===Number(b.ordre)}
/* Les nouveaux articles reçoivent un identifiant UUID (clé de la table). */
function ensureUuids(items){
  let changed=false;
  const out=items.map(item=>{
    if(UUID_RE.test(String(item?.uid||'')))return item;
    changed=true;return {...item,uid:uuid()};
  });
  return {items:out,changed};
}
async function fetchList(){
  const db=await familyClient();
  const {data,error}=await db.from('articles').select('id,nom,coche,description,ordre,cree_le').order('ordre',{ascending:true,nullsFirst:false}).order('cree_le',{ascending:true});
  if(error)throw error;
  serverRows=new Map((data||[]).map(row=>[row.id,row]));
  return (data||[]).map(rowToItem);
}
function publishList(items){
  writeJson(KEYS.list,items);
  document.dispatchEvent(new CustomEvent(LIST_EVENT,{detail:{items}}));
}
async function pullList(){publishList(await fetchList())}
/* Appelé par app.js après chaque écriture locale de la liste en mode famille. */
function listChanged(){
  if(!session)return;
  clearTimeout(pushTimer);
  pushTimer=setTimeout(()=>{void pushList()},250);
}
async function pushList(){
  if(!session)return;
  if(pushing){pushAgain=true;return pushing}
  pushing=(async()=>{
    try{
      const db=await familyClient();
      const local=ensureUuids(readJson(KEYS.list,[])||[]);
      if(local.changed)publishList(local.items);
      const rows=local.items.map(itemToRow);
      const changed=rows.filter(row=>!sameRow(row,serverRows.get(row.id)));
      const keep=new Set(rows.map(row=>row.id));
      const removed=[...serverRows.keys()].filter(id=>!keep.has(id));
      if(changed.length){
        // Un nouvel article porte le téléphone qui l'ajoute : la notification va aux autres téléphones du foyer.
        const payload=changed.map(row=>serverRows.has(row.id)||!device?.id?row:{...row,appareil:device.id});
        const {error}=await db.from('articles').upsert(payload,{onConflict:'id'});
        if(error)throw error;
        changed.forEach(row=>serverRows.set(row.id,{...serverRows.get(row.id),...row}));
      }
      if(removed.length){
        const {error}=await db.from('articles').delete().in('id',removed);
        if(error)throw error;
        removed.forEach(id=>serverRows.delete(id));
      }
    }catch(error){console.warn('courses-family: synchronisation liste',error)}
    finally{
      pushing=null;
      if(pushAgain){pushAgain=false;void pushList()}
    }
  })();
  return pushing;
}
function subscribeList(){
  if(!client||!session||listChannel)return;
  let timer=0;
  listChannel=client.channel('famille-articles')
    .on('postgres_changes',{event:'*',schema:'public',table:'articles',filter:'famille=eq.'+session.user.id},()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{if(!pushing)void pullList().catch(()=>{})},300);
    })
    .subscribe();
}

/* ---------- Préférences et personnalisation des recettes ---------- */
function preferencePayload(){
  const out={};
  PREFERENCE_KEYS.forEach(key=>{const raw=localStorage.getItem(key);if(raw!==null)out[key]=raw});
  return out;
}
async function pullPreferences(){
  const db=await familyClient();
  const [{data:prefs},{data:custom}]=await Promise.all([
    db.from('preferences').select('donnees').maybeSingle(),
    db.from('personnalisations').select('recette_id,donnees')
  ]);
  PREFERENCE_KEYS.forEach(removeKey);
  Object.entries(prefs?.donnees||{}).forEach(([key,raw])=>{if(PREFERENCE_KEYS.includes(key)&&typeof raw==='string')try{localStorage.setItem(key,raw)}catch(_){}});
  const customizations={};
  (custom||[]).forEach(row=>{customizations[row.recette_id]=row.donnees});
  if(Object.keys(customizations).length)writeJson(KEYS.customizations,customizations);else removeKey(KEYS.customizations);
  preferenceSnapshot=JSON.stringify(preferencePayload());
  customizationSnapshot=JSON.stringify(readJson(KEYS.customizations,{})||{});
}
async function pushPreferences(){
  if(!session)return;
  const prefs=preferencePayload(),prefsText=JSON.stringify(prefs);
  const custom=readJson(KEYS.customizations,{})||{},customText=JSON.stringify(custom);
  if(prefsText===preferenceSnapshot&&customText===customizationSnapshot)return;
  try{
    const db=await familyClient();
    if(prefsText!==preferenceSnapshot){
      const {error}=await db.from('preferences').upsert({famille:session.user.id,donnees:prefs},{onConflict:'famille'});
      if(error)throw error;
      preferenceSnapshot=prefsText;
    }
    if(customText!==customizationSnapshot){
      const before=JSON.parse(customizationSnapshot||'{}');
      const rows=Object.entries(custom).filter(([id,value])=>JSON.stringify(value)!==JSON.stringify(before[id])).map(([recette_id,donnees])=>({famille:session.user.id,recette_id,donnees}));
      const gone=Object.keys(before).filter(id=>!(id in custom));
      if(rows.length){const {error}=await db.from('personnalisations').upsert(rows,{onConflict:'famille,recette_id'});if(error)throw error}
      if(gone.length){const {error}=await db.from('personnalisations').delete().in('recette_id',gone);if(error)throw error}
      customizationSnapshot=customText;
    }
  }catch(error){console.warn('courses-family: synchronisation préférences',error)}
}
function scheduleLocalSync(){
  clearTimeout(localTimer);
  if(!session)return;
  localTimer=setTimeout(async()=>{await pushPreferences();scheduleLocalSync()},LOCAL_SYNC_DELAY_MS);
}

/* ---------- Demandes d'ajout (catalogue_perso) ---------- */
async function pushRequests(){
  if(!session)return;
  try{
    const db=await familyClient();
    const {data,error}=await db.from('catalogue_perso').select('id,type,nom,statut,donnees');
    if(error)throw error;
    const known=new Map((data||[]).map(row=>[String(row.donnees?.localId||''),row]));
    const inserts=[];
    Object.entries(MISSING_KEYS).forEach(([type,key])=>{
      const local=readJson(key,[])||[];
      const kept=local.filter(item=>{
        const row=known.get(String(item?.id||''));
        // Demande traitée par l'admin (intégrée ou refusée) : elle quitte « À intégrer ».
        return !row||row.statut==='en_attente';
      });
      if(kept.length!==local.length)writeJson(key,kept);
      kept.forEach(item=>{
        if(item?.id&&item?.name&&!known.has(String(item.id)))inserts.push({type:type==='dish'?'plat':'produit',nom:String(item.name).slice(0,80),categorie:item.category||null,donnees:{localId:String(item.id)}});
      });
    });
    if(inserts.length){const {error:insertError}=await db.from('catalogue_perso').insert(inserts);if(insertError)throw insertError}
  }catch(error){console.warn('courses-family: demandes',error)}
}

/* ---------- Idées et corrections (table retours) ---------- */
const FEEDBACK_TYPES=Object.freeze(['idee','correction']);
async function sendFeedback({type,message,contexte}={}){
  if(!session)throw new Error('Compte famille non connecté');
  const kind=FEEDBACK_TYPES.includes(type)?type:'idee';
  const text=String(message||'').trim().slice(0,1000);
  if(text.length<3)throw new Error('Message trop court');
  const db=await familyClient();
  const extra={...(contexte&&typeof contexte==='object'?contexte:{})};
  if(device?.nom)extra.appareil=String(device.nom).slice(0,60);
  const {error}=await db.from('retours').insert({type:kind,message:text,contexte:extra});
  if(error)throw error;
}
async function listFeedback(){
  if(!session)return [];
  const db=await familyClient();
  const {data,error}=await db.from('retours').select('id,type,message,statut,cree_le').order('cree_le',{ascending:false}).limit(10);
  if(error)throw error;
  return data||[];
}

/* ---------- Historique de courses (achats) ---------- */
async function recordPurchase(detail){
  if(!session||!detail?.name)return;
  try{
    const db=await familyClient();
    await db.from('achats').insert({nom:String(detail.name).slice(0,120),quantite:String(detail.quantity||1)});
  }catch(error){console.warn('courses-family: achat',error)}
}

/* ---------- Appareils ---------- */
function storedDevice(){const d=readJson(KEYS.device,null);return d&&d.userId===session?.user?.id&&UUID_RE.test(String(d.id||''))?d:null}
async function registerDevice(name){
  const db=await familyClient();
  const clean=String(name||'').trim().slice(0,60)||'Appareil';
  const {data,error}=await db.from('appareils').insert({nom:clean}).select('id,nom').single();
  if(error)throw error;
  device={id:data.id,nom:data.nom,userId:session.user.id};
  writeJson(KEYS.device,device);
  subscribeDevice();
  return device;
}
async function touchDevice(){
  if(!session||!device)return;
  try{
    const db=await familyClient();
    const {data}=await db.from('appareils').select('revoque').eq('id',device.id).maybeSingle();
    if(!data||data.revoque){await revoked();return}
    await db.from('appareils').update({derniere_activite:new Date().toISOString()}).eq('id',device.id);
  }catch(_){}
}
function subscribeDevice(){
  if(!client||!device||deviceChannel)return;
  deviceChannel=client.channel('famille-appareil')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'appareils',filter:'id=eq.'+device.id},payload=>{if(payload?.new?.revoque)void revoked()})
    .on('postgres_changes',{event:'DELETE',schema:'public',table:'appareils',filter:'id=eq.'+device.id},()=>void revoked())
    .subscribe();
}
async function listDevices(){
  const db=await familyClient();
  const {data,error}=await db.from('appareils').select('id,nom,derniere_activite,revoque').eq('revoque',false).order('derniere_activite',{ascending:false});
  if(error)throw error;
  return (data||[]).map(row=>({...row,current:row.id===device?.id}));
}
async function revoked(){
  await signOut();
  document.dispatchEvent(new CustomEvent(REVOKED_EVENT));
}

/* ---------- Session ---------- */
function clearFamilyLocalData(){
  [KEYS.list,KEYS.customizations,...PREFERENCE_KEYS,...Object.values(MISSING_KEYS)].forEach(removeKey);
}
async function startSession(current){
  session=current;
  device=storedDevice();
  await Promise.all([pullPreferences(),pullList()]);
  subscribeList();
  if(device){subscribeDevice();void touchDevice()}
  void pushRequests();
  scheduleLocalSync();
  return {identifier:current.user.email,name:displayName(current.user.email),needsDeviceName:!device};
}
async function signIn(identifier,password){
  const db=await familyClient();
  const {data,error}=await db.auth.signInWithPassword({email:emailFor(identifier),password:String(password||'')});
  if(error||!data?.session){
    const message=/invalid/i.test(error?.message||'')?'Identifiant ou mot de passe incorrect.':'Connexion au service famille impossible.';
    throw new Error(message);
  }
  clearFamilyLocalData();
  return startSession(data.session);
}
/* Reprise sans mot de passe : la session famille reste ouverte une fois pour toutes. */
async function resume(){
  if(!localStorage.getItem(KEYS.auth))return null;
  const db=await familyClient();
  const {data}=await db.auth.getSession();
  if(!data?.session)return null;
  return startSession(data.session);
}
/* ---------- Notifications (abonnements Web Push du foyer) ---------- */
async function saveSubscription(push){
  if(!session)throw new Error('Compte famille non connecté');
  const db=await familyClient();
  const row={endpoint:String(push.endpoint),p256dh:String(push.p256dh),auth:String(push.auth),appareil:device?.id||null};
  const {error}=await db.from('abonnements').upsert(row,{onConflict:'endpoint'});
  if(error)throw new Error('Enregistrement des notifications impossible');
  return true;
}
async function removeSubscription(endpoint){
  if(!session||!endpoint)return false;
  const db=await familyClient();
  const {error}=await db.from('abonnements').delete().eq('endpoint',String(endpoint));
  return !error;
}
async function countSubscriptions(){
  if(!session)return 0;
  const db=await familyClient();
  const {data,error}=await db.from('abonnements').select('id');
  return error?0:(data||[]).length;
}
async function signOut(){
  clearTimeout(localTimer);clearTimeout(pushTimer);
  try{
    const registration=await navigator.serviceWorker?.getRegistration?.();
    const subscription=await registration?.pushManager?.getSubscription?.();
    if(subscription){await removeSubscription(subscription.endpoint);await subscription.unsubscribe()}
  }catch(_){}
  try{if(listChannel)await client?.removeChannel(listChannel)}catch(_){}
  try{if(deviceChannel)await client?.removeChannel(deviceChannel)}catch(_){}
  listChannel=null;deviceChannel=null;
  try{await client?.auth.signOut()}catch(_){}
  removeKey(KEYS.auth);removeKey(KEYS.device);
  clearFamilyLocalData();
  session=null;device=null;serverRows=new Map();
}

document.addEventListener('courses:purchase-settled',event=>{void recordPurchase(event.detail)});
window.addEventListener('courses-missing-requests-change',()=>{void pushRequests()});
document.addEventListener('visibilitychange',()=>{
  if(!session)return;
  if(document.visibilityState==='hidden'){void pushPreferences();void pushList()}
  else{void touchDevice();void pullList().catch(()=>{});void pushRequests()}
});
window.addEventListener('pagehide',()=>{if(session)void pushPreferences()});

/* ---------- Accès administrateur (écran « Familles ») ---------- */
async function admin(credentials){
  const lib=await loadLibrary();
  if(!adminClient)adminClient=lib.createClient(CONFIG.url,CONFIG.key,{auth:{storageKey:KEYS.adminAuth,persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}});
  const {data:current}=await adminClient.auth.getSession();
  if(!current?.session){
    const {error}=await adminClient.auth.signInWithPassword({email:String(credentials?.email||'').trim().toLowerCase(),password:String(credentials?.password||'')});
    if(error)throw new Error('Compte administrateur du service famille refusé.');
  }
  return adminClient;
}
/* Premier accès « admin » sur un appareil : le mot de passe est vérifié une fois par le compte
   administrateur Supabase, puis ne sert plus qu'au coffre local (le déverrouillage reste hors ligne).
   Erreurs : code 'wrong' (mot de passe refusé), 'busy' (trop d'essais), 'unavailable' (service injoignable). */
async function adminVerify(password,email=CONFIG.adminEmail){
  const fail=(code,message)=>Object.assign(new Error(message),{code});
  let lib;
  try{lib=await loadLibrary()}catch(_){throw fail('unavailable','Service indisponible, réessaie plus tard.')}
  const probe=lib.createClient(CONFIG.url,CONFIG.key,{auth:{storageKey:KEYS.adminAuth+'-verify',persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  let result;
  const account=String(email||CONFIG.adminEmail).trim().toLowerCase();
  try{result=await probe.auth.signInWithPassword({email:account,password:String(password||'')})}
  catch(_){throw fail('unavailable','Service indisponible, réessaie plus tard.')}
  const status=Number(result?.error?.status||0);
  if(result?.error){
    if(status===400||status===401||status===403)throw fail('wrong','Mot de passe incorrect.');
    if(status===429)throw fail('busy','Trop de tentatives. Réessaie dans quelques minutes.');
    throw fail('unavailable','Service indisponible, réessaie plus tard.');
  }
  try{await probe.auth.signOut()}catch(_){}
  return {email:account,password:String(password||'')};
}
async function adminOverview(credentials){
  const db=await admin(credentials);
  const since=new Date(Date.now()-31*864e5).toISOString();
  const [devices,requests,custom,purchases,feedback]=await Promise.all([
    db.from('appareils').select('id,famille,nom,derniere_activite,revoque').eq('revoque',false).order('derniere_activite',{ascending:false}),
    db.from('catalogue_perso').select('id,famille,type,nom,categorie,statut,cree_le').eq('statut','en_attente').order('cree_le',{ascending:false}),
    db.from('personnalisations').select('famille,recette_id,donnees,maj_le'),
    db.from('achats').select('famille,nom,quantite,categorie,coche_le').gte('coche_le',since).order('coche_le',{ascending:false}).limit(2000),
    // Retours (supabase/06-famille.sql) : table absente → aucun retour, le reste de l'écran fonctionne.
    Promise.resolve(db.from('retours').select('id,famille,type,message,contexte,statut,cree_le').eq('statut','nouveau').order('cree_le',{ascending:false}).limit(200)).then(result=>result?.error?{data:[]}:result,()=>({data:[]}))
  ]);
  const failed=[devices,requests,custom,purchases].find(result=>result.error);
  if(failed)throw failed.error;
  // Liste des foyers (fonction SQL familles(), réservée à l'admin) ; absente → foyers déduits de l'activité.
  const families=await db.rpc('familles').then(result=>result.error?[]:(result.data||[]),()=>[]);
  return {families,devices:devices.data||[],requests:requests.data||[],customizations:custom.data||[],purchases:purchases.data||[],feedback:feedback.data||[]};
}
async function adminSetRequestStatus(credentials,id,statut){
  const db=await admin(credentials);
  const {error}=await db.from('catalogue_perso').update({statut}).eq('id',id);
  if(error)throw error;
}
async function adminSetFeedbackStatus(credentials,id,statut){
  const db=await admin(credentials);
  const {error}=await db.from('retours').update({statut}).eq('id',id);
  if(error)throw error;
}
/* Décisions du Bureau : autoriser une idée (ou relancer), valider ou refuser un dossier prêt.
   Supabase prévient alors GitHub (supabase/07-bureau.sql). */
const BUREAU_DECISIONS=Object.freeze(['autorise','valide','refuse']);
async function adminSetFeedbackStage(credentials,id,etape){
  if(!BUREAU_DECISIONS.includes(etape))throw new Error('Étape non autorisée');
  const db=await admin(credentials);
  const {error}=await db.from('retours').update({etape}).eq('id',id);
  if(error)throw error;
}
async function adminRevokeDevice(credentials,id){
  const db=await admin(credentials);
  const {error}=await db.from('appareils').update({revoque:true}).eq('id',id);
  if(error)throw error;
}
/* Comptes famille (créer, changer le mot de passe, supprimer) : fonction Edge « familles-admin »,
   seule détentrice de la clé secrète Supabase ; elle vérifie que l'appelant est administrateur. */
async function adminManageFamily(credentials,payload){
  const db=await admin(credentials);
  const {data,error}=await db.functions.invoke('familles-admin',{body:payload});
  if(error){
    let message='Service famille indisponible';
    try{message=(await error.context?.json?.())?.error||message}catch(_){}
    throw new Error(message);
  }
  if(data?.error)throw new Error(data.error);
  return data||{};
}
/* Bureau (Réglages › Administrateur › Bureau) : tous les retours récents, nouveaux et traités, avec la liste des foyers. */
async function adminBureau(credentials){
  const db=await admin(credentials);
  const [feedback,families]=await Promise.all([
    db.from('retours').select('id,famille,type,message,contexte,statut,cree_le,traite_le,etape,agent,etape_le').order('cree_le',{ascending:false}).limit(100),
    db.rpc('familles').then(result=>result.error?[]:(result.data||[]),()=>[])
  ]);
  if(feedback.error)throw feedback.error;
  return {feedback:feedback.data||[],families};
}
/* Nouvelles demandes et retours en direct (temps réel sur catalogue_perso et retours, lisibles par l'admin).
   Un seul canal, partagé par les écrans admin (Familles, Bureau). */
let adminRequestsChannel=null;
const adminRequestListeners=new Set();
function notifyAdminRequests(){adminRequestListeners.forEach(listener=>{try{listener()}catch(_){}})}
async function adminWatchRequests(credentials,onChange){
  const db=await admin(credentials);
  if(typeof onChange==='function')adminRequestListeners.add(onChange);
  if(adminRequestsChannel)return;
  adminRequestsChannel=db.channel('admin-demandes')
    .on('postgres_changes',{event:'*',schema:'public',table:'catalogue_perso'},notifyAdminRequests)
    .on('postgres_changes',{event:'*',schema:'public',table:'retours'},notifyAdminRequests)
    .subscribe();
}
async function adminSignOut(){
  try{if(adminRequestsChannel)await adminClient?.removeChannel(adminRequestsChannel)}catch(_){}
  adminRequestsChannel=null;
  adminRequestListeners.clear();
  try{await adminClient?.auth.signOut()}catch(_){}
}

const api=Object.freeze({
  config:CONFIG,
  events:Object.freeze({list:LIST_EVENT,revoked:REVOKED_EVENT}),
  emailFor,displayName,ensureUuids,rowToItem,itemToRow,
  signIn,resume,signOut,listChanged,pushList,
  registerDevice,listDevices,touchDevice,
  saveSubscription,removeSubscription,countSubscriptions,
  sendFeedback,listFeedback,
  isActive:()=>!!session,
  currentName:()=>displayName(session?.user?.email||''),
  adminVerify,adminOverview,adminBureau,adminSetRequestStatus,adminSetFeedbackStatus,adminSetFeedbackStage,adminRevokeDevice,adminManageFamily,adminWatchRequests,adminSignOut
});
Object.defineProperty(window,'COURSES_FAMILY',{value:api,configurable:false,enumerable:false,writable:false});
})();
