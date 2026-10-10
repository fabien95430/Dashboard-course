(() => {
'use strict';

const REQUESTS=window.COURSES_MISSING_REQUESTS;
if(!REQUESTS)throw new Error('Demandes manquantes indisponibles');
const PRODUCT_IMAGE_HINT_MAX=REQUESTS.productImageHintMax;
const CHATGPT_URL='https://chatgpt.com/';
const normalize=REQUESTS.normalize;
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function catalogDishCategories(){
  const categories=[...document.querySelectorAll('.dish-filter[data-value]')]
    .map(button=>String(button.dataset.value||'').trim())
    .filter(value=>value&&value!=='Tous'&&value!=='Favoris');
  return [...new Set(categories)];
}
function sanitizeDishCategory(value){
  const category=String(value||'').trim().replace(/\s+/g,' ').slice(0,80);
  if(!category)return '';
  const categories=catalogDishCategories();
  return !categories.length||categories.includes(category)?category:'';
}
function readDishes(){
  return REQUESTS.readDishes().map(item=>({...item,category:sanitizeDishCategory(item.category)}));
}
function readAddedDishes(){
  return REQUESTS.readAddedDishes().map(item=>({...item,category:sanitizeDishCategory(item.category)}));
}
const readProducts=()=>REQUESTS.readProducts();
const productCount=()=>REQUESTS.counts().products;
function appNotify(title,detail=''){
  const dialog=document.getElementById('missingProductsDialog');
  const toast=dialog?.open?document.getElementById('missingProductsFeedback'):document.getElementById('toast');
  if(!toast)return;
  toast.textContent=detail?title+' — '+detail:title;
  toast.classList.remove('is-error');
  toast.classList.add('is-visible');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>toast.classList.remove('is-visible'),3000);
}
function notifyRequest(name){
  appNotify('Ajout en cours',name);
}
async function notifyProductQueued(id){
  if(!('Notification' in window)||!('serviceWorker' in navigator))return false;
  let permission=Notification.permission;
  if(permission==='default'){
    try{permission=await Notification.requestPermission()}catch(_){return false}
  }
  if(permission!=='granted')return false;
  try{
    const registration=await navigator.serviceWorker.ready;
    await registration.showNotification('Produit à générer',{
      body:'Un produit a été ajouté à la liste',
      tag:'courses-product-to-generate-'+String(id||'request'),
      icon:'./apple-touch-icon.png',
      badge:'./apple-touch-icon.png',
      data:{url:'./'},
      renotify:true
    });
    return true;
  }catch(_){
    return false;
  }
}
function notifyAdded(type,name){
  const title=type==='dish'?'Plat ajouté':'Produit ajouté';
  appNotify(title,name+' est maintenant disponible dans le catalogue.');
}
function fallbackCopy(text){
  const area=document.createElement('textarea');
  area.value=text;
  area.setAttribute('readonly','');
  area.style.position='fixed';
  area.style.opacity='0';
  area.style.pointerEvents='none';
  document.body.appendChild(area);
  area.focus({preventScroll:true});
  area.select();
  let copied=false;
  try{copied=document.execCommand('copy')}catch(_){}
  area.remove();
  return copied;
}
function launchChatGpt(prompt){
  fallbackCopy(prompt);
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(prompt).catch(()=>{});
  }
  const opened=window.open(CHATGPT_URL,'_blank');
  if(opened){
    try{opened.opener=null}catch(_){}
  }else{
    location.href=CHATGPT_URL;
  }
}
function buildProductPrompt(item){
  const category=item.category||'non précisée';
  const imageHint=REQUESTS.productImageHint(item.name);
  return [
    'Tu travailles sur le projet Application Course.',
    '',
    'SOURCE DE VÉRITÉ : dépôt GitHub fabien95430/Dashboard-course, branche main.',
    'Avant toute modification, lis le dépôt actuel et comprends l’implémentation existante. Ne te base pas sur une ancienne conversation.',
    '',
    'Demande : intégrer le produit « '+item.name+' » dans le catalogue.',
    'Catégorie proposée par l’utilisateur : '+category+'.',
    ...(imageHint?[
      'Précision fournie par l’utilisateur pour le visuel ou le contenant : « '+imageHint+' ».',
      'Cette précision décrit l’apparence, la forme, le contenant ou l’emballage à représenter. Si elle indique explicitement un contenant, utilise-le aussi comme conditionnement visible. Elle ne doit jamais modifier le nom du produit.'
    ]:[]),
    '',
    'Exécute directement cette demande : le feu vert est donné.',
    '',
    'Contraintes obligatoires :',
    '- Faire le changement minimum nécessaire, sans refondre ce qui fonctionne.',
    '- catalog.js reste la source du catalogue.',
    '- Conserver l’architecture HTML/CSS/JS statique, GitHub Pages et Home Assistant.',
    '- Ne jamais réduire la sécurité : OAuth, WebSocket, coffre chiffré, verrouillage et biométrie restent intacts.',
    '- Préserver mobile-first et les safe areas iOS.',
    '- Ne pas ajouter de framework, backend ou dépendance externe.',
    '- Pour le produit, choisir le sous-groupe cohérent dans catalog.js après lecture du catalogue actuel.',
    '- Lire et respecter docs/IMAGES_ITEMS.md et product-item-images.js avant de créer le visuel.',
    '- Générer exactement une image WebP pour ce produit, dans le même style que les items existants de sa catégorie : un seul produit, fond transparent, centré, proportions naturelles, sans décor, sans personne, sans marque ou logo inventé.',
    '- Stocker le visuel dans www/Items/ avec le nom de fichier attendu par le slugify() actuel de product-item-images.js.',
    '- Utiliser uniquement l’image WebP unitaire dans www/Items/ ; aucun atlas ou sprite produit ne doit être créé ni réintroduit.',
    '- Versionner le visuel/cache selon les conventions actuelles pour que l’image arrive réellement dans l’application.',
    '- Vérifier les impacts sur Ma liste, Catalogue, mode hors ligne, Home Assistant, sécurité, mode test et mobile.',
    '',
    'À la fin, vérifie le résultat puis commit directement sur main avec un message conforme aux versions actuelles.'
  ].join('\n');
}
function buildDishPrompt(item){
  const category=item.category||'non précisée';
  return [
    'Tu travailles sur le projet Application Course.',
    '',
    'SOURCE DE VÉRITÉ : dépôt GitHub fabien95430/Dashboard-course, branche main.',
    'Avant toute modification, lis le dépôt actuel et comprends l’implémentation existante. Ne te base pas sur une ancienne conversation.',
    '',
    'Demande : intégrer le plat « '+item.name+' » dans l’application.',
    'Catégorie/tag proposé par l’utilisateur : '+category+'.',
    '',
    'Exécute directement cette demande : le feu vert est donné.',
    '',
    'Contraintes obligatoires :',
    '- Faire le changement minimum nécessaire, sans refondre ce qui fonctionne.',
    '- catalog.js reste la source des ingrédients : utiliser uniquement des noms de produits qui existent réellement dans catalog.js.',
    '- Respecter la structure actuelle des plats dans dishes-ui.js et les conventions de dish-local-images.js.',
    '- Choisir les tags adaptés parmi ceux déjà utilisés par l’application.',
    '- Générer une seule image finale pour ce plat, jamais un atlas ni un collage.',
    '- L’image doit être harmonisée avec les autres photos de plats : même cadrage, même ambiance, plat entier ou presque entier, pas de texte, logo, watermark, main ou personne.',
    '- Stocker l’image locale dans www/Plats selon la convention actuelle et mettre à jour les versions/cache nécessaires pour qu’elle arrive réellement dans l’application.',
    '- Conserver l’architecture HTML/CSS/JS statique, GitHub Pages et Home Assistant.',
    '- Ne jamais réduire la sécurité : OAuth, WebSocket, coffre chiffré, verrouillage et biométrie restent intacts.',
    '- Préserver mobile-first et les safe areas iOS.',
    '- Ne pas ajouter de framework, backend ou dépendance externe.',
    '- Vérifier les impacts sur Ma liste, Catalogue, Home Assistant, sécurité, mode test et mobile.',
    '',
    'À la fin, vérifie le résultat puis commit directement sur main avec un message conforme aux versions actuelles.'
  ].join('\n');
}
function catalogProductLookup(){
  const lookup=new Map();
  const groups=window.COURSES_CATALOG?.groups||{};
  Object.entries(groups).forEach(([category,subgroups])=>{
    Object.values(subgroups||{}).forEach(names=>{
      (Array.isArray(names)?names:[]).forEach(name=>lookup.set(normalize(name),category));
    });
  });
  return lookup;
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

  const settingsCopy=settingsButton.querySelector('.settings-copy');
  if(settingsCopy){
    const title=settingsCopy.querySelector('strong');
    const subtitle=settingsCopy.querySelector('small');
    if(title)title.textContent='Produits & plats manquants';
    if(subtitle)subtitle.textContent='Noter les produits et plats absents du catalogue';
  }
  const dialogTitle=dialog.querySelector('.missing-products-header h3');
  const dialogIntro=dialog.querySelector('.missing-products-header .dialog-intro');
  const categoryTitle=categoryHeading.querySelector('strong');
  if(dialogTitle)dialogTitle.textContent='Produits & plats manquants';
  if(dialogIntro)dialogIntro.textContent='Ajoutez les produits ou plats absents du catalogue.';
  if(categoryTitle)categoryTitle.textContent='Catégorie';

  const style=document.createElement('style');
  style.id='missing-products-dishes-ui';
  style.textContent=`
    #missingProductsDialog .preference-dialog-scroll{overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch;touch-action:pan-y}
    #missingProductsDialog .missing-mode-switch{position:relative;display:grid;grid-template-columns:1fr 1fr;height:40px;margin:10px 0 9px;padding:4px;border-radius:20px;background:rgba(228,234,230,.78);overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}
    #missingProductsDialog .missing-mode-lens{position:absolute;z-index:0;left:4px;top:4px;width:calc(50% - 4px);height:32px;border-radius:17px;background:rgba(255,255,255,.98);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 5px 13px rgba(42,49,45,.12);transform:translate3d(0,0,0);transition:transform .34s cubic-bezier(.22,.9,.28,1),border-radius .18s ease,box-shadow .18s ease;will-change:transform}
    #missingProductsDialog .missing-mode-switch.is-dishes .missing-mode-lens{transform:translate3d(100%,0,0)}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-lens{border-radius:15px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 7px 17px rgba(42,49,45,.16)}
    #missingProductsDialog .missing-mode-button{position:relative;z-index:1;border:0;background:transparent;color:#758078;font-size:12.5px;font-weight:780;border-radius:17px;padding:0 12px;transition:color .2s ease,transform .2s cubic-bezier(.3,1.4,.5,1)}
    #missingProductsDialog .missing-mode-button.is-active{color:#0b6f3e}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-button.is-active{transform:scale(1.025)}
    #missingProductsDialog .missing-image-hint-field{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;align-items:center;margin:0 0 8px;padding:5px 8px;border:1px solid rgba(35,144,90,.13);border-radius:14px;background:linear-gradient(145deg,rgba(246,251,248,.96),rgba(239,247,242,.82));box-shadow:inset 0 1px 0 rgba(255,255,255,.94)}
    #missingProductsDialog .missing-image-hint-field[hidden]{display:none!important}
    #missingProductsDialog .missing-image-hint-mark{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:rgba(35,144,90,.10);color:#17844d;font-size:14px;font-weight:850}
    #missingProductsDialog #missingProductImageHint{width:100%;min-width:0;height:32px;border:0;border-radius:9px;background:transparent;color:#1a2821;padding:0 3px;font-size:12.5px;font-weight:620;outline:none;-webkit-appearance:none;appearance:none}
    #missingProductsDialog #missingProductImageHint::placeholder{color:#98a29c;font-weight:560}
    #missingProductsDialog #missingProductImageHint:focus{box-shadow:none}
    #missingProductsDialog .missing-image-hint-optional{color:#8a948e;font-size:9.5px;font-weight:720;white-space:nowrap;padding-right:2px}
    #missingProductsDialog .missing-category-grid{display:none!important}
    #missingProductsDialog .missing-category-panel{display:grid!important;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:10px;margin:0 0 10px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
    #missingProductsDialog .missing-category-heading{display:block!important;margin:0!important;padding:0!important}
    #missingProductsDialog .missing-category-heading strong{font-size:12px!important;line-height:1!important;font-weight:790!important;color:#526159!important;white-space:nowrap}
    #missingProductsDialog .missing-category-heading small{display:none!important}
    #missingProductsDialog .missing-category-select{width:100%;min-width:0;height:40px;border:1px solid #e0e7e2;border-radius:12px;background:#fff;color:#27342d;padding:0 11px;font-size:12.5px;font-weight:700;outline:none}
    #missingProductsDialog .missing-category-select:focus{border-color:#cbd8cf;box-shadow:0 0 0 3px rgba(38,144,82,.07)}
    #missingProductsDialog .missing-products-list-heading{margin-top:8px!important;margin-bottom:5px!important}
    #missingProductsDialog .missing-products-list,#missingProductsDialog .missing-dishes-list{flex:0 0 auto!important;min-height:auto!important;max-height:none!important;overflow:visible!important;overscroll-behavior:auto!important;-webkit-overflow-scrolling:auto!important}
    #missingProductsDialog .missing-dishes-list[hidden]{display:none!important}
    #missingProductsDialog .missing-product-row.has-integration-action{grid-template-columns:38px minmax(0,1fr) auto 42px!important;gap:8px!important}
    #missingProductsDialog .missing-product-row.is-dish{gap:10px;align-items:center}
    #missingProductsDialog .missing-product-row.is-dish .missing-product-mark{font-size:17px;line-height:1;flex:0 0 auto}
    #missingProductsDialog .missing-product-row.is-dish .missing-product-copy{min-width:0;flex:1 1 auto}
    #missingProductsDialog .missing-dish-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex:0 0 auto}
    #missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{border:0;border-radius:999px;min-height:40px;padding:0 14px;background:#e5f4e9;color:#0b7040;font-size:12px;font-weight:850;white-space:nowrap}
    #missingProductsDialog .missing-product-remove:disabled{opacity:.3}
    @media(max-width:390px){#missingProductsDialog .missing-mode-switch{height:38px;margin:9px 0 8px}#missingProductsDialog .missing-mode-lens{height:30px}#missingProductsDialog .missing-image-hint-field{grid-template-columns:28px minmax(0,1fr) auto;gap:6px;padding:4px 7px}#missingProductsDialog .missing-image-hint-mark{width:28px;height:28px;border-radius:9px;font-size:13px}#missingProductsDialog #missingProductImageHint{height:30px;font-size:12px}#missingProductsDialog .missing-category-panel{gap:8px}#missingProductsDialog .missing-category-select{height:38px;font-size:12px}#missingProductsDialog .missing-product-row.has-integration-action{grid-template-columns:32px minmax(0,1fr) auto 40px!important;gap:6px!important}#missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{padding:0 11px!important;font-size:11px!important}}
    @media(prefers-reduced-motion:reduce){#missingProductsDialog .missing-mode-lens,#missingProductsDialog .missing-mode-button{transition:none!important}}
  `;
  document.head.appendChild(style);

  const modeSwitch=document.createElement('div');
  modeSwitch.className='missing-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type d’élément manquant');
  modeSwitch.innerHTML='<span class="missing-mode-lens" aria-hidden="true"></span><button class="missing-mode-button is-active" type="button" data-missing-mode="products" role="tab" aria-selected="true">Produits</button><button class="missing-mode-button" type="button" data-missing-mode="dishes" role="tab" aria-selected="false">Plats</button>';
  addRow.before(modeSwitch);

  const imageHintField=document.createElement('label');
  imageHintField.className='missing-image-hint-field';
  imageHintField.innerHTML='<span class="missing-image-hint-mark" aria-hidden="true">✦</span><input id="missingProductImageHint" type="text" maxlength="'+PRODUCT_IMAGE_HINT_MAX+'" autocomplete="off" autocapitalize="sentences" placeholder="Précision image · ex. tube d’épice" aria-label="Précision pour l’image du produit"><small class="missing-image-hint-optional">Optionnel</small>';
  addRow.after(imageHintField);
  const imageHintInput=imageHintField.querySelector('#missingProductImageHint');

  const categorySelect=document.createElement('select');
  categorySelect.className='missing-category-select';
  categorySelect.setAttribute('aria-label','Choisir une catégorie');
  categoryPanel.appendChild(categorySelect);

  const dishesList=document.createElement('div');
  dishesList.id='missingDishesList';
  dishesList.className='missing-products-list missing-dishes-list';
  dishesList.hidden=true;
  productList.after(dishesList);

  let dishes=readDishes();
  let mode='products';
  let lastMode='products';
  let dishCategory='';
  let swapTimer=0;
  let pointerStart=null;
  let productEnhanceQueued=false;
  let knownProductIds=new Set(readProducts().map(item=>item.id));
  const completedThisSession=new Set();

  function selectedProductCategory(){
    return categoryGrid.querySelector('.missing-category-choice.is-active')?.dataset?.missingCategory||'';
  }
  function categoryLabel(category){return category||'Aucune'}
  function renderCategorySelect(){
    const selected=mode==='dishes'?dishCategory:selectedProductCategory();
    const options=mode==='dishes'
      ?['',...catalogDishCategories()].map(value=>({value,label:categoryLabel(value)}))
      :[...categoryGrid.querySelectorAll('[data-missing-category]')].map(button=>({value:button.dataset.missingCategory||'',label:button.textContent.trim()}));
    categorySelect.innerHTML=options.map(option=>'<option value="'+escapeHtml(option.value)+'">'+escapeHtml(option.label)+'</option>').join('');
    categorySelect.value=selected;
  }
  function renderDishes(){
    dishes=readDishes();
    const added=readAddedDishes();
    const rows=[...dishes.map(item=>({item,added:false})),...added.map(item=>({item,added:true}))];
    if(!rows.length){
      dishesList.innerHTML='<div class="missing-products-empty">Aucun plat noté pour le moment.</div>';
      return;
    }
    dishesList.innerHTML=rows.map(entry=>{
      const item=entry.item;
      const category=item.category?'<small>'+escapeHtml(item.category)+'</small>':'';
      const addedClass=entry.added?' is-added-request':'';
      const addedData=entry.added?' data-missing-dish-added="1"':'';
      const addedButton=entry.added?' disabled aria-disabled="true"':'';
      const label=entry.added?'Ajouté ✓':'Intégrer';
      return '<div class="missing-product-row is-dish'+addedClass+'" data-missing-dish-row="'+escapeHtml(item.id)+'"'+addedData+'>'+
        '<span class="missing-product-mark" aria-hidden="true">•</span>'+
        '<span class="missing-product-copy"><strong>'+escapeHtml(item.name)+'</strong>'+category+'</span>'+
        '<span class="missing-dish-actions"><button class="missing-dish-integrate" type="button" data-integrate-missing-dish="'+escapeHtml(item.id)+'"'+addedButton+'>'+label+'</button></span>'+
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
    imageHintField.hidden=dishesMode;
    listHeading.textContent=dishesMode?'Plats manquants':'Produits manquants';
    productList.hidden=dishesMode;
    dishesList.hidden=!dishesMode;
    if(dishesMode){
      renderDishes();
      listCount.textContent=String(dishes.length);
    }else{
      listCount.textContent=String(productCount());
      queueEnhanceProducts();
    }
    renderCategorySelect();
  }
  function setMode(next,{animate=true,clearInput=true}={}){
    if(next!=='products'&&next!=='dishes')return;
    if(mode===next){renderMode();return}
    mode=next;
    lastMode=next;
    if(clearInput){
      input.value='';
      imageHintInput.value='';
    }
    if(animate&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      modeSwitch.classList.add('is-swapping');
      clearTimeout(swapTimer);
      swapTimer=setTimeout(()=>modeSwitch.classList.remove('is-swapping'),330);
      navigator.vibrate?.(4);
    }
    renderMode();
  }
  function saveProductImageHintDraft(){
    if(mode!=='products')return;
    const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!name)return;
    REQUESTS.setProductImageHint(name,imageHintInput.value);
    queueMicrotask(()=>{
      if(!String(input.value||'').trim())imageHintInput.value='';
    });
  }
  function addDish(){
  const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
  if(!name){input.focus();return}
  const result=REQUESTS.addDish({name,category:dishCategory});
  if(!result.ok)return;
  dishes=result.items;
  input.value='';
  dishCategory='';
  renderMode();
  notifyRequest(name);
  navigator.vibrate?.(8);
}
function removeDish(id){
  const result=REQUESTS.removeDish(id);
  if(!result.ok)return;
  dishes=result.items;
  renderMode();
  navigator.vibrate?.(6);
}
  function integrateDish(id){
    const item=readDishes().find(entry=>entry.id===id);
    if(!item)return;
    launchChatGpt(buildDishPrompt(item));
    navigator.vibrate?.(10);
  }
  function integrateProduct(id){
    const item=readProducts().find(entry=>entry.id===id);
    if(!item)return;
    launchChatGpt(buildProductPrompt(item));
    navigator.vibrate?.(10);
  }
  function enhanceProductRows(){
    productEnhanceQueued=false;
    const products=readProducts();
    const rows=[...productList.querySelectorAll('.missing-product-row')];
    rows.forEach((row,index)=>{
      const item=products[index];
      if(!item)return;
      row.dataset.missingProductRow=item.id;
      row.classList.add('has-integration-action');
      let integrate=row.querySelector('[data-integrate-missing-product]');
      if(!integrate){
        integrate=document.createElement('button');
        integrate.type='button';
        integrate.className='missing-product-integrate';
        integrate.textContent='Intégrer';
        const remove=row.querySelector('[data-remove-missing]');
        if(remove)row.insertBefore(integrate,remove);
        else row.appendChild(integrate);
      }
      integrate.dataset.integrateMissingProduct=item.id;
    });
  }
  function queueEnhanceProducts(){
    if(productEnhanceQueued)return;
    productEnhanceQueued=true;
    requestAnimationFrame(()=>{
      enhanceProductRows();
      reconcileProducts();
    });
  }
  function revealProduct(id){
    if(!id||mode!=='products')return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const row=[...productList.querySelectorAll('[data-missing-product-row]')].find(entry=>entry.dataset.missingProductRow===String(id));
      row?.scrollIntoView?.({block:'nearest',behavior:'auto'});
    }));
  }
  function reconcileProducts(){
    const catalog=catalogProductLookup();
    if(!catalog.size)return;
    const products=readProducts();
    products.forEach(item=>{
      if(!catalog.has(normalize(item.name))||completedThisSession.has('product:'+item.id))return;
      const row=[...productList.querySelectorAll('[data-missing-product-row]')].find(entry=>entry.dataset.missingProductRow===item.id);
      const remove=row?.querySelector('[data-remove-missing]');
      if(!remove)return;
      completedThisSession.add('product:'+item.id);
      notifyAdded('product',item.name);
      remove.click();
    });
  }
  function dishImageReady(item){
    const card=[...document.querySelectorAll('#dishes .dish-card[data-dish]')].find(entry=>normalize(entry.dataset.dish)===normalize(item.name));
    if(!card)return false;
    const image=card.querySelector('img');
    if(!image)return false;
    const src=String(image.getAttribute('src')||'');
    const localPhoto=src.includes('/www/Plats/')||src.includes('www/Plats/');
    if(!localPhoto)return false;
    if(image.complete&&image.naturalWidth>0)return true;
    if(!image.dataset.missingDishLoadWatch){
      image.dataset.missingDishLoadWatch='1';
      image.addEventListener('load',()=>reconcileDishes(),{once:true});
    }
    return false;
  }
  function reconcileDishes(){
    const current=readDishes();
    const completed=current.filter(item=>dishImageReady(item));
    if(!completed.length)return false;
    completed.forEach(REQUESTS.rememberAddedDish);
    const completedIds=new Set(completed.map(item=>item.id));
    REQUESTS.writeDishes(current.filter(item=>!completedIds.has(item.id)));
    completed.forEach(item=>{
      if(completedThisSession.has('dish:'+item.id))return;
      completedThisSession.add('dish:'+item.id);
      notifyAdded('dish',item.name);
    });
    if(mode==='dishes'){
      dishes=readDishes();
      renderDishes();
      listCount.textContent=String(dishes.length);
    }
    return true;
  }
  function syncNewProductRequests(){
    const products=readProducts();
    REQUESTS.pruneProductImageHints(products);
    const nextIds=new Set(products.map(item=>item.id));
    const added=[];
    products.forEach(item=>{
      if(!knownProductIds.has(item.id)){
        added.push(item);
        notifyRequest(item.name);
        void notifyProductQueued(item.id);
      }
    });
    knownProductIds=nextIds;
    if(mode==='products')listCount.textContent=String(products.length);
    queueEnhanceProducts();
    if(added.length)revealProduct(added[added.length-1].id);
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

  categorySelect.addEventListener('change',()=>{
    const category=categorySelect.value||'';
    if(mode==='dishes'){
      const categories=catalogDishCategories();
      dishCategory=!category||categories.includes(category)?category:'';
    }else{
      const original=[...categoryGrid.querySelectorAll('[data-missing-category]')].find(button=>(button.dataset.missingCategory||'')===category);
      original?.onclick?.();
    }
    renderCategorySelect();
    navigator.vibrate?.(4);
  });

  addButton.addEventListener('click',event=>{
    if(mode==='products'){
      saveProductImageHintDraft();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  input.addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;
    if(mode==='products'){
      saveProductImageHintDraft();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  imageHintInput.addEventListener('keydown',event=>{
    if(mode!=='products'||event.key!=='Enter')return;
    event.preventDefault();
    addButton.click();
  });

  productList.addEventListener('click',event=>{
    const integrate=event.target.closest('[data-integrate-missing-product]');
    if(!integrate)return;
    event.preventDefault();
    event.stopPropagation();
    integrateProduct(integrate.dataset.integrateMissingProduct||'');
  });
  dishesList.addEventListener('click',event=>{
    const integrate=event.target.closest('[data-integrate-missing-dish]');
    if(integrate){
      integrateDish(integrate.dataset.integrateMissingDish||'');
      return;
    }
    const remove=event.target.closest('[data-remove-missing-dish]');
    if(!remove)return;
    event.stopPropagation();
    removeDish(remove.dataset.removeMissingDish||'');
  });

  new MutationObserver(()=>{
    if(mode==='products')renderCategorySelect();
  }).observe(categoryGrid,{attributes:true,subtree:true,attributeFilter:['class','aria-pressed']});

  const productObserver=new MutationObserver(syncNewProductRequests);
  productObserver.observe(productList,{childList:true,subtree:true});

  let catalogCategoryObserver=null;
  if(!catalogDishCategories().length){
    catalogCategoryObserver=new MutationObserver(()=>{
      if(!catalogDishCategories().length)return;
      catalogCategoryObserver.disconnect();
      catalogCategoryObserver=null;
      if(mode==='dishes')renderCategorySelect();
    });
    catalogCategoryObserver.observe(document.documentElement,{childList:true,subtree:true});
  }

  const renderedCatalogObserver=new MutationObserver(()=>{
    reconcileProducts();
    reconcileDishes();
  });
  renderedCatalogObserver.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});

    settingsButton.addEventListener('click',()=>{
    imageHintInput.value='';
    setMode(lastMode,{animate:false,clearInput:false});
    requestAnimationFrame(()=>{
      renderCategorySelect();
      syncNewProductRequests();
      reconcileDishes();
    });
  });
  dialog.addEventListener('close',()=>{
    lastMode=mode;
    imageHintInput.value='';
  });

  renderMode();
  queueEnhanceProducts();
  reconcileDishes();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMissingProductsAndDishes,{once:true});
else initMissingProductsAndDishes();
})();