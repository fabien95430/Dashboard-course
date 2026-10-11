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
  saveButton.addEventListener('click',()=>{
    const nextServings=Number(servingsSelect.value);
    if(SERVING_OPTIONS.includes(nextServings)){
      persistPreferredServings(nextServings);
      syncDishServings(nextServings);
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
script.src='./missing-products-dishes.js?v=410';
script.defer=true;
script.dataset.missingProductsDishes='1';
document.head.appendChild(script);
})();

(() => {
'use strict';
if(document.querySelector('script[data-missing-products-modern]'))return;
const script=document.createElement('script');
script.src='./missing-products-modern.js?v=410';
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
      border:1px solid rgba(255,255,255,.72)!important;
      background:linear-gradient(165deg,rgba(255,255,255,.88),rgba(245,250,247,.78))!important;
      color:#122018!important;
      box-shadow:0 30px 80px rgba(24,46,32,.20),inset 0 1px 0 rgba(255,255,255,.94),inset 0 -1px 0 rgba(75,103,85,.06)!important;
      -webkit-backdrop-filter:blur(30px) saturate(150%)!important;
      backdrop-filter:blur(30px) saturate(150%)!important;
    }
    #connectionDialog,
    #settingsDialog{
      border:1px solid rgba(255,255,255,.72)!important;
      background:linear-gradient(165deg,rgba(255,255,255,.88),rgba(245,250,247,.78))!important;
      color:#122018!important;
      box-shadow:0 30px 80px rgba(24,46,32,.20),inset 0 1px 0 rgba(255,255,255,.94),inset 0 -1px 0 rgba(75,103,85,.06)!important;
      -webkit-backdrop-filter:blur(30px) saturate(150%)!important;
      backdrop-filter:blur(30px) saturate(150%)!important;
    }
    #preferencesDialog[open],
    #missingProductsDialog[open],
    .recipe-customization-dialog[open]{
      display:flex!important;
      flex-direction:column!important;
    }
    #connectionDialog[open],
    #settingsDialog[open],
    #preferencesDialog[open],
    #missingProductsDialog[open],
    .recipe-customization-dialog[open]{
      animation:courses-managed-dialog-in .22s cubic-bezier(.22,.82,.2,1);
    }
    @keyframes courses-managed-dialog-in{
      from{opacity:0;transform:translateY(12px) scale(.985)}
      to{opacity:1;transform:none}
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
      background:rgba(24,35,28,.24)!important;
      -webkit-backdrop-filter:blur(8px)!important;
      backdrop-filter:blur(8px)!important;
    }
    #connectionDialog::backdrop,
    #settingsDialog::backdrop{
      background:rgba(24,35,28,.24)!important;
      -webkit-backdrop-filter:blur(8px)!important;
      backdrop-filter:blur(8px)!important;
    }
    #preferencesDialog h3,
    #missingProductsDialog h3,
    #connectionDialog h3,
    #settingsDialog h3,
    .recipe-customization-dialog h3{
      color:#0b3d29!important;
      letter-spacing:-.35px;
    }
    #preferencesDialog .dialog-intro,
    #missingProductsDialog .dialog-intro,
    #settingsDialog .dialog-intro,
    .recipe-customization-dialog .dialog-intro{
      color:#77827b!important;
    }
    #preferencesDialog .field input,
    #preferencesDialog .field select,
    #connectionDialog .field input,
    #connectionDialog .field select,
    #settingsDialog .field input,
    #settingsDialog .field select,
    #missingProductsDialog .missing-products-add input,
    .recipe-customization-dialog .recipe-customization-search,
    .recipe-customization-dialog .recipe-customization-ingredient-search{
      border-color:rgba(54,77,62,.10)!important;
      background:rgba(255,255,255,.56)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 5px 16px rgba(38,66,48,.035)!important;
    }
    #preferencesDialog .preference-options,
    #settingsDialog .security-settings-summary,
    #settingsDialog .change-password-panel,
    #missingProductsDialog .missing-category-panel,
    .recipe-customization-dialog .recipe-customization-item,
    .recipe-customization-dialog .recipe-customization-ingredient-picker{
      border-color:rgba(54,77,62,.08)!important;
      background:rgba(255,255,255,.46)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.76),0 7px 20px rgba(38,66,48,.035)!important;
    }
    #preferencesDialog .security-action-row,
    #settingsDialog .security-action-row,
    #missingProductsDialog .missing-product-row,
    #missingProductsDialog .missing-dish-row{
      border-color:rgba(54,77,62,.08)!important;
      background:rgba(255,255,255,.52)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.78),0 7px 20px rgba(38,66,48,.035)!important;
    }
    #missingProductsDialog .missing-category-choice{
      border-color:rgba(54,77,62,.09)!important;
      background:rgba(255,255,255,.52)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.72)!important;
    }
    #missingProductsDialog .missing-category-choice.is-active{
      border-color:rgba(31,148,78,.22)!important;
      background:linear-gradient(155deg,rgba(231,248,236,.82),rgba(245,251,247,.60))!important;
    }
    .recipe-customization-dialog .recipe-customization-item.is-selected{
      border-color:rgba(31,148,78,.20)!important;
      background:linear-gradient(155deg,rgba(231,248,236,.78),rgba(247,252,248,.60))!important;
      color:#145d37!important;
    }
    .recipe-customization-dialog .recipe-customization-quantity{
      border-color:rgba(54,77,62,.09)!important;
      background:rgba(255,255,255,.62)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.84)!important;
    }
    .recipe-customization-dialog .recipe-customization-suggestions{
      border-color:rgba(54,77,62,.09)!important;
      background:rgba(250,252,250,.90)!important;
      box-shadow:0 20px 46px rgba(29,54,38,.16),inset 0 1px 0 rgba(255,255,255,.90)!important;
      -webkit-backdrop-filter:blur(24px) saturate(145%)!important;
      backdrop-filter:blur(24px) saturate(145%)!important;
    }
    .recipe-customization-dialog .recipe-customization-add-button{
      border-color:rgba(35,139,80,.42)!important;
      background:rgba(248,252,249,.48)!important;
    }
    #preferencesDialog .dialog-actions button:not(.primary),
    #connectionDialog .dialog-actions button:not(.primary),
    .recipe-customization-dialog .dialog-actions button:not(.primary),
    #settingsDialog .secondary{
      border-color:rgba(54,77,62,.09)!important;
      background:rgba(255,255,255,.50)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 6px 18px rgba(38,66,48,.04)!important;
    }
    #preferencesDialog .dialog-actions .primary,
    #connectionDialog .dialog-actions .primary,
    #missingProductsDialog .missing-products-add .primary,
    #settingsDialog .primary,
    .recipe-customization-dialog .dialog-actions .primary{
      border:0!important;
      background:linear-gradient(180deg,#2ca15b,#208a4d)!important;
      color:#fff!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 9px 22px rgba(24,132,70,.18)!important;
    }
    #missingProductsDialog .missing-products-close{
      border:1px solid rgba(255,255,255,.62)!important;
      background:rgba(242,245,243,.60)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.76),0 5px 14px rgba(37,58,45,.06)!important;
      -webkit-backdrop-filter:blur(16px) saturate(140%)!important;
      backdrop-filter:blur(16px) saturate(140%)!important;
    }
    #preferencesDialog .preference-dialog-scroll>h3{display:flex;align-items:center;gap:6px}
    .preference-title-back{width:18px;height:32px;flex:0 0 18px;margin:-2px 0 -2px -2px;padding:0;border:0;border-radius:0;display:grid;place-items:center;background:transparent;color:#0b7040;font:inherit;font-size:28px;line-height:1;font-weight:500;-webkit-tap-highlight-color:transparent}
    .preference-title-back:focus{outline:none}.preference-title-back:focus-visible{outline:2px solid rgba(11,112,64,.28);outline-offset:2px}
    #preferencesApplicationManagement .application-management-options:empty{display:none!important}
    @media(prefers-reduced-motion:reduce){
      #connectionDialog[open],
      #settingsDialog[open],
      #preferencesDialog[open],
      #missingProductsDialog[open],
      .recipe-customization-dialog[open]{animation:none}
    }
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

  function setTitle(label,back=''){
    if(!title)return;
    title.textContent='';
    if(back){
      const button=document.createElement('button');
      button.type='button';
      button.className='preference-title-back';
      button.dataset.preferenceBack=back;
      button.setAttribute('aria-label',back==='preferences'?'Retour aux préférences':'Retour à Gestion de l’application');
      button.textContent='‹';
      title.appendChild(button);
    }
    title.append(document.createTextNode(label));
  }

  function showSelections(){
    [...content.children].forEach(node=>{if(node!==title&&node!==intro)node.hidden=true});
    selectionNodes.forEach(node=>{node.hidden=Boolean(originalHidden.get(node))});
    managementPanel.hidden=true;
    setTitle(originalTitle);
    if(intro)intro.textContent=originalIntro;
  }

  function showManagement(){
    [...content.children].forEach(node=>{if(node===title||node===intro||node===managementPanel)return;node.hidden=true});
    managementPanel.hidden=false;
    setTitle('Gestion de l’application','preferences');
    if(intro)intro.textContent='Documentation, historique et informations de l’application.';
    if(!dialog.open)dialog.showModal();
    document.dispatchEvent(new CustomEvent('courses:settings-management-opened'));
  }

  window.COURSES_SETTINGS_NAV=Object.freeze({setTitle});
  content.addEventListener('click',event=>{
    const back=event.target.closest('.preference-title-back');
    if(!back)return;
    if(back.dataset.preferenceBack==='preferences')showSelections();
    else showManagement();
  });

  selectionsButton.addEventListener('click',showSelections,true);
  managementButton.addEventListener('click',showManagement);
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
    adminSection.innerHTML='<h2><span class="section-icon"><svg><use href="#i-gear"></use></svg></span>Administrateur</h2><div class="settings-card"></div>';
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