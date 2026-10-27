(()=>{
'use strict';
const ENTITY='todo.courses_notifications',PREFIX='courses-push-v1:',OWN_ID_KEY='courses-push-own-id-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key',MAX_DEVICES=12;
const ha=()=>window.COURSES_HA_CLIENT,connected=()=>!!ha()?.isConnected?.();
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
    return data.v===1&&push?{uid:String(row.uid||''),summary:String(row.summary||''),id:String(data.id||''),push}:null;
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
  const key=await publicKey(),registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
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
  const description=PREFIX+JSON.stringify({v:1,id,...valid});
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
async function register({ask=false}={}){
  if(task)return task;
  if(!connected()){setStatus('En attente de Home Assistant');return false}
  if(!ask&&(!('Notification' in window)||Notification.permission!=='granted')){
    setStatus('À activer sur chaque iPhone');return false;
  }
  const job=(async()=>{
    setStatus('Inscription de cet iPhone…');
    await remember(await currentPush({ask}));
    const count=new Set((await rows()).map(decode).filter(Boolean).map(r=>r.push.endpoint)).size;
    setStatus('Actives · '+count+' appareil'+(count>1?'s':'')+' enregistré'+(count>1?'s':''));
    return true;
  })();
  task=job;
  try{return await job}catch(error){setStatus(String(error?.message||'Inscription impossible').slice(0,130));return false}
  finally{if(task===job)task=null}
}
async function recipients(fallback=null){
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
  if(!connected())return false;
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
  try{
    if(!connected())throw new Error('Home Assistant non connecté');
    const own=(await rows()).map(decode).filter(Boolean).find(row=>row.id===ownId());
    if(own)await ha().callService('todo','remove_item',{entity_id:ENTITY,item:own.uid||own.summary});
    const registration=await navigator.serviceWorker.ready;
    await (await registration.pushManager.getSubscription())?.unsubscribe();
    setStatus('Notifications désactivées sur cet iPhone');
    return true;
  }catch(error){setStatus(String(error?.message||'Désactivation impossible'));return false}
}
function bind(){
  const enable=document.getElementById('enableMissingNotifications');
  if(!enable)return;
  enable.addEventListener('click',()=>{void register({ask:true})});
  document.getElementById('disableMissingNotifications')?.addEventListener('click',()=>{void disable()});
  setStatus(status);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
Object.defineProperty(window,'COURSES_NOTIFICATIONS',{value:Object.freeze({register,recipients,broadcast,disable,safePush,getStatus:()=>status}),configurable:false,enumerable:false,writable:false});
})();