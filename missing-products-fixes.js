(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_PRODUCTS='courses-missing-products-v1';
const STORAGE_RUNNING_DISHES='courses-missing-dishes-running-v1';
const STORAGE_RUNNING_PRODUCTS='courses-missing-products-running-v1';
const PRODUCT_PREFIX='__courses_product__:';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const OPENAI_COOLDOWN_MS=30000;

let haSocket=null;
let haSeq=980000000;
const haPending=new Map();
let pushDataPromise=null;
let pushDataCache=null;
let permissionPromise=null;
const openAiCooldown=new Set();
const openAiErrors=new Set();

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
function readProducts(){
  const value=readJson(STORAGE_PRODUCTS,[]);
  return Array.isArray(value)?value:[];
}
function itemsForType(type){return type==='product'?readProducts():readDishes()}
function runningKey(type){return type==='product'?STORAGE_RUNNING_PRODUCTS:STORAGE_RUNNING_DISHES}
function readRunning(type){
  const value=readJson(runningKey(type),[]);
  return new Set(Array.isArray(value)?value.map(String):[]);
}
function saveRunning(type,running){
  try{localStorage.setItem(runningKey(type),JSON.stringify([...running]))}catch(_){}
}
function currentIds(type){
  return new Set(itemsForType(type).map(item=>String(item?.id||'')).filter(Boolean));
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
  const value=String(id||'');
  if(!value)return;
  const running=readRunning(type);
  if(active)running.add(value);
  else running.delete(value);
  saveRunning(type,running);
}
function cooldownKey(type,id){return type+':'+String(id||'')}
function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function appNotify(title,detail=''){
  const dialog=document.getElementById('missingProductsDialog');
  let toast=dialog?.open?dialog.querySelector('.courses-openai-feedback'):document.getElementById('toast');
  if(dialog?.open&&!toast){
    toast=document.createElement('div');
    toast.className='courses-openai-feedback';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    dialog.appendChild(toast);
  }
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
async function notifyIntegrationStarted(type,item,requestId){
  if(Notification.permission!=='granted')return;
  try{
    const registration=await navigator.serviceWorker.ready;
    const itemName=String(item?.name||'').trim()||(type==='product'?'Produit':'Plat');
    await registration.showNotification('Demande envoyée',{
      body:itemName+' est en cours de génération.',
      tag:requestId?'courses-'+type+'-'+requestId+'-started':'courses-'+type+'-started',
      icon:'./apple-touch-icon.png',
      badge:'./apple-touch-icon.png',
      data:{url:'./'},
      renotify:true
    });
  }catch(_){}
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
async function requiredPushData(){
  if(!notificationSupported()||!('PushManager' in window)){
    throw new Error('Web Push indisponible sur cet appareil.');
  }
  const permission=await ensureNotificationPermission();
  if(permission!=='granted'){
    throw new Error('Notifications non autorisées. Active-les pour Courses dans les réglages iOS.');
  }
  const push=await pushSubscriptionData();
  if(push.push_endpoint&&push.push_p256dh&&push.push_auth&&push.push_public_key)return push;
  let publicKey='';
  try{publicKey=await readVapidPublicKey()}catch(_){}
  if(!publicKey){
    throw new Error('Clé VAPID publique absente dans Home Assistant.');
  }
  throw new Error('Souscription Web Push impossible. Réessaie après avoir rouvert l’application.');
}
async function integrateWithOpenAi(type,id){
  const item=itemsForType(type).find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const serviceData={
    dish_name:(type==='product'?PRODUCT_PREFIX:'')+String(item.name||''),
    dish_category:String(item.category||''),
    request_id:randomId()
  };
  let push;
  try{
    push=await requiredPushData();
  }catch(error){
    appNotify('Notification requise',String(error?.message||'Impossible d’armer la notification de fin.').slice(0,140));
    return false;
  }
  try{
    await haCallService('rest_command','courses_integrate_dish_openai',{...serviceData,...push});
    void notifyIntegrationStarted(type,item,serviceData.request_id);
    appNotify('Intégration OpenAI lancée',String(item.name||''));
    return true;
  }catch(error){
    appNotify('Intégration OpenAI impossible',String(error?.message||'Réessaie après avoir vérifié Home Assistant.').slice(0,140));
    return false;
  }
}

function installOpenAiStyle(){
  if(document.getElementById('courses-openai-split-button-style'))return;
  const style=document.createElement('style');
  style.id='courses-openai-split-button-style';
  style.textContent=`
    #missingProductsDialog .missing-dish-actions{gap:0!important;align-items:stretch!important}
    #missingProductsDialog .missing-dish-integrate{border-radius:999px 0 0 999px!important;padding-left:14px!important;padding-right:13px!important}
    #missingProductsDialog .missing-dish-openai{display:grid!important;place-items:center!important;width:40px!important;min-width:40px!important;min-height:40px!important;padding:0!important;border:0!important;border-left:1px solid rgba(11,112,64,.16)!important;border-radius:0 999px 999px 0!important;background:#d8eee0!important;color:#0b7040!important;font-size:18px!important;font-weight:900!important;line-height:1!important;box-shadow:inset 1px 0 0 rgba(255,255,255,.42)!important;touch-action:manipulation;-webkit-user-select:none;user-select:none}
    #missingProductsDialog .missing-dish-openai:active{transform:scale(.96)}
    #missingProductsDialog .missing-dish-openai:disabled{opacity:.45!important;transform:none!important}
    #missingProductsDialog .missing-dish-openai:focus-visible{outline:2px solid rgba(11,112,64,.25)!important;outline-offset:2px!important}
    #missingProductsDialog .missing-dish-progress{display:inline-flex!important;align-items:center!important;width:max-content!important;margin:0!important;padding:3px 7px!important;border-radius:999px!important;background:rgba(255,149,0,.11)!important;color:#b96500!important;font-size:9.5px!important;line-height:1!important;font-weight:780!important;white-space:nowrap!important}
    #missingProductsDialog .missing-dish-progress.is-error{background:rgba(255,59,48,.10)!important;color:#d93025!important}
    #missingProductsDialog .missing-product-integrate.is-running,#missingProductsDialog .missing-dish-integrate.is-running{background:#edf0ee!important;color:#7a837e!important;opacity:1!important;box-shadow:none!important}
    #missingProductsDialog .missing-dish-integrate.is-added{background:#edf0ee!important;color:#65736b!important;opacity:1!important;box-shadow:none!important}
    #missingProductsDialog .missing-dish-openai.is-running{background:#edf0ee!important;color:#8a928d!important;border-left-color:#dfe4e1!important;opacity:1!important}
    #missingProductsDialog .courses-openai-feedback{position:absolute;z-index:80;left:14px;right:14px;bottom:14px;padding:9px 11px;border-radius:14px;background:rgba(24,36,29,.94);color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.22);font-size:11.5px;line-height:1.2;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .18s ease,transform .18s ease}
    #missingProductsDialog .courses-openai-feedback.is-visible{opacity:1;transform:translateY(0)}
    @media(max-width:390px){#missingProductsDialog .missing-dish-integrate{padding-left:11px!important;padding-right:10px!important}#missingProductsDialog .missing-dish-openai{width:36px!important;min-width:36px!important;min-height:40px!important;font-size:16px!important}}
  `;
  document.head.appendChild(style);
}
function decorateRunningRows(dialog,type,running){
  const rowSelector=type==='product'?'[data-missing-product-row]':'[data-missing-dish-row]';
  const rowData=type==='product'?'missingProductRow':'missingDishRow';
  const integrateSelector=type==='product'?'[data-integrate-missing-product]':'[data-integrate-missing-dish]';
  dialog.querySelectorAll(rowSelector).forEach(row=>{
    const id=String(row.dataset[rowData]||'');
    const added=type==='dish'&&(row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request'));
    const active=!added&&running.has(id);
    const failed=!added&&!active&&openAiErrors.has(cooldownKey(type,id));
    const copy=row.querySelector('.missing-product-copy');
    let progress=copy?.querySelector('.missing-dish-progress');
    if((active||failed)&&copy){
      if(!progress){
        progress=document.createElement('small');
        progress.className='missing-dish-progress';
        progress.setAttribute('role','status');
        copy.appendChild(progress);
      }
      progress.textContent=failed?'Erreur':'En cours';
      progress.classList.toggle('is-error',failed);
      progress.setAttribute('aria-label',failed?'Erreur lors de l’intégration':'Intégration en cours');
    }else if(progress){
      progress.remove();
    }
    const integrate=row.querySelector(integrateSelector);
    if(integrate){
      integrate.disabled=added||active;
      integrate.classList.toggle('is-running',active);
      integrate.classList.toggle('is-added',added);
      integrate.setAttribute('aria-disabled',String(added||active));
      const label=added?'Ajouté ✓':active?'En cours…':'Intégrer';
      if(integrate.textContent!==label)integrate.textContent=label;
    }
    row.classList.toggle('is-running-request',active);
    row.classList.toggle('is-error-request',failed);
    if(type==='dish')row.classList.toggle('is-added-request',added);
  });
}
function ensureOpenAiButton(row,type,id,running,added=false){
  const attribute=type==='product'?'data-openai-missing-product':'data-openai-missing-dish';
  let button=row.querySelector('['+attribute+']');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    if(type==='dish'){
      button.className='missing-dish-openai';
      button.innerHTML='<span aria-hidden="true">✦</span>';
      row.querySelector('.missing-dish-actions')?.appendChild(button);
    }else{
      button.className='missing-product-openai-trigger';
      button.hidden=true;
      row.appendChild(button);
    }
  }
  const key=cooldownKey(type,id);
  if(type==='product')button.dataset.openaiMissingProduct=id;
  else button.dataset.openaiMissingDish=id;
  button.dataset.openaiMissingType=type;
  button.dataset.openaiMissingId=id;
  const noun=type==='product'?'produit':'plat';
  button.title=added?(type==='product'?'Produit déjà ajouté':'Plat déjà ajouté'):'Intégration OpenAI';
  button.setAttribute('aria-label',added?(type==='product'?'Produit déjà ajouté':'Plat déjà ajouté'):running?'Intégration de ce '+noun+' en cours':'Intégrer ce '+noun+' avec OpenAI');
  button.disabled=added||running||openAiCooldown.has(key);
  button.classList.toggle('is-running',running);
  button.setAttribute('aria-disabled',String(button.disabled));
  return button;
}
function decorateOpenAiButtons(){
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return false;
  const runningProducts=pruneRunning('product');
  const runningDishes=pruneRunning('dish');
  decorateRunningRows(dialog,'product',runningProducts);
  decorateRunningRows(dialog,'dish',runningDishes);
  dialog.querySelectorAll('[data-missing-product-row]').forEach(row=>{
    const id=String(row.dataset.missingProductRow||'');
    if(id)ensureOpenAiButton(row,'product',id,runningProducts.has(id));
  });
  dialog.querySelectorAll('[data-missing-dish-row]').forEach(row=>{
    const id=String(row.dataset.missingDishRow||'');
    const actions=row.querySelector('.missing-dish-actions');
    if(!id||!actions)return;
    const added=row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request');
    ensureOpenAiButton(row,'dish',id,!added&&runningDishes.has(id),added);
  });
  return true;
}
function bindOpenAiUi(){
  if(document.documentElement.dataset.coursesOpenAiSplitButton==='1')return;
  document.documentElement.dataset.coursesOpenAiSplitButton='1';
  installOpenAiStyle();

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-openai-missing-product],[data-openai-missing-dish]');
    if(button){
      event.preventDefault();
      event.stopImmediatePropagation();
      const type=button.matches('[data-openai-missing-product]')?'product':'dish';
      const id=String(type==='product'?button.dataset.openaiMissingProduct:button.dataset.openaiMissingDish||'');
      const key=cooldownKey(type,id);
      if(!id||button.disabled||openAiCooldown.has(key))return;
      openAiErrors.delete(key);
      setRunning(type,id,true);
      openAiCooldown.add(key);
      button.disabled=true;
      button.classList.add('is-running');
      button.setAttribute('aria-disabled','true');
      button.setAttribute('aria-busy','true');
      queueMicrotask(decorateOpenAiButtons);
      navigator.vibrate?.(12);
      void integrateWithOpenAi(type,id).then(ok=>{
        if(!ok){
          openAiErrors.add(key);
          openAiCooldown.delete(key);
          setRunning(type,id,false);
        }else{
          openAiErrors.delete(key);
        }
      }).finally(()=>{
        button.removeAttribute('aria-busy');
        decorateOpenAiButtons();
      });
      setTimeout(()=>{
        openAiCooldown.delete(key);
        decorateOpenAiButtons();
      },OPENAI_COOLDOWN_MS);
      return;
    }
    const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
    if(!integrate||integrate.disabled)return;
    const type=integrate.matches('[data-integrate-missing-product]')?'product':'dish';
    const id=type==='product'
      ?String(integrate.dataset.integrateMissingProduct||'')
      :String(integrate.dataset.integrateMissingDish||'');
    if(!id)return;
    openAiErrors.delete(cooldownKey(type,id));
    setRunning(type,id,true);
    queueMicrotask(decorateOpenAiButtons);
  },true);

  const bindDialog=()=>{
    const dialog=document.getElementById('missingProductsDialog');
    if(!dialog)return false;
    decorateOpenAiButtons();
    let decorateQueued=false;
    new MutationObserver(()=>{
      if(decorateQueued)return;
      decorateQueued=true;
      queueMicrotask(()=>{
        decorateQueued=false;
        decorateOpenAiButtons();
      });
    }).observe(dialog,{childList:true,subtree:true});
    dialog.addEventListener('close',()=>{
      pruneRunning('product');
      pruneRunning('dish');
    });
    return true;
  };
  if(bindDialog())return;
  const observer=new MutationObserver(()=>{
    if(bindDialog())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

installHaBridge();
bindOpenAiUi();
})();