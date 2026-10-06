(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_PRODUCTS='courses-missing-products-v1';
const STORAGE_RUNNING_DISHES='courses-missing-dishes-running-v1';
const STORAGE_RUNNING_PRODUCTS='courses-missing-products-running-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const PRODUCT_RELAY_PREFIX='__courses_product__:';
const HA_REQUEST_TIMEOUT_MS=12000;
const AUTO_COOLDOWN_MS=30000;

let haSocket=null;
let haSeq=950000000;
const haPending=new Map();
let pushDataPromise=null;
let pushDataCache=null;
let permissionPromise=null;
const autoCooldown=new Set();

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){
    return fallback;
  }
}
function readItems(type){
  const saved=readJson(type==='product'?STORAGE_PRODUCTS:STORAGE_DISHES,[]);
  return Array.isArray(saved)?saved:[];
}
function runningKey(type){return type==='product'?STORAGE_RUNNING_PRODUCTS:STORAGE_RUNNING_DISHES}
function readRunning(type){
  const saved=readJson(runningKey(type),[]);
  return new Set(Array.isArray(saved)?saved.map(String):[]);
}
function saveRunning(type,running){
  try{localStorage.setItem(runningKey(type),JSON.stringify([...running]))}catch(_){}
}
function currentIds(type){
  return new Set(readItems(type).map(item=>String(item?.id||'')).filter(Boolean));
}
function pruneRunning(type){
  const current=currentIds(type);
  const running=readRunning(type);
  let changed=false;
  [...running].forEach(id=>{
    if(current.has(id))return;
    running.delete(id);
    changed=true;
  });
  if(changed)saveRunning(type,running);
  return running;
}
function setRunning(type,id,active){
  if(!id)return;
  const running=readRunning(type);
  if(active)running.add(String(id));
  else running.delete(String(id));
  saveRunning(type,running);
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
  permissionPromise=Promise.resolve().then(()=>Notification.requestPermission()).catch(()=>Notification.permission).finally(()=>{permissionPromise=null});
  return permissionPromise;
}
async function showSystemNotification(title,body,tag,url='./'){
  if(!notificationSupported()||Notification.permission!=='granted')return false;
  try{
    const registration=await navigator.serviceWorker.ready;
    await registration.showNotification(title,{
      body,
      tag,
      icon:'./apple-touch-icon.png',
      data:{url},
      renotify:false
    });
    return true;
  }catch(_){
    return false;
  }
}
function pendingRequests(){
  const pending=new Map();
  readItems('product').forEach(item=>{
    const id=String(item?.id||'');
    if(id)pending.set('product:'+id,{type:'product',id,name:String(item?.name||'').trim()});
  });
  readItems('dish').forEach(item=>{
    const id=String(item?.id||'');
    if(id)pending.set('dish:'+id,{type:'dish',id,name:String(item?.name||'').trim()});
  });
  return pending;
}
function armRequestCreationNotification(){
  const before=pendingRequests();
  const permission=ensureNotificationPermission();
  setTimeout(async()=>{
    const after=pendingRequests();
    const created=[...after.entries()].filter(([key])=>!before.has(key)).map(([,item])=>item);
    if(!created.length)return;
    await permission;
    for(const item of created){
      const label=item.type==='dish'?'plat':'produit';
      await showSystemNotification(
        'Demande d’ajout créée',
        `${item.name} a bien été enregistré comme ${label} à ajouter.`,
        `courses-request-${item.type}-${item.id}`,
        './'
      );
    }
  },80);
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
function sendHaServiceNow(domain,service,serviceData={}){
  if(haSocket?.readyState!==WebSocket.OPEN)return false;
  try{
    haSocket.send(JSON.stringify({
      id:haSeq++,
      type:'call_service',
      domain,
      service,
      service_data:serviceData
    }));
    return true;
  }catch(_){
    return false;
  }
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
function primePushSubscription(requestPermission=false){
  if(!('Notification' in window))return;
  if(Notification.permission==='default'&&!requestPermission)return;
  if(Notification.permission==='denied')return;
  void pushSubscriptionData();
}
async function registerNotificationWatch(type,id){
  const item=readItems(type).find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const requestId=randomId();
  const itemName=String(item.name||'');
  const relayName=type==='product'?PRODUCT_RELAY_PREFIX+itemName:itemName;
  const serviceData={
    dish_name:relayName,
    dish_category:String(item.category||''),
    request_id:requestId
  };
  if(pushDataCache?.push_endpoint&&pushDataCache.push_p256dh&&pushDataCache.push_auth&&pushDataCache.push_public_key){
    if(sendHaServiceNow('rest_command','courses_integrate_dish',{...serviceData,...pushDataCache}))return true;
  }
  try{
    const push=await pushSubscriptionData();
    if(!push.push_endpoint||!push.push_p256dh||!push.push_auth||!push.push_public_key){
      throw new Error('Notifications iOS indisponibles sur cet appareil.');
    }
    await haCallService('rest_command','courses_integrate_dish',{
      ...serviceData,
      ...push
    });
    return true;
  }catch(error){
    setRunning(type,id,false);
    appNotify('Notification non armée',String(error?.message||'Réessaie après avoir vérifié les notifications.').slice(0,140));
    return false;
  }
}
async function optionalPushData(){
  const empty={push_endpoint:'',push_p256dh:'',push_auth:'',push_public_key:''};
  if(pushDataCache?.push_endpoint)return pushDataCache;
  if(!notificationSupported()||Notification.permission!=='granted')return empty;
  try{return await pushSubscriptionData()}catch(_){return empty}
}
async function integrateDishWithOpenAi(id){
  const item=readItems('dish').find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const serviceData={
    dish_name:String(item.name||''),
    dish_category:String(item.category||''),
    request_id:randomId()
  };
  try{
    const push=await optionalPushData();
    await haCallService('rest_command','courses_integrate_dish_openai',{...serviceData,...push});
    appNotify('Intégration automatique lancée',String(item.name||''));
    return true;
  }catch(error){
    appNotify('Intégration automatique impossible',String(error?.message||'Réessaie après avoir vérifié Home Assistant.').slice(0,140));
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
    #missingProductsDialog .missing-dish-integrate.is-running,
    #missingProductsDialog .missing-product-integrate.is-running{opacity:.52!important}
    #missingProductsDialog .missing-dish-magic{width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;border:1px solid #d9ece1!important;border-radius:12px!important;background:#f5fbf7!important;color:#23905a!important;display:grid!important;place-items:center!important;font-size:17px!important;line-height:1!important;font-weight:800!important;box-shadow:none!important}
    #missingProductsDialog .missing-dish-magic:active{transform:scale(.95)}
    #missingProductsDialog .missing-dish-magic:disabled{opacity:.38!important;transform:none!important}
    #missingProductsDialog .missing-dish-magic:focus-visible{outline:2px solid rgba(35,144,90,.24)!important;outline-offset:2px!important}
    @media(max-width:390px){#missingProductsDialog .missing-dish-magic{width:32px!important;height:32px!important;min-width:32px!important;border-radius:11px!important;font-size:15px!important}}
  `;
  document.head.appendChild(style);
}
function decorateTypeRows(dialog,type){
  const running=pruneRunning(type);
  const rowSelector=type==='product'?'[data-missing-product-row]':'[data-missing-dish-row]';
  const rowData=type==='product'?'missingProductRow':'missingDishRow';
  const buttonSelector=type==='product'?'[data-integrate-missing-product]':'[data-integrate-missing-dish]';
  dialog.querySelectorAll(rowSelector).forEach(row=>{
    const id=String(row.dataset[rowData]||'');
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
    const button=row.querySelector(buttonSelector);
    if(button){
      button.disabled=active;
      button.classList.toggle('is-running',active);
      button.setAttribute('aria-disabled',String(active));
    }
    if(type==='dish'){
      const actions=row.querySelector('.missing-dish-actions');
      if(actions){
        let magic=actions.querySelector('[data-openai-missing-dish]');
        if(!magic){
          magic=document.createElement('button');
          magic.type='button';
          magic.className='missing-dish-magic';
          magic.innerHTML='<span aria-hidden="true">✦</span>';
          magic.title='Intégration automatique';
          actions.appendChild(magic);
        }
        magic.dataset.openaiMissingDish=id;
        magic.setAttribute('aria-label','Intégrer automatiquement ce plat');
        magic.disabled=active||autoCooldown.has(id);
        magic.setAttribute('aria-disabled',String(magic.disabled));
      }
    }
  });
}
function decorateRows(dialog){
  decorateTypeRows(dialog,'product');
  decorateTypeRows(dialog,'dish');
}

function bindDialog(dialog){
  if(!dialog||dialog.dataset.missingFixesBound==='1')return false;
  const categorySelect=dialog.querySelector('.missing-category-select');
  const dishesList=dialog.querySelector('#missingDishesList');
  if(!categorySelect||!dishesList)return false;
  dialog.dataset.missingFixesBound='1';

  categorySelect.addEventListener('click',event=>event.stopPropagation(),true);

  dialog.addEventListener('click',event=>{
    if(event.target.closest?.('#addMissingProduct'))armRequestCreationNotification();
    const magic=event.target.closest?.('[data-openai-missing-dish]');
    if(magic){
      event.preventDefault();
      event.stopImmediatePropagation();
      const id=magic.dataset.openaiMissingDish||'';
      if(!id||magic.disabled)return;
      autoCooldown.add(id);
      decorateRows(dialog);
      navigator.vibrate?.(10);
      void integrateDishWithOpenAi(id).then(ok=>{
        if(!ok)autoCooldown.delete(id);
        decorateRows(dialog);
      });
      setTimeout(()=>{
        autoCooldown.delete(id);
        decorateRows(dialog);
      },AUTO_COOLDOWN_MS);
      return;
    }
    const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
    if(!integrate)return;
    const type=integrate.matches('[data-integrate-missing-product]')?'product':'dish';
    const id=type==='product'?(integrate.dataset.integrateMissingProduct||''):(integrate.dataset.integrateMissingDish||'');
    setRunning(type,id,true);
    queueMicrotask(()=>decorateRows(dialog));
    void registerNotificationWatch(type,id);
  },true);

  const input=dialog.querySelector('#missingProductName');
  input?.addEventListener('keydown',event=>{
    if(event.key==='Enter')armRequestCreationNotification();
  },true);

  const observer=new MutationObserver(()=>decorateRows(dialog));
  observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  dialog.addEventListener('close',()=>{
    pruneRunning('product');
    pruneRunning('dish');
  });
  document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',()=>{
    void ensureNotificationPermission();
    primePushSubscription(true);
  });
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
