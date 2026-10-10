(()=>{
'use strict';

const REQUESTS=window.COURSES_MISSING_REQUESTS;
if(!REQUESTS)throw new Error('Demandes manquantes indisponibles');
const STORAGE_RUNNING_DISHES='courses-missing-dishes-running-v1';
const STORAGE_RUNNING_PRODUCTS='courses-missing-products-running-v1';
const STORAGE_OPENAI_REQUESTS='courses-openai-request-status-v1';
const PRODUCT_PREFIX='__courses_product__:';
const PRODUCT_IMAGE_HINT_MARKER='||__courses_image_hint__:';
const OPENAI_RUNS_URL='https://api.github.com/repos/fabien95430/Dashboard-course/actions/workflows/integrate-dish-openai.yml/runs?event=repository_dispatch&per_page=100';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const OPENAI_COOLDOWN_MS=30000;
const OPENAI_RECONCILE_MIN_MS=15000;
const OPENAI_STALE_RUNNING_MS=60*60*1000;

let pushDataPromise=null;
let pushDataCache=null;
let permissionPromise=null;
let openAiReconcilePromise=null;
let lastOpenAiReconcileAt=0;
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

function productOpenAiCategory(item){
  const category=String(item?.category||'');
  const hint=REQUESTS.productImageHint(item?.name);
  return hint?category+PRODUCT_IMAGE_HINT_MARKER+encodeURIComponent(hint):category;
}
function itemsForType(type){return type==='product'?REQUESTS.readProducts():REQUESTS.readDishes()}
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
function openAiRequestKey(type,id){return type+':'+String(id||'')}
function readOpenAiRequests(){
  const value=readJson(STORAGE_OPENAI_REQUESTS,{});
  return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}
function saveOpenAiRequests(requests){
  try{localStorage.setItem(STORAGE_OPENAI_REQUESTS,JSON.stringify(requests))}catch(_){}
}
function openAiRequestState(type,id){
  const value=readOpenAiRequests()[openAiRequestKey(type,id)];
  return value&&typeof value==='object'?value:null;
}
function setOpenAiRequestState(type,id,state){
  const key=openAiRequestKey(type,id);
  if(!String(id||''))return;
  const requests=readOpenAiRequests();
  if(state)requests[key]=state;
  else delete requests[key];
  saveOpenAiRequests(requests);
}
function pruneOpenAiRequests(){
  const current={
    product:currentIds('product'),
    dish:currentIds('dish')
  };
  const requests=readOpenAiRequests();
  let changed=false;
  Object.keys(requests).forEach(key=>{
    const separator=key.indexOf(':');
    const type=separator>0?key.slice(0,separator):'';
    const id=separator>0?key.slice(separator+1):'';
    if((type==='product'||type==='dish')&&current[type].has(id))return;
    delete requests[key];
    changed=true;
  });
  if(changed)saveOpenAiRequests(requests);
  return requests;
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

function trackedRunningOpenAiRequests(){
  const requests=pruneOpenAiRequests();
  return Object.entries(requests).flatMap(([key,state])=>{
    if(state?.status!=='running'||!state.requestId)return [];
    const separator=key.indexOf(':');
    if(separator<=0)return [];
    const type=key.slice(0,separator);
    const id=key.slice(separator+1);
    if(type!=='product'&&type!=='dish')return [];
    return [{key,type,id,state}];
  });
}
function markOpenAiCancelled(entry){
  const current=openAiRequestState(entry.type,entry.id);
  if(!current||current.status==='cancelled')return null;
  const item=itemsForType(entry.type).find(value=>String(value?.id||'')===entry.id);
  const name=String(item?.name||current.name||'').trim()||(entry.type==='product'?'Produit':'Plat');
  setRunning(entry.type,entry.id,false);
  openAiCooldown.delete(cooldownKey(entry.type,entry.id));
  openAiErrors.delete(cooldownKey(entry.type,entry.id));
  setOpenAiRequestState(entry.type,entry.id,{...current,status:'cancelled',name,cancelledAt:Date.now()});
  return name;
}
function markOpenAiFailed(entry,conclusion='failure'){
  const current=openAiRequestState(entry.type,entry.id);
  if(!current||current.status==='failed')return null;
  const item=itemsForType(entry.type).find(value=>String(value?.id||'')===entry.id);
  const name=String(item?.name||current.name||'').trim()||(entry.type==='product'?'Produit':'Plat');
  const key=cooldownKey(entry.type,entry.id);
  setRunning(entry.type,entry.id,false);
  openAiCooldown.delete(key);
  openAiErrors.add(key);
  setOpenAiRequestState(entry.type,entry.id,{...current,status:'failed',name,conclusion,failedAt:Date.now()});
  return name;
}
function notifyOpenAiCancelled(names){
  const unique=[...new Set(names.filter(Boolean))];
  if(!unique.length)return;
  if(unique.length===1){
    appNotify('Intégration OpenAI annulée',unique[0]+' peut être relancé.');
    return;
  }
  appNotify('Intégrations OpenAI annulées',unique.length+' demandes peuvent être relancées.');
}
function notifyOpenAiFailed(names){
  const unique=[...new Set(names.filter(Boolean))];
  if(!unique.length)return;
  if(unique.length===1){
    appNotify('Intégration OpenAI échouée',unique[0]+' peut être relancé.');
    return;
  }
  appNotify('Intégrations OpenAI échouées',unique.length+' demandes peuvent être relancées.');
}
async function reconcileOpenAiRequests(){
  const tracked=trackedRunningOpenAiRequests();
  if(!tracked.length)return false;
  const now=Date.now();
  if(openAiReconcilePromise)return openAiReconcilePromise;
  if(now-lastOpenAiReconcileAt<OPENAI_RECONCILE_MIN_MS)return false;
  lastOpenAiReconcileAt=now;
  openAiReconcilePromise=(async()=>{
    try{
      const response=await fetch(OPENAI_RUNS_URL,{
        headers:{Accept:'application/vnd.github+json'},
        cache:'no-store'
      });
      if(!response.ok)return false;
      const data=await response.json();
      const runs=Array.isArray(data?.workflow_runs)?data.workflow_runs:[];
      const cancelled=[];
      const failed=[];
      tracked.forEach(entry=>{
        const run=runs.find(candidate=>String(candidate?.display_title||'').includes(entry.state.requestId));
        if(!run){
          const startedAt=Number(entry.state.startedAt)||0;
          if(startedAt&&now-startedAt>=OPENAI_STALE_RUNNING_MS){
            const name=markOpenAiFailed(entry,'introuvable');
            if(name)failed.push(name);
          }
          return;
        }
        if(run.status!=='completed')return;
        if(run.conclusion==='cancelled'){
          const name=markOpenAiCancelled(entry);
          if(name)cancelled.push(name);
          return;
        }
        if(run.conclusion&&run.conclusion!=='success'){
          const name=markOpenAiFailed(entry,String(run.conclusion));
          if(name)failed.push(name);
        }
      });
      if(!cancelled.length&&!failed.length)return false;
      decorateOpenAiButtons();
      notifyOpenAiCancelled(cancelled);
      notifyOpenAiFailed(failed);
      return true;
    }catch(_){
      return false;
    }finally{
      openAiReconcilePromise=null;
    }
  })();
  return openAiReconcilePromise;
}
function requestOpenAiReconciliation(){
  void reconcileOpenAiRequests();
}

function sharedHaClient(){
  const client=window.COURSES_HA_CLIENT;
  if(!client||typeof client.request!=='function'||typeof client.callService!=='function'||typeof client.getStates!=='function'||typeof client.isConnected!=='function'){
    throw new Error('Client Home Assistant indisponible.');
  }
  return client;
}
function haRequest(payload){return sharedHaClient().request(payload)}
function haCallService(domain,service,serviceData={}){return sharedHaClient().callService(domain,service,serviceData)}

function base64UrlToBytes(value){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from(raw,char=>char.charCodeAt(0));
}
async function readVapidPublicKey(){
  const states=await sharedHaClient().getStates();
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
async function integrateWithOpenAi(type,id,requestId){
  const item=itemsForType(type).find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const serviceData={
    dish_name:(type==='product'?PRODUCT_PREFIX:'')+String(item.name||''),
    dish_category:type==='product'?productOpenAiCategory(item):String(item.category||''),
    request_id:String(requestId||randomId())
  };
  let push;
  try{
    push=await requiredPushData();
  }catch(error){
    const detail=String(error?.message||'Impossible d’armer la notification de fin.').slice(0,140);
    window.CoursesErrors?.report?.({key:'notifications:'+detail.toLowerCase(),severity:'error',source:'Notifications',title:'Notifications indisponibles',message:detail});
    appNotify('Notification requise',detail);
    return false;
  }
  try{
    await haCallService('rest_command','courses_integrate_dish_openai',{...serviceData,...push});
    void notifyIntegrationStarted(type,item,serviceData.request_id);
    window.CoursesErrors?.resolvePrefix?.('integration-local:');
    window.CoursesErrors?.resolvePrefix?.('notifications:');
    appNotify('Intégration OpenAI lancée',String(item.name||''));
    return true;
  }catch(error){
    const detail=String(error?.message||'Réessaie après avoir vérifié Home Assistant.').slice(0,140);
    window.CoursesErrors?.report?.({key:'integration-local:'+detail.toLowerCase(),severity:'error',source:'Intégration',title:'Intégration impossible',message:detail,action:'open-missing'});
    appNotify('Intégration OpenAI impossible',detail);
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
    #missingProductsDialog .missing-dish-progress.is-cancelled{background:rgba(142,142,147,.12)!important;color:#6e6e73!important}
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
    const request=openAiRequestState(type,id);
    const cancelled=!added&&request?.status==='cancelled';
    const persistedFailed=!added&&request?.status==='failed';
    const active=!added&&!cancelled&&!persistedFailed&&running.has(id);
    const failed=!added&&!active&&!cancelled&&(persistedFailed||openAiErrors.has(cooldownKey(type,id)));
    const copy=row.querySelector('.missing-product-copy');
    let progress=copy?.querySelector('.missing-dish-progress');
    if((active||failed||cancelled)&&copy){
      if(!progress){
        progress=document.createElement('small');
        progress.className='missing-dish-progress';
        progress.setAttribute('role','status');
        copy.appendChild(progress);
      }
      const progressLabel=cancelled?'Annulé':failed?'Erreur':'En cours';
      if(progress.textContent!==progressLabel)progress.textContent=progressLabel;
      progress.classList.toggle('is-error',failed);
      progress.classList.toggle('is-cancelled',cancelled);
      progress.classList.toggle('missing-dish-error',failed||cancelled);
      const progressAriaLabel=cancelled?'Intégration annulée':failed?'Erreur lors de l’intégration':'Intégration en cours';
      if(progress.getAttribute('aria-label')!==progressAriaLabel)progress.setAttribute('aria-label',progressAriaLabel);
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
    row.classList.toggle('is-cancelled-request',cancelled);
    if(type==='dish')row.classList.toggle('is-added-request',added);
  });
}
function ensureOpenAiButton(row,type,id,running,added=false,cancelled=false,failed=false){
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
  const retryable=cancelled||failed;
  if(type==='product')button.dataset.openaiMissingProduct=id;
  else button.dataset.openaiMissingDish=id;
  button.dataset.openaiMissingType=type;
  button.dataset.openaiMissingId=id;
  const noun=type==='product'?'produit':'plat';
  button.title=added?(type==='product'?'Produit déjà ajouté':'Plat déjà ajouté'):retryable?'Relancer avec OpenAI':'Intégration OpenAI';
  button.setAttribute('aria-label',added?(type==='product'?'Produit déjà ajouté':'Plat déjà ajouté'):running?'Intégration de ce '+noun+' en cours':retryable?'Relancer ce '+noun+' avec OpenAI':'Intégrer ce '+noun+' avec OpenAI');
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
    if(id){
      const status=openAiRequestState('product',id)?.status;
      const cancelled=status==='cancelled';
      const failed=status==='failed';
      ensureOpenAiButton(row,'product',id,runningProducts.has(id)&&!cancelled&&!failed,false,cancelled,failed);
    }
  });
  dialog.querySelectorAll('[data-missing-dish-row]').forEach(row=>{
    const id=String(row.dataset.missingDishRow||'');
    const actions=row.querySelector('.missing-dish-actions');
    if(!id||!actions)return;
    const added=row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request');
    const status=openAiRequestState('dish',id)?.status;
    const cancelled=!added&&status==='cancelled';
    const failed=!added&&status==='failed';
    ensureOpenAiButton(row,'dish',id,!added&&!cancelled&&!failed&&runningDishes.has(id),added,cancelled,failed);
  });
  document.dispatchEvent(new CustomEvent('courses:missing-integration-ui-updated'));
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
      const item=itemsForType(type).find(entry=>String(entry?.id||'')===id);
      if(!item)return;
      const requestId=randomId();
      setOpenAiRequestState(type,id,{
        requestId,
        status:'running',
        name:String(item.name||''),
        startedAt:Date.now()
      });
      setRunning(type,id,true);
      openAiCooldown.add(key);
      button.disabled=true;
      button.classList.add('is-running');
      button.setAttribute('aria-disabled','true');
      button.setAttribute('aria-busy','true');
      queueMicrotask(decorateOpenAiButtons);
      navigator.vibrate?.(12);
      void integrateWithOpenAi(type,id,requestId).then(ok=>{
        if(!ok){
          openAiErrors.add(key);
          openAiCooldown.delete(key);
          setRunning(type,id,false);
          setOpenAiRequestState(type,id,null);
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
    setOpenAiRequestState(type,id,null);
    setRunning(type,id,true);
    queueMicrotask(decorateOpenAiButtons);
  },true);

  const bindDialog=()=>{
    const dialog=document.getElementById('missingProductsDialog');
    if(!dialog)return false;
    decorateOpenAiButtons();
    requestOpenAiReconciliation();
    dialog.addEventListener('close',()=>{
      pruneRunning('product');
      pruneRunning('dish');
      pruneOpenAiRequests();
    });
    return true;
  };
  document.addEventListener('courses:missing-requests-rendered',decorateOpenAiButtons);
  document.addEventListener('courses:dialog-opened',event=>{
    if(event.detail?.id!=='missingProductsDialog')return;
    decorateOpenAiButtons();
    requestOpenAiReconciliation();
  });
  document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',requestOpenAiReconciliation);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')requestOpenAiReconciliation();
  });
  window.addEventListener('focus',requestOpenAiReconciliation,{passive:true});
  if(!bindDialog()&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindDialog,{once:true});
}

bindOpenAiUi();
})();