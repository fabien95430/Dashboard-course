(() => {
'use strict';

const recent=new Map();
function reportOnce(key,payload){
  const now=Date.now();
  const previous=recent.get(key)||0;
  if(now-previous<10000)return;
  recent.set(key,now);
  window.CoursesErrors?.report?.({key,...payload});
}
function inspect(node){
  if(!(node instanceof Element))return;
  const candidates=[];
  if(node.matches?.('.courses-openai-feedback,#toast'))candidates.push(node);
  node.querySelectorAll?.('.courses-openai-feedback,#toast').forEach(item=>candidates.push(item));
  candidates.forEach(item=>{
    if(!item.classList.contains('is-visible'))return;
    const text=String(item.textContent||'').trim();
    if(!text)return;
    if(text.startsWith('Notification requise')){
      const detail=text.split('—').slice(1).join('—').trim()||'La notification de fin ne peut pas être préparée.';
      reportOnce('notifications:'+detail.toLowerCase(),{
        severity:'error',source:'Notifications',title:'Notifications indisponibles',message:detail
      });
      return;
    }
    if(text.startsWith('Intégration OpenAI impossible')){
      const detail=text.split('—').slice(1).join('—').trim()||'La demande n’a pas pu être transmise.';
      reportOnce('integration-local:'+detail.toLowerCase(),{
        severity:'error',source:'Intégration',title:'Intégration impossible',message:detail,action:'open-missing'
      });
    }
  });
}
function start(){
  if(document.documentElement.dataset.coursesErrorFeedbackBridge==='1')return;
  document.documentElement.dataset.coursesErrorFeedbackBridge='1';
  inspect(document.body);
  new MutationObserver(records=>{
    records.forEach(record=>{
      if(record.type==='attributes')inspect(record.target);
      else record.addedNodes.forEach(inspect);
      if(record.type==='characterData')inspect(record.target.parentElement);
    });
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();

(() => {
'use strict';

function installProductImageFirstPaintStyles(){
  if(document.getElementById('courses-product-image-first-paint'))return;
  const style=document.createElement('style');
  style.id='courses-product-image-first-paint';
  style.textContent=`
    #listItems .premium-sprite.is-single-product-image{
      -webkit-clip-path:none!important;
      clip-path:none!important;
    }
    #listItems .premium-sprite.is-single-product-image>img{
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
    #listItems .premium-sprite.is-single-product-image.is-compact>img{
      transform:translate(var(--single-product-shift-x,0%),calc(1px + var(--single-product-shift-y,0%))) scale(var(--single-product-scale,1))!important;
    }
    #listItems .premium-sprite.is-list-image-loading>img{
      visibility:hidden!important;
    }
    #listItems .premium-sprite.is-list-image-loading>.sprite-fallback{
      display:grid!important;
      place-items:center!important;
    }
    #listItems .premium-sprite.is-list-image-loading .product-svg{
      width:100%!important;
      height:100%!important;
    }
  `;
  document.head.appendChild(style);
}
function prepareListImage(image){
  if(!(image instanceof HTMLImageElement)||!image.closest('#listItems'))return;
  image.loading='eager';
  image.decoding='sync';
  try{image.fetchPriority='high'}catch(_){}
  if(image.dataset.listFirstPaintBound==='1')return;
  image.dataset.listFirstPaintBound='1';
  const sprite=image.closest('.premium-sprite');
  if(!sprite)return;
  const showImage=()=>{
    image.hidden=false;
    sprite.classList.remove('is-list-image-loading','is-fallback');
  };
  const showFallback=()=>{
    image.hidden=true;
    sprite.classList.remove('is-list-image-loading');
    sprite.classList.add('is-fallback');
  };
  if(image.complete){
    if(image.naturalWidth>0)showImage();
    else showFallback();
    return;
  }
  sprite.classList.add('is-list-image-loading');
  image.addEventListener('load',showImage,{once:true});
  image.addEventListener('error',showFallback,{once:true});
}
function tuneListProductImages(root){
  if(!(root instanceof Element))return;
  if(root.matches?.('.premium-sprite.is-single-product-image>img'))prepareListImage(root);
  root.querySelectorAll?.('.premium-sprite.is-single-product-image>img').forEach(prepareListImage);
}
function startProductImageFirstPaint(){
  installProductImageFirstPaintStyles();
  const list=document.getElementById('listItems');
  if(!list||list.dataset.productImageFirstPaint==='1')return;
  list.dataset.productImageFirstPaint='1';
  tuneListProductImages(list);
  new MutationObserver(records=>{
    records.forEach(record=>record.addedNodes.forEach(node=>tuneListProductImages(node)));
  }).observe(list,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startProductImageFirstPaint,{once:true});
else startProductImageFirstPaint();
})();
