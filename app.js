(() => {
'use strict';

const CATALOG = window.COURSES_CATALOG;
if (!CATALOG) throw new Error('Catalogue indisponible');

const GROUPS = CATALOG.groups;
const META = CATALOG.meta;
const FAVORITES = CATALOG.favorites;
const CATEGORY_META = {
  'Favoris': { icon:'★', label:'Favoris' },
  'Frais': { icon:'◒', label:'Frais' },
  'Fruits & Légumes': { icon:'●', label:'Fruits & Légumes' },
  'Épicerie': { icon:'▣', label:'Épicerie' },
  'Boissons': { icon:'▥', label:'Boissons' },
  'Maison': { icon:'⌂', label:'Maison' }
};

const STORAGE = {
  haUrl:'courses-external-ha-url-v1',
  auth:'courses-external-auth-v1',
  entity:'courses-external-entity-v1',
  usage:'courses-external-usage-v1'
};
const DEMO_KEY = 'courses-external-demo-items-v2';
const CLIENT_ID = location.origin;
const REDIRECT_URI = location.origin + location.pathname;
const $ = selector => document.querySelector(selector);
const norm = value => String(value || '').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function normalizeHaUrl(value) {
  const raw=String(value||'').trim().replace(/\/+$/,'');
  if(!raw) return '';
  try {
    const url=new URL(raw);
    if(url.protocol!=='https:') return '';
    return url.origin + url.pathname.replace(/\/+$/,'');
  } catch (_) { return ''; }
}
function loadJson(key, fallback=null){try{return JSON.parse(localStorage.getItem(key)||'null') ?? fallback}catch(_){return fallback}}
function saveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function deleteKey(key){localStorage.removeItem(key)}

const ALL=[];
Object.entries(GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names])=>names.forEach(name=>ALL.push({name,category,sub}))));
const BY_NAME=new Map(ALL.map(p=>[norm(p.name),p]));
const POSITIONS=new Map();
Object.entries(GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names],row)=>names.forEach((name,col)=>POSITIONS.set(norm(name),{category,sub,row,col}))));

let state={
  haUrl:normalizeHaUrl(localStorage.getItem(STORAGE.haUrl)||''),
  accessToken:'',
  ws:null,
  seq:1,
  pending:new Map(),
  entities:[],
  entity:localStorage.getItem(STORAGE.entity)||'',
  items:[],
  loading:true,
  error:'',
  category:'Favoris',
  productQuery:'',
  listQuery:'',
  view:'catalog',
  reconnectTimer:null,
  intentionalClose:false,
  demo:false,
  usage:loadJson(STORAGE.usage,{})||{}
};

const ITEM_ICONS = [
  [/pain|baguette|brioche|croissant|wrap/i,'🥖'],
  [/lait|crème|yaourt|fromage|beurre|skyr/i,'🥛'],
  [/oeuf|œuf/i,'🥚'],
  [/pomme|poire|banane|orange|citron|fraise|raisin|kiwi|mangue|ananas|fruit/i,'🍎'],
  [/tomate|carotte|courgette|aubergine|poivron|salade|brocoli|chou|légume/i,'🥕'],
  [/café/i,'☕'],
  [/thé|infusion|matcha/i,'🍵'],
  [/eau|jus|coca|soda|limonade|smoothie|sirop/i,'🥤'],
  [/vin|bière|champagne|rhum|whisky|cidre|prosecco/i,'🍷'],
  [/pâtes|spaghetti|penne|riz|semoule|quinoa|boulgour/i,'🍝'],
  [/papier|mouchoir|essuie/i,'🧻'],
  [/lessive|vaisselle|nettoyant|éponge|javel|détartrant/i,'🧽'],
  [/poulet|boeuf|bœuf|porc|veau|agneau|steak|jambon|saucisse|merguez/i,'🥩'],
  [/saumon|poisson|thon|crevette|moule|truite|cabillaud/i,'🐟'],
  [/glace|sorbet/i,'🍨'],
  [/chocolat|cookie|biscuit|bonbon|madeleine|gaufre|brownie/i,'🍫']
];
function productEmoji(name){
  const hit=ITEM_ICONS.find(([rx])=>rx.test(String(name||'')));
  return hit ? hit[1] : '🛒';
}
function sprite(product,compact=false){
  return '<span class="emoji-icon'+(compact?' is-compact':'')+'">'+productEmoji(product?.name)+'</span>';
}
function usageSave(){saveJson(STORAGE.usage,state.usage)}
function recordUsage(name){const key=norm(name);const old=state.usage[key]||{count:0,lastAt:0};state.usage[key]={count:Number(old.count||0)+1,lastAt:Date.now()};usageSave()}
function favorites(){
  const ranked=Object.entries(state.usage).filter(([key])=>BY_NAME.has(key)).sort((a,b)=>Number(b[1]?.count||0)-Number(a[1]?.count||0)||Number(b[1]?.lastAt||0)-Number(a[1]?.lastAt||0)).map(([key])=>BY_NAME.get(key));
  const out=[],seen=new Set();
  [...ranked,...FAVORITES.map(n=>BY_NAME.get(norm(n))).filter(Boolean)].forEach(p=>{const k=norm(p?.name);if(!p||!k||seen.has(k)||out.length>=12)return;seen.add(k);out.push(p)});
  return out;
}
function unique(products){const seen=new Set();return products.filter(p=>{const k=norm(p.name);if(!k||seen.has(k))return false;seen.add(k);return true})}
function visibleProducts(){
  const needle=norm(state.productQuery);
  if(needle){
    const tokens=needle.split(' ').filter(Boolean);
    return unique(ALL).map(product=>{
      const name=norm(product.name),category=norm(product.category),sub=norm(product.sub),hay=name+' '+category+' '+sub;
      if(!tokens.every(t=>hay.includes(t)))return null;
      let score=0;if(name===needle)score+=100;if(name.startsWith(needle))score+=60;if(name.includes(needle))score+=35;
      tokens.forEach(t=>{if(name.split(' ').some(w=>w.startsWith(t)))score+=14;else if(name.includes(t))score+=8;else if(sub.includes(t))score+=3});
      return {product,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.product.name.localeCompare(b.product.name,'fr')).map(x=>x.product);
  }
  if(state.category==='Favoris')return favorites();
  const subs=GROUPS[state.category]||{};
  return unique(Object.entries(subs).flatMap(([sub,names])=>names.map(name=>({name,category:state.category,sub}))));
}
function activeGroups(){
  const groups=new Map();
  state.items.filter(i=>String(i?.status||'needs_action')!=='completed').forEach(item=>{
    const summary=String(item?.summary??item?.name??item?.item??'').trim()||'Article';
    const key=norm(summary)||summary;
    if(!groups.has(key))groups.set(key,{summary,count:0,uids:[]});
    const group=groups.get(key);group.count++;
    const uid=String(item?.uid??item?.id??item?.item_id??'').trim();if(uid)group.uids.push(uid);
  });
  return [...groups.values()];
}
function selectedSet(){return new Set(activeGroups().map(g=>norm(g.summary)))}

function status(kind,title,detail=''){
  const el=$('#status');el.className='status '+kind;
  el.innerHTML='<span></span><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div>';
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('is-visible');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('is-visible'),1700)}
function showSetup(message=''){
  $('#app').classList.add('is-locked');
  $('#setup').classList.add('is-visible');
  $('#haUrlInput').value=state.haUrl||'';
  $('#setupError').textContent=message;
}
function hideSetup(){$('#app').classList.remove('is-locked');$('#setup').classList.remove('is-visible')}

function renderCategories(){
  const el=$('#categories');
  el.innerHTML=Object.keys(CATEGORY_META).map(category=>'<button type="button" class="cat '+(state.category===category?'is-active':'')+'" data-category="'+esc(category)+'"><span>'+CATEGORY_META[category].icon+'</span><small>'+esc(CATEGORY_META[category].label)+'</small></button>').join('');
  el.querySelectorAll('.cat').forEach(button=>button.onclick=()=>{state.category=button.dataset.category||'Favoris';state.productQuery='';$('#productSearch').value='';renderCategories();renderProducts()});
}
function renderProducts(){
  const el=$('#products'),products=visibleProducts(),selected=selectedSet();
  $('#productCount').textContent=products.length+' produit'+(products.length>1?'s':'');
  if(!products.length){el.innerHTML='<div class="empty is-wide">Aucun produit ne correspond à cette recherche.</div>';return}
  el.innerHTML=products.map(product=>{
    const active=selected.has(norm(product.name));
    return '<button type="button" class="product '+(active?'is-selected':'')+'" data-name="'+esc(product.name)+'">'+(active?'<span class="badge">✓</span>':'')+'<span class="media">'+sprite(product)+'</span><span class="pname">'+esc(product.name)+'</span></button>';
  }).join('');
  el.querySelectorAll('.product').forEach(button=>button.onclick=()=>addItem(button.dataset.name||''));
}
function renderList(){
  const groups=activeGroups(),needle=norm(state.listQuery),rows=groups.filter(g=>!needle||norm(g.summary).includes(needle)),el=$('#listItems');
  $('#listCount').textContent=groups.length+' article'+(groups.length>1?'s':'');
  if(state.loading&&!groups.length){el.innerHTML='<div class="empty"><span class="spinner"></span>Synchronisation…</div>';return}
  if(!rows.length){el.innerHTML='<div class="empty">'+(needle?'Aucun article trouvé.':(state.error?'Liste indisponible.':'La liste est vide.'))+'</div>';return}
  el.innerHTML=rows.map(group=>{
    const product=BY_NAME.get(norm(group.summary));
    return '<div class="list-row"><button class="remove" type="button" data-uid="'+esc(group.uids[0]||'')+'" aria-label="Retirer">×</button><span class="list-icon">'+(product?sprite(product,true):'<span class="unknown">•</span>')+'</span><span class="list-name">'+esc(group.summary)+'</span><span class="qty">x'+group.count+'</span></div>';
  }).join('');
  el.querySelectorAll('.remove').forEach(button=>button.onclick=()=>completeOne(button.dataset.uid||''));
}
function renderView(){
  $('#catalogView').classList.toggle('is-active',state.view==='catalog');
  $('#listView').classList.toggle('is-active',state.view==='list');
  document.querySelectorAll('.tab').forEach(button=>button.classList.toggle('is-active',button.dataset.view===state.view));
  renderCategories();renderProducts();renderList();
}

function authRecord(){return loadJson(STORAGE.auth,null)}
function saveAuth(data){saveJson(STORAGE.auth,data)}
function clearAuth(){deleteKey(STORAGE.auth);state.accessToken=''}
async function exchangeCode(code){
  const authState=loadJson('courses-external-oauth-state',null);
  const query=new URLSearchParams(location.search);
  const returnedState=query.get('state')||'';
  if(!authState||authState.nonce!==returnedState||authState.haUrl!==state.haUrl)throw new Error('Validation de connexion impossible');
  const body=new URLSearchParams({grant_type:'authorization_code',code,client_id:CLIENT_ID});
  const response=await fetch(state.haUrl+'/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Home Assistant a refusé la connexion');
  const data=await response.json();
  saveAuth({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+Number(data.expires_in||1800)*1000,ha_url:state.haUrl});
  deleteKey('courses-external-oauth-state');
  history.replaceState({},'',REDIRECT_URI);
  return data.access_token;
}
async function refreshToken(record){
  const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:record.refresh_token,client_id:CLIENT_ID});
  const response=await fetch(state.haUrl+'/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Session expirée');
  const data=await response.json();
  const next={...record,access_token:data.access_token,expires_at:Date.now()+Number(data.expires_in||1800)*1000,ha_url:state.haUrl};
  saveAuth(next);return next.access_token;
}
async function ensureAccessToken(){
  const query=new URLSearchParams(location.search),code=query.get('code');
  if(code)return exchangeCode(code);
  const record=authRecord();
  if(!record?.refresh_token||normalizeHaUrl(record.ha_url)!==state.haUrl)return '';
  if(record.access_token&&Number(record.expires_at||0)>Date.now()+60000)return record.access_token;
  try{return await refreshToken(record)}catch(_){clearAuth();return ''}
}
function beginOAuth(){
  state.demo=false;
  const value=normalizeHaUrl($('#haUrlInput').value);
  if(!value){$('#setupError').textContent='Entre une adresse HTTPS Home Assistant valide.';return}
  state.haUrl=value;localStorage.setItem(STORAGE.haUrl,value);
  const nonce=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));
  saveJson('courses-external-oauth-state',{nonce,haUrl:value});
  const authorize=value+'/auth/authorize?client_id='+encodeURIComponent(CLIENT_ID)+'&redirect_uri='+encodeURIComponent(REDIRECT_URI)+'&state='+encodeURIComponent(nonce);
  location.assign(authorize);
}
async function revoke(){
  state.demo=false;
  const record=authRecord();
  if(record?.refresh_token&&state.haUrl){
    try{await fetch(state.haUrl+'/auth/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:record.refresh_token})})}catch(_){}
  }
  clearAuth();deleteKey(STORAGE.entity);state.entity='';state.items=[];state.intentionalClose=true;
  try{state.ws?.close()}catch(_){}
  showSetup('');
}

function websocketUrl(){const u=new URL(state.haUrl);u.protocol=u.protocol==='https:'?'wss:':'ws:';u.pathname=(u.pathname.replace(/\/$/,'')+'/api/websocket');u.search='';u.hash='';return u.toString()}
function request(payload){
  return new Promise((resolve,reject)=>{
    if(!state.ws||state.ws.readyState!==WebSocket.OPEN){reject(new Error('Connexion interrompue'));return}
    const id=state.seq++,timer=setTimeout(()=>{state.pending.delete(id);reject(new Error('Home Assistant ne répond pas'))},12000);
    state.pending.set(id,{resolve,reject,timer});
    state.ws.send(JSON.stringify({id,...payload}));
  });
}
function connectWs(token){
  return new Promise((resolve,reject)=>{
    state.intentionalClose=false;
    const ws=new WebSocket(websocketUrl());state.ws=ws;
    let authed=false;
    const timeout=setTimeout(()=>{try{ws.close()}catch(_){}reject(new Error('Connexion distante impossible'))},12000);
    ws.onmessage=event=>{
      let msg;try{msg=JSON.parse(event.data)}catch(_){return}
      if(msg.type==='auth_required'){ws.send(JSON.stringify({type:'auth',access_token:token}));return}
      if(msg.type==='auth_invalid'){clearTimeout(timeout);reject(new Error('Autorisation Home Assistant invalide'));return}
      if(msg.type==='auth_ok'){authed=true;clearTimeout(timeout);resolve();return}
      if(msg.type==='result'&&state.pending.has(msg.id)){const p=state.pending.get(msg.id);state.pending.delete(msg.id);clearTimeout(p.timer);msg.success?p.resolve(msg.result):p.reject(new Error(msg.error?.message||'Erreur Home Assistant'));return}
      if(msg.type==='event'&&msg.event?.variables?.trigger?.entity_id===state.entity)setTimeout(refreshItems,120);
    };
    ws.onerror=()=>{if(!authed){clearTimeout(timeout);reject(new Error('WebSocket Home Assistant indisponible'))}};
    ws.onclose=()=>{
      state.pending.forEach(p=>{clearTimeout(p.timer);p.reject(new Error('Connexion interrompue'))});state.pending.clear();
      if(authed&&!state.intentionalClose){status('is-waiting','Reconnexion…','Home Assistant');clearTimeout(state.reconnectTimer);state.reconnectTimer=setTimeout(init,2500)}
    };
  });
}
async function discoverEntities(){
  const states=await request({type:'get_states'});
  state.entities=states.filter(s=>String(s.entity_id||'').startsWith('todo.')).map(s=>({id:s.entity_id,name:s.attributes?.friendly_name||s.entity_id}));
  if(state.entity&&state.entities.some(e=>e.id===state.entity))return state.entity;
  const preferred=state.entities.find(e=>/bring|shopping[_ ]?list|courses/i.test(e.id+' '+e.name));
  if(preferred){state.entity=preferred.id;localStorage.setItem(STORAGE.entity,state.entity);return state.entity}
  if(state.entities.length===1){state.entity=state.entities[0].id;localStorage.setItem(STORAGE.entity,state.entity);return state.entity}
  return '';
}
async function subscribe(){try{await request({type:'subscribe_trigger',trigger:{platform:'state',entity_id:state.entity}})}catch(_){}}
async function refreshItems(){
  if(state.demo){
    state.items=loadJson(DEMO_KEY,[])||[];
    state.loading=false;state.error='';
    renderProducts();renderList();
    status('', 'Mode test', 'Stockage local sur ce téléphone');
    return;
  }
  if(!state.entity)return;
  try{
    const result=await request({type:'todo/item/list',entity_id:state.entity});
    state.items=Array.isArray(result?.items)?result.items:[];
    state.loading=false;state.error='';renderProducts();renderList();
    status('', 'Synchronisé',state.entities.find(e=>e.id===state.entity)?.name||state.entity);
  }catch(error){state.loading=false;state.error=error.message||'Synchronisation indisponible';renderList();status('is-error','Hors synchro',state.error)}
}
async function addItem(name){
  const item=String(name||'').trim();
  if(!item)return;
  if(state.demo){
    const items=loadJson(DEMO_KEY,[])||[];
    items.push({uid:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2),summary:item,status:'needs_action'});
    saveJson(DEMO_KEY,items);state.items=items;recordUsage(item);
    navigator.vibrate?.(10);toast(item+' ajouté');renderProducts();renderList();return;
  }
  if(!state.entity)return;
  try{
    await request({type:'call_service',domain:'todo',service:'add_item',service_data:{item},target:{entity_id:state.entity}});
    recordUsage(item);navigator.vibrate?.(10);toast(item+' ajouté');await refreshItems();
  }catch(error){toast('Ajout impossible');status('is-error','Erreur',error.message||'Ajout impossible')}
}
async function completeOne(uid){
  if(!uid)return;
  if(state.demo){
    const items=(loadJson(DEMO_KEY,[])||[]).filter(item=>String(item.uid)!==String(uid));
    saveJson(DEMO_KEY,items);state.items=items;navigator.vibrate?.(8);
    renderProducts();renderList();return;
  }
  if(!state.entity)return;
  try{await request({type:'call_service',domain:'todo',service:'update_item',service_data:{item:uid,status:'completed'},target:{entity_id:state.entity}});navigator.vibrate?.(8);await refreshItems()}catch(_){toast('Suppression impossible')}
}
function openSettings(){
  if(state.demo){showSetup('Mode test actif. Connecte Home Assistant pour synchroniser la vraie liste.');return}
  $('#settingsHaUrl').value=state.haUrl;
  $('#entitySelect').innerHTML=state.entities.map(e=>'<option value="'+esc(e.id)+'" '+(e.id===state.entity?'selected':'')+'>'+esc(e.name)+' — '+esc(e.id)+'</option>').join('');
  $('#settingsDialog').showModal();
}
function saveSettings(){
  const nextUrl=normalizeHaUrl($('#settingsHaUrl').value),nextEntity=$('#entitySelect').value;
  if(!nextUrl)return;
  const changedUrl=nextUrl!==state.haUrl;
  state.haUrl=nextUrl;localStorage.setItem(STORAGE.haUrl,nextUrl);
  if(nextEntity){state.entity=nextEntity;localStorage.setItem(STORAGE.entity,nextEntity)}
  $('#settingsDialog').close();
  if(changedUrl){clearAuth();state.intentionalClose=true;try{state.ws?.close()}catch(_){}showSetup('Adresse modifiée : reconnecte Home Assistant.')}else refreshItems();
}
async function init(){
  if(!state.haUrl){state.loading=false;renderView();showSetup();status('is-waiting','Configuration requise','Première connexion');return}
  try{
    status('is-waiting','Connexion…','Home Assistant');
    const token=await ensureAccessToken();
    if(!token){state.loading=false;renderView();showSetup();return}
    state.accessToken=token;hideSetup();await connectWs(token);
    const entity=await discoverEntities();
    if(!entity){state.loading=false;renderList();status('is-waiting','Choisir une liste','Réglages');openSettings();return}
    await subscribe();await refreshItems();
  }catch(error){state.loading=false;state.error=error.message||'Connexion impossible';renderList();status('is-error','Hors connexion',state.error);if(!authRecord()?.refresh_token)showSetup(state.error)}
}

$('#connectBtn').onclick=beginOAuth;
$('#demoBtn').onclick=()=>{
  state.demo=true;state.loading=false;state.error='';
  state.items=loadJson(DEMO_KEY,[])||[];
  hideSetup();status('', 'Mode test', 'Stockage local sur ce téléphone');renderView();
};
$('#settingsBtn').onclick=openSettings;
$('#cancelSettings').onclick=()=>$('#settingsDialog').close();
$('#saveSettings').onclick=saveSettings;
$('#logoutBtn').onclick=revoke;
$('#productSearch').oninput=e=>{state.productQuery=e.target.value||'';renderProducts()};
$('#listSearch').oninput=e=>{state.listQuery=e.target.value||'';renderList()};
$('#manualAdd').onclick=()=>{const input=$('#manualInput'),value=input.value.trim();if(value){input.value='';addItem(value)}};
$('#manualInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('#manualAdd').click()}};
document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>{state.view=button.dataset.view||'catalog';renderView()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(state.demo)refreshItems();else if(state.ws?.readyState===WebSocket.OPEN)refreshItems()}});
window.addEventListener('online',()=>init());

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderView();init();
})();