(() => {
'use strict';

const HISTORY_KEY='courses-purchase-history-v1';
const SWIPE_START_PX=9;
const SWIPE_TRIGGER_PX=62;
const SWIPE_MAX_PX=92;
const ROW_SETTLE_PX=82;
const PENDING_TTL_MS=20000;
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

function readHistory(){
  try{
    const value=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');
    return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  }catch(_){return {}}
}
function writeHistory(value){
  try{localStorage.setItem(HISTORY_KEY,JSON.stringify(value))}catch(_){}
}
function rowQuantity(row){
  const label=row?.querySelector?.('.list-qty')?.textContent||'';
  const match=label.match(/(\d+)/);
  return Math.max(1,Number(match?.[1]||1));
}

const pendingPurchases=new Map();
let pendingRemoval=null;

function rememberPurchaseIntent(row){
  const name=String(row?.dataset?.name||'').trim();
  const key=norm(name);
  if(!name||!key)return;
  pendingPurchases.set(key,{name,quantity:rowQuantity(row),startedAt:Date.now()});
}
function forgetPurchaseIntent(name){
  const key=norm(name);
  if(key)pendingPurchases.delete(key);
}
function commitPurchase(name){
  const key=norm(name),pending=pendingPurchases.get(key);
  if(!key||!pending)return;
  pendingPurchases.delete(key);
  const history=readHistory();
  history[key]={name:pending.name,at:Date.now(),quantity:pending.quantity};
  writeHistory(history);
}
function prunePending(){
  const cutoff=Date.now()-PENDING_TTL_MS;
  pendingPurchases.forEach((entry,key)=>{if(entry.startedAt<cutoff)pendingPurchases.delete(key)});
  if(pendingRemoval&&pendingRemoval.startedAt<cutoff)pendingRemoval=null;
}

function injectStyle(){
  if(document.getElementById('list-actions-style'))return;
  const style=document.createElement('style');
  style.id='list-actions-style';
  style.textContent=`
    .purchase-check{
      width:30px!important;
      height:30px!important;
      min-width:30px!important;
      min-height:30px!important;
      border-width:1.6px!important;
      position:relative!important;
      justify-self:center!important;
    }
    .purchase-check::after{
      content:"";
      position:absolute;
      inset:-7px;
      border-radius:50%;
    }
    .purchase-check svg{
      width:16px!important;
      height:16px!important;
    }
    .list-row{
      position:relative;
      overflow:hidden;
    }
    .list-swipe-remove{
      position:absolute;
      z-index:0;
      left:12px;
      top:0;
      bottom:0;
      width:62px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#b42318;
      font-size:12px;
      line-height:1;
      font-weight:800;
      letter-spacing:-.1px;
      opacity:0;
      transform:translateX(-8px);
      transition:opacity .14s ease,transform .14s ease;
      pointer-events:none;
    }
    .list-row.is-list-swiping .list-swipe-remove,
    .list-row.is-list-removal .list-swipe-remove{
      opacity:1;
      transform:translateX(0);
    }
    .list-row[data-list-swipe-bound="1"] > :not(.list-swipe-remove){
      translate:var(--list-swipe-x,0px) 0;
      transition:translate .18s cubic-bezier(.22,.78,.2,1);
    }
    .list-row.is-list-swiping > :not(.list-swipe-remove){
      transition:none;
    }
    .list-row.is-list-removal{
      background:linear-gradient(90deg,#fff0ee 0 86px,#fff 86px 100%)!important;
    }
    .list-row.is-list-removal .undo-purchase{
      display:none!important;
    }
    @media(prefers-reduced-motion:reduce){
      .list-row[data-list-swipe-bound="1"] > :not(.list-swipe-remove),
      .list-swipe-remove{transition:none!important}
    }
  `;
  document.head.appendChild(style);
}

function ensureRemoveHint(row){
  let hint=row.querySelector(':scope > .list-swipe-remove');
  if(hint)return hint;
  hint=document.createElement('span');
  hint.className='list-swipe-remove';
  hint.setAttribute('aria-hidden','true');
  hint.textContent='Retirer';
  row.prepend(hint);
  return hint;
}
function resetSwipe(row,delay=0){
  const run=()=>{
    if(!row?.isConnected)return;
    row.classList.remove('is-list-swiping','is-list-removal');
    row.style.removeProperty('--list-swipe-x');
    row.style.removeProperty('background');
  };
  if(delay)setTimeout(run,delay);else run();
}
function paintSwipe(row,x){
  const clamped=Math.max(0,Math.min(SWIPE_MAX_PX,x));
  row.style.setProperty('--list-swipe-x',clamped+'px');
  const edge=Math.max(0,Math.round(clamped));
  row.style.background=`linear-gradient(90deg,#fff0ee 0 ${edge}px,#fff ${edge}px 100%)`;
  return clamped;
}
function startRemoval(row){
  const name=String(row.dataset.name||'').trim();
  const check=row.querySelector('.purchase-check');
  if(!name||!check||check.disabled){resetSwipe(row);return}
  row.classList.remove('is-list-swiping');
  row.classList.add('is-list-removal');
  row.style.setProperty('--list-swipe-x',ROW_SETTLE_PX+'px');
  pendingRemoval={name,key:norm(name),startedAt:Date.now()};
  check.dataset.listRemovalIntent='1';
  navigator.vibrate?.(7);
  check.click();
  setTimeout(()=>resetSwipe(row),1900);
}

function bindRow(row){
  if(!row||row.dataset.listSwipeBound==='1')return;
  row.dataset.listSwipeBound='1';
  ensureRemoveHint(row);
  let gesture=null;

  row.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.button!==undefined&&event.button!==0))return;
    if(event.target.closest('button')||row.classList.contains('is-busy'))return;
    gesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,axis:'',x:0};
  },{passive:true});

  row.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.startX;
    const dy=event.clientY-gesture.startY;
    if(!gesture.axis){
      if(Math.abs(dx)<SWIPE_START_PX&&Math.abs(dy)<SWIPE_START_PX)return;
      if(Math.abs(dy)>=Math.abs(dx)*.9||dx<=0){gesture=null;return}
      gesture.axis='x';
      row.classList.add('is-list-swiping');
      try{row.setPointerCapture(event.pointerId)}catch(_){}
    }
    if(gesture.axis!=='x')return;
    event.preventDefault();
    gesture.x=paintSwipe(row,dx);
  },{passive:false});

  const finish=(event,cancelled)=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const current=gesture;
    gesture=null;
    try{row.releasePointerCapture(event.pointerId)}catch(_){}
    if(cancelled||current.axis!=='x'||current.x<SWIPE_TRIGGER_PX){resetSwipe(row);return}
    startRemoval(row);
  };
  row.addEventListener('pointerup',event=>finish(event,false));
  row.addEventListener('pointercancel',event=>finish(event,true));
}

function bindRows(root){
  root?.querySelectorAll?.('.list-row').forEach(bindRow);
}
function watchRows(){
  const root=document.getElementById('listItems');
  if(!root)return false;
  if(root.dataset.listActionsRoot==='1')return true;
  root.dataset.listActionsRoot='1';
  bindRows(root);
  new MutationObserver(()=>bindRows(root)).observe(root,{childList:true,subtree:true});

  root.addEventListener('click',event=>{
    const check=event.target.closest('.purchase-check');
    if(check&&root.contains(check)){
      const row=check.closest('.list-row');
      if(check.dataset.listRemovalIntent==='1'){
        delete check.dataset.listRemovalIntent;
        forgetPurchaseIntent(row?.dataset?.name||'');
      }else{
        rememberPurchaseIntent(row);
      }
      return;
    }
    const undo=event.target.closest('.undo-purchase');
    if(undo&&root.contains(undo))forgetPurchaseIntent(undo.dataset.name||undo.closest('.list-row')?.dataset?.name||'');
  },true);
  return true;
}

function watchToast(){
  const toast=document.getElementById('toast');
  if(!toast)return false;
  if(toast.dataset.listActionsToast==='1')return true;
  toast.dataset.listActionsToast='1';
  const sync=()=>{
    prunePending();
    const text=String(toast.textContent||'').trim();
    if(!text)return;
    if(pendingRemoval){
      const bought=pendingRemoval.name+' acheté';
      if(text===bought){
        toast.textContent=pendingRemoval.name+' retiré de Ma liste';
        pendingRemoval=null;
        return;
      }
      if(/impossible/i.test(text))pendingRemoval=null;
    }
    if(text.endsWith(' acheté'))commitPurchase(text.slice(0,-7));
  };
  new MutationObserver(sync).observe(toast,{childList:true,subtree:true,characterData:true});
  return true;
}

function init(){
  injectStyle();
  const ready=watchRows()&&watchToast();
  if(ready)return;
  const observer=new MutationObserver(()=>{
    if(document.getElementById('listItems')&&document.getElementById('toast')){
      observer.disconnect();
      watchRows();
      watchToast();
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
