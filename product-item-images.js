(() => {
'use strict';

const CATEGORY='Fruits & Légumes';
const groups=window.COURSES_CATALOG?.groups?.[CATEGORY]||{};
const PRODUCT_NAMES=new Set(Object.values(groups).flatMap(names=>Array.isArray(names)?names:[]));
let products=null;
let observer=null;

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
function ensureStyles(){
  if(document.getElementById('courses-product-item-images-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-item-images-style';
  style.textContent=`
    .premium-sprite.is-single-product-image{
      -webkit-clip-path:none!important;
      clip-path:none!important;
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
      transform:translateY(4px)!important;
    }
    .premium-sprite.is-single-product-image.is-compact>img{
      transform:translateY(1px)!important;
    }
  `;
  document.head.appendChild(style);
}
function decorateCard(card){
  const name=String(card?.dataset?.name||'');
  if(!PRODUCT_NAMES.has(name))return;
  const sprite=card.querySelector('.premium-sprite');
  const image=sprite?.querySelector(':scope > img');
  if(!sprite||!image)return;
  const source=imageSource(name);
  if(image.dataset.singleProductSource===source)return;
  image.dataset.singleProductSource=source;
  sprite.classList.add('is-single-product-image');
  sprite.classList.remove('is-fallback');
  image.addEventListener('load',()=>sprite.classList.remove('is-fallback'),{once:true});
  image.src=source;
}
function decorateProducts(){
  products?.querySelectorAll('.product[data-name]').forEach(decorateCard);
}
function bind(){
  products=document.getElementById('products');
  if(!products)return false;
  ensureStyles();
  decorateProducts();
  observer?.disconnect();
  observer=new MutationObserver(mutations=>{
    if(!mutations.some(mutation=>mutation.addedNodes.length))return;
    requestAnimationFrame(decorateProducts);
  });
  observer.observe(products,{childList:true,subtree:true});
  return true;
}
function init(){
  if(bind())return;
  const bootstrap=new MutationObserver(()=>{
    if(bind())bootstrap.disconnect();
  });
  bootstrap.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>bootstrap.disconnect(),10000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
