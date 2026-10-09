(()=>{
'use strict';

const DELETE_PREFIX='__courses_delete_product__:';
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const PENDING_KEY='courses-catalog-delete-pending-v1';
const PENDING_TTL_MS=20*60*1000;
let haSocket=null;
let haSeq=997000000;
const haPending=new Map();
let currentQuery='';
let currentConfirm='';
let uiBound=false;

const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const slugify=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function readPending(){
  try{
    const value=JSON.parse(localStorage.getItem(PENDING_KEY)||'{}');
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const now=Date.now();
    let changed=false;
    for(const [key,item] of Object.entries(value)){
      if(now-Number(item?.startedAt||0)>PENDING_TTL_MS){delete value[key];changed=true}
    }
    if(changed)localStorage.setItem(PENDING_KEY,JSON.stringify(value));
    return value;
  }catch(_){return {}}
}
function setPending(name,state){
  const key=norm(name);if(!key)return;
  const pending=readPending();
  if(state)pending[key]=state;else delete pending[key];
  try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending))}catch(_){}
}
function pendingFor(name){return readPending()[norm(name)]||null}

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

function bindHaSocket(socket){
  if(!socket||socket===haSocket)return;
  haSocket=socket;
  socket.addEventListener('message',event=>{
    let message;try{message=JSON.parse(event.data)}catch(_){return}
    if(message.type!=='result'||!haPending.has(message.id))return;
    const pending=haPending.get(message.id);haPending.delete(message.id);clearTimeout(pending.timer);
    if(message.success)pending.resolve(message.result);else pending.reject(new Error(message.error?.message||'Erreur Home Assistant'));
  });
  socket.addEventListener('close',()=>{
    if(haSocket!==socket)return;haSocket=null;
    haPending.forEach(pending=>{clearTimeout(pending.timer);pending.reject(new Error('Connexion Home Assistant interrompue'))});
    haPending.clear();
  });
}
function installHaBridge(){
  if(!('WebSocket' in window)||window.__coursesCatalogAdminBridge)return;
  window.__coursesCatalogAdminBridge=true;
  const previousSend=WebSocket.prototype.send;
  WebSocket.prototype.send=function(data){
    try{if(String(this.url||'').includes('/api/websocket'))bindHaSocket(this)}catch(_){}
    return previousSend.call(this,data);
  };
}
function sendHaRequest(socket,payload){
  return new Promise((resolve,reject)=>{
    const id=haSeq++;
    const timer=setTimeout(()=>{haPending.delete(id);reject(new Error('Home Assistant ne répond pas.'))},HA_REQUEST_TIMEOUT_MS);
    haPending.set(id,{resolve,reject,timer});
    try{socket.send(JSON.stringify({id,...payload}))}catch(error){clearTimeout(timer);haPending.delete(id);reject(error)}
  });
}
async function waitForHaSocket(){
  if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
  document.getElementById('refreshBtn')?.click();
  const start=Date.now();
  while(Date.now()-start<1800){
    if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
    await new Promise(resolve=>setTimeout(resolve,60));
  }
  throw new Error('Connexion Home Assistant indisponible.');
}
async function haRequest(payload){return sendHaRequest(await waitForHaSocket(),payload)}
async function readVapidPublicKey(){
  const states=await haRequest({type:'get_states'});
  const entity=Array.isArray(states)?states.find(item=>item?.entity_id===VAPID_ENTITY):null;
  const key=String(entity?.state||'').trim();
  return key.length>=80?key:'';
}
function base64UrlToBytes(value){
  const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64);
  return Uint8Array.from(raw,char=>char.charCodeAt(0));
}
async function pushData(){
  if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw new Error('Web Push indisponible sur cet appareil.');
  let permission=Notification.permission;
  if(permission==='default')permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error('Notifications non autorisées. Active-les pour Courses dans les réglages iOS.');
  const publicKey=await readVapidPublicKey();
  if(!publicKey)throw new Error('Clé VAPID publique absente dans Home Assistant.');
  const registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64UrlToBytes(publicKey)});
  const json=subscription.toJSON();
  const data={push_endpoint:String(subscription.endpoint||''),push_p256dh:String(json.keys?.p256dh||''),push_auth:String(json.keys?.auth||''),push_public_key:publicKey};
  if(!data.push_endpoint||!data.push_p256dh||!data.push_auth)throw new Error('Souscription Web Push incomplète.');
  return data;
}
async function requestDeletion(name){
  const requestId=randomId();
  const push=await pushData();
  const socket=await waitForHaSocket();
  await sendHaRequest(socket,{type:'call_service',domain:'rest_command',service:'courses_integrate_dish_openai',service_data:{
    dish_name:DELETE_PREFIX+name,dish_category:'',request_id:requestId,...push
  }});
  setPending(name,{requestId,startedAt:Date.now()});
  return requestId;
}

function installStyle(){
  if(document.getElementById('courses-product-admin-style'))return;
  const style=document.createElement('style');style.id='courses-product-admin-style';style.textContent=`
    .courses-product-admin{display:grid;gap:11px;padding-bottom:5px}
    .courses-product-admin-back{justify-self:start;border:0;background:transparent;color:#0b7040;font:inherit;font-size:12px;font-weight:800;padding:2px 0 5px}
    .courses-product-admin-note{padding:10px 12px;border-radius:15px;background:#f4f7f5;color:#657269;font-size:10.5px;line-height:1.4}
    .courses-product-admin-search{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:1px solid rgba(34,65,45,.11);border-radius:14px;background:#fff}
    .courses-product-admin-search svg{width:15px;height:15px;color:#78827c}.courses-product-admin-search input{min-width:0;flex:1;border:0!important;outline:0;background:transparent;font:inherit;font-size:12px;color:#24392c}.courses-product-admin-search span{font-size:9.5px;color:#8a928d;font-weight:750}
    .courses-product-admin-list{display:grid;gap:7px}
    .courses-product-admin-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 10px 10px 12px;border:1px solid rgba(33,64,44,.09);border-radius:16px;background:#fff}
    .courses-product-admin-copy{min-width:0}.courses-product-admin-copy strong{display:block;color:#253a2d;font-size:12px;line-height:1.2}.courses-product-admin-copy small{display:block;margin-top:3px;color:#7a847d;font-size:9.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .courses-product-admin-delete{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(218,48,42,.12);border-radius:12px;background:rgba(255,59,48,.065);color:#d93025}.courses-product-admin-delete svg{width:15px;height:15px}.courses-product-admin-delete:disabled{opacity:.42}
    .courses-product-admin-pending{font-size:9.5px;font-weight:780;color:#b36a00;background:rgba(255,149,0,.10);padding:5px 8px;border-radius:9px}
    .courses-product-admin-confirm{grid-column:1/-1;margin-top:2px;padding:11px;border-radius:13px;background:rgba(255,59,48,.055);border:1px solid rgba(218,48,42,.10)}
    .courses-product-admin-confirm strong{display:block;color:#b82924;font-size:11.5px}.courses-product-admin-confirm p{margin:4px 0 9px;color:#6f615e;font-size:9.8px;line-height:1.4}.courses-product-admin-confirm-actions{display:flex;gap:7px;justify-content:flex-end}.courses-product-admin-confirm-actions button{min-height:32px;padding:0 11px;border-radius:10px;font-size:10px;font-weight:790}.courses-product-admin-cancel{border:1px solid rgba(55,75,63,.10);background:#fff;color:#68736c}.courses-product-admin-confirm-delete{border:0;background:#d93025;color:#fff}
    .courses-product-admin-empty{padding:28px 14px;text-align:center;color:#78827c;font-size:11px;border:1px dashed rgba(43,72,54,.14);border-radius:16px}
    .courses-product-admin-feedback{min-height:16px;color:#657269;font-size:10px;text-align:center}.courses-product-admin-feedback.is-error{color:#d93025}.courses-product-admin-feedback.is-ok{color:#0b7040}
  `;document.head.appendChild(style);
}
function panelElements(){
  const dialog=document.getElementById('preferencesDialog');
  const content=dialog?.querySelector(':scope>.preference-dialog-scroll');
  return {dialog,content,panel:document.getElementById('preferencesProductCatalogPanel'),title:content?.querySelector(':scope>h3'),intro:content?.querySelector(':scope>.dialog-intro')};
}
function showManagement(){
  const {content,panel,title,intro}=panelElements(),management=document.getElementById('preferencesApplicationManagement');
  if(!content||!management)return;
  [...content.children].forEach(node=>{if(node===title||node===intro||node===management)return;node.hidden=true});
  if(panel)panel.hidden=true;management.hidden=false;
  if(title)title.textContent='Gestion de l’application';
  if(intro)intro.textContent='Documentation, historique et informations de l’application.';
}
function visibleProducts(){
  const query=norm(currentQuery);return products().filter(item=>!query||norm(item.name+' '+item.category+' '+item.subgroup).includes(query));
}
function render(){
  const panel=document.getElementById('preferencesProductCatalogPanel');if(!panel)return;
  const rows=visibleProducts(),allCount=products().length;
  panel.innerHTML='<button class="courses-product-admin-back" type="button">‹ Gestion de l’application</button>'+
    '<div class="courses-product-admin-note">La suppression retire le produit du catalogue et du dépôt GitHub. Si un plat l’utilise encore, la suppression sera bloquée. Un article déjà présent dans la liste Home Assistant reste dans Ma liste.</div>'+
    '<label class="courses-product-admin-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><input type="search" value="'+esc(currentQuery)+'" placeholder="Rechercher un produit…" autocomplete="off"><span>'+allCount+'</span></label>'+
    '<div class="courses-product-admin-list">'+(rows.map(item=>{
      const pending=pendingFor(item.name),confirm=currentConfirm===item.name;
      return '<article class="courses-product-admin-row" data-product="'+esc(item.name)+'"><div class="courses-product-admin-copy"><strong>'+esc(item.name)+'</strong><small>'+esc(item.category)+' · '+esc(item.subgroup)+'</small></div>'+
        (pending?'<span class="courses-product-admin-pending">Suppression…</span>':'<button class="courses-product-admin-delete" type="button" aria-label="Supprimer '+esc(item.name)+'" data-delete-product="'+esc(item.name)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8.5 0 .8 13h9.4l.8-13M10 11v5m4-5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')+
        (confirm?'<div class="courses-product-admin-confirm"><strong>Supprimer définitivement « '+esc(item.name)+' » ?</strong><p>Le produit et son image seront retirés de la branche main après validation GitHub. Cette action ne modifie pas automatiquement votre liste Home Assistant.</p><div class="courses-product-admin-confirm-actions"><button class="courses-product-admin-cancel" type="button">Annuler</button><button class="courses-product-admin-confirm-delete" type="button" data-confirm-delete="'+esc(item.name)+'">Supprimer définitivement</button></div></div>':'')+'</article>';
    }).join('')||'<div class="courses-product-admin-empty">Aucun produit ne correspond à cette recherche.</div>')+'</div><div class="courses-product-admin-feedback" role="status" aria-live="polite"></div>';
}
function feedback(message,type=''){
  const el=document.querySelector('#preferencesProductCatalogPanel .courses-product-admin-feedback');if(!el)return;
  el.textContent=message||'';el.className='courses-product-admin-feedback'+(type?' is-'+type:'');
}
function showCatalog(){
  const {dialog,content,panel,title,intro}=panelElements();if(!dialog||!content||!panel)return;
  [...content.children].forEach(node=>{if(node===title||node===intro||node===panel)return;node.hidden=true});
  panel.hidden=false;if(title)title.textContent='Catalogue produit';if(intro)intro.textContent='Gérez les produits présents dans le catalogue de l’application.';
  currentQuery='';currentConfirm='';render();if(!dialog.open)dialog.showModal();
}
async function confirmDeletion(name,button){
  button.disabled=true;feedback('Envoi de la demande de suppression…');
  try{
    await requestDeletion(name);currentConfirm='';render();feedback('Suppression demandée. Une notification confirmera la mise à jour GitHub.','ok');
  }catch(error){
    button.disabled=false;feedback(String(error?.message||'Suppression impossible.'),'error');
    window.CoursesErrors?.report?.({key:'catalog-delete:'+norm(name),severity:'error',source:'Catalogue',title:'Suppression de « '+name+' » impossible',message:String(error?.message||'La demande n’a pas pu être envoyée.')});
  }
}
function consumeResultParams(){
  let url;try{url=new URL(location.href)}catch(_){return}
  const status=url.searchParams.get('courses_status'),name=url.searchParams.get('courses_product');
  if(!name||!['deleted','error'].includes(String(status||'')))return;
  setPending(name,null);
  if(status==='deleted'){
    ['courses_status','courses_product','courses_request','courses_error','courses_stage'].forEach(key=>url.searchParams.delete(key));
    try{history.replaceState(history.state,'',url.pathname+url.search+url.hash)}catch(_){}
    navigator.serviceWorker?.getRegistration?.().then(reg=>reg?.update?.()).finally(()=>setTimeout(()=>location.reload(),500));
  }
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
    button.innerHTML='<span class="security-setting-icon"><svg><use href="#i-grid"></use></svg></span><span class="security-setting-copy"><strong>Catalogue produit</strong><small>Consulter et supprimer définitivement des produits</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    if(errorButton)errorButton.before(button);else management.appendChild(button);
  }
  let panel=document.getElementById('preferencesProductCatalogPanel');
  if(!panel){panel=document.createElement('div');panel.id='preferencesProductCatalogPanel';panel.className='courses-product-admin';panel.hidden=true;content.appendChild(panel)}
  button.addEventListener('click',showCatalog);
  panel.addEventListener('input',event=>{if(event.target.matches('input[type="search"]')){currentQuery=event.target.value;currentConfirm='';render();panel.querySelector('input[type="search"]')?.focus()}});
  panel.addEventListener('click',event=>{
    if(event.target.closest('.courses-product-admin-back')){showManagement();return}
    const del=event.target.closest('[data-delete-product]');if(del){currentConfirm=del.dataset.deleteProduct||'';render();return}
    if(event.target.closest('.courses-product-admin-cancel')){currentConfirm='';render();return}
    const confirm=event.target.closest('[data-confirm-delete]');if(confirm){void confirmDeletion(confirm.dataset.confirmDelete||'',confirm)}
  });
  dialog.addEventListener('close',()=>{panel.hidden=true;currentConfirm=''});
  return true;
}
function bindWhenReady(){
  if(bindUi())return;const observer=new MutationObserver(()=>{if(bindUi())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),12000);
}

installHaBridge();
consumeResultParams();
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',event=>{
  const payload=event.data?.payload||{};
  if(event.data?.type==='courses-error-signal'&&payload.status==='error'&&payload.itemName)setPending(payload.itemName,null);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindWhenReady,{once:true});else bindWhenReady();
})();