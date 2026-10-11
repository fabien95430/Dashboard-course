(() => {
'use strict';

const PRODUCT_NAMES=new Set(Object.values(window.COURSES_CATALOG?.groups||{}).flatMap(groups=>
  Object.values(groups||{}).flatMap(names=>Array.isArray(names)?names:[])
));
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
const warmedSources=new Set();
const visualScaleCache=new Map();

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
    };
    image.addEventListener('load',done,{once:true});
    image.addEventListener('error',done,{once:true});
    image.src=source;
  }
  scheduleProductWarmup();
}
function warmProductImages(){
  const queued=new Set(warmQueue);
  for(const name of PRODUCT_NAMES){
    const source=imageSource(name);
    if(warmedSources.has(source)||queued.has(source))continue;
    warmQueue.push(source);
    queued.add(source);
  }
  scheduleProductWarmup();
  return true;
}
window.COURSES_PRODUCT_IMAGES=Object.freeze({warm:warmProductImages});
function ensureStyles(){
  if(document.getElementById('courses-product-item-images-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-item-images-style';
  style.textContent=`
    .catalog-view .product .badge{
      width:27px!important;
      height:27px!important;
    }
    .premium-sprite.is-single-product-image{
      -webkit-clip-path:none!important;
      clip-path:none!important;
    }
    .catalog-view .product .media .premium-sprite{
      transform:translateY(9px)!important;
    }
    .catalog-view .product.has-single-product-image .media .premium-sprite.is-single-product-image{
      transform:translateY(14px)!important;
    }
    .premium-sprite.is-single-product-image>img{
      top:11%!important;
      left:11%!important;
      width:78%!important;
      height:78%!important;
      max-width:none!important;
      max-height:none!important;
      object-fit:contain!important;
      object-position:center!important;
      transform:translate(var(--single-product-shift-x,0%),calc(4px + var(--single-product-shift-y,0%))) scale(var(--single-product-scale,1))!important;
      transform-origin:center!important;
    }
    .premium-sprite.is-single-product-image.is-compact>img{
      transform:translate(var(--single-product-shift-x,0%),calc(1px + var(--single-product-shift-y,0%))) scale(var(--single-product-scale,1))!important;
    }
    @media(max-width:520px){
      .catalog-view .product .media{
        padding-right:0!important;
      }
    }
  `;
  document.head.appendChild(style);
}
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
function applyVisualScale(image,source){
  if(!image||!source)return;
  const cached=visualScaleCache.get(source);
  if(cached){
    image.style.setProperty('--single-product-scale',String(cached.scale));
    image.style.setProperty('--single-product-shift-x',cached.shiftX+'%');
    image.style.setProperty('--single-product-shift-y',cached.shiftY+'%');
    return;
  }
  try{
    const size=96,canvas=document.createElement('canvas');
    canvas.width=size;canvas.height=size;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)return;
    context.clearRect(0,0,size,size);
    context.drawImage(image,0,0,size,size);
    const pixels=context.getImageData(0,0,size,size).data;
    let minX=size,minY=size,maxX=-1,maxY=-1;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      if(pixels[(y*size+x)*4+3]<24)continue;
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
    if(maxX<minX||maxY<minY)return;
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
    image.style.setProperty('--single-product-scale',String(metrics.scale));
    image.style.setProperty('--single-product-shift-x',metrics.shiftX+'%');
    image.style.setProperty('--single-product-shift-y',metrics.shiftY+'%');
  }catch(_){}
}
function onSingleProductImageLoaded(image,source){
  image.closest('.premium-sprite')?.classList.remove('is-fallback');
  requestAnimationFrame(()=>applyVisualScale(image,source));
}
function decorateFallback(card,name,source,eager=false){
  const fallback=card.querySelector('.product-svg');
  if(!fallback||fallback.dataset.singleProductPending===source)return;
  fallback.dataset.singleProductPending=source;
  const compact=fallback.classList.contains('is-compact');
  const image=new Image();
  image.alt='';
  image.loading=eager?'eager':'lazy';
  image.decoding='async';
  image.dataset.singleProductSource=source;
  bindProductImageSettle(image);
  image.addEventListener('load',()=>{
    if(!fallback.isConnected)return;
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
  image.loading=eager?'eager':'lazy';
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
  document.addEventListener('courses:view-changed',event=>{if(event.detail?.view==='catalog')scheduleDecorateProducts()});
  document.addEventListener('courses:catalog-products-ready',warmProductImages);
}
function bind(){
  products=document.getElementById('products');
  listItems=document.getElementById('listItems');
  if(!products||!listItems)return false;
  ensureStyles();
  bindEvents();
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