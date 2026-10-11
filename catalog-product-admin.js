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
function haRequest(payload){return sharedHaClient().request(payload)}
function haCallService(domain,service,serviceData={}){return sharedHaClient().callService(domain,service,serviceData)}

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
    .courses-product-admin{display:grid;gap:11px;padding-bottom:5px}
    .courses-product-admin-modes{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border:1px solid rgba(34,65,45,.10);border-radius:15px;background:rgba(235,240,236,.72)}
    .courses-product-admin-mode{height:34px;border:0;border-radius:11px;background:transparent;color:#66736b;font:inherit;font-size:11px;font-weight:780}.courses-product-admin-mode.is-active{background:#fff;color:#184c32;box-shadow:0 2px 8px rgba(36,62,45,.10),inset 0 1px 0 rgba(255,255,255,.9)}
    .courses-product-admin-search{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:1px solid rgba(34,65,45,.11);border-radius:14px;background:#fff}
    .courses-product-admin-search svg{width:15px;height:15px;color:#78827c}.courses-product-admin-search input{min-width:0;flex:1;border:0!important;outline:0;background:transparent;font:inherit;font-size:12px;color:#24392c}.courses-product-admin-search span{font-size:9.5px;color:#8a928d;font-weight:750}
    .courses-product-admin-list{display:grid;gap:7px}.courses-product-admin-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 10px 10px 12px;border:1px solid rgba(33,64,44,.09);border-radius:16px;background:#fff}
    .courses-product-admin-copy{min-width:0}.courses-product-admin-copy strong{display:block;color:#253a2d;font-size:12px;line-height:1.2}.courses-product-admin-copy small{display:block;margin-top:3px;color:#7a847d;font-size:9.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .courses-product-admin-delete{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(218,48,42,.12);border-radius:12px;background:rgba(255,59,48,.065);color:#d93025}.courses-product-admin-delete svg{width:15px;height:15px}.courses-product-admin-delete:disabled{opacity:.42}
    .courses-product-admin-pending{font-size:9.5px;font-weight:780;color:#b36a00;background:rgba(255,149,0,.10);padding:5px 8px;border-radius:9px}
    .courses-product-admin-confirm{grid-column:1/-1;margin-top:2px;padding:11px;border-radius:13px;background:rgba(255,59,48,.055);border:1px solid rgba(218,48,42,.10)}
    .courses-product-admin-confirm strong{display:block;color:#b82924;font-size:11.5px}.courses-product-admin-confirm p{margin:4px 0 9px;color:#6f615e;font-size:9.8px;line-height:1.4}.courses-product-admin-confirm-actions{display:flex;gap:7px;justify-content:flex-end;align-items:center}.courses-product-admin-confirm-actions button{min-height:32px;padding:0 11px;border-radius:10px;font-size:10px;font-weight:790}.courses-product-admin-cancel{border:1px solid rgba(55,75,63,.10);background:#fff;color:#68736c}.courses-product-admin-confirm-delete{border:0;background:#d93025;color:#fff}
    .courses-product-admin-empty{padding:28px 14px;text-align:center;color:#78827c;font-size:11px;border:1px dashed rgba(43,72,54,.14);border-radius:16px}.courses-product-admin-feedback{min-height:16px;color:#657269;font-size:10px;text-align:center}.courses-product-admin-feedback.is-error{color:#d93025}.courses-product-admin-feedback.is-ok{color:#0b7040}
  `;
  document.head.appendChild(style);
}
function panelElements(){
  const dialog=document.getElementById('preferencesDialog');
  const content=dialog?.querySelector(':scope>.preference-dialog-scroll');
  return {dialog,content,panel:document.getElementById('preferencesProductCatalogPanel'),title:content?.querySelector(':scope>h3'),intro:content?.querySelector(':scope>.dialog-intro')};
}
function titleForMode(){
  const {title,intro}=panelElements();
  if(currentMode==='products'){
    if(window.COURSES_SETTINGS_NAV?.setTitle)window.COURSES_SETTINGS_NAV.setTitle('Catalogue produit','management');else if(title)title.textContent='Catalogue produit';
    if(intro)intro.textContent='Gérez les produits présents dans le catalogue de l’application.';
  }else{
    if(window.COURSES_SETTINGS_NAV?.setTitle)window.COURSES_SETTINGS_NAV.setTitle('Catalogue plats','management');else if(title)title.textContent='Catalogue plats';
    if(intro)intro.textContent='Gérez les plats et leurs recettes présents dans le catalogue.';
  }
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
  return '<div class="courses-product-admin-confirm"><strong>Supprimer définitivement « '+esc(item.name)+' » ?</strong><p>'+message+'</p><div class="courses-product-admin-confirm-actions"><button class="courses-product-admin-cancel" type="button">Annuler</button><button class="courses-product-admin-confirm-delete" type="button" data-confirm-delete="'+esc(item.name)+'" data-item-type="'+itemType+'">Supprimer définitivement</button></div></div>';
}
function renderRows(rows,itemType){
  const panel=document.getElementById('preferencesProductCatalogPanel');if(!panel)return;
  const visible=visibleRows(rows);
  const label=itemType==='dish'?'plat':'produit';
  panel.innerHTML=
    '<div class="courses-product-admin-modes" role="tablist" aria-label="Type de catalogue"><button class="courses-product-admin-mode'+(currentMode==='products'?' is-active':'')+'" type="button" role="tab" aria-selected="'+(currentMode==='products')+'" data-catalog-admin-mode="products">Produits</button><button class="courses-product-admin-mode'+(currentMode==='dishes'?' is-active':'')+'" type="button" role="tab" aria-selected="'+(currentMode==='dishes')+'" data-catalog-admin-mode="dishes">Plats</button></div>'+
    '<label class="courses-product-admin-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><input type="search" value="'+esc(currentQuery)+'" placeholder="Rechercher un '+label+'…" autocomplete="off" data-product-admin-search><span>'+rows.length+'</span></label>'+
    '<div class="courses-product-admin-list">'+(visible.map(item=>{
      const pending=pendingFor(itemType,item.name);
      return '<article class="courses-product-admin-row" data-item="'+esc(item.name)+'"><div class="courses-product-admin-copy"><strong>'+esc(item.name)+'</strong><small>'+esc(item.category)+' · '+esc(item.subgroup)+'</small></div>'+
        (pending?'<span class="courses-product-admin-pending">Suppression…</span>':'<button class="courses-product-admin-delete" type="button" aria-label="Supprimer '+esc(item.name)+'" data-delete-item="'+esc(item.name)+'" data-item-type="'+itemType+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8.5 0 .8 13h9.4l.8-13M10 11v5m4-5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')+confirmMarkup(item,itemType)+'</article>';
    }).join('')||'<div class="courses-product-admin-empty">Aucun '+label+' ne correspond à cette recherche.</div>')+'</div><div class="courses-product-admin-feedback" role="status" aria-live="polite"></div>';
}
async function render(){
  if(currentMode==='products'){renderRows(products(),'product');return}
  const panel=document.getElementById('preferencesProductCatalogPanel');if(!panel)return;
  panel.innerHTML='<div class="courses-product-admin-feedback">Chargement des plats…</div>';
  try{renderRows(await dishes(),'dish')}catch(error){panel.innerHTML='<div class="courses-product-admin-empty">'+esc(error?.message||'Impossible de charger les plats.')+'</div>'}
}
function feedback(message,type=''){
  const el=document.querySelector('#preferencesProductCatalogPanel .courses-product-admin-feedback');if(!el)return;
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
      feedback('Suppression bloquée : utilisé par '+usages.slice(0,5).join(', ')+(usages.length>5?'…':''),'error');
      button.disabled=false;return;
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
    currentConfirm='';await render();
    feedback('Suppression demandée. GitHub applique la modification en arrière-plan.','ok');
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
function showCatalog(){
  const {dialog,content,panel}=panelElements();if(!dialog||!content||!panel)return;
  [...content.children].forEach(node=>{if(node===panel||node===content.querySelector(':scope>h3')||node===content.querySelector(':scope>.dialog-intro'))return;node.hidden=true});
  panel.hidden=false;currentMode='products';currentQuery='';currentConfirm='';titleForMode();void render();if(!dialog.open)dialog.showModal();
  void reconcilePending();
}
function bindUi(){
  if(uiBound)return true;
  const management=document.getElementById('preferencesApplicationManagement');
  const errorButton=document.getElementById('preferencesErrorMessages');
  const dialog=document.getElementById('preferencesDialog');
  const content=dialog?.querySelector(':scope>.preference-dialog-scroll');
  if(!management||!dialog||!content)return false;
  uiBound=true;installStyle();
  let button=document.getElementById('preferencesProductCatalog');
  if(!button){
    button=document.createElement('button');button.id='preferencesProductCatalog';button.type='button';button.className='security-action-row';
    button.innerHTML='<span class="security-setting-icon"><svg><use href="#i-grid"></use></svg></span><span class="security-setting-copy"><strong>Catalogue</strong><small>Consulter et supprimer des produits ou des plats</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    if(errorButton)errorButton.before(button);else management.appendChild(button);
  }
  let panel=document.getElementById('preferencesProductCatalogPanel');
  if(!panel){panel=document.createElement('div');panel.id='preferencesProductCatalogPanel';panel.className='courses-product-admin';panel.hidden=true;content.appendChild(panel)}
  button.addEventListener('click',showCatalog);
  panel.addEventListener('input',event=>{
    if(event.target.matches('[data-product-admin-search]')){
      currentQuery=event.target.value;currentConfirm='';void render().then(()=>panel.querySelector('[data-product-admin-search]')?.focus());
    }
  });
  panel.addEventListener('click',event=>{
    const mode=event.target.closest('[data-catalog-admin-mode]');
    if(mode){currentMode=mode.dataset.catalogAdminMode==='dishes'?'dishes':'products';currentQuery='';currentConfirm='';titleForMode();void render();return}
    const del=event.target.closest('[data-delete-item]');if(del){void beginDeletion(del.dataset.itemType||'product',del.dataset.deleteItem||'',del);return}
    if(event.target.closest('.courses-product-admin-cancel')){currentConfirm='';void render();return}
    const finalButton=event.target.closest('[data-confirm-delete]');if(finalButton){void confirmDeletion(finalButton.dataset.itemType||'product',finalButton.dataset.confirmDelete||'',finalButton)}
  });
  dialog.addEventListener('close',()=>{panel.hidden=true;currentConfirm=''});
  return true;
}
function bindWhenReady(){
  if(bindUi())return;
  document.addEventListener('courses:settings-management-ready',bindUi,{once:true});
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
