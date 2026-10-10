(() => {
'use strict';

const APP_VERSION='v411';
window.COURSES_APP_VERSION=APP_VERSION;

const SPECIAL_SLUGS=Object.freeze({
  'Tagliatelles au saumon':'tagliatelles-saumon',
  'Gratin de courgettes':'gratin-courgettes',
  'Poulet pommes de terre au four':'poulet-pommes-de-terre-four'
});
const CHILD_DISHES=new Set([
  'Boulettes riz',
  'Coquillettes jambon',
  'Couscous poulet légumes',
  'Gratin pommes de terre',
  'Pâtes jambon',
  'Purée carotte poulet',
  'Risotto poulet',
  'Saumon brocoli',
  'Steak frites',
  'Velouté carottes',
  'Crème brûlée',
  'Riz au lait'
]);
const DISH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#eef1eb"/><ellipse cx="450" cy="330" rx="250" ry="170" fill="#f8f7f2" stroke="#cbd2c8" stroke-width="12"/><text x="450" y="350" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="30" font-weight="700" fill="#708076">Photo indisponible</text></svg>');
const PRIMARY_DISH_VISUALS=Object.freeze([
  './www/Plats/spaghetti-carbonara.png?v='+APP_VERSION,
  './www/Plats/spaghetti-bolognaise.png?v='+APP_VERSION,
  './www/Plats/penne-poulet-creme.png?v='+APP_VERSION,
  './www/Plats/pates-tomate-mozzarella.png?v='+APP_VERSION,
  './www/Plats/lasagnes-bolognaise.png?v='+APP_VERSION,
  './www/Plats/tagliatelles-saumon.png?v='+APP_VERSION
]);
const DISH_WARMUP_BATCH_SIZE=2;
const retainedVisuals=new Map();
const capturedDishVisuals=new Set(PRIMARY_DISH_VISUALS);
const warmedDishVisuals=new Set();
let renderedDishWarmupQueued=false;
let dishVisualWarmupRunning=false;
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

async function warmVisual(src,priority='auto'){
  if(retainedVisuals.has(src))return true;
  const image=new Image();
  image.decoding='async';
  try{image.fetchPriority=priority}catch(_){}
  image.src=src;
  try{
    if(typeof image.decode==='function')await image.decode();
    else await new Promise(resolve=>{
      if(image.complete){resolve();return}
      image.onload=resolve;
      image.onerror=resolve;
    });
    retainedVisuals.set(src,image);
    return true;
  }catch(_){return false}
}
function scheduleDishVisualWarmup(){
  const run=()=>{void Promise.allSettled(PRIMARY_DISH_VISUALS.map(src=>warmVisual(src,'low')))};
  if('requestIdleCallback' in window)window.requestIdleCallback(run,{timeout:1800});
  else setTimeout(run,500);
}
function captureRenderedDishVisuals(){
  const images=[...document.querySelectorAll('#dishes .dish-card img')];
  images.forEach(image=>{
    const src=image.getAttribute('src')||'';
    if(src&&!src.startsWith('data:'))capturedDishVisuals.add(src);
  });
  return images;
}
function appUnlocked(){
  const app=document.getElementById('app');
  return Boolean(app&&!app.classList.contains('is-locked'));
}
function waitForDishWarmupSlot(){
  return new Promise(resolve=>{
    if('requestIdleCallback' in window)window.requestIdleCallback(()=>resolve(),{timeout:900});
    else setTimeout(resolve,120);
  });
}
async function warmDishSource(src){
  if(warmedDishVisuals.has(src))return true;
  const warmed=await warmVisual(src,'low');
  if(warmed)warmedDishVisuals.add(src);
  return warmed;
}
async function warmCapturedDishVisuals(){
  if(dishVisualWarmupRunning||!appUnlocked())return;
  dishVisualWarmupRunning=true;
  try{
    const sources=[...capturedDishVisuals];
    for(let index=0;index<sources.length;index+=DISH_WARMUP_BATCH_SIZE){
      await waitForDishWarmupSlot();
      const batch=sources.slice(index,index+DISH_WARMUP_BATCH_SIZE).filter(src=>!warmedDishVisuals.has(src));
      if(batch.length)await Promise.allSettled(batch.map(warmDishSource));
    }
  }finally{
    dishVisualWarmupRunning=false;
  }
}
function scheduleCapturedDishWarmup(){
  captureRenderedDishVisuals();
  if(appUnlocked())void warmCapturedDishVisuals();
}
function warmRenderedDishCards(){
  const images=captureRenderedDishVisuals();
  if(!appUnlocked()){
    scheduleCapturedDishWarmup();
    return;
  }
  images.slice(0,8).forEach((image,index)=>{
    image.loading='eager';
    try{image.fetchPriority=index<4?'high':'auto'}catch(_){ }
    if(typeof image.decode==='function')void image.decode().catch(()=>{});
  });
  scheduleCapturedDishWarmup();
}
function queueRenderedDishWarmup(){
  captureRenderedDishVisuals();
  if(renderedDishWarmupQueued)return;
  renderedDishWarmupQueued=true;
  requestAnimationFrame(()=>{
    renderedDishWarmupQueued=false;
    warmRenderedDishCards();
  });
}

function localDishImage(name){
  const slug=SPECIAL_SLUGS[name]||slugify(name);
  return './www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+slug+'.png?v='+encodeURIComponent(APP_VERSION);
}
function sameImageSource(image,source){
  const current=image?.getAttribute?.('src')||'';
  if(current===source)return true;
  try{return image.src===new URL(source,document.baseURI).href}catch(_){return false}
}
function bindImageFallback(image){
  if(!image||image.dataset.localImageFallbackBound==='1')return;
  image.dataset.localImageFallbackBound='1';
  image.addEventListener('error',()=>{
    const name=image.dataset.localDish||'';
    if(!name)return;
    const current=image.getAttribute('src')||'';
    if(!sameImageSource(image,localDishImage(name))&&current!==DISH_PLACEHOLDER)return;
    image.dataset.localImageFailed=name;
    if(current!==DISH_PLACEHOLDER)image.src=DISH_PLACEHOLDER;
  });
}
function localizeImage(image,name){
  if(!name||!image)return;
  bindImageFallback(image);
  const source=localDishImage(name);
  const current=image.getAttribute('src')||'';
  if(image.dataset.localImageFailed===name&&current===DISH_PLACEHOLDER){
    image.dataset.localDish=name;
    return;
  }
  image.dataset.localDish=name;
  if(sameImageSource(image,source))return;
  delete image.dataset.localImageFailed;
  image.src=source;
}
function localizeCard(card){
  const name=card?.dataset?.dish||'';
  const image=card?.querySelector?.('.dish-visual img');
  localizeImage(image,name);
}
function localizeCards(grid){
  grid?.querySelectorAll?.('.dish-card').forEach(localizeCard);
}
function localizeDialog(dialog){
  if(!dialog?.open)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const image=dialog.querySelector('.dish-sheet-photo');
  localizeImage(image,name);
}
function retryLocalImages(){
  const grid=document.getElementById('dishes');
  grid?.querySelectorAll?.('.dish-card img').forEach(image=>delete image.dataset.localImageFailed);
  const dialog=document.getElementById('dishDialog');
  const dialogImage=dialog?.querySelector?.('.dish-sheet-photo');
  if(dialogImage)delete dialogImage.dataset.localImageFailed;
  localizeCards(grid);
  localizeDialog(dialog);
}

function bind(){
  localizeCards(document.getElementById('dishes'));
  localizeDialog(document.getElementById('dishDialog'));
}

scheduleDishVisualWarmup();
document.addEventListener('courses:dishes-rendered',()=>{
  localizeCards(document.getElementById('dishes'));
  queueRenderedDishWarmup();
});
document.addEventListener('courses:dish-sheet-opened',()=>localizeDialog(document.getElementById('dishDialog')));
document.addEventListener('courses:catalog-mode-ready',event=>{if(event.detail?.mode==='dishes')queueRenderedDishWarmup()});
document.addEventListener('courses:view-changed',event=>{if(event.detail?.view==='catalog')queueRenderedDishWarmup()});
document.addEventListener('courses:lock-changed',event=>{if(event.detail?.locked===false)queueRenderedDishWarmup()});
window.addEventListener('online',retryLocalImages,{passive:true});
window.addEventListener('online',queueRenderedDishWarmup,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();