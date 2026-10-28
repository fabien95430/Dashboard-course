(() => {
'use strict';

const REQUESTS=window.COURSES_MISSING_REQUESTS;
if(!REQUESTS)throw new Error('Demandes manquantes indisponibles');
const PRODUCT_IMAGE_HINT_MAX=REQUESTS.productImageHintMax;
const PRODUCT_QUEUE_NOTIFICATION_DELAY_MS=10000;
const PRODUCT_RUNNING_STORAGE='courses-missing-products-running-v1';
const CHATGPT_URL='https://chatgpt.com/';
const normalize=REQUESTS.normalize;
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const pendingProductNotifications=new Map();

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
function notifyMissingRequestsRendered(mode){
  document.dispatchEvent(new CustomEvent('courses:missing-requests-rendered',{detail:{mode}}));
}
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
function productNotificationTag(id,kind){
  const safe=String(id||'request').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(0,80)||'request';
  return 'courses-product-'+safe+'-'+String(kind||'notice');
}
function runningProductIds(){
  try{
    const value=JSON.parse(localStorage.getItem(PRODUCT_RUNNING_STORAGE)||'[]');
    return new Set(Array.isArray(value)?value.map(String):[]);
  }catch(_){
    return new Set();
  }
}
async function ensureProductNotificationPermission(){
  if(!('Notification' in window)||!('serviceWorker' in navigator))return 'unsupported';
  if(Notification.permission!=='default')return Notification.permission;
  try{return await Notification.requestPermission()}catch(_){return Notification.permission}
}
async function showProductNotification(title,body,tag){
  if(await ensureProductNotificationPermission()!=='granted')return false;
  try{
    const registration=await navigator.serviceWorker.ready;
    await registration.showNotification(title,{
      body,
      tag,
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
function notifyProductQueued(id){
  const key=String(id||'');
  if(!key)return false;
  const previous=pendingProductNotifications.get(key);
  if(previous)clearTimeout(previous);
  void ensureProductNotificationPermission();
  const timer=setTimeout(()=>{
    pendingProductNotifications.delete(key);
    const item=readProducts().find(entry=>String(entry?.id||'')===key);
    if(!item||runningProductIds().has(key))return;
    if(catalogProductLookup().has(normalize(item.name)))return;
    const notifyLocal=()=>showProductNotification(
      'Produit à générer',
      '« '+String(item.name||'Produit')+' » a été ajouté aux produits manquants.',
      productNotificationTag(key,'queued')
    );
    const delivery=window.COURSES_NOTIFICATIONS?.broadcast({
      kind:'request_added',type:'product',name:item.name,requestId:'product-'+key
    });
    if(delivery)void delivery.then(sent=>{if(!sent)void notifyLocal()}).catch(()=>{void notifyLocal()});
    else void notifyLocal();
  },PRODUCT_QUEUE_NOTIFICATION_DELAY_MS);
  pendingProductNotifications.set(key,timer);
  return true;
}
function notifyProductAlreadyPresent(id,name){
  return showProductNotification(
    'Produit déjà présent',
    '« '+String(name||'Produit')+' » existe déjà dans le catalogue. Aucun ajout effectué.',
    productNotificationTag(id,'already-present')
  );
}
function notifyProductAlreadyPending(id,name){
  return showProductNotification(
    'Produit déjà en attente',
    '« '+String(name||'Produit')+' » est déjà dans les produits manquants. Aucun doublon créé.',
    productNotificationTag(id,'already-pending')
  );
}
async function closeProductQueuedNotification(id){
  if(!('serviceWorker' in navigator))return;
  try{
    const registration=await navigator.serviceWorker.ready;
    const notifications=await registration.getNotifications({tag:productNotificationTag(id,'queued')});
    notifications.forEach(notification=>notification.close());
  }catch(_){}
}
function cancelQueuedProductNotification(id){
  const key=String(id||'');
  if(!key)return;
  const timer=pendingProductNotifications.get(key);
  if(timer){
    clearTimeout(timer);
    pendingProductNotifications.delete(key);
  }
  void closeProductQueuedNotification(key);
}
function notifyAdded(type,name){
  const title=type==='dish'?'Plat ajouté':'Produit ajouté';
  appNotify(title,name);
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
  const listHeadingRow=dialog?.querySelector('.missing-products-list-heading');
  const viewSwitch=dialog?.querySelector('.catalog-view-switch');
  const addStart=document.getElementById('missingAddStart');
  const addStartLabel=addStart?.querySelector('.missing-add-start-label');
  const addActions=dialog?.querySelector('.missing-add-actions');
  const cancelButton=document.getElementById('missingAddCancel');
  const removePanel=document.getElementById('catalogRemovePanel');
  const nameLabel=addRow?.querySelector('.missing-field-label');
  if(!dialog||!settingsButton||!input||!addButton||!addRow||!categoryPanel||!categoryHeading||!categoryGrid||!productList||!listHeading||!listCount||!listHeadingRow||!viewSwitch||!addStart||!addActions||!cancelButton||!removePanel)return;

  const settingsCopy=settingsButton.querySelector('.settings-copy');
  if(settingsCopy){
    const title=settingsCopy.querySelector('strong');
    const subtitle=settingsCopy.querySelector('small');
    if(title)title.textContent='Catalogue des produits';
    if(subtitle)subtitle.textContent='Ajouter ou supprimer des produits et des plats';
  }
  const dialogTitle=dialog.querySelector('.missing-products-header .settings-sheet-title');
  const dialogIntro=dialog.querySelector('.missing-products-header .dialog-intro');
  const categoryTitle=categoryHeading.querySelector('strong');
  if(dialogTitle)dialogTitle.textContent='Catalogue des produits';
  if(categoryTitle)categoryTitle.textContent='Catégorie';

  const style=document.createElement('style');
  style.id='missing-products-dishes-ui';
  style.textContent=`
    #missingProductsDialog .preference-dialog-scroll{overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch;touch-action:pan-y}
    #missingProductsDialog .missing-image-hint-field[hidden],#missingProductsDialog .missing-dishes-list[hidden],#missingProductsDialog .missing-category-grid[hidden]{display:none!important}
  `;
  document.head.appendChild(style);

  const modeSwitch=document.createElement('div');
  modeSwitch.className='missing-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type d’élément manquant');
  modeSwitch.innerHTML='<span class="missing-mode-lens" aria-hidden="true"></span><button class="missing-mode-button is-active" type="button" data-missing-mode="products" role="tab" aria-selected="true">Produits</button><button class="missing-mode-button" type="button" data-missing-mode="dishes" role="tab" aria-selected="false">Plats</button>';
  viewSwitch.after(modeSwitch);

  const imageHintField=document.createElement('label');
  imageHintField.className='missing-image-hint-field';
  imageHintField.innerHTML='<span class="missing-field-label">Précision pour la photo · facultatif</span><input id="missingProductImageHint" type="text" maxlength="'+PRODUCT_IMAGE_HINT_MAX+'" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" placeholder="Ex. tube d’épice" aria-label="Précision pour l’image du produit">';
  addRow.after(imageHintField);
  const imageHintInput=imageHintField.querySelector('#missingProductImageHint');

  /* Catégories des plats : même grille que celle des produits (#missingCategoryGrid, propriété d'app.js). */
  const dishCategoryGrid=document.createElement('div');
  dishCategoryGrid.className='missing-category-grid missing-dish-category-grid';
  dishCategoryGrid.hidden=true;
  categoryPanel.appendChild(dishCategoryGrid);

  const dishesList=document.createElement('div');
  dishesList.id='missingDishesList';
  dishesList.className='missing-products-list missing-dishes-list';
  dishesList.hidden=true;
  productList.after(dishesList);

  let dishes=readDishes();
  let mode='products';
  let lastMode='products';
  let dishCategory='';
  /* Deux vues (Ajout / Suppression) ; dans Ajout, la liste puis le formulaire d'ajout. */
  let view='add';
  let step='list';
  let productEnhanceQueued=false;
  let knownProductIds=new Set(readProducts().map(item=>item.id));
  const completedThisSession=new Set();
  const catalogDuplicateIds=new Set();

  function renderDishCategoryGrid(){
    const categories=['',...catalogDishCategories()];
    dishCategoryGrid.innerHTML=categories.map(value=>{
      const active=value===dishCategory;
      return '<button class="missing-category-choice'+(active?' is-active':'')+'" type="button" data-dish-category="'+escapeHtml(value)+'" aria-pressed="'+active+'"><span>'+escapeHtml(value||'Aucune')+'</span></button>';
    }).join('');
  }
  function resetProductCategory(){
    const original=categoryGrid.querySelector('[data-missing-category=""]');
    original?.onclick?.();
  }
  function syncAddButton(){
    addButton.disabled=!String(input.value||'').trim();
  }
  function applyLayout(){
    const dishesMode=mode==='dishes';
    const listStep=view==='add'&&step==='list';
    const formStep=view==='add'&&step==='form';
    dialog.dataset.catalogView=view;
    dialog.dataset.catalogStep=step;
    dialog.dataset.catalogMode=mode;
    viewSwitch.querySelectorAll('[data-catalog-view]').forEach(button=>{
      const active=button.dataset.catalogView===view;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    viewSwitch.hidden=formStep;
    modeSwitch.hidden=formStep;
    addStart.hidden=!listStep;
    if(addStartLabel)addStartLabel.textContent=dishesMode?'Ajouter un plat':'Ajouter un produit';
    addRow.hidden=!formStep;
    if(nameLabel)nameLabel.textContent=dishesMode?'Nom du plat':'Nom du produit';
    imageHintField.hidden=!formStep||dishesMode;
    categoryPanel.hidden=!formStep;
    categoryGrid.hidden=dishesMode;
    dishCategoryGrid.hidden=!dishesMode;
    addActions.hidden=!formStep;
    listHeadingRow.hidden=!listStep;
    productList.hidden=!listStep||dishesMode;
    dishesList.hidden=!listStep||!dishesMode;
    removePanel.hidden=view!=='remove';
    if(dialogIntro){
      dialogIntro.textContent=view==='remove'
        ?(dishesMode?'Les plats ne se retirent pas depuis ce menu.':'Retirez un produit du catalogue.')
        :formStep?(dishesMode?'Nouveau plat à intégrer au catalogue.':'Nouveau produit à intégrer au catalogue.')
          :'Demandez l’ajout d’un produit ou d’un plat.';
    }
    syncAddButton();
  }
  function announceView(){
    document.dispatchEvent(new CustomEvent('courses:catalog-view-changed',{detail:{view,mode}}));
  }
  function setStep(next){
    step=next==='form'?'form':'list';
    if(step==='form'){
      renderDishCategoryGrid();
      requestAnimationFrame(()=>window.COURSES_SEGMENTED_LIQUID?.syncMissing(false));
    }
    applyLayout();
    if(step==='list')requestAnimationFrame(()=>window.COURSES_SEGMENTED_LIQUID?.syncMissing(false));
  }
  function setView(next){
    const target=next==='remove'?'remove':'add';
    if(view===target)return;
    view=target;
    step='list';
    applyLayout();
    announceView();
  }
  function cancelAdd(){
    input.value='';
    imageHintInput.value='';
    dishCategory='';
    resetProductCategory();
    setStep('list');
  }
  function renderDishes(){
    dishes=readDishes();
    const added=readAddedDishes();
    const rows=[...dishes.map(item=>({item,added:false})),...added.map(item=>({item,added:true}))];
    if(!rows.length){
      dishesList.innerHTML='<div class="missing-products-empty">Aucun plat noté pour le moment.</div>';
      notifyMissingRequestsRendered('dishes');
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
    notifyMissingRequestsRendered('dishes');
  }
  function renderMode(){
    const dishesMode=mode==='dishes';
    modeSwitch.querySelectorAll('[data-missing-mode]').forEach(button=>{
      const active=button.dataset.missingMode===mode;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    input.placeholder=dishesMode?'Ex. poulet tikka masala':'Ex. lait d’avoine';
    input.setAttribute('aria-label',dishesMode?'Nom du plat':'Nom du produit');
    listHeading.textContent='À intégrer';
    applyLayout();
    if(dishesMode){
      renderDishes();
      listCount.textContent=String(dishes.length);
    }else{
      listCount.textContent=String(productCount());
      queueEnhanceProducts();
    }
    renderDishCategoryGrid();
  }
  function setMode(next,{animate=true,clearInput=true}={}){
    if(next!=='products'&&next!=='dishes')return;
    if(mode===next){renderMode();window.COURSES_SEGMENTED_LIQUID?.syncMissing(false);return}
    mode=next;
    lastMode=next;
    if(clearInput){
      input.value='';
      imageHintInput.value='';
    }
    renderMode();
    window.COURSES_SEGMENTED_LIQUID?.syncMissing(animate);
    announceView();
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
  function notifyDuplicateProductAttempt(){
    if(mode!=='products')return false;
    const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!name)return false;
    const duplicate=readProducts().find(item=>normalize(item.name)===normalize(name));
    if(!duplicate)return false;
    void notifyProductAlreadyPending(duplicate.id,name);
    return true;
  }
  function addDish(){
  const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
  if(!name){input.focus();return}
  const result=REQUESTS.addDish({name,category:dishCategory});
  if(!result.ok)return;
  dishes=result.items;
  input.value='';
  dishCategory='';
  step='list';
  renderMode();
  notifyRequest(name);
  void window.COURSES_NOTIFICATIONS?.broadcast({
    kind:'request_added',type:'dish',name,requestId:'dish-'+result.item.id
  });
  window.CoursesHaptics?.vibrate(8);
}
function removeDish(id){
  const result=REQUESTS.removeDish(id);
  if(!result.ok)return;
  dishes=result.items;
  renderMode();
  window.CoursesHaptics?.vibrate(6);
}
  function integrateDish(id){
    const item=readDishes().find(entry=>entry.id===id);
    if(!item)return;
    launchChatGpt(buildDishPrompt(item));
    window.CoursesHaptics?.vibrate(10);
  }
  function integrateProduct(id){
    const item=readProducts().find(entry=>entry.id===id);
    if(!item)return;
    launchChatGpt(buildProductPrompt(item));
    window.CoursesHaptics?.vibrate(10);
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
    notifyMissingRequestsRendered('products');
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
      cancelQueuedProductNotification(item.id);
      completedThisSession.add('product:'+item.id);
      const duplicate=catalogDuplicateIds.delete(item.id);
      if(!duplicate)notifyAdded('product',item.name);
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
  function syncNewProductRequests(notify=true){
    const products=readProducts();
    REQUESTS.pruneProductImageHints(products);
    const nextIds=new Set(products.map(item=>item.id));
    const catalog=catalogProductLookup();
    const added=[];
    products.forEach(item=>{
      if(!knownProductIds.has(item.id)){
        added.push(item);
        if(!notify)return;
        if(catalog.has(normalize(item.name))){
          catalogDuplicateIds.add(item.id);
          appNotify('Produit déjà présent',item.name);
          void notifyProductAlreadyPresent(item.id,item.name);
        }else{
          notifyRequest(item.name);
          void notifyProductQueued(item.id);
        }
      }
    });
    knownProductIds=nextIds;
    if(added.length&&notify&&step==='form'){
      imageHintInput.value='';
      setStep('list');
    }
    if(mode==='products')listCount.textContent=String(products.length);
    queueEnhanceProducts();
    if(added.length&&notify)revealProduct(added[added.length-1].id);
  }

  modeSwitch.addEventListener('click',event=>{
    const button=event.target.closest('[data-missing-mode]');
    if(button)setMode(button.dataset.missingMode||'products');
  });
  dishCategoryGrid.addEventListener('click',event=>{
    const choice=event.target.closest('[data-dish-category]');
    if(!choice)return;
    const category=choice.dataset.dishCategory||'';
    const categories=catalogDishCategories();
    dishCategory=!category||categories.includes(category)?category:'';
    renderDishCategoryGrid();
    window.CoursesHaptics?.vibrate(4);
  });
  viewSwitch.addEventListener('click',event=>{
    const button=event.target.closest('[data-catalog-view]');
    if(button)setView(button.dataset.catalogView||'add');
  });
  addStart.addEventListener('click',()=>{
    setStep('form');
  });
  cancelButton.addEventListener('click',cancelAdd);
  input.addEventListener('input',syncAddButton);

  addButton.addEventListener('click',event=>{
    if(mode==='products'){
      notifyDuplicateProductAttempt();
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
      notifyDuplicateProductAttempt();
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

  document.addEventListener('courses:integration-started',event=>{
    if(event.detail?.type!=='product')return;
    cancelQueuedProductNotification(event.detail?.id);
  });
  window.addEventListener(REQUESTS.eventName,event=>{
    syncNewProductRequests(!event.detail?.remote);
    if(mode==='dishes')renderDishes();
  });
  document.addEventListener('courses:products-updated',reconcileProducts);
  document.addEventListener('courses:dishes-rendered',()=>{
    if(mode==='dishes')renderDishCategoryGrid();
    reconcileDishes();
  });

    settingsButton.addEventListener('click',()=>{
    imageHintInput.value='';
    view='add';
    step='list';
    setMode(lastMode,{animate:false,clearInput:false});
    applyLayout();
    announceView();
    requestAnimationFrame(()=>{
      syncNewProductRequests();
      reconcileDishes();
    });
  });
  dialog.addEventListener('close',()=>{
    lastMode=mode;
    imageHintInput.value='';
    input.value='';
    dishCategory='';
    view='add';
    step='list';
    applyLayout();
  });

  renderMode();
  queueEnhanceProducts();
  reconcileDishes();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMissingProductsAndDishes,{once:true});
else initMissingProductsAndDishes();
})();