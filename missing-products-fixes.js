(()=>{
'use strict';

const CORE_URL='./missing-products-fixes-core.js?v=5';
const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_PRODUCTS='courses-missing-products-v1';
const STORAGE_QUEUED='courses-missing-git-queued-v1';
const PRODUCT_RELAY_PREFIX='__courses_product__:';
const HA_REQUEST_TIMEOUT_MS=12000;
let queueSocket=null;
let queueSeq=970000000;
let queueSyncPromise=null;
const queuePending=new Map();

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){
    return fallback;
  }
}
function readItems(type){
  const value=readJson(type==='product'?STORAGE_PRODUCTS:STORAGE_DISHES,[]);
  return Array.isArray(value)?value:[];
}
function queueKey(type,id){return type+':'+String(id||'')}
function readQueued(){
  const value=readJson(STORAGE_QUEUED,[]);
  return new Set(Array.isArray(value)?value.map(String):[]);
}
function saveQueued(queued){
  try{localStorage.setItem(STORAGE_QUEUED,JSON.stringify([...queued]))}catch(_){}
}
function bindQueueSocket(socket){
  if(!socket||socket===queueSocket)return;
  queueSocket=socket;
  socket.addEventListener('message',event=>{
    let message;
    try{message=JSON.parse(event.data)}catch(_){return}
    if(message.type!=='result'||!queuePending.has(message.id))return;
    const pending=queuePending.get(message.id);
    queuePending.delete(message.id);
    clearTimeout(pending.timer);
    if(message.success)pending.resolve(message.result);
    else pending.reject(new Error(message.error?.message||'Erreur Home Assistant'));
  });
  socket.addEventListener('close',()=>{
    if(queueSocket!==socket)return;
    queueSocket=null;
    queuePending.forEach(pending=>{
      clearTimeout(pending.timer);
      pending.reject(new Error('Connexion Home Assistant interrompue'));
    });
    queuePending.clear();
  });
  queueMicrotask(()=>void syncPendingQueue());
}
function installQueueBridge(){
  if(!('WebSocket' in window)||window.__coursesMissingQueueBridge)return;
  window.__coursesMissingQueueBridge=true;
  const nativeSend=WebSocket.prototype.send;
  WebSocket.prototype.send=function(data){
    try{
      if(String(this.url||'').includes('/api/websocket'))bindQueueSocket(this);
    }catch(_){}
    return nativeSend.call(this,data);
  };
}
function sendQueueRequest(socket,payload){
  return new Promise((resolve,reject)=>{
    const id=queueSeq++;
    const timer=setTimeout(()=>{
      queuePending.delete(id);
      reject(new Error('Home Assistant ne répond pas.'));
    },HA_REQUEST_TIMEOUT_MS);
    queuePending.set(id,{resolve,reject,timer});
    try{socket.send(JSON.stringify({id,...payload}))}
    catch(error){
      clearTimeout(timer);
      queuePending.delete(id);
      reject(error);
    }
  });
}
async function waitForQueueSocket(){
  if(queueSocket?.readyState===WebSocket.OPEN)return queueSocket;
  document.getElementById('refreshBtn')?.click();
  const started=Date.now();
  while(Date.now()-started<1500){
    if(queueSocket?.readyState===WebSocket.OPEN)return queueSocket;
    await new Promise(resolve=>setTimeout(resolve,60));
  }
  throw new Error('Connexion Home Assistant indisponible.');
}
async function enqueueItem(type,item){
  const id=String(item?.id||'').trim();
  const name=String(item?.name||'').trim();
  if(!id||!name)return false;
  const relayName=type==='product'?PRODUCT_RELAY_PREFIX+name:name;
  const socket=await waitForQueueSocket();
  await sendQueueRequest(socket,{
    type:'call_service',
    domain:'rest_command',
    service:'courses_integrate_dish',
    service_data:{
      dish_name:relayName,
      dish_category:String(item?.category||''),
      request_id:'courses-'+type+'-'+id,
      push_endpoint:'',
      push_p256dh:'',
      push_auth:'',
      push_public_key:''
    }
  });
  return true;
}
function syncPendingQueue(){
  if(queueSyncPromise)return queueSyncPromise;
  queueSyncPromise=(async()=>{
    const items=[];
    ['product','dish'].forEach(type=>{
      readItems(type).forEach(item=>{
        const id=String(item?.id||'').trim();
        if(id)items.push({type,item,key:queueKey(type,id)});
      });
    });
    const current=new Set(items.map(entry=>entry.key));
    const queued=readQueued();
    let changed=false;
    [...queued].forEach(key=>{
      if(current.has(key))return;
      queued.delete(key);
      changed=true;
    });
    if(changed)saveQueued(queued);
    for(const entry of items){
      if(queued.has(entry.key))continue;
      try{
        if(!await enqueueItem(entry.type,entry.item))continue;
        queued.add(entry.key);
        saveQueued(queued);
      }catch(_){}
    }
  })().finally(()=>{queueSyncPromise=null});
  return queueSyncPromise;
}

function installQueueHandoff(){
  if(!document.getElementById('missing-products-queue-style')){
    const style=document.createElement('style');
    style.id='missing-products-queue-style';
    style.textContent='#missingProductsDialog .missing-dish-magic{display:none!important}';
    document.head.appendChild(style);
  }

  const bind=()=>{
    const dialog=document.getElementById('missingProductsDialog');
    const productList=document.getElementById('missingProductsList');
    const dishesList=document.getElementById('missingDishesList');
    if(!dialog||!productList||!dishesList)return false;
    [productList,dishesList].forEach(list=>{
      if(list.dataset.queueIntegrationBound==='1')return;
      list.dataset.queueIntegrationBound='1';
      list.addEventListener('click',event=>{
        const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
        if(!integrate)return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },true);
      let queueTimer=0;
      new MutationObserver(()=>{
        clearTimeout(queueTimer);
        queueTimer=setTimeout(()=>void syncPendingQueue(),100);
      }).observe(list,{childList:true,subtree:true});
    });
    document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',()=>void syncPendingQueue(),{passive:true});
    void syncPendingQueue();
    return true;
  };

  if(bind())return;
  const observer=new MutationObserver(()=>{
    if(bind())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

function loadCore(){
  const existing=document.querySelector('script[data-missing-products-fixes-core]');
  if(existing){
    if(existing.dataset.loaded==='1')installQueueHandoff();
    else existing.addEventListener('load',installQueueHandoff,{once:true});
    return;
  }
  const script=document.createElement('script');
  script.src=CORE_URL;
  script.defer=true;
  script.dataset.missingProductsFixesCore='1';
  script.addEventListener('load',()=>{
    script.dataset.loaded='1';
    installQueueHandoff();
  },{once:true});
  document.head.appendChild(script);
}

installQueueBridge();
window.addEventListener('online',()=>void syncPendingQueue(),{passive:true});
loadCore();
})();
