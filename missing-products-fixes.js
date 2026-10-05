(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_RUNNING='courses-missing-dishes-running-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const CHATGPT_WEB_URL='https://chatgpt.com/';
const CHATGPT_APP_URL='com.openai.chat://';

let haSocket=null;
let haSeq=950000000;
const haPending=new Map();
let pushDataPromise=null;

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){
    return fallback;
  }
}
function readDishes(){
  const saved=readJson(STORAGE_DISHES,[]);
  return Array.isArray(saved)?saved:[];
}
function readRunning(){
  const saved=readJson(STORAGE_RUNNING,[]);
  return new Set(Array.isArray(saved)?saved.map(String):[]);
}
function saveRunning(running){
  try{localStorage.setItem(STORAGE_RUNNING,JSON.stringify([...running]))}catch(_){}
}
function currentDishIds(){
  return new Set(readDishes().map(item=>String(item?.id||'')).filter(Boolean));
}
function pruneRunning(){
  const current=currentDishIds();
  const running=readRunning();
  let changed=false;
  [...running].forEach(id=>{
    if(current.has(id))return;
    running.delete(id);
    changed=true;
  });
  if(changed)saveRunning(running);
  return running;
}
function setRunning(id,active){
  if(!id)return;
  const running=readRunning();
  if(active)running.add(String(id));
  else running.delete(String(id));
  saveRunning(running);
}
function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function appNotify(title,detail=''){
  const toast=document.getElementById('toast');
  if(!toast)return;
  toast.textContent=detail?title+' — '+detail:title;
  toast.classList.add('is-visible');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>toast.classList.remove('is-visible'),3500);
}

function rejectHaPending(message='Connexion Home Assistant interrompue'){
  haPending.forEach(pending=>{
    clearTimeout(pending.timer);
    pending.reject(new Error(message));
  });
  haPending.clear();
}
function bindHaSocket(socket){
  if(!socket||socket===haSocket)return;
  haSocket=socket;
  socket.addEventListener('message',event=>{
    let message;
    try{message=JSON.parse(event.data)}catch(_){return}
    if(message.type!=='result'||!haPending.has(message.id))return;
    const pending=haPending.get(message.id);
    haPending.delete(message.id);
    clearTimeout(pending.timer);
    if(message.success)pending.resolve(message.result);
    else pending.reject(new Error(message.error?.message||'Erreur Home Assistant'));
  });
  socket.addEventListener('close',()=>{
    if(haSocket!==socket)return;
    haSocket=null;
    rejectHaPending();
  });
}
function installHaBridge(){
  if(!('WebSocket' in window)||window.__coursesMissingNotificationBridge)return;
  window.__coursesMissingNotificationBridge=true;
  const nativeSend=WebSocket.prototype.send;
  WebSocket.prototype.send=function(data){
    try{
      const url=String(this.url||'');
      if(url.includes('/api/websocket'))bindHaSocket(this);
    }catch(_){}
    return nativeSend.call(this,data);
  };
}
function sendHaRequest(socket,payload){
  return new Promise((resolve,reject)=>{
    const id=haSeq++;
    const timer=setTimeout(()=>{
      haPending.delete(id);
      reject(new Error('Home Assistant ne répond pas.'));
    },HA_REQUEST_TIMEOUT_MS);
    haPending.set(id,{resolve,reject,timer});
    try{socket.send(JSON.stringify({id,...payload}))}
    catch(error){
      clearTimeout(timer);
      haPending.delete(id);
      reject(error);
    }
  });
}
async function waitForHaSocket(){
  if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
  document.getElementById('refreshBtn')?.click();
  const started=Date.now();
  while(Date.now()-started<1500){
    if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
    await new Promise(resolve=>setTimeout(resolve,60));
  }
  throw new Error('Connexion Home Assistant indisponible.');
}
function haRequest(payload){
  if(haSocket?.readyState===WebSocket.OPEN)return sendHaRequest(haSocket,payload);
  return waitForHaSocket().then(socket=>sendHaRequest(socket,payload));
}
function haCallService(domain,service,serviceData={}){
  return haRequest({type:'call_service',domain,service,service_data:serviceData});
}
function base64UrlToBytes(value){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from(raw,char=>char.charCodeAt(0));
}
async function readVapidPublicKey(){
  const states=await haRequest({type:'get_states'});
  const entity=Array.isArray(states)?states.find(item=>item?.entity_id===VAPID_ENTITY):null;
  const key=String(entity?.state||'').trim();
  return key.length>=80?key:'';
}
async function createPushSubscriptionData(){
  const empty={push_endpoint:'',push_p256dh:'',push_auth:'',push_public_key:''};
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))return empty;
  let permission=Notification.permission;
  if(permission==='default'){
    try{permission=await Notification.requestPermission()}catch(_){return empty}
  }
  if(permission!=='granted')return empty;
  let publicKey='';
  try{publicKey=await readVapidPublicKey()}catch(_){return empty}
  if(!publicKey)return empty;
  try{
    const registration=await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription){
      subscription=await registration.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:base64UrlToBytes(publicKey)
      });
    }
    const json=subscription.toJSON();
    return {
      push_endpoint:String(subscription.endpoint||''),
      push_p256dh:String(json.keys?.p256dh||''),
      push_auth:String(json.keys?.auth||''),
      push_public_key:publicKey
    };
  }catch(_){
    return empty;
  }
}
function pushSubscriptionData(){
  if(pushDataPromise)return pushDataPromise;
  pushDataPromise=createPushSubscriptionData().then(data=>{
    if(!data.push_endpoint)pushDataPromise=null;
    return data;
  },error=>{
    pushDataPromise=null;
    throw error;
  });
  return pushDataPromise;
}
function primePushSubscription(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  void pushSubscriptionData();
}
async function registerDishNotificationWatch(id){
  const item=readDishes().find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const requestId=randomId();
  try{
    const push=await pushSubscriptionData();
    if(!push.push_endpoint||!push.push_p256dh||!push.push_auth||!push.push_public_key){
      throw new Error('Notifications iOS indisponibles sur cet appareil.');
    }
    await haCallService('rest_command','courses_integrate_dish',{
      dish_name:String(item.name||''),
      dish_category:String(item.category||''),
      request_id:requestId,
      ...push
    });
    return true;
  }catch(error){
    setRunning(id,false);
    appNotify('Notification non armée',String(error?.message||'Réessaie après avoir vérifié les notifications.').slice(0,140));
    return false;
  }
}

function installStyle(){
  if(document.getElementById('missing-products-fixes-style'))return;
  const style=document.createElement('style');
  style.id='missing-products-fixes-style';
  style.textContent=`
    #missingProductsDialog #missingProductsList[hidden],
    #missingProductsDialog #missingDishesList[hidden]{display:none!important}
    #missingProductsDialog .missing-dish-progress{display:inline-flex!important;width:max-content!important;margin-top:1px;padding:4px 8px!important;border-radius:999px;background:#eef3ff!important;color:#41669b!important;font-size:10px!important;line-height:1.1!important;font-weight:800!important}
    #missingProductsDialog .missing-dish-integrate.is-running{opacity:.52!important}
  `;
  document.head.appendChild(style);
}
function decorateRows(dialog){
  const running=pruneRunning();
  dialog.querySelectorAll('[data-missing-dish-row]').forEach(row=>{
    const id=String(row.dataset.missingDishRow||'');
    const active=running.has(id);
    const copy=row.querySelector('.missing-product-copy');
    let progress=copy?.querySelector('.missing-dish-progress');
    if(active&&!progress&&copy){
      progress=document.createElement('small');
      progress.className='missing-dish-progress';
      progress.textContent='En cours…';
      copy.appendChild(progress);
    }
    if(!active&&progress)progress.remove();
    const button=row.querySelector('[data-integrate-missing-dish]');
    if(button){
      button.disabled=active;
      button.classList.toggle('is-running',active);
      button.setAttribute('aria-disabled',String(active));
    }
  });
}

function openNativeChatGpt(){
  let fallbackTimer=0;
  const stopFallback=()=>{
    if(document.visibilityState!=='hidden')return;
    clearTimeout(fallbackTimer);
    document.removeEventListener('visibilitychange',stopFallback);
  };
  document.addEventListener('visibilitychange',stopFallback);
  try{window.location.href=CHATGPT_APP_URL}catch(_){}
  fallbackTimer=setTimeout(()=>{
    document.removeEventListener('visibilitychange',stopFallback);
    if(document.visibilityState==='hidden')return;
    window.location.href=CHATGPT_WEB_URL;
  },1400);
  return {opener:null};
}
function armChatGptOpenOverride(readyPromise=null){
  const nativeOpen=window.open;
  const patched=function(url,target,features){
    if(!String(url||'').startsWith(CHATGPT_WEB_URL))return nativeOpen.call(window,url,target,features);
    const launch=()=>openNativeChatGpt();
    if(readyPromise){
      Promise.race([
        Promise.resolve(readyPromise),
        new Promise(resolve=>setTimeout(resolve,3500))
      ]).finally(launch);
      return {opener:null};
    }
    return launch();
  };
  window.open=patched;
  queueMicrotask(()=>{
    if(window.open===patched)window.open=nativeOpen;
  });
}

function bindDialog(dialog){
  if(!dialog||dialog.dataset.missingFixesBound==='1')return false;
  const categorySelect=dialog.querySelector('.missing-category-select');
  const dishesList=dialog.querySelector('#missingDishesList');
  if(!categorySelect||!dishesList)return false;
  dialog.dataset.missingFixesBound='1';

  categorySelect.addEventListener('click',event=>event.stopPropagation(),true);

  dialog.addEventListener('click',event=>{
    const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
    if(!integrate)return;
    if(integrate.matches('[data-integrate-missing-dish]')){
      const id=integrate.dataset.integrateMissingDish||'';
      setRunning(id,true);
      queueMicrotask(()=>decorateRows(dialog));
      armChatGptOpenOverride(registerDishNotificationWatch(id));
      return;
    }
    armChatGptOpenOverride();
  },true);

  const observer=new MutationObserver(()=>decorateRows(dialog));
  observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  dialog.addEventListener('close',()=>pruneRunning());
  document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',primePushSubscription);
  decorateRows(dialog);
  primePushSubscription();
  return true;
}
function init(){
  installStyle();
  installHaBridge();
  const dialog=document.getElementById('missingProductsDialog');
  if(bindDialog(dialog))return;
  const observer=new MutationObserver(()=>{
    if(bindDialog(document.getElementById('missingProductsDialog')))observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

installHaBridge();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
