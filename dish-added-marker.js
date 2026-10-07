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
  const total=entry.ingredients.length;
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
  if(!button||!label||button.classList.contains('is-busy'))return;
  if(!available){
    button.disabled=true;
    label.textContent='Tout est déjà dans Ma liste';
    return;
  }
  button.disabled=selected===0;
  label.textContent=selected?'Ajouter à ma liste':'Sélectionnez un ingrédient';
}
function reconcileList(){
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
function commitDishEntry(name,ingredients){
  const dish=String(name||'').trim().slice(0,100);
  const clean=[...new Set((Array.isArray(ingredients)?ingredients:[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20);
  if(!dish||!clean.length)return false;
  entries[dish]={ingredients:clean,at:Date.now()};
  saveEntries();
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
  commitDishEntry(name,ingredients);
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
  commitDishEntry(pending.name,pending.ingredients);
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

document.addEventListener('courses:dish-add-settled',consumeDishAddSettled);
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

(() => {
'use strict';

const FEEDBACK_MS=1700;
let confirmationBusy=false;
let confirmationToastTimer=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function ensureConfirmationStyle(){
  if(document.getElementById('dish-confirmation-feedback-style'))return;
  const style=document.createElement('style');
  style.id='dish-confirmation-feedback-style';
  style.textContent=`
    #dishDialog .dish-confirm-feedback-layer{
      position:fixed;
      z-index:30;
      left:50%;
      top:50%;
      width:min(76vw,280px);
      padding:18px 20px;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:6px;
      border:1px solid rgba(255,255,255,.68);
      border-radius:24px;
      background:rgba(248,250,246,.94);
      box-shadow:0 18px 46px rgba(35,55,43,.18);
      -webkit-backdrop-filter:blur(18px) saturate(125%);
      backdrop-filter:blur(18px) saturate(125%);
      opacity:0;
      transform:translate(-50%,-46%) scale(.84);
      pointer-events:none;
    }
    #dishDialog .dish-confirm-feedback-mark{
      width:54px;
      height:54px;
      display:grid;
      place-items:center;
      border-radius:50%;
      background:#168647;
      color:#fff;
      box-shadow:0 9px 22px rgba(22,134,71,.22);
      font-size:29px;
      line-height:1;
      font-weight:900;
    }
    #dishDialog .dish-confirm-feedback-layer strong{color:#173126;font-size:18px;line-height:1.1;font-weight:850}
    #dishDialog .dish-confirm-feedback-layer small{color:#718078;font-size:12px;line-height:1.2;font-weight:650}
    #dishDialog.is-confirm-feedback .dish-confirm-feedback-layer{animation:dishConfirmFeedback .48s cubic-bezier(.18,.82,.2,1) both}
    #dishDialog.is-confirm-feedback .dish-sheet-list,
    #dishDialog.is-confirm-feedback .dish-sheet-head,
    #dishDialog.is-confirm-feedback .dish-sheet-note{opacity:.22!important;transition:opacity .16s ease!important;pointer-events:none!important}
    #dishDialog.is-confirm-feedback .dish-sheet-close,
    #dishDialog.is-confirm-feedback .dish-sheet-favorite{opacity:.3!important;pointer-events:none!important}
    #dishDialog.is-confirm-feedback .dish-ingredient.is-already-listed .dish-ingredient-name::after,
    #dishDialog.is-confirm-feedback .dish-ingredient.is-partially-listed .dish-ingredient-name::after{display:none!important;content:none!important}
    #dishDialog.is-confirm-feedback .dish-sheet-add{
      transform:scale(.985)!important;
      background:linear-gradient(160deg,#2fd875,#159c51)!important;
      color:#fff!important;
      box-shadow:0 8px 22px rgba(22,134,71,.19)!important;
      transition:transform .16s ease,background .16s ease,box-shadow .16s ease!important;
    }
    #dishDialog.is-confirm-feedback .dish-sheet-add svg{transform:scale(1.08);transition:transform .18s ease}
    html.is-dish-background-sync #dishes .dish-card{pointer-events:none}
    @keyframes dishConfirmFeedback{
      0%{opacity:0;transform:translate(-50%,-42%) scale(.78)}
      58%{opacity:1;transform:translate(-50%,-51%) scale(1.035)}
      100%{opacity:1;transform:translate(-50%,-50%) scale(1)}
    }
    @media(prefers-reduced-motion:reduce){
      #dishDialog.is-confirm-feedback .dish-confirm-feedback-layer{animation:none;opacity:1;transform:translate(-50%,-50%)}
    }
  `;
  document.head.appendChild(style);
}

function showConfirmationToast(message){
  const toast=document.getElementById('toast');
  if(!toast)return;
  clearTimeout(confirmationToastTimer);
  toast.textContent=message;
  toast.classList.add('is-visible');
  confirmationToastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
}

function confirmationLayer(dialog){
  let layer=dialog.querySelector('.dish-confirm-feedback-layer');
  if(layer)return layer;
  layer=document.createElement('div');
  layer.className='dish-confirm-feedback-layer';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<span class="dish-confirm-feedback-mark">✓</span><strong>Sélection validée</strong><small>Ajout à Ma liste en cours</small>';
  dialog.appendChild(layer);
  return layer;
}

function startConfirmationFeedback(dialog,button){
  confirmationLayer(dialog);
  dialog.classList.add('is-confirm-feedback');
  button.classList.add('is-busy');
  button.disabled=true;
  const label=button.querySelector('span');
  if(label)label.textContent='Sélection validée';
  const use=button.querySelector('svg use');
  if(use)use.setAttribute('href','#i-check');
  navigator.vibrate?.([8,24,8]);
}

function closeAfterConfirmation(dialog,button){
  dialog.classList.remove('is-confirm-feedback');
  dialog.querySelector('.dish-confirm-feedback-layer')?.remove();
  const closeButton=dialog.querySelector('.dish-sheet-close');
  if(closeButton)closeButton.click();
  else{
    if(dialog.open)dialog.close();else dialog.removeAttribute('open');
    document.documentElement.classList.remove('dish-sheet-open');
  }
  button.classList.remove('is-busy');
  const label=button.querySelector('span');
  if(label)label.textContent='Ajouter à ma liste';
  const use=button.querySelector('svg use');
  if(use)use.setAttribute('href','#i-cart');
}

function confirmationResultMessage(name,result){
  if(result.failed)return 'Ajout partiel · '+result.added+' unité'+(result.added>1?'s':'')+' ajoutée'+(result.added>1?'s':'')+' · '+result.failed+' erreur'+(result.failed>1?'s':'');
  if(!result.added)return 'Les quantités nécessaires sont déjà dans Ma liste';
  return name+' · '+result.added+' unité'+(result.added>1?'s':'')+' ajoutée'+(result.added>1?'s':'')+(result.present?' · '+result.present+' déjà dans Ma liste':'');
}

function publishDishAddResult(name,ingredients,result){
  document.dispatchEvent(new CustomEvent('courses:dish-add-settled',{detail:{name,ingredients,result}}));
}

async function confirmWithFeedback(event){
  const button=event.currentTarget;
  const dialog=button.closest('#dishDialog');
  if(!dialog||button.disabled||confirmationBusy)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const addSelected=window.COURSES_QUANTITIES?.addSelected;
  if(!name||typeof addSelected!=='function')return;
  const ingredients=[...dialog.querySelectorAll('.dish-ingredient[data-ingredient]')]
    .filter(row=>row.classList.contains('is-selected')||row.classList.contains('is-already-listed'))
    .map(row=>String(row.dataset.ingredient||'').trim())
    .filter(Boolean);

  event.preventDefault();
  event.stopImmediatePropagation();

  let settled;
  try{
    settled=Promise.resolve(addSelected()).then(result=>({result}),error=>({error}));
  }catch(error){
    publishDishAddResult(name,ingredients,null);
    showConfirmationToast('Ajout impossible');
    return;
  }

  confirmationBusy=true;
  document.documentElement.classList.add('is-dish-background-sync');
  startConfirmationFeedback(dialog,button);
  await wait(FEEDBACK_MS);
  closeAfterConfirmation(dialog,button);

  const outcome=await settled;
  confirmationBusy=false;
  document.documentElement.classList.remove('is-dish-background-sync');
  if(outcome.error){
    publishDishAddResult(name,ingredients,null);
    showConfirmationToast('Ajout impossible');
    return;
  }
  const result=outcome.result||{added:0,failed:1,present:0};
  publishDishAddResult(name,ingredients,result);
  navigator.vibrate?.(result.added?[10,28,10]:8);
  showConfirmationToast(confirmationResultMessage(name,result));
}

function bindConfirmationFeedback(){
  ensureConfirmationStyle();
  const button=document.querySelector('#dishDialog .dish-sheet-add');
  if(!button||button.dataset.confirmFeedbackBound==='1')return false;
  button.dataset.confirmFeedbackBound='1';
  button.addEventListener('click',confirmWithFeedback,true);
  return true;
}

const confirmationObserver=new MutationObserver(()=>{if(bindConfirmationFeedback())confirmationObserver.disconnect()});
if(!bindConfirmationFeedback())confirmationObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('keydown',event=>{
  if(!confirmationBusy||!['Enter',' '].includes(event.key))return;
  if(!event.target?.closest?.('#dishes .dish-card'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);
})();