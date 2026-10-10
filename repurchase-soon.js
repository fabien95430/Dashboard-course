(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG?.groups)return;

const DAY=86400000;
const MAX_BADGE=99;
const NAMES=[...new Set(Object.values(CATALOG.groups).flatMap(subs=>Object.values(subs||{}).flatMap(names=>Array.isArray(names)?names:[])))];
const META=new Map();
Object.entries(CATALOG.groups).forEach(([category,subs])=>Object.entries(subs||{}).forEach(([sub,names])=>{
  (Array.isArray(names)?names:[]).forEach(name=>META.set(name,{category,sub}));
}));

let dialog=null;
let refreshFrame=0;
let booted=false;

const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

function intelligence(){return window.COURSES_PURCHASE_INTELLIGENCE||null}
function listService(){return window.COURSES_LIST||null}
function appLocked(){return document.getElementById('app')?.classList.contains('is-locked')!==false}

function suggestionFor(name,now=Date.now()){
  const api=intelligence(),list=listService();
  if(!api?.isEnabled?.()||!list)return null;
  const p=api.profileFor?.(name);
  if(!p?.lastAt||Number(p.samples||0)<1)return null;
  if(Number(list.getQuantity?.(name)||0)>0)return null;
  const stock=api.stockFor?.(name,now);
  if(!stock)return null;
  const cycle=Math.max(1,Math.round(Number(p.recentDays||p.baseDays)||1));
  const dueRaw=cycle-Number(stock.ageDays||0);
  const soonWindow=Math.min(7,Math.max(1,Math.round(cycle*.2)));
  const depleted=Number(stock.estimatedQty||0)<=0;
  if(!depleted&&dueRaw>soonWindow)return null;
  const meta=META.get(name)||{};
  return {
    name,
    category:meta.category||p.category||'',
    sub:meta.sub||p.sub||'',
    cadence:cycle,
    dueIn:depleted?Math.min(0,dueRaw):dueRaw,
    evidence:Number(p.samples||0)+Number(p.feedbackSamples||0),
    depleted
  };
}

function suggestions(now=Date.now()){
  return NAMES.map(name=>suggestionFor(name,now)).filter(Boolean).sort((a,b)=>{
    const aDue=a.dueIn<=0?0:a.dueIn,bDue=b.dueIn<=0?0:b.dueIn;
    return aDue-bDue||b.evidence-a.evidence||a.name.localeCompare(b.name,'fr',{sensitivity:'base'});
  });
}

function timingLabel(item){
  const days=Math.ceil(item.dueIn);
  if(days<=0)return 'À racheter';
  if(days===1)return 'Demain';
  return 'Dans '+days+' jours';
}
function timingClass(item){
  const days=Math.ceil(item.dueIn);
  if(days<=0)return 'is-now';
  if(days<=2)return 'is-close';
  return 'is-soon';
}

function ensureStyles(){
  if(document.getElementById('courses-repurchase-soon-style'))return;
  const style=document.createElement('style');
  style.id='courses-repurchase-soon-style';
  style.textContent=`
    .repurchase-header-actions{display:flex;align-items:center;gap:10px;flex:0 0 auto}
    .repurchase-header-button{position:relative!important}
    .repurchase-header-button svg{width:22px!important;height:22px!important}
    .repurchase-count{
      position:absolute;right:-4px;top:-5px;min-width:19px;height:19px;padding:0 4px;border:2px solid rgba(255,255,255,.98);
      border-radius:999px;display:grid;place-items:center;background:#2378f2;color:#fff;box-sizing:border-box;
      font-size:10px;line-height:1;font-weight:820;letter-spacing:0;box-shadow:0 2px 7px rgba(35,120,242,.24);pointer-events:none
    }
    .repurchase-dialog{
      width:100%;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;border-radius:0;
      background:#f7f7f2;color:#17231c;overflow:hidden
    }
    .repurchase-dialog::backdrop{background:#f7f7f2}
    .repurchase-screen{
      width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;
      padding:0 18px max(calc(env(safe-area-inset-bottom) + 16px),24px)
    }
    .repurchase-head{
      display:grid;grid-template-columns:42px minmax(0,1fr) 42px;align-items:center;flex:0 0 auto;box-sizing:border-box;
      padding:max(29px,calc(env(safe-area-inset-top) + 23px)) 0 12px
    }
    .repurchase-head::after{content:'';width:42px;height:42px}
    .repurchase-back{
      width:42px;height:42px;margin:0;padding:0 2px 4px 0;border:0!important;border-radius:0!important;outline:0!important;
      display:grid;place-items:center;background:transparent!important;color:#142019;box-shadow:none!important;
      -webkit-backdrop-filter:none!important;backdrop-filter:none!important;-webkit-appearance:none!important;appearance:none!important;
      -webkit-tap-highlight-color:transparent;font-size:42px;line-height:1;font-family:inherit
    }
    .repurchase-back:hover,.repurchase-back:active,.repurchase-back:focus,.repurchase-back:focus-visible{
      border:0!important;border-radius:0!important;outline:0!important;background:transparent!important;box-shadow:none!important
    }
    .repurchase-head h2{margin:0;padding:0;color:#0d3f2c;font-size:22px;line-height:1;font-weight:820;letter-spacing:-.035em;text-align:center}
    .repurchase-info{
      flex:0 0 auto;margin:5px 0 13px;padding:12px 14px;border:1px solid rgba(35,120,242,.07);border-radius:16px;
      display:flex;gap:10px;align-items:flex-start;background:#edf5ff;color:#315375;font-size:12.5px;line-height:1.35;font-weight:580
    }
    .repurchase-info-mark{width:20px;height:20px;flex:0 0 20px;border-radius:50%;display:grid;place-items:center;background:#2378f2;color:#fff;font-size:12px;font-weight:850}
    .repurchase-list{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;padding:1px 1px 12px;display:flex;flex-direction:column;gap:10px}
    .repurchase-row{
      min-height:83px;padding:10px 11px 10px 9px;border:1px solid rgba(37,61,45,.055);border-radius:20px;
      display:grid;grid-template-columns:68px minmax(0,1fr) 43px;align-items:center;gap:9px;background:rgba(255,255,255,.92);
      box-shadow:0 8px 22px rgba(39,60,45,.055)
    }
    .repurchase-thumb{width:66px;height:62px;position:relative;display:grid;place-items:center;overflow:hidden}
    .repurchase-thumb img{width:100%;height:100%;object-fit:contain;display:block;transform:translateY(1px)}
    .repurchase-thumb-fallback{display:none;width:48px;height:48px;border-radius:15px;place-items:center;background:#eef2ed;color:#678071;font-size:17px;font-weight:820}
    .repurchase-thumb.is-fallback img{display:none}.repurchase-thumb.is-fallback .repurchase-thumb-fallback{display:grid}
    .repurchase-copy{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
    .repurchase-copy strong{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#152219;font-size:15px;line-height:1.13;font-weight:800;letter-spacing:-.022em}
    .repurchase-copy small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#87908a;font-size:11px;line-height:1.2;font-weight:560}
    .repurchase-timing{margin-top:4px;min-height:22px;padding:0 9px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;font-size:10.5px;line-height:1;font-weight:780}
    .repurchase-timing::before{content:'';width:6px;height:6px;border:1.7px solid currentColor;border-radius:50%;box-sizing:border-box}
    .repurchase-timing.is-now{background:#fff0e8;color:#d85a22}.repurchase-timing.is-close{background:#fff5df;color:#ca7a16}.repurchase-timing.is-soon{background:#edf4ff;color:#3470ba}
    .repurchase-add{
      width:38px;height:38px;border:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#1c9c60,#12824e);
      color:#fff;box-shadow:0 7px 16px rgba(18,130,78,.20),inset 0 1px 0 rgba(255,255,255,.22);font-size:26px;line-height:1;font-weight:350;
      -webkit-appearance:none;appearance:none;transition:transform .12s ease,opacity .12s ease
    }
    .repurchase-add:active{transform:scale(.94)}.repurchase-add:disabled{opacity:.5}
    .repurchase-empty{flex:1;min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 22px;text-align:center;color:#7c8780}
    .repurchase-empty-mark{width:70px;height:70px;margin-bottom:17px;border-radius:50%;display:grid;place-items:center;background:#eef3ef;color:#2b7951;font-size:31px;box-shadow:inset 0 0 0 1px rgba(43,121,81,.05)}
    .repurchase-empty strong{color:#174c36;font-size:20px;line-height:1.1;font-weight:820;letter-spacing:-.03em}
    .repurchase-empty span{max-width:300px;margin-top:7px;font-size:13px;line-height:1.42;font-weight:540}
    @media(max-width:360px){.repurchase-screen{padding-left:14px;padding-right:14px}.repurchase-row{grid-template-columns:58px minmax(0,1fr) 40px}.repurchase-thumb{width:56px;height:56px}.repurchase-add{width:36px;height:36px}}
    @media(prefers-reduced-motion:reduce){.repurchase-add{transition:none}}
  `;
  document.head.appendChild(style);
}

function ensureButton(){
  const refresh=document.getElementById('catalogRefreshBtn');
  if(!refresh)return false;
  if(document.getElementById('repurchaseSoonBtn'))return true;
  const actions=document.createElement('div');
  actions.className='repurchase-header-actions';
  refresh.before(actions);
  const button=document.createElement('button');
  button.id='repurchaseSoonBtn';
  button.className='icon-btn repurchase-header-button';
  button.type='button';
  button.setAttribute('aria-label','À racheter bientôt');
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.2"></circle><path d="M12 7.7v4.8l3 1.8"></path></svg><i class="repurchase-count" aria-hidden="true" hidden></i>';
  actions.append(button,refresh);
  button.addEventListener('click',openDialog);
  return true;
}

function ensureDialog(){
  if(dialog?.isConnected)return dialog;
  dialog=document.getElementById('repurchaseSoonDialog');
  if(dialog)return dialog;
  dialog=document.createElement('dialog');
  dialog.id='repurchaseSoonDialog';
  dialog.className='repurchase-dialog';
  dialog.setAttribute('aria-labelledby','repurchaseSoonTitle');
  dialog.innerHTML='<div class="repurchase-screen"><header class="repurchase-head"><button class="repurchase-back" type="button" aria-label="Retour au Catalogue">‹</button><h2 id="repurchaseSoonTitle">À prévoir</h2></header><div class="repurchase-info"><span class="repurchase-info-mark" aria-hidden="true">i</span><span>Suggestions selon vos habitudes. Aucun ajout automatique.</span></div><div class="repurchase-list"></div></div>';
  document.body.appendChild(dialog);
  dialog.querySelector('.repurchase-back')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close()});
  return dialog;
}

function emptyMarkup(){
  const enabled=intelligence()?.isEnabled?.()!==false;
  if(!enabled){
    return '<div class="repurchase-empty"><div class="repurchase-empty-mark" aria-hidden="true">↻</div><strong>Historique désactivé</strong><span>Activez l’historique des achats dans Préférences.</span></div>';
  }
  return '<div class="repurchase-empty"><div class="repurchase-empty-mark" aria-hidden="true">✓</div><strong>Rien à prévoir pour le moment</strong><span>Les suggestions apparaissent quand un prochain achat approche.</span></div>';
}

function renderDialog(items=suggestions()){
  const root=ensureDialog().querySelector('.repurchase-list');
  if(!root)return;
  if(!items.length){root.innerHTML=emptyMarkup();return}
  root.innerHTML=items.map(item=>{
    const first=Array.from(item.name)[0]?.toUpperCase()||'•';
    return '<article class="repurchase-row" data-name="'+esc(item.name)+'">'+
      '<span class="repurchase-thumb"><img src="./www/Items/'+esc(slugify(item.name))+'.webp" alt="" loading="lazy" decoding="async" draggable="false"><span class="repurchase-thumb-fallback">'+esc(first)+'</span></span>'+
      '<span class="repurchase-copy"><strong>'+esc(item.name)+'</strong><small>Cycle estimé : '+item.cadence+' jour'+(item.cadence>1?'s':'')+'</small><span class="repurchase-timing '+timingClass(item)+'">'+esc(timingLabel(item))+'</span></span>'+
      '<button class="repurchase-add" type="button" data-name="'+esc(item.name)+'" aria-label="Ajouter '+esc(item.name)+' à Ma liste">+</button>'+
    '</article>';
  }).join('');
  root.querySelectorAll('.repurchase-thumb img').forEach(image=>image.addEventListener('error',()=>image.parentElement?.classList.add('is-fallback'),{once:true}));
  root.querySelectorAll('.repurchase-add').forEach(button=>button.addEventListener('click',()=>addSuggested(button)));
}

async function addSuggested(button){
  const name=String(button?.dataset?.name||'').trim(),list=listService();
  if(!name||!list?.ensureQuantity||button.disabled)return;
  button.disabled=true;
  const previous=button.textContent;
  button.textContent='…';
  try{
    const current=Math.max(0,Number(list.getQuantity?.(name)||0));
    const result=await list.ensureQuantity(name,current+1);
    if(Number(result?.failed||0)>0)throw new Error('add failed');
    button.textContent='✓';
    navigator.vibrate?.(6);
    setTimeout(()=>refresh(true),260);
  }catch(_){
    button.textContent='!';
    setTimeout(()=>{if(button.isConnected){button.textContent=previous;button.disabled=false}},900);
  }
}

function syncBadge(items=suggestions()){
  const badge=document.querySelector('#repurchaseSoonBtn .repurchase-count');
  if(!badge)return;
  const count=items.length;
  badge.hidden=count===0;
  badge.textContent=count>MAX_BADGE?MAX_BADGE+'+':String(count);
}

function refresh(includeDialog=false){
  if(refreshFrame)return;
  refreshFrame=requestAnimationFrame(()=>{
    refreshFrame=0;
    const items=suggestions();
    syncBadge(items);
    if((includeDialog||dialog?.open)&&dialog?.open)renderDialog(items);
  });
}

function openDialog(){
  if(appLocked())return;
  const target=ensureDialog();
  renderDialog();
  if(!target.open)target.showModal();
}

function bindEvents(){
  document.addEventListener('courses:list-changed',()=>refresh(true));
  document.addEventListener('courses:lock-changed',event=>{
    if(event.detail?.locked){if(dialog?.open)dialog.close();return}
    refresh(true);
  });
  window.addEventListener('storage',event=>{
    if(event.key==='courses-purchase-intelligence-v1'||event.key==='courses-purchase-intelligence-enabled-v1')refresh(true);
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh(true)});
}

function init(){
  if(booted)return;
  if(!intelligence()||!listService())return;
  booted=true;
  ensureStyles();ensureButton();ensureDialog();bindEvents();refresh();
  window.COURSES_REPURCHASE_SOON=Object.freeze({suggestions:()=>suggestions(),refresh:()=>refresh(true),open:openDialog});
}

function bootstrap(){
  if(intelligence()&&listService()){init();return}
  const owner=document.querySelector('script[data-purchase-intelligence]');
  if(owner){owner.addEventListener('load',init,{once:true});return}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
}

bootstrap();
})();