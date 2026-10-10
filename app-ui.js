(() => {
'use strict';

const APP_VERSION=String(window.COURSES_APP_VERSION||document.querySelector('.page-version')?.textContent||'').trim();
let securityKeyboardBaseline=0;

function syncPageVersions(){
  document.querySelectorAll('.page-header').forEach(header=>{
    const title=header.querySelector('h1');
    const badge=header.querySelector('.page-version');
    if(!title||!badge)return;
    if(badge.parentElement!==title)title.appendChild(badge);
    if(badge.textContent!==APP_VERSION)badge.textContent=APP_VERSION;
  });
  if(!document.getElementById('app-version-ui')){
    const style=document.createElement('style');
    style.id='app-version-ui';
    style.textContent=`
      .catalog-view .page-header h1::after{content:none!important}
      .dish-card img[src^="https://images.pexels.com/"],.dish-sheet-photo[src^="https://images.pexels.com/"]{visibility:hidden!important}
      .catalog-view .product:not(.is-selected) .badge{font-size:0!important}
      .catalog-view .product:not(.is-selected) .badge::before,.catalog-view .product:not(.is-selected) .badge::after{
        content:'';
        position:absolute;
        left:50%;
        top:50%;
        width:11px;
        height:1.6px;
        border-radius:999px;
        background:currentColor;
        transform:translate(-50%,-50%);
        pointer-events:none;
      }
      .catalog-view .product:not(.is-selected) .badge::after{transform:translate(-50%,-50%) rotate(90deg)}
      html #missingProductsDialog .is-request-product .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#f4f7f5!important;color:#66736c!important}
      html #missingProductsDialog .is-request-dish .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#faf7ef!important;color:#7c705b!important}
      html #missingProductsDialog .is-request-dessert .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#faf3ef!important;color:#8a6b60!important}
      #listItems.is-list-home-empty{
        position:relative;
        overflow:hidden;
        border-color:transparent!important;
        box-shadow:none!important;
        background:transparent!important;
      }
      #listItems.is-list-home-empty::before{
        content:'';
        position:absolute;
        left:50%;
        top:46%;
        width:min(82vw,340px);
        aspect-ratio:1;
        transform:translate(-50%,-50%);
        border-radius:50%;
        background:radial-gradient(circle,rgba(45,133,76,.075) 0,rgba(45,133,76,.034) 38%,rgba(45,133,76,0) 71%);
        filter:blur(2px);
        pointer-events:none;
      }
      #listItems .list-empty-state{
        position:relative;
        z-index:1;
        width:100%;
       height:100%!important;
        min-height:360px!important;
        padding:10px 22px max(30px,env(safe-area-inset-bottom))!important;
        display:flex!important;
        flex-direction:column;
        align-items:center!important;
        justify-content:center!important;
        gap:0!important;
        color:#0d5138!important;
        text-align:center;
      }
      .list-empty-visual{
        width:min(47vw,190px);
        aspect-ratio:14/11;
        display:grid;
        place-items:center;
        margin:0 auto 17px;
        filter:drop-shadow(0 8px 16px rgba(47,94,57,.055));
      }
      .list-empty-visual img{        display:block;
        width:100%;
        height:100%;
        object-fit:contain;
        user-select:none;
        -webkit-user-drag:none;
      }
      .list-empty-copy{display:flex;flex-direction:column;align-items:center;gap:5px}
      .list-empty-copy strong{
        color:#094c35;
        font-size:clamp(20px,5.2vw,24px);
        line-height:1.08;
        font-weight:800;
        letter-spacing:-.035em;
      }
      .list-empty-copy span{
        max-width:300px;
        color:#7d8490;
        font-size:clamp(12.5px,3.3vw,14.5px);
        line-height:1.4;
        font-weight:500;
        letter-spacing:-.01em;
      }
      .list-empty-action{
        margin-top:19px;
        min-width:min(62vw,232px);
        max-width:calc(100vw - 72px);
        height:44px;
        padding:0 20px;
        border:1px solid rgba(10,89,55,.055);
        border-radius:999px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:9px;
        background:linear-gradient(180deg,#198957 0%,#12794c 100%);
        color:#fff!important;
        box-shadow:0 9px 20px rgba(18,113,69,.17),inset 0 1px 0 rgba(255,255,255,.18);
        font-size:14px;
        line-height:1;
        font-weight:760;
        letter-spacing:-.012em;
        cursor:pointer;        -webkit-appearance:none;
        appearance:none;
        transition:transform .12s ease,filter .12s ease,box-shadow .12s ease;      }
      .list-empty-action svg{width:15px;height:15px;flex:0 0 15px}
      .list-empty-action:active{
        transform:scale(.978);
        filter:brightness(.98);
        box-shadow:0 6px 15px rgba(18,113,69,.14),inset 0 1px 0 rgba(255,255,255,.16);
      }
      html #dishDialog .dish-confirm-feedback-layer{
        width:min(calc(100vw - 58px),286px)!important;
        padding:26px 24px 23px!important;
        gap:9px!important;
        border:1px solid rgba(255,255,255,.88)!important;
        border-radius:30px!important;
        background:linear-gradient(158deg,rgba(255,255,255,.985) 0%,rgba(244,249,246,.965) 58%,rgba(238,247,241,.95) 100%)!important;
        box-shadow:0 30px 80px rgba(18,48,31,.22),0 9px 24px rgba(33,82,54,.12),inset 0 1px 0 rgba(255,255,255,.95),0 0 0 200vmax rgba(17,42,29,.095)!important;
        -webkit-backdrop-filter:blur(30px) saturate(145%)!important;
        backdrop-filter:blur(30px) saturate(145%)!important;
        overflow:visible!important;
      }
      html #dishDialog .dish-confirm-feedback-layer::before{
        content:'';
        position:absolute;
        inset:1px;
        border-radius:29px;
        background:linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,0) 42%);
        pointer-events:none;
      }
      html #dishDialog .dish-confirm-feedback-mark{
        position:relative!important;
        width:64px!important;
        height:64px!important;
        margin-bottom:3px!important;
        background:linear-gradient(145deg,#28aa68 0%,#117c4b 72%,#0b6f42 100%)!important;
        box-shadow:0 13px 30px rgba(17,124,75,.28),inset 0 1px 0 rgba(255,255,255,.32),0 0 0 7px rgba(31,151,89,.075)!important;
        font-size:31px!important;
        font-weight:850!important;
      }
      html #dishDialog .dish-confirm-feedback-mark::before{
        content:'';
        position:absolute;
        inset:-11px;
        border:1px solid rgba(27,139,82,.16);
        border-radius:50%;
        opacity:0;
      }
      html #dishDialog .dish-confirm-feedback-layer strong{
        position:relative;
        color:#112c20!important;
        font-size:20px!important;
        line-height:1.08!important;
        font-weight:850!important;
        letter-spacing:-.035em!important;
      }
      html #dishDialog .dish-confirm-feedback-layer small{
        position:relative;
        max-width:220px;
        color:#74837a!important;
        font-size:12.5px!important;
        line-height:1.35!important;
        font-weight:620!important;
        letter-spacing:-.01em!important;
        text-align:center!important;
      }
      html #dishDialog.is-confirm-feedback .dish-confirm-feedback-layer{animation:dishConfirmPremium .56s cubic-bezier(.16,.88,.24,1) both!important}
      html #dishDialog.is-confirm-feedback .dish-confirm-feedback-mark::before{animation:dishConfirmHalo .58s ease-out both}
      html #dishDialog.is-confirm-feedback .dish-sheet-list,
      html #dishDialog.is-confirm-fedback .dish-sheet-head,
      html #dishDialog.is-confirm-fedback .dish-sheet-note{
        opacity:.15!important;
        filter:blur(1.15px) saturate(.86)!important;
        transition:opacity .18s ease,filter .18s ease!important;
      }
      @keyframes dishConfirmPremium{
        0%{opacity:0;transform:translate(-50%,-43%) scale(.88)}
        58%{opacity:1;transform:translate(-50%,-51%) scale(1.018)}
        100%{opacity:1;transform:translate(-50%,-50%) scale(1)}
      }
      @keyframes dishConfirmHalo{
        0%{opacity:0;transform:scale(.74)}
        48%{opacity:1}
        100%{opacity:.08;transform:scale(1.24)}
      }
      @media(max-width:520px) and (max-height:900px){
        #settingsView .settings-logout{
          height:44px!important;
          min-height:44px!important;
          margin:-12px 0 2px!important;
        }
      }
      @media(max-height:700px){
        #listItems .list-empty-state{min-height:300px!important;padding-top:8px!important;padding-bottom:20px!important}
        .list-empty-visual{width:min(42vw,165px);margin-bottom:12px}
        .list-empty-action{margin-top:15px;height:42px;min-width:min(60vw,220px)}
      }
      @media(prefers-reduced-motion:reduce){
        html #dishDialog.is-confirm-feedback .dish-confirm-feedback-layer{animation:none!important;opacity:1!important;transform:translate(-50%,-50%)!important}
        html #dishDialog.is-confirm-feedback .dish-confirm-feedback-mark::before{animation:none!important;opacity:.12!important}
      }
    `;
    document.head.appendChild(style);
  }
}

function securityViewportHeight(){
  return Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||0);
}
function isSecurityPasswordField(target=document.activeElement){
  return target===document.getElementById('securityPassword')||target===document.getElementById('securityConfirm');
}
function syncSecurityKeyboardState(){
  const shell=document.querySelector('.security-shell');
  if(!shell)return;
  const overlay=document.getElementById('securityOverlay');
  const active=isSecurityPasswordField();
  if(!overlay?.classList.contains('is-visible')||!active){
    shell.classList.remove('is-password-open');
    if(!active)securityKeyboardBaseline=0;
    return;
  }
  const current=securityViewportHeight();
  if(!securityKeyboardBaseline)securityKeyboardBaseline=current;
  shell.classList.toggle('is-password-open',securityKeyboardBaseline-current>120);
}
function bindSecurityKeyboardViewport(){
  if(document.documentElement.dataset.securityKeyboardViewport==='1')return;
  document.documentElement.dataset.securityKeyboardViewport='1';
  document.addEventListener('focus',event=>{
    if(!isSecurityPasswordField(event.target))return;
    securityKeyboardBaseline=securityViewportHeight();
    Promise.resolve().then(syncSecurityKeyboardState);
  },true);
  document.addEventListener('blur',event=>{
    if(!isSecurityPasswordField(event.target))return;
    securityKeyboardBaseline=0;
    requestAnimationFrame(syncSecurityKeyboardState);
  },true);
  window.visualViewport?.addEventListener('resize',syncSecurityKeyboardState,{passive:true});
  window.addEventListener('resize',syncSecurityKeyboardState,{passive:true});
  window.addEventListener('pageshow',()=>{
    securityKeyboardBaseline=0;
    requestAnimationFrame(syncSecurityKeyboardState);
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')return;
    securityKeyboardBaseline=0;
    requestAnimationFrame(syncSecurityKeyboardState);
  });
  requestAnimationFrame(syncSecurityKeyboardState);
}
function syncListEmptyState(root){
  if(!root)return;
  const design='premium-v4';
  const empty=root.children.length===1&&root.firstElementChild?.classList.contains('empty')?root.firstElementChild:null;
  if(empty?.classList.contains('list-empty-state')&&empty.dataset.emptyDesign===design){
    root.classList.add('is-list-home-empty');
    return;
  }
  const nativeEmpty=Boolean(empty&&empty.children.length===0&&empty.textContent.trim()==='La liste est vide.');
  if(empty)empty.hidden=false;
  const shouldEnhance=Boolean(empty&&(nativeEmpty||empty.classList.contains('list-empty-state')));
  root.classList.toggle('is-list-home-empty',shouldEnhance);
  if(!shouldEnhance)return;
  empty.classList.add('list-empty-state');
  empty.dataset.emptyDesign=design;
  empty.innerHTML=`
    <div class="list-empty-visual" aria-hidden="true">
      <img src="./www/empty-list-premium-v4.webp?v=305" alt="" loading="eager" decoding="sync" fetchpriority="high" draggable="false">
    </div>
    <div class="list-empty-copy">
      <strong>Votre liste est prête</strong>
      <span>Ajoutez vos produits depuis le catalogue</span>
    </div>
    <button class="list-empty-action" type="button">
      <span>Ouvrir le catalogue</span>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  empty.querySelector('.list-empty-action')?.addEventListener('click',()=>{
    document.querySelector('.tab[data-view="catalog"]')?.click();
  });
}

function bind(){
  syncPageVersions();
  syncListEmptyState(document.getElementById('listItems'));
}

syncPageVersions();
bindSecurityKeyboardViewport();
document.addEventListener('courses:list-rendered',()=>syncListEmptyState(document.getElementById('listItems')));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();
