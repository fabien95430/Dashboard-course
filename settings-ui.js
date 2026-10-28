(() => {
'use strict';

const STORAGE_PREFERRED_SERVINGS='courses-dish-preferred-servings-v1';
const STORAGE_SERVINGS='courses-dish-servings-v1';
const SERVING_OPTIONS=Object.freeze([2,4,5]);
const DEFAULT_SERVINGS=2;
const DOCUMENTATION_URL='./docs/guide-fonctionnement-courses.pdf?v=299';

function clearLegacyCatalogMode(){
  try{
    localStorage.removeItem('courses-catalog-preferred-mode-v1');
    localStorage.removeItem('courses-catalog-mode-v1');
  }catch(_){}
}
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
  const quantities=window.COURSES_QUANTITIES;
  if(typeof quantities?.setServings!=='function')return false;
  return quantities.setServings(value)!==false;
}
function bindDishServingsSync(){
  const sync=()=>syncDishServings(readPreferredServings());
  document.addEventListener('courses:quantities-ready',sync);
  sync();
}
function initPreferencesExtras(){
  clearLegacyCatalogMode();
  const dialog=document.getElementById('preferencesDialog');
  const startView=document.getElementById('preferencesStartView');
  if(!dialog||!startView)return;

  let documentationButton=document.getElementById('preferencesDocumentation');
  if(!documentationButton){
    documentationButton=document.createElement('button');
    documentationButton.id='preferencesDocumentation';
    documentationButton.type='button';
    documentationButton.className='secondary';
    documentationButton.textContent='Documentation';
    documentationButton.setAttribute('aria-label','Ouvrir la documentation PDF');
    dialog.appendChild(documentationButton);
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
  let servingsSelect=document.getElementById('preferencesServings');
  if(!servingsSelect){
    const field=document.createElement('label');
    field.className='field';
    field.innerHTML='<span>Nombre de personnes</span><select id="preferencesServings" aria-label="Nombre de personnes"><option value="2">2 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option></select>';
    startField?.after(field);
    servingsSelect=field.querySelector('select');
  }
  if(!servingsSelect)return;

  const initialServings=readPreferredServings();
  persistPreferredServings(initialServings);
  servingsSelect.value=String(initialServings);
  bindDishServingsSync();

  const syncSelects=()=>{servingsSelect.value=String(readPreferredServings())};
  dialog.addEventListener('close',syncSelects);
  document.getElementById('settingsPreferencesBtn')?.addEventListener('click',syncSelects);
  servingsSelect.addEventListener('change',()=>{
    const nextServings=Number(servingsSelect.value);
    if(SERVING_OPTIONS.includes(nextServings)){
      persistPreferredServings(nextServings);
      syncDishServings(nextServings);
    }
  });
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
script.src='./missing-products-dishes.js?v=625';
script.defer=true;
script.dataset.missingProductsDishes='1';
document.head.appendChild(script);
})();

(() => {
'use strict';
if(document.querySelector('script[data-missing-products-modern]'))return;
const script=document.createElement('script');
script.src='./missing-products-modern.js?v=625';
script.defer=true;
script.dataset.missingProductsModern='1';
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
    #preferencesDialog .preference-dialog-scroll>h3{display:flex;align-items:center;gap:6px}
    #preferencesApplicationManagement .application-management-options:empty{display:none!important}
    #preferencesNotificationsPanel[hidden]{display:none!important}
    #preferencesNotificationsPanel{display:grid;gap:14px;padding-top:18px}
    #preferencesNotificationsPanel .notifications-management-summary{display:grid;gap:6px;padding:14px;border:1px solid #e4eee6;border-radius:17px;background:#f4f9f4}
    #preferencesNotificationsPanel .notifications-management-summary strong{font-size:var(--fs-text);color:#173527}
    #preferencesNotificationsPanel .notifications-management-summary small{font-size:var(--fs-note);color:#557364;line-height:1.45;overflow-wrap:anywhere}
    #preferencesNotificationsPanel .notifications-management-actions{display:flex;gap:8px;flex-wrap:wrap}
    #preferencesNotificationsPanel .notifications-management-actions button{flex:1 1 130px;min-height:44px;border-radius:13px;padding:8px 12px;font-size:var(--fs-text);font-weight:750}
    #preferencesNotificationsPanel .notifications-management-hint{margin:0;font-size:var(--fs-note);line-height:1.5;color:#7d858d}
    .connection-dialog .connection-sync-section{margin-top:0;padding:12px 13px;border:1px solid #e5ede6;border-radius:16px;background:#f8faf7}
    .connection-dialog .sheet-section-title{margin:14px 0 7px;font-size:var(--fs-note);color:#52675a;font-weight:800}
    .connection-dialog .connection-sync-line{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:7px 0;font-size:var(--fs-note)}
    .connection-dialog .connection-sync-line+.connection-sync-line{border-top:1px solid #e7eee8}
    .connection-dialog .connection-sync-line>span:first-child{flex:0 0 auto;font-weight:700;color:#26362c}
    .connection-dialog .connection-sync-line>span:last-child{min-width:0;text-align:right;font-size:var(--fs-note);line-height:1.4;color:#748076;overflow-wrap:anywhere}
    .connection-dialog .connection-sync-line>span[data-state="synced"]{color:#147545}
    .connection-dialog .connection-sync-line>span[data-state="error"],.connection-dialog .connection-sync-line>span[data-state="missing"]{color:#b6652c}
    @media(max-width:390px){.connection-dialog .connection-sync-line{align-items:flex-start;flex-direction:column;gap:3px}.connection-dialog .connection-sync-line>span:last-child{text-align:left}}
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

  let notificationsButton=document.getElementById('preferencesNotificationsButton');
  if(!notificationsButton){
    notificationsButton=document.createElement('button');
    notificationsButton.id='preferencesNotificationsButton';
    notificationsButton.type='button';
    notificationsButton.className='security-action-row';
    notificationsButton.innerHTML='<span class="security-setting-icon"><svg><use href="#i-bell"></use></svg></span><span class="security-setting-copy"><strong>Notifications</strong><small id="notificationsManagementSummary">À activer sur chaque iPhone</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
  }
  managementPanel.appendChild(notificationsButton);

  const notificationsPanel=document.getElementById('preferencesNotificationsPanel');
  const currentNotificationStatus=window.COURSES_NOTIFICATIONS?.getStatus?.();
  if(currentNotificationStatus){
    const summary=document.getElementById('notificationsManagementSummary');
    if(summary)summary.textContent=currentNotificationStatus;
  }

  const title=content.querySelector(':scope>h3');
  const intro=content.querySelector(':scope>.dialog-intro');
  const originalTitle=title?.textContent||'Préférences';
  const originalIntro=intro?.textContent||'';
  const selectionNodes=[...content.children].filter(node=>node!==title&&node!==intro&&node!==managementPanel);
  const originalHidden=new Map(selectionNodes.map(node=>[node,node.hidden]));

  /* Dans les sous-écrans de Gestion, une flèche remplace l'icône devant le titre et ramène au menu Gestion. */
  let backButton=title?.querySelector('.settings-sheet-back')||null;
  if(title&&!backButton){
    backButton=document.createElement('button');
    backButton.type='button';
    backButton.className='settings-sheet-back';
    backButton.hidden=true;
    backButton.setAttribute('aria-label','Retour à Gestion de l’application');
    backButton.innerHTML='<svg aria-hidden="true"><use href="#i-chevron"></use></svg>';
    title.prepend(backButton);
  }
  backButton?.addEventListener('click',()=>showManagement());

  function setTitle(label,parent=''){
    const labelNode=title?.querySelector('.settings-sheet-title');
    if(labelNode)labelNode.textContent=label;
    else if(title)title.textContent=label;
    const back=parent==='management';
    if(backButton)backButton.hidden=!back;
    title?.classList.toggle('has-back',back);
  }

  function showSelections(){
    [...content.children].forEach(node=>{if(node!==title&&node!==intro)node.hidden=true});
    selectionNodes.forEach(node=>{node.hidden=Boolean(originalHidden.get(node))});
    managementPanel.hidden=true;
    setTitle(originalTitle,'');
    if(intro)intro.textContent=originalIntro;
  }

  function showManagement(){
    [...content.children].forEach(node=>{if(node===title||node===intro||node===managementPanel)return;node.hidden=true});
    managementPanel.hidden=false;
    setTitle('Gestion de l’application','preferences');
    if(intro)intro.textContent='Documentation, historique et informations.';
    if(!dialog.open)dialog.showModal();
    document.dispatchEvent(new CustomEvent('courses:settings-management-opened'));
  }

  function showNotifications(){
    [...content.children].forEach(node=>{if(node===title||node===intro||node===notificationsPanel)return;node.hidden=true});
    if(notificationsPanel)notificationsPanel.hidden=false;
    setTitle('Notifications','management');
    if(intro)intro.textContent='Gérez les notifications envoyées à cet iPhone.';
    if(!dialog.open)dialog.showModal();
  }

  window.COURSES_SETTINGS_NAV=Object.freeze({setTitle});
  selectionsButton.addEventListener('click',showSelections,true);
  managementButton.addEventListener('click',showManagement);
  notificationsButton.addEventListener('click',showNotifications);
  dialog.addEventListener('close',showSelections);
}

function initializeApplicationManagement(){
  initApplicationManagement();
  document.dispatchEvent(new CustomEvent('courses:settings-management-ready'));
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initializeApplicationManagement,{once:true});
}else{
  initializeApplicationManagement();
}
})();

(() => {
'use strict';

function initAdministratorSettings(){
  const preferencesSection=document.getElementById('settingsMissingProductsBtn')?.closest('.settings-section');
  const managementButton=document.getElementById('settingsApplicationManagementBtn');
  const managementPanel=document.getElementById('preferencesApplicationManagement');
  if(!preferencesSection||!managementButton||!managementPanel)return;

  let adminSection=document.getElementById('settingsAdministratorSection');
  if(!adminSection){
    adminSection=document.createElement('section');
    adminSection.id='settingsAdministratorSection';
    adminSection.className='settings-section';
    adminSection.innerHTML='<h2>Administrateur</h2><div class="settings-card"></div>';
    preferencesSection.after(adminSection);
  }
  adminSection.querySelector('.settings-card')?.appendChild(managementButton);

  let errorMessagesButton=document.getElementById('preferencesErrorMessages');
  if(!errorMessagesButton){
    errorMessagesButton=document.createElement('button');
    errorMessagesButton.id='preferencesErrorMessages';
    errorMessagesButton.type='button';
    errorMessagesButton.className='security-action-row';
    errorMessagesButton.innerHTML='<span class="security-setting-icon"><svg><use href="#i-list"></use></svg></span><span class="security-setting-copy"><strong>Messages d’erreur</strong><small>Consulter les erreurs détectées par l’application</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    managementPanel.appendChild(errorMessagesButton);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initAdministratorSettings,{once:true});
}else{
  initAdministratorSettings();
}
})();