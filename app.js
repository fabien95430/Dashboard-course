(() => {
'use strict';

const CATALOG = window.COURSES_CATALOG;
if (!CATALOG) throw new Error('Catalogue indisponible');

const GROUPS = CATALOG.groups;
const META = CATALOG.meta;
const FAVORITES = CATALOG.favorites;
const CATEGORY_META = {
  'Favoris': { label:'Favoris' },
  'Frais': { label:'Frais' },
  'Fruits & Légumes': { label:'Fruits & Légumes' },
  'Épicerie': { label:'Épicerie' },
  'Boissons': { label:'Boissons' },
  'Maison': { label:'Maison' }
};
const LIST_CATEGORIES=['Toutes',...Object.keys(GROUPS)];

const STORAGE = {
  // Legacy keys are kept only for one-time migration from the previous version.
  haUrl:'courses-external-ha-url-v1',
  auth:'courses-external-auth-v1',
  vault:'courses-secure-vault-v1',
  biometric:'courses-faceid-v1',
  entity:'courses-external-entity-v1',
  usage:'courses-external-usage-v1'
};
const DEMO_KEY = 'courses-external-demo-items-v2';
const OAUTH_STATE_KEY = 'courses-oauth-state-v2';
const OAUTH_TEMP_KEY = 'courses-oauth-temp-v2';
const LEGACY_OAUTH_STATE_KEY = 'courses-external-oauth-state';
const SECURITY = Object.freeze({
  version:1,
  kdf:'PBKDF2-SHA256',
  iterations:600000,
  minPasswordLength:10,
  idleLockMs:5*60*1000,
  backgroundLockMs:30*1000
});
const UTF8 = new TextEncoder();
const UTF8_DECODER = new TextDecoder();
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
  haUrl:'',
  accessToken:'',
  accessTokenExpiresAt:0,
  refreshToken:'',
  locked:true,
  securityMode:'',
  pendingOAuthCode:'',
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
  listCategory:'Toutes',
  view:'list',
  reconnectTimer:null,
  intentionalClose:false,
  demo:false,
  lockTimer:null,
  backgroundLockTimer:null,
  productBusy:new Set(),
  pendingRemoval:new Set(),
  faceAutoAttempted:false,
  facePromptActive:false,
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
function refreshVisualLock(){
  const blocked=$('#setup').classList.contains('is-visible')||$('#securityOverlay').classList.contains('is-visible');
  $('#app').classList.toggle('is-locked',blocked);
}
function showSetup(message=''){
  $('#securityOverlay').classList.remove('is-visible');
  $('#setup').classList.add('is-visible');
  $('#haUrlInput').value=state.haUrl||normalizeHaUrl(localStorage.getItem(STORAGE.haUrl)||'');
  $('#setupError').textContent=message;
  refreshVisualLock();
}
function hideSetup(){$('#setup').classList.remove('is-visible');refreshVisualLock()}

function renderCategories(){
  const el=$('#categories');
  el.innerHTML=Object.keys(CATEGORY_META).map(category=>'<button type="button" class="cat '+(state.category===category?'is-active':'')+'" data-category="'+esc(category)+'"><span class="cat-label">'+esc(CATEGORY_META[category].label)+'</span></button>').join('');
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
  el.querySelectorAll('.product').forEach(button=>button.onclick=()=>toggleProduct(button.dataset.name||''));
}
function closeListFilter(){
  const menu=$('#listFilterMenu'),button=$('#listFilterBtn');
  if(!menu||!button)return;
  menu.hidden=true;
  button.setAttribute('aria-expanded','false');
}
function renderListFilter(){
  const button=$('#listFilterBtn'),menu=$('#listFilterMenu');
  if(!button||!menu)return;
  button.innerHTML=esc(state.listCategory)+' <span aria-hidden="true">⌄</span>';
  menu.innerHTML=LIST_CATEGORIES.map(category=>'<button type="button" class="filter-option '+(state.listCategory===category?'is-active':'')+'" data-category="'+esc(category)+'" role="menuitem">'+esc(category)+'</button>').join('');
  menu.querySelectorAll('.filter-option').forEach(option=>option.onclick=event=>{
    event.stopPropagation();
    state.listCategory=option.dataset.category||'Toutes';
    closeListFilter();
    renderList();
  });
}
function renderList(){
  renderListFilter();
  const groups=activeGroups(),needle=norm(state.listQuery),category=state.listCategory||'Toutes';
  const rows=groups.filter(group=>{
    if(needle&&!norm(group.summary).includes(needle))return false;
    if(category==='Toutes')return true;
    const product=BY_NAME.get(norm(group.summary));
    return product?.category===category;
  });
  const el=$('#listItems');
  $('#listCount').textContent=rows.length+' article'+(rows.length>1?'s':'');
  if(state.loading&&!groups.length){el.innerHTML='<div class="empty"><span class="spinner"></span>Synchronisation…</div>';return}
  if(!rows.length){
    const message=needle?'Aucun article trouvé.':(category!=='Toutes'?'Aucun article dans cette catégorie.':(state.error?'Liste indisponible.':'La liste est vide.'));
    el.innerHTML='<div class="empty">'+message+'</div>';
    return;
  }
  el.innerHTML=rows.map(group=>{
    const key=norm(group.summary),product=BY_NAME.get(key),busy=state.productBusy.has(key);
    return '<div class="list-row '+(busy?'is-busy':'')+'" data-key="'+esc(key)+'">'+
      '<button class="remove" type="button" data-name="'+esc(group.summary)+'" aria-label="Supprimer '+esc(group.summary)+'" '+(busy?'disabled':'')+'>🗑</button>'+
      '<button class="list-main" type="button" data-name="'+esc(group.summary)+'" aria-label="Ajouter une unité de '+esc(group.summary)+'" '+(busy?'disabled':'')+'>'+
        '<span class="list-icon">'+(product?sprite(product,true):'<span class="unknown">•</span>')+'</span>'+
        '<span class="list-name">'+esc(group.summary)+'</span>'+
        '<span class="qty">x'+group.count+'</span>'+
      '</button>'+
    '</div>';
  }).join('');
  el.querySelectorAll('.remove').forEach(button=>button.onclick=event=>{event.stopPropagation();removeGroup(button.dataset.name||'',button.closest('.list-row'))});
  el.querySelectorAll('.list-main').forEach(button=>button.onclick=()=>incrementGroup(button.dataset.name||''));
}
function renderView(){
  $('#catalogView').classList.toggle('is-active',state.view==='catalog');
  $('#listView').classList.toggle('is-active',state.view==='list');
  document.querySelectorAll('.tab').forEach(button=>button.classList.toggle('is-active',button.dataset.view===state.view));
  renderCategories();renderProducts();renderList();
}


function vaultRecord(){return loadJson(STORAGE.vault,null)}
function legacyAuthRecord(){return loadJson(STORAGE.auth,null)}
function bytesToBase64(bytes){
  let binary='';
  const array=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  for(let i=0;i<array.length;i++)binary+=String.fromCharCode(array[i]);
  return btoa(binary);
}
function base64ToBytes(value){
  const binary=atob(String(value||''));
  const out=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
  return out;
}

function bytesToBase64Url(bytes){
  return bytesToBase64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64UrlToBytes(value){
  const raw=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  return base64ToBytes(raw+'='.repeat((4-raw.length%4)%4));
}
function biometricRecord(){return loadJson(STORAGE.biometric,null)}
function biometricAad(credentialId){return UTF8.encode('courses-faceid-v1|'+CLIENT_ID+'|'+credentialId)}
async function importBiometricKey(secret){
  const raw=secret instanceof Uint8Array?secret:new Uint8Array(secret);
  return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
}
async function encryptBiometricPayload(payload,secret,credentialId){
  const key=await importBiometricKey(secret);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const cipher=await crypto.subtle.encrypt(
    {name:'AES-GCM',iv,additionalData:biometricAad(credentialId)},
    key,
    UTF8.encode(JSON.stringify(payload))
  );
  return {iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(cipher))};
}
async function decryptBiometricPayload(record,secret){
  const key=await importBiometricKey(secret);
  const plain=await crypto.subtle.decrypt(
    {name:'AES-GCM',iv:base64ToBytes(record.iv),additionalData:biometricAad(record.credential_id)},
    key,
    base64ToBytes(record.ciphertext)
  );
  const payload=JSON.parse(UTF8_DECODER.decode(plain));
  if(!payload?.refresh_token||!normalizeHaUrl(payload?.ha_url))throw new Error('Coffre Face ID invalide');
  return payload;
}
function randomBytes(length=32){return crypto.getRandomValues(new Uint8Array(length))}
async function supportsFaceIdUnlock(){
  if(!window.PublicKeyCredential||!navigator.credentials?.create||!navigator.credentials?.get)return false;
  try{
    if(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable){
      const available=await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if(!available)return false;
    }
    if(PublicKeyCredential.getClientCapabilities){
      const capabilities=await PublicKeyCredential.getClientCapabilities();
      if(Object.prototype.hasOwnProperty.call(capabilities,'extension:prf')&&!capabilities['extension:prf'])return false;
    }
    return true;
  }catch(_){return false}
}
async function getBiometricPrfSecret(credentialId,prfSalt){
  const assertion=await navigator.credentials.get({
    publicKey:{
      challenge:randomBytes(32),
      rpId:location.hostname,
      allowCredentials:[{type:'public-key',id:credentialId}],
      userVerification:'required',
      timeout:60000,
      extensions:{prf:{eval:{first:prfSalt}}}
    }
  });
  if(!assertion)throw new Error('Vérification biométrique annulée');
  const result=assertion.getClientExtensionResults?.()?.prf?.results?.first;
  if(!result)throw new Error('La clé Face ID n’est pas disponible sur cet appareil');
  return new Uint8Array(result);
}
async function enrollFaceId(){
  if(state.locked||!state.refreshToken||!state.haUrl){toast('Déverrouille d’abord l’application');return}
  const button=$('#faceIdSetupBtn');
  button.disabled=true;
  $('#faceIdSettingsStatus').textContent='Ouverture de Face ID…';
  try{
    if(!(await supportsFaceIdUnlock()))throw new Error('Face ID/WebAuthn PRF n’est pas disponible dans ce navigateur');
    const prfSalt=randomBytes(32);
    const credential=await navigator.credentials.create({
      publicKey:{
        challenge:randomBytes(32),
        rp:{name:'Mes courses',id:location.hostname},
        user:{id:randomBytes(32),name:'courses-local',displayName:'Mes courses'},
        pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
        authenticatorSelection:{
          authenticatorAttachment:'platform',
          residentKey:'preferred',
          userVerification:'required'
        },
        timeout:60000,
        attestation:'none',
        extensions:{prf:{eval:{first:prfSalt}}}
      }
    });
    if(!credential)throw new Error('Création Face ID annulée');
    const ext=credential.getClientExtensionResults?.()?.prf;
    if(ext&&ext.enabled===false)throw new Error('Cet authentificateur ne prend pas en charge la clé PRF');
    const credentialId=bytesToBase64Url(new Uint8Array(credential.rawId));
    let secret=ext?.results?.first?new Uint8Array(ext.results.first):null;
    if(!secret)secret=await getBiometricPrfSecret(new Uint8Array(credential.rawId),prfSalt);
    const encrypted=await encryptBiometricPayload({
      refresh_token:state.refreshToken,
      ha_url:state.haUrl,
      created_at:Date.now()
    },secret,credentialId);
    saveJson(STORAGE.biometric,{
      version:1,
      credential_id:credentialId,
      prf_salt:bytesToBase64(prfSalt),
      iv:encrypted.iv,
      ciphertext:encrypted.ciphertext,
      created_at:Date.now()
    });
    updateFaceIdSettings();
    toast('Face ID activé');
  }catch(error){
    $('#faceIdSettingsStatus').textContent=error?.name==='NotAllowedError'
      ?'Activation annulée.'
      :(error.message||'Face ID indisponible');
  }finally{button.disabled=false}
}
async function unlockWithFaceId(options={}){
  const automatic=!!options.automatic;
  const record=biometricRecord();
  const button=$('#faceIdUnlockBtn'),error=$('#securityError');
  if(state.facePromptActive)return;
  if(!record){
    if(!automatic)error.textContent='Face ID n’est pas configuré sur cet appareil.';
    return;
  }
  state.facePromptActive=true;
  button.disabled=true;
  if(!automatic)error.textContent='';
  try{
    const secret=await getBiometricPrfSecret(
      base64UrlToBytes(record.credential_id),
      base64ToBytes(record.prf_salt)
    );
    const payload=await decryptBiometricPayload(record,secret);
    state.haUrl=normalizeHaUrl(payload.ha_url);
    state.refreshToken=String(payload.refresh_token||'');
    state.locked=false;
    hideSecurity();
    await connectFromRefresh();
  }catch(err){
    if(!automatic){
      error.textContent=err?.name==='NotAllowedError'
        ?'Face ID annulé.'
        :'Face ID impossible. Utilise le mot de passe local.';
    }else if(err?.name!=='NotAllowedError'){
      error.textContent='Face ID indisponible. Tu peux utiliser le mot de passe.';
    }
  }finally{
    state.facePromptActive=false;
    button.disabled=false;
  }
}
function showPasswordFallback(){
  $('#passwordPanel').hidden=false;
  $('#passwordLoginBtn').hidden=true;
  $('#securityError').textContent='';
  setTimeout(()=>$('#securityPassword').focus(),60);
}
function scheduleAutomaticFaceId(){
  if(state.faceAutoAttempted||state.facePromptActive||state.securityMode!=='unlock')return;
  if(!biometricRecord()||!window.PublicKeyCredential||document.visibilityState!=='visible')return;
  state.faceAutoAttempted=true;
  setTimeout(()=>{
    if(state.securityMode==='unlock'&&$('#securityOverlay').classList.contains('is-visible')&&document.visibilityState==='visible'){
      unlockWithFaceId({automatic:true});
    }
  },260);
}
function removeFaceId(){
  deleteKey(STORAGE.biometric);
  updateFaceIdSettings();
  toast('Face ID désactivé pour cette app');
}
async function updateFaceIdSettings(){
  const record=biometricRecord();
  const statusEl=$('#faceIdSettingsStatus'),setupBtn=$('#faceIdSetupBtn'),removeBtn=$('#faceIdRemoveBtn');
  if(record){
    statusEl.textContent='Activé sur cet appareil. Le mot de passe local reste disponible en secours.';
    setupBtn.hidden=true;removeBtn.hidden=false;return;
  }
  removeBtn.hidden=true;setupBtn.hidden=false;setupBtn.disabled=false;
  statusEl.textContent=(await supportsFaceIdUnlock())
    ?'Disponible. Face ID peut déverrouiller le coffre local.'
    :'Non disponible dans ce navigateur ou sur cet appareil.';
}
async function deriveVaultKey(password,salt,iterations=SECURITY.iterations){
  const material=await crypto.subtle.importKey('raw',UTF8.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'PBKDF2',hash:'SHA-256',salt,iterations},
    material,
    {name:'AES-GCM',length:256},
    false,
    ['encrypt','decrypt']
  );
}
function vaultAad(){return UTF8.encode('courses-secure-vault-v1|'+CLIENT_ID)}
async function encryptVault(payload,password){
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await deriveVaultKey(password,salt,SECURITY.iterations);
  const plain=UTF8.encode(JSON.stringify(payload));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:vaultAad()},key,plain);
  return {
    version:SECURITY.version,
    kdf:SECURITY.kdf,
    iterations:SECURITY.iterations,
    salt:bytesToBase64(salt),
    iv:bytesToBase64(iv),
    ciphertext:bytesToBase64(new Uint8Array(cipher))
  };
}
async function decryptVault(record,password){
  if(!record||Number(record.version)!==SECURITY.version)throw new Error('Coffre de sécurité incompatible');
  const salt=base64ToBytes(record.salt),iv=base64ToBytes(record.iv),cipher=base64ToBytes(record.ciphertext);
  const key=await deriveVaultKey(password,salt,Number(record.iterations)||SECURITY.iterations);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:vaultAad()},key,cipher);
  const payload=JSON.parse(UTF8_DECODER.decode(plain));
  if(!payload?.refresh_token||!normalizeHaUrl(payload?.ha_url))throw new Error('Coffre invalide');
  return payload;
}
async function storeSecureVault(refreshToken,haUrl,password){
  const secure=await encryptVault({
    refresh_token:String(refreshToken||''),
    ha_url:normalizeHaUrl(haUrl),
    created_at:Date.now()
  },password);
  saveJson(STORAGE.vault,secure);
  // Remove every previous plaintext credential after a successful encrypted write.
  deleteKey(STORAGE.auth);
  deleteKey(STORAGE.haUrl);
}
function loadOAuthState(){
  let current=null;
  try{current=JSON.parse(sessionStorage.getItem(OAUTH_STATE_KEY)||'null')}catch(_){}
  if(!current)current=loadJson(OAUTH_TEMP_KEY,null);
  if(!current)current=loadJson(LEGACY_OAUTH_STATE_KEY,null);
  if(current?.createdAt&&Date.now()-Number(current.createdAt)>20*60*1000){
    clearOAuthState();return null;
  }
  return current;
}
function clearOAuthState(){
  try{sessionStorage.removeItem(OAUTH_STATE_KEY)}catch(_){}
  deleteKey(OAUTH_TEMP_KEY);
  deleteKey(LEGACY_OAUTH_STATE_KEY);
}
function wipeMemoryCredentials(){
  state.accessToken='';
  state.accessTokenExpiresAt=0;
  state.refreshToken='';
}
function closeSocket(){
  state.intentionalClose=true;
  try{state.ws?.close()}catch(_){}
  state.ws=null;
  state.pending.forEach(p=>{clearTimeout(p.timer);p.reject(new Error('Connexion fermée'))});
  state.pending.clear();
}
function clearLockTimers(){
  clearTimeout(state.lockTimer);state.lockTimer=null;
  clearTimeout(state.backgroundLockTimer);state.backgroundLockTimer=null;
}
function armIdleLock(){
  clearTimeout(state.lockTimer);
  if(state.demo||state.locked||!vaultRecord())return;
  state.lockTimer=setTimeout(()=>lockApp('Verrouillage automatique après inactivité.'),SECURITY.idleLockMs);
}
function showSecurity(mode,message='',options={}){
  const overlay=$('#securityOverlay');
  const wasVisible=overlay.classList.contains('is-visible');
  state.securityMode=mode;
  if(!wasVisible&&mode==='unlock')state.faceAutoAttempted=false;
  $('#setup').classList.remove('is-visible');
  overlay.classList.add('is-visible');
  const creating=mode==='oauth'||mode==='migrate';
  const faceReady=mode==='unlock'&&!!biometricRecord()&&!!window.PublicKeyCredential;
  $('.security-modal').classList.toggle('is-quick-unlock',faceReady&&!creating);
  $('#securityIcon').textContent=creating?'🔐':(faceReady?'🔒':'🔐');
  $('#securityTitle').textContent=creating
    ?(mode==='migrate'?'Sécuriser la connexion existante':'Créer le verrou de l’application')
    :'Mes courses';
  $('#securityText').textContent=message||(creating
    ?'Choisis un mot de passe local. Il chiffrera l’autorisation Home Assistant enregistrée sur cet appareil.'
    :(faceReady?'Déverrouillage sécurisé':'Entre ton mot de passe local.'));
  $('#faceIdUnlockBtn').hidden=!faceReady;
  $('#passwordLoginBtn').hidden=!faceReady||creating;
  $('#passwordPanel').hidden=faceReady&&!creating;
  $('#securityConfirmWrap').hidden=!creating;
  $('#securityHint').hidden=!creating;
  $('#securityPassword').autocomplete=creating?'new-password':'current-password';
  $('#securityPassword').value='';
  $('#securityConfirm').value='';
  $('#securitySubmit').textContent=creating?'Chiffrer et continuer':'Connexion';
  $('#resetSecurityBtn').hidden=creating;
  $('#securityError').textContent='';
  refreshVisualLock();
  if(faceReady&&!creating&&options.autoFaceId!==false)scheduleAutomaticFaceId();
  else if(!faceReady||creating)setTimeout(()=>$('#securityPassword').focus(),80);
}
function hideSecurity(){
  $('#securityOverlay').classList.remove('is-visible');
  $('#securityPassword').value='';
  $('#securityConfirm').value='';
  $('#securityError').textContent='';
  state.facePromptActive=false;
  refreshVisualLock();
}
function lockApp(message='Application verrouillée.'){
  if(state.demo||!vaultRecord())return;
  if($('#settingsDialog').open)$('#settingsDialog').close();
  clearLockTimers();
  closeSocket();
  wipeMemoryCredentials();
  state.locked=true;
  state.items=[];
  renderProducts();renderList();
  status('is-waiting','Verrouillé','Mot de passe local requis');
  showSecurity('unlock',message);
}
async function resetLocalConnection(){
  clearLockTimers();closeSocket();wipeMemoryCredentials();
  deleteKey(STORAGE.vault);deleteKey(STORAGE.biometric);deleteKey(STORAGE.auth);deleteKey(STORAGE.haUrl);deleteKey(STORAGE.entity);
  clearOAuthState();
  state.haUrl='';state.entity='';state.entities=[];state.items=[];state.locked=true;state.demo=false;
  hideSecurity();showSetup('Connexion locale supprimée. Tu peux reconnecter Home Assistant.');
}
async function exchangeCodeRaw(code){
  const authState=loadOAuthState();
  const returnedState=new URLSearchParams(location.search).get('state')||'';
  if(!authState||authState.nonce!==returnedState)throw new Error('Validation OAuth impossible');
  const haUrl=normalizeHaUrl(authState.haUrl);
  if(!haUrl)throw new Error('Adresse Home Assistant manquante');
  state.haUrl=haUrl;
  const body=new URLSearchParams({grant_type:'authorization_code',code,client_id:CLIENT_ID});
  const response=await fetch(haUrl+'/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Home Assistant a refusé la connexion');
  return response.json();
}
async function refreshAccessToken(){
  if(!state.refreshToken||!state.haUrl)throw new Error('Application verrouillée');
  const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:state.refreshToken,client_id:CLIENT_ID});
  const response=await fetch(state.haUrl+'/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error('Session Home Assistant expirée ou révoquée');
  const data=await response.json();
  state.accessToken=String(data.access_token||'');
  state.accessTokenExpiresAt=Date.now()+Number(data.expires_in||1800)*1000;
  if(!state.accessToken)throw new Error('Jeton Home Assistant absent');
  return state.accessToken;
}
async function connectAuthorized(token){
  state.accessToken=token;
  state.locked=false;
  hideSetup();hideSecurity();
  status('is-waiting','Connexion…','Home Assistant');
  await connectWs(token);
  const entity=await discoverEntities();
  if(!entity){
    state.loading=false;renderList();status('is-waiting','Choisir une liste','Réglages');openSettings();armIdleLock();return;
  }
  await subscribe();await refreshItems();armIdleLock();
}
async function connectFromRefresh(){
  try{
    const token=await refreshAccessToken();
    await connectAuthorized(token);
  }catch(error){
    wipeMemoryCredentials();state.locked=true;
    status('is-error','Connexion refusée',error.message||'Session invalide');
    showSecurity('unlock','La connexion Home Assistant n’a pas pu être renouvelée. Utilise le mot de passe ou réinitialise la connexion.',{autoFaceId:false});
  }
}
async function completeSecurityAction(){
  const password=$('#securityPassword').value;
  const confirm=$('#securityConfirm').value;
  const error=$('#securityError'),button=$('#securitySubmit');
  error.textContent='';
  if(!password){error.textContent='Entre le mot de passe local.';return}
  if(state.securityMode==='oauth'||state.securityMode==='migrate'){
    if(password.length<SECURITY.minPasswordLength){error.textContent='Choisis au moins '+SECURITY.minPasswordLength+' caractères.';return}
    if(password!==confirm){error.textContent='Les deux mots de passe ne correspondent pas.';return}
  }
  button.disabled=true;
  try{
    if(state.securityMode==='unlock'){
      const payload=await decryptVault(vaultRecord(),password);
      state.haUrl=normalizeHaUrl(payload.ha_url);
      state.refreshToken=String(payload.refresh_token||'');
      state.locked=false;
      hideSecurity();
      await connectFromRefresh();
      return;
    }
    if(state.securityMode==='migrate'){
      const legacy=legacyAuthRecord();
      const haUrl=normalizeHaUrl(legacy?.ha_url||localStorage.getItem(STORAGE.haUrl)||state.haUrl);
      if(!legacy?.refresh_token||!haUrl)throw new Error('Ancienne connexion introuvable');
      await storeSecureVault(legacy.refresh_token,haUrl,password);
      state.haUrl=haUrl;state.refreshToken=String(legacy.refresh_token);state.locked=false;
      hideSecurity();
      await connectFromRefresh();
      return;
    }
    if(state.securityMode==='oauth'){
      const code=state.pendingOAuthCode||new URLSearchParams(location.search).get('code')||'';
      if(!code)throw new Error('Code OAuth manquant');
      const data=await exchangeCodeRaw(code);
      if(!data?.refresh_token||!data?.access_token)throw new Error('Réponse OAuth incomplète');
      await storeSecureVault(data.refresh_token,state.haUrl,password);
      state.refreshToken=String(data.refresh_token);
      state.accessToken=String(data.access_token);
      state.accessTokenExpiresAt=Date.now()+Number(data.expires_in||1800)*1000;
      state.locked=false;
      clearOAuthState();state.pendingOAuthCode='';
      history.replaceState({},'',REDIRECT_URI);
      hideSecurity();
      await connectAuthorized(state.accessToken);
      return;
    }
  }catch(err){
    error.textContent=state.securityMode==='unlock'
      ?'Mot de passe incorrect ou coffre illisible.'
      :(err.message||'Sécurisation impossible');
  }finally{button.disabled=false}
}
function beginOAuth(){
  state.demo=false;
  const value=normalizeHaUrl($('#haUrlInput').value);
  if(!value){$('#setupError').textContent='Entre une adresse HTTPS Home Assistant valide.';return}
  state.haUrl=value;
  // Do not persist the HA URL in plaintext. It survives the OAuth round-trip only in this tab.
  deleteKey(STORAGE.haUrl);
  const nonce=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));
  const oauthState={nonce,haUrl:value,createdAt:Date.now()};
  try{
    sessionStorage.setItem(OAUTH_STATE_KEY,JSON.stringify(oauthState));
    // Temporary fallback for iOS/PWA OAuth navigation. Contains no credential and is deleted after the callback.
    saveJson(OAUTH_TEMP_KEY,oauthState);
  }catch(_){
    $('#setupError').textContent='Le stockage temporaire du navigateur est indisponible.';return;
  }
  const authorize=value+'/auth/authorize?client_id='+encodeURIComponent(CLIENT_ID)+'&redirect_uri='+encodeURIComponent(REDIRECT_URI)+'&state='+encodeURIComponent(nonce);
  location.assign(authorize);
}
async function revoke(){
  state.demo=false;
  if(state.refreshToken&&state.haUrl){
    try{await fetch(state.haUrl+'/auth/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:state.refreshToken})})}catch(_){}
  }
  clearLockTimers();closeSocket();wipeMemoryCredentials();
  deleteKey(STORAGE.vault);deleteKey(STORAGE.biometric);deleteKey(STORAGE.auth);deleteKey(STORAGE.haUrl);deleteKey(STORAGE.entity);
  clearOAuthState();
  state.entity='';state.entities=[];state.items=[];state.haUrl='';state.locked=true;
  $('#settingsDialog').close();
  showSetup('Autorisation locale supprimée et session Home Assistant révoquée.');
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
      if(authed&&!state.intentionalClose&&!state.locked&&state.refreshToken){status('is-waiting','Reconnexion…','Home Assistant');clearTimeout(state.reconnectTimer);state.reconnectTimer=setTimeout(connectFromRefresh,2500)}
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
    const incoming=Array.isArray(result?.items)?result.items:[];
    state.items=incoming.filter(item=>{
      const summary=String(item?.summary??item?.name??item?.item??'').trim();
      return !state.pendingRemoval.has(norm(summary));
    });
    state.loading=false;state.error='';renderProducts();renderList();
    status('', 'Synchronisé',state.entities.find(e=>e.id===state.entity)?.name||state.entity);
  }catch(error){state.loading=false;state.error=error.message||'Synchronisation indisponible';renderList();status('is-error','Hors synchro',state.error)}
}
async function toggleProduct(name){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  if(state.productBusy.has(key))return;
  const group=activeGroups().find(g=>norm(g.summary)===key);
  if(group){
    await removeGroup(item);
    return;
  }
  state.productBusy.add(key);
  try{
    await addItem(item);
  }finally{
    state.productBusy.delete(key);
    renderProducts();renderList();
  }
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
async function incrementGroup(name){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  if(state.productBusy.has(key))return;
  const current=activeGroups().find(group=>norm(group.summary)===key);
  if(!current)return;
  state.productBusy.add(key);
  try{
    if(state.demo){
      const items=loadJson(DEMO_KEY,[])||[];
      items.push({uid:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2),summary:item,status:'needs_action'});
      saveJson(DEMO_KEY,items);
      state.items=items;
      recordUsage(item);
      navigator.vibrate?.(7);
      toast(item+' x'+(current.count+1));
      renderProducts();renderList();
      return;
    }
    if(!state.entity)return;
    const optimistic={uid:'',summary:item,status:'needs_action',_optimistic:true};
    state.items=[...state.items,optimistic];
    navigator.vibrate?.(7);
    renderList();
    try{
      await request({type:'call_service',domain:'todo',service:'add_item',service_data:{item},target:{entity_id:state.entity}});
      recordUsage(item);
      toast(item+' x'+(current.count+1));
      await refreshItems();
    }catch(error){
      state.items=state.items.filter(entry=>entry!==optimistic);
      renderList();
      toast('Ajout impossible');
      status('is-error','Erreur',error.message||'Ajout impossible');
    }
  }finally{
    state.productBusy.delete(key);
    renderProducts();renderList();
  }
}
async function removeGroup(name,row=null){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  if(state.productBusy.has(key))return;
  const group=activeGroups().find(entry=>norm(entry.summary)===key);
  if(!group)return;
  state.productBusy.add(key);
  state.pendingRemoval.add(key);
  row?.classList.add('is-removing');
  navigator.vibrate?.(8);
  await new Promise(resolve=>setTimeout(resolve,row?90:0));

  const keepOtherItems=entry=>{
    if(String(entry?.status||'needs_action')==='completed')return true;
    const summary=String(entry?.summary??entry?.name??entry?.item??'').trim();
    return norm(summary)!==key;
  };
  state.items=state.items.filter(keepOtherItems);
  renderProducts();renderList();

  try{
    if(state.demo){
      const items=(loadJson(DEMO_KEY,[])||[]).filter(keepOtherItems);
      saveJson(DEMO_KEY,items);
      state.items=items;
      toast(item+' supprimé');
      return;
    }
    if(!state.entity)throw new Error('Liste Home Assistant indisponible');
    const uids=group.uids.filter(Boolean);
    if(!uids.length)throw new Error('Identifiant de l’article indisponible');
    await Promise.all(uids.map(uid=>request({
      type:'call_service',
      domain:'todo',
      service:'update_item',
      service_data:{item:uid,status:'completed'},
      target:{entity_id:state.entity}
    })));
    toast(item+' supprimé');
  }catch(error){
    toast('Suppression impossible');
    status('is-error','Erreur',error.message||'Suppression impossible');
  }finally{
    state.pendingRemoval.delete(key);
    state.productBusy.delete(key);
    if(!state.demo)await refreshItems();
    else {renderProducts();renderList()}
  }
}
function openSettings(){
  if(state.demo){showSetup('Mode test actif. Connecte Home Assistant pour synchroniser la vraie liste.');return}
  $('#settingsHaUrl').value=state.haUrl;
  $('#entitySelect').innerHTML=state.entities.map(e=>'<option value="'+esc(e.id)+'" '+(e.id===state.entity?'selected':'')+'>'+esc(e.name)+' — '+esc(e.id)+'</option>').join('');
  updateFaceIdSettings();
  $('#settingsDialog').showModal();
}
async function saveSettings(){
  const nextUrl=normalizeHaUrl($('#settingsHaUrl').value),nextEntity=$('#entitySelect').value;
  if(!nextUrl)return;
  const changedUrl=nextUrl!==state.haUrl;
  if(nextEntity){state.entity=nextEntity;localStorage.setItem(STORAGE.entity,nextEntity)}
  $('#settingsDialog').close();
  if(changedUrl){
    await revoke();
    state.haUrl=nextUrl;
    $('#haUrlInput').value=nextUrl;
    $('#setupError').textContent='Adresse modifiée : reconnecte Home Assistant.';
  }else{
    await refreshItems();armIdleLock();
  }
}
async function init(){
  renderView();
  if(!window.crypto?.subtle){
    state.loading=false;renderList();
    showSetup('Ce navigateur ne prend pas en charge le chiffrement Web Crypto requis.');
    status('is-error','Navigateur incompatible','Web Crypto indisponible');
    return;
  }
  const params=new URLSearchParams(location.search);
  const code=params.get('code');
  if(code){
    const oauth=loadOAuthState();
    const returnedState=params.get('state')||'';
    if(!oauth||oauth.nonce!==returnedState||!normalizeHaUrl(oauth.haUrl)){
      history.replaceState({},'',REDIRECT_URI);
      showSetup('Retour OAuth invalide ou expiré. Recommence la connexion.');
      return;
    }
    state.haUrl=normalizeHaUrl(oauth.haUrl);
    state.pendingOAuthCode=code;
    state.loading=false;renderList();
    showSecurity('oauth','Crée maintenant le mot de passe local qui protégera l’autorisation Home Assistant sur cet appareil.');
    status('is-waiting','Sécurisation requise','Créer le mot de passe local');
    return;
  }
  const legacy=legacyAuthRecord();
  if(legacy?.refresh_token){
    state.haUrl=normalizeHaUrl(legacy.ha_url||localStorage.getItem(STORAGE.haUrl)||'');
    state.loading=false;renderList();
    showSecurity('migrate','Une ancienne connexion non chiffrée a été détectée. Crée un mot de passe local pour la chiffrer immédiatement.');
    status('is-waiting','Migration sécurité','Chiffrement de la connexion');
    return;
  }
  if(vaultRecord()){
    state.loading=false;renderList();
    showSecurity('unlock');
    status('is-waiting','Verrouillé','Mot de passe local requis');
    return;
  }
  state.haUrl=normalizeHaUrl(localStorage.getItem(STORAGE.haUrl)||'');
  state.loading=false;renderView();showSetup();status('is-waiting','Configuration requise','Première connexion');
}

$('#connectBtn').onclick=beginOAuth;
$('#securitySubmit').onclick=completeSecurityAction;
$('#faceIdUnlockBtn').onclick=()=>unlockWithFaceId({automatic:false});
$('#passwordLoginBtn').onclick=showPasswordFallback;
$('#securityPassword').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();completeSecurityAction()}};
$('#securityConfirm').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();completeSecurityAction()}};
$('#resetSecurityBtn').onclick=resetLocalConnection;
$('#demoBtn').onclick=()=>{
  state.demo=true;state.locked=false;clearLockTimers();wipeMemoryCredentials();
  state.loading=false;state.error='';
  state.items=loadJson(DEMO_KEY,[])||[];
  hideSetup();hideSecurity();status('', 'Mode test', 'Stockage local sur ce téléphone');renderView();
};
$('#settingsBtn').onclick=openSettings;
$('#cancelSettings').onclick=()=>$('#settingsDialog').close();
$('#saveSettings').onclick=saveSettings;
$('#faceIdSetupBtn').onclick=enrollFaceId;
$('#faceIdRemoveBtn').onclick=removeFaceId;
$('#lockNowBtn').onclick=()=>{$('#settingsDialog').close();lockApp('Verrouillage manuel.')};
$('#logoutBtn').onclick=revoke;
$('#productSearch').oninput=e=>{state.productQuery=e.target.value||'';renderProducts()};
$('#listSearch').oninput=e=>{state.listQuery=e.target.value||'';renderList()};
$('#listFilterBtn').onclick=event=>{
  event.stopPropagation();
  const menu=$('#listFilterMenu'),open=menu.hidden;
  menu.hidden=!open;
  $('#listFilterBtn').setAttribute('aria-expanded',String(open));
};
document.addEventListener('click',event=>{
  if(!(event.target instanceof Element)||!event.target.closest('.list-filter'))closeListFilter();
});
document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>{state.view=button.dataset.view||'list';renderView()});
['pointerdown','touchstart','keydown'].forEach(name=>document.addEventListener(name,()=>{if(!state.locked&&!state.demo)armIdleLock()},{passive:true}));
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    clearTimeout(state.backgroundLockTimer);
    if(!state.locked&&!state.demo&&vaultRecord())state.backgroundLockTimer=setTimeout(()=>lockApp('Verrouillage après passage en arrière-plan.'),SECURITY.backgroundLockMs);
    return;
  }
  clearTimeout(state.backgroundLockTimer);state.backgroundLockTimer=null;
  if(state.demo)refreshItems();
  else if(!state.locked&&state.ws?.readyState===WebSocket.OPEN){refreshItems();armIdleLock()}
});
window.addEventListener('online',()=>{if(!state.locked&&!state.demo&&state.refreshToken&&state.ws?.readyState!==WebSocket.OPEN)connectFromRefresh()});
window.addEventListener('pagehide',()=>{
  clearLockTimers();closeSocket();wipeMemoryCredentials();
  if(vaultRecord()&&!state.demo)state.locked=true;
});
window.addEventListener('pageshow',event=>{
  if(event.persisted&&vaultRecord()&&!state.demo){
    state.locked=true;state.items=[];
    renderProducts();renderList();
    status('is-waiting','Verrouillé','Mot de passe local requis');
    showSecurity('unlock','Session restaurée : déverrouille l’application.');
  }
});

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderView();init();
})();