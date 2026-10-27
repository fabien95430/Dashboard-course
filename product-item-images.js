(() => {
'use strict';

const PRODUCT_NAMES=new Set(Object.values(window.COURSES_CATALOG?.groups||{}).flatMap(groups=>
  Object.values(groups||{}).flatMap(names=>Array.isArray(names)?names:[])
));
const PRODUCT_NAMES_DISPLAY_ORDER=[...PRODUCT_NAMES].sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
let products=null;
let listItems=null;
let productRefreshFrame=0;
let listRefreshFrame=0;
let eventsBound=false;
let productIdleFrame=0;
let productImagesIdle=false;
let warmQueue=[];
let warmScheduled=false;
let warmActive=0;
let warmCycleRequested=false;
const warmedSources=new Set();
const visualScaleCache=new Map();
const PRODUCT_WARM_VERSION_KEY='courses-product-images-warm-version-v1';
const VISUAL_SCALE_KEY='courses-product-visual-scale-v1';
let visualScaleSaveTimer=0;

const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

function imageSource(name){
  return './www/Items/'+slugify(name)+'.webp';
}
function currentAppVersion(){
  return String(window.COURSES_APP_VERSION||document.querySelector('.page-version')?.textContent||'').trim();
}
function storedWarmVersion(){
  try{return localStorage.getItem(PRODUCT_WARM_VERSION_KEY)||''}catch(_){return ''}
}
function saveWarmVersion(){
  const version=currentAppVersion();
  if(!version)return;
  try{localStorage.setItem(PRODUCT_WARM_VERSION_KEY,version)}catch(_){}
}
function markWarmCycleComplete(){
  if(!warmCycleRequested||warmQueue.length||warmActive)return;
  saveWarmVersion();
}
function scheduleProductWarmup(){
  if(warmScheduled||warmActive>=3||!warmQueue.length)return;
  warmScheduled=true;
  const run=()=>{
    warmScheduled=false;
    warmProductImagesStep();
  };
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:1200});
  else setTimeout(run,0);
}
function warmProductImagesStep(){
  while(warmActive<3&&warmQueue.length){
    const source=warmQueue.shift();
    if(!source||warmedSources.has(source))continue;
    warmActive+=1;
    const image=new Image();
    image.alt='';
    image.decoding='async';
    image.fetchPriority='low';
    const done=()=>{
      warmActive=Math.max(0,warmActive-1);
      warmedSources.add(source);
      scheduleProductWarmup();
      markWarmCycleComplete();
    };
    image.addEventListener('load',()=>measureVisualScale(image,source),{once:true});
    image.addEventListener('load',done,{once:true});
    image.addEventListener('error',done,{once:true});
    image.src=source;
  }
  scheduleProductWarmup();
  markWarmCycleComplete();
}
// Les visuels produits restent dans le cache persistant du service worker : ils sont chargés
// tout de suite et décodés avant affichage, pour qu'une catégorie apparaisse déjà prête.
function imageLoading(){
  return 'eager';
}
function queueProductWarmup(){
  warmCycleRequested=true;
  const queued=new Set(warmQueue);
  for(const name of PRODUCT_NAMES_DISPLAY_ORDER){
    const source=imageSource(name);
    if(warmedSources.has(source)||queued.has(source))continue;
    warmQueue.push(source);
    queued.add(source);
  }
  scheduleProductWarmup();
  markWarmCycleComplete();
}
function warmProductImages(){
  scheduleDecorateProducts();
  scheduleDecorateList();
  if(storedWarmVersion()===currentAppVersion())return true;
  queueProductWarmup();
  return true;
}
function loadVisualScaleCache(){
  try{
    const stored=JSON.parse(localStorage.getItem(VISUAL_SCALE_KEY)||'null');
    if(!stored||!stored.items||typeof stored.items!=='object')return;
    Object.entries(stored.items).forEach(([source,values])=>{
      if(Array.isArray(values)&&values.length===3&&values.every(Number.isFinite)){
        visualScaleCache.set(source,{scale:values[0],shiftX:values[1],shiftY:values[2]});
      }
    });
  }catch(_){}
}
function saveVisualScaleCacheSoon(){
  if(visualScaleSaveTimer)return;
  visualScaleSaveTimer=setTimeout(()=>{
    visualScaleSaveTimer=0;
    const version=currentAppVersion();
    if(!version)return;
    const items={};
    visualScaleCache.forEach((metrics,source)=>{items[source]=[metrics.scale,metrics.shiftX,metrics.shiftY]});
    try{localStorage.setItem(VISUAL_SCALE_KEY,JSON.stringify({version,items}))}catch(_){}
  },1500);
}
function visualScaleStyle(source){
  const metrics=visualScaleCache.get(source);
  return metrics?'--single-product-scale:'+metrics.scale+';--single-product-shift-x:'+metrics.shiftX+'%;--single-product-shift-y:'+metrics.shiftY+'%':'';
}
loadVisualScaleCache();
window.COURSES_PRODUCT_IMAGES=Object.freeze({warm:warmProductImages,visualScaleStyle});
function productCardVisible(card){
  if(!card||card.hidden||products?.classList.contains('is-catalog-mode-hidden'))return false;
  const rect=card.getBoundingClientRect?.();
  if(!rect)return false;
  const viewport=window.innerHeight||document.documentElement.clientHeight||0;
  return rect.bottom>=0&&rect.top<=viewport;
}
function publishProductImagesIdle(){
  if(!document.getElementById('catalogView')?.classList.contains('is-active'))return;
  const cards=[...(products?.querySelectorAll('.product[data-name]')||[])].filter(productCardVisible);
  const pending=cards.some(card=>{
    const image=card.querySelector('.premium-sprite>img');
    if(image&&!image.complete)return true;
    return Boolean(card.querySelector('.product-svg[data-single-product-pending]'));
  });
  if(pending){productImagesIdle=false;return}
  if(productImagesIdle)return;
  productImagesIdle=true;
  document.dispatchEvent(new CustomEvent('courses:product-images-idle',{detail:{visible:cards.length}}));
}
function scheduleProductImagesIdleCheck(){
  if(productIdleFrame)return;
  productIdleFrame=requestAnimationFrame(()=>{
    productIdleFrame=0;
    publishProductImagesIdle();
  });
}
function bindProductImageSettle(image){
  if(!image||image.dataset.productImageSettleBound==='1')return;
  image.dataset.productImageSettleBound='1';
  image.addEventListener('load',scheduleProductImagesIdleCheck);
  image.addEventListener('error',scheduleProductImagesIdleCheck);
}
function measureVisualScale(image,source){
  try{
    const size=96,canvas=document.createElement('canvas');
    canvas.width=size;canvas.height=size;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)return null;
    context.clearRect(0,0,size,size);
    context.drawImage(image,0,0,size,size);
    const pixels=context.getImageData(0,0,size,size).data;
    let minX=size,minY=size,maxX=-1,maxY=-1;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      if(pixels[(y*size+x)*4+3]<24)continue;
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
    if(maxX<minX||maxY<minY)return null;
    const occupancy=Math.max((maxX-minX+1)/size,(maxY-minY+1)/size);
    const scale=Math.max(.94,Math.min(1.45,.90/Math.max(.01,occupancy)));
    const centerX=(minX+maxX+1)/(2*size);
    const centerY=(minY+maxY+1)/(2*size);
    const shiftX=Math.max(-18,Math.min(18,(.5-centerX)*100*scale));
    const shiftY=Math.max(-18,Math.min(18,(.5-centerY)*100*scale));
    const metrics={
      scale:Math.round(scale*1000)/1000,
      shiftX:Math.round(shiftX*10)/10,
      shiftY:Math.round(shiftY*10)/10,
    };
    visualScaleCache.set(source,metrics);
    saveVisualScaleCacheSoon();
    return metrics;
  }catch(_){return null}
}
function setVisualScale(image,metrics){
  image.style.setProperty('--single-product-scale',String(metrics.scale));
  image.style.setProperty('--single-product-shift-x',metrics.shiftX+'%');
  image.style.setProperty('--single-product-shift-y',metrics.shiftY+'%');
}
// Cadrages déjà connus : appliqués sans attendre l'arrivée de la pastille ni l'ouverture du
// Catalogue, pour que les images ne changent pas de taille après la première image affichée.
function applyCachedVisualScales(){
  products?.querySelectorAll('.premium-sprite.is-single-product-image>img[data-single-product-source]').forEach(image=>{
    if(image.style.getPropertyValue('--single-product-scale'))return;
    const cached=visualScaleCache.get(image.dataset.singleProductSource);
    if(cached)setVisualScale(image,cached);
  });
}
// Mesurer un cadrage décode l'image : seules les cartes visibles sont mesurées tout de suite,
// les autres le sont par petits lots quand le navigateur est libre (aucun effet visible).
const pendingVisualMeasures=new Map();
let visualMeasureScheduled=false;
function measurePendingVisualScales(deadline){
  visualMeasureScheduled=false;
  let first=true;
  for(const [image,source] of pendingVisualMeasures){
    // Une image par passage au minimum, puis seulement tant qu'il reste du temps libre.
    if(!first&&!(deadline?.timeRemaining?.()>12))break;
    first=false;
    pendingVisualMeasures.delete(image);
    if(!image.isConnected||!image.complete||!image.naturalWidth)continue;
    const metrics=visualScaleCache.get(source)||measureVisualScale(image,source);
    if(metrics)setVisualScale(image,metrics);
  }
  scheduleVisualMeasures();
}
function scheduleVisualMeasures(){
  if(visualMeasureScheduled||!pendingVisualMeasures.size)return;
  visualMeasureScheduled=true;
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(measurePendingVisualScales,{timeout:1500});
  else setTimeout(measurePendingVisualScales,50);
}
function applyVisualScale(image,source){
  if(!image||!source)return;
  const cached=visualScaleCache.get(source);
  if(cached){setVisualScale(image,cached);return}
  const card=image.closest('#products .product');
  if(card&&!productCardVisible(card)){
    pendingVisualMeasures.set(image,source);
    scheduleVisualMeasures();
    return;
  }
  const metrics=measureVisualScale(image,source);
  if(metrics)setVisualScale(image,metrics);
}
function onSingleProductImageLoaded(image,source){
  image.closest('.premium-sprite')?.classList.remove('is-fallback');
  applyVisualScale(image,source);
}
function decorateFallback(card,name,source,eager=false){
  const fallback=card.querySelector('.product-svg');
  if(!fallback||fallback.dataset.singleProductPending===source)return;
  fallback.dataset.singleProductPending=source;
  const compact=fallback.classList.contains('is-compact');
  const image=new Image();
  image.alt='';
  image.loading=imageLoading(source,eager);
  image.decoding='sync';
  image.dataset.singleProductSource=source;
  bindProductImageSettle(image);
  image.addEventListener('load',()=>{
    if(!fallback.isConnected)return;
    applyVisualScale(image,source);
    const sprite=document.createElement('span');
    sprite.className='premium-sprite is-single-product-image'+(compact?' is-compact':'');
    sprite.appendChild(image);
    fallback.replaceWith(sprite);
    card.classList.add('has-single-product-image');
    onSingleProductImageLoaded(image,source);
  },{once:true});
  image.addEventListener('error',()=>{
    delete fallback.dataset.singleProductPending;
  },{once:true});
  image.src=source;
}
function decorateCard(card,eager=false){
  const name=String(card?.dataset?.name||'');
  if(!PRODUCT_NAMES.has(name))return;
  const source=imageSource(name);
  const sprite=card.querySelector('.premium-sprite');
  const image=sprite?.querySelector(':scope > img');
  bindProductImageSettle(image);
  if(!sprite||!image){decorateFallback(card,name,source,eager);return;}
  card.classList.add('has-single-product-image');
  sprite.classList.add('is-single-product-image');
  image.loading=imageLoading(source,eager);
  if(image.decoding!=='sync')image.decoding='sync';
  const loaded=()=>onSingleProductImageLoaded(image,source);
  if(image.dataset.singleProductSource!==source){image.dataset.singleProductSource=source;image.src=source;}
  if(image.complete&&image.naturalWidth>0)loaded();
  else image.addEventListener('load',loaded,{once:true});
}
function decorateProducts(){
  if(!document.getElementById('catalogView')?.classList.contains('is-active'))return;
  productImagesIdle=false;
  if(!products?.classList.contains('is-catalog-mode-hidden')){
    products?.querySelectorAll('.product[data-name]:not([hidden])').forEach(card=>decorateCard(card,false));
  }
  scheduleProductImagesIdleCheck();
}
function decorateList(){
  listItems?.querySelectorAll('.list-row[data-name]').forEach(card=>decorateCard(card,true));
}
function scheduleDecorateProducts(){
  if(productRefreshFrame)return;
  productRefreshFrame=requestAnimationFrame(()=>{
    productRefreshFrame=0;
    applyCachedVisualScales();
    decorateProducts();
  });
}
function scheduleDecorateList(){
  if(listRefreshFrame)return;
  listRefreshFrame=requestAnimationFrame(()=>{
    listRefreshFrame=0;
    decorateList();
  });
}
function bindEvents(){
  if(eventsBound)return;
  eventsBound=true;
  document.addEventListener('courses:products-updated',scheduleDecorateProducts);
  document.addEventListener('courses:list-rendered',scheduleDecorateList);
  document.addEventListener('courses:view-changed',event=>{
    if(event.detail?.view!=='catalog')return;
    applyCachedVisualScales();
    // Laisser la pastille de navigation finir sa course avant de parcourir la grille.
    const nav=window.COURSES_BOTTOM_NAV;
    if(typeof nav?.afterSettle==='function')nav.afterSettle(scheduleDecorateProducts);
    else scheduleDecorateProducts();
  });
  document.addEventListener('courses:catalog-products-ready',warmProductImages);
}
function bind(){
  products=document.getElementById('products');
  listItems=document.getElementById('listItems');
  if(!products||!listItems)return false;
  bindEvents();
  applyCachedVisualScales();
  decorateList();
  if(window.COURSES_CATALOG_PRODUCTS_READY)warmProductImages();
  return true;
}
function init(){
  bind();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();