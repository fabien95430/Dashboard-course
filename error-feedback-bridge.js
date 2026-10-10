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

function forceListImagesEager(root){
  if(!(root instanceof Element))return;
  const images=[];
  if(root.matches?.('.premium-sprite.is-single-product-image>img'))images.push(root);
  root.querySelectorAll?.('.premium-sprite.is-single-product-image>img').forEach(image=>images.push(image));
  images.forEach(image=>{
    if(!image.closest('#listItems'))return;
    image.loading='eager';
  });
}
function startListImageWarmup(){
  const list=document.getElementById('listItems');
  if(!list||list.dataset.eagerImages==='1')return;
  list.dataset.eagerImages='1';
  forceListImagesEager(list);
  new MutationObserver(records=>{
    records.forEach(record=>record.addedNodes.forEach(node=>forceListImagesEager(node)));
  }).observe(list,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startListImageWarmup,{once:true});
else startListImageWarmup();
})();
