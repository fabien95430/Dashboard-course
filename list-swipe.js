(() => {
'use strict';

const DEMO_KEY='courses-external-demo-items-v2';
const ENTITY_KEY='courses-external-entity-v1';
const SWIPE_TRIGGER_RATIO=.28;
const SWIPE_MAX_RATIO=.42;

let activeSwipe=null;

function norm(value){
  return String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function itemSummary(item){return String(item?.summary??item?.name??item?.item??'').trim()}
function isPendingItem(item){return String(item?.status||'needs_action')!=='completed'}
function toast(message){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=message;
  el.classList.add('is-visible');
  clearTimeout(el._swipeToastTimer);
  el._swipeToastTimer=setTimeout(()=>el.classList.remove('is-visible'),1700);
}
function isDemoMode(){
  return document.querySelector('#status strong')?.textContent?.trim()==='Mode test';
}
function currentEntity(){
  try{return String(localStorage.getItem(ENTITY_KEY)||'todo.courses').trim()||'todo.courses'}catch(_){return 'todo.courses'}
}
function rowQuantity(row){
  const raw=row?.querySelector('.list-qty')?.textContent||'';
  const value=Number(raw.replace(/[^0-9]/g,''));
  return Number.isFinite(value)&&value>0?value:1;
}

function sharedHaClient(){
  const client=window.COURSES_HA_CLIENT;
  if(!client||typeof client.request!=='function'||typeof client.isConnected!=='function'){
    throw new Error('Client Home Assistant indisponible.');
  }
  return client;
}
function haRequest(payload){return sharedHaClient().request(payload)}

async function removeRemoteItems(name,count){
  const entity=currentEntity();
  for(let index=0;index<count;index+=1){
    await haRequest({
      type:'call_service',
      domain:'todo',
      service:'remove_item',
      service_data:{item:name},
      target:{entity_id:entity}
    });
  }
}
function removeDemoItems(name){
  let items=[];
  try{items=JSON.parse(localStorage.getItem(DEMO_KEY)||'[]')||[]}catch(_){items=[]}
  const key=norm(name);
  const next=items.filter(item=>!isPendingItem(item)||norm(itemSummary(item))!==key);
  if(next.length===items.length)return false;
  try{localStorage.setItem(DEMO_KEY,JSON.stringify(next))}catch(_){return false}
  return true;
}

function ensureHint(row){
  let hint=row.querySelector(':scope > .swipe-remove-hint');
  if(hint)return hint;
  hint=document.createElement('span');
  hint.className='swipe-remove-hint';
  hint.setAttribute('aria-hidden','true');
  hint.innerHTML='<span class="swipe-remove-icon">−</span><strong>Retirer</strong>';
  row.prepend(hint);
  return hint;
}
function resetRow(row,animated=true){
  if(!row)return;
  row.classList.toggle('is-swipe-remove-settle',animated);
  row.classList.remove('is-swipe-remove-tracking','is-swipe-remove-commit');
  row.style.setProperty('--swipe-remove-x','0px');
  const hint=row.querySelector(':scope > .swipe-remove-hint');
  if(hint)hint.style.opacity='0';
  if(animated)setTimeout(()=>row.classList.remove('is-swipe-remove-settle'),230);
}
function finishSuccess(row,name){
  if(!row)return;
  row.classList.add('is-swipe-remove-commit','is-swipe-remove-settle');
  row.style.setProperty('--swipe-remove-x','110vw');
  row.style.opacity='0';
  navigator.vibrate?.(8);
  toast(name+' retiré');
  setTimeout(()=>document.getElementById('refreshBtn')?.click(),90);
}
async function removeWithoutPurchase(row){
  const name=String(row?.dataset?.name||'').trim();
  if(!name){resetRow(row);return}
  const count=rowQuantity(row);
  try{
    if(isDemoMode()){
      if(!removeDemoItems(name))throw new Error('Article introuvable');
      finishSuccess(row,name);
      return;
    }
    if(!window.COURSES_HA_CLIENT?.isConnected?.()){
      throw new Error(navigator.onLine===false?'Retrait indisponible hors ligne':'Home Assistant non connecté');
    }
    await removeRemoteItems(name,count);
    finishSuccess(row,name);
  }catch(error){
    resetRow(row);
    const message=String(error?.message||'');
    toast(message.includes('hors ligne')?'Retrait indisponible hors ligne':'Retrait impossible');
  }
}

function cancelActiveSwipe(animated=true){
  if(!activeSwipe)return;
  const row=activeSwipe.row;
  try{row.releasePointerCapture(activeSwipe.pointerId)}catch(_){}
  resetRow(row,animated);
  activeSwipe=null;
}

function bindSwipe(){
  const root=document.getElementById('listItems');
  if(!root||root.dataset.removeSwipeBound==='1')return;
  root.dataset.removeSwipeBound='1';

  root.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
    if(event.target.closest('button'))return;
    const row=event.target.closest('.list-row');
    if(!row||!root.contains(row)||row.classList.contains('is-busy')||row.classList.contains('is-purchased')||row.classList.contains('is-removing'))return;
    cancelActiveSwipe(false);
    ensureHint(row);
    row.classList.add('is-swipe-remove-tracking');
    row.classList.remove('is-swipe-remove-settle');
    row.style.setProperty('--swipe-remove-x','0px');
    activeSwipe={row,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:0,horizontal:false};
  });

  root.addEventListener('pointermove',event=>{
    const swipe=activeSwipe;
    if(!swipe||event.pointerId!==swipe.pointerId)return;
    const dx=event.clientX-swipe.startX;
    const dy=event.clientY-swipe.startY;
    if(!swipe.horizontal){
      if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
      if(dx<=0||Math.abs(dy)>=Math.abs(dx)*.95){cancelActiveSwipe();return}
      swipe.horizontal=true;
      try{swipe.row.setPointerCapture(event.pointerId)}catch(_){}
    }
    event.preventDefault();
    const maxReveal=Math.min(160,swipe.row.clientWidth*SWIPE_MAX_RATIO);
    swipe.x=Math.max(0,Math.min(maxReveal,dx));
    const progress=Math.min(1,swipe.x/Math.max(1,maxReveal));
    swipe.row.style.setProperty('--swipe-remove-x',swipe.x+'px');
    const hint=swipe.row.querySelector(':scope > .swipe-remove-hint');
    if(hint)hint.style.opacity=String(.18+.82*progress);
  },{passive:false});

  const finish=event=>{
    const swipe=activeSwipe;
    if(!swipe||event.pointerId!==swipe.pointerId)return;
    activeSwipe=null;
    try{swipe.row.releasePointerCapture(event.pointerId)}catch(_){}
    if(!swipe.horizontal){resetRow(swipe.row,false);return}
    const threshold=Math.min(104,swipe.row.clientWidth*SWIPE_TRIGGER_RATIO);
    if(swipe.x<threshold){resetRow(swipe.row);return}
    const maxReveal=Math.min(160,swipe.row.clientWidth*SWIPE_MAX_RATIO);
    swipe.row.classList.remove('is-swipe-remove-tracking');
    swipe.row.classList.add('is-swipe-remove-settle');
    swipe.row.style.setProperty('--swipe-remove-x',maxReveal+'px');
    void removeWithoutPurchase(swipe.row);
  };
  root.addEventListener('pointerup',finish);
  root.addEventListener('pointercancel',event=>{
    if(activeSwipe&&event.pointerId===activeSwipe.pointerId)cancelActiveSwipe();
  });
}

function installStyles(){
  if(document.getElementById('list-swipe-v198-style'))return;
  const style=document.createElement('style');
  style.id='list-swipe-v198-style';
  style.textContent=`
    .purchase-check{position:relative!important;border-color:transparent!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
    .purchase-check::before{content:"";position:absolute;left:50%;top:50%;width:26px;height:26px;box-sizing:border-box;border:2px solid #9da6b0;border-radius:50%;background:transparent;transform:translate(-50%,-50%);transition:.18s ease;z-index:0}
    .purchase-check svg{position:relative;z-index:1;width:14px!important;height:14px!important}
    .list-row.is-purchased .purchase-check{border-color:transparent!important;background:transparent!important;box-shadow:none!important}
    .list-row.is-purchased .purchase-check::before{border-color:#168c49;background:#168c49;box-shadow:0 4px 10px rgba(22,140,73,.15)}
    .list-row{position:relative;overflow:hidden}
    .swipe-remove-hint{position:absolute;z-index:0;left:10px;top:0;bottom:0;display:flex;align-items:center;gap:7px;color:#a73535;opacity:0;pointer-events:none;transition:opacity .12s ease}
    .swipe-remove-hint strong{font-size:14px;font-weight:780;white-space:nowrap}
    .swipe-remove-icon{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#fff0ef;border:1px solid #f0c7c3;font-size:20px;font-weight:700;line-height:1}
    .list-row.is-swipe-remove-tracking>:not(.swipe-remove-hint),.list-row.is-swipe-remove-settle>:not(.swipe-remove-hint){transform:translate3d(var(--swipe-remove-x,0px),0,0)!important}
    .list-row.is-swipe-remove-tracking>:not(.swipe-remove-hint){transition:none!important}
    .list-row.is-swipe-remove-settle>:not(.swipe-remove-hint){transition:transform .22s cubic-bezier(.22,.78,.2,1)!important}
    .list-row.is-swipe-remove-commit{transition:opacity .18s ease!important}
  `;
  document.head.appendChild(style);
}

installStyles();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindSwipe,{once:true});
else bindSwipe();
})();
