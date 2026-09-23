(() => {
'use strict';

const CATALOG = window.COURSES_CATALOG;
if (!CATALOG) throw new Error('Catalogue indisponible');

const GROUPS = CATALOG.groups;
const META = CATALOG.meta;
const FAVORITES = CATALOG.favorites;
const CATEGORY_META = {
  'Toutes': { label:'Tous' },
  'Fruits & Légumes': { label:'Fruits & légumes' },
  'Épicerie': { label:'Épicerie' },
  'Frais': { label:'Produits frais' },
  'Boissons': { label:'Boissons' },
  'Maison': { label:'Maison' },
  'Favoris': { label:'Favoris' }
};
const CATALOG_CATEGORY_ORDER=['Toutes','Fruits & Légumes','Épicerie','Frais','Boissons','Maison','Favoris'];
const PURCHASE_HOLD_MS=1100;
const PURCHASE_EXIT_MS=240;
const SWIPE_TRIGGER_RATIO=.36;
const SWIPE_MAX_RATIO=.42;

const STORAGE = {
  // Legacy keys are kept only for one-time migration from the previous version.
  haUrl:'courses-external-ha-url-v1',
  auth:'courses-external-auth-v1',
  vault:'courses-secure-vault-v1',
  entity:'courses-external-entity-v1',
  entityPreference:'courses-external-entity-preference-v1',
  usage:'courses-external-usage-v1',
  preferences:'courses-preferences-v1'
};
const DEMO_KEY = 'courses-external-demo-items-v2';
const OAUTH_STATE_KEY = 'courses-oauth-state-v2';
const OAUTH_TEMP_KEY = 'courses-oauth-temp-v2';
const LEGACY_OAUTH_STATE_KEY = 'courses-external-oauth-state';
const UNLOCK_GUARD_KEY = 'courses-unlock-guard-v1';
const LEGACY_UNLOCK_KEY = 'courses-faceid-v1';
const SECURITY = Object.freeze({
  version:1,
  kdf:'PBKDF2-SHA256',
  iterations:600000,
  minPasswordLength:10,
  idleLockMs:5*60*1000,
  backgroundLockMs:30*1000,
  unlockDelayBaseMs:2000,
  unlockDelayMaxMs:30000
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
function secureRandomToken(length=32){
  const bytes=crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
}
function loadUnlockGuard(){
  try{return JSON.parse(sessionStorage.getItem(UNLOCK_GUARD_KEY)||'null')||{failures:0,blockedUntil:0}}catch(_){return {failures:0,blockedUntil:0}}
}
function saveUnlockGuard(value){
  try{sessionStorage.setItem(UNLOCK_GUARD_KEY,JSON.stringify(value))}catch(_){}
}
function unlockRetryMs(){
  const guard=loadUnlockGuard();
  return Math.max(0,Number(guard.blockedUntil||0)-Date.now());
}
function registerUnlockFailure(){
  const guard=loadUnlockGuard();
  const failures=Math.max(0,Number(guard.failures||0))+1;
  const delay=failures<3?0:Math.min(SECURITY.unlockDelayMaxMs,SECURITY.unlockDelayBaseMs*(2**(failures-3)));
  saveUnlockGuard({failures,blockedUntil:delay?Date.now()+delay:0});
  return delay;
}
function clearUnlockGuard(){
  try{sessionStorage.removeItem(UNLOCK_GUARD_KEY)}catch(_){}
}

const DEFAULT_PREFERENCES=Object.freeze({
  listSort:'added',
  startView:'list',
  hideAdded:false,
  smartFavorites:true
});
function readPreferences(){
  const saved=loadJson(STORAGE.preferences,{})||{};
  const listSort=['added','category','alpha'].includes(saved.listSort)?saved.listSort:DEFAULT_PREFERENCES.listSort;
  const startView=['list','catalog'].includes(saved.startView)?saved.startView:DEFAULT_PREFERENCES.startView;
  return {
    listSort,
    startView,
    hideAdded:saved.hideAdded===true,
    smartFavorites:saved.smartFavorites!==false
  };
}
function persistPreferences(){saveJson(STORAGE.preferences,state.preferences)}
const INITIAL_PREFERENCES=readPreferences();

const COURSES_ENTITY='todo.courses';
const URL_ENTITY='todo.url';
function preferredTodoEntity(entities){
  const list=Array.isArray(entities)?entities:[];
  const explicit=String(localStorage.getItem(STORAGE.entityPreference)||'').trim();
  const legacy=String(localStorage.getItem(STORAGE.entity)||'').trim();
  const saved=explicit||legacy;
  return list.find(entry=>entry?.id===URL_ENTITY)
    || list.find(entry=>entry?.id===saved)
    || list.find(entry=>entry?.id===COURSES_ENTITY)
    || list[0]
    || null;
}

const ALL=[];
Object.entries(GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names])=>names.forEach(name=>ALL.push({name,category,sub}))));
const BY_NAME=new Map(ALL.map(p=>[norm(p.name),p]));
const POSITIONS=new Map();
Object.entries(GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names],row)=>names.forEach((name,col)=>POSITIONS.set(norm(name),{category,sub,row,col}))));

const PRODUCT_SHEETS=Object.freeze({
  'Frais':{src:'./bring-photo-v4-frais.webp.png?v=14',cols:12,rows:8,ratio:1},
  'Fruits & Légumes':{src:'./bring-photo-v4-fruits-legumes.webp.png?v=14',cols:12,rows:6,ratio:1},
  'Épicerie':{src:'./bring-photo-v4-epicerie.webp.png?v=14',cols:12,rows:8,ratio:1},
  'Boissons':{src:'./bring-photo-v4-boissons.webp.png?v=14',cols:12,rows:4,ratio:1},
  'Maison':{src:'./bring-photo-v4-maison.webp.png?v=14',cols:12,rows:7,ratio:.875}
});

let state={
  haUrl:'',
  accessToken:'',
  accessTokenExpiresAt:0,
  refreshToken:'',
  locked:true,
  securityMode:'',
  pendingOAuthCode:'',
  pendingOAuthState:'',
  ws:null,
  seq:1,
  pending:new Map(),
  entities:[],
  entity:localStorage.getItem(STORAGE.entity)||'',
  items:[],
  loading:true,
  error:'',
  category:'Toutes',
  productQuery:'',
  listQuery:'',
  view:INITIAL_PREFERENCES.startView,
  reconnectTimer:null,
  intentionalClose:false,
  demo:false,
  lockTimer:null,
  backgroundLockTimer:null,
  resumeToList:false,
  productBusy:new Set(),
  pendingRemoval:new Set(),
  purchaseUndo:new Map(),
  usage:loadJson(STORAGE.usage,{})||{},
  preferences:INITIAL_PREFERENCES
};

const hashName = (value) => {
  let hash = 2166136261;
  for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
};
const shortLabel = (value, max = 11) => {
  const words = String(value || '').split(/\s+/).filter(Boolean);
  if (!words.length) return 'PRODUIT';
  if (words.length === 1) return words[0].slice(0, max).toUpperCase();
  const joined = words.slice(0, 2).join(' ');
  return joined.length <= max ? joined.toUpperCase() : `${words[0].slice(0, Math.max(4, max - 3))} ${words[1].slice(0, 2)}`.toUpperCase();
};

function premiumVisualSpec(product) {
    const key = norm(product?.name), sub = norm(product?.sub), category = product?.category || '';
    const hash = hashName(`${product?.name}|${product?.sub}`);
    const hue = hash % 360, hue2 = (hue + 38 + (hash % 53)) % 360;
    let kind = 'box', base = `hsl(${hue} 68% 52%)`, accent = `hsl(${hue2} 76% 60%)`, detail = '#eef7ff';

    const fruitColors = {
      pommes:'#e83e3e', bananes:'#f4cf2e', poires:'#9bc84a', oranges:'#ef8a20', clementines:'#f28720', citrons:'#e9d62c',
      peches:'#ef765b', nectarines:'#dc5355', abricots:'#f39a42', prunes:'#72458e', raisin:'#6a49a2', kiwis:'#8b6b3f', fraises:'#e63d4d',
      framboises:'#d92e61', myrtilles:'#4059a8', mures:'#38264e', cerises:'#b62036', ananas:'#d8aa2d', mangue:'#f0a735', avocat:'#6da044',
      'noix de coco':'#8f673e', grenade:'#b5263f', 'fruit de la passion':'#8c4b96', melon:'#9bcf62', tomates:'#e64a3c', carottes:'#ef7d22',
      courgettes:'#5b9c4b', aubergines:'#6b3c78', poivrons:'#e44839', concombres:'#4f9c59', brocoli:'#4d8d46', 'chou fleur':'#e5e1c7',
      champignons:'#c39f7a', betteraves:'#9b2848', navets:'#d8c5dc', courge:'#db8a25', potiron:'#d86c1b', butternut:'#d39b58', mais:'#e0bd31',
      radis:'#e44d66', 'salade verte':'#62a94e', mache:'#5c9b48', roquette:'#598d42', endives:'#dde0aa', 'chou rouge':'#78468a',
      'pommes de terre':'#b5915c', 'patates douces':'#c66e3f', 'oignons jaunes':'#d7a946', 'oignons rouges':'#934a79', echalotes:'#a66377', ail:'#e1ddd0',
      gingembre:'#c69254', piments:'#d92d32', 'citron vert':'#85b845', 'olives fraiches':'#69782d', noix:'#9f764c', noisettes:'#9d6b40'
    };
    if (category === 'Fruits & Légumes') {
      kind = /banane/.test(key) ? 'banana' : /carotte|asperge|poireau|ciboulette|romarin|thym/.test(key) ? 'longveg' : /raisin|myrtille|framboise|mure|cerise|olive|noix|noisette/.test(key) ? 'cluster' : 'produce';
      base = fruitColors[key] || base;
      accent = `hsl(${(hue + 85) % 360} 52% 45%)`;
    } else if (/lait/.test(key)) kind = /amande|avoine/.test(key) ? 'carton' : 'bottle';
    else if (/yaourt|skyr|fromage blanc|petits suisses|creme dessert|riz au lait|flan|mascarpone/.test(key)) kind = 'cup';
    else if (/beurre/.test(key)) kind = 'butter';
    else if (/fromage|emmental|comte|camembert|brie|chevre|mozzarella|parmesan|roquefort|raclette|reblochon/.test(key)) kind = 'cheese';
    else if (/baguette/.test(key)) kind = 'baguette';
    else if (/pain|brioche/.test(key)) kind = 'bread';
    else if (/croissant|pains au chocolat/.test(key)) kind = 'pastry';
    else if (/wrap|galette/.test(key)) kind = 'wrap';
    else if (/steak|boeuf|porc|veau|agneau|viande|escalope/.test(key)) kind = 'meat';
    else if (/poulet|dinde/.test(key)) kind = 'poultry';
    else if (/saucisse|merguez|saucisson|chorizo|rosette|coppa|bacon|jambon|lardon|mortadelle/.test(key)) kind = 'slices';
    else if (/saumon|cabillaud|thon frais|truite|poisson/.test(key)) kind = 'fish';
    else if (/crevette/.test(key)) kind = 'shrimp';
    else if (/moule/.test(key)) kind = 'shell';
    else if (/pizza|quiche/.test(key)) kind = 'roundfood';
    else if (/glace|sorbet/.test(key)) kind = 'icecream';
    else if (/eau |^eau|jus|limonade|orangeade|soda|tonic|ginger beer|the glace|sirop|boisson energetique|smoothie|lait chocolate/.test(key)) kind = /jus|lait chocolate|smoothie/.test(key) ? 'carton' : 'drink';
    else if (/biere/.test(key)) kind = 'can';
    else if (/vin|champagne|prosecco|cidre|rhum|whisky|aperitif anise/.test(key)) kind = 'wine';
    else if (/conserve|boite|thon en|sardine|maquereaux|tomates pelees|mais en boite|raviolis/.test(`${sub} ${key}`)) kind = 'can';
    else if (/ketchup|mayonnaise|moutarde|sauce|huile|vinaigre|tabasco|pesto|harissa/.test(key)) kind = 'condiment';
    else if (/cafe|the |infusion|chicoree|matcha|chocolat chaud/.test(key)) kind = /capsule|dosette/.test(key) ? 'pods' : 'coffee';
    else if (/riz|spaghetti|penne|coquillette|tagliatelle|lasagne|semoule|quinoa|boulgour|polenta|nouille|couscous/.test(key)) kind = 'pouch';
    else if (/farine|sucre|maizena|chapelure|flocons|cereales|muesli/.test(key)) kind = 'bag';
    else if (/chips|tortilla|cacahuete|cajou|pistache|cracker|bretzel/.test(key)) kind = 'snack';
    else if (/biscuit|cookie|madeleine|brownie|gaufre|crepe|barres cereal|chocolat/.test(key)) kind = 'treat';
    else if (/papier toilette|essuie tout|mouchoir|serviette papier/.test(key)) kind = 'rolls';
    else if (/sac poubelle|sacs congelation|sacs zip|film alimentaire|papier aluminium|papier cuisson/.test(key)) kind = 'pack';
    else if (/lessive|adoucissant|detergent|liquide vaisselle|nettoyant|javel|desinfectant|vinaigre menager|detartrant|shampoing|gel douche|savon|creme|demaquillant|antiseptique|eau micellaire/.test(key)) kind = /vitres|multi usages|desinfectant/.test(key) ? 'spray' : 'cleaner';
    else if (/dentifrice/.test(key)) kind = 'tube';
    else if (/brosse/.test(key)) kind = 'brush';
    else if (/eponge|grattoir/.test(key)) kind = 'sponge';
    else if (/couche/.test(key)) kind = 'diaper';
    else if (/croquette|patee|litiere|friandise/.test(key)) kind = 'petbag';
    return { kind, base, accent, detail, label:shortLabel(product?.name), hash };
  }

function premiumProductVisual(product, compact = false) {
    const { kind, base, accent, detail, label, hash } = premiumVisualSpec(product);
    const id = `p${hash.toString(36)}`;
    const labelSize = compact ? 0 : (label.length > 9 ? 6.3 : 7.2);
    const defs = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${accent}"/></linearGradient><filter id="${id}s" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#6b4a5a" flood-opacity=".12"/></filter></defs>`;
    const commonLabel = labelSize ? `<rect x="30" y="48" width="60" height="19" rx="5" fill="rgba(255,255,255,.92)"/><text x="60" y="60.5" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="${labelSize}" font-weight="800" fill="#142232">${esc(label)}</text><path d="M34 73h52" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-linecap="round"/>` : '';
    let body = '';
    switch (kind) {
      case 'bottle': body = `<g filter="url(#${id}s)"><path d="M48 12h24v13l8 9v54c0 10-8 18-20 18s-20-8-20-18V34l8-9z" fill="url(#${id}g)"/><rect x="48" y="8" width="24" height="9" rx="3" fill="#d8e7f2"/><rect x="43" y="39" width="34" height="40" rx="9" fill="rgba(255,255,255,.88)"/>${commonLabel}<path d="M48 30c8 4 16 4 24 0" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/></g>`; break;
      case 'carton': body = `<g filter="url(#${id}s)"><path d="M38 20h43l8 13v69H34V30z" fill="url(#${id}g)"/><path d="M38 20l12-10h30l1 10z" fill="#eef4f7"/><path d="M81 20l8 13H49l-11-13z" fill="rgba(255,255,255,.42)"/>${commonLabel}</g>`; break;
      case 'cup': body = `<g filter="url(#${id}s)"><ellipse cx="60" cy="30" rx="34" ry="10" fill="#eff5f8"/><path d="M28 31h64l-7 62c-1 9-10 14-25 14s-24-5-25-14z" fill="url(#${id}g)"/><ellipse cx="60" cy="31" rx="31" ry="7" fill="#fff" fill-opacity=".8"/>${commonLabel}</g>`; break;
      case 'butter': body = `<g filter="url(#${id}s)" transform="rotate(-6 60 60)"><rect x="24" y="34" width="72" height="50" rx="9" fill="url(#${id}g)"/><path d="M24 42h72M30 34l10 50M90 34L78 84" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>${commonLabel}</g>`; break;
      case 'cheese': body = `<g filter="url(#${id}s)"><path d="M24 81L70 25l27 21-12 53H35z" fill="url(#${id}g)"/><circle cx="69" cy="52" r="5" fill="#f7cf55" fill-opacity=".85"/><circle cx="54" cy="72" r="4" fill="#f7cf55" fill-opacity=".85"/><circle cx="78" cy="79" r="6" fill="#f7cf55" fill-opacity=".85"/>${commonLabel}</g>`; break;
      case 'baguette': body = `<g filter="url(#${id}s)" transform="rotate(-14 60 60)"><rect x="13" y="47" width="94" height="30" rx="15" fill="#ca7a31"/><path d="M29 50l8 24M48 48l8 27M68 48l8 27M87 50l7 21" stroke="#f1c17a" stroke-width="4" stroke-linecap="round"/></g>`; break;
      case 'bread': body = `<g filter="url(#${id}s)"><path d="M23 43c0-14 12-24 29-24h17c17 0 28 10 28 24v49H23z" fill="#b66e35"/><path d="M29 44c0-10 9-18 24-18h15c13 0 22 7 22 18v39H29z" fill="#e2a968"/>${commonLabel}</g>`; break;
      case 'pastry': body = `<g filter="url(#${id}s)"><path d="M19 73c8-35 28-47 42-24 13-23 36-12 40 24-18-12-31-8-40 9-11-17-25-22-42-9z" fill="#d48a38"/><path d="M30 67c10-17 19-18 29 1M64 68c11-20 21-18 28-1" stroke="#f4c47b" stroke-width="6" fill="none" stroke-linecap="round"/></g>`; break;
      case 'wrap': body = `<g filter="url(#${id}s)"><circle cx="60" cy="61" r="41" fill="#e2c891"/><circle cx="60" cy="61" r="34" fill="#f1e0b5"/><path d="M39 43l43 37M35 67l36-36" stroke="${base}" stroke-opacity=".65" stroke-width="5" stroke-linecap="round"/></g>`; break;
      case 'meat': body = `<g filter="url(#${id}s)"><path d="M24 61c3-27 27-42 52-30 23 11 28 39 7 55-19 15-55 6-59-25z" fill="#b94752"/><path d="M37 58c7-15 24-22 39-14" stroke="#f2a5a7" stroke-width="7" stroke-linecap="round"/><circle cx="71" cy="68" r="9" fill="#f4d2bb"/></g>`; break;
      case 'poultry': body = `<g filter="url(#${id}s)"><ellipse cx="58" cy="64" rx="34" ry="25" fill="#d5a16d"/><path d="M82 57c10-2 19 2 21 10 2 7-4 13-14 13" stroke="#c38a52" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="31" cy="60" r="9" fill="#e8bf91"/></g>`; break;
      case 'slices': body = `<g filter="url(#${id}s)"><ellipse cx="50" cy="64" rx="29" ry="18" fill="#c84f59" transform="rotate(-16 50 64)"/><ellipse cx="70" cy="61" rx="29" ry="18" fill="#d76363" transform="rotate(12 70 61)"/><path d="M48 53l8 21M65 48l12 24" stroke="#f0a7a2" stroke-width="3"/></g>`; break;
      case 'fish': body = `<g filter="url(#${id}s)"><path d="M22 62c22-30 57-31 76-4-19 29-54 30-76 4z" fill="url(#${id}g)"/><path d="M97 58l16-14v30z" fill="${accent}"/><circle cx="42" cy="55" r="3" fill="#111d2b"/><path d="M54 53c11 6 20 7 30 3" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/></g>`; break;
      case 'shrimp': body = `<g filter="url(#${id}s)"><path d="M87 36c-32-13-58 7-57 33 1 23 23 34 44 23 14-7 19-24 8-35-9-9-26-7-32 3" fill="none" stroke="#ee7c62" stroke-width="14" stroke-linecap="round"/><path d="M87 36l16-9-4 17z" fill="#e95f50"/></g>`; break;
      case 'shell': body = `<g filter="url(#${id}s)"><path d="M28 79c0-28 13-48 32-48s32 20 32 48c-17 17-47 17-64 0z" fill="#393747"/><path d="M60 35v53M43 40l9 49M77 40l-9 49" stroke="#706b7e" stroke-width="4"/></g>`; break;
      case 'roundfood': body = `<g filter="url(#${id}s)"><circle cx="60" cy="61" r="42" fill="#d5a35e"/><circle cx="60" cy="61" r="35" fill="${base}"/><circle cx="45" cy="49" r="6" fill="${accent}"/><circle cx="72" cy="43" r="5" fill="#f4e09b"/><circle cx="70" cy="72" r="7" fill="#d84c43"/><path d="M60 27v68M27 61h66" stroke="#f6d59b" stroke-opacity=".45" stroke-width="3"/></g>`; break;
      case 'icecream': body = `<g filter="url(#${id}s)"><path d="M45 59h30L62 105z" fill="#d6a25e"/><circle cx="53" cy="51" r="18" fill="${base}"/><circle cx="70" cy="51" r="18" fill="${accent}"/><circle cx="61" cy="38" r="18" fill="#f2e3c5"/></g>`; break;
      case 'drink': body = `<g filter="url(#${id}s)"><path d="M47 13h26v15l7 10v53c0 9-7 15-20 15s-20-6-20-15V38l7-10z" fill="url(#${id}g)"/><rect x="47" y="8" width="26" height="9" rx="3" fill="#dae5ef"/>${commonLabel}</g>`; break;
      case 'wine': body = `<g filter="url(#${id}s)"><path d="M51 10h18v26l7 13v45c0 8-6 12-16 12s-16-4-16-12V49l7-13z" fill="url(#${id}g)"/><rect x="48" y="9" width="24" height="8" rx="2" fill="#c5b079"/>${commonLabel}</g>`; break;
      case 'can': body = `<g filter="url(#${id}s)"><ellipse cx="60" cy="24" rx="27" ry="8" fill="#dbe4e9"/><rect x="33" y="24" width="54" height="74" fill="url(#${id}g)"/><ellipse cx="60" cy="98" rx="27" ry="8" fill="#bac7ce"/>${commonLabel}</g>`; break;
      case 'condiment': body = `<g filter="url(#${id}s)"><path d="M48 20h24l5 18 4 7v50c0 8-8 12-21 12s-21-4-21-12V45l4-7z" fill="url(#${id}g)"/><rect x="46" y="14" width="28" height="10" rx="4" fill="#e6e9ec"/>${commonLabel}</g>`; break;
      case 'coffee': body = `<g filter="url(#${id}s)"><path d="M31 25h58l7 75H24z" fill="url(#${id}g)"/><path d="M34 25h52" stroke="#f0d9b5" stroke-width="6"/><circle cx="60" cy="59" r="14" fill="#5b3928"/><path d="M55 48c8 7 8 16 0 23" stroke="#c89d76" stroke-width="3" fill="none"/>${commonLabel}</g>`; break;
      case 'pods': body = `<g filter="url(#${id}s)"><ellipse cx="43" cy="58" rx="21" ry="15" fill="url(#${id}g)"/><ellipse cx="76" cy="61" rx="21" ry="15" fill="${accent}"/><ellipse cx="60" cy="43" rx="21" ry="15" fill="#d7b374"/><path d="M28 58h30M61 61h30M45 43h30" stroke="#fff" stroke-opacity=".4" stroke-width="3"/></g>`; break;
      case 'pouch': body = `<g filter="url(#${id}s)"><path d="M28 18h64l-5 88H33z" fill="url(#${id}g)"/><path d="M31 25h58" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><rect x="37" y="43" width="46" height="39" rx="7" fill="rgba(255,255,255,.88)"/>${commonLabel}</g>`; break;
      case 'bag': body = `<g filter="url(#${id}s)"><path d="M32 23h56l8 81H24z" fill="url(#${id}g)"/><path d="M35 23h50" stroke="#f1e4c9" stroke-width="6"/>${commonLabel}</g>`; break;
      case 'snack': body = `<g filter="url(#${id}s)"><path d="M28 16h64l-6 90H34z" fill="url(#${id}g)"/><path d="M31 23h58M34 96h52" stroke="#fff" stroke-opacity=".42" stroke-width="4"/><circle cx="60" cy="57" r="18" fill="#f1c86a"/>${commonLabel}</g>`; break;
      case 'treat': body = `<g filter="url(#${id}s)"><rect x="24" y="25" width="72" height="72" rx="12" fill="url(#${id}g)"/><circle cx="60" cy="58" r="18" fill="#9a5f37"/><circle cx="53" cy="52" r="3" fill="#5e3623"/><circle cx="68" cy="63" r="3" fill="#5e3623"/>${commonLabel}</g>`; break;
      case 'rolls': body = `<g filter="url(#${id}s)"><ellipse cx="40" cy="65" rx="22" ry="31" fill="#f8f9fa"/><ellipse cx="76" cy="65" rx="22" ry="31" fill="#eef1f4"/><circle cx="40" cy="65" r="8" fill="#c9d0d6"/><circle cx="76" cy="65" r="8" fill="#c9d0d6"/><path d="M28 46h24M64 46h24" stroke="#d8dee4" stroke-width="2"/></g>`; break;
      case 'pack': body = `<g filter="url(#${id}s)"><rect x="26" y="24" width="68" height="72" rx="12" fill="url(#${id}g)"/><rect x="34" y="34" width="52" height="48" rx="9" fill="rgba(255,255,255,.12)"/>${commonLabel}</g>`; break;
      case 'spray': body = `<g filter="url(#${id}s)"><path d="M46 39h32l5 12v44c0 8-8 12-21 12S41 103 41 95V51z" fill="url(#${id}g)"/><path d="M52 39V25h31l10 7-8 10H69" fill="#cbd7df"/><path d="M85 31h17" stroke="#e9eff3" stroke-width="6" stroke-linecap="round"/>${commonLabel}</g>`; break;
      case 'cleaner': body = `<g filter="url(#${id}s)"><path d="M46 14h28v17l8 12v51c0 9-8 13-22 13s-22-4-22-13V43l8-12z" fill="url(#${id}g)"/><rect x="47" y="10" width="26" height="9" rx="3" fill="#dae4e8"/>${commonLabel}</g>`; break;
      case 'tube': body = `<g filter="url(#${id}s)" transform="rotate(-9 60 60)"><path d="M35 23h50l-8 74H43z" fill="url(#${id}g)"/><rect x="42" y="94" width="36" height="10" rx="3" fill="#dce5eb"/>${commonLabel}</g>`; break;
      case 'brush': body = `<g filter="url(#${id}s)" transform="rotate(-18 60 60)"><rect x="53" y="28" width="14" height="76" rx="7" fill="url(#${id}g)"/><rect x="42" y="20" width="36" height="18" rx="7" fill="${accent}"/><path d="M46 18v-9M53 18v-9M60 18v-9M67 18v-9M74 18v-9" stroke="#e9f4f8" stroke-width="3"/></g>`; break;
      case 'sponge': body = `<g filter="url(#${id}s)"><rect x="24" y="39" width="72" height="43" rx="13" fill="url(#${id}g)"/><circle cx="39" cy="53" r="3" fill="#fff" fill-opacity=".42"/><circle cx="56" cy="66" r="4" fill="#fff" fill-opacity=".34"/><circle cx="78" cy="51" r="3" fill="#fff" fill-opacity=".38"/></g>`; break;
      case 'diaper': body = `<g filter="url(#${id}s)"><path d="M28 31h64l-7 67H35z" fill="#f5f7f9"/><path d="M28 31l18 20h28l18-20M35 98l16-22h18l16 22" fill="${base}" fill-opacity=".65"/>${commonLabel}</g>`; break;
      case 'petbag': body = `<g filter="url(#${id}s)"><path d="M29 19h62l5 87H24z" fill="url(#${id}g)"/><circle cx="60" cy="57" r="20" fill="rgba(255,255,255,.9)"/><circle cx="50" cy="51" r="6" fill="#26384a"/><circle cx="70" cy="51" r="6" fill="#26384a"/><path d="M51 69c6 5 12 5 18 0" stroke="#26384a" stroke-width="3" fill="none" stroke-linecap="round"/>${commonLabel}</g>`; break;
      case 'banana': body = `<g filter="url(#${id}s)"><path d="M24 45c8 33 37 48 69 29 10-6 17-14 20-24-23 23-51 29-71 10-8-8-11-14-18-15z" fill="${base}"/><path d="M28 45l-5-8M111 49l5-8" stroke="#7b6b27" stroke-width="5" stroke-linecap="round"/></g>`; break;
      case 'longveg': body = `<g filter="url(#${id}s)" transform="rotate(-13 60 60)"><path d="M53 19h14l9 76c1 9-5 13-16 13s-17-4-16-13z" fill="${base}"/><path d="M54 20l-12-13M60 20V4M66 20L79 7" stroke="${accent}" stroke-width="5" stroke-linecap="round"/></g>`; break;
      case 'cluster': body = `<g filter="url(#${id}s)"><path d="M61 19c-5 9-8 17-8 25" stroke="#5d7f39" stroke-width="5" fill="none"/><circle cx="50" cy="52" r="13" fill="${base}"/><circle cx="70" cy="52" r="13" fill="${base}"/><circle cx="41" cy="69" r="12" fill="${base}"/><circle cx="60" cy="69" r="13" fill="${base}"/><circle cx="79" cy="69" r="12" fill="${base}"/><circle cx="52" cy="85" r="11" fill="${base}"/><circle cx="69" cy="85" r="11" fill="${base}"/></g>`; break;
      case 'produce': body = `<g filter="url(#${id}s)"><path d="M60 24c-7-8-7-15-2-20" stroke="#5e7a34" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M58 18c10-7 19-6 26 1-10 4-18 5-26-1z" fill="#63a64b"/><path d="M27 61c0-25 14-39 33-39s33 14 33 39c0 27-16 43-33 43S27 88 27 61z" fill="${base}"/><ellipse cx="49" cy="43" rx="8" ry="12" fill="#fff" fill-opacity=".18"/></g>`; break;
      default: body = `<g filter="url(#${id}s)"><rect x="26" y="20" width="68" height="84" rx="12" fill="url(#${id}g)"/><path d="M34 30h52" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>${commonLabel}</g>`;
    }
    return `<svg class="product-svg ${compact ? 'is-compact' : ''}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${defs}${body}</svg>`;
  }

const SPRITE_SAFE_INSET=.08;

function sprite(product,compact=false){
  const position=POSITIONS.get(norm(product?.name));
  const sheet=position&&PRODUCT_SHEETS[position.category];
  if(!position||!sheet)return premiumProductVisual(product,compact);
  const fallback=premiumProductVisual(product,compact);
  const inset=SPRITE_SAFE_INSET,scale=1-(inset*2);
  const left=-((position.col+inset)*100/scale),top=-((position.row+inset)*100/scale);
  const width=(sheet.cols*100)/scale,height=(sheet.rows*100)/scale;
  return '<span class="sprite premium-sprite '+(compact?'is-compact':'')+'" style="--sprite-left:'+left+'%;--sprite-top:'+top+'%;--sprite-width:'+width+'%;--sprite-height:'+height+'%;--sprite-ratio:'+sheet.ratio+'" aria-hidden="true">'+
    '<img src="'+sheet.src+'" alt="" loading="eager" decoding="async" draggable="false" onerror="this.parentElement.classList.add(\'is-fallback\')">'+
    '<span class="sprite-fallback">'+fallback+'</span>'+
  '</span>';
}

function usageSave(){saveJson(STORAGE.usage,state.usage)}
function recordUsage(name){const key=norm(name);const old=state.usage[key]||{count:0,lastAt:0};state.usage[key]={count:Number(old.count||0)+1,lastAt:Date.now()};usageSave()}
function favorites(){
  const curated=FAVORITES.map(n=>BY_NAME.get(norm(n))).filter(Boolean);
  if(!state.preferences.smartFavorites)return unique(curated).slice(0,12);
  const ranked=Object.entries(state.usage).filter(([key])=>BY_NAME.has(key)).sort((a,b)=>Number(b[1]?.count||0)-Number(a[1]?.count||0)||Number(b[1]?.lastAt||0)-Number(a[1]?.lastAt||0)).map(([key])=>BY_NAME.get(key));
  const out=[],seen=new Set();
  [...ranked,...curated].forEach(p=>{const k=norm(p?.name);if(!p||!k||seen.has(k)||out.length>=12)return;seen.add(k);out.push(p)});
  return out;
}
function unique(products){const seen=new Set();return products.filter(p=>{const k=norm(p.name);if(!k||seen.has(k))return false;seen.add(k);return true})}
function visibleProducts(){
  const needle=norm(state.productQuery);
  let products;
  if(needle){
    const tokens=needle.split(' ').filter(Boolean);
    products=unique(ALL).map(product=>{
      const name=norm(product.name),category=norm(product.category),sub=norm(product.sub),hay=name+' '+category+' '+sub;
      if(!tokens.every(t=>hay.includes(t)))return null;
      let score=0;if(name===needle)score+=100;if(name.startsWith(needle))score+=60;if(name.includes(needle))score+=35;
      tokens.forEach(t=>{if(name.split(' ').some(w=>w.startsWith(t)))score+=14;else if(name.includes(t))score+=8;else if(sub.includes(t))score+=3});
      return {product,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.product.name.localeCompare(b.product.name,'fr')).map(x=>x.product);
  }else if(state.category==='Toutes'){
    products=unique(ALL);
  }else if(state.category==='Favoris'){
    products=favorites();
  }else{
    const subs=GROUPS[state.category]||{};
    products=unique(Object.entries(subs).flatMap(([sub,names])=>names.map(name=>({name,category:state.category,sub}))));
  }
  if(state.preferences.hideAdded){
    const selected=selectedSet();
    products=products.filter(product=>!selected.has(norm(product.name)));
  }
  return products;
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
function sortedGroups(groups){
  const rows=[...groups];
  if(state.preferences.listSort==='alpha')return rows.sort((a,b)=>a.summary.localeCompare(b.summary,'fr',{sensitivity:'base'}));
  if(state.preferences.listSort==='category'){
    return rows.map((group,index)=>({group,index})).sort((a,b)=>{
      const productA=BY_NAME.get(norm(a.group.summary)),productB=BY_NAME.get(norm(b.group.summary));
      const categoryA=CATALOG_CATEGORY_ORDER.indexOf(productA?.category),categoryB=CATALOG_CATEGORY_ORDER.indexOf(productB?.category);
      const rankA=categoryA>0&&categoryA<CATALOG_CATEGORY_ORDER.length-1?categoryA:999;
      const rankB=categoryB>0&&categoryB<CATALOG_CATEGORY_ORDER.length-1?categoryB:999;
      return rankA-rankB||a.index-b.index;
    }).map(entry=>entry.group);
  }
  return rows;
}
function selectedSet(){return new Set(activeGroups().map(g=>norm(g.summary)))}

function status(kind,title,detail=''){
  const el=$('#status');el.className='status '+kind;
  el.innerHTML='<span></span><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div>';
  renderSettingsPage();
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('is-visible');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('is-visible'),1700)}
requestAnimationFrame(()=>setTimeout(()=>document.body.classList.remove('is-launching'),180));
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
  if(!el)return;
  el.innerHTML=CATALOG_CATEGORY_ORDER.map(category=>'<button type="button" class="cat '+(state.category===category?'is-active':'')+'" data-category="'+esc(category)+'"><span class="cat-label">'+esc(CATEGORY_META[category].label)+'</span></button>').join('');
  el.querySelectorAll('.cat').forEach(button=>button.onclick=()=>{state.category=button.dataset.category||'Toutes';state.productQuery='';$('#productSearch').value='';renderCategories();renderProducts()});
}
function renderProducts(){
  const el=$('#products'),products=visibleProducts();
  if(!el)return;
  const quantities=new Map(activeGroups().map(group=>[norm(group.summary),group.count]));
  const count=$('#productCount');if(count)count.textContent=products.length+' produit'+(products.length>1?'s':'');
  if(!products.length){el.innerHTML='<div class="empty is-wide">Aucun produit ne correspond à cette recherche.</div>';return}
  el.innerHTML=products.map(product=>{
    const quantity=quantities.get(norm(product.name))||0,active=quantity>0;
    const addLabel='Ajouter une unité de '+product.name+'. Quantité '+quantity;
    const removeLabel=active?'Retirer une unité de '+product.name+'. Quantité '+quantity:'Aucune unité de '+product.name+' à retirer';
    return '<div class="product '+(active?'is-selected':'')+'" data-name="'+esc(product.name)+'" data-quantity="'+quantity+'">'+
      '<button type="button" class="badge" aria-label="'+esc(addLabel)+'">'+(active?quantity:'+')+'</button>'+
      '<button type="button" class="media" aria-label="'+esc(removeLabel)+'" '+(active?'':'disabled')+'>'+sprite(product)+'</button>'+
      '<span class="product-copy"><span class="pname">'+esc(product.name)+'</span><small class="pcat">'+esc(product.sub||product.category)+'</small></span>'+
    '</div>';
  }).join('');
  el.querySelectorAll('.product').forEach(card=>{
    const name=card.dataset.name||'';
    const add=card.querySelector('.badge');if(add)add.onclick=()=>incrementProduct(name);
    const remove=card.querySelector('.media');if(remove)remove.onclick=()=>decrementProduct(name);
  });
}
function setProductQuantity(name,quantity){
  const key=norm(name),value=Math.max(0,Number(quantity)||0);
  const card=[...document.querySelectorAll('#products .product')].find(entry=>norm(entry.dataset.name)===key);
  if(!card)return;
  const active=value>0;
  card.dataset.quantity=String(value);
  card.classList.toggle('is-selected',active);
  const badge=card.querySelector('.badge');
  if(badge){
    badge.textContent=active?String(value):'+';
    badge.setAttribute('aria-label','Ajouter une unité de '+name+'. Quantité '+value);
  }
  const media=card.querySelector('.media');
  if(media){
    media.disabled=!active;
    media.setAttribute('aria-label',active?'Retirer une unité de '+name+'. Quantité '+value:'Aucune unité de '+name+' à retirer');
  }
}
function syncProductSelection(){
  if(state.preferences.hideAdded){renderProducts();return}
  const quantities=new Map(activeGroups().map(group=>[norm(group.summary),group.count]));
  document.querySelectorAll('#products .product').forEach(card=>{
    setProductQuantity(card.dataset.name||'',quantities.get(norm(card.dataset.name))||0);
  });
}
function renderList(){
  const groups=activeGroups(),needle=norm(state.listQuery);
  const rows=sortedGroups(groups.filter(group=>!needle||norm(group.summary).includes(needle)));
  const el=$('#listItems');
  if(!el)return;
  const count=$('#listCount');if(count)count.textContent=rows.length+' article'+(rows.length>1?'s':'');
  if(state.loading&&!groups.length){el.innerHTML='<div class="empty"><span class="spinner"></span>Synchronisation…</div>';return}
  if(!rows.length){
    const message=needle?'Aucun article trouvé.':(state.error?'Liste indisponible.':'La liste est vide.');
    el.innerHTML='<div class="empty">'+message+'</div>';
    return;
  }
  el.innerHTML=rows.map(group=>{
    const key=norm(group.summary),product=BY_NAME.get(key),busy=state.productBusy.has(key);
    const categoryLabel=product?.sub||product?.category||'Article';
    const quantity=group.count>1?'<span class="list-qty">x'+group.count+'</span>':'';
    return '<div class="list-row '+(busy?'is-busy':'')+'" data-key="'+esc(key)+'" data-name="'+esc(group.summary)+'">'+
      '<button class="purchase-check" type="button" data-name="'+esc(group.summary)+'" aria-label="Marquer '+esc(group.summary)+' comme acheté" '+(busy?'disabled':'')+'><svg><use href="#i-check"></use></svg></button>'+
      '<span class="list-icon">'+(product?sprite(product,true):'<span class="unknown">•</span>')+'</span>'+
      '<span class="list-copy"><strong class="list-name">'+esc(group.summary)+'</strong><small>'+esc(categoryLabel)+'</small></span>'+
      quantity+
      '<button class="undo-purchase" type="button" data-name="'+esc(group.summary)+'" hidden>Annuler</button>'+
      '<span class="row-grip" aria-hidden="true">≡</span>'+
    '</div>';
  }).join('');
  el.querySelectorAll('.purchase-check').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    const row=button.closest('.list-row');
    removeGroup(button.dataset.name||'',row);
  });
  el.querySelectorAll('.undo-purchase').forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    undoPurchase(button.dataset.name||'',button.closest('.list-row'));
  });
}
function undoPurchase(name,row){
  const key=norm(name),token=state.purchaseUndo.get(key);
  if(!token)return;
  token.cancelled=true;
  state.purchaseUndo.delete(key);
  state.productBusy.delete(key);
  if(row){
    row.classList.remove('is-purchased','is-removing','is-busy');
    const undo=row.querySelector('.undo-purchase');if(undo)undo.hidden=true;
    const check=row.querySelector('.purchase-check');if(check)check.disabled=false;
  }
  navigator.vibrate?.(5);
  toast('Article conservé');
}
function bindSwipeRows(root){
  root.querySelectorAll('.list-row').forEach(row=>{
    const content=row.querySelector('.swipe-content');
    const action=row.querySelector('.swipe-action');
    const done=row.querySelector('.done');
    if(!content||!action||row.classList.contains('is-busy'))return;
    let startX=0,startY=0,offsetX=0,tracking=false,horizontal=false,pointerId=null,ready=false;

    const clearVisual=()=>{
      content.style.transition='transform .28s cubic-bezier(.22,.75,.2,1)';
      content.style.transform='translate3d(0,0,0)';
      action.style.opacity='0';
      action.style.transform='translateX(28px) scale(.84)';
      action.style.filter='blur(3px)';
      action.classList.remove('is-ready');
      if(done){
        done.style.transition='opacity .28s ease,transform .28s cubic-bezier(.2,.8,.2,1),filter .28s ease';
        done.style.opacity='1';
        done.style.transform='scale(1)';
        done.style.filter='blur(0)';
      }
      ready=false;
      window.setTimeout(()=>{
        if(!row.classList.contains('is-purchased')){
          content.style.transition='';
          if(done)done.style.transition='';
        }
      },300);
    };
    const stopTracking=()=>{
      tracking=false;
      horizontal=false;
      pointerId=null;
      offsetX=0;
    };
    const finishSwipe=()=>{
      if(!horizontal){stopTracking();return}
      const threshold=Math.min(row.clientWidth*SWIPE_TRIGGER_RATIO,160);
      const shouldPurchase=-offsetX>=threshold;
      if(shouldPurchase){
        row.dataset.suppressClick='1';
        content.style.transition='transform .34s cubic-bezier(.18,.82,.2,1)';
        action.style.transition='opacity .30s ease,transform .34s cubic-bezier(.18,.82,.2,1),filter .30s ease,box-shadow .30s ease,border-color .30s ease';
        action.style.opacity='1';
        action.style.transform='translateX(0) scale(1)';
        action.style.filter='blur(0)';
        action.classList.add('is-ready');
        if(done){
          done.style.transition='opacity .22s ease,transform .26s ease,filter .22s ease';
          done.style.opacity='0';
          done.style.transform='scale(.72)';
          done.style.filter='blur(3px)';
        }
        removeGroup(row.dataset.name||'',row);
      }else{
        clearVisual();
      }
      window.setTimeout(()=>delete row.dataset.suppressClick,0);
      stopTracking();
    };

    row.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      if(row.classList.contains('is-purchased')||row.classList.contains('is-removing'))return;
      tracking=true;horizontal=false;pointerId=event.pointerId;
      startX=event.clientX;startY=event.clientY;offsetX=0;
      content.style.transition='none';
    });
    row.addEventListener('pointermove',event=>{
      if(!tracking||event.pointerId!==pointerId)return;
      const dx=event.clientX-startX,dy=event.clientY-startY;
      if(!horizontal){
        if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
        if(Math.abs(dy)>=Math.abs(dx)*.95||dx>=0){clearVisual();stopTracking();return}
        horizontal=true;
        row.dataset.suppressClick='1';
        try{row.setPointerCapture(event.pointerId)}catch(_){}
      }
      event.preventDefault();
      const maxReveal=row.clientWidth*SWIPE_MAX_RATIO;
      offsetX=Math.max(-maxReveal,Math.min(0,dx));
      const progress=Math.min(1,Math.abs(offsetX)/Math.max(1,maxReveal));
      const threshold=Math.min(row.clientWidth*SWIPE_TRIGGER_RATIO,160);
      const isReady=-offsetX>=threshold;
      content.style.transform='translate3d('+offsetX+'px,0,0)';
      const actionProgress=Math.max(0,Math.min(1,(progress-.10)/.90));
      const actionEase=1-Math.pow(1-actionProgress,2.1);
      action.style.opacity=String(actionEase);
      action.style.transform='translateX('+(28*(1-actionEase))+'px) scale('+(0.84+0.16*actionEase)+')';
      action.style.filter='blur('+(3*(1-actionEase))+'px)';
      if(done){
        const doneProgress=Math.min(1,progress/.44);
        const doneEase=doneProgress*doneProgress*(3-2*doneProgress);
        done.style.opacity=String(1-doneEase);
        done.style.transform='scale('+(1-.28*doneEase)+')';
        done.style.filter='blur('+(3*doneEase)+'px)';
      }
      if(isReady!==ready){
        ready=isReady;
        action.classList.toggle('is-ready',ready);
        if(ready)navigator.vibrate?.(5);
      }
    },{passive:false});
    row.addEventListener('pointerup',event=>{
      if(event.pointerId!==pointerId)return;
      finishSwipe();
    });
    row.addEventListener('pointercancel',event=>{
      if(event.pointerId!==pointerId)return;
      if(horizontal)clearVisual();
      stopTracking();
      window.setTimeout(()=>delete row.dataset.suppressClick,0);
    });
  });
}
function renderView(){
  $('#catalogView').classList.toggle('is-active',state.view==='catalog');
  $('#listView').classList.toggle('is-active',state.view==='list');
  $('#settingsView').classList.toggle('is-active',state.view==='settings');
  document.querySelectorAll('.tab').forEach(button=>button.classList.toggle('is-active',button.dataset.view===state.view));
  renderCategories();renderProducts();renderList();renderSettingsPage();
}
function renderSettingsPage(){
  const connection=$('#settingsConnectionSummary');
  const connectionDot=$('#settingsConnectionDot');
  const connected=!state.locked&&state.ws?.readyState===WebSocket.OPEN;
  if(connection)connection.textContent=connected?'Connecté':(state.locked?'Verrouillé':'Connexion…');
  if(connection)connection.classList.toggle('is-connected',connected);
  if(connectionDot)connectionDot.classList.toggle('is-online',connected);
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
  if(!record||Number(record.version)!==SECURITY.version||record.kdf!==SECURITY.kdf)throw new Error('Coffre de sécurité incompatible');
  const iterations=Number(record.iterations);
  if(!Number.isInteger(iterations)||iterations<SECURITY.iterations||iterations>2000000)throw new Error('Paramètres du coffre invalides');
  const salt=base64ToBytes(record.salt),iv=base64ToBytes(record.iv),cipher=base64ToBytes(record.ciphertext);
  if(salt.length<16||iv.length!==12||cipher.length<16)throw new Error('Coffre de sécurité invalide');
  const key=await deriveVaultKey(password,salt,iterations);
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
function showSecurity(mode,message=''){
  const overlay=$('#securityOverlay');
  state.securityMode=mode;
  $('#setup').classList.remove('is-visible');
  overlay.classList.add('is-visible');
  const creating=mode==='oauth'||mode==='migrate';
  $('.security-modal').classList.toggle('is-creating',creating);
  $('.security-shell').classList.toggle('is-form-mode',creating);
  $('.security-shell').classList.remove('is-password-open');
  $('#securityIcon').classList.toggle('is-creating',creating);
  $('#securityTitle').textContent='Mes courses';
  $('#securityText').textContent=message||(creating
    ?'Choisis un mot de passe local. Il chiffrera l’autorisation Home Assistant enregistrée sur cet appareil.'
    :'Déverrouillage sécurisé');
  $('#passwordPanel').hidden=false;
  $('#securityConfirmWrap').hidden=!creating;
  $('#securityHint').hidden=!creating;
  $('#securityPassword').autocomplete=creating?'new-password':'current-password';
  $('#securityPassword').value='';
  $('#securityConfirm').value='';
  $('#securitySubmit').textContent=creating?'Chiffrer et continuer':'Connexion';
  $('#resetSecurityBtn').hidden=creating;
  $('#securityError').textContent='';
  refreshVisualLock();
  setTimeout(()=>$('#securityPassword').focus(),80);
}
function hideSecurity(){
  $('#securityOverlay').classList.remove('is-visible');
  $('#securityPassword').value='';
  $('#securityConfirm').value='';
  $('#securityError').textContent='';
  $('.security-shell').classList.remove('is-password-open','is-form-mode');
  refreshVisualLock();
}
function lockApp(message='Application verrouillée.'){
  if(state.demo||!vaultRecord())return;
  if($('#connectionDialog').open)$('#connectionDialog').close();
  if($('#preferencesDialog').open)$('#preferencesDialog').close();
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
  deleteKey(STORAGE.vault);deleteKey(LEGACY_UNLOCK_KEY);deleteKey(STORAGE.auth);deleteKey(STORAGE.haUrl);deleteKey(STORAGE.entity);deleteKey(STORAGE.entityPreference);
  clearOAuthState();clearUnlockGuard();
  state.haUrl='';state.entity='';state.entities=[];state.items=[];state.locked=true;state.demo=false;
  hideSecurity();showSetup('Connexion locale supprimée. Tu peux reconnecter Home Assistant.');
}
async function exchangeCodeRaw(code,returnedState){
  const authState=loadOAuthState();
  if(!authState||authState.nonce!==String(returnedState||''))throw new Error('Validation OAuth impossible');
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
  await discoverEntities();
  state.loading=true;
  renderList();
  status('is-waiting','Connexion…','Liste Home Assistant');
  await subscribe();
  await refreshItems();
  armIdleLock();
}
async function connectFromRefresh(){
  try{
    const token=await refreshAccessToken();
    await connectAuthorized(token);
  }catch(error){
    wipeMemoryCredentials();state.locked=true;
    status('is-error','Connexion refusée',error.message||'Session invalide');
    showSecurity('unlock','La connexion Home Assistant n’a pas pu être renouvelée. Utilise le mot de passe ou réinitialise la connexion.');
  }
}
async function completeSecurityAction(){
  const password=$('#securityPassword').value;
  const confirm=$('#securityConfirm').value;
  const error=$('#securityError'),button=$('#securitySubmit');
  error.textContent='';
  if(state.securityMode==='unlock'){
    const retryMs=unlockRetryMs();
    if(retryMs>0){
      error.textContent='Trop de tentatives. Réessaie dans '+Math.ceil(retryMs/1000)+' s.';
      return;
    }
  }
  if(!password){error.textContent='Entre le mot de passe local.';return}
  if(state.securityMode==='oauth'||state.securityMode==='migrate'){
    if(password.length<SECURITY.minPasswordLength){error.textContent='Choisis au moins '+SECURITY.minPasswordLength+' caractères.';return}
    if(password!==confirm){error.textContent='Les deux mots de passe ne correspondent pas.';return}
  }
  button.disabled=true;
  try{
    if(state.securityMode==='unlock'){
      const payload=await decryptVault(vaultRecord(),password);
      clearUnlockGuard();
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
      const code=state.pendingOAuthCode;
      if(!code)throw new Error('Code OAuth manquant');
      const data=await exchangeCodeRaw(code,state.pendingOAuthState);
      if(!data?.refresh_token||!data?.access_token)throw new Error('Réponse OAuth incomplète');
      await storeSecureVault(data.refresh_token,state.haUrl,password);
      state.refreshToken=String(data.refresh_token);
      state.accessToken=String(data.access_token);
      state.accessTokenExpiresAt=Date.now()+Number(data.expires_in||1800)*1000;
      state.locked=false;
      clearOAuthState();state.pendingOAuthCode='';state.pendingOAuthState='';
      hideSecurity();
      await connectAuthorized(state.accessToken);
      return;
    }
  }catch(err){
    if(state.securityMode==='unlock'){
      const delay=registerUnlockFailure();
      error.textContent=delay
        ?'Mot de passe incorrect. Réessaie dans '+Math.ceil(delay/1000)+' s.'
        :'Mot de passe incorrect ou coffre illisible.';
    }else{
      error.textContent=err.message||'Sécurisation impossible';
    }
  }finally{button.disabled=false}
}
function beginOAuth(){
  state.demo=false;
  const value=normalizeHaUrl($('#haUrlInput').value);
  if(!value){$('#setupError').textContent='Entre une adresse HTTPS Home Assistant valide.';return}
  state.haUrl=value;
  // Do not persist the HA URL in plaintext. It survives the OAuth round-trip only in this tab.
  deleteKey(STORAGE.haUrl);
  const nonce=crypto.randomUUID?crypto.randomUUID():secureRandomToken();
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
  deleteKey(STORAGE.vault);deleteKey(LEGACY_UNLOCK_KEY);deleteKey(STORAGE.auth);deleteKey(STORAGE.haUrl);deleteKey(STORAGE.entity);deleteKey(STORAGE.entityPreference);
  clearOAuthState();clearUnlockGuard();
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
  const saved=String(localStorage.getItem(STORAGE.entity)||'').trim();
  state.entity=URL_ENTITY||saved||COURSES_ENTITY;
  try{
    const states=await request({type:'get_states'});
    state.entities=states.filter(s=>String(s.entity_id||'').startsWith('todo.')).map(s=>({id:s.entity_id,name:s.attributes?.friendly_name||s.entity_id}));
    const preferred=preferredTodoEntity(state.entities);
    if(preferred){
      state.entity=preferred.id;
      localStorage.setItem(STORAGE.entity,state.entity);
    }
  }catch(error){
    state.entities=[];
    console.warn('courses-app: get_states',error);
  }
  return state.entity;
}
async function subscribe(){try{await request({type:'subscribe_trigger',trigger:{platform:'state',entity_id:state.entity}})}catch(_){}}
async function refreshItems(){
  if(state.demo){
    state.items=loadJson(DEMO_KEY,[])||[];
    state.loading=false;state.error='';
    syncProductSelection();renderList();
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
    state.loading=false;state.error='';syncProductSelection();renderList();
    status('', 'Synchronisé',state.entities.find(e=>e.id===state.entity)?.name||state.entity);
  }catch(error){
    state.loading=false;
    state.error=error.message||'Liste Courses indisponible';
    renderList();
    status('is-error','Courses indisponible',state.error);
  }
}
async function incrementProduct(name){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  if(state.productBusy.has(key))return;
  const current=activeGroups().find(group=>norm(group.summary)===key)?.count||0;
  state.productBusy.add(key);
  setProductQuantity(item,current+1);
  try{
    await addItem(item);
  }finally{
    state.productBusy.delete(key);
    syncProductSelection();renderList();
  }
}
async function decrementProduct(name){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  if(state.productBusy.has(key))return;
  const group=activeGroups().find(entry=>norm(entry.summary)===key);
  if(!group||group.count<1)return;
  state.productBusy.add(key);
  setProductQuantity(item,group.count-1);
  try{
    await removeOneItem(item,group);
  }finally{
    state.productBusy.delete(key);
    syncProductSelection();renderList();
  }
}

async function addItem(name){
  const item=String(name||'').trim();
  if(!item)return;
  if(state.demo){
    const items=loadJson(DEMO_KEY,[])||[];
    items.push({uid:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2),summary:item,status:'needs_action'});
    saveJson(DEMO_KEY,items);state.items=items;recordUsage(item);
    navigator.vibrate?.(10);toast(item+' ajouté');syncProductSelection();renderList();return;
  }
  if(!state.entity)return;
  try{
    await request({type:'call_service',domain:'todo',service:'add_item',service_data:{item},target:{entity_id:state.entity}});
    recordUsage(item);navigator.vibrate?.(10);toast(item+' ajouté');await refreshItems();
  }catch(error){toast('Ajout impossible');status('is-error','Erreur',error.message||'Ajout impossible')}
}
async function removeOneItem(name,groupHint=null){
  const item=String(name||'').trim();
  if(!item)return;
  const key=norm(item);
  const group=groupHint||activeGroups().find(entry=>norm(entry.summary)===key);
  if(!group||group.count<1)return;

  try{
    if(state.demo){
      const items=loadJson(DEMO_KEY,[])||[];
      let removeIndex=-1;
      for(let i=items.length-1;i>=0;i--){
        const entry=items[i];
        if(String(entry?.status||'needs_action')==='completed')continue;
        const summary=String(entry?.summary??entry?.name??entry?.item??'').trim();
        if(norm(summary)===key){removeIndex=i;break}
      }
      if(removeIndex<0)return;
      items.splice(removeIndex,1);
      saveJson(DEMO_KEY,items);
      state.items=items;
      navigator.vibrate?.(8);
      toast(item+' -1');
      syncProductSelection();renderList();
      return;
    }

    if(!state.entity)throw new Error('Liste Home Assistant indisponible');
    const uid=group.uids.filter(Boolean).at(-1);
    if(!uid)throw new Error('Identifiant de l’article indisponible');
    await request({
      type:'call_service',
      domain:'todo',
      service:'update_item',
      service_data:{item:uid,status:'completed'},
      target:{entity_id:state.entity}
    });
    navigator.vibrate?.(8);
    toast(item+' -1');
    await refreshItems();
  }catch(error){
    toast('Retrait impossible');
    status('is-error','Erreur',error.message||'Retrait impossible');
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
  let undoToken=null;
  if(row){
    undoToken={cancelled:false};
    state.purchaseUndo.set(key,undoToken);
    row.classList.add('is-purchased','is-busy');
    const check=row.querySelector('.purchase-check');if(check)check.disabled=true;
    const undo=row.querySelector('.undo-purchase');if(undo)undo.hidden=false;
    navigator.vibrate?.(8);
    await new Promise(resolve=>setTimeout(resolve,PURCHASE_HOLD_MS));
    if(undoToken.cancelled)return;
    row.classList.add('is-removing');
    await new Promise(resolve=>setTimeout(resolve,PURCHASE_EXIT_MS));
    if(undoToken.cancelled)return;
    state.purchaseUndo.delete(key);
  }

  state.pendingRemoval.add(key);
  const keepOtherItems=entry=>{
    if(String(entry?.status||'needs_action')==='completed')return true;
    const summary=String(entry?.summary??entry?.name??entry?.item??'').trim();
    return norm(summary)!==key;
  };
  state.items=state.items.filter(keepOtherItems);
  syncProductSelection();renderList();

  try{
    if(state.demo){
      const items=(loadJson(DEMO_KEY,[])||[]).filter(keepOtherItems);
      saveJson(DEMO_KEY,items);
      state.items=items;
      toast(item+' acheté');
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
    toast(item+' acheté');
  }catch(error){
    toast('Suppression impossible');
    status('is-error','Erreur',error.message||'Suppression impossible');
  }finally{
    state.purchaseUndo.delete(key);
    state.pendingRemoval.delete(key);
    state.productBusy.delete(key);
    if(!state.demo)await refreshItems();
    else {syncProductSelection();renderList()}
  }
}
function openConnectionSettings(){
  if(state.demo){showSetup('Mode test actif. Connecte Home Assistant pour synchroniser la vraie liste.');return}
  const urlInput=$('#connectionHaUrl');
  if(urlInput)urlInput.value=state.haUrl||'';
  const choices=state.entities.length?state.entities:(state.entity?[{id:state.entity,name:state.entity}]:[]);
  const select=$('#connectionEntitySelect');
  if(select){
    select.innerHTML='<option value="" selected>Choisir une liste</option>'+choices.map(e=>'<option value="'+esc(e.id)+'">'+esc(e.name)+' — '+esc(e.id)+'</option>').join('');
    select.value='';
  }
  renderSettingsPage();
  const dialog=$('#connectionDialog');
  select?.blur();
  urlInput?.blur();
  dialog.showModal();
  requestAnimationFrame(()=>{
    select?.blur();
    urlInput?.blur();
    try{dialog.focus({preventScroll:true})}catch{dialog.focus()}
  });
}
async function saveConnectionSettings(){
  const nextUrl=normalizeHaUrl($('#connectionHaUrl').value);
  const chosenEntity=$('#connectionEntitySelect').value;
  const nextEntity=chosenEntity||state.entity;
  if(!nextUrl)return;
  const changedUrl=nextUrl!==state.haUrl;
  const changedEntity=!!chosenEntity&&chosenEntity!==state.entity;
  if(chosenEntity){
    state.entity=chosenEntity;
    localStorage.setItem(STORAGE.entity,chosenEntity);
    localStorage.setItem(STORAGE.entityPreference,chosenEntity);
  }
  $('#connectionDialog').close();
  if(changedUrl){
    await revoke();
    state.haUrl=nextUrl;
    $('#haUrlInput').value=nextUrl;
    $('#setupError').textContent='Adresse modifiée : reconnecte Home Assistant.';
  }else{
    if(changedEntity)await subscribe();
    await refreshItems();armIdleLock();
  }
}

function openPreferences(){
  const dialog=$('#preferencesDialog');
  $('#preferencesListSort').value=state.preferences.listSort;
  $('#preferencesStartView').value=state.preferences.startView;
  $('#preferencesHideAdded').checked=state.preferences.hideAdded;
  $('#preferencesSmartFavorites').checked=state.preferences.smartFavorites;
  dialog.showModal();
}
function savePreferencesSettings(){
  const nextSort=$('#preferencesListSort').value;
  const nextStartView=$('#preferencesStartView').value;
  state.preferences={
    listSort:['added','category','alpha'].includes(nextSort)?nextSort:DEFAULT_PREFERENCES.listSort,
    startView:['list','catalog'].includes(nextStartView)?nextStartView:DEFAULT_PREFERENCES.startView,
    hideAdded:$('#preferencesHideAdded').checked,
    smartFavorites:$('#preferencesSmartFavorites').checked
  };
  persistPreferences();
  $('#preferencesDialog').close();
  renderProducts();
  renderList();
  renderSettingsPage();
  toast('Préférences enregistrées');
}

function openSettings(){
  if(state.demo){showSetup('Mode test actif. Connecte Home Assistant pour synchroniser la vraie liste.');return}
  $('#settingsHaUrl').value=state.haUrl;
  const choices=state.entities.length?state.entities:(state.entity?[{id:state.entity,name:state.entity}]:[]);
  $('#entitySelect').innerHTML=choices.map(e=>'<option value="'+esc(e.id)+'" '+(e.id===state.entity?'selected':'')+'>'+esc(e.name)+' — '+esc(e.id)+'</option>').join('');
  renderSettingsPage();
  $('#settingsDialog').showModal();
}
async function saveSettings(){
  const nextUrl=normalizeHaUrl($('#settingsHaUrl').value);
  const nextEntity=$('#entitySelect').value||state.entity;
  if(!nextUrl)return;
  const changedUrl=nextUrl!==state.haUrl;
  const changedEntity=!!nextEntity&&nextEntity!==state.entity;
  if(nextEntity){
    state.entity=nextEntity;
    localStorage.setItem(STORAGE.entity,nextEntity);
    localStorage.setItem(STORAGE.entityPreference,nextEntity);
  }
  $('#settingsDialog').close();
  if(changedUrl){
    await revoke();
    state.haUrl=nextUrl;
    $('#haUrlInput').value=nextUrl;
    $('#setupError').textContent='Adresse modifiée : reconnecte Home Assistant.';
  }else{
    if(changedEntity)await subscribe();
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
  deleteKey(LEGACY_UNLOCK_KEY);
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
    state.pendingOAuthState=returnedState;
    history.replaceState({},'',REDIRECT_URI);
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
$('#securityPassword').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();completeSecurityAction()}};
$('#securityConfirm').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();completeSecurityAction()}};
$('#resetSecurityBtn').onclick=resetLocalConnection;
$('#demoBtn').onclick=()=>{
  state.demo=true;state.locked=false;clearLockTimers();wipeMemoryCredentials();
  state.loading=false;state.error='';
  state.items=loadJson(DEMO_KEY,[])||[];
  hideSetup();hideSecurity();status('', 'Mode test', 'Stockage local sur ce téléphone');renderView();
};
$('#settingsBtn').onclick=()=>{state.view='settings';renderView()};
$('#securitySettingsBtn').onclick=()=>toast('Déverrouille l’application pour accéder aux réglages');
$('#catalogSearchBtn').onclick=()=>$('#productSearch')?.focus();
$('#settingsConnectionBtn').onclick=openConnectionSettings;
$('#settingsSecurityBtn').onclick=openSettings;
$('#settingsListBtn').onclick=openPreferences;
$('#settingsLockBtn').onclick=()=>lockApp('Verrouillage manuel.');
$('#settingsLogoutBtn').onclick=revoke;
$('#cancelConnectionSettings').onclick=()=>$('#connectionDialog').close();
$('#saveConnectionSettings').onclick=saveConnectionSettings;
$('#cancelPreferences').onclick=()=>$('#preferencesDialog').close();
$('#savePreferences').onclick=savePreferencesSettings;
$('#cancelSettings').onclick=()=>$('#settingsDialog').close();
$('#saveSettings').onclick=saveSettings;
$('#lockNowBtn').onclick=()=>{$('#settingsDialog').close();lockApp('Verrouillage manuel.')};
$('#logoutBtn').onclick=revoke;
$('#productSearch').oninput=e=>{state.productQuery=e.target.value||'';renderProducts()};
$('#listSearch').oninput=e=>{state.listQuery=e.target.value||'';renderList()};
document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>{state.view=button.dataset.view||'list';renderView()});
['pointerdown','touchstart','keydown'].forEach(name=>document.addEventListener(name,()=>{if(!state.locked&&!state.demo)armIdleLock()},{passive:true}));
function resumeForegroundSession(){
  clearTimeout(state.backgroundLockTimer);state.backgroundLockTimer=null;
  if(state.resumeToList){
    state.resumeToList=false;
    state.view='list';
    renderView();
  }
  if(state.demo){
    refreshItems();
    return;
  }
  if(!vaultRecord())return;
  if(state.locked){
    status('is-waiting','Verrouillé','Déverrouillage requis');
    showSecurity('unlock');
    return;
  }
  if(state.ws?.readyState===WebSocket.OPEN){
    refreshItems();
    armIdleLock();
    return;
  }
  if(state.ws?.readyState===WebSocket.CONNECTING){
    armIdleLock();
    return;
  }
  if(state.refreshToken){
    connectFromRefresh();
    return;
  }
  state.locked=true;
  status('is-waiting','Verrouillé','Déverrouillage requis');
  showSecurity('unlock');
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    clearTimeout(state.backgroundLockTimer);
    if(!state.locked&&!state.demo&&vaultRecord())state.backgroundLockTimer=setTimeout(()=>lockApp('Verrouillage après passage en arrière-plan.'),SECURITY.backgroundLockMs);
    return;
  }
  resumeForegroundSession();
});
window.addEventListener('online',()=>{
  if(state.demo)return;
  if(!state.locked&&state.refreshToken&&state.ws?.readyState!==WebSocket.OPEN&&state.ws?.readyState!==WebSocket.CONNECTING)connectFromRefresh();
});
window.addEventListener('pagehide',()=>{
  clearLockTimers();closeSocket();wipeMemoryCredentials();
  state.resumeToList=true;
  if(vaultRecord()&&!state.demo)state.locked=true;
});
window.addEventListener('pageshow',()=>{
  resumeForegroundSession();
});

['gesturestart','gesturechange','gestureend'].forEach(name=>document.addEventListener(name,event=>event.preventDefault(),{passive:false}));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderView();init();
})();