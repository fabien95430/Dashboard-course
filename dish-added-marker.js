(() => {
'use strict';

const STORAGE='courses-added-dishes-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
let entries=readEntries();
let trustedListNames=null;
let pending=null;
let pendingTimer=0;
let gridObserver=null;
let listObserver=null;
let toastObserver=null;
let observedGrid=null;
let observedList=null;
let observedToast=null;

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
  `;
  document.head.appendChild(style);
}
function markerActive(name){
  const entry=entries[name];
  if(!entry)return false;
  if(trustedListNames===null||!entry.ingredients.length)return true;
  return entry.ingredients.every(item=>trustedListNames.has(normalize(item)));
}
function syncCard(card){
  if(!card)return;
  const name=String(card.dataset.dish||'').trim();
  if(!name)return;
  const active=markerActive(name);
  card.classList.toggle('is-added',active);
  const marker=card.querySelector('.dish-add');
  const markerText=active?'✓':'+';
  if(marker&&marker.textContent!==markerText)marker.textContent=markerText;
  const label='Voir les ingrédients de '+name+(active?', ajouté à Ma liste':'');
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
function reconcileList(){
  if(!listIsUnfiltered())return;
  const list=document.getElementById('listItems');
  if(!list)return;
  const rows=[...list.querySelectorAll('.list-row[data-name]')];
  if(!rows.length&&trustedListNames===null)return;
  trustedListNames=new Set(rows.map(row=>normalize(row.dataset.name||'')).filter(Boolean));
  syncCards();
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
  const ingredients=[...dialog.querySelectorAll('.dish-ingredient.is-selected[data-ingredient]')]
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
  const success=message==='Les ingrédients sélectionnés sont déjà dans Ma liste'||message.startsWith(pending.name+' · ');
  if(!success)return;
  entries[pending.name]={ingredients:[...new Set(pending.ingredients)],at:Date.now()};
  saveEntries();
  trustedListNames=null;
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
}

document.addEventListener('click',event=>{
  const addButton=event.target.closest?.('#dishDialog .dish-sheet-add');
  if(addButton)trackPendingFromButton(addButton);
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