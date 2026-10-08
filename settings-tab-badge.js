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
const DOCUMENTATION_URL='./docs/guide-fonctionnement-courses.pdf?v=299';

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

  let documentationButton=document.getElementById('preferencesDocumentation');
  if(!documentationButton){
    documentationButton=document.createElement('button');
    documentationButton.id='preferencesDocumentation';
    documentationButton.type='button';
    documentationButton.className='secondary';
    documentationButton.textContent='Documentation';
    documentationButton.setAttribute('aria-label','Ouvrir la documentation PDF');
    saveButton.before(documentationButton);
    documentationButton.addEventListener('click',()=>{
      const link=document.createElement('a');
      link.href=DOCUMENTATION_URL;
      link.target='_blank';
      link.rel='noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

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
script.src='./missing-products-dishes.js?v=4';
script.defer=true;
script.dataset.missingProductsDishes='1';
document.head.appendChild(script);
})();

(() => {
'use strict';
if(document.querySelector('script[data-missing-products-modern]'))return;
const script=document.createElement('script');
script.src='./missing-products-modern.js?v=6';
script.defer=true;
script.dataset.missingProductsModern='1';
document.head.appendChild(script);
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

(() => {
'use strict';

const PREFERENCE_DIALOG_SELECTOR='#preferencesDialog,#missingProductsDialog,.recipe-customization-dialog';
const PREFERENCE_KEYBOARD_INPUT_TYPES=new Set(['text','search','number','email','url','tel','password']);
const preferenceKeyboardLocks=new WeakSet();
const preferenceKeyboardUnlockTimers=new WeakMap();

function preferenceDialogFor(target){
  return target?.closest?.(PREFERENCE_DIALOG_SELECTOR)||null;
}
function isPreferenceKeyboardField(target){
  if(!target?.matches)return false;
  if(target.matches('textarea,[contenteditable="true"]'))return true;
  if(!target.matches('input'))return false;
  return PREFERENCE_KEYBOARD_INPUT_TYPES.has(String(target.type||'text').toLowerCase());
}
function clearPreferenceKeyboardUnlock(dialog){
  const timer=preferenceKeyboardUnlockTimers.get(dialog);
  if(timer){
    clearTimeout(timer);
    preferenceKeyboardUnlockTimers.delete(dialog);
  }
}
function lockPreferenceDialog(dialog){
  if(!dialog?.open)return;
  clearPreferenceKeyboardUnlock(dialog);
  if(preferenceKeyboardLocks.has(dialog))return;
  const rect=dialog.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0)return;
  dialog.style.setProperty('--preference-dialog-lock-top',rect.top+'px');
  dialog.style.setProperty('--preference-dialog-lock-left',rect.left+'px');
  dialog.style.setProperty('--preference-dialog-lock-width',rect.width+'px');
  dialog.style.setProperty('--preference-dialog-lock-height',rect.height+'px');
  dialog.classList.add('is-preference-keyboard-locked');
  preferenceKeyboardLocks.add(dialog);
}
function unlockPreferenceDialog(dialog){
  if(!dialog)return;
  clearPreferenceKeyboardUnlock(dialog);
  dialog.classList.remove('is-preference-keyboard-locked');
  dialog.style.removeProperty('--preference-dialog-lock-top');
  dialog.style.removeProperty('--preference-dialog-lock-left');
  dialog.style.removeProperty('--preference-dialog-lock-width');
  dialog.style.removeProperty('--preference-dialog-lock-height');
  preferenceKeyboardLocks.delete(dialog);
}
function schedulePreferenceDialogUnlock(dialog){
  if(!dialog||!preferenceKeyboardLocks.has(dialog))return;
  clearPreferenceKeyboardUnlock(dialog);
  const timer=setTimeout(()=>{
    preferenceKeyboardUnlockTimers.delete(dialog);
    const active=document.activeElement;
    if(dialog.open&&dialog.contains(active)&&isPreferenceKeyboardField(active))return;
    unlockPreferenceDialog(dialog);
  },450);
  preferenceKeyboardUnlockTimers.set(dialog,timer);
}
function bindPreferenceKeyboardStability(){
  if(document.documentElement.dataset.preferenceKeyboardStability==='1')return;
  document.documentElement.dataset.preferenceKeyboardStability='1';
  document.addEventListener('pointerdown',event=>{
    if(!isPreferenceKeyboardField(event.target))return;
    lockPreferenceDialog(preferenceDialogFor(event.target));
  },true);
  document.addEventListener('focusin',event=>{
    if(!isPreferenceKeyboardField(event.target))return;
    lockPreferenceDialog(preferenceDialogFor(event.target));
  },true);
  document.addEventListener('focusout',event=>{
    if(!isPreferenceKeyboardField(event.target))return;
    schedulePreferenceDialogUnlock(preferenceDialogFor(event.target));
  },true);
  document.addEventListener('close',event=>{
    const dialog=event.target?.matches?.(PREFERENCE_DIALOG_SELECTOR)?event.target:null;
    if(dialog)unlockPreferenceDialog(dialog);
  },true);
}

function installPreferenceDialogAppearance(){
  if(document.getElementById('preferences-dialog-appearance'))return;
  const style=document.createElement('style');
  style.id='preferences-dialog-appearance';
  style.textContent=`
    #preferencesDialog,
    #missingProductsDialog,
    .recipe-customization-dialog{
      width:min(calc(100% - 28px),430px)!important;
      height:min(590px,calc(100vh - max(48px,env(safe-area-inset-top)) - max(48px,env(safe-area-inset-bottom))))!important;
      height:min(590px,calc(100svh - max(48px,env(safe-area-inset-top)) - max(48px,env(safe-area-inset-bottom))))!important;
      max-height:min(590px,calc(100vh - max(48px,env(safe-area-inset-top)) - max(48px,env(safe-area-inset-bottom))))!important;
      max-height:min(590px,calc(100svh - max(48px,env(safe-area-inset-top)) - max(48px,env(safe-area-inset-bottom))))!important;
      inset:0!important;
      margin:auto!important;
      padding:20px!important;
      border-radius:26px!important;
      box-sizing:border-box;
      overflow:hidden!important;
      overscroll-behavior:contain;
    }
    #preferencesDialog[open],
    #missingProductsDialog[open],
    .recipe-customization-dialog[open]{
      display:flex!important;
      flex-direction:column!important;
    }
    .preference-dialog-scroll{
      flex:1 1 auto;
      min-height:0;
      overflow:auto;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
    }
    #missingProductsDialog .missing-products-header,
    #missingProductsDialog .missing-mode-switch,
    #missingProductsDialog .missing-products-add,
    #missingProductsDialog .missing-category-panel,
    #missingProductsDialog .missing-products-list-heading{
      flex:0 0 auto;
    }
    #missingProductsDialog .missing-products-list,
    #missingProductsDialog .missing-dishes-list{
      flex:1 1 auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:auto!important;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
    }
    #preferencesDialog.is-preference-keyboard-locked,
    #missingProductsDialog.is-preference-keyboard-locked,
    .recipe-customization-dialog.is-preference-keyboard-locked{
      position:fixed!important;
      inset:auto!important;
      top:var(--preference-dialog-lock-top)!important;
      left:var(--preference-dialog-lock-left)!important;
      right:auto!important;
      bottom:auto!important;
      width:var(--preference-dialog-lock-width)!important;
      max-width:none!important;
      height:var(--preference-dialog-lock-height)!important;
      max-height:var(--preference-dialog-lock-height)!important;
      margin:0!important;
      transform:none!important;
    }
    #preferencesDialog::backdrop,
    #missingProductsDialog::backdrop,
    .recipe-customization-dialog::backdrop{
      background:rgba(28,38,31,.28)!important;
      -webkit-backdrop-filter:blur(8px)!important;
      backdrop-filter:blur(8px)!important;
    }
    #preferencesApplicationManagement .application-management-options:empty{display:none!important}
  `;
  document.head.appendChild(style);
}

function ensurePreferenceDialogScroll(dialog){
  let content=dialog.querySelector(':scope>.preference-dialog-scroll');
  if(content)return content;
  content=document.createElement('div');
  content.className='preference-dialog-scroll';
  while(dialog.firstChild)content.appendChild(dialog.firstChild);
  dialog.appendChild(content);
  return content;
}

function initApplicationManagement(){
  installPreferenceDialogAppearance();
  bindPreferenceKeyboardStability();
  const dialog=document.getElementById('preferencesDialog');
  const documentationButton=document.getElementById('preferencesDocumentation');
  const selectionsButton=document.getElementById('settingsListBtn');
  const missingProductsButton=document.getElementById('settingsMissingProductsBtn');
  if(!dialog||!documentationButton||!selectionsButton||!missingProductsButton)return;
  const content=ensurePreferenceDialogScroll(dialog);

  let managementButton=document.getElementById('settingsApplicationManagementBtn');
  if(!managementButton){
    managementButton=document.createElement('button');
    managementButton.id='settingsApplicationManagementBtn';
    managementButton.className='settings-row';
    managementButton.type='button';
    managementButton.innerHTML='<span class="settings-icon"><svg><use href="#i-gear"></use></svg></span><span class="settings-copy"><strong>Gestion de l’application</strong><small>Documentation, historique et informations</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    missingProductsButton.after(managementButton);
  }

  const selectionOptions=content.querySelector('.preference-options');
  let managementPanel=document.getElementById('preferencesApplicationManagement');
  if(!managementPanel){
    managementPanel=document.createElement('div');
    managementPanel.id='preferencesApplicationManagement';
    managementPanel.hidden=true;
    (selectionOptions||content.querySelector('.dialog-actions'))?.before(managementPanel);
  }

  let managementOptions=managementPanel.querySelector('.application-management-options');
  if(!managementOptions){
    managementOptions=document.createElement('div');
    managementOptions.className='preference-options application-management-options';
    managementPanel.appendChild(managementOptions);
  }
  const purchaseHistoryRow=dialog.querySelector('[data-purchase-history-toggle="1"]');
  if(purchaseHistoryRow)managementOptions.appendChild(purchaseHistoryRow);

  documentationButton.className='security-action-row';
  documentationButton.innerHTML='<span class="security-setting-icon"><svg><use href="#i-list"></use></svg></span><span class="security-setting-copy"><strong>Documentation</strong><small>Guide complet du fonctionnement de l’application</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
  managementPanel.appendChild(documentationButton);

  const title=content.querySelector(':scope>h3');
  const intro=content.querySelector(':scope>.dialog-intro');
  const originalTitle=title?.textContent||'Préférences';
  const originalIntro=intro?.textContent||'';
  const selectionNodes=[...content.children].filter(node=>node!==title&&node!==intro&&node!==managementPanel);
  const originalHidden=new Map(selectionNodes.map(node=>[node,node.hidden]));

  function showSelections(){
    selectionNodes.forEach(node=>{node.hidden=Boolean(originalHidden.get(node))});
    managementPanel.hidden=true;
    if(title)title.textContent=originalTitle;
    if(intro)intro.textContent=originalIntro;
  }

  function showManagement(){
    selectionNodes.forEach(node=>{node.hidden=true});
    managementPanel.hidden=false;
    if(title)title.textContent='Gestion de l’application';
    if(intro)intro.textContent='Accédez à la documentation, à l’historique des achats et aux informations de l’application.';
    if(!dialog.open)dialog.showModal();
  }

  selectionsButton.addEventListener('click',showSelections,true);
  managementButton.addEventListener('click',showManagement);
  dialog.addEventListener('close',showSelections);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initApplicationManagement,{once:true});
}else{
  initApplicationManagement();
}
})();