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
let currentConfirm='';
let openGroup='';
let openItem='';
let blockedItem=null;
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
function products(){
  const groups=window.COURSES_CATALOG?.groups||{};
  const rows=[];
  Object.entries(groups).forEach(([category,subgroups])=>{
    Object.entries(subgroups||{}).forEach(([subgroup,names])=>{
      (Array.isArray(names)?names:[]).forEach(name=>rows.push({name:String(name),category,subgroup}));
    });
  });
  return rows.sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
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
    dishRows=rows.sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
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
function pendingFor(type,name){return readPending()[pendingKey(type,name)]||null}

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
    .catalog-remove-panel{display:grid;gap:0;padding-bottom:6px}
    .catalog-remove-panel[hidden]{display:none!important}
    .courses-product-admin-title{display:flex;justify-content:space-between;align-items:baseline;margin:2px 2px 7px;color:#4c6152;font-size:13.5px;font-weight:600}
    .courses-product-admin-title span{font-weight:400;font-variant-numeric:tabular-nums}
    .courses-product-admin-search{display:flex;align-items:center;gap:9px;height:44px;margin-bottom:10px;padding:0 13px;border:1px solid rgba(59,83,65,.12);border-radius:14px;background:rgba(255,255,255,.7);color:#617366}
    .courses-product-admin-search svg{width:18px;height:18px;flex:0 0 18px}
    .courses-product-admin-search input{min-width:0;width:100%;border:0!important;outline:0;background:transparent;color:#1b2d21;font:inherit;font-size:16px}
    .courses-product-admin-list{border:1px solid var(--tile-line,rgba(33,55,40,.035));border-radius:18px;background:var(--tile-bg,#fffefb);box-shadow:var(--tile-shadow,none);overflow:hidden}
    .courses-product-admin-group+.courses-product-admin-group,.courses-product-admin-item+.courses-product-admin-item{border-top:1px solid rgba(39,66,47,.09)}
    .courses-product-admin-group-head,.courses-product-admin-row{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto 18px;align-items:center;gap:10px;border:0;background:transparent;color:#1b2d21;font:inherit;text-align:left;-webkit-appearance:none;appearance:none}
    .courses-product-admin-group-head{min-height:54px;padding:0 14px 0 16px}
    .courses-product-admin-group-head span{font-size:16px;font-weight:600;color:#263f30}
    .courses-product-admin-group-head small{color:#617366;font-size:13px;font-variant-numeric:tabular-nums}
    .courses-product-admin-group.is-open>.courses-product-admin-group-head{background:rgba(221,237,216,.8)}
    .courses-product-admin-group-body{border-top:1px solid rgba(39,66,47,.09);background:rgba(240,245,238,.85)}
    .courses-product-admin-row{min-height:52px;padding:6px 14px 6px 16px}
    .courses-product-admin-group-body .courses-product-admin-row{padding-left:28px}
    .courses-product-admin-copy{display:grid;gap:2px;min-width:0}
    .courses-product-admin-copy strong{font-size:15px;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .courses-product-admin-copy small{color:#617366;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .courses-product-admin-caret{width:16px;height:16px;fill:none;stroke:#8e9990;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform:rotate(90deg);transition:transform .18s ease}
    .is-open>.courses-product-admin-group-head .courses-product-admin-caret,.is-open>.courses-product-admin-row .courses-product-admin-caret{transform:rotate(-90deg)}
    .courses-product-admin-item.is-open{background:rgba(237,247,234,.55)}
    .courses-product-admin-pending{padding:3px 9px;border-radius:999px;background:rgba(255,149,0,.12);color:#9a5d00;font-size:12px;white-space:nowrap}
    .courses-product-admin-tools{display:grid;gap:8px;padding:0 14px 12px 16px}
    .courses-product-admin-group-body .courses-product-admin-tools{padding-left:28px}
    .courses-product-admin-tools.is-confirm{grid-template-columns:1fr 1fr}
    .courses-product-admin-tools p{grid-column:1/-1;margin:0;color:#6c4a45;font-size:14px;line-height:1.4}
    .courses-product-admin-tools button{min-height:42px;padding:0 12px;border:1px solid rgba(178,58,48,.2);border-radius:13px;background:rgba(255,255,255,.78);color:#b23a30;font:inherit;font-size:14.5px;-webkit-appearance:none;appearance:none}
    .courses-product-admin-tools .courses-product-admin-cancel{border-color:rgba(47,106,73,.18);color:#1f5a3b}
    .courses-product-admin-tools .courses-product-admin-confirm-delete{border-color:transparent;background:#b8433a;color:#fff}
    .courses-product-admin-tools button:disabled{opacity:.45}
    .courses-product-admin-empty{margin:0;padding:26px 16px;text-align:center;color:#617366;font-size:14px;line-height:1.45}
    .courses-product-admin-feedback{min-height:0;margin-top:10px;color:#4c6152;font-size:13.5px;text-align:center}
    .courses-product-admin-feedback:empty{display:none}
    .courses-product-admin-feedback.is-error{color:#b23a30}.courses-product-admin-feedback.is-ok{color:#1f7a4a}
    @media(prefers-reduced-motion:reduce){.courses-product-admin-caret{transition:none}}
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
function confirmMarkup(item,itemType){
  if(currentConfirm!==pendingKey(itemType,item.name))return '';
  const message=itemType==='product'
    ?'Le produit sera retiré du catalogue et son image supprimée du dépôt GitHub. La liste Home Assistant n’est pas modifiée.'
    :'Le plat, sa recette et son image seront supprimés définitivement. Les produits du catalogue et la liste Home Assistant ne sont pas modifiés.';
  return '<div class="courses-product-admin-tools courses-product-admin-confirm is-confirm"><p>Retirer définitivement « '+esc(item.name)+' » ? '+message+'</p><button class="courses-product-admin-cancel" type="button">Annuler</button><button class="courses-product-admin-confirm-delete" type="button" data-confirm-delete="'+esc(item.name)+'" data-item-type="'+itemType+'">Retirer</button></div>';
}
function itemMarkup(item,itemType){
  const key=pendingKey(itemType,item.name);
  const pending=pendingFor(itemType,item.name);
  const open=!pending&&openItem===key;
  let tools='';
  if(open){
    if(blockedItem?.key===key)tools='<div class="courses-product-admin-tools"><p>Impossible de retirer « '+esc(item.name)+' » : utilisé par '+esc(blockedItem.usages.slice(0,5).join(', '))+(blockedItem.usages.length>5?'…':'')+'.</p></div>';
    else tools=confirmMarkup(item,itemType)||'<div class="courses-product-admin-tools"><button class="courses-product-admin-delete" type="button" data-delete-item="'+esc(item.name)+'" data-item-type="'+itemType+'">Retirer du catalogue</button></div>';
  }
  return '<div class="courses-product-admin-item'+(open?' is-open':'')+'" data-item="'+esc(item.name)+'"><button class="courses-product-admin-row" type="button" data-admin-item="'+esc(key)+'" aria-expanded="'+open+'"'+(pending?' disabled':'')+'><span class="courses-product-admin-copy"><strong>'+esc(item.name)+'</strong><small>'+esc(item.subgroup)+'</small></span>'+
    (pending?'<span class="courses-product-admin-pending">Retrait…</span>':'<span></span>')+'<svg class="courses-product-admin-caret" aria-hidden="true"><use href="#i-chevron"></use></svg></button>'+tools+'</div>';
}
function renderRows(rows,itemType){
  const {panel}=panelElements();if(!panel)return;
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
  const keepFocus=document.activeElement?.matches?.('[data-product-admin-search]');
  panel.innerHTML='<div class="courses-product-admin-title">Dans le catalogue<span>'+rows.length+'</span></div>'+
    '<label class="courses-product-admin-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><input type="search" value="'+esc(currentQuery)+'" placeholder="Rechercher un '+label+'" aria-label="Rechercher un '+label+'" autocomplete="off" enterkeyhint="search" data-product-admin-search></label>'+
    '<div class="courses-product-admin-list">'+list+'</div><div class="courses-product-admin-feedback" role="status" aria-live="polite"></div>';
  if(keepFocus){const input=panel.querySelector('[data-product-admin-search]');input?.focus({preventScroll:true});try{input?.setSelectionRange(input.value.length,input.value.length)}catch(_){}}
}
async function render(){
  const {panel}=panelElements();if(!panel)return;
  if(currentMode==='products'){renderRows(products(),'product');return}
  if(!dishRows)panel.innerHTML='<div class="courses-product-admin-feedback">Chargement des plats…</div>';
  try{renderRows(await dishes(),'dish')}catch(error){panel.innerHTML='<p class="courses-product-admin-empty">'+esc(error?.message||'Impossible de charger les plats.')+'</p>'}
}
function feedback(message,type=''){
  const el=document.querySelector('#catalogRemovePanel .courses-product-admin-feedback');if(!el)return;
  el.textContent=message||'';el.className='courses-product-admin-feedback'+(type?' is-'+type:'');
}
async function beginDeletion(itemType,name,button){
  button.disabled=true;
  if(itemType==='dish'){
    currentConfirm=pendingKey(itemType,name);await render();return;
  }
  feedback('Vérification des recettes…');
  try{
    const usages=await recipeUsages(name);
    if(usages.length){
      blockedItem={key:pendingKey(itemType,name),usages};
      await render();
      return;
    }
    currentConfirm=pendingKey(itemType,name);await render();
  }catch(error){
    button.disabled=false;feedback(String(error?.message||'Vérification impossible.'),'error');
  }
}
async function confirmDeletion(itemType,name,button){
  button.disabled=true;feedback('Envoi de la suppression à GitHub…');
  try{
    await requestDeletion(itemType,name);
    currentConfirm='';openItem='';await render();
    feedback('Retrait demandé. GitHub applique la modification en arrière-plan.','ok');
  }catch(error){
    button.disabled=false;feedback(String(error?.message||'Suppression impossible.'),'error');
    window.CoursesErrors?.report?.({key:'catalog-delete:'+itemType+':'+norm(name),severity:'error',source:'Catalogue',title:'Suppression de « '+name+' » impossible',message:String(error?.message||'La demande n’a pas pu être envoyée.')});
  }
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
function resetView(){currentQuery='';currentConfirm='';openGroup='';openItem='';blockedItem=null}
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
      currentQuery=event.target.value;currentConfirm='';openItem='';blockedItem=null;void render();
    }
  });
  panel.addEventListener('click',event=>{
    event.stopPropagation();
    const group=event.target.closest('[data-admin-group]');
    if(group){const name=group.dataset.adminGroup||'';openGroup=openGroup===name?'':name;openItem='';currentConfirm='';blockedItem=null;void render();return}
    const del=event.target.closest('[data-delete-item]');if(del){void beginDeletion(del.dataset.itemType||'product',del.dataset.deleteItem||'',del);return}
    if(event.target.closest('.courses-product-admin-cancel')){currentConfirm='';void render();return}
    const finalButton=event.target.closest('[data-confirm-delete]');if(finalButton){void confirmDeletion(finalButton.dataset.itemType||'product',finalButton.dataset.confirmDelete||'',finalButton);return}
    const item=event.target.closest('[data-admin-item]');
    if(item){const key=item.dataset.adminItem||'';openItem=openItem===key?'':key;currentConfirm='';blockedItem=null;void render()}
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
