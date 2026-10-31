(() => {
'use strict';

// Plats ajoutés : lus depuis les notes « Plat : … » des articles de la liste Home Assistant
// (window.COURSES_LIST.dishNotes, dans app.js), donc identiques sur tous les appareils.
// localEntries : plats validés sur cet appareil dont la note n'a pas encore pu être écrite
// (hors ligne, ou anciennes entrées locales d'avant la v677) ; ils sont partagés dès que possible.
const LOCAL_STORAGE='courses-added-dishes-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const localEntries=readLocalEntries();
let entries={...localEntries};
let sharing=null;
let trustedListNames=null;
let trustedListQuantities=null;
let pending=null;
let pendingTimer=0;
let cardFrame=0;
let reconcileFrame=0;
let guardFrame=0;

function cleanIngredients(values){
  return [...new Set((Array.isArray(values)?values:[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20);
}
function readLocalEntries(){
  try{
    const saved=JSON.parse(localStorage.getItem(LOCAL_STORAGE)||'{}');
    if(!saved||typeof saved!=='object'||Array.isArray(saved))return {};
    const clean={};
    Object.entries(saved).slice(-100).forEach(([name,value])=>{
      const dish=String(name||'').trim().slice(0,100);
      const ingredients=cleanIngredients(value?.ingredients);
      const before=Array.isArray(value?.before)?value.before.map(String).slice(0,500):null;
      if(dish&&ingredients.length)clean[dish]={ingredients,at:Number(value?.at)||0,...(before?{before}:{})};
    });
    return clean;
  }catch(_){
    return {};
  }
}
function saveLocalEntries(){
  try{
    if(Object.keys(localEntries).length)localStorage.setItem(LOCAL_STORAGE,JSON.stringify(localEntries));
    else localStorage.removeItem(LOCAL_STORAGE);
  }catch(_){}
}
function rebuildEntries(){
  const shared={};
  const notes=window.COURSES_LIST?.dishNotes?.();
  (Array.isArray(notes)?notes:[]).forEach(note=>{
    const dish=String(note?.name||'').trim();
    const ingredients=cleanIngredients(note?.ingredients);
    if(dish&&ingredients.length)shared[dish]={ingredients,total:Math.max(Number(note.total)||0,ingredients.length)};
  });
  entries={...localEntries,...shared};
}
// Écrit dans Home Assistant la note des plats encore locaux ; un plat dont plus aucun ingrédient
// n'est dans la liste est oublié.
function shareLocalEntries(){
  const tagDish=window.COURSES_LIST?.tagDish;
  if(sharing||typeof tagDish!=='function'||trustedListNames===null)return;
  const dishes=Object.keys(localEntries);
  if(!dishes.length)return;
  sharing=(async()=>{
    let changed=false;
    for(const dish of dishes){
      const entry=localEntries[dish];
      if(!entry)continue;
      if(!entry.ingredients.some(item=>trustedListNames?.has(normalize(item)))){
        delete localEntries[dish];changed=true;continue;
      }
      if(await tagDish(dish,entry.ingredients,{before:entry.before||null})){delete localEntries[dish];changed=true}
    }
    if(changed){saveLocalEntries();scheduleReconcileList()}
  })().finally(()=>{sharing=null});
}
function ensureStyle(){
  if(document.getElementById('dish-added-marker-style'))return;
  const style=document.createElement('style');
  style.id='dish-added-marker-style';
  style.textContent=`
    #dishes .dish-card.is-added{
      border-width:1.5px!important;
      border-color:#27a85f!important;
      background:linear-gradient(180deg,#edf6f1 0%,#dcebe3 100%)!important;
      box-shadow:0 7px 22px rgba(57,75,62,.065)!important;
    }
    #dishes .dish-card.is-added .dish-add{
      background:#29a85f!important;
      color:#fff!important;
      font-size:17px!important;
      font-weight:850!important;
      line-height:1!important;
      box-shadow:0 4px 10px rgba(19,118,62,.20)!important;
    }
    #dishes .dish-card.is-partial{
      border-width:1.5px!important;
      border-color:#dfa242!important;
      background:linear-gradient(180deg,#fffaf1 0%,#f8ecd8 100%)!important;
      box-shadow:0 7px 22px rgba(57,75,62,.065)!important;
    }
    #dishes .dish-card.is-partial .dish-add{
      background:#d99124!important;
      color:#fff!important;
      font-size:11px!important;
      font-weight:850!important;
      line-height:1!important;
      box-shadow:0 4px 10px rgba(150,92,11,.18)!important;
    }
    #dishes .dish-card.is-added:focus,
    #dishes .dish-card.is-partial:focus{
      outline:none!important;
    }
    @media(hover:hover) and (pointer:fine){
      #dishes .dish-card.is-added:focus-visible,
      #dishes .dish-card.is-partial:focus-visible{
        outline:2px solid rgba(22,134,71,.28)!important;
        outline-offset:1px!important;
      }
    }
    #dishDialog .dish-ingredient.is-already-listed{
      border-color:rgba(22,134,71,.12)!important;
      background:rgba(235,241,234,.86)!important;
      color:#65736b!important;
      opacity:.82!important;
      cursor:default!important;
    }
    #dishDialog .dish-ingredient.is-already-listed .dish-ingredient-name{
      color:#65736b!important;
      white-space:normal!important;
      overflow:visible!important;
      text-overflow:clip!important;
    }
    #dishDialog .dish-ingredient.is-already-listed .dish-ingredient-name::after{
      content:"Déjà dans Ma liste";
      display:block;
      margin-top:3px;
      color:#168647;
      font-size:10.5px;
      line-height:1.05;
      font-weight:760;
    }
    #dishDialog .dish-ingredient.is-partially-listed .dish-ingredient-name{
      white-space:normal!important;
      overflow:visible!important;
      text-overflow:clip!important;
    }
    #dishDialog .dish-ingredient.is-partially-listed .dish-ingredient-name::after{
      content:attr(data-list-quantity) " déjà dans Ma liste · " attr(data-missing-quantity) " à ajouter";
      display:block;
      margin-top:3px;
      color:#b27014;
      font-size:10.5px;
      line-height:1.05;
      font-weight:760;
    }
    #dishDialog .dish-ingredient.is-already-listed .dish-ingredient-check{
      border-color:rgba(22,134,71,.18)!important;
      background:#e1ece3!important;
      color:transparent!important;
      font-size:0!important;
      box-shadow:none!important;
    }
    #dishDialog .dish-ingredient.is-already-listed .dish-ingredient-check::before{content:none!important}
    #dishDialog .dish-ingredient.is-already-listed .dish-ingredient-check::after{
      content:"✓";
      color:#168647;
      font-size:14px;
      line-height:1;
      font-weight:900;
    }
  `;
  document.head.appendChild(style);
}
function markerState(name){
  const entry=entries[name];
  if(!entry)return {state:'none',present:0,total:0};
  const total=Math.max(Number(entry.total)||0,entry.ingredients.length);
  if(trustedListNames===null||!total)return {state:'none',present:0,total};
  const present=entry.ingredients.reduce((count,item)=>count+(trustedListNames.has(normalize(item))?1:0),0);
  return {
    state:present===total?'complete':(present>0?'partial':'none'),
    present,
    total
  };
}
function syncCard(card){
  if(!card)return;
  const name=String(card.dataset.dish||'').trim();
  if(!name)return;
  const markerStateValue=markerState(name);
  const complete=markerStateValue.state==='complete';
  const partial=markerStateValue.state==='partial';
  card.classList.toggle('is-added',complete);
  card.classList.toggle('is-partial',partial);
  const marker=card.querySelector('.dish-add');
  const markerText=complete?'✓':(partial?markerStateValue.present+'/'+markerStateValue.total:'+');
  if(marker&&marker.textContent!==markerText)marker.textContent=markerText;
  const suffix=complete
    ?', ajouté à Ma liste'
    :(partial?', '+markerStateValue.present+' sur '+markerStateValue.total+' ingrédients dans Ma liste':'');
  const label='Voir les ingrédients de '+name+suffix;
  if(card.getAttribute('aria-label')!==label)card.setAttribute('aria-label',label);
}
function syncCards(){
  document.querySelectorAll('#dishes .dish-card').forEach(syncCard);
}
function knownIngredientNames(){
  const names=new Set();
  Object.values(entries).forEach(entry=>{
    (Array.isArray(entry?.ingredients)?entry.ingredients:[]).forEach(name=>{
      const value=String(name||'').trim();
      if(value)names.add(value);
    });
  });
  document.querySelectorAll('#dishDialog .dish-ingredient[data-ingredient]').forEach(row=>{
    const value=String(row.dataset.ingredient||'').trim();
    if(value)names.add(value);
  });
  return names;
}
function readListState(){
  const list=document.getElementById('listItems');
  const service=window.COURSES_LIST;
  if(!list||list.querySelector('.empty .spinner')||typeof service?.getQuantity!=='function')return null;
  const names=new Set();
  const quantities=new Map();
  knownIngredientNames().forEach(name=>{
    const key=normalize(name);
    if(!key)return;
    const quantity=Math.max(0,Number(service.getQuantity(name))||0);
    quantities.set(key,quantity);
    if(quantity>0)names.add(key);
  });
  return {names,quantities};
}
function ensureTrustedListState(){
  if(trustedListNames!==null&&trustedListQuantities!==null)return true;
  const state=readListState();
  if(state===null)return false;
  trustedListNames=state.names;
  trustedListQuantities=state.quantities;
  return true;
}
function syncDialogGuard(){
  const dialog=document.getElementById('dishDialog');
  if(!dialog?.open||!ensureTrustedListState())return;
  const rows=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')];
  let available=0;
  let selected=0;
  rows.forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    const key=normalize(name);
    const current=Math.max(0,Number(trustedListQuantities.get(key))||0);
    const target=Math.max(1,Number(row.dataset.recipeQuantity)||1);
    const sufficient=current>=target;
    const partial=current>0&&current<target;
    const missing=Math.max(0,target-current);
    row.dataset.listQuantity=String(current);
    row.dataset.missingQuantity=String(missing);
    const nameLabel=row.querySelector('.dish-ingredient-name');
    if(nameLabel){
      nameLabel.dataset.listQuantity=String(current);
      nameLabel.dataset.missingQuantity=String(missing);
    }
    row.classList.toggle('is-already-listed',sufficient);
    row.classList.toggle('is-partially-listed',partial);
    row.disabled=sufficient;
    row.setAttribute('aria-disabled',sufficient?'true':'false');
    if(sufficient){
      row.setAttribute('aria-pressed','false');
      return;
    }
    available+=1;
    const active=row.classList.contains('is-selected');
    row.setAttribute('aria-pressed',active?'true':'false');
    if(active)selected+=1;
  });
  const count=dialog.querySelector('.dish-sheet-count');
  if(count)count.textContent=selected+' ingrédient'+(selected>1?'s':'');
  const button=dialog.querySelector('.dish-sheet-add');
  const label=button?.querySelector('span');
  const publish=()=>document.dispatchEvent(new CustomEvent('courses:dish-availability-updated',{detail:{dish:dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||''}}));
  if(!button||!label||button.classList.contains('is-busy')){publish();return}
  if(!available){
    button.disabled=true;
    label.textContent='Tout est déjà dans Ma liste';
    publish();
    return;
  }
  button.disabled=selected===0;
  label.textContent=selected?'Ajouter à ma liste':'Sélectionnez un ingrédient';
  publish();
}
function reconcileList(){
  rebuildEntries();
  const state=readListState();
  if(state===null){
    trustedListNames=null;
    trustedListQuantities=null;
    syncCards();
    return;
  }
  trustedListNames=state.names;
  trustedListQuantities=state.quantities;
  syncCards();
  syncDialogGuard();
  shareLocalEntries();
}
function removeListedSelections(dialog){
  const names=[...dialog.querySelectorAll('.dish-ingredient.is-already-listed.is-selected[data-ingredient]')]
    .map(row=>String(row.dataset.ingredient||''))
    .filter(Boolean);
  if(!names.length)return false;
  names.forEach(name=>{
    const row=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')]
      .find(item=>String(item.dataset.ingredient||'')===name);
    if(!row?.classList.contains('is-selected'))return;
    row.disabled=false;
    row.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  });
  syncDialogGuard();
  return true;
}
function clearPending(){
  pending=null;
  clearTimeout(pendingTimer);
  pendingTimer=0;
}
function trackPendingFromButton(button){
  const dialog=button?.closest?.('#dishDialog');
  if(!dialog||button.disabled)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const ingredients=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')]
    .filter(row=>row.classList.contains('is-selected')||row.classList.contains('is-already-listed'))
    .map(row=>String(row.dataset.ingredient||'').trim())
    .filter(Boolean);
  if(!name||!ingredients.length)return;
  // Articles déjà dans la liste avant l'ajout : les autres seront « Ajouté pour » ce plat.
  const before=window.COURSES_LIST?.listUids?.();
  pending={name,ingredients,before:Array.isArray(before)?before:null};
  clearTimeout(pendingTimer);
  pendingTimer=setTimeout(clearPending,90000);
}
function commitDishEntry(name,ingredients,before=null){
  const dish=String(name||'').trim().slice(0,100);
  const clean=cleanIngredients(ingredients);
  if(!dish||!clean.length)return false;
  entries[dish]={ingredients:clean,at:Date.now(),...(Array.isArray(before)?{before}:{})};
  localEntries[dish]=entries[dish];
  saveLocalEntries();
  trustedListNames=null;
  trustedListQuantities=null;
  syncCards();
  if(pending?.name===dish)clearPending();
  requestAnimationFrame(reconcileList);
  return true;
}
function consumeDishAddSettled(event){
  const detail=event?.detail||{};
  const name=String(detail.name||'').trim();
  if(!name)return;
  if(!detail.result){
    if(pending?.name===name)clearPending();
    return;
  }
  const ingredients=Array.isArray(detail.ingredients)&&detail.ingredients.length
    ?detail.ingredients
    :(pending?.name===name?pending.ingredients:[]);
  commitDishEntry(name,ingredients,pending?.name===name?pending.before:null);
}
function scheduleCards(){
  if(cardFrame)return;
  cardFrame=requestAnimationFrame(()=>{cardFrame=0;syncCards()});
}
function scheduleReconcileList(){
  if(reconcileFrame)return;
  reconcileFrame=requestAnimationFrame(()=>{reconcileFrame=0;reconcileList()});
}
function scheduleDialogGuard(){
  if(guardFrame)return;
  guardFrame=requestAnimationFrame(()=>{guardFrame=0;syncDialogGuard()});
}
function bindMarkerEvents(){
  ensureStyle();
  document.addEventListener('courses:dishes-rendered',scheduleCards);
  document.addEventListener('courses:list-rendered',scheduleReconcileList);
  document.addEventListener('courses:list-changed',scheduleReconcileList);
  document.addEventListener('courses:dish-quantities-updated',scheduleDialogGuard);
  document.addEventListener('courses:dish-sheet-opened',scheduleDialogGuard);
  document.addEventListener('courses:quantities-ready',()=>{
    scheduleReconcileList();
    scheduleDialogGuard();
  });
  document.addEventListener('courses:catalog-mode-ready',scheduleCards);
  scheduleCards();
  scheduleReconcileList();
  scheduleDialogGuard();
}

document.addEventListener('courses:dish-add-settled',consumeDishAddSettled);
// Avant l'ajout (événement publié par dishes-ui.js, propriétaire du bouton « Ajouter ») :
// les ingrédients déjà dans Ma liste sont désélectionnés, puis l'ajout repart à l'image suivante.
document.addEventListener('courses:dish-add-requested',event=>{
  const detail=event.detail||{};
  const addButton=detail.button;
  const dialog=addButton?.closest?.('#dishDialog');
  if(!dialog)return;
  syncDialogGuard();
  if(removeListedSelections(dialog)){
    detail.retry=true;
    return;
  }
  trackPendingFromButton(addButton);
});
// Annulation d'un plat ajouté (appui sur le ✓ de sa carte, publié par dishes-ui.js) :
// confirmation, puis retrait des seules unités ajoutées pour ce plat (app.js, COURSES_LIST.cancelDish).
let cancelDish='';
function showCancelToast(message){
  const toast=document.getElementById('toast');
  if(!toast)return;
  clearTimeout(toast._t);
  toast.textContent=message;
  toast.classList.add('is-visible');
  toast._t=setTimeout(()=>toast.classList.remove('is-visible'),2600);
}
function cancelResultMessage(dish,result){
  if(result.failed)return 'Annulation impossible · réessayez';
  if(!result.removed)return dish+' retiré · ingrédients gardés dans Ma liste';
  return dish+' retiré · '+result.removed+' article'+(result.removed>1?'s':'')+' retiré'+(result.removed>1?'s':'')+' de Ma liste';
}
async function confirmCancelDish(){
  const dialog=document.getElementById('dishCancelDialog');
  const dish=cancelDish;
  cancelDish='';
  if(dialog?.open)dialog.close();
  if(!dish||typeof window.COURSES_LIST?.cancelDish!=='function')return;
  window.CoursesHaptics?.vibrate([10,28,10]);
  if(localEntries[dish]){delete localEntries[dish];saveLocalEntries()}
  delete entries[dish];
  syncCards();
  let result;
  try{result=await window.COURSES_LIST.cancelDish(dish)}catch(_){result={removed:0,kept:0,failed:1}}
  if(!result.failed)window.COURSES_QUANTITIES?.forgetDish?.(dish);
  scheduleReconcileList();
  showCancelToast(cancelResultMessage(dish,result));
}
function requestCancelDish(event){
  const dish=String(event?.detail?.dish||'').trim();
  const dialog=document.getElementById('dishCancelDialog');
  if(!dish||!dialog)return;
  cancelDish=dish;
  const title=dialog.querySelector('#dishCancelTitle');
  if(title)title.textContent=dish;
  dialog.setAttribute('aria-label','Retirer '+dish+' ?');
  const photo=dialog.querySelector('.dish-cancel-photo img');
  const source=window.COURSES_DISH_FILES?.card?.(dish)||'';
  if(photo&&source&&photo.getAttribute('src')!==source)photo.src=source;
  if(dialog.dataset.bound!=='1'){
    dialog.dataset.bound='1';
    dialog.querySelector('[data-dish-cancel="confirm"]')?.addEventListener('click',confirmCancelDish);
    dialog.querySelector('[data-dish-cancel="keep"]')?.addEventListener('click',()=>{cancelDish='';dialog.close()});
    dialog.addEventListener('cancel',()=>{cancelDish=''});
  }
  window.CoursesHaptics?.vibrate(6);
  dialog.showModal();
}
document.addEventListener('courses:dish-cancel-requested',requestCancelDish);
bindMarkerEvents();
})();
