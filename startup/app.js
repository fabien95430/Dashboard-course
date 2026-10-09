(() => {
'use strict';

const root=document.documentElement;
const retained=[];

// Ne jamais bloquer le premier rendu : le préchargement reste une optimisation,
// pas une condition d'affichage de l'écran de connexion.
root.classList.remove('startup-assets-pending');

function preloadVisual(src,priority='high'){
  const image=new Image();
  image.decoding='sync';
  try{image.fetchPriority=priority}catch(_){}
  image.src=src;
  retained.push(image);
  return image;
}

preloadVisual('./welcome-background-v40.webp');
preloadVisual('./welcome-cart-transparent-v46.png');
preloadVisual('./www/empty-list-premium-v4.webp?v=305');
window.COURSES_STARTUP_VISUALS=retained;

function installMissingProductsCompactLayout(){
  if(document.getElementById('courses-missing-products-compact-layout'))return;
  const style=document.createElement('style');
  style.id='courses-missing-products-compact-layout';
  style.textContent=`
    html body #missingProductsDialog .missing-products-close{
      display:none!important;
    }
    html body #missingProductsDialog .missing-products-header{
      padding-right:0!important;
    }
    html body #missingProductsDialog .missing-products-header>div{
      width:100%!important;
      min-width:0!important;
    }
    html body #missingProductsDialog .missing-products-header h3{
      white-space:nowrap!important;
      font-size:clamp(19px,5.6vw,22px)!important;
    }
    html body #missingProductsDialog .missing-category-panel{
      margin-bottom:4px!important;
    }
    html body #missingProductsDialog .missing-products-list-heading{
      margin-top:0!important;
    }
  `;
  document.head.appendChild(style);
}

installMissingProductsCompactLayout();

function loadErrorCenter(){
  if(document.querySelector('script[data-courses-error-center]'))return;
  const script=document.createElement('script');
  script.src='./error-center.js?v=1';
  script.defer=true;
  script.dataset.coursesErrorCenter='1';
  document.head.appendChild(script);
}

loadErrorCenter();

const listRoot=document.getElementById('listItems');
if(!listRoot)return;

function installListSyncPreviewStyle(){
  if(document.getElementById('courses-list-sync-preview-style'))return;
  const style=document.createElement('style');
  style.id='courses-list-sync-preview-style';
  style.textContent=`
    #listItems.is-list-sync-preview{
      position:relative;
      overflow:hidden;
      border-color:transparent!important;
      box-shadow:none!important;
      background:transparent!important;
    }
    #listItems .list-sync-preview{
      position:relative;
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
    #listItems .list-sync-preview-visual{
      width:min(47vw,190px);
      aspect-ratio:14/11;
      display:grid;
      place-items:center;
      margin:0 auto 17px;
      filter:drop-shadow(0 8px 16px rgba(47,94,57,.055));
    }
    #listItems .list-sync-preview-visual img{
      display:block;
      width:100%;
      height:100%;
      object-fit:contain;
      user-select:none;
      -webkit-user-drag:none;
    }
    #listItems .list-sync-preview-copy{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:5px;
    }
    #listItems .list-sync-preview-copy strong{
      color:#094c35;
      font-size:clamp(20px,5.2vw,24px);
      line-height:1.08;
      font-weight:800;
      letter-spacing:-.035em;
    }
    #listItems .list-sync-preview-copy span{
      max-width:300px;
      color:#7d8490;
      font-size:clamp(12.5px,3.3vw,14.5px);
      line-height:1.4;
      font-weight:500;
    }
    #listItems .list-sync-preview-action{
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
      cursor:pointer;
      -webkit-appearance:none;
      appearance:none;
    }
    #listItems .list-sync-preview-action svg{width:15px;height:15px;flex:0 0 15px}
    #listItems .list-sync-preview-action:active{transform:scale(.978)}
    @media(max-height:700px){
      #listItems .list-sync-preview{min-height:300px!important;padding-top:8px!important;padding-bottom:20px!important}
      #listItems .list-sync-preview-visual{width:min(42vw,165px);margin-bottom:12px}
      #listItems .list-sync-preview-action{margin-top:15px;height:42px;min-width:min(60vw,220px)}
    }
  `;
  document.head.appendChild(style);
}

function bindCatalogAction(state){
  state.querySelector('.list-sync-preview-action')?.addEventListener('click',()=>{
    document.querySelector('.tab[data-view="catalog"]')?.click();
  });
}

function syncListLoadingPreview(){
  const state=listRoot.children.length===1&&listRoot.firstElementChild?.classList.contains('empty')
    ?listRoot.firstElementChild:null;

  if(state?.dataset.listSyncPreview==='1'){
    listRoot.classList.add('is-list-sync-preview');
    return;
  }

  const loading=Boolean(state&&state.textContent.trim()==='Synchronisation…');
  if(!loading){
    listRoot.classList.remove('is-list-sync-preview');
    return;
  }

  listRoot.classList.add('is-list-sync-preview');
  state.dataset.listSyncPreview='1';
  state.classList.add('list-sync-preview');
  state.innerHTML=`
    <div class="list-sync-preview-visual" aria-hidden="true">
      <img src="./www/empty-list-premium-v4.webp?v=305" alt="" loading="eager" decoding="sync" fetchpriority="high" draggable="false">
    </div>
    <div class="list-sync-preview-copy">
      <strong>Synchronisation…</strong>
      <span>Mise à jour de votre liste de courses</span>
    </div>
    <button class="list-sync-preview-action" type="button">
      <span>Ouvrir le catalogue</span>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  bindCatalogAction(state);
}

installListSyncPreviewStyle();
new MutationObserver(syncListLoadingPreview).observe(listRoot,{childList:true,subtree:true,characterData:true});
syncListLoadingPreview();
})();