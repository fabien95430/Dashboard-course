(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_RUNNING='courses-missing-dishes-running-v1';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const CHATGPT_WEB_URL='https://chatgpt.com/';
const CHATGPT_APP_URL='com.openai.chat://chatgpt.com/';
const SWIPE_ACTION_WIDTH=88;

let haSocket=null;
let haSeq=950000000;
const haPending=new Map();
let pushDataPromise=null;
let pushDataCache=null;
let openSwipeRow=null;

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
async function registerDishNotificationWatch(id){
  const item=readDishes().find(entry=>String(entry?.id||'')===String(id||''));
  if(!item)return false;
  const requestId=randomId();
  const serviceData={
    dish_name:String(item.name||''),
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
    #missingProductsDialog .missing-products-header h3{font-size:22px!important;line-height:1.08!important;letter-spacing:-.3px!important}
    #missingProductsDialog .missing-dish-progress{display:none!important}
    #missingProductsDialog .missing-dish-integrate.is-running{position:relative!important;min-width:96px!important;padding-left:34px!important;background:#eef8f2!important;color:#4d9472!important;opacity:1!important}
    #missingProductsDialog .missing-dish-integrate.is-running::before{content:"";position:absolute;left:13px;top:50%;width:12px;height:12px;margin-top:-7px;border:2px solid rgba(47,143,92,.22);border-top-color:#2f8f5c;border-radius:50%;animation:missingRequestSpin .8s linear infinite}
    @keyframes missingRequestSpin{to{transform:rotate(360deg)}}
    #missingProductsDialog .missing-product-row.has-swipe-delete{position:relative!important;display:block!important;min-height:70px!important;padding:0!important;border:0!important;border-radius:20px!important;background:#ff453a!important;box-shadow:0 6px 18px #394b3e0b!important;overflow:hidden!important;isolation:isolate!important}
    #missingProductsDialog .missing-row-surface{position:relative!important;z-index:2!important;width:100%!important;min-height:70px!important;box-sizing:border-box!important;padding:10px!important;border:1px solid #edf0ec!important;border-radius:20px!important;background:#fff!important;display:grid!important;align-items:center!important;gap:8px!important;transform:translate3d(0,0,0);transition:transform .24s cubic-bezier(.22,.78,.18,1)!important;touch-action:pan-y!important;will-change:transform}
    #missingProductsDialog .missing-product-row.has-swipe-delete.is-dish .missing-row-surface{grid-template-columns:minmax(0,1fr) auto!important}
    #missingProductsDialog .missing-product-row.has-swipe-delete:not(.is-dish) .missing-row-surface{grid-template-columns:38px minmax(0,1fr) auto!important}
    #missingProductsDialog .missing-product-row.has-swipe-delete .missing-product-remove{position:absolute!important;z-index:1!important;top:0!important;right:0!important;width:${SWIPE_ACTION_WIDTH}px!important;min-width:${SWIPE_ACTION_WIDTH}px!important;height:100%!important;border:0!important;border-radius:0 20px 20px 0!important;background:linear-gradient(160deg,#ff6258,#ef3f36)!important;color:#fff!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;padding:0 6px!important;box-shadow:none!important}
    #missingProductsDialog .missing-product-row.has-swipe-delete .missing-product-remove svg{width:19px!important;height:19px!important;stroke-width:2!important}
    #missingProductsDialog .missing-product-row.has-swipe-delete .missing-remove-label{display:block!important;color:#fff!important;font-size:10px!important;line-height:1!important;font-weight:780!important}
    #missingProductsDialog .missing-product-row.has-swipe-delete .missing-product-remove:focus-visible{outline:2px solid rgba(255,255,255,.9)!important;outline-offset:-4px!important}
    @media(max-width:390px){#missingProductsDialog .missing-products-header h3{font-size:22px!important}#missingProductsDialog .missing-product-row.has-swipe-delete:not(.is-dish) .missing-row-surface{grid-template-columns:32px minmax(0,1fr) auto!important;gap:6px!important}}
    @media(prefers-reduced-motion:reduce){#missingProductsDialog .missing-row-surface{transition:none!important}#missingProductsDialog .missing-dish-integrate.is-running::before{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function setSwipePosition(row,offset,{animate=true,open=false}={}){
  const surface=row?.querySelector('.missing-row-surface');
  const remove=row?.querySelector('.missing-product-remove');
  if(!surface||!remove)return;
  surface.style.transition=animate?'':'none';
  surface.style.transform='translate3d('+offset+'px,0,0)';
  row.classList.toggle('is-swipe-open',open);
  remove.tabIndex=open?0:-1;
  remove.setAttribute('aria-hidden',open?'false':'true');
  if(open)openSwipeRow=row;
  else if(openSwipeRow===row)openSwipeRow=null;
  if(!animate)requestAnimationFrame(()=>surface.style.removeProperty('transition'));
}
function closeSwipeRow(row=openSwipeRow,animate=true){
  if(!row)return;
  setSwipePosition(row,0,{animate,open:false});
}
function prepareSwipeRow(row){
  if(!row||row.dataset.swipeDeleteBound==='1')return;
  const remove=row.querySelector(':scope > .missing-product-remove');
  if(!remove)return;
  const isDish=row.classList.contains('is-dish');
  if(!isDish&&!row.classList.contains('has-integration-action'))return;

  row.dataset.swipeDeleteBound='1';
  row.classList.add('has-swipe-delete');
  const surface=document.createElement('div');
  surface.className='missing-row-surface';
  surface.setAttribute('aria-label','Balayez vers la gauche pour afficher Supprimer');
  [...row.childNodes].forEach(node=>{
    if(node===remove)return;
    surface.appendChild(node);
  });
  row.insertBefore(surface,remove);
  if(!remove.querySelector('.missing-remove-label')){
    const label=document.createElement('span');
    label.className='missing-remove-label';
    label.textContent='Supprimer';
    remove.appendChild(label);
  }
  setSwipePosition(row,0,{animate:false,open:false});

  let gesture=null;
  let suppressClickUntil=0;
  surface.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0||event.target.closest('button,a,input,select,textarea'))return;
    if(openSwipeRow&&openSwipeRow!==row)closeSwipeRow(openSwipeRow);
    gesture={
      id:event.pointerId,
      x:event.clientX,
      y:event.clientY,
      base:row.classList.contains('is-swipe-open')?-SWIPE_ACTION_WIDTH:0,
      offset:row.classList.contains('is-swipe-open')?-SWIPE_ACTION_WIDTH:0,
      axis:'',
      moved:false,
      buzzed:false
    };
    try{surface.setPointerCapture(event.pointerId)}catch(_){}
  });
  surface.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x;
    const dy=event.clientY-gesture.y;
    if(!gesture.axis){
      if(Math.max(Math.abs(dx),Math.abs(dy))<5)return;
      gesture.axis=Math.abs(dx)>Math.abs(dy)*1.12?'x':'y';
    }
    if(gesture.axis!=='x')return;
    event.preventDefault();
    gesture.moved=true;
    let offset=gesture.base+dx;
    if(offset>0)offset*=.18;
    if(offset<-SWIPE_ACTION_WIDTH)offset=-SWIPE_ACTION_WIDTH+(offset+SWIPE_ACTION_WIDTH)*.18;
    offset=Math.max(-SWIPE_ACTION_WIDTH-16,Math.min(12,offset));
    gesture.offset=offset;
    setSwipePosition(row,offset,{animate:false,open:row.classList.contains('is-swipe-open')});
    if(!gesture.buzzed&&offset<=-SWIPE_ACTION_WIDTH*.55){
      gesture.buzzed=true;
      navigator.vibrate?.(4);
    }
  },{passive:false});
  const finish=event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const state=gesture;
    gesture=null;
    try{surface.releasePointerCapture(event.pointerId)}catch(_){}
    if(state.axis!=='x')return;
    const shouldOpen=state.offset<=-SWIPE_ACTION_WIDTH*.42;
    setSwipePosition(row,shouldOpen?-SWIPE_ACTION_WIDTH:0,{animate:true,open:shouldOpen});
    if(shouldOpen)navigator.vibrate?.(5);
    if(state.moved)suppressClickUntil=performance.now()+280;
  };
  surface.addEventListener('pointerup',finish);
  surface.addEventListener('pointercancel',finish);
  surface.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if(row.classList.contains('is-swipe-open')&&!event.target.closest('button,a,input,select,textarea')){
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSwipeRow(row);
    }
  },true);
  remove.addEventListener('click',()=>{
    if(openSwipeRow===row)openSwipeRow=null;
  },true);
}
function prepareSwipeRows(dialog){
  dialog.querySelectorAll('.missing-product-row').forEach(prepareSwipeRow);
}
function decorateRows(dialog){
  const running=pruneRunning();
  dialog.querySelectorAll('[data-missing-dish-row]').forEach(row=>{
    const id=String(row.dataset.missingDishRow||'');
    const active=running.has(id);
    row.querySelector('.missing-dish-progress')?.remove();
    const button=row.querySelector('[data-integrate-missing-dish]');
    if(button){
      button.disabled=active;
      button.classList.toggle('is-running',active);
      button.setAttribute('aria-disabled',String(active));
      button.textContent=active?'En cours…':'Intégrer';
    }
  });
  prepareSwipeRows(dialog);
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
function armChatGptOpenOverride(){
  const nativeOpen=window.open;
  const patched=function(url,target,features){
    if(!String(url||'').startsWith(CHATGPT_WEB_URL))return nativeOpen.call(window,url,target,features);
    return openNativeChatGpt();
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
      void registerDishNotificationWatch(id);
      armChatGptOpenOverride();
      return;
    }
    armChatGptOpenOverride();
  },true);

  dialog.addEventListener('pointerdown',event=>{
    if(!openSwipeRow||openSwipeRow.contains(event.target))return;
    closeSwipeRow(openSwipeRow);
  },true);

  const observer=new MutationObserver(()=>decorateRows(dialog));
  observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  dialog.addEventListener('close',()=>{
    pruneRunning();
    closeSwipeRow(openSwipeRow,false);
  });
  document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',()=>primePushSubscription(true));
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
