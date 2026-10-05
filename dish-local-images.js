(() => {
'use strict';

const APP_VERSION='v215';
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
  'Crème brûlée'
]);
const DISH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#eef1eb"/><ellipse cx="450" cy="330" rx="250" ry="170" fill="#f8f7f2" stroke="#cbd2c8" stroke-width="12"/><text x="450" y="350" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="30" font-weight="700" fill="#708076">Photo indisponible</text></svg>');
const PRODUCT_VISUALS=Object.freeze([
  './bring-photo-v5-frais.webp.png?v=15',
  './bring-photo-v5-fruits-legumes.webp.png?v=15',
  './bring-photo-v5-epicerie.webp.png?v=15',
  './bring-photo-v5-boissons.webp.png?v=15',
  './bring-photo-v5-maison.webp.png?v=15'
]);
const PRIMARY_DISH_VISUALS=Object.freeze([
  './www/Plats/spaghetti-carbonara.png',
  './www/Plats/spaghetti-bolognaise.png',
  './www/Plats/penne-poulet-creme.png',
  './www/Plats/pates-tomate-mozzarella.png',
  './www/Plats/lasagnes-bolognaise.png',
  './www/Plats/tagliatelles-saumon.png'
]);
const DISH_WARMUP_BATCH_SIZE=2;
const retainedVisuals=new Map();
const capturedDishVisuals=new Set(PRIMARY_DISH_VISUALS);
const warmedDishVisuals=new Set();
let renderedDishWarmupQueued=false;
let dishVisualWarmupRunning=false;
let dishUnlockObserver=null;
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

function syncPageVersions(){
  document.querySelectorAll('.page-header').forEach(header=>{
    const title=header.querySelector('h1');
    const badge=header.querySelector('.page-version');
    if(!title||!badge)return;
    if(badge.parentElement!==title)title.appendChild(badge);
    if(badge.textContent!==APP_VERSION)badge.textContent=APP_VERSION;
  });
  if(!document.getElementById('app-version-ui')){
    const style=document.createElement('style');
    style.id='app-version-ui';
    style.textContent='.catalog-view .page-header h1::after{content:none!important}.dish-card img[src^="https://images.pexels.com/"],.dish-sheet-photo[src^="https://images.pexels.com/"]{visibility:hidden!important}';
    document.head.appendChild(style);
  }
}

function installVisualWarmupStyle(){
  if(document.getElementById('courses-startup-visual-warmup'))return;
  const style=document.createElement('style');
  style.id='courses-startup-visual-warmup';
  style.textContent='html.courses-product-visuals-warming #listItems .list-icon{visibility:hidden!important}';
  document.head.appendChild(style);
}
function installMissingProductsFixes(){
  if(document.querySelector('script[data-missing-products-fixes]'))return;
  const script=document.createElement('script');
  script.src='./missing-products-fixes.js?v=1';
  script.defer=true;
  script.dataset.missingProductsFixes='1';
  document.head.appendChild(script);
}
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
async function warmProductVisuals(){
  document.documentElement.classList.add('courses-product-visuals-warming');
  try{
    const work=Promise.allSettled(PRODUCT_VISUALS.map(src=>warmVisual(src,'high')));
    await Promise.race([work,new Promise(resolve=>setTimeout(resolve,3500))]);
  }finally{
    document.documentElement.classList.remove('courses-product-visuals-warming');
  }
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
  if(appUnlocked()){
    void warmCapturedDishVisuals();
    return;
  }
  const app=document.getElementById('app');
  if(!app||dishUnlockObserver)return;
  dishUnlockObserver=new MutationObserver(()=>{
    if(!appUnlocked())return;
    dishUnlockObserver.disconnect();
    dishUnlockObserver=null;
    queueRenderedDishWarmup();
  });
  dishUnlockObserver.observe(app,{attributes:true,attributeFilter:['class']});
}
function warmRenderedDishCards(){
  const images=captureRenderedDishVisuals();
  if(!appUnlocked()){
    scheduleCapturedDishWarmup();
    return;
  }
  images.slice(0,8).forEach((image,index)=>{
    image.loading='eager';
    try{image.fetchPriority=index<4?'high':'auto'}catch(_){}
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
  return './www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+slug+'.png';
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

let gridObserver=null;
let dialogObserver=null;
let versionFrame=0;
const bootstrapObserver=new MutationObserver(()=>bind());
const versionObserver=new MutationObserver(()=>{
  if(versionFrame)return;
  versionFrame=requestAnimationFrame(()=>{
    versionFrame=0;
    syncPageVersions();
  });
});
const dishWarmupObserver=new MutationObserver(mutations=>{
  if(!mutations.some(mutation=>mutation.addedNodes.length))return;
  if(!document.querySelector('#dishes .dish-card img'))return;
  queueRenderedDishWarmup();
  dishWarmupObserver.disconnect();
});

function bind(){
  syncPageVersions();
  const grid=document.getElementById('dishes');
  if(grid&&!gridObserver){
    localizeCards(grid);
    gridObserver=new MutationObserver(()=>localizeCards(grid));
    gridObserver.observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  }
  const dialog=document.getElementById('dishDialog');
  if(dialog&&!dialogObserver){
    localizeDialog(dialog);
    dialogObserver=new MutationObserver(()=>localizeDialog(dialog));
    dialogObserver.observe(dialog,{attributes:true,subtree:true,attributeFilter:['open','src']});
  }
  if(gridObserver&&dialogObserver)bootstrapObserver.disconnect();
}

syncPageVersions();
installVisualWarmupStyle();
installMissingProductsFixes();
void warmProductVisuals();
scheduleDishVisualWarmup();
versionObserver.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
bootstrapObserver.observe(document.documentElement,{childList:true,subtree:true});
dishWarmupObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',event=>{
  if(event.target.closest?.('.catalog-mode[data-mode="dishes"],.tab[data-view="catalog"]'))setTimeout(queueRenderedDishWarmup,0);
},true);
window.addEventListener('online',retryLocalImages,{passive:true});
window.addEventListener('online',queueRenderedDishWarmup,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();