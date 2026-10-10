(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG?.groups)return;

const STORAGE_KEY='courses-purchase-intelligence-v1';
const ENABLED_KEY='courses-purchase-intelligence-enabled-v1';
const HOUSEHOLD_KEYS=['courses-dish-preferred-servings-v1','courses-dish-servings-v1'];
const HISTORY_DAYS=400;
const DAY=86400000;
const SAME_TRIP=18*60*60*1000;
const DISH_WATCH_TTL=90000;
const LABEL='Acheté récemment';

// Fenêtres de disponibilité probables. Elles évitent les doublons mais ne remplacent jamais une DLC.
// Les plafonds `shelf` restent absolus, même lorsque l'historique apprend une durée plus longue.
const CATEGORY=Object.freeze({
  'Apéritif & snacks':{days:18,factor:.72},
  'Boissons':{days:14,factor:.8},
  'Boulangerie':{days:4,factor:.55,shelf:7},
  'Cuisine':{days:30,factor:.8},
  'Enfant':{days:14,factor:.78},
  'Frais':{days:7,factor:.6,shelf:12},
  'Fruits & Légumes':{days:7,factor:.62,shelf:14},
  'Hygiène & soins':{days:45,factor:.86},
  'Maison':{days:45,factor:.86},
  'Petit-déjeuner':{days:30,factor:.82},
  'Viandes & poissons':{days:3,factor:.5,shelf:5}
});
const SUB=Object.freeze({
  'Laits & crèmes':{days:7,factor:.6,shelf:10},'Yaourts & desserts':{days:8,factor:.6,shelf:12},
  'Fromages':{days:14,factor:.7,shelf:21},'Charcuterie':{days:5,factor:.55,shelf:7},
  'Viandes':{days:2,factor:.5,shelf:3},'Poissons & traiteur':{days:2,factor:.5,shelf:3},'Poissons en conserve':{days:4,factor:.25},'Traiteur frais':{days:4,factor:.55,shelf:7},
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
  'Salle de bain & soins':{days:60,factor:.88},'Enfant':{days:21,factor:.82}
});
const PRODUCT=Object.freeze({
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
  'Pommes':{days:14,shelf:30},'Bananes':{days:5,shelf:7},'Oranges':{days:14,shelf:21},'Citrons':{days:18,shelf:30},
  'Fraises':{days:3,shelf:5},'Framboises':{days:3,shelf:4},'Avocat':{days:5,shelf:8},
  'Tomates':{days:7,shelf:12},'Carottes':{days:14,shelf:28},'Courgettes':{days:7,shelf:10},'Champignons':{days:5,shelf:7},
  'Brocoli':{days:5,shelf:7},'Épinards':{days:4,shelf:6},'Salade verte':{days:4,shelf:6},
  'Pommes de terre':{days:21,shelf:35},'Oignons jaunes':{days:30,shelf:45},'Oignons rouges':{days:21,shelf:35},
  'Échalotes':{days:30,shelf:45},'Ail':{days:45,shelf:60},'Gingembre':{days:21,shelf:30},'Noix':{days:60},'Noisettes':{days:60},
  'Spaghetti':{days:45},'Penne':{days:45},'Coquillettes':{days:45},'Tagliatelles':{days:45},'Lasagnes':{days:60},
  'Riz basmati':{days:60},'Riz long':{days:60},'Riz complet':{days:60},'Semoule':{days:60},'Quinoa':{days:60},
  'Thon en boîte':{days:4,factor:.25},'Sardines':{days:4,factor:.25},'Maquereaux':{days:4,factor:.25},
  'Tomates pelées':{days:4,factor:.25},'Haricots rouges':{days:4,factor:.25},'Pois chiches':{days:4,factor:.25},'Maïs en boîte':{days:4,factor:.25},
  'Ketchup':{days:60},'Mayonnaise':{days:30,shelf:60},'Moutarde':{days:90},'Sauce barbecue':{days:60},
  'Sauce soja':{days:90},'Pesto':{days:5,shelf:7},'Tabasco':{days:180},'Vinaigre balsamique':{days:180},'Vinaigre de vin':{days:180},
  'Huile d\'olive':{days:120,factor:.88},'Huile de tournesol':{days:120,factor:.88},'Cornichons':{days:75,factor:.85},
  'Café moulu':{days:21},'Café en grains':{days:30},'Café soluble':{days:60},'Thé noir':{days:75},'Thé vert':{days:75},
  'Farine':{days:90},'Sucre':{days:120},'Sucre roux':{days:120},'Sucre glace':{days:120},'Maïzena':{days:120},
  'Miel':{days:120},'Pâte à tartiner':{days:60},'Curry':{days:120},'Bouillon cubes':{days:120},
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
const PRODUCT_RULES=new Map(Object.entries(PRODUCT).map(([name,rule])=>[norm(name),rule]));
let state=readState();
let refreshFrame=0;
let dishPending=null;
let dishPendingTimer=0;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function quantile(values,q=.5){
  const sorted=values.filter(Number.isFinite).slice().sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const index=(sorted.length-1)*clamp(q,0,1),lo=Math.floor(index),hi=Math.ceil(index);
  return lo===hi?sorted[lo]:sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);
}
function median(values){return quantile(values,.5)}
function readHousehold(){
  try{
    for(const key of HOUSEHOLD_KEYS){
      const value=Math.round(Number(localStorage.getItem(key))||0);
      if(value>=1&&value<=12)return value;
    }
  }catch(_){}
  return 4;
}
function isEnabled(){
  try{return localStorage.getItem(ENABLED_KEY)!=='0'}catch(_){return true}
}
function clearDishPending(){
  dishPending=null;
  if(dishPendingTimer)clearTimeout(dishPendingTimer);
  dishPendingTimer=0;
}
function setEnabled(value){
  const enabled=value!==false;
  try{localStorage.setItem(ENABLED_KEY,enabled?'1':'0')}catch(_){}
  if(!enabled)clearDishPending();
  syncPreferenceToggle();scheduleDish();return enabled;
}
function syncPreferenceToggle(){
  const input=document.getElementById('preferencesPurchaseHistory');
  if(input)input.checked=isEnabled();
}
function installPreferenceToggle(){
  const options=document.getElementById('preferencesDialog')?.querySelector('.preference-options');
  if(!options)return false;
  let input=document.getElementById('preferencesPurchaseHistory');
  if(!input){
    const row=document.createElement('label');
    row.className='preference-toggle';row.dataset.purchaseHistoryToggle='1';
    row.innerHTML='<span class="preference-toggle-copy"><strong>Historique des achats</strong><small>Adapte les recommandations à vos achats récents.</small></span><span class="preference-switch"><input id="preferencesPurchaseHistory" type="checkbox" aria-label="Historique des achats"><span aria-hidden="true"></span></span>';
    options.appendChild(row);input=row.querySelector('input');
    input?.addEventListener('change',()=>setEnabled(input.checked));
  }
  syncPreferenceToggle();return true;
}
function readState(){
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(value?.purchases&&typeof value.purchases==='object'){
      return {
        version:3,
        purchases:value.purchases,
        feedback:value.feedback&&typeof value.feedback==='object'?value.feedback:{},
        consumptions:value.consumptions&&typeof value.consumptions==='object'?value.consumptions:{},
        products:{},
        household:0,
        updatedAt:Number(value.updatedAt)||0
      };
    }
  }catch(_){}
  return {version:3,purchases:{},feedback:{},consumptions:{},products:{},household:0,updatedAt:0};
}
function prune(){
  const cutoff=Date.now()-HISTORY_DAYS*DAY;
  Object.keys(state.purchases).forEach(key=>{
    const events=(Array.isArray(state.purchases[key])?state.purchases[key]:[])
      .filter(event=>Number(event?.at)>=cutoff)
      .map(event=>{
        const at=Number(event.at);
        const firstAt=Math.min(at,Number(event.firstAt)||at);
        return {at,firstAt,qty:Math.max(1,Number(event.qty)||1),household:Math.max(1,Math.min(12,Math.round(Number(event.household)||readHousehold())))};
      }).sort((a,b)=>a.at-b.at);
    if(events.length)state.purchases[key]=events;else delete state.purchases[key];
  });
  Object.keys(state.feedback).forEach(key=>{
    const events=(Array.isArray(state.feedback[key])?state.feedback[key]:[])
      .filter(event=>Number(event?.at)>=cutoff&&Number(event?.days)>.1)
      .map(event=>({at:Number(event.at),days:Number(event.days),household:Math.max(1,Math.min(12,Math.round(Number(event.household)||readHousehold())))})).sort((a,b)=>a.at-b.at).slice(-12);
    if(events.length)state.feedback[key]=events;else delete state.feedback[key];
  });
  Object.keys(state.consumptions).forEach(key=>{
    const events=(Array.isArray(state.consumptions[key])?state.consumptions[key]:[])
      .filter(event=>Number(event?.at)>=cutoff&&Number(event?.qty)>0&&Number(event?.cycleAt)>0)
      .map(event=>({
        at:Number(event.at),
        cycleAt:Number(event.cycleAt),
        qty:Math.max(1,Math.ceil(Number(event.qty)||1)),
        dish:String(event.dish||'').trim().slice(0,100),
        household:Math.max(1,Math.min(12,Math.round(Number(event.household)||readHousehold())))
      })).sort((a,b)=>a.at-b.at).slice(-120);
    if(events.length)state.consumptions[key]=events;else delete state.consumptions[key];
  });
}
function baseRule(meta){
  const category=CATEGORY[meta?.category]||{days:30,factor:.8};
  const sub=SUB[meta?.sub]||category;
  const product=PRODUCT_RULES.get(norm(meta?.name))||{};
  return {days:Math.max(1,Number(product.days??sub.days??category.days??30)),factor:clamp(Number(product.factor??sub.factor??category.factor??.8),.15,.95),shelf:Number(product.shelf??sub.shelf??category.shelf)||0};
}
function eventsFor(name){return state.purchases[norm(name)]||[]}
function feedbackFor(name){return state.feedback[norm(name)]||[]}
function consumptionsFor(name){return state.consumptions[norm(name)]||[]}
function consumedForCycle(name,cycleAt){
  const cycle=Number(cycleAt)||0;
  if(!cycle)return 0;
  return consumptionsFor(name).reduce((total,event)=>total+(Number(event.cycleAt)===cycle?Math.max(1,Number(event.qty)||1):0),0);
}
function adaptiveProfile(meta,household=readHousehold()){
  const base=baseRule(meta),events=eventsFor(meta.name),intervals=[];
  const householdFactor=clamp(Math.pow(2/Math.max(1,household),.42),.62,1.18);
  for(let i=1;i<events.length;i++){
    const days=(events[i].at-events[i-1].at)/DAY;
    if(days<.75)continue;
    const sampleHousehold=(Math.max(1,events[i-1].household||household)+Math.max(1,events[i].household||household))/2;
    const normalized=days/clamp(Math.pow(2/sampleHousehold,.42),.62,1.18);
    intervals.push(normalized*householdFactor);
  }
  const feedback=feedbackFor(meta.name).map(item=>{
    const sampleFactor=clamp(Math.pow(2/Math.max(1,item.household||household),.42),.62,1.18);
    return item.days/sampleFactor*householdFactor;
  }).filter(days=>days>=.15);
  const purchaseSamples=intervals.slice(-12),directSamples=feedback.slice(-12);
  const learned=[...purchaseSamples,...directSamples,...directSamples];
  const prior=base.days*householdFactor;
  let days=prior;
  if(learned.length>=2){
    const center=median(learned)||prior;
    const targetBase=quantile(learned,.4)||center;
    const mad=median(learned.map(value=>Math.abs(value-center)))||0;
    const stability=clamp(1-(mad/Math.max(1,center))*.55,.62,1);
    const target=targetBase*base.factor*stability;
    const evidence=purchaseSamples.length+directSamples.length*1.8;
    const confidence=clamp(.22+evidence*.11,.22,.9);
    days=prior*(1-confidence)+target*confidence;
    days=clamp(days,Math.max(1,prior*.32),Math.min(365,prior*3));
  }
  const quantities=events.slice(-10).map(event=>Math.max(1,Number(event.qty)||1));
  const typicalQty=median(quantities)||1,last=events.at(-1),lastQty=Math.max(1,Number(last?.qty)||1);
  if(last&&quantities.length>=2)days*=clamp(Math.sqrt(lastQty/Math.max(1,typicalQty)),.75,1.65);
  if(base.shelf>0)days=Math.min(days,base.shelf);
  const cycleAt=Number(last?.firstAt||last?.at)||0;
  const consumedQty=last?consumedForCycle(meta.name,cycleAt):0;
  return {
    days:Math.max(1,Math.round(days)),base,typicalQty,lastQty,cycleAt,consumedQty,
    purchaseSamples:purchaseSamples.length,feedbackSamples:directSamples.length
  };
}
function rebuild(household=readHousehold()){
  const products={};
  META.forEach((meta,key)=>{
    const events=eventsFor(meta.name),model=adaptiveProfile(meta,household);
    products[key]={
      name:meta.name,category:meta.category,sub:meta.sub,baseDays:model.base.days,recentDays:model.days,
      samples:model.purchaseSamples,feedbackSamples:model.feedbackSamples,lastAt:Number(events.at(-1)?.at)||0,
      cycleAt:model.cycleAt,lastQty:model.lastQty,consumedQty:model.consumedQty,
      stockQty:Math.max(0,model.lastQty-model.consumedQty),typicalQty:model.typicalQty,household
    };
  });
  state.products=products;state.household=household;state.updatedAt=Date.now();
}
function writeState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_){}
}
function persist(){prune();rebuild();writeState()}
function ensureModel(){
  const household=readHousehold();
  if(state.household!==household){rebuild(household);writeState()}
}
function record(name,qty=1,at=Date.now()){
  if(!isEnabled())return null;
  const meta=META.get(norm(name));if(!meta)return null;
  const key=norm(meta.name),events=Array.isArray(state.purchases[key])?state.purchases[key]:[],last=events.at(-1);
  const merges=Boolean(last&&at-last.at<=SAME_TRIP);
  if(merges){
    last.firstAt=Number(last.firstAt)||Number(last.at)||at;
    last.qty=Math.max(1,Number(last.qty)||1)+Math.max(1,Number(qty)||1);
    last.at=Math.max(last.at,at);last.household=readHousehold();
  }else{
    events.push({at,firstAt:at,qty:Math.max(1,Number(qty)||1),household:readHousehold()});
  }
  state.purchases[key]=events;persist();scheduleDish();return true;
}
function recordFeedback(name,at=Date.now()){
  if(!isEnabled())return;
  const meta=META.get(norm(name)),last=meta?eventsFor(meta.name).at(-1):null;if(!meta||!last)return;
  const days=(at-last.at)/DAY;if(days<.15)return;
  const key=norm(meta.name),events=Array.isArray(state.feedback[key])?state.feedback[key]:[],previous=events.at(-1);
  if(previous&&at-previous.at<6*60*60*1000)return;
  events.push({at,days,household:readHousehold()});state.feedback[key]=events.slice(-12);persist();
}
function profile(name){ensureModel();return state.products[norm(name)]||null}
function stockEstimate(name,at=Date.now()){
  const p=profile(name);if(!p?.lastAt)return null;
  const age=Math.max(0,(at-p.lastAt)/DAY);
  const consumedQty=consumedForCycle(name,p.cycleAt||p.lastAt);
  const afterExplicit=Math.max(0,Math.max(1,Number(p.lastQty)||1)-consumedQty);
  const ratio=age>=p.recentDays?0:Math.max(0,1-age/Math.max(1,p.recentDays));
  const estimatedQty=Math.max(0,Math.ceil(afterExplicit*ratio-1e-6));
  return {
    profile:p,ageDays:age,purchasedQty:p.lastQty,consumedQty,afterExplicitQty:afterExplicit,
    estimatedQty,cycleAt:p.cycleAt||p.lastAt
  };
}
function recent(name,at=Date.now(),requiredQty=1){
  if(!isEnabled())return null;
  const stock=stockEstimate(name,at);if(!stock)return null;
  const needed=Math.max(1,Math.ceil(Number(requiredQty)||1));
  if(stock.ageDays>=stock.profile.recentDays||stock.estimatedQty<needed)return null;
  return {...stock,requiredQty:needed};
}
function rowRequiredQty(row){
  const value=Number(row?.dataset?.recipeQuantity);
  return Number.isFinite(value)&&value>0?Math.ceil(value):1;
}
function watchDishConsumption(button){
  if(!isEnabled()){clearDishPending();return}
  const dialog=button?.closest?.('#dishDialog');
  if(!dialog||button.disabled){clearDishPending();return}
  const dish=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  if(!dish){clearDishPending();return}
  const now=Date.now();
  const items=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')].map(row=>{
    if(row.dataset.recentPurchaseDefault!=='1'||row.dataset.recentPurchaseOverride==='1'||row.getAttribute('aria-pressed')!=='false')return null;
    if(!row.classList.contains('is-recent-purchase'))return null;
    const name=String(row.dataset.ingredient||'').trim(),qty=rowRequiredQty(row);
    const match=name?recent(name,now,qty):null;
    if(!match)return null;
    return {name,qty,cycleAt:Number(match.cycleAt)||Number(match.profile?.lastAt)||0};
  }).filter(Boolean);
  clearDishPending();
  if(!items.length)return;
  dishPending={dish,items,at:now};
  dishPendingTimer=setTimeout(clearDishPending,DISH_WATCH_TTL);
}
function recordDishConsumptions(token,at=Date.now()){
  if(!isEnabled()||!token?.items?.length)return false;
  let changed=false;
  token.items.forEach(item=>{
    const meta=META.get(norm(item.name));if(!meta)return;
    const p=profile(meta.name);if(!p?.lastAt)return;
    const cycleAt=Number(item.cycleAt)||0;
    if(!cycleAt||Number(p.cycleAt||p.lastAt)!==cycleAt)return;
    const stock=stockEstimate(meta.name,at);if(!stock?.estimatedQty)return;
    const qty=Math.min(Math.max(1,Math.ceil(Number(item.qty)||1)),stock.estimatedQty);
    if(qty<=0)return;
    const key=norm(meta.name),events=Array.isArray(state.consumptions[key])?state.consumptions[key]:[];
    events.push({at,cycleAt,qty,dish:String(token.dish||'').trim().slice(0,100),household:readHousehold()});
    state.consumptions[key]=events.slice(-120);changed=true;
  });
  if(changed){persist();scheduleDish()}
  return changed;
}
function consumePurchaseSettled(event){
  if(!isEnabled())return;
  const detail=event?.detail||{};
  const name=String(detail.name||'').trim();
  if(!name)return;
  record(name,Math.max(1,Number(detail.quantity)||1));
}
function consumeDishAddSettled(event){
  if(!dishPending)return;
  const detail=event?.detail||{};
  const name=String(detail.name||'').trim();
  if(name&&norm(name)!==norm(dishPending.dish))return;
  const result=detail.result;
  if(!result||Number(result.failed)>0){clearDishPending();return}
  const token=dishPending;clearDishPending();recordDishConsumptions(token);
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
function clearRecent(row,restoreSelection=false){
  const autoDeselected=row.dataset.recentPurchaseDefault==='1',overridden=row.dataset.recentPurchaseOverride==='1';
  row.classList.remove('is-recent-purchase');delete row.dataset.recentPurchase;row.querySelector('.dish-ingredient-recent')?.remove();
  if(restoreSelection&&autoDeselected&&!overridden&&row.getAttribute('aria-pressed')==='false'&&!row.disabled){
    delete row.dataset.recentPurchaseDefault;row.click();
  }
}
function decorateDish(){
  const dialog=document.getElementById('dishDialog');if(!dialog?.open)return;
  const rows=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')];
  if(!isEnabled()){rows.forEach(row=>clearRecent(row,true));return}
  rows.forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    if(row.dataset.recentPurchaseOverride==='1'){clearRecent(row);return}
    const match=name&&!row.disabled&&!row.hasAttribute('disabled')&&recent(name,Date.now(),rowRequiredQty(row));
    if(!match){clearRecent(row,true);return}
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
function consumeRecentDishClick(event){
  if(!event.isTrusted)return;
  const row=event.target?.closest?.('#dishDialog .dish-ingredient.is-recent-purchase');if(!row)return;
  setTimeout(()=>{
    if(row.getAttribute('aria-pressed')!=='true')return;
    const name=String(row.dataset.ingredient||'');row.dataset.recentPurchaseOverride='1';clearRecent(row);recordFeedback(name);
  },0);
}
function bindHistoryEvents(){
  document.addEventListener('click',event=>{
    const dishAdd=event.target?.closest?.('#dishDialog .dish-sheet-add');
    if(dishAdd)watchDishConsumption(dishAdd);
  },true);
  document.addEventListener('courses:purchase-settled',consumePurchaseSettled);
  document.addEventListener('courses:dish-add-settled',consumeDishAddSettled);
}
function bindDishEvents(){
  document.addEventListener('courses:dish-ingredients-rendered',scheduleDish);
  document.addEventListener('courses:dish-quantities-updated',scheduleDish);
  document.addEventListener('courses:dish-availability-updated',scheduleDish);
  document.addEventListener('courses:dish-sheet-opened',scheduleDish);
  document.addEventListener('courses:quantities-ready',scheduleDish);
  document.addEventListener('click',consumeRecentDishClick,true);
  scheduleDish();
}
function bindHousehold(){
  document.addEventListener('click',event=>{
    if(!event.target?.closest?.('#savePreferences'))return;
    setTimeout(()=>{ensureModel();scheduleDish()},0);
  },true);
  window.addEventListener('storage',event=>{
    if(!HOUSEHOLD_KEYS.includes(event.key))return;
    ensureModel();scheduleDish();
  });
}
function init(){
  try{const p=navigator.storage?.persist?.();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_){}
  prune();rebuild();writeState();styles();installPreferenceToggle();bindHistoryEvents();bindDishEvents();bindHousehold();
  window.COURSES_PURCHASE_INTELLIGENCE=Object.freeze({
    retentionDays:HISTORY_DAYS,
    profileFor:name=>profile(name),
    stockFor:(name,at=Date.now())=>stockEstimate(name,at),
    isRecent:(name,qty=1)=>Boolean(recent(name,Date.now(),qty)),
    explain:(name,qty=1)=>recent(name,Date.now(),qty)||stockEstimate(name)||profile(name),
    isEnabled,setEnabled
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();