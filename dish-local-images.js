(() => {
'use strict';

const APP_VERSION='v289';
window.COURSES_APP_VERSION=APP_VERSION;

const SPECIAL_SLUGS=Object.freeze({
  'Tagliatelles au saumon':'tagliatelles-saumon',
  'Gratin de courgettes':'gratin-courgettes',
  'Poulet pommes de terre au four':'poulet-pommes-de-terre-four'
});
const CHILD_DISHES=new Set([
  'Boulettes riz',
  'Coquillettes jambon',
  'Couscous poulet légumes',
  'Gratin pommes de terre',
  'Pâtes jambon',
  'Purée carotte poulet',
  'Risotto poulet',
  'Saumon brocoli',
  'Steak frites',
  'Velouté carottes',
  'Crème brûlée',
  'Riz au lait'
]);
const DISH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#eef1eb"/><ellipse cx="450" cy="330" rx="250" ry="170" fill="#f8f7f2" stroke="#cbd2c8" stroke-width="12"/><text x="450" y="350" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="30" font-weight="700" fill="#708076">Photo indisponible</text></svg>');
const PRODUCT_VISUALS=Object.freeze([
  './bring-photo-v5-frais.webp.png?v=15',
  './bring-photo-v5-fruits-legumes.webp.png?v=15',
  './bring-photo-v5-epicerie.webp.png?v=15',
  './bring-photo-v5-boissons.webp.png?v=15',
  './bring-photo-v5-maison.webp.png?v=15'
]);
const PRIMARY_DISH_VISUALS=Object.freeze([
  './www/Plats/spaghetti-carbonara.png?v='+APP_VERSION,
  './www/Plats/spaghetti-bolognaise.png?v='+APP_VERSION,
  './www/Plats/penne-poulet-creme.png?v='+APP_VERSION,
  './www/Plats/pates-tomate-mozzarella.png?v='+APP_VERSION,
  './www/Plats/lasagnes-bolognaise.png?v='+APP_VERSION,
  './www/Plats/tagliatelles-saumon.png?v='+APP_VERSION
]);
const DISH_WARMUP_BATCH_SIZE=2;
const retainedVisuals=new Map();
const capturedDishVisuals=new Set(PRIMARY_DISH_VISUALS);
const warmedDishVisuals=new Set();
let renderedDishWarmupQueued=false;
let dishVisualWarmupRunning=false;
let dishUnlockObserver=null;
let securityKeyboardBaseline=0;
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

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
      html #missingProductsDialog .is-request-product .missing-product-copy small:not(.missing-dish-error){background:#f4f7f5!important;color:#66736c!important}
      html #missingProductsDialog .is-request-dish .missing-product-copy small:not(.missing-dish-error){background:#faf7ef!important;color:#7c705b!important}
      html #missingProductsDialog .is-request-dessert .missing-product-copy small:not(.missing-dish-error){background:#faf3ef!important;color:#8a6b60!important}
      .list-row-menu{
        padding:0!important;
        border:1px solid rgba(255,255,255,.22)!important;
        border-radius:18px!important;
        background:rgba(126,129,126,.92)!important;
        color:#fff!important;
        box-shadow:0 12px 28px rgba(32,38,34,.24),inset 0 1px 0 rgba(255,255,255,.14)!important;
        -webkit-backdrop-filter:saturate(120%) blur(22px)!important;
        backdrop-filter:saturate(120%) blur(22px)!important;
        overflow:hidden!important;
      }
      .list-row-menu-delete{
        height:48px!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        color:#ff453a!important;
        display:flex!important;
        align-items:center!important;
        gap:11px!important;
        padding:0 16px!important;
        text-align:left!important;
        font-size:16px!important;
        font-weight:500!important;
        letter-spacing:-.01em!important;
      }
      .list-row-menu-delete::before{
        content:'';
        width:20px;
        height:20px;
        flex:0 0 20px;
        background:center/20px 20px no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ff453a' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 7h16'/%3E%3Cpath d='M9 7V4h6v3'/%3E%3Cpath d='m6.5 7 .8 13h9.4l.8-13'/%3E%3Cpath d='M10 11v5M14 11v5'/%3E%3C/svg%3E");
      }
      .list-row-menu-delete:active{background:rgba(255,255,255,.10)!important}
      #listItems.is-list-home-empty{
        position:relative;
        overflow:hidden;
        border-color:transparent!important;
        box-shadow:none!important;
        background:radial-gradient(circle at 50% 45%,rgba(92,154,95,.12) 0,rgba(92,154,95,.055) 28%,rgba(92,154,95,0) 63%)!important;
      }
      #listItems.is-list-home-empty::before{
        content:'';
        position:absolute;
        inset:12% 8% 14%;
        border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,.56),rgba(255,255,255,0) 68%);
        pointer-events:none;
      }
      #listItems .list-empty-state{
        position:relative;
        z-index:1;
        width:100%;
        height:100%!important;
        min-height:360px!important;
        padding:22px 20px max(34px,env(safe-area-inset-bottom))!important;
        display:flex!important;
        flex-direction:column;
        align-items:center!important;
        justify-content:center!important;
        gap:0!important;
        color:#0d5138!important;
        text-align:center;
      }
      .list-empty-visual{
        width:min(52vw,210px);
        aspect-ratio:11/8;
        display:grid;
        place-items:center;
        margin:0 auto 20px;
        filter:drop-shadow(0 12px 24px rgba(52,94,63,.08));
      }
      .list-empty-visual svg{display:block;width:100%;height:auto;overflow:visible}
      .list-empty-copy{display:flex;flex-direction:column;align-items:center;gap:6px}
      .list-empty-copy strong{
        color:#0a4b35;
        font-size:clamp(20px,5.4vw,25px);
        line-height:1.08;
        font-weight:800;
        letter-spacing:-.035em;
      }
      .list-empty-copy span{
        max-width:290px;
        color:#7d8490;
        font-size:clamp(12px,3.4vw,15px);
        line-height:1.35;
        font-weight:500;
      }
      .list-empty-action{
        margin-top:22px;
        min-width:min(76vw,270px);
        height:48px;
        padding:0 22px;
        border:0;
        border-radius:999px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        background:linear-gradient(135deg,#16794d,#218b55);
        color:#fff!important;
        box-shadow:0 12px 24px rgba(22,121,77,.18),inset 0 1px 0 rgba(255,255,255,.18);
        font-size:14px;
        font-weight:760;
        letter-spacing:-.01em;
        cursor:pointer;
        -webkit-appearance:none;
        appearance:none;
        transition:transform .12s ease,filter .12s ease;
      }
      .list-empty-action svg{width:16px;height:16px;flex:0 0 16px}
      .list-empty-action:active{transform:scale(.975);filter:brightness(.97)}
      @media(max-height:700px){
        #listItems .list-empty-state{min-height:300px!important;padding-top:14px!important;padding-bottom:22px!important}
        .list-empty-visual{width:min(43vw,170px);margin-bottom:14px}
        .list-empty-action{margin-top:16px;height:44px}
      }
    `;
    document.head.appendChild(style);
  }
}

function installVisualWarmupStyle(){
  if(document.getElementById('courses-startup-visual-warmup'))return;
  const style=document.createElement('style');
  style.id='courses-startup-visual-warmup';
  style.textContent='html.courses-product-visuals-warming #listItems .list-icon{visibility:hidden!important}';
  document.head.appendChild(style);
}
function installMissingProductsFixes(){
  if(!document.querySelector('script[data-missing-products-fixes]')){
    const script=document.createElement('script');
    script.src='./missing-products-fixes.js?v=13';
    script.defer=true;
    script.dataset.missingProductsFixes='1';
    document.head.appendChild(script);
  }
  if(!document.querySelector('script[data-missing-products-popup-ui]')){
    const script=document.createElement('script');
    script.src='./missing-products-popup-ui.js?v=13';
    script.defer=true;
    script.dataset.missingProductsPopupUi='1';
    document.head.appendChild(script);
  }
}
function installCatalogQuantities(){
  if(document.querySelector('script[data-catalog-quantities]'))return;
  const script=document.createElement('script');
  script.src='./catalog-quantities.js?v=3';
  script.defer=true;
  script.dataset.catalogQuantities='1';
  document.head.appendChild(script);
}
function installProductItemImages(){
  if(document.querySelector('script[data-product-item-images]'))return;
  const script=document.createElement('script');
  script.src='./product-item-images.js?v=9';
  script.defer=true;
  script.dataset.productItemImages='1';
  document.head.appendChild(script);
}
function installPurchaseIntelligence(){
  if(document.querySelector('script[data-purchase-intelligence]'))return;
  const script=document.createElement('script');
  script.src='./purchase-intelligence.js?v=3';
  script.defer=true;
  script.dataset.purchaseIntelligence='1';
  document.head.appendChild(script);
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
async function warmVisual(src,priority='auto'){
  if(retainedVisuals.has(src))return true;
  const image=new Image();
  image.decoding='async';
  try{image.fetchPriority=priority}catch(_){}
  image.src=src;
  try{
    if(typeof image.decode==='function')await image.decode();
    else await new Promise(resolve=>{
      if(image.complete){resolve();return}
      image.onload=resolve;
      image.onerror=resolve;
    });
    retainedVisuals.set(src,image);
    return true;
  }catch(_){return false}
}
async function warmProductVisuals(){
  document.documentElement.classList.add('courses-product-visuals-warming');
  try{
    const work=Promise.allSettled(PRODUCT_VISUALS.map(src=>warmVisual(src,'high')));
    await Promise.race([work,new Promise(resolve=>setTimeout(resolve,3500))]);
  }finally{
    document.documentElement.classList.remove('courses-product-visuals-warming');
  }
}
function scheduleDishVisualWarmup(){
  const run=()=>{void Promise.allSettled(PRIMARY_DISH_VISUALS.map(src=>warmVisual(src,'low')))};
  if('requestIdleCallback' in window)window.requestIdleCallback(run,{timeout:1800});
  else setTimeout(run,500);
}
function captureRenderedDishVisuals(){
  const images=[...document.querySelectorAll('#dishes .dish-card img')];
  images.forEach(image=>{
    const src=image.getAttribute('src')||'';
    if(src&&!src.startsWith('data:'))capturedDishVisuals.add(src);
  });
  return images;
}
function appUnlocked(){
  const app=document.getElementById('app');
  return Boolean(app&&!app.classList.contains('is-locked'));
}
function waitForDishWarmupSlot(){
  return new Promise(resolve=>{
    if('requestIdleCallback' in window)window.requestIdleCallback(()=>resolve(),{timeout:900});
    else setTimeout(resolve,120);
  });
}
async function warmDishSource(src){
  if(warmedDishVisuals.has(src))return true;
  const warmed=await warmVisual(src,'low');
  if(warmed)warmedDishVisuals.add(src);
  return warmed;
}
async function warmCapturedDishVisuals(){
  if(dishVisualWarmupRunning||!appUnlocked())return;
  dishVisualWarmupRunning=true;
  try{
    const sources=[...capturedDishVisuals];
    for(let index=0;index<sources.length;index+=DISH_WARMUP_BATCH_SIZE){
      await waitForDishWarmupSlot();
      const batch=sources.slice(index,index+DISH_WARMUP_BATCH_SIZE).filter(src=>!warmedDishVisuals.has(src));
      if(batch.length)await Promise.allSettled(batch.map(warmDishSource));
    }
  }finally{
    dishVisualWarmupRunning=false;
  }
}
function scheduleCapturedDishWarmup(){
  captureRenderedDishVisuals();
  if(appUnlocked()){
    void warmCapturedDishVisuals();
    return;
  }
  const app=document.getElementById('app');
  if(!app||dishUnlockObserver)return;
  dishUnlockObserver=new MutationObserver(()=>{
    if(!appUnlocked())return;
    dishUnlockObserver.disconnect();
    dishUnlockObserver=null;
    queueRenderedDishWarmup();
  });
  dishUnlockObserver.observe(app,{attributes:true,attributeFilter:['class']});
}
function warmRenderedDishCards(){
  const images=captureRenderedDishVisuals();
  if(!appUnlocked()){
    scheduleCapturedDishWarmup();
    return;
  }
  images.slice(0,8).forEach((image,index)=>{
    image.loading='eager';
    try{image.fetchPriority=index<4?'high':'auto'}catch(_){}
    if(typeof image.decode==='function')void image.decode().catch(()=>{});
  });
  scheduleCapturedDishWarmup();
}
function queueRenderedDishWarmup(){
  captureRenderedDishVisuals();
  if(renderedDishWarmupQueued)return;
  renderedDishWarmupQueued=true;
  requestAnimationFrame(()=>{
    renderedDishWarmupQueued=false;
    warmRenderedDishCards();
  });
}

function localDishImage(name){
  const slug=SPECIAL_SLUGS[name]||slugify(name);
  return './www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+slug+'.png?v='+encodeURIComponent(APP_VERSION);
}
function sameImageSource(image,source){
  const current=image?.getAttribute?.('src')||'';
  if(current===source)return true;
  try{return image.src===new URL(source,document.baseURI).href}catch(_){return false}
}
function bindImageFallback(image){
  if(!image||image.dataset.localImageFallbackBound==='1')return;
  image.dataset.localImageFallbackBound='1';
  image.addEventListener('error',()=>{
    const name=image.dataset.localDish||'';
    if(!name)return;
    const current=image.getAttribute('src')||'';
    if(!sameImageSource(image,localDishImage(name))&&current!==DISH_PLACEHOLDER)return;
    image.dataset.localImageFailed=name;
    if(current!==DISH_PLACEHOLDER)image.src=DISH_PLACEHOLDER;
  });
}
function localizeImage(image,name){
  if(!name||!image)return;
  bindImageFallback(image);
  const source=localDishImage(name);
  const current=image.getAttribute('src')||'';
  if(image.dataset.localImageFailed===name&&current===DISH_PLACEHOLDER){
    image.dataset.localDish=name;
    return;
  }
  image.dataset.localDish=name;
  if(sameImageSource(image,source))return;
  delete image.dataset.localImageFailed;
  image.src=source;
}
function localizeCard(card){
  const name=card?.dataset?.dish||'';
  const image=card?.querySelector?.('.dish-visual img');
  localizeImage(image,name);
}
function localizeCards(grid){
  grid?.querySelectorAll?.('.dish-card').forEach(localizeCard);
}
function localizeDialog(dialog){
  if(!dialog?.open)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const image=dialog.querySelector('.dish-sheet-photo');
  localizeImage(image,name);
}
function retryLocalImages(){
  const grid=document.getElementById('dishes');
  grid?.querySelectorAll?.('.dish-card img').forEach(image=>delete image.dataset.localImageFailed);
  const dialog=document.getElementById('dishDialog');
  const dialogImage=dialog?.querySelector?.('.dish-sheet-photo');
  if(dialogImage)delete dialogImage.dataset.localImageFailed;
  localizeCards(grid);
  localizeDialog(dialog);
}

function syncListEmptyState(root){
  if(!root)return;
  const empty=root.children.length===1&&root.firstElementChild?.classList.contains('empty')?root.firstElementChild:null;
  if(empty?.classList.contains('list-empty-state')){
    root.classList.add('is-list-home-empty');
    return;
  }
  const shouldEnhance=Boolean(empty&&empty.children.length===0&&empty.textContent.trim()==='La liste est vide.');
  root.classList.toggle('is-list-home-empty',shouldEnhance);
  if(!shouldEnhance)return;
  empty.classList.add('list-empty-state');
  empty.innerHTML=`
    <div class="list-empty-visual" aria-hidden="true">
      <svg viewBox="0 0 220 160" role="presentation">
        <ellipse cx="110" cy="145" rx="72" ry="9" fill="rgba(83,132,83,.08)"/>
        <path d="M68 74c4-25 20-38 42-38s38 13 42 38" fill="none" stroke="#4f8157" stroke-width="4" stroke-linecap="round"/>
        <g transform="rotate(-12 70 70)">
          <rect x="55" y="34" width="29" height="82" rx="14" fill="#ead7a8" stroke="#5d8a5d" stroke-width="3"/>
          <path d="M66 54l7 10M63 75l8 11M61 95l7 10" stroke="#5d8a5d" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <path d="M98 79c-11-17-4-35 5-39 11 5 12 18 9 30 5-13 14-21 22-18 5 12-2 25-17 34" fill="#b8cfad" stroke="#5d8a5d" stroke-width="3" stroke-linejoin="round"/>
        <path d="M137 49h17v10l6 9v43h-29V68l6-9z" fill="#f9faf4" stroke="#4f8157" stroke-width="3" stroke-linejoin="round"/>
        <path d="M137 49h17" stroke="#2f6f45" stroke-width="7" stroke-linecap="round"/>
        <circle cx="159" cy="84" r="18" fill="#c4d8ae" stroke="#5d8a5d" stroke-width="3"/>
        <path d="M157 65c5-7 10-7 14-6-3 6-8 9-14 9" fill="#84b37d" stroke="#5d8a5d" stroke-width="2" stroke-linejoin="round"/>
        <path d="M49 79h122l-9 60H58z" fill="#f7f8f1" fill-opacity=".92" stroke="#4f8157" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M70 79c1-14 10-23 21-23s20 9 21 23" fill="none" stroke="#4f8157" stroke-width="3" stroke-linecap="round"/>
        <g transform="translate(88 101)" fill="none" stroke="#91ba83" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 0h7l5 20h31l5-14H13"/>
          <circle cx="18" cy="28" r="2.5" fill="#91ba83" stroke="none"/>
          <circle cx="40" cy="28" r="2.5" fill="#91ba83" stroke="none"/>
        </g>
        <path d="M39 70c6 0 11 3 15 8-7 1-13-1-17-5M178 64c-7 1-12 5-15 11 8 0 13-3 17-8" fill="#a9cda0" stroke="#76a66f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M109 18v12M84 25l8 10M134 25l-7 10" stroke="#4f8157" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="list-empty-copy">
      <strong>Votre liste est prête</strong>
      <span>Ajoutez vos produits depuis le catalogue</span>
    </div>
    <button class="list-empty-action" type="button">
      <span>Ouvrir le catalogue</span>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  empty.querySelector('.list-empty-action')?.addEventListener('click',()=>{
    document.querySelector('.tab[data-view="catalog"]')?.click();
  });
}

let gridObserver=null;
let dialogObserver=null;
let listEmptyObserver=null;
let versionFrame=0;
const bootstrapObserver=new MutationObserver(()=>bind());
const versionObserver=new MutationObserver(()=>{
  if(versionFrame)return;
  versionFrame=requestAnimationFrame(()=>{
    versionFrame=0;
    syncPageVersions();
  });
});
const dishWarmupObserver=new MutationObserver(mutations=>{
  if(!mutations.some(mutation=>mutation.addedNodes.length))return;
  if(!document.querySelector('#dishes .dish-card img'))return;
  queueRenderedDishWarmup();
  dishWarmupObserver.disconnect();
});

function bind(){
  syncPageVersions();
  const listItems=document.getElementById('listItems');
  if(listItems&&!listEmptyObserver){
    syncListEmptyState(listItems);
    listEmptyObserver=new MutationObserver(()=>syncListEmptyState(listItems));
    listEmptyObserver.observe(listItems,{childList:true,subtree:true,characterData:true});
  }
  const grid=document.getElementById('dishes');
  if(grid&&!gridObserver){
    localizeCards(grid);
    gridObserver=new MutationObserver(()=>localizeCards(grid));
    gridObserver.observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  }
  const dialog=document.getElementById('dishDialog');
  if(dialog&&!dialogObserver){
    localizeDialog(dialog);
    dialogObserver=new MutationObserver(()=>localizeDialog(dialog));
    dialogObserver.observe(dialog,{attributes:true,subtree:true,attributeFilter:['open','src']});
  }
  if(gridObserver&&dialogObserver&&listEmptyObserver)bootstrapObserver.disconnect();
}

syncPageVersions();
installVisualWarmupStyle();
installMissingProductsFixes();
installCatalogQuantities();
installProductItemImages();
installPurchaseIntelligence();
bindSecurityKeyboardViewport();
void warmProductVisuals();
scheduleDishVisualWarmup();
versionObserver.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
bootstrapObserver.observe(document.documentElement,{childList:true,subtree:true});
dishWarmupObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',event=>{
  if(event.target.closest?.('.catalog-mode[data-mode="dishes"],.tab[data-view="catalog"]'))setTimeout(queueRenderedDishWarmup,0);
},true);
window.addEventListener('online',retryLocalImages,{passive:true});
window.addEventListener('online',queueRenderedDishWarmup,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();