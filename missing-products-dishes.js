(() => {
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const DISH_CATEGORIES=Object.freeze(['','Pâtes','Viandes','Poulet','Poissons','Rapides','Enfants','Végé']);
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function readDishes(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_DISHES)||'[]');
    if(!Array.isArray(saved))return [];
    return saved.slice(-100).map((item,index)=>{
      const name=String(item?.name||'').trim().replace(/\s+/g,' ').slice(0,80);
      if(!name)return null;
      const category=DISH_CATEGORIES.includes(item?.category)?item.category:'';
      const id=String(item?.id||('dish-'+index+'-'+normalize(name)));
      return {id,name,category};
    }).filter(Boolean);
  }catch(_){
    return [];
  }
}
function saveDishes(items){
  try{localStorage.setItem(STORAGE_DISHES,JSON.stringify(items.slice(-100)))}catch(_){}
  syncCombinedCount();
}
function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function productCount(){
  try{
    const saved=JSON.parse(localStorage.getItem('courses-missing-products-v1')||'[]');
    return Array.isArray(saved)?saved.length:0;
  }catch(_){return 0}
}
function syncCombinedCount(){
  const source=document.getElementById('settingsMissingProductsCount');
  if(!source)return;
  const total=productCount()+readDishes().length;
  if(source.textContent!==String(total))source.textContent=String(total);
  if(source.hidden!==(total===0))source.hidden=total===0;
}

function initMissingProductsAndDishes(){
  const dialog=document.getElementById('missingProductsDialog');
  const settingsButton=document.getElementById('settingsMissingProductsBtn');
  const input=document.getElementById('missingProductName');
  const addButton=document.getElementById('addMissingProduct');
  const addRow=dialog?.querySelector('.missing-products-add');
  const categoryPanel=dialog?.querySelector('.missing-category-panel');
  const categoryHeading=categoryPanel?.querySelector('.missing-category-heading');
  const categoryGrid=document.getElementById('missingCategoryGrid');
  const productList=document.getElementById('missingProductsList');
  const listHeading=dialog?.querySelector('.missing-products-list-heading strong');
  const listCount=document.getElementById('missingProductsListCount');
  if(!dialog||!settingsButton||!input||!addButton||!addRow||!categoryPanel||!categoryHeading||!categoryGrid||!productList||!listHeading||!listCount)return;

  const countSource=document.getElementById('settingsMissingProductsCount');
  if(countSource)new MutationObserver(()=>queueMicrotask(syncCombinedCount)).observe(countSource,{attributes:true,childList:true,characterData:true,subtree:true});

  const settingsCopy=settingsButton.querySelector('.settings-copy');
  if(settingsCopy){
    const title=settingsCopy.querySelector('strong');
    const subtitle=settingsCopy.querySelector('small');
    if(title)title.textContent='Produits & plats manquants';
    if(subtitle)subtitle.textContent='Noter les produits et plats absents du catalogue';
  }
  const dialogTitle=dialog.querySelector('.missing-products-header h3');
  const dialogIntro=dialog.querySelector('.missing-products-header .dialog-intro');
  if(dialogTitle)dialogTitle.textContent='Produits & plats manquants';
  if(dialogIntro)dialogIntro.textContent='Ajoutez ici les produits ou plats absents du catalogue. Cette liste reste sur cet appareil.';

  const style=document.createElement('style');
  style.id='missing-products-dishes-ui';
  style.textContent=`
    #missingProductsDialog .missing-mode-switch{position:relative;display:grid;grid-template-columns:1fr 1fr;height:44px;margin:14px 0 12px;padding:4px;border-radius:22px;background:rgba(228,234,230,.78);overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}
    #missingProductsDialog .missing-mode-lens{position:absolute;z-index:0;left:4px;top:4px;width:calc(50% - 4px);height:36px;border-radius:19px;background:rgba(255,255,255,.98);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 6px 16px rgba(42,49,45,.13);transform:translate3d(0,0,0);transition:transform .34s cubic-bezier(.22,.9,.28,1),border-radius .18s ease,box-shadow .18s ease;will-change:transform}
    #missingProductsDialog .missing-mode-switch.is-dishes .missing-mode-lens{transform:translate3d(100%,0,0)}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-lens{border-radius:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 20px rgba(42,49,45,.17)}
    #missingProductsDialog .missing-mode-button{position:relative;z-index:1;border:0;background:transparent;color:#758078;font-size:13px;font-weight:780;border-radius:18px;padding:0 12px;transition:color .2s ease,transform .2s cubic-bezier(.3,1.4,.5,1)}
    #missingProductsDialog .missing-mode-button.is-active{color:#0b6f3e}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-button.is-active{transform:scale(1.035)}
    #missingProductsDialog .missing-category-grid{display:none!important}
    #missingProductsDialog .missing-category-heading{margin-bottom:8px!important}
    #missingProductsDialog .missing-category-trigger{width:100%;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;border:1px solid rgba(33,55,43,.10);border-radius:15px;background:rgba(255,255,255,.72);color:#27342d;font-size:13px;font-weight:720;text-align:left}
    #missingProductsDialog .missing-category-trigger::after{content:'›';font-size:22px;line-height:1;color:#7e8982;transform:rotate(90deg)}
    #missingProductsDialog .missing-category-popup{position:fixed;z-index:30;inset:0;display:grid;align-items:end;padding:18px;background:rgba(17,25,20,.18);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .18s ease,visibility 0s linear .18s}
    #missingProductsDialog .missing-category-popup.is-open{opacity:1;visibility:visible;transition-delay:0s}
    #missingProductsDialog .missing-category-sheet{width:min(100%,380px);max-height:min(62vh,470px);margin:0 auto;padding:8px 10px calc(10px + env(safe-area-inset-bottom));border-radius:22px;background:rgba(252,253,251,.98);box-shadow:0 22px 60px rgba(22,34,27,.22);overflow:auto;transform:translateY(18px) scale(.985);transition:transform .24s cubic-bezier(.22,.9,.28,1)}
    #missingProductsDialog .missing-category-popup.is-open .missing-category-sheet{transform:translateY(0) scale(1)}
    #missingProductsDialog .missing-category-sheet-title{display:block;padding:9px 12px 8px;color:#34423a;font-size:13px;font-weight:820}
    #missingProductsDialog .missing-category-option{width:100%;min-height:44px;display:flex;align-items:center;padding:0 13px;border:0;border-radius:13px;background:transparent;color:#202a24;font-size:13px;font-weight:680;text-align:left}
    #missingProductsDialog .missing-category-option+ .missing-category-option{border-top:1px solid rgba(33,55,43,.065);border-top-left-radius:0;border-top-right-radius:0}
    #missingProductsDialog .missing-category-option.is-selected{background:rgba(14,142,76,.10);color:#0b6f3e;font-weight:800}
    #missingProductsDialog .missing-dishes-list[hidden]{display:none!important}
    #missingProductsDialog .missing-product-row.is-dish .missing-product-mark{font-size:17px;line-height:1}
    @media(prefers-reduced-motion:reduce){#missingProductsDialog .missing-mode-lens,#missingProductsDialog .missing-mode-button,#missingProductsDialog .missing-category-popup,#missingProductsDialog .missing-category-sheet{transition:none!important}}
  `;
  document.head.appendChild(style);

  const modeSwitch=document.createElement('div');
  modeSwitch.className='missing-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type d’élément manquant');
  modeSwitch.innerHTML='<span class="missing-mode-lens" aria-hidden="true"></span><button class="missing-mode-button is-active" type="button" data-missing-mode="products" role="tab" aria-selected="true">Produits</button><button class="missing-mode-button" type="button" data-missing-mode="dishes" role="tab" aria-selected="false">Plats</button>';
  addRow.before(modeSwitch);

  const categoryTrigger=document.createElement('button');
  categoryTrigger.className='missing-category-trigger';
  categoryTrigger.type='button';
  categoryTrigger.setAttribute('aria-haspopup','dialog');
  categoryTrigger.setAttribute('aria-expanded','false');
  categoryPanel.appendChild(categoryTrigger);

  const categoryPopup=document.createElement('div');
  categoryPopup.className='missing-category-popup';
  categoryPopup.setAttribute('aria-hidden','true');
  categoryPopup.innerHTML='<div class="missing-category-sheet" role="dialog" aria-modal="true" aria-label="Choisir une catégorie"><strong class="missing-category-sheet-title">Choisir une catégorie</strong><div class="missing-category-options"></div></div>';
  dialog.appendChild(categoryPopup);
  const categoryOptions=categoryPopup.querySelector('.missing-category-options');

  const dishesList=document.createElement('div');
  dishesList.id='missingDishesList';
  dishesList.className='missing-products-list missing-dishes-list';
  dishesList.hidden=true;
  productList.after(dishesList);

  let dishes=readDishes();
  let mode='products';
  let dishCategory='';
  let swapTimer=0;
  let pointerStart=null;

  function selectedProductCategory(){
    return categoryGrid.querySelector('.missing-category-choice.is-active')?.dataset?.missingCategory||'';
  }
  function productCategoryLabel(category){
    const button=[...categoryGrid.querySelectorAll('[data-missing-category]')].find(item=>(item.dataset.missingCategory||'')===category);
    return button?.textContent?.trim()||(category||'Aucune');
  }
  function categoryLabel(category){return category||'Aucune'}
  function currentCategory(){return mode==='dishes'?dishCategory:selectedProductCategory()}
  function currentCategoryLabel(){return mode==='dishes'?categoryLabel(dishCategory):productCategoryLabel(selectedProductCategory())}

  function closeCategoryPopup(){
    categoryPopup.classList.remove('is-open');
    categoryPopup.setAttribute('aria-hidden','true');
    categoryTrigger.setAttribute('aria-expanded','false');
  }
  function openCategoryPopup(){
    renderCategoryOptions();
    categoryPopup.classList.add('is-open');
    categoryPopup.setAttribute('aria-hidden','false');
    categoryTrigger.setAttribute('aria-expanded','true');
  }
  function renderCategoryOptions(){
    const options=mode==='dishes'
      ?DISH_CATEGORIES.map(value=>({value,label:categoryLabel(value)}))
      :[...categoryGrid.querySelectorAll('[data-missing-category]')].map(button=>({value:button.dataset.missingCategory||'',label:button.textContent.trim()}));
    const selected=currentCategory();
    categoryOptions.innerHTML=options.map(option=>'<button class="missing-category-option '+(option.value===selected?'is-selected':'')+'" type="button" data-missing-popup-category="'+escapeHtml(option.value)+'">'+escapeHtml(option.label)+'</button>').join('');
  }
  function syncCategoryTrigger(){
    categoryTrigger.textContent=currentCategoryLabel();
  }
  function renderDishes(){
    dishes=readDishes();
    if(!dishes.length){
      dishesList.innerHTML='<div class="missing-products-empty">Aucun plat noté pour le moment.</div>';
      return;
    }
    dishesList.innerHTML=dishes.map(item=>{
      const category=item.category?'<small>'+escapeHtml(item.category)+'</small>':'';
      return '<div class="missing-product-row is-dish">'+
        '<span class="missing-product-mark" aria-hidden="true">•</span>'+
        '<span class="missing-product-copy"><strong>'+escapeHtml(item.name)+'</strong>'+category+'</span>'+
        '<button class="missing-product-remove" type="button" data-remove-missing-dish="'+escapeHtml(item.id)+'" aria-label="Supprimer '+escapeHtml(item.name)+'"><svg><use href="#i-trash"></use></svg></button>'+
      '</div>';
    }).join('');
  }
  function renderMode(){
    const dishesMode=mode==='dishes';
    modeSwitch.classList.toggle('is-dishes',dishesMode);
    modeSwitch.querySelectorAll('[data-missing-mode]').forEach(button=>{
      const active=button.dataset.missingMode===mode;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    input.placeholder=dishesMode?'Nom du plat':'Nom du produit';
    input.setAttribute('aria-label',dishesMode?'Nom du plat':'Nom du produit');
    listHeading.textContent=dishesMode?'Plats manquants':'Produits manquants';
    productList.hidden=dishesMode;
    dishesList.hidden=!dishesMode;
    if(dishesMode){
      renderDishes();
      listCount.textContent=String(dishes.length);
    }else{
      listCount.textContent=String(productCount());
    }
    syncCategoryTrigger();
    if(categoryPopup.classList.contains('is-open'))renderCategoryOptions();
  }
  function setMode(next,{animate=true,clearInput=true}={}){
    if(next!=='products'&&next!=='dishes')return;
    if(mode===next){renderMode();return}
    mode=next;
    if(clearInput)input.value='';
    closeCategoryPopup();
    if(animate&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      modeSwitch.classList.add('is-swapping');
      clearTimeout(swapTimer);
      swapTimer=setTimeout(()=>modeSwitch.classList.remove('is-swapping'),330);
      navigator.vibrate?.(4);
    }
    renderMode();
  }
  function addDish(){
    const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!name){
      input.focus();
      return;
    }
    dishes=readDishes();
    if(dishes.some(item=>normalize(item.name)===normalize(name)))return;
    dishes.push({id:randomId(),name,category:dishCategory});
    saveDishes(dishes);
    input.value='';
    dishCategory='';
    renderMode();
    navigator.vibrate?.(8);
  }
  function removeDish(id){
    dishes=readDishes();
    const next=dishes.filter(item=>item.id!==id);
    if(next.length===dishes.length)return;
    dishes=next;
    saveDishes(dishes);
    renderMode();
    navigator.vibrate?.(6);
  }

  modeSwitch.addEventListener('click',event=>{
    const button=event.target.closest('[data-missing-mode]');
    if(button)setMode(button.dataset.missingMode||'products');
  });
  modeSwitch.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    pointerStart={id:event.pointerId,x:event.clientX};
  });
  modeSwitch.addEventListener('pointerup',event=>{
    if(!pointerStart||pointerStart.id!==event.pointerId)return;
    const dx=event.clientX-pointerStart.x;
    pointerStart=null;
    if(Math.abs(dx)<28)return;
    setMode(dx<0?'dishes':'products');
  });
  modeSwitch.addEventListener('pointercancel',()=>{pointerStart=null});

  categoryTrigger.addEventListener('click',openCategoryPopup);
  categoryPopup.addEventListener('click',event=>{
    if(event.target===categoryPopup){closeCategoryPopup();return}
    const option=event.target.closest('[data-missing-popup-category]');
    if(!option)return;
    const category=option.dataset.missingPopupCategory||'';
    if(mode==='dishes'){
      dishCategory=DISH_CATEGORIES.includes(category)?category:'';
    }else{
      const original=[...categoryGrid.querySelectorAll('[data-missing-category]')].find(button=>(button.dataset.missingCategory||'')===category);
      original?.click();
    }
    syncCategoryTrigger();
    closeCategoryPopup();
    navigator.vibrate?.(4);
  });

  addButton.addEventListener('click',event=>{
    if(mode!=='dishes')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  input.addEventListener('keydown',event=>{
    if(mode!=='dishes'||event.key!=='Enter')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  dishesList.addEventListener('click',event=>{
    const button=event.target.closest('[data-remove-missing-dish]');
    if(button)removeDish(button.dataset.removeMissingDish||'');
  });

  new MutationObserver(()=>{
    if(mode==='products'){
      syncCategoryTrigger();
      listCount.textContent=String(productCount());
    }
  }).observe(categoryGrid,{attributes:true,subtree:true,attributeFilter:['class','aria-pressed']});

  settingsButton.addEventListener('click',()=>{
    setMode('products',{animate:false,clearInput:false});
    requestAnimationFrame(()=>{
      syncCategoryTrigger();
      listCount.textContent=String(productCount());
    });
  });
  dialog.addEventListener('close',()=>{
    closeCategoryPopup();
    setMode('products',{animate:false,clearInput:false});
  });

  syncCategoryTrigger();
  renderMode();
  syncCombinedCount();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMissingProductsAndDishes,{once:true});
else initMissingProductsAndDishes();
})();
