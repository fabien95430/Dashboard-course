(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const LONG_PRESS_MS=700;
const MOVE_TOLERANCE_PX=14;

let haSocket=null;
let haSeq=980000000;
const haPending=new Map();
let pushDataPromise=null;
let pushDataCache=null;
let permissionPromise=null;
let activePress=null;
let suppressDishId='';
let suppressUntil=0;

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){
    return fallback;
  }
}
function readDishes(){
  const value=readJson(STORAGE_DISHES,[]);
  return Array.isArray(value)?value:[];
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
function notificationSupported(){
  return 'Notification' in window&&'serviceWorker' in navigator;
}
function ensureNotificationPermission(){
  if(!notificationSupported())return Promise.resolve('unsupported');
  if(Notification.permission!=='default')return Promise.resolve(Notification.permission);
  if(permissionPromise)return permissionPromise;
  permissionPromise=Promise.resolve()
    .then(()=>Notification.requestPermission())
    .catch(()=>Notification.permission)
    .finally(()=>{permissionPromise=null});
  return permissionPromise;
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
      if(String(this.url||'').includes('/api/websocket'))bindHaSocket(this);
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
    try{permission=await ensureNotificationPermission()}catch(_){return empty}
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
  if(pushDataCache?.push_endpoint)return Promise.resolve(pushDataCache);
  if(pushDataPromise)return pushDataPromise;
  pushDataPromise=createPushSubscriptionData().then(data=>{
    if(data.push_endpoint)pushDataCache=data;
    else pushDataPromise=null;
    return data;
  },error=>{
    pushDataPromise=null;
    throw error;
  });
  return pushDataPromise;
}
async function optionalPushData(){
  const empty={push_endpoint:'',push_p256dh:'',push_auth:'',push_public_key:''};
  try{return await pushSubscriptionData()}catch(_){return empty}
}
async function integrateDishWithOpenAi(id){
  const item=readDishes().find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const serviceData={
    dish_name:String(item.name||''),
    dish_category:String(item.category||''),
    request_id:randomId()
  };
  try{
    const push=await optionalPushData();
    await haCallService('rest_command','courses_integrate_dish_openai',{...serviceData,...push});
    appNotify('Intégration OpenAI lancée',String(item.name||''));
    return true;
  }catch(error){
    appNotify('Intégration OpenAI impossible',String(error?.message||'Réessaie après avoir vérifié Home Assistant.').slice(0,140));
    return false;
  }
}

function clearPressTimer(){
  if(activePress?.timer)clearTimeout(activePress.timer);
}
function resetPress(){
  clearPressTimer();
  activePress=null;
}
function startDishLongPress(event,button){
  if(!event.isPrimary||event.button>0||button.disabled)return;
  resetPress();
  const id=String(button.dataset.integrateMissingDish||'');
  if(!id)return;
  const state={
    pointerId:event.pointerId,
    id,
    button,
    x:event.clientX,
    y:event.clientY,
    fired:false,
    timer:0
  };
  state.timer=setTimeout(()=>{
    if(activePress!==state)return;
    state.fired=true;
    suppressDishId=id;
    suppressUntil=Date.now()+2000;
    button.classList.add('is-openai-running');
    button.setAttribute('aria-busy','true');
    navigator.vibrate?.([18,35,18]);
    void integrateDishWithOpenAi(id).finally(()=>{
      button.classList.remove('is-openai-running');
      button.removeAttribute('aria-busy');
    });
  },LONG_PRESS_MS);
  activePress=state;
}
function installLongPress(){
  if(document.documentElement.dataset.coursesOpenAiLongPress==='1')return;
  document.documentElement.dataset.coursesOpenAiLongPress='1';

  if(!document.getElementById('courses-openai-long-press-style')){
    const style=document.createElement('style');
    style.id='courses-openai-long-press-style';
    style.textContent='#missingProductsDialog .missing-dish-integrate{touch-action:manipulation;-webkit-user-select:none;user-select:none}#missingProductsDialog .missing-dish-integrate.is-openai-running{opacity:.55!important}';
    document.head.appendChild(style);
  }

  document.addEventListener('pointerdown',event=>{
    const button=event.target.closest?.('[data-integrate-missing-dish]');
    if(button)startDishLongPress(event,button);
  },true);
  document.addEventListener('pointermove',event=>{
    const state=activePress;
    if(!state||state.pointerId!==event.pointerId||state.fired)return;
    if(Math.hypot(event.clientX-state.x,event.clientY-state.y)>MOVE_TOLERANCE_PX)resetPress();
  },true);
  document.addEventListener('pointerup',event=>{
    const state=activePress;
    if(!state||state.pointerId!==event.pointerId)return;
    clearPressTimer();
    if(state.fired){
      event.preventDefault();
      event.stopPropagation();
    }
    activePress=null;
  },true);
  document.addEventListener('pointercancel',event=>{
    if(activePress?.pointerId===event.pointerId)resetPress();
  },true);
  document.addEventListener('contextmenu',event=>{
    if(event.target.closest?.('[data-integrate-missing-dish]'))event.preventDefault();
  },true);
  document.addEventListener('click',event=>{
    const settings=event.target.closest?.('#settingsMissingProductsBtn');
    if(settings){
      void ensureNotificationPermission().then(permission=>{
        if(permission==='granted')void pushSubscriptionData();
      });
    }
    const button=event.target.closest?.('[data-integrate-missing-dish]');
    if(!button)return;
    const id=String(button.dataset.integrateMissingDish||'');
    if(id===suppressDishId&&Date.now()<suppressUntil){
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressDishId='';
      suppressUntil=0;
    }
  },true);
}

installHaBridge();
installLongPress();
})();
