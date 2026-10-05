(() => {
'use strict';

const APP_VERSION='v203';
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
  'Velouté carottes'
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
const retainedVisuals=new Map();
let renderedDishWarmupQueued=false;
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
function warmRenderedDishCards(){
  const images=[...document.querySelectorAll('#dishes .dish-card img')].slice(0,8);
  images.forEach((image,index)=>{
    image.loading='eager';
    try{image.fetchPriority=index<4?'high':'auto'}catch(_){}
    if(typeof image.decode==='function')void image.decode().catch(()=>{});
  });
}
function queueRenderedDishWarmup(){
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
let listSwipeObserver=null;
function loadListSwipe(){
  if(document.querySelector('script[data-list-swipe]')){
    listSwipeObserver?.disconnect();
    listSwipeObserver=null;
    return;
  }
  const app=document.getElementById('app');
  if(!app||app.classList.contains('is-locked')){
    if(app&&!listSwipeObserver){
      listSwipeObserver=new MutationObserver(()=>{
        if(app.classList.contains('is-locked'))return;
        listSwipeObserver.disconnect();
        listSwipeObserver=null;
        loadListSwipe();
      });
      listSwipeObserver.observe(app,{attributes:true,attributeFilter:['class']});
    }
    return;
  }
  const script=document.createElement('script');
  script.src='./list-swipe.js?v=1';
  script.async=false;
  script.dataset.listSwipe='1';
  document.body.appendChild(script);
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
void warmProductVisuals();
scheduleDishVisualWarmup();
versionObserver.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
bootstrapObserver.observe(document.documentElement,{childList:true,subtree:true});
dishWarmupObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',event=>{
  if(event.target.closest?.('.catalog-mode[data-mode="dishes"],.tab[data-view="catalog"]'))setTimeout(queueRenderedDishWarmup,0);
},true);
window.addEventListener('online',retryLocalImages,{passive:true});
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bind,{once:true});
  document.addEventListener('DOMContentLoaded',loadListSwipe,{once:true});
}else{
  bind();
  loadListSwipe();
}
})();
