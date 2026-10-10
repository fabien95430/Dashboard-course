(() => {
'use strict';

const STORAGE_KEY='courses-error-center-v1';
const PUSH_INBOX_CACHE='courses-error-inbox-v1';
const MAX_ENTRIES=80;
const RESOLVED_TTL_MS=30*24*60*60*1000;
const TRANSIENT_PREFIXES=Object.freeze(['resource:','javascript:','promise:','integration-local:','notifications:']);
let currentFilter='active';
let uiBound=false;

function scrub(value,max=900){
  return String(value??'')
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi,'Bearer [masqué]')
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g,'[clé masquée]')
    .replace(/([?&](?:code|token|access_token|refresh_token|auth|p256dh|endpoint)=)[^&\s]+/gi,'$1[masqué]')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
}
function normalize(value){
  return String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function currentAppVersion(){
  return scrub(document.querySelector('.page-version')?.textContent||window.COURSES_APP_VERSION||'',24)||'unknown';
}
function isTransientKey(key){
  const value=String(key||'').toLowerCase();
  return TRANSIENT_PREFIXES.some(prefix=>value.startsWith(prefix));
}
function readEntries(){
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(value)?value:[];
  }catch(_){return []}
}
function writeEntries(entries){
  const now=Date.now();
  const cleaned=entries
    .filter(entry=>entry&&typeof entry==='object')
    .filter(entry=>!entry.resolved||now-Number(entry.resolvedAt||entry.lastAt||entry.createdAt||0)<RESOLVED_TTL_MS)
    .sort((a,b)=>Number(b.lastAt||b.createdAt||0)-Number(a.lastAt||a.createdAt||0))
    .slice(0,MAX_ENTRIES);
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cleaned))}catch(_){}
  notifyChanged(cleaned);
  return cleaned;
}
function publicEntries(){return readEntries().map(entry=>({...entry}))}
function notifyChanged(entries=readEntries()){
  window.dispatchEvent(new CustomEvent('courses-errors-changed',{detail:{active:entries.filter(entry=>!entry.resolved).length,total:entries.length}}));
  updateBadge(entries);
  renderPanel(entries);
}
function reconcilePreviousVersionEntries(){
  const version=currentAppVersion();
  const entries=readEntries();
  const now=Date.now();
  let changed=false;
  entries.forEach(entry=>{
    if(entry.resolved||!isTransientKey(entry.key)||String(entry.appVersion||'')===version)return;
    entry.resolved=true;
    entry.resolvedAt=now;
    changed=true;
  });
  if(changed)writeEntries(entries);
  return changed;
}
function report(input={}){
  const now=Date.now();
  const severity=input.severity==='warning'?'warning':'error';
  const source=scrub(input.source||'Application',60)||'Application';
  const title=scrub(input.title||'Erreur détectée',140)||'Erreur détectée';
  const message=scrub(input.message||'',520);
  const details=scrub(input.details||'',1100);
  const rawKey=input.key||[source,title,message].filter(Boolean).join(':');
  const key=scrub(rawKey,280).toLowerCase()||('error:'+now);
  const action=scrub(input.action||'',40);
  const appVersion=scrub(input.appVersion||currentAppVersion(),24)||'unknown';
  const meta={};
  if(input.meta&&typeof input.meta==='object'){
    for(const [name,value] of Object.entries(input.meta))meta[scrub(name,40)]=scrub(value,180);
  }
  const entries=readEntries();
  const existing=entries.find(entry=>entry.key===key&&!entry.resolved);
  if(existing){
    existing.severity=severity;
    existing.source=source;
    existing.title=title;
    existing.message=message;
    existing.details=details;
    existing.action=action;
    existing.meta=meta;
    existing.appVersion=appVersion;
    existing.lastAt=now;
    existing.count=Math.max(1,Number(existing.count)||1)+1;
    writeEntries(entries);
    return existing.id;
  }
  const id=(globalThis.crypto?.randomUUID?.()||('err-'+now+'-'+Math.random().toString(36).slice(2,9)));
  entries.unshift({id,key,severity,source,title,message,details,action,meta,appVersion,createdAt:now,lastAt:now,count:1,resolved:false,resolvedAt:0});
  writeEntries(entries);
  return id;
}
function resolve(key){
  const wanted=String(key||'').toLowerCase();
  if(!wanted)return false;
  const entries=readEntries();
  let changed=false;
  const now=Date.now();
  entries.forEach(entry=>{
    if(entry.key===wanted&&!entry.resolved){entry.resolved=true;entry.resolvedAt=now;changed=true}
  });
  if(changed)writeEntries(entries);
  return changed;
}
function resolvePrefix(prefix){
  const wanted=String(prefix||'').toLowerCase();
  if(!wanted)return false;
  const entries=readEntries();
  let changed=false;
  const now=Date.now();
  entries.forEach(entry=>{
    if(String(entry.key||'').startsWith(wanted)&&!entry.resolved){entry.resolved=true;entry.resolvedAt=now;changed=true}
  });
  if(changed)writeEntries(entries);
  return changed;
}
function clearResolved(){
  const entries=readEntries().filter(entry=>!entry.resolved);
  writeEntries(entries);
}

window.CoursesErrors=Object.freeze({report,resolve,resolvePrefix,list:publicEntries,clearResolved});

function integrationKey(payload){
  const requestId=scrub(payload?.requestId||payload?.request_id||'',120);
  if(requestId)return 'integration:'+requestId.toLowerCase();
  const type=scrub(payload?.itemType||payload?.type||'item',30);
  const name=scrub(payload?.itemName||payload?.name||'',120);
  return 'integration:'+type.toLowerCase()+':'+normalize(name);
}
function handleIntegrationSignal(payload={}){
  const status=String(payload.status||'').toLowerCase();
  if(status!=='error'&&status!=='added')return;
  const itemType=String(payload.itemType||payload.type||'').toLowerCase()==='product'?'product':'dish';
  const itemName=scrub(payload.itemName||payload.name||(itemType==='product'?'Produit':'Plat'),120);
  const requestId=scrub(payload.requestId||payload.request_id||'',120);
  const key=integrationKey({itemType,itemName,requestId});
  if(status==='added'){
    resolve(key);
    if(!requestId)resolvePrefix('integration:'+itemType+':'+normalize(itemName));
    resolvePrefix('integration-local:');
    return;
  }
  const stage=String(payload.stage||'').toLowerCase();
  const source=stage==='deployment'||stage==='publication'?'Publication':'Intégration';
  const detail=scrub(payload.error||payload.detail||payload.message||'',900);
  report({
    key,
    severity:'error',
    source,
    title:(itemType==='product'?'Produit':'Plat')+' « '+itemName+' »',
    message:detail||'L’intégration n’a pas pu être terminée.',
    details:requestId?'Demande '+requestId:'',
    action:'open-missing',
    meta:{itemType,itemName,requestId}
  });
}
function consumeIntegrationParams(){
  let url;
  try{url=new URL(location.href)}catch(_){return}
  const status=url.searchParams.get('courses_status');
  const product=url.searchParams.get('courses_product');
  const dish=url.searchParams.get('courses_dish');
  if(status&&(product||dish)){
    handleIntegrationSignal({
      status,
      itemType:product?'product':'dish',
      itemName:product||dish,
      requestId:url.searchParams.get('courses_request')||'',
      error:url.searchParams.get('courses_error')||'',
      stage:url.searchParams.get('courses_stage')||''
    });
    ['courses_status','courses_product','courses_dish','courses_request','courses_error','courses_stage'].forEach(key=>url.searchParams.delete(key));
    try{history.replaceState(history.state,'',url.pathname+url.search+url.hash)}catch(_){}
  }
}
async function importPushInbox(){
  if(!('caches' in window))return;
  try{
    const cache=await caches.open(PUSH_INBOX_CACHE);
    const requests=await cache.keys();
    for(const request of requests){
      try{
        const response=await cache.match(request);
        if(response){handleIntegrationSignal(await response.json())}
      }catch(_){}
      try{await cache.delete(request)}catch(_){}
    }
  }catch(_){}
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',event=>{
    if(event.data?.type==='courses-error-signal')handleIntegrationSignal(event.data.payload||{});
  });
}

function resourceInfo(target){
  const tag=String(target?.tagName||'').toUpperCase();
  if(!['IMG','SCRIPT','LINK'].includes(tag))return null;
  const raw=tag==='IMG'?target.currentSrc||target.src:tag==='SCRIPT'?target.src:target.href;
  if(!raw)return null;
  let url;
  try{url=new URL(raw,location.href)}catch(_){return null}
  if(url.origin!==location.origin)return null;
  const path=url.pathname;
  const file=decodeURIComponent(path.split('/').pop()||path);
  if(tag==='IMG'){
    const catalog=path.includes('/www/Items/')||path.includes('/www/Plats/');
    return {
      key:'resource:'+path.toLowerCase(),
      severity:catalog?'warning':'error',
      source:catalog?'Catalogue':'Application',
      title:catalog?'Visuel de catalogue indisponible':'Image essentielle indisponible',
      message:file+' n’a pas pu être chargé.',
      details:path
    };
  }
  return {
    key:'resource:'+path.toLowerCase(),severity:'error',source:'Application',
    title:tag==='SCRIPT'?'Script impossible à charger':'Feuille de style impossible à charger',
    message:file+' n’a pas pu être chargé.',details:path
  };
}
function resolveResourceTarget(target){
  const info=resourceInfo(target);
  if(info)resolve(info.key);
}
function reconcileLoadedResources(){
  document.querySelectorAll('img').forEach(image=>{
    if(image.complete&&image.naturalWidth>0)resolveResourceTarget(image);
  });
  document.querySelectorAll('link[rel~="stylesheet"]').forEach(link=>{
    if(link.sheet)resolveResourceTarget(link);
  });
}
window.addEventListener('load',event=>{
  if(event.target&&event.target!==window)resolveResourceTarget(event.target);
},true);
window.addEventListener('error',event=>{
  if(event.target&&event.target!==window){
    const info=resourceInfo(event.target);
    if(info)report(info);
    return;
  }
  const message=scrub(event.message||'Erreur JavaScript',500);
  if(!message||/ResizeObserver loop/i.test(message)||message==='Script error.')return;
  let path='';
  try{path=event.filename?new URL(event.filename,location.href).pathname:''}catch(_){}
  report({
    key:'javascript:'+normalize(message)+':'+path+':'+String(event.lineno||0),
    severity:'error',source:'Application',title:'Erreur de l’application',message,
    details:[path,event.lineno?('ligne '+event.lineno):'',event.colno?('colonne '+event.colno):''].filter(Boolean).join(' · ')
  });
},true);
window.addEventListener('unhandledrejection',event=>{
  const reason=event.reason;
  const name=String(reason?.name||'');
  const message=scrub(reason?.message||reason||'Promesse rejetée sans gestion',500);
  if(name==='AbortError'||/aborted|annulée par l’utilisateur/i.test(message))return;
  report({key:'promise:'+normalize(message),severity:'error',source:'Application',title:'Opération interrompue',message});
});

function bindHaStatus(){
  const status=document.getElementById('status');
  if(!status||status.dataset.errorCenterBound==='1')return false;
  status.dataset.errorCenterBound='1';
  let lastKey='';
  const sync=()=>{
    const title=scrub(status.querySelector('strong')?.textContent||'',120);
    const detail=scrub(status.querySelector('small')?.textContent||'',300);
    if(status.classList.contains('is-error')){
      lastKey='home-assistant:'+normalize(title+':'+detail).slice(0,180);
      report({key:lastKey,severity:'error',source:'Home Assistant',title:title||'Synchronisation Home Assistant',message:detail||'La synchronisation a rencontré une erreur.',action:'refresh-ha'});
      return;
    }
    if(title==='Synchronisé'||title==='Mode test'){
      resolvePrefix('home-assistant:');
      lastKey='';
    }
  };
  new MutationObserver(sync).observe(status,{attributes:true,childList:true,characterData:true,subtree:true});
  sync();
  return true;
}

function installStyle(){
  if(document.getElementById('courses-error-center-style'))return;
  const style=document.createElement('style');
  style.id='courses-error-center-style';
  style.textContent=`
    #preferencesErrorMessages .security-setting-icon{position:relative;overflow:visible}
    .courses-error-badge{position:absolute;top:-7px;right:-8px;min-width:19px;height:19px;padding:0 5px;border:2px solid #fff;border-radius:999px;background:#ff3b30;color:#fff;font-size:9.5px;line-height:15px;font-weight:850;display:none;place-items:center;box-sizing:border-box;box-shadow:0 2px 7px rgba(207,33,26,.22)}
    .courses-error-center{display:grid;gap:12px;padding-bottom:4px}
    .courses-error-back{justify-self:start;border:0;background:transparent;color:#0b7040;font:inherit;font-size:12px;font-weight:800;padding:2px 0 5px}
    .courses-error-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 13px;border:1px solid rgba(27,65,44,.10);border-radius:18px;background:rgba(248,250,248,.92)}
    .courses-error-summary strong{font-size:14px;color:#22372a}.courses-error-summary small{display:block;margin-top:2px;color:#768078;font-size:10.5px}
    .courses-error-count{min-width:34px;height:34px;padding:0 8px;border-radius:12px;background:rgba(255,59,48,.10);color:#d93025;display:grid;place-items:center;font-size:13px;font-weight:850}
    .courses-error-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:3px;border-radius:14px;background:#edf1ee}
    .courses-error-tabs button{min-height:34px;border:0;border-radius:11px;background:transparent;color:#6b756f;font-size:11px;font-weight:780}.courses-error-tabs button.is-active{background:#fff;color:#1f3327;box-shadow:0 1px 5px rgba(31,51,39,.08)}
    .courses-error-list{display:grid;gap:9px}
    .courses-error-card{padding:12px;border:1px solid rgba(24,52,36,.10);border-radius:18px;background:#fff;box-shadow:0 5px 18px rgba(35,56,43,.045)}
    .courses-error-card-head{display:flex;align-items:flex-start;gap:9px}.courses-error-dot{width:9px;height:9px;margin-top:4px;border-radius:50%;background:#ff3b30;flex:0 0 auto}.courses-error-card.is-warning .courses-error-dot{background:#ff9500}
    .courses-error-card-copy{min-width:0;flex:1}.courses-error-source{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#7a837e;font-size:9.5px;font-weight:760;text-transform:uppercase;letter-spacing:.02em}.courses-error-card h4{margin:3px 0 2px;font-size:12.5px;line-height:1.2;color:#23372a}.courses-error-card p{margin:0;color:#5f6c64;font-size:10.5px;line-height:1.35}
    .courses-error-occurrences{margin-left:auto;color:#9a6a00;font-size:9px;font-weight:800}.courses-error-details{margin-top:8px;padding-top:8px;border-top:1px solid rgba(24,52,36,.08)}.courses-error-details summary{cursor:pointer;color:#667269;font-size:10px;font-weight:760}.courses-error-details div{margin-top:6px;color:#78817c;font-size:9.5px;line-height:1.4;overflow-wrap:anywhere}
    .courses-error-actions{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}.courses-error-actions button{min-height:31px;padding:0 11px;border-radius:11px;border:1px solid rgba(11,112,64,.14);background:#f4f8f5;color:#0b7040;font-size:10px;font-weight:790}.courses-error-actions button[data-error-resolve]{color:#68736c;border-color:rgba(76,91,82,.12);background:#f6f7f6}
    .courses-error-empty{padding:28px 16px;text-align:center;border:1px dashed rgba(43,72,54,.14);border-radius:18px;color:#758078;font-size:11px;line-height:1.4}.courses-error-empty strong{display:block;margin-bottom:4px;color:#2c4635;font-size:13px}
    .courses-error-clear{justify-self:center;border:0;background:transparent;color:#89918c;font-size:10px;font-weight:740;padding:5px 8px}
  `;
  document.head.appendChild(style);
}
function formatDate(value){
  const date=new Date(Number(value)||Date.now());
  try{return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date)}catch(_){return ''}
}
function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function updateBadge(entries=readEntries()){
  const button=document.getElementById('preferencesErrorMessages');
  if(!button)return;
  const active=entries.filter(entry=>!entry.resolved).length;
  const icon=button.querySelector('.security-setting-icon');
  let badge=button.querySelector('.courses-error-badge');
  if(!badge&&icon){badge=document.createElement('span');badge.className='courses-error-badge';badge.setAttribute('aria-hidden','true');icon.appendChild(badge)}
  if(badge){badge.textContent=active>99?'99+':String(active);badge.style.display=active?'grid':'none'}
  const small=button.querySelector('.security-setting-copy small');
  if(small)small.textContent=active?(active+' erreur'+(active>1?'s':'')+' à traiter'):'Aucune erreur active';
}
function panelElements(){
  const dialog=document.getElementById('preferencesDialog');
  const content=dialog?.querySelector(':scope>.preference-dialog-scroll');
  const panel=document.getElementById('preferencesErrorCenter');
  return {dialog,content,panel,title:content?.querySelector(':scope>h3'),intro:content?.querySelector(':scope>.dialog-intro')};
}
function showManagementView(){
  const {content,panel,title,intro}=panelElements();
  const management=document.getElementById('preferencesApplicationManagement');
  if(!content||!management)return;
  [...content.children].forEach(node=>{
    if(node===title||node===intro||node===management)return;
    node.hidden=true;
  });
  if(panel)panel.hidden=true;
  management.hidden=false;
  if(title)title.textContent='Gestion de l’application';
  if(intro)intro.textContent='Documentation, historique et informations de l’application.';
}
function showErrorCenter(){
  const {dialog,content,panel,title,intro}=panelElements();
  if(!dialog||!content||!panel)return;
  [...content.children].forEach(node=>{
    if(node===title||node===intro||node===panel)return;
    node.hidden=true;
  });
  panel.hidden=false;
  if(title)title.textContent='Messages d’erreur';
  if(intro)intro.textContent='Anomalies actives et problèmes récemment résolus.';
  currentFilter='active';
  renderPanel();
  if(!dialog.open)dialog.showModal();
}
function renderPanel(entries=readEntries()){
  const panel=document.getElementById('preferencesErrorCenter');
  if(!panel)return;
  const active=entries.filter(entry=>!entry.resolved);
  const resolved=entries.filter(entry=>entry.resolved);
  const visible=currentFilter==='resolved'?resolved:active;
  const cards=visible.map(entry=>{
    const action=entry.action==='refresh-ha'
      ?'<button type="button" data-error-action="refresh-ha">Réessayer</button>'
      :entry.action==='open-missing'
        ?'<button type="button" data-error-action="open-missing">Ouvrir la demande</button>'
        :'';
    const details=entry.details?'<details class="courses-error-details"><summary>Détails</summary><div>'+escapeHtml(entry.details)+'</div></details>':'';
    const count=Number(entry.count||1)>1?'<span class="courses-error-occurrences">×'+Number(entry.count||1)+'</span>':'';
    return '<article class="courses-error-card '+(entry.severity==='warning'?'is-warning':'')+'" data-error-id="'+escapeHtml(entry.id)+'">'+
      '<div class="courses-error-card-head"><span class="courses-error-dot" aria-hidden="true"></span><div class="courses-error-card-copy">'+
      '<div class="courses-error-source"><span>'+escapeHtml(entry.source)+' · '+escapeHtml(formatDate(entry.lastAt||entry.createdAt))+'</span>'+count+'</div>'+
      '<h4>'+escapeHtml(entry.title)+'</h4><p>'+escapeHtml(entry.message||'Erreur détectée.')+'</p>'+details+
      '<div class="courses-error-actions">'+action+(entry.resolved?'':'<button type="button" data-error-resolve="'+escapeHtml(entry.key)+'">Marquer comme résolue</button>')+'</div></div></div></article>';
  }).join('');
  panel.innerHTML=
    '<button class="courses-error-back" type="button">‹ Gestion de l’application</button>'+
    '<div class="courses-error-summary"><div><strong>État de l’application</strong><small>'+active.length+' anomalie'+(active.length>1?'s':'')+' active'+(active.length>1?'s':'')+'</small></div><span class="courses-error-count">'+active.length+'</span></div>'+
    '<div class="courses-error-tabs"><button type="button" data-error-filter="active" class="'+(currentFilter==='active'?'is-active':'')+'">À traiter ('+active.length+')</button><button type="button" data-error-filter="resolved" class="'+(currentFilter==='resolved'?'is-active':'')+'">Résolues ('+resolved.length+')</button></div>'+
    '<div class="courses-error-list">'+(cards||'<div class="courses-error-empty"><strong>'+(currentFilter==='active'?'Aucune erreur active':'Aucune erreur résolue')+'</strong>'+(currentFilter==='active'?'L’application ne signale actuellement aucun problème nécessitant votre attention.':'Les problèmes corrigés apparaîtront ici pendant 30 jours.')+'</div>')+'</div>'+
    (resolved.length?'<button class="courses-error-clear" type="button">Effacer les erreurs résolues</button>':'');
}
function bindUi(){
  if(uiBound)return true;
  const dialog=document.getElementById('preferencesDialog');
  const content=dialog?.querySelector(':scope>.preference-dialog-scroll');
  if(!dialog||!content)return false;
  uiBound=true;
  installStyle();
  let panel=document.getElementById('preferencesErrorCenter');
  if(!panel){panel=document.createElement('div');panel.id='preferencesErrorCenter';panel.className='courses-error-center';panel.hidden=true;content.appendChild(panel)}
  panel.addEventListener('click',event=>{
    if(event.target.closest('.courses-error-back')){showManagementView();return}
    const filter=event.target.closest('[data-error-filter]')?.dataset.errorFilter;
    if(filter){currentFilter=filter==='resolved'?'resolved':'active';renderPanel();return}
    const resolveButton=event.target.closest('[data-error-resolve]');
    if(resolveButton){resolve(resolveButton.dataset.errorResolve);return}
    if(event.target.closest('.courses-error-clear')){clearResolved();return}
    const action=event.target.closest('[data-error-action]')?.dataset.errorAction;
    if(action==='refresh-ha'){
      document.getElementById('refreshBtn')?.click();
      return;
    }
    if(action==='open-missing'){
      try{dialog.close()}catch(_){}
      setTimeout(()=>document.getElementById('settingsMissingProductsBtn')?.click(),0);
    }
  });
  dialog.addEventListener('close',()=>{panel.hidden=true});
  updateBadge();
  return true;
}
function handleErrorCenterTrigger(event){
  const trigger=event.target.closest?.('#preferencesErrorMessages');
  if(!trigger)return;
  if(!bindUi())return;
  showErrorCenter();
}
function bindWhenReady(){
  if(bindUi())return;
  const observer=new MutationObserver(()=>{if(bindUi())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),12000);
}

reconcilePreviousVersionEntries();
consumeIntegrationParams();
void importPushInbox();
document.addEventListener('click',handleErrorCenterTrigger);
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{bindHaStatus();bindWhenReady();reconcileLoadedResources();void importPushInbox()},{once:true});
}else{
  bindHaStatus();bindWhenReady();reconcileLoadedResources();void importPushInbox();
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  reconcileLoadedResources();
  void importPushInbox();
});
window.addEventListener('courses-errors-changed',()=>updateBadge());
})();
