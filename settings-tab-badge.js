(() => {
'use strict';

const source=document.getElementById('settingsMissingProductsCount');
const tab=document.querySelector('.tabs .tab[data-view="settings"]');
if(!source||!tab)return;

const badge=document.createElement('i');
badge.className='settings-tab-badge';
badge.setAttribute('aria-hidden','true');
Object.assign(badge.style,{
  position:'absolute',
  minWidth:'18px',
  height:'18px',
  padding:'0 4px',
  border:'2px solid rgba(255,255,255,.98)',
  borderRadius:'999px',
  background:'#ff3b30',
  color:'#fff',
  boxSizing:'border-box',
  fontSize:'10px',
  lineHeight:'14px',
  fontStyle:'normal',
  fontWeight:'800',
  letterSpacing:'0',
  placeItems:'center',
  pointerEvents:'none',
  zIndex:'12',
  boxShadow:'0 2px 7px rgba(207,33,26,.24)'
});
tab.style.position='relative';
tab.appendChild(badge);

function positionBadge(){
  const icon=[...tab.children].find(node=>node.tagName==='svg');
  if(!icon)return;
  const tabRect=tab.getBoundingClientRect();
  const iconRect=icon.getBoundingClientRect();
  badge.style.left=(iconRect.right-tabRect.left-5)+'px';
  badge.style.top=(iconRect.top-tabRect.top-7)+'px';
}

async function syncAppIconBadge(count){
  if(typeof navigator.setAppBadge!=='function')return;
  try{
    if(count>0){
      await navigator.setAppBadge(count);
    }else if(typeof navigator.clearAppBadge==='function'){
      await navigator.clearAppBadge();
    }else{
      await navigator.setAppBadge(0);
    }
  }catch(_){}
}

function syncBadge(){
  const count=Math.max(0,Number(source.textContent)||0);
  badge.textContent=count>99?'99+':String(count);
  badge.style.display=count>0&&!source.hidden?'grid':'none';
  if(count>0&&!source.hidden)requestAnimationFrame(positionBadge);
  void syncAppIconBadge(count);
}

async function requestBadgePermission(){
  if(typeof navigator.setAppBadge!=='function'||!('Notification' in window)||Notification.permission!=='default')return;
  try{
    const permission=await Notification.requestPermission();
    if(permission==='granted')syncBadge();
  }catch(_){}
}

const missingProductsButton=document.getElementById('settingsMissingProductsBtn');
const addMissingProductButton=document.getElementById('addMissingProduct');
const missingProductName=document.getElementById('missingProductName');
missingProductsButton?.addEventListener('click',()=>{
  const count=Math.max(0,Number(source.textContent)||0);
  if(count>0)void requestBadgePermission();
});
addMissingProductButton?.addEventListener('click',()=>{
  if(String(missingProductName?.value||'').trim())void requestBadgePermission();
});

new MutationObserver(syncBadge).observe(source,{attributes:true,childList:true,characterData:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(positionBadge),{passive:true});
syncBadge();
})();

(() => {
'use strict';

const STORAGE_PREFERRED_SERVINGS='courses-dish-preferred-servings-v1';
const STORAGE_SERVINGS='courses-dish-servings-v1';
const STORAGE_PREFERRED_CATALOG_MODE='courses-catalog-preferred-mode-v1';
const STORAGE_CATALOG_MODE='courses-catalog-mode-v1';
const SERVING_OPTIONS=Object.freeze([2,4,5]);
const CATALOG_MODE_OPTIONS=Object.freeze(['products','dishes']);
const DEFAULT_SERVINGS=4;

function readPreferredServings(){
  try{
    const value=Number(localStorage.getItem(STORAGE_PREFERRED_SERVINGS));
    return SERVING_OPTIONS.includes(value)?value:DEFAULT_SERVINGS;
  }catch(_){
    return DEFAULT_SERVINGS;
  }
}

function persistPreferredServings(value){
  try{
    localStorage.setItem(STORAGE_PREFERRED_SERVINGS,String(value));
    localStorage.setItem(STORAGE_SERVINGS,String(value));
  }catch(_){}
}

function readPreferredCatalogMode(){
  try{
    const preferred=localStorage.getItem(STORAGE_PREFERRED_CATALOG_MODE);
    if(CATALOG_MODE_OPTIONS.includes(preferred))return preferred;
    return localStorage.getItem(STORAGE_CATALOG_MODE)==='dishes'?'dishes':'products';
  }catch(_){
    return 'products';
  }
}

function persistPreferredCatalogMode(value){
  if(!CATALOG_MODE_OPTIONS.includes(value))return;
  try{localStorage.setItem(STORAGE_PREFERRED_CATALOG_MODE,value)}catch(_){}
}

function syncDishServings(value){
  try{localStorage.setItem(STORAGE_SERVINGS,String(value))}catch(_){}
  const input=document.querySelector('.dish-servings-value');
  if(!input)return false;
  input.value=String(value);
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return true;
}

function watchDishServings(){
  const sync=()=>syncDishServings(readPreferredServings());
  if(sync())return;
  const observer=new MutationObserver(()=>{
    if(sync())observer.disconnect();
  });
  observer.observe(document.body,{childList:true,subtree:true});
}

function applyPreferredCatalogMode(){
  const catalogView=document.getElementById('catalogView');
  if(!catalogView?.classList.contains('is-active'))return false;
  const preferred=readPreferredCatalogMode();
  const button=document.querySelector(`.catalog-mode[data-mode="${preferred}"]`);
  if(!button)return false;
  if(!button.classList.contains('is-active'))button.click();
  return true;
}

function watchCatalogEntry(){
  const catalogView=document.getElementById('catalogView');
  if(!catalogView)return;
  let applied=false;
  const sync=()=>{
    if(!catalogView.classList.contains('is-active')){
      applied=false;
      return;
    }
    if(applied)return;
    applied=applyPreferredCatalogMode();
  };
  new MutationObserver(sync).observe(catalogView,{
    attributes:true,
    attributeFilter:['class'],
    childList:true,
    subtree:true
  });
  sync();
}

function initPreferencesExtras(){
  const dialog=document.getElementById('preferencesDialog');
  const startView=document.getElementById('preferencesStartView');
  const saveButton=document.getElementById('savePreferences');
  if(!dialog||!startView||!saveButton)return;

  const startField=startView.closest('.field');

  let catalogModeSelect=document.getElementById('preferencesCatalogMode');
  if(!catalogModeSelect){
    const field=document.createElement('label');
    field.className='field';
    field.innerHTML='<span>Ouverture du Catalogue</span><select id="preferencesCatalogMode" aria-label="Ouverture du Catalogue"><option value="products">Produits</option><option value="dishes">Plats</option></select>';
    startField?.after(field);
    catalogModeSelect=field.querySelector('select');
  }

  let servingsSelect=document.getElementById('preferencesServings');
  if(!servingsSelect){
    const field=document.createElement('label');
    field.className='field';
    field.innerHTML='<span>Nombre de personnes</span><select id="preferencesServings" aria-label="Nombre de personnes"><option value="2">2 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option></select>';
    (catalogModeSelect?.closest('.field')||startField)?.after(field);
    servingsSelect=field.querySelector('select');
  }
  if(!catalogModeSelect||!servingsSelect)return;

  const initialServings=readPreferredServings();
  const initialCatalogMode=readPreferredCatalogMode();
  persistPreferredServings(initialServings);
  persistPreferredCatalogMode(initialCatalogMode);
  servingsSelect.value=String(initialServings);
  catalogModeSelect.value=initialCatalogMode;
  watchDishServings();
  watchCatalogEntry();

  const syncSelects=()=>{
    servingsSelect.value=String(readPreferredServings());
    catalogModeSelect.value=readPreferredCatalogMode();
  };
  dialog.addEventListener('close',syncSelects);
  document.getElementById('settingsPreferencesBtn')?.addEventListener('click',syncSelects);
  saveButton.addEventListener('click',()=>{
    const nextServings=Number(servingsSelect.value);
    if(SERVING_OPTIONS.includes(nextServings)){
      persistPreferredServings(nextServings);
      syncDishServings(nextServings);
    }
    const nextCatalogMode=catalogModeSelect.value;
    if(CATALOG_MODE_OPTIONS.includes(nextCatalogMode)){
      persistPreferredCatalogMode(nextCatalogMode);
    }
  },true);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initPreferencesExtras,{once:true});
}else{
  initPreferencesExtras();
}
})();

(() => {
'use strict';
if(document.querySelector('script[data-missing-products-dishes]'))return;
const script=document.createElement('script');
script.src='./missing-products-dishes.js?v=1';
script.defer=true;
script.dataset.missingProductsDishes='1';
document.head.appendChild(script);
})();

(() => {
'use strict';
if(document.querySelector('script[data-missing-products-modern]'))return;
const script=document.createElement('script');
script.src='./missing-products-modern.js?v=1';
script.defer=true;
script.dataset.missingProductsModern='1';
document.head.appendChild(script);
})();

(() => {
'use strict';

function initMissingProductsDialogFrame(){
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return;

  const DIALOG_TOP='calc((100dvh - min(84dvh, 720px))/2 + 18px)';
  let floorHeight=0;
  let frame=0;

  function applyPosition(){
    dialog.style.top=DIALOG_TOP;
    dialog.style.bottom='auto';
    dialog.style.margin='0 auto';
  }

  function clearFrame(){
    if(frame){
      cancelAnimationFrame(frame);
      frame=0;
    }
    floorHeight=0;
    applyPosition();
    dialog.style.removeProperty('min-height');
  }

  function pinFrame(){
    frame=0;
    if(!dialog.open)return;
    applyPosition();
    const rect=dialog.getBoundingClientRect();
    floorHeight=Math.max(floorHeight,rect.height);
    dialog.style.minHeight=Math.ceil(floorHeight)+'px';
  }

  function scheduleFrame(){
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(pinFrame);
  }

  applyPosition();

  new MutationObserver(()=>{
    if(!dialog.open){
      clearFrame();
      return;
    }
    scheduleFrame();
  }).observe(dialog,{
    attributes:true,
    attributeFilter:['open','hidden','class'],
    childList:true,
    subtree:true
  });

  dialog.addEventListener('close',clearFrame);
  window.addEventListener('orientationchange',()=>{
    if(!dialog.open)return;
    clearFrame();
    requestAnimationFrame(scheduleFrame);
  },{passive:true});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initMissingProductsDialogFrame,{once:true});
}else{
  initMissingProductsDialogFrame();
}
})();

(() => {
'use strict';
if(document.querySelector('script[data-dish-added-marker]'))return;
const script=document.createElement('script');
script.src='./dish-added-marker.js?v=1';
script.defer=true;
script.dataset.dishAddedMarker='1';
document.head.appendChild(script);
})();