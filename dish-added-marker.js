(() => {
'use strict';

const STORAGE='courses-added-dishes-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
let entries=readEntries();
let trustedListNames=null;
let trustedListQuantities=null;
let pending=null;
let pendingTimer=0;
let gridObserver=null;
let listObserver=null;
let toastObserver=null;
let dialogObserver=null;
let observedGrid=null;
let observedList=null;
let observedToast=null;
let observedDialog=null;

function readEntries(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');
    if(!saved||typeof saved!=='object'||Array.isArray(saved))return {};
    const clean={};
    Object.entries(saved).slice(-100).forEach(([name,value])=>{
      const dish=String(name||'').trim().slice(0,100);
      const ingredients=Array.isArray(value?.ingredients)
        ?[...new Set(value.ingredients.map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20)
        :[];
      if(dish)clean[dish]={ingredients,at:Number(value?.at)||0};
    });
    return clean;
  }catch(_){
    return {};
  }
}
function saveEntries(){
  try{localStorage.setItem(STORAGE,JSON.stringify(entries))}catch(_){}
}
function ensureStyle(){
  if(document.getElementById('dish-added-marker-style'))return;
  const style=document.createElement('style');
  style.id='dish-added-marker-style';
  style.textContent=`
    #dishes .dish-card.is-added{
      border-color:#27a85f!important;
      background:linear-gradient(180deg,#edf6f1 0%,#dcebe3 100%)!important;
      box-shadow:inset 0 0 0 1px rgba(34,151,82,.08),0 7px 22px rgba(40,119,73,.10)!important;
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
      border-color:#dfa242!important;
      background:linear-gradient(180deg,#fffaf1 0%,#f8ecd8 100%)!important;
      box-shadow:inset 0 0 0 1px rgba(190,126,24,.08),0 7px 22px rgba(150,105,35,.09)!important;
    }
    #dishes .dish-card.is-partial .dish-add{
      background:#d99124!important;
      color:#fff!important;
      font-size:11px!important;
      font-weight:850!important;
      line-height:1!important;
      box-shadow:0 4px 10px rgba(150,92,11,.18)!important;
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
      content:"Déjà suffisant";
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
  const total=entry.ingredients.length;
  if(trustedListNames===null||!total)return {state:'complete',present:total,total};
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
function listIsUnfiltered(){
  const search=document.getElementById('listSearch');
  if(search&&String(search.value||'').trim())return false;
  const selected=document.querySelector('#listFilterMenu [data-list-category][aria-checked="true"]');
  return !selected||(selected.dataset.listCategory||'Toutes')==='Toutes';
}
function rowListQuantity(row){
  const text=String(row?.querySelector?.('.list-qty')?.textContent||'');
  const match=text.match(/(\d+)/);
  return match?Math.max(1,Number(match[1])||1):1;
}
function readListState(){
  if(!listIsUnfiltered())return null;
  const list=document.getElementById('listItems');
  if(!list||list.querySelector('.empty .spinner'))return null;
  const names=new Set();
  const quantities=new Map();
  [...list.querySelectorAll('.list-row[data-name]')].forEach(row=>{
    const key=normalize(row.dataset.name||'');
    if(!key)return;
    const quantity=rowListQuantity(row);
    names.add(key);
    quantities.set(key,(quantities.get(key)||0)+quantity);
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
  if(!button||!label||button.classList.contains('is-busy'))return;
  if(!available){
    button.disabled=true;
    label.textContent='Tout est déjà suffisant';
    return;
  }
  button.disabled=selected===0;
  label.textContent=selected?'Ajouter à ma liste':'Sélectionnez un ingrédient';
}
function reconcileList(){
  const state=readListState();
  if(state===null)return;
  trustedListNames=state.names;
  trustedListQuantities=state.quantities;
  syncCards();
  syncDialogGuard();
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
  pending={name,ingredients};
  clearTimeout(pendingTimer);
  pendingTimer=setTimeout(clearPending,90000);
}
function consumeToast(){
  if(!pending||!observedToast?.classList.contains('is-visible'))return;
  const message=String(observedToast.textContent||'').trim();
  if(!message)return;
  if(message.startsWith('Ajout partiel')){
    clearPending();
    return;
  }
  const success=message==='Les ingrédients sélectionnés sont déjà dans Ma liste'||message==='Les quantités nécessaires sont déjà dans Ma liste'||message.startsWith(pending.name+' · ');
  if(!success)return;
  entries[pending.name]={ingredients:[...new Set(pending.ingredients)],at:Date.now()};
  saveEntries();
  trustedListNames=null;
  trustedListQuantities=null;
  syncCards();
  clearPending();
}
function bindObservers(){
  ensureStyle();
  const grid=document.getElementById('dishes');
  if(grid&&grid!==observedGrid){
    gridObserver?.disconnect();
    observedGrid=grid;
    gridObserver=new MutationObserver(syncCards);
    gridObserver.observe(grid,{childList:true,subtree:true});
    syncCards();
  }
  const list=document.getElementById('listItems');
  if(list&&list!==observedList){
    listObserver?.disconnect();
    observedList=list;
    listObserver=new MutationObserver(()=>requestAnimationFrame(reconcileList));
    listObserver.observe(list,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-name']});
    requestAnimationFrame(reconcileList);
  }
  const toast=document.getElementById('toast');
  if(toast&&toast!==observedToast){
    toastObserver?.disconnect();
    observedToast=toast;
    toastObserver=new MutationObserver(consumeToast);
    toastObserver.observe(toast,{attributes:true,childList:true,characterData:true,subtree:true,attributeFilter:['class']});
  }
  const dialog=document.getElementById('dishDialog');
  if(dialog&&dialog!==observedDialog){
    dialogObserver?.disconnect();
    observedDialog=dialog;
    dialogObserver=new MutationObserver(()=>requestAnimationFrame(syncDialogGuard));
    dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open','data-recipe-quantity'],childList:true,subtree:true});
    requestAnimationFrame(syncDialogGuard);
  }
}

document.addEventListener('click',event=>{
  const addButton=event.target.closest?.('#dishDialog .dish-sheet-add');
  if(addButton){
    const dialog=addButton.closest('#dishDialog');
    syncDialogGuard();
    if(dialog&&removeListedSelections(dialog)){
      event.preventDefault();
      event.stopImmediatePropagation();
      requestAnimationFrame(()=>{
        syncDialogGuard();
        if(!addButton.disabled)addButton.click();
      });
      return;
    }
    trackPendingFromButton(addButton);
  }
  if(event.target.closest?.('#listFilterMenu [data-list-category]'))requestAnimationFrame(()=>requestAnimationFrame(reconcileList));
},true);
document.addEventListener('input',event=>{
  if(event.target?.id==='listSearch')requestAnimationFrame(reconcileList);
},true);

const bootstrapObserver=new MutationObserver(bindObservers);
bootstrapObserver.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindObservers,{once:true});
else bindObservers();
})();