(() => {
'use strict';

const STORAGE_KEY='courses-error-center-v1';
const PUSH_INBOX_CACHE='courses-error-inbox-v1';
const MAX_ENTRIES=80;
const RESOLVED_TTL_MS=30*24*60*60*1000;
const TRANSIENT_PREFIXES=Object.freeze(['resource:','javascript:','promise:','integration-local:','notifications:']);
let currentFilter='active';
let filterTrack=null;
let openErrorId='';
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
function resolveIntegrationItem(itemType,itemName){
  const wantedType=String(itemType||'').toLowerCase()==='product'?'product':'dish';
  const wantedName=normalize(itemName);
  if(!wantedName)return false;
  const entries=readEntries();
  const now=Date.now();
  let changed=false;
  entries.forEach(entry=>{
    if(entry.resolved||!String(entry.key||'').startsWith('integration:'))return;
    const meta=entry.meta&&typeof entry.meta==='object'?entry.meta:{};
    const metaType=String(meta.itemType||'').toLowerCase();
    const metaName=normalize(meta.itemName||'');
    if(metaType!==wantedType||metaName!==wantedName)return;
    entry.resolved=true;
    entry.resolvedAt=now;
    changed=true;
  });
  if(changed)writeEntries(entries);
  return changed;
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
    resolveIntegrationItem(itemType,itemName);
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
  document.addEventListener('courses:status-changed',sync);
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
    .courses-error-center{display:grid;gap:0;padding-bottom:4px}
    .courses-error-list{border:1px solid var(--tile-line,rgba(33,55,40,.035));border-radius:18px;background:var(--tile-bg,#fffefb);box-shadow:var(--tile-shadow,none);overflow:hidden}
    .courses-error-item+.courses-error-item{border-top:1px solid rgba(39,66,47,.09)}
    .courses-error-item.is-open{background:rgba(237,247,234,.5)}
    .courses-error-row{width:100%;min-height:62px;display:grid;grid-template-columns:10px minmax(0,1fr) 16px;align-items:center;gap:12px;padding:9px 14px 9px 16px;border:0;background:transparent;color:#1b2d21;font:inherit;text-align:left;-webkit-appearance:none;appearance:none}
    .courses-error-dot{width:10px;height:10px;border-radius:50%;background:#d93a2f}
    .courses-error-item.is-warning .courses-error-dot{background:#e2901b}
    .courses-error-item.is-resolved .courses-error-dot{background:#9db3a4}
    .courses-error-copy{display:grid;gap:2px;min-width:0}
    .courses-error-copy strong{font-size:var(--fs-text);font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .courses-error-copy small{color:#617366;font-size:var(--fs-note);font-variant-numeric:tabular-nums}
    .courses-error-caret{width:16px;height:16px;fill:none;stroke:#8e9990;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform:rotate(90deg);transition:transform .18s ease}
    .courses-error-item.is-open .courses-error-caret{transform:rotate(-90deg)}
    .courses-error-body{display:grid;gap:10px;padding:0 14px 14px 38px}
    .courses-error-body p{margin:0;color:#2c4334;font-size:14px;line-height:1.4;overflow-wrap:anywhere}
    .courses-error-details{margin:0;padding:9px 11px;border-radius:11px;background:rgba(39,66,47,.06);color:#4c6152;font:var(--fs-note)/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
    .courses-error-actions{display:flex;gap:8px;flex-wrap:wrap}
    .courses-error-actions button,.courses-error-clear{min-height:40px;padding:0 14px;border:1px solid rgba(47,106,73,.18);border-radius:13px;background:rgba(255,255,255,.75);color:#1f5a3b;font:inherit;font-size:var(--fs-text);-webkit-appearance:none;appearance:none}
    .courses-error-empty{margin:0;padding:28px 16px;text-align:center;color:#617366;font-size:14px;line-height:1.45}
    .courses-error-empty strong{display:block;color:#1b2d21;font-size:var(--fs-text);font-weight:400;margin-bottom:3px}
    .courses-error-clear{width:100%;margin-top:12px;border-color:rgba(178,58,48,.2);color:#b23a30}
    @media(prefers-reduced-motion:reduce){.courses-error-caret{transition:none}}
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
function showErrorCenter(){
  const {dialog,content,panel,title,intro}=panelElements();
  if(!dialog||!content||!panel)return;
  [...content.children].forEach(node=>{
    if(node===title||node===intro||node===panel)return;
    node.hidden=true;
  });
  panel.hidden=false;
  if(window.COURSES_SETTINGS_NAV?.setTitle)window.COURSES_SETTINGS_NAV.setTitle('Messages d’erreur','management');else if(title)title.textContent='Messages d’erreur';
  if(intro)intro.textContent='Anomalies actives et problèmes récemment résolus.';
  currentFilter='active';
  openErrorId='';
  renderPanel();
  if(!dialog.open)dialog.showModal();
}
function renderPanel(entries=readEntries()){
  const panel=document.getElementById('preferencesErrorCenter');
  if(!panel)return;
  const active=entries.filter(entry=>!entry.resolved);
  const resolved=entries.filter(entry=>entry.resolved);
  const visible=currentFilter==='resolved'?resolved:active;
  const filterLabel=(filter,count)=>(filter==='active'?'À traiter':'Résolues')+'<b>'+count+'</b>';
  /* Une tuile groupée : chaque erreur se déplie sur place (message, détail technique, actions). */
  const rows=visible.map(entry=>{
    const open=openErrorId===entry.id;
    const kind=entry.resolved?'is-resolved':entry.severity==='warning'?'is-warning':'is-error';
    const kindLabel=entry.resolved?'Résolue':entry.severity==='warning'?'Avertissement':'Erreur';
    const count=Number(entry.count||1)>1?' · ×'+Number(entry.count||1):'';
    const action=entry.action==='refresh-ha'
      ?'<button type="button" data-error-action="refresh-ha">Réessayer</button>'
      :entry.action==='open-missing'
        ?'<button type="button" data-error-action="open-missing">Ouvrir la demande</button>'
        :'';
    const body=open
      ?'<div class="courses-error-body"><p>'+escapeHtml(entry.message||'Erreur détectée.')+'</p>'+
        (entry.details?'<pre class="courses-error-details">'+escapeHtml(entry.details)+'</pre>':'')+
        (entry.resolved?'':'<div class="courses-error-actions">'+action+'<button type="button" data-error-resolve="'+escapeHtml(entry.key)+'">Marquer comme résolue</button></div>')+'</div>'
      :'';
    return '<div class="courses-error-item '+kind+(open?' is-open':'')+'" data-error-id="'+escapeHtml(entry.id)+'">'+
      '<button type="button" class="courses-error-row" data-error-toggle="'+escapeHtml(entry.id)+'" aria-expanded="'+open+'"><span class="courses-error-dot" role="img" aria-label="'+kindLabel+'"></span>'+
      '<span class="courses-error-copy"><strong>'+escapeHtml(entry.title)+'</strong><small>'+escapeHtml(entry.source)+' · '+escapeHtml(formatDate(entry.lastAt||entry.createdAt))+count+'</small></span>'+
      '<svg class="courses-error-caret" aria-hidden="true"><use href="#i-chevron"></use></svg></button>'+body+'</div>';
  }).join('');
  panel.innerHTML=
    '<div class="courses-error-tabs" role="tablist" aria-label="Filtrer les messages d’erreur"><button type="button" role="tab" aria-selected="'+(currentFilter==='active')+'" data-error-filter="active" class="'+(currentFilter==='active'?'is-active':'')+'">'+filterLabel('active',active.length)+'</button><button type="button" role="tab" aria-selected="'+(currentFilter==='resolved')+'" data-error-filter="resolved" class="'+(currentFilter==='resolved'?'is-active':'')+'">'+filterLabel('resolved',resolved.length)+'</button></div>'+
    '<div class="courses-error-list">'+(rows||'<p class="courses-error-empty"><strong>'+(currentFilter==='active'?'Aucune erreur à traiter':'Aucune erreur résolue')+'</strong>'+(currentFilter==='active'?'L’application fonctionne normalement.':'Les erreurs marquées comme résolues apparaîtront ici.')+'</p>')+'</div>'+
    (currentFilter==='resolved'&&resolved.length?'<button class="courses-error-clear" type="button">Effacer les erreurs résolues</button>':'');
  const freshTrack=panel.querySelector('.courses-error-tabs');
  if(filterTrack&&freshTrack){
    freshTrack.replaceWith(filterTrack);
    filterTrack.querySelectorAll('[data-error-filter]').forEach(button=>{
      const isActive=button.dataset.errorFilter===currentFilter;
      button.classList.toggle('is-active',isActive);
      button.setAttribute('aria-selected',String(isActive));
      button.innerHTML=filterLabel(button.dataset.errorFilter,button.dataset.errorFilter==='active'?active.length:resolved.length);
    });
  }else filterTrack=freshTrack;
  window.COURSES_SEGMENTED_LIQUID?.bindSegment(filterTrack,'.courses-error-tabs button')?.sync(true);
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
    const filter=event.target.closest('[data-error-filter]')?.dataset.errorFilter;
    if(filter){currentFilter=filter==='resolved'?'resolved':'active';openErrorId='';renderPanel();return}
    const toggle=event.target.closest('[data-error-toggle]');
    if(toggle){const id=toggle.dataset.errorToggle||'';openErrorId=openErrorId===id?'':id;renderPanel();return}
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
  document.addEventListener('courses:settings-management-ready',bindUi,{once:true});
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
