(()=>{
'use strict';

const DELETE_PRODUCT_PREFIX='__courses_delete_product__:';
const DELETE_DISH_PREFIX='__courses_delete_dish__:';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const PENDING_KEY='courses-catalog-delete-pending-v2';
const PENDING_TTL_MS=30*60*1000;
const RUNS_URL='https://api.github.com/repos/fabien95430/Dashboard-course/actions/workflows/integrate-dish-openai.yml/runs?event=repository_dispatch&per_page=50';
let currentMode='products';
let currentQuery='';
let openGroup='';
let openItem='';
let blockedItem=null;
/* Retraits en cours (comme « acheté » dans Ma liste) : phase « hold » = Annuler possible, « exit » = la ligne sort. */
const removals=new Map();
const REMOVE_HOLD_MS=2000;
const REMOVE_EXIT_MS=800;
let swipeSuppressUntil=0;
let dishRows=null;
let dishRowsPromise=null;
let uiBound=false;

const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const pendingKey=(type,name)=>type+':'+norm(name);

function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
const collator=new Intl.Collator('fr',{sensitivity:'base'});
let productRows=null,productRowsSource=null;
function products(){
  const groups=window.COURSES_CATALOG?.groups||{};
  if(productRows&&productRowsSource===groups)return productRows;
  const rows=[];
  Object.entries(groups).forEach(([category,subgroups])=>{
    Object.entries(subgroups||{}).forEach(([subgroup,names])=>{
      (Array.isArray(names)?names:[]).forEach(name=>rows.push({name:String(name),category,subgroup}));
    });
  });
  productRows=rows.sort((a,b)=>collator.compare(a.name,b.name));productRowsSource=groups;
  return productRows;
}
function decodeJs(value){return String(value||'').replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\\\/g,'\\')}
function quotedValues(value){return [...String(value||'').matchAll(/'((?:\\.|[^'])*)'/g)].map(match=>decodeJs(match[1]))}
async function dishes(){
  if(dishRows)return dishRows;
  if(dishRowsPromise)return dishRowsPromise;
  dishRowsPromise=fetch('./dishes-ui.js?courses_catalog_admin='+Date.now(),{cache:'no-store'}).then(async response=>{
    if(!response.ok)throw new Error('Impossible de charger les plats du catalogue.');
    const text=await response.text();
    const rows=[];
    const pattern=/\{name:'((?:\\.|[^'])*)',photoId:.*?tags:\[([^\]]*)\],ingredients:\[([^\]]*)\]\}/gs;
    let match;
    while((match=pattern.exec(text))){
      const tags=quotedValues(match[2]);
      const ingredients=quotedValues(match[3]);
      rows.push({name:decodeJs(match[1]),category:tags[0]||'Plat',subgroup:ingredients.length+' ingrédient'+(ingredients.length>1?'s':'')});
    }
    dishRows=rows.sort((a,b)=>collator.compare(a.name,b.name));
    return dishRows;
  }).finally(()=>{dishRowsPromise=null});
  return dishRowsPromise;
}
function readPending(){
  try{
    const value=JSON.parse(localStorage.getItem(PENDING_KEY)||'{}');
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const now=Date.now();let changed=false;
    Object.entries(value).forEach(([key,item])=>{
      if(now-Number(item?.startedAt||0)<=PENDING_TTL_MS)return;
      delete value[key];changed=true;
    });
    if(changed)localStorage.setItem(PENDING_KEY,JSON.stringify(value));
    return value;
  }catch(_){return {}}
}
function setPending(type,name,state){
  const key=pendingKey(type,name);if(!norm(name))return;
  const pending=readPending();
  if(state)pending[key]=state;else delete pending[key];
  try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending))}catch(_){}
}
let pendingSnapshot=null;
function pendingFor(type,name){return (pendingSnapshot||readPending())[pendingKey(type,name)]||null}

function sharedHaClient(){
  const client=window.COURSES_HA_CLIENT;
  if(!client||typeof client.request!=='function'||typeof client.callService!=='function'||typeof client.getStates!=='function'||typeof client.isConnected!=='function'){
    throw new Error('Client Home Assistant indisponible.');
  }
  return client;
}

function base64UrlToBytes(value){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from(raw,char=>char.charCodeAt(0));
}
async function optionalPushData(){
  const empty={push_endpoint:'',push_p256dh:'',push_auth:'',push_public_key:''};
  if(!('Notification' in window)||Notification.permission!=='granted'||!('serviceWorker' in navigator)||!('PushManager' in window))return empty;
  try{
    const states=await sharedHaClient().getStates();
    const entity=Array.isArray(states)?states.find(item=>item?.entity_id===VAPID_ENTITY):null;
    const publicKey=String(entity?.state||'').trim();
    if(publicKey.length<80)return empty;
    const registration=await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64UrlToBytes(publicKey)});
    const json=subscription.toJSON();
    if(!subscription.endpoint||!json.keys?.p256dh||!json.keys?.auth)return empty;
    return {push_endpoint:String(subscription.endpoint),push_p256dh:String(json.keys.p256dh),push_auth:String(json.keys.auth),push_public_key:publicKey};
  }catch(_){return empty}
}
async function requestDeletion(itemType,name){
  const requestId=randomId();
  const push=await optionalPushData();
  const prefix=itemType==='dish'?DELETE_DISH_PREFIX:DELETE_PRODUCT_PREFIX;
  await sharedHaClient().callService('rest_command','courses_integrate_dish_openai',{
    dish_name:prefix+name,dish_category:'',request_id:requestId,...push
  });
  setPending(itemType,name,{requestId,startedAt:Date.now(),itemType,name});
  return requestId;
}

async function recipeUsages(name){
  const response=await fetch('./dishes-ui.js?courses_catalog_admin='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Impossible de vérifier les recettes avant suppression.');
  const text=await response.text();
  const wanted=norm(name),used=[];
  const pattern=/\{name:'((?:\\.|[^'])*)',photoId:.*?ingredients:\[([^\]]*)\]\}/gs;
  let match;
  while((match=pattern.exec(text))){
    const ingredients=quotedValues(match[2]);
    if(ingredients.some(value=>norm(value)===wanted))used.push(decodeJs(match[1]));
  }
  return [...new Set(used)];
}

function installStyle(){
  if(document.getElementById('courses-product-admin-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-admin-style';
  style.textContent=`
    .catalog-remove-panel{display:grid;align-content:start;gap:0;padding-bottom:6px}
    .catalog-remove-panel[hidden]{display:none!important}
    .courses-product-admin-title{display:flex;justify-content:space-between;align-items:baseline;margin:2px 2px 7px;color:#4c6152;font-size:var(--fs-label);font-weight:600}
    .courses-product-admin-title span{font-weight:400;font-variant-numeric:tabular-nums}
    .courses-product-admin-search{display:flex;align-items:center;gap:9px;height:44px;margin-bottom:10px;padding:0 13px;border:1px solid rgba(59,83,65,.12);border-radius:14px;background:rgba(255,255,255,.7);color:#617366}
    .courses-product-admin-search svg{width:18px;height:18px;flex:0 0 18px}
    .courses-product-admin-search input{min-width:0;width:100%;border:0!important;outline:0;background:transparent;color:#1b2d21;font:inherit;font-size:var(--fs-text)}
    .courses-product-admin-list{border:1px solid var(--tile-line,rgba(33,55,40,.035));border-radius:18px;background:var(--tile-bg,#fffefb);box-shadow:var(--tile-shadow,none);overflow:hidden}
    .courses-product-admin-group+.courses-product-admin-group,.courses-product-admin-item+.courses-product-admin-item{border-top:1px solid rgba(39,66,47,.09)}
    .courses-product-admin-group-head,.courses-product-admin-row{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto 18px;align-items:center;gap:10px;border:0;background:transparent;color:#1b2d21;font:inherit;text-align:left;-webkit-appearance:none;appearance:none}
    .courses-product-admin-group-head{min-height:54px;padding:0 14px 0 16px}
    .courses-product-admin-group-head span{font-size:var(--fs-text);font-weight:600;color:#263f30}
    .courses-product-admin-group-head small{color:#617366;font-size:var(--fs-label);font-variant-numeric:tabular-nums}
    .courses-product-admin-group.is-open>.courses-product-admin-group-head{background:rgba(221,237,216,.8)}
    .courses-product-admin-group-body{border-top:1px solid rgba(39,66,47,.09);background:rgba(240,245,238,.85)}
    .courses-product-admin-row{min-height:52px;padding:6px 14px 6px 16px}
    .courses-product-admin-group-body .courses-product-admin-row{padding-left:28px}
    .courses-product-admin-copy{display:grid;gap:2px;min-width:0}
    .courses-product-admin-copy strong{font-size:var(--fs-text);font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .courses-product-admin-copy small{color:#617366;font-size:var(--fs-note);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .courses-product-admin-caret{width:16px;height:16px;fill:none;stroke:#8e9990;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform:rotate(90deg);transition:transform .18s ease}
    .is-open>.courses-product-admin-group-head .courses-product-admin-caret{transform:rotate(-90deg)}
    .courses-product-admin-item{position:relative;overflow:hidden;max-height:240px;transition:transform .6s cubic-bezier(.4,0,.2,1),opacity .45s ease,max-height .45s cubic-bezier(.4,0,.2,1) .3s}
    .courses-product-admin-row{grid-template-columns:minmax(0,1fr) 38px;touch-action:pan-y}
    .courses-product-admin-row:disabled{opacity:1;color:#1b2d21}
    .courses-product-admin-more{justify-self:center;color:rgba(7,62,44,.25);font-size:var(--fs-sub);font-weight:700;transition:opacity .18s ease}
    .courses-product-admin-delete{position:absolute;top:50%;right:5px;width:52px;height:48px;padding:0;border:1px solid rgba(194,54,65,.09);border-radius:16px;display:grid;place-items:center;background:rgba(244,205,210,.3);color:#cf4050;box-shadow:inset 0 1px rgba(255,255,255,.55);opacity:0;visibility:hidden;pointer-events:none;transform:translate3d(10px,-50%,0);transition:opacity .18s ease,transform .2s ease,visibility .18s;-webkit-appearance:none;appearance:none}
    .courses-product-admin-delete svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    .courses-product-admin-delete:active{background:rgba(244,205,210,.6)}
    .courses-product-admin-item.is-actions-open .courses-product-admin-delete{opacity:1;visibility:visible;pointer-events:auto;transform:translate3d(0,-50%,0)}
    .courses-product-admin-item.is-actions-open .courses-product-admin-more,.courses-product-admin-item.is-deleting .courses-product-admin-more{opacity:0}
    .courses-product-admin-undo{position:absolute;top:50%;right:12px;transform:translateY(-50%);padding:10px 2px;border:0;background:transparent;color:#087c3c;font:inherit;font-size:var(--fs-text);font-weight:600;white-space:nowrap;-webkit-appearance:none;appearance:none}
    .courses-product-admin-undo[hidden]{display:none}
    .courses-product-admin-item.is-deleting>.courses-product-admin-row{background:linear-gradient(90deg,#fff0f1 0%,#fff8f7 100%)}
    .courses-product-admin-item.is-deleting .courses-product-admin-copy strong{color:#a73b42}
    .courses-product-admin-item.is-removing{transform:translate3d(-40%,0,0);opacity:0;max-height:0}
    .courses-product-admin-note{margin:0;padding:0 16px 12px;color:#a73b42;font-size:var(--fs-note);line-height:1.4}
    .courses-product-admin-empty{margin:0;padding:26px 16px;text-align:center;color:#617366;font-size:14px;line-height:1.45}
    .courses-product-admin-feedback{min-height:0;margin-top:10px;color:#4c6152;font-size:13.5px;text-align:center}
    .courses-product-admin-feedback:empty{display:none}
    .courses-product-admin-feedback.is-error{color:#b23a30}.courses-product-admin-feedback.is-ok{color:#1f7a4a}
    @media(prefers-reduced-motion:reduce){.courses-product-admin-caret,.courses-product-admin-item,.courses-product-admin-delete,.courses-product-admin-more{transition:none}}
  `;
  document.head.appendChild(style);
}
/* Vue Suppression du popup Catalogue des produits : le popup (missing-products-dishes.js) choisit la vue et le type. */
function panelElements(){
  const dialog=document.getElementById('missingProductsDialog');
  return {dialog,panel:document.getElementById('catalogRemovePanel')};
}
function visibleRows(rows){
  const query=norm(currentQuery);
  return rows.filter(item=>!query||norm(item.name+' '+item.category+' '+item.subgroup).includes(query));
}
function itemMarkup(item,itemType){
  const key=pendingKey(itemType,item.name);
  const removal=removals.get(key);
  const open=!removal&&openItem===key;
  const name=esc(item.name);
  const blocked=blockedItem?.key===key;
  return '<div class="courses-product-admin-item'+(open?' is-actions-open':'')+(removal?' is-deleting':'')+(removal?.phase==='exit'?' is-removing':'')+'" data-item="'+name+'">'+
    '<button class="courses-product-admin-row" type="button" data-admin-item="'+esc(key)+'" aria-expanded="'+open+'"'+(removal?' disabled':'')+'><span class="courses-product-admin-copy"><strong>'+name+'</strong><small>'+esc(item.subgroup)+'</small></span><span class="courses-product-admin-more" aria-hidden="true">⋯</span></button>'+
    '<button class="courses-product-admin-delete" type="button" data-delete-item="'+name+'" data-item-type="'+itemType+'" aria-label="Retirer '+name+' du catalogue"'+(open?'':' aria-hidden="true" tabindex="-1" disabled')+'><svg aria-hidden="true"><use href="#i-trash"></use></svg></button>'+
    '<button class="courses-product-admin-undo" type="button" data-undo-delete="'+esc(key)+'"'+(removal?.phase==='hold'?'':' hidden')+'>Annuler</button>'+
    (blocked?'<p class="courses-product-admin-note">Impossible de retirer « '+name+' » : utilisé par '+esc(blockedItem.usages.slice(0,5).join(', '))+(blockedItem.usages.length>5?'…':'')+'.</p>':'')+
  '</div>';
}
function itemElement(key){
  const {panel}=panelElements();
  const row=[...(panel?.querySelectorAll('[data-admin-item]')||[])].find(button=>button.dataset.adminItem===key);
  return row?.closest('.courses-product-admin-item')||null;
}
/* Ouvre la corbeille d'une seule ligne (balayage vers la gauche ou toucher) sans reconstruire la liste : la transition reste fluide. */
function setOpenItem(key){
  const {panel}=panelElements();
  openItem=key;
  if(blockedItem){blockedItem=null;panel?.querySelectorAll('.courses-product-admin-note').forEach(note=>note.remove())}
  panel?.querySelectorAll('.courses-product-admin-item').forEach(element=>{
    const row=element.querySelector('[data-admin-item]');
    const open=!!key&&row?.dataset.adminItem===key&&!element.classList.contains('is-deleting');
    element.classList.toggle('is-actions-open',open);
    row?.setAttribute('aria-expanded',String(open));
    const trash=element.querySelector('[data-delete-item]');
    if(!trash)return;
    trash.disabled=!open;trash.tabIndex=open?0:-1;
    if(open)trash.removeAttribute('aria-hidden');else trash.setAttribute('aria-hidden','true');
  });
}
function paintRemoval(key){
  const element=itemElement(key);if(!element)return;
  const removal=removals.get(key);
  element.classList.toggle('is-deleting',!!removal);
  element.classList.toggle('is-removing',removal?.phase==='exit');
  const row=element.querySelector('[data-admin-item]');if(row)row.disabled=!!removal;
  const undo=element.querySelector('[data-undo-delete]');if(undo)undo.hidden=removal?.phase!=='hold';
}
function renderRows(rows,itemType,listOnly=false){
  const {panel}=panelElements();if(!panel)return;
  pendingSnapshot=readPending();
  try{renderRowsNow(panel,rows,itemType,listOnly)}finally{pendingSnapshot=null}
}
function renderRowsNow(panel,allRows,itemType,listOnly){
  /* Un élément dont le retrait est demandé disparaît de la liste, comme un article acheté dans Ma liste. */
  const rows=allRows.filter(item=>!pendingFor(itemType,item.name));
  const label=itemType==='dish'?'plat':'produit';
  const query=norm(currentQuery);
  let list='';
  if(query){
    const visible=visibleRows(rows);
    list=visible.length?visible.slice(0,80).map(item=>itemMarkup(item,itemType)).join(''):'<p class="courses-product-admin-empty">Aucun '+label+' ne correspond à cette recherche.</p>';
  }else{
    const groups=new Map();
    rows.forEach(item=>{if(!groups.has(item.category))groups.set(item.category,[]);groups.get(item.category).push(item)});
    list=[...groups.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]),"fr")).map(([category,items])=>{
      const open=openGroup===category;
      return '<div class="courses-product-admin-group'+(open?' is-open':'')+'"><button class="courses-product-admin-group-head" type="button" data-admin-group="'+esc(category)+'" aria-expanded="'+open+'"><span>'+esc(category)+'</span><small>'+items.length+'</small><svg class="courses-product-admin-caret" aria-hidden="true"><use href="#i-chevron"></use></svg></button>'+
        (open?'<div class="courses-product-admin-group-body">'+items.map(item=>itemMarkup(item,itemType)).join('')+'</div>':'')+'</div>';
    }).join('');
  }
  const listEl=panel.querySelector('.courses-product-admin-list');
  if(listOnly&&listEl){
    listEl.innerHTML=list;
    const count=panel.querySelector('.courses-product-admin-title span');if(count)count.textContent=String(rows.length);
    return;
  }
  const keepFocus=document.activeElement?.matches?.('[data-product-admin-search]');
  panel.innerHTML='<div class="courses-product-admin-title">Dans le catalogue<span>'+rows.length+'</span></div>'+
    '<label class="courses-product-admin-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><input type="search" value="'+esc(currentQuery)+'" placeholder="Rechercher un '+label+'" aria-label="Rechercher un '+label+'" autocomplete="off" enterkeyhint="search" data-product-admin-search></label>'+
    '<div class="courses-product-admin-list">'+list+'</div><div class="courses-product-admin-feedback" role="status" aria-live="polite"></div>';
  if(keepFocus){const input=panel.querySelector('[data-product-admin-search]');input?.focus({preventScroll:true});try{input?.setSelectionRange(input.value.length,input.value.length)}catch(_){}}
}
async function render(listOnly=false){
  const {panel}=panelElements();if(!panel)return;
  if(currentMode==='products'){renderRows(products(),'product',listOnly);return}
  if(!dishRows)panel.innerHTML='<div class="courses-product-admin-feedback">Chargement des plats…</div>';
  try{renderRows(await dishes(),'dish',listOnly)}catch(error){panel.innerHTML='<p class="courses-product-admin-empty">'+esc(error?.message||'Impossible de charger les plats.')+'</p>'}
}
function feedback(message,type=''){
  const el=document.querySelector('#catalogRemovePanel .courses-product-admin-feedback');if(!el)return;
  if(type==='error')window.CoursesHaptics?.play('error');else if(type==='ok')window.CoursesHaptics?.play('delete');
  el.textContent=message||'';el.className='courses-product-admin-feedback'+(type?' is-'+type:'');
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function abortRemoval(key,token,usages,message){
  token.cancelled=true;removals.delete(key);
  if(usages?.length)blockedItem={key,usages};
  void render(true);
  if(message)feedback(message,'error');
}
/* Même parcours que « acheté » dans Ma liste : la ligne passe en rose avec Annuler, puis sort vers la gauche ; la demande n'est envoyée qu'ensuite. */
async function startRemoval(itemType,name){
  const key=pendingKey(itemType,name);
  if(!norm(name)||removals.has(key))return;
  /* iOS n'accorde le retour haptique que pendant le geste de l'utilisateur : on le joue au toucher. */
  window.CoursesHaptics?.play('delete');
  const token={cancelled:false,phase:'hold',itemType,name};
  removals.set(key,token);
  setOpenItem('');
  paintRemoval(key);
  const usage=itemType==='product'?recipeUsages(name).then(usages=>({usages}),error=>({error})):Promise.resolve({usages:[]});
  usage.then(result=>{
    if(token.cancelled||token.phase!=='hold')return;
    if(result.error)abortRemoval(key,token,null,String(result.error?.message||'Vérification impossible.'));
    else if(result.usages.length)abortRemoval(key,token,result.usages);
  });
  await wait(REMOVE_HOLD_MS);
  await usage;
  if(token.cancelled)return;
  token.phase='exit';paintRemoval(key);
  await wait(REMOVE_EXIT_MS);
  try{
    await requestDeletion(itemType,name);
    removals.delete(key);
    await render(true);
  }catch(error){
    removals.delete(key);await render(true);
    feedback(String(error?.message||'Suppression impossible.'),'error');
    window.CoursesErrors?.report?.({key:'catalog-delete:'+itemType+':'+norm(name),severity:'error',source:'Catalogue',title:'Suppression de « '+name+' » impossible',message:String(error?.message||'La demande n’a pas pu être envoyée.')});
  }
}
function undoRemoval(key){
  const token=removals.get(key);
  if(!token||token.phase!=='hold')return;
  token.cancelled=true;removals.delete(key);
  paintRemoval(key);
  window.CoursesHaptics?.play('tick');
}
async function reconcilePending(){
  const pending=readPending();
  const entries=Object.entries(pending);
  if(!entries.length)return;
  try{
    const response=await fetch(RUNS_URL,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
    if(!response.ok)return;
    const data=await response.json();
    const runs=Array.isArray(data?.workflow_runs)?data.workflow_runs:[];
    let changed=false,completed=false;
    for(const [key,state] of entries){
      const run=runs.find(candidate=>String(candidate?.display_title||'').includes(String(state?.requestId||'')));
      if(run?.status!=='completed')continue;
      const itemType=state?.itemType==='dish'?'dish':'product';
      const name=String(state?.name||key.split(':').slice(1).join(':'));
      setPending(itemType,name,null);changed=true;
      if(run.conclusion==='success')completed=true;
      else window.CoursesErrors?.report?.({key:'catalog-delete:'+key,severity:'error',source:'Catalogue',title:'Suppression du '+(itemType==='dish'?'plat':'produit')+' impossible',message:'Le workflow GitHub de suppression a échoué.'});
    }
    if(changed)await render();
    if(completed){
      const registration=await navigator.serviceWorker?.getRegistration?.();
      await registration?.update?.();
      setTimeout(()=>location.reload(),350);
    }
  }catch(_){}
}
function resetView(){currentQuery='';openGroup='';openItem='';blockedItem=null}
/* Le popup annonce sa vue et son type (Produits / Plats) ; la vue Suppression se rend ici. */
function followCatalogView(detail){
  const nextMode=detail?.mode==='dishes'?'dishes':'products';
  if(nextMode!==currentMode){currentMode=nextMode;resetView()}
  if(detail?.view!=='remove')return;
  void render();
  void reconcilePending();
}
function bindUi(){
  if(uiBound)return true;
  const {dialog,panel}=panelElements();
  if(!dialog||!panel)return false;
  uiBound=true;installStyle();
  panel.addEventListener('input',event=>{
    if(event.target.matches('[data-product-admin-search]')){
      currentQuery=event.target.value;openItem='';blockedItem=null;void render(true);
    }
  });
  /* Balayage vers la gauche sur une ligne : révèle la corbeille (vers la droite : la referme), comme dans Ma liste. */
  panel.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    const row=event.target.closest('.courses-product-admin-row');if(!row)return;
    const key=row.dataset.adminItem||'';
    const pointerId=event.pointerId,startX=event.clientX,startY=event.clientY;
    const stop=()=>{document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',stop,true);document.removeEventListener('pointercancel',stop,true)};
    const move=moveEvent=>{
      if(moveEvent.pointerId!==pointerId)return;
      const dx=moveEvent.clientX-startX,dy=moveEvent.clientY-startY;
      if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(dy)*1.4){
        stop();swipeSuppressUntil=Date.now()+400;
        if(dx<0)setOpenItem(key);else if(openItem===key)setOpenItem('');
        return;
      }
      if(Math.abs(dy)>12&&Math.abs(dy)>=Math.abs(dx))stop();
    };
    document.addEventListener('pointermove',move,{passive:true,capture:true});
    document.addEventListener('pointerup',stop,{capture:true});
    document.addEventListener('pointercancel',stop,{capture:true});
  });
  panel.addEventListener('click',event=>{
    event.stopPropagation();
    const group=event.target.closest('[data-admin-group]');
    if(group){const name=group.dataset.adminGroup||'';openGroup=openGroup===name?'':name;openItem='';blockedItem=null;void render();return}
    const del=event.target.closest('[data-delete-item]');if(del){void startRemoval(del.dataset.itemType||'product',del.dataset.deleteItem||'');return}
    const undo=event.target.closest('[data-undo-delete]');if(undo){undoRemoval(undo.dataset.undoDelete||'');return}
    const item=event.target.closest('[data-admin-item]');
    if(item){
      if(Date.now()<swipeSuppressUntil)return;
      const key=item.dataset.adminItem||'';
      setOpenItem(openItem===key?'':key);
      return;
    }
    if(openItem)setOpenItem('');
  });
  dialog.addEventListener('close',resetView);
  document.addEventListener('courses:catalog-view-changed',event=>followCatalogView(event.detail));
  followCatalogView({view:dialog.dataset.catalogView,mode:dialog.dataset.catalogMode});
  return true;
}
function bindWhenReady(){
  if(bindUi())return;
  document.addEventListener('DOMContentLoaded',bindUi,{once:true});
}

if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',event=>{
  const payload=event.data?.payload||{};
  if(event.data?.type!=='courses-error-signal'||(payload.itemType!=='product'&&payload.itemType!=='dish'))return;
  const name=String(payload.itemName||'');if(!name)return;
  const itemType=payload.itemType==='dish'?'dish':'product';
  if(payload.status==='deleted'){
    setPending(itemType,name,null);
    navigator.serviceWorker.getRegistration().then(reg=>reg?.update?.()).finally(()=>setTimeout(()=>location.reload(),350));
  }else if(payload.status==='error'){
    setPending(itemType,name,null);void render();
  }
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindWhenReady,{once:true});else bindWhenReady();
})();
