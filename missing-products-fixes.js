(()=>{
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const STORAGE_RUNNING='courses-missing-dishes-running-v1';
const CHATGPT_WEB_URL='https://chatgpt.com/';
const CHATGPT_APP_URL='chatgpt://';

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){
    return fallback;
  }
}
function readRunning(){
  const saved=readJson(STORAGE_RUNNING,[]);
  return new Set(Array.isArray(saved)?saved.map(String):[]);
}
function saveRunning(running){
  try{localStorage.setItem(STORAGE_RUNNING,JSON.stringify([...running]))}catch(_){}
}
function currentDishIds(){
  const saved=readJson(STORAGE_DISHES,[]);
  return new Set((Array.isArray(saved)?saved:[]).map(item=>String(item?.id||'')).filter(Boolean));
}
function pruneRunning(){
  const current=currentDishIds();
  const running=readRunning();
  let changed=false;
  [...running].forEach(id=>{
    if(current.has(id))return;
    running.delete(id);
    changed=true;
  });
  if(changed)saveRunning(running);
  return running;
}
function markRunning(id){
  if(!id)return;
  const running=readRunning();
  running.add(String(id));
  saveRunning(running);
}
function installStyle(){
  if(document.getElementById('missing-products-fixes-style'))return;
  const style=document.createElement('style');
  style.id='missing-products-fixes-style';
  style.textContent=`
    #missingProductsDialog #missingProductsList[hidden],
    #missingProductsDialog #missingDishesList[hidden]{display:none!important}
    #missingProductsDialog .missing-dish-progress{display:inline-flex!important;width:max-content!important;margin-top:1px;padding:4px 8px!important;border-radius:999px;background:#eef3ff!important;color:#41669b!important;font-size:10px!important;line-height:1.1!important;font-weight:800!important}
    #missingProductsDialog .missing-dish-integrate.is-running{opacity:.52!important}
  `;
  document.head.appendChild(style);
}
function decorateRows(dialog){
  const running=pruneRunning();
  dialog.querySelectorAll('[data-missing-dish-row]').forEach(row=>{
    const id=String(row.dataset.missingDishRow||'');
    const active=running.has(id);
    const copy=row.querySelector('.missing-product-copy');
    let progress=copy?.querySelector('.missing-dish-progress');
    if(active&&!progress&&copy){
      progress=document.createElement('small');
      progress.className='missing-dish-progress';
      progress.textContent='En cours…';
      copy.appendChild(progress);
    }
    if(!active&&progress)progress.remove();
    const button=row.querySelector('[data-integrate-missing-dish]');
    if(button){
      button.disabled=active;
      button.classList.toggle('is-running',active);
      button.setAttribute('aria-disabled',String(active));
    }
  });
}
function openNativeChatGpt(){
  let fallbackTimer=0;
  const stopFallback=()=>{
    if(document.visibilityState!=='hidden')return;
    clearTimeout(fallbackTimer);
    document.removeEventListener('visibilitychange',stopFallback);
  };
  document.addEventListener('visibilitychange',stopFallback);
  try{window.location.href=CHATGPT_APP_URL}catch(_){}
  fallbackTimer=setTimeout(()=>{
    document.removeEventListener('visibilitychange',stopFallback);
    if(document.visibilityState==='hidden')return;
    window.location.href=CHATGPT_WEB_URL;
  },1400);
  return {opener:null};
}
function armChatGptOpenOverride(){
  const nativeOpen=window.open;
  const patched=function(url,target,features){
    if(String(url||'').startsWith(CHATGPT_WEB_URL))return openNativeChatGpt();
    return nativeOpen.call(window,url,target,features);
  };
  window.open=patched;
  queueMicrotask(()=>{
    if(window.open===patched)window.open=nativeOpen;
  });
}
function bindDialog(dialog){
  if(!dialog||dialog.dataset.missingFixesBound==='1')return false;
  const categorySelect=dialog.querySelector('.missing-category-select');
  const dishesList=dialog.querySelector('#missingDishesList');
  if(!categorySelect||!dishesList)return false;
  dialog.dataset.missingFixesBound='1';

  categorySelect.addEventListener('click',event=>event.stopPropagation(),true);

  dialog.addEventListener('click',event=>{
    const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
    if(!integrate)return;
    if(integrate.matches('[data-integrate-missing-dish]')){
      const id=integrate.dataset.integrateMissingDish||'';
      markRunning(id);
      queueMicrotask(()=>decorateRows(dialog));
    }
    armChatGptOpenOverride();
  },true);

  const observer=new MutationObserver(()=>decorateRows(dialog));
  observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  dialog.addEventListener('close',()=>pruneRunning());
  decorateRows(dialog);
  return true;
}
function init(){
  installStyle();
  const dialog=document.getElementById('missingProductsDialog');
  if(bindDialog(dialog))return;
  const observer=new MutationObserver(()=>{
    if(bindDialog(document.getElementById('missingProductsDialog')))observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
