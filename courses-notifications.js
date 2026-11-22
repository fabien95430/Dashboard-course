(()=>{
'use strict';
const ENTITY='todo.courses_notifications',PREFIX='courses-push-v1:',OWN_ID_KEY='courses-push-own-id-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key',MAX_DEVICES=12;
const ha=()=>window.COURSES_HA_CLIENT,connected=()=>!!ha()?.isConnected?.();
// Compte famille : abonnements rangés dans le service famille (Supabase), avec sa propre clé publique.
const family=()=>document.documentElement.dataset.account==='family'&&!!window.COURSES_FAMILY?.isActive?.();
let task=null,status='À activer sur chaque iPhone';
function setStatus(text){
  status=/Getting push subscription requires a service worker/i.test(String(text||''))
    ?'Notifications indisponibles : Service Worker non prêt'
    :String(text||'');
  for(const id of ['missingNotificationsStatus','notificationsManagementSummary']){
    const label=document.getElementById(id);
    if(label)label.textContent=status;
  }
}
function ownId(){
  const stored=String(localStorage.getItem(OWN_ID_KEY)||'');
  if(/^[a-f0-9]{16}$/.test(stored))return stored;
  const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);
  const id=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  localStorage.setItem(OWN_ID_KEY,id);
  return id;
}
function safePush(value){
  if(!value||typeof value!=='object')return null;
  const endpoint=String(value.endpoint||value.push_endpoint||'');
  const p256dh=String(value.p256dh||value.push_p256dh||'');
  const auth=String(value.auth||value.push_auth||'');
  const publicKey=String(value.publicKey||value.push_public_key||'');
  try{
    const url=new URL(endpoint);
    if(url.protocol!=='https:'||url.username||url.password||endpoint.length>1500)return null;
  }catch(_){return null}
  if(!/^[A-Za-z0-9_-]{32,}$/.test(p256dh)||!/^[A-Za-z0-9_-]{10,}$/.test(auth)
    ||!/^[A-Za-z0-9_-]{80,}$/.test(publicKey))return null;
  return {endpoint,p256dh,auth,publicKey};
}
async function rows(){
  if(!connected())throw new Error('Home Assistant non connecté');
  const result=await ha().request({type:'todo/item/list',entity_id:ENTITY});
  if(!Array.isArray(result?.items))throw new Error('Liste Notifications Home Assistant introuvable');
  return result.items;
}
function decode(row){
  if(row?.status==='completed'||!String(row?.description||'').startsWith(PREFIX))return null;
  try{
    const data=JSON.parse(row.description.slice(PREFIX.length));
    const push=safePush(data);
    return data.v===1&&push?{uid:String(row.uid||''),summary:String(row.summary||''),id:String(data.id||''),at:String(data.at||''),push}:null;
  }catch(_){return null}
}
async function publicKey(){
  const states=await ha().getStates(),key=String(states.find(e=>e.entity_id===VAPID_ENTITY)?.state||'');
  if(!/^[A-Za-z0-9_-]{80,}$/.test(key))throw new Error('Clé VAPID publique absente dans Home Assistant');
  return key;
}
function bytesFromKey(value){
  const text=value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4);
  return Uint8Array.from(atob(text),ch=>ch.charCodeAt(0));
}
async function currentPush({ask=false}={}){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){
    throw new Error('Web Push indisponible sur cet appareil');
  }
  let permission=Notification.permission;
  if(permission==='default'&&ask)permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error('Notifications refusées dans les réglages iOS');
  const key=family()?String(window.COURSES_FAMILY.config.vapidPublicKey||''):await publicKey(),registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
  // Abonnement créé avec une autre clé (changement de compte sur ce téléphone) : on le renouvelle.
  const current=subscription?.options?.applicationServerKey;
  if(subscription&&current&&btoa(String.fromCharCode(...new Uint8Array(current))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')!==key){
    await subscription.unsubscribe();subscription=null;
  }
  if(!subscription){
    subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytesFromKey(key)});
  }
  const json=subscription.toJSON();
  const push=safePush({endpoint:subscription.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,publicKey:key});
  if(!push)throw new Error('Souscription Web Push invalide');
  return push;
}
async function remember(push){
  const valid=safePush(push);
  if(!valid||!connected())return false;
  const id=ownId(),summary='Courses Push '+id;
  const existing=(await rows()).map(decode).filter(Boolean).find(row=>row.id===id);
  const at=existing?.at||new Date().toISOString();
  const description=PREFIX+JSON.stringify({v:1,id,at,...valid});
  if(existing){
    if(JSON.stringify(existing.push)!==JSON.stringify(valid)){
      await ha().callService('todo','update_item',{entity_id:ENTITY,item:existing.uid||existing.summary,description});
    }
  }else{
    await ha().callService('todo','add_item',{entity_id:ENTITY,item:summary,description});
  }
  const confirmed=(await rows()).map(decode).filter(Boolean).some(row=>row.id===id&&row.push.endpoint===valid.endpoint);
  if(!confirmed)throw new Error('Enregistrement non confirmé par Home Assistant');
  return true;
}
async function registerFamily({ask=false}={}){
  if(!ask&&(!('Notification' in window)||Notification.permission!=='granted')){
    setStatus('À activer sur chaque iPhone');return false;
  }
  try{
    setStatus('Inscription de cet iPhone…');
    await window.COURSES_FAMILY.saveSubscription(await currentPush({ask}));
    const count=await window.COURSES_FAMILY.countSubscriptions();
    setStatus('Actives · '+count+' appareil'+(count>1?'s':'')+' enregistré'+(count>1?'s':''));
    void refreshDevices();
    return true;
  }catch(error){setStatus(String(error?.message||'Inscription impossible').slice(0,130));return false}
}
async function register({ask=false}={}){
  if(task)return task;
  if(family()){task=registerFamily({ask});try{return await task}finally{task=null}}
  if(!connected()){setStatus('En attente de Home Assistant');return false}
  if(!ask&&(!('Notification' in window)||Notification.permission!=='granted')){
    setStatus('À activer sur chaque iPhone');return false;
  }
  const job=(async()=>{
    setStatus('Inscription de cet iPhone…');
    await remember(await currentPush({ask}));
    const count=new Set((await rows()).map(decode).filter(Boolean).map(r=>r.push.endpoint)).size;
    setStatus('Actives · '+count+' appareil'+(count>1?'s':'')+' enregistré'+(count>1?'s':''));
    void refreshDevices();
    return true;
  })();
  task=job;
  try{return await job}catch(error){setStatus(String(error?.message||'Inscription impossible').slice(0,130));return false}
  finally{if(task===job)task=null}
}
async function recipients(fallback=null){
  if(family())return [];
  let saved=[];
  try{saved=(await rows()).map(decode).filter(Boolean).map(row=>row.push)}catch(_){}
  if(fallback)saved.push(fallback);
  const seen=new Set(),result=[];
  for(const value of saved){
    const push=safePush(value);
    if(!push||seen.has(push.endpoint))continue;
    seen.add(push.endpoint);result.push(push);
    if(result.length===MAX_DEVICES)break;
  }
  return result;
}
async function broadcast({kind,type,name,requestId}){
  if(family()||!connected())return false;
  try{
    const targets=await recipients();
    if(!targets.length)return false;
    await ha().callService('rest_command','courses_notify_all',{
      event_kind:String(kind||'').slice(0,24),item_type:type==='dish'?'dish':'product',
      item_name:String(name||'').trim().slice(0,80),
      request_id:String(requestId||'').slice(0,100),push_subscriptions:JSON.stringify(targets)
    });
    return true;
  }catch(_){return false}
}
async function disable(){
  if(family()){
    try{
      const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.getSubscription();
      if(subscription){await window.COURSES_FAMILY.removeSubscription(subscription.endpoint);await subscription.unsubscribe()}
      setStatus('Notifications désactivées sur cet iPhone');
      void refreshDevices();
      return true;
    }catch(error){setStatus(String(error?.message||'Désactivation impossible'));return false}
  }
  try{
    if(!connected())throw new Error('Home Assistant non connecté');
    const own=(await rows()).map(decode).filter(Boolean).find(row=>row.id===ownId());
    if(own)await ha().callService('todo','remove_item',{entity_id:ENTITY,item:own.uid||own.summary});
    const registration=await navigator.serviceWorker.ready;
    await (await registration.pushManager.getSubscription())?.unsubscribe();
    setStatus('Notifications désactivées sur cet iPhone');
    void refreshDevices();
    return true;
  }catch(error){setStatus(String(error?.message||'Désactivation impossible'));return false}
}
/* ---------- Liste des appareils enregistrés (popup Notifications) ---------- */
function deviceKind(endpoint){
  let host='';
  try{host=new URL(endpoint).hostname}catch(_){}
  if(/(^|\.)push\.apple\.com$/.test(host))return 'iPhone';
  if(/(^|\.)googleapis\.com$/.test(host))return 'Android ou Chrome';
  if(/mozilla\.(com|org)$/.test(host))return 'Firefox';
  if(/(^|\.)windows\.com$/.test(host)||/notify\.windows/.test(host))return 'Windows';
  return 'Navigateur';
}
function addedOn(value){
  const date=new Date(value);
  return Number.isFinite(date.getTime())?'ajouté le '+date.toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'';
}
async function ownEndpoint(){
  try{
    const registration=await navigator.serviceWorker?.getRegistration?.();
    return String((await registration?.pushManager?.getSubscription?.())?.endpoint||'');
  }catch(_){return ''}
}
async function devices(){
  if(family()){
    const own=await ownEndpoint();
    return (await window.COURSES_FAMILY.listSubscriptions()).map(row=>({
      key:row.endpoint,name:row.nom||deviceKind(row.endpoint),at:row.cree_le,current:!!own&&row.endpoint===own,removable:false
    }));
  }
  if(!connected())return null;
  const id=ownId(),seen=new Set(),result=[];
  for(const row of (await rows()).map(decode).filter(Boolean)){
    if(seen.has(row.push.endpoint))continue;
    seen.add(row.push.endpoint);
    result.push({key:row.uid||row.summary,name:deviceKind(row.push.endpoint),at:row.at,current:row.id===id,removable:row.id!==id});
  }
  return result;
}
function renderDevices(list){
  const host=document.getElementById('notificationsDevicesList');
  if(!host)return;
  host.replaceChildren();
  if(!Array.isArray(list)||!list.length){host.hidden=true;return}
  // Appareil courant en tête ; numérotation quand plusieurs appareils portent le même nom.
  const ordered=[...list].sort((a,b)=>Number(b.current)-Number(a.current));
  const totals={},ranks={};
  ordered.forEach(d=>{totals[d.name]=(totals[d.name]||0)+1});
  for(const device of ordered){
    ranks[device.name]=(ranks[device.name]||0)+1;
    const item=document.createElement('li');
    const copy=document.createElement('span');copy.className='notifications-device-copy';
    const name=document.createElement('strong');
    name.textContent=device.name+(totals[device.name]>1&&!device.current?' '+ranks[device.name]:'');
    const detail=document.createElement('small');
    detail.textContent=[device.current?'Cet appareil':'',addedOn(device.at)].filter(Boolean).join(' · ')||'Enregistré';
    copy.append(name,detail);item.append(copy);
    if(device.removable){
      const remove=document.createElement('button');
      remove.type='button';remove.className='notifications-device-remove';remove.textContent='Retirer';
      remove.addEventListener('click',()=>{void removeDevice(device.key,remove)});
      item.append(remove);
    }
    host.append(item);
  }
  host.hidden=false;
}
async function refreshDevices(){
  try{renderDevices(await devices())}catch(_){renderDevices(null)}
}
/* Administrateur : retire de Home Assistant un autre appareil (il ne reçoit plus rien). */
async function removeDevice(key,button){
  if(family()||!connected()||!key)return false;
  if(button)button.disabled=true;
  try{
    await ha().callService('todo','remove_item',{entity_id:ENTITY,item:key});
    const count=new Set((await rows()).map(decode).filter(Boolean).map(r=>r.push.endpoint)).size;
    if(/^Actives/.test(status))setStatus('Actives · '+count+' appareil'+(count>1?'s':'')+' enregistré'+(count>1?'s':''));
    await refreshDevices();
    return true;
  }catch(error){
    if(button)button.disabled=false;
    setStatus(String(error?.message||'Retrait impossible').slice(0,130));
    return false;
  }
}
function bind(){
  const enable=document.getElementById('enableMissingNotifications');
  if(!enable)return;
  enable.addEventListener('click',()=>{void register({ask:true})});
  document.getElementById('disableMissingNotifications')?.addEventListener('click',()=>{void disable()});
  setStatus(status);
  // Compte famille ouvert : réinscription silencieuse si les notifications sont déjà autorisées.
  document.addEventListener('courses:account-changed',event=>{
    if(event.detail?.kind==='family')setTimeout(()=>{void register()},1500);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
Object.defineProperty(window,'COURSES_NOTIFICATIONS',{value:Object.freeze({register,recipients,broadcast,disable,safePush,refreshDevices,getStatus:()=>status}),configurable:false,enumerable:false,writable:false});
})();