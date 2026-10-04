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
const SERVING_OPTIONS=Object.freeze([2,4,5]);
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

function initPreferredServings(){
  const dialog=document.getElementById('preferencesDialog');
  const startView=document.getElementById('preferencesStartView');
  const saveButton=document.getElementById('savePreferences');
  if(!dialog||!startView||!saveButton)return;

  let select=document.getElementById('preferencesServings');
  if(!select){
    const field=document.createElement('label');
    field.className='field';
    field.innerHTML='<span>Nombre de personnes</span><select id="preferencesServings" aria-label="Nombre de personnes"><option value="2">2 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option></select>';
    startView.closest('.field')?.after(field);
    select=field.querySelector('select');
  }
  if(!select)return;

  const initial=readPreferredServings();
  persistPreferredServings(initial);
  select.value=String(initial);
  watchDishServings();

  const syncSelect=()=>{select.value=String(readPreferredServings())};
  dialog.addEventListener('close',syncSelect);
  document.getElementById('settingsPreferencesBtn')?.addEventListener('click',syncSelect);
  saveButton.addEventListener('click',()=>{
    const next=Number(select.value);
    if(!SERVING_OPTIONS.includes(next))return;
    persistPreferredServings(next);
    syncDishServings(next);
  },true);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initPreferredServings,{once:true});
}else{
  initPreferredServings();
}
})();
