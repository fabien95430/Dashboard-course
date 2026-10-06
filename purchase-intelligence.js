(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG?.groups)return;

const STORAGE_KEY='courses-purchase-intelligence-v1';
const HISTORY_DAYS=400;
const DAY=86400000;
const SAME_TRIP=18*60*60*1000;
const WATCH_TTL=20000;
const LABEL='Acheté récemment';

// Fenêtres de disponibilité probables pour un foyer de deux personnes.
// Elles pilotent uniquement la suggestion "Acheté récemment" et ne remplacent jamais une DLC.
const CATEGORY=Object.freeze({
  'Frais':{days:5,factor:.55,shelf:7},
  'Fruits & Légumes':{days:7,factor:.62,shelf:14},
  'Épicerie':{days:30,factor:.8},
  'Boissons':{days:14,factor:.8},
  'Maison':{days:45,factor:.86}
});
const SUB=Object.freeze({
  'Laits & crèmes':{days:7,factor:.6,shelf:10},'Yaourts & desserts':{days:8,factor:.6,shelf:12},
  'Fromages':{days:14,factor:.7,shelf:21},'Charcuterie':{days:5,factor:.55,shelf:7},
  'Viandes':{days:2,factor:.5,shelf:3},'Poissons & traiteur':{days:2,factor:.5,shelf:3},
  'Surgelés':{days:35,factor:.82},'Boulangerie':{days:4,factor:.55,shelf:7},
  'Fruits classiques':{days:8,factor:.65,shelf:18},'Fruits rouges & exotiques':{days:5,factor:.6,shelf:10},
  'Légumes du quotidien':{days:7,factor:.65,shelf:14},'Légumes variés':{days:9,factor:.65,shelf:18},
  'Salades & herbes':{days:5,factor:.55,shelf:8},'Pommes de terre & aromates':{days:18,factor:.72,shelf:35},
  'Pâtes, riz & céréales':{days:50,factor:.85},'Conserves':{days:5,factor:.3},
  'Sauces & condiments':{days:75,factor:.85},'Petit-déjeuner':{days:35,factor:.82},
  'Biscuits & goûters':{days:14,factor:.72},'Pâtisserie & cuisine':{days:75,factor:.86},
  'Apéritif':{days:18,factor:.7},'Monde & pratique':{days:30,factor:.75},
  'Eaux & jus':{days:7,factor:.75},'Sodas & sirops':{days:14,factor:.8},
  'Café & thé':{days:35,factor:.85},'Bières & vins':{days:30,factor:.82},
  'Entretien':{days:60,factor:.88},'Lessive':{days:45,factor:.88},'Vaisselle':{days:45,factor:.88},
  'Papier & sacs':{days:35,factor:.86},'Hygiène':{days:35,factor:.86},
  'Salle de bain & soins':{days:60,factor:.88},'Bébé & animaux':{days:21,factor:.82}
});
const PRODUCT=Object.freeze({
  // Frais : plafonds courts pour les produits sensibles.
  'Lait':{days:6,shelf:7},'Lait entier':{days:6,shelf:7},'Lait demi-écrémé':{days:6,shelf:7},
  'Lait écrémé':{days:6,shelf:7},'Lait sans lactose':{days:7,shelf:8},'Lait d\'amande':{days:7,shelf:10},
  'Lait d\'avoine':{days:7,shelf:10},'Crème fraîche':{days:7,shelf:10},'Crème liquide':{days:6,shelf:7},
  'Crème épaisse':{days:7,shelf:10},'Œufs':{days:21,factor:.78,shelf:28},'Mascarpone':{days:5,shelf:7},
  'Beurre':{days:30,factor:.82,shelf:45},'Emmental':{days:21,factor:.78,shelf:28},'Comté':{days:28,factor:.8,shelf:35},
  'Gruyère':{days:28,factor:.8,shelf:35},'Parmesan':{days:28,factor:.82,shelf:35},'Fromage râpé':{days:10,shelf:14},
  'Camembert':{days:7,shelf:10},'Brie':{days:7,shelf:10},'Chèvre':{days:7,shelf:10},
  'Mozzarella':{days:4,shelf:5},'Roquefort':{days:14,shelf:21},'Raclette':{days:7,shelf:10},'Reblochon':{days:7,shelf:10},
  'Jambon blanc':{days:4,shelf:5},'Lardons':{days:4,shelf:5},'Pâté':{days:5,shelf:7},'Rillettes':{days:5,shelf:7},
  'Blanc de poulet':{days:4,shelf:5},'Rosette':{days:21,shelf:30},'Saucisson':{days:30,shelf:45},'Chorizo':{days:30,shelf:45},
  'Steaks hachés':{days:2,shelf:2},'Viande hachée':{days:2,shelf:2},'Poulet':{days:2,shelf:2},
  'Escalopes de poulet':{days:2,shelf:2},'Dinde':{days:2,shelf:2},'Saucisses':{days:2,shelf:2},'Merguez':{days:2,shelf:2},
  'Bœuf':{days:3,shelf:5},'Porc':{days:3,shelf:5},'Côtes de porc':{days:3,shelf:5},'Veau':{days:3,shelf:5},'Agneau':{days:3,shelf:5},
  'Saumon':{days:2,shelf:2},'Cabillaud':{days:2,shelf:2},'Thon frais':{days:2,shelf:2},'Truite':{days:2,shelf:2},
  'Crevettes':{days:2,shelf:2},'Moules':{days:2,shelf:2},'Saumon fumé':{days:5,shelf:7},
  'Pain':{days:3,shelf:5},'Baguette':{days:2,shelf:3},'Pain de mie':{days:7,shelf:10},
  'Wraps':{days:12,shelf:18},'Pains burger':{days:7,shelf:10},'Pains hot-dog':{days:7,shelf:10},'Galettes de blé':{days:12,shelf:18},

  // Fruits/légumes : durée pratique probable.
  'Pommes':{days:14,shelf:30},'Bananes':{days:5,shelf:7},'Oranges':{days:14,shelf:21},'Citrons':{days:18,shelf:30},
  'Fraises':{days:3,shelf:5},'Framboises':{days:3,shelf:4},'Avocat':{days:5,shelf:8},
  'Tomates':{days:7,shelf:12},'Carottes':{days:14,shelf:28},'Courgettes':{days:7,shelf:10},'Champignons':{days:5,shelf:7},
  'Brocoli':{days:5,shelf:7},'Épinards':{days:4,shelf:6},'Salade verte':{days:4,shelf:6},
  'Pommes de terre':{days:21,shelf:35},'Oignons jaunes':{days:30,shelf:45},'Oignons rouges':{days:21,shelf:35},
  'Échalotes':{days:30,shelf:45},'Ail':{days:45,shelf:60},'Gingembre':{days:21,shelf:30},'Noix':{days:60},'Noisettes':{days:60},

  // Épicerie : usage probable, pas conservation maximale.
  'Spaghetti':{days:45},'Penne':{days:45},'Coquillettes':{days:45},'Tagliatelles':{days:45},'Lasagnes':{days:60},
  'Riz basmati':{days:60},'Riz long':{days:60},'Riz complet':{days:60},'Semoule':{days:60},'Quinoa':{days:60},
  'Thon en boîte':{days:4,factor:.25},'Sardines':{days:4,factor:.25},'Maquereaux':{days:4,factor:.25},
  'Tomates pelées':{days:4,factor:.25},'Haricots rouges':{days:4,factor:.25},'Pois chiches':{days:4,factor:.25},'Maïs en boîte':{days:4,factor:.25},
  'Ketchup':{days:60},'Mayonnaise':{days:30,shelf:60},'Moutarde':{days:90},'Sauce barbecue':{days:60},
  'Sauce soja':{days:90},'Pesto':{days:5,shelf:7},'Tabasco':{days:180},'Vinaigre balsamique':{days:180},'Vinaigre de vin':{days:180},
  'Huile d\'olive':{days:120,factor:.88},'Huile de tournesol':{days:120,factor:.88},'Cornichons':{days:75,factor:.85},
  'Café moulu':{days:21},'Café en grains':{days:30},'Café soluble':{days:60},'Thé noir':{days:75},'Thé vert':{days:75},
  'Farine':{days:90},'Sucre':{days:120},'Sucre roux':{days:120},'Sucre glace':{days:120},'Maïzena':{days:120},
  'Miel':{days:120},'Confiture':{days:60},'Pâte à tartiner':{days:60},'Curry':{days:120},'Bouillon cubes':{days:120},

  // Quelques consommables maison à longue rotation ; le reste hérite de sa sous-catégorie.
  'Papier toilette':{days:28},'Essuie-tout':{days:28},'Sacs poubelle 30L':{days:45},'Sacs poubelle 50L':{days:45},
  'Lessive liquide':{days:45},'Lessive capsules':{days:45},'Lessive poudre':{days:60},'Adoucissant':{days:50},
  'Liquide vaisselle':{days:45},'Tablettes lave-vaisselle':{days:45},'Shampoing':{days:45},'Après-shampoing':{days:55},
  'Gel douche':{days:35},'Dentifrice':{days:45},'Déodorant':{days:45},'Brosses à dents':{days:90},
  'Croquettes chat':{days:21},'Croquettes chien':{days:21},'Litière chat':{days:21}
});

const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const META=new Map();
Object.entries(CATALOG.groups).forEach(([category,subs])=>Object.entries(subs||{}).forEach(([sub,names])=>{
  (Array.isArray(names)?names:[]).forEach(name=>META.set(norm(name),{name,category,sub}));
}));

let state=readState();
let toastObserver=null;
let dishObserver=null;
let refreshFrame=0;
const pending=new Map();

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function median(values){
  const sorted=values.filter(Number.isFinite).slice().sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const m=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
}
function readState(){
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(value?.version===1&&value.purchases&&typeof value.purchases==='object')return value;
  }catch(_){}
  return {version:1,purchases:{},products:{},updatedAt:0};
}
function prune(){
  const cutoff=Date.now()-HISTORY_DAYS*DAY;
  Object.keys(state.purchases).forEach(key=>{
    const events=(Array.isArray(state.purchases[key])?state.purchases[key]:[])
      .filter(event=>Number(event?.at)>=cutoff)
      .map(event=>({at:Number(event.at),qty:Math.max(1,Number(event.qty)||1)}))
      .sort((a,b)=>a.at-b.at);
    if(events.length)state.purchases[key]=events;else delete state.purchases[key];
  });
}
function baseRule(meta){
  const category=CATEGORY[meta?.category]||{days:30,factor:.8};
  const sub=SUB[meta?.sub]||category;
  const product=PRODUCT[meta?.name]||{};
  return {
    days:Math.max(1,Number(product.days??sub.days??category.days??30)),
    factor:clamp(Number(product.factor??sub.factor??category.factor??.8),.15,.95),
    shelf:Number(product.shelf??sub.shelf??category.shelf)||0
  };
}
function eventsFor(name){return state.purchases[norm(name)]||[]}
function adaptiveDays(meta){
  const base=baseRule(meta),events=eventsFor(meta.name),intervals=[];
  for(let i=1;i<events.length;i++){
    const days=(events[i].at-events[i-1].at)/DAY;
    if(days>=1)intervals.push(days);
  }
  let days=base.days;
  const samples=intervals.slice(-8);
  if(samples.length>=2){
    const target=median(samples)*base.factor;
    const confidence=samples.length>=5?.8:samples.length===4?.68:samples.length===3?.55:.38;
    days=base.days*(1-confidence)+target*confidence;
    days=clamp(days,Math.max(1,base.days*.35),Math.min(365,base.days*3));
  }
  if(base.shelf>0)days=Math.min(days,base.shelf);
  const last=events.at(-1);
  if(last?.qty>1)days*=Math.min(1.6,1+.18*(Math.min(4,last.qty)-1));
  if(base.shelf>0)days=Math.min(days,base.shelf);
  return Math.max(1,Math.round(days));
}
function rebuild(){
  const products={};
  META.forEach((meta,key)=>{
    const events=eventsFor(meta.name),base=baseRule(meta);
    products[key]={name:meta.name,category:meta.category,sub:meta.sub,baseDays:base.days,recentDays:adaptiveDays(meta),samples:Math.max(0,events.length-1),lastAt:Number(events.at(-1)?.at)||0};
  });
  state.products=products;
  state.updatedAt=Date.now();
}
function persist(){
  prune();rebuild();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_){}
}
function record(name,qty=1,at=Date.now()){
  const meta=META.get(norm(name));
  if(!meta)return;
  const key=norm(meta.name),events=Array.isArray(state.purchases[key])?state.purchases[key]:[],last=events.at(-1);
  if(last&&at-last.at<=SAME_TRIP){last.qty=Math.max(1,Number(last.qty)||1)+Math.max(1,Number(qty)||1);last.at=Math.max(last.at,at)}
  else events.push({at,qty:Math.max(1,Number(qty)||1)});
  state.purchases[key]=events;persist();scheduleDish();
}
function profile(name){return state.products[norm(name)]||null}
function recent(name,at=Date.now()){
  const p=profile(name);
  if(!p?.lastAt)return null;
  const age=Math.max(0,(at-p.lastAt)/DAY);
  return age<=p.recentDays?{profile:p,ageDays:age}:null;
}
function rowQty(row){
  const value=Number(String(row?.querySelector('.list-qty')?.textContent||'').replace(/[^0-9]/g,''));
  return Number.isFinite(value)&&value>0?value:1;
}
function watchPurchase(button){
  const row=button?.closest?.('.list-row'),name=String(button?.dataset?.name||row?.dataset?.name||'').trim();
  if(!name)return;
  const key=norm(name),previous=pending.get(key);
  if(previous?.timer)clearTimeout(previous.timer);
  const token={name,qty:rowQty(row),timer:0};
  token.timer=setTimeout(()=>pending.delete(key),WATCH_TTL);
  pending.set(key,token);
}
function cancelPurchase(button){
  const row=button?.closest?.('.list-row'),key=norm(button?.dataset?.name||row?.dataset?.name||'');
  const token=pending.get(key);if(token?.timer)clearTimeout(token.timer);pending.delete(key);
}
function consumeToast(){
  const text=String(document.getElementById('toast')?.textContent||'').trim();
  if(!text.endsWith(' acheté'))return;
  for(const [key,token] of pending){
    if(text!==token.name+' acheté')continue;
    if(token.timer)clearTimeout(token.timer);pending.delete(key);record(token.name,token.qty);break;
  }
}
function styles(){
  if(document.getElementById('courses-purchase-intelligence-style'))return;
  const style=document.createElement('style');style.id='courses-purchase-intelligence-style';
  style.textContent=`
    #dishDialog .dish-ingredient.is-recent-purchase{background:rgba(239,242,238,.7)!important;border-color:rgba(87,103,94,.08)!important;box-shadow:none!important}
    #dishDialog .dish-ingredient.is-recent-purchase .dish-ingredient-thumb,#dishDialog .dish-ingredient.is-recent-purchase .dish-ingredient-check{opacity:.42!important;filter:saturate(.55)!important}
    #dishDialog .dish-ingredient.is-recent-purchase .dish-ingredient-name{color:#87918b!important}
    #dishDialog .dish-ingredient-recent{display:block!important;margin-top:1px!important;color:#8b958f!important;font-size:9.8px!important;line-height:1.05!important;font-weight:720!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}`;
  document.head.appendChild(style);
}
function clearRecent(row){
  row.classList.remove('is-recent-purchase');delete row.dataset.recentPurchase;row.querySelector('.dish-ingredient-recent')?.remove();
}
function decorateDish(){
  const dialog=document.getElementById('dishDialog');if(!dialog?.open)return;
  dialog.querySelectorAll('.dish-ingredient[data-ingredient]').forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    if(!name||row.disabled||row.hasAttribute('disabled')||row.dataset.recentPurchaseOverride==='1'||!recent(name)){clearRecent(row);return}
    row.classList.add('is-recent-purchase');row.dataset.recentPurchase='1';
    const label=row.querySelector('.dish-ingredient-name');
    if(label&&!label.querySelector('.dish-ingredient-recent')){const note=document.createElement('small');note.className='dish-ingredient-recent';note.textContent=LABEL;label.appendChild(note)}
    if(row.getAttribute('aria-pressed')==='true'&&row.dataset.recentPurchaseDefault!=='1'){row.dataset.recentPurchaseDefault='1';row.click()}
  });
}
function scheduleDish(){
  if(refreshFrame)return;
  refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;decorateDish()});
}
function bindDish(){
  const dialog=document.getElementById('dishDialog');if(!dialog)return false;
  dishObserver?.disconnect();dishObserver=new MutationObserver(scheduleDish);
  dishObserver.observe(dialog,{subtree:true,childList:true,attributes:true,attributeFilter:['open','disabled']});
  dialog.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    const row=event.target?.closest?.('.dish-ingredient.is-recent-purchase');if(!row||!dialog.contains(row))return;
    setTimeout(()=>{if(row.getAttribute('aria-pressed')==='true'){row.dataset.recentPurchaseOverride='1';clearRecent(row)}},0);
  },true);
  scheduleDish();return true;
}
function bindPurchases(){
  document.addEventListener('click',event=>{
    const buy=event.target?.closest?.('.purchase-check');if(buy){watchPurchase(buy);return}
    const undo=event.target?.closest?.('.undo-purchase');if(undo)cancelPurchase(undo);
  },true);
  const toast=document.getElementById('toast');
  if(toast){toastObserver?.disconnect();toastObserver=new MutationObserver(consumeToast);toastObserver.observe(toast,{childList:true,characterData:true,subtree:true})}
}
function init(){
  try{const p=navigator.storage?.persist?.();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_){}
  prune();rebuild();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_){}
  styles();bindPurchases();
  if(!bindDish()){
    const observer=new MutationObserver(()=>{if(bindDish())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),10000);
  }
  window.COURSES_PURCHASE_INTELLIGENCE=Object.freeze({retentionDays:HISTORY_DAYS,profileFor:name=>profile(name),isRecent:name=>Boolean(recent(name))});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
