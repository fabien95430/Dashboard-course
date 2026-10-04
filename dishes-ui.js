(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG)return;

const DISHES=Object.freeze([
  {name:'Spaghetti carbonara',photoId:'12116165',tags:['Pâtes','Rapides'],ingredients:['Spaghetti','Lardons','Œufs','Parmesan','Crème fraîche']},
  {name:'Spaghetti bolognaise',photoId:'15500451',tags:['Pâtes','Viandes'],ingredients:['Spaghetti','Viande hachée','Sauce tomate','Oignons jaunes']},
  {name:'Penne poulet crème',photoId:'4730661',tags:['Pâtes','Poulet'],ingredients:['Penne','Poulet','Crème fraîche','Champignons','Parmesan']},
  {name:'Pâtes tomate mozzarella',photoId:'19217442',tags:['Pâtes','Végé','Rapides'],ingredients:['Penne','Sauce tomate','Mozzarella','Basilic']},
  {name:'Lasagnes bolognaise',photoId:'18273993',tags:['Pâtes','Viandes'],ingredients:['Lasagnes','Viande hachée','Sauce tomate','Fromage râpé','Crème fraîche']},
  {name:'Tagliatelles au saumon',photoId:'15529617',tags:['Pâtes','Poissons'],ingredients:['Tagliatelles','Saumon','Crème fraîche','Citron']},
  {name:'Pâtes pesto poulet',photoId:'4730680',tags:['Pâtes','Poulet','Rapides'],ingredients:['Penne','Poulet','Pesto','Parmesan']},
  {name:'Penne chorizo poivrons',photoId:'3851029',tags:['Pâtes','Viandes'],ingredients:['Penne','Chorizo','Sauce tomate','Poivrons']},

  {name:'Burger maison',photoId:'2089717',tags:['Viandes','Rapides'],ingredients:['Pains burger','Steaks hachés','Emmental','Tomates','Salade verte','Oignons rouges']},
  {name:'Tacos bœuf',photoId:'38948386',tags:['Viandes','Rapides'],ingredients:['Galettes de blé','Viande hachée','Fromage râpé','Tomates','Salade verte','Avocat']},
  {name:'Chili con carne',photoId:'14866629',tags:['Viandes'],ingredients:['Viande hachée','Haricots rouges','Tomates pelées','Maïs en boîte','Oignons jaunes']},
  {name:'Couscous merguez',photoId:'36916123',tags:['Viandes'],ingredients:['Couscous','Merguez','Carottes','Courgettes','Pois chiches']},
  {name:'Steak pommes de terre',photoId:'19503815',tags:['Viandes'],ingredients:['Steaks hachés','Pommes de terre','Salade verte']},
  {name:'Saucisses pommes de terre',photoId:'19503824',tags:['Viandes'],ingredients:['Saucisses','Pommes de terre','Oignons jaunes']},
  {name:'Tartiflette',photoId:'20426624',tags:['Viandes'],ingredients:['Pommes de terre','Reblochon','Lardons','Oignons jaunes','Crème fraîche']},
  {name:'Raclette',photoId:'14269237',tags:['Viandes'],ingredients:['Raclette','Pommes de terre','Jambon blanc','Jambon cru','Rosette']},

  {name:'Poulet curry',photoId:'27352275',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Lait de coco','Oignons jaunes']},
  {name:'Poulet riz légumes',photoId:'20258760',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Poivrons','Courgettes','Carottes']},
  {name:'Wrap poulet crudités',photoId:'29535635',tags:['Poulet','Rapides'],ingredients:['Wraps','Poulet','Salade verte','Tomates','Avocat']},
  {name:'Poulet crème champignons',photoId:'5713768',tags:['Poulet'],ingredients:['Poulet','Crème fraîche','Champignons','Riz basmati']},
  {name:'Salade César',photoId:'8251537',tags:['Poulet','Rapides'],ingredients:['Salade verte','Poulet','Parmesan','Croûtons','Œufs']},
  {name:'Poulet tomate mozzarella',photoId:'33158330',tags:['Poulet'],ingredients:['Escalopes de poulet','Mozzarella','Tomates','Sauce tomate']},
  {name:'Poulet brocoli riz',photoId:'21822134',tags:['Poulet'],ingredients:['Poulet','Brocoli','Riz basmati','Crème fraîche']},
  {name:'Fajitas poulet',photoId:'32371281',tags:['Poulet','Rapides'],ingredients:['Galettes de blé','Poulet','Poivrons','Oignons rouges','Avocat']},

  {name:'Saumon riz brocoli',photoId:'10156758',tags:['Poissons'],ingredients:['Saumon','Riz basmati','Brocoli','Citron']},
  {name:'Cabillaud pommes de terre',photoId:'32645261',tags:['Poissons'],ingredients:['Cabillaud','Pommes de terre','Haricots verts','Citron']},
  {name:'Crevettes nouilles asiatiques',photoId:'17952224',tags:['Poissons'],ingredients:['Crevettes','Nouilles chinoises','Poivrons','Carottes','Sauce soja']},
  {name:'Salade saumon avocat',photoId:'9001197',tags:['Poissons','Rapides'],ingredients:['Saumon fumé','Avocat','Salade verte','Tomates','Citron']},
  {name:'Salade thon riz maïs',photoId:'9218773',tags:['Poissons','Rapides'],ingredients:['Thon en boîte','Riz long','Maïs en boîte','Tomates','Concombres']},
  {name:'Moules frites',photoId:'10432619',tags:['Poissons','Rapides'],ingredients:['Moules','Frites surgelées']},

  {name:'Hot-dog',photoId:'4113456',tags:['Viandes','Rapides'],ingredients:['Pains hot-dog','Saucisses','Oignons jaunes']},
  {name:'Omelette jambon fromage',photoId:'12310569',tags:['Viandes','Rapides'],ingredients:['Œufs','Jambon blanc','Fromage râpé','Champignons']},
  {name:'Croque-monsieur',photoId:'1391301',tags:['Viandes','Rapides'],ingredients:['Pain de mie','Jambon blanc','Emmental']},
  {name:'Pizza wrap',photoId:'16423835',tags:['Viandes','Rapides'],ingredients:['Wraps','Sauce tomate','Mozzarella','Jambon blanc']},
  {name:'Bruschetta tomate mozzarella',photoId:'4409496',tags:['Végé','Rapides'],ingredients:['Baguette','Tomates','Mozzarella','Basilic']},
  {name:'Sandwich poulet',photoId:'9211149',tags:['Poulet','Rapides'],ingredients:['Pain','Blanc de poulet','Salade verte','Tomates']},

  {name:'Curry pois chiches',photoId:'6544375',tags:['Végé'],ingredients:['Pois chiches','Lait de coco','Tomates pelées','Épinards','Riz basmati']},
  {name:'Buddha bowl quinoa',photoId:'8286776',tags:['Végé'],ingredients:['Quinoa','Avocat','Pois chiches','Carottes','Concombres']},
  {name:'Gratin de courgettes',photoId:'16824040',tags:['Végé'],ingredients:['Courgettes','Crème fraîche','Fromage râpé','Œufs']},
  {name:'Ratatouille',photoId:'36863876',tags:['Végé'],ingredients:['Tomates','Courgettes','Aubergines','Poivrons','Oignons jaunes']},
  {name:'Salade chèvre noix',photoId:'25524078',tags:['Végé','Rapides'],ingredients:['Salade verte','Chèvre','Noix','Tomates']},
  {name:'Pâtes pesto mozzarella',photoId:'18171195',tags:['Pâtes','Végé','Rapides'],ingredients:['Penne','Pesto','Mozzarella','Tomates']},
  {name:'Chili sin carne',photoId:'36040965',tags:['Végé'],ingredients:['Haricots rouges','Maïs en boîte','Tomates pelées','Poivrons','Oignons jaunes']},
  {name:'Riz champignons parmesan',photoId:'31779539',tags:['Végé'],ingredients:['Riz long','Champignons','Parmesan','Crème fraîche']}
]);

const FILTERS=['Tous','Pâtes','Viandes','Poulet','Poissons','Rapides','Végé','Favoris'];
const STORAGE_MODE='courses-catalog-mode-v1';
const STORAGE_FAVORITES='courses-dish-favorites-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const photoUrl=id=>'https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w=900&h=650&fit=crop';

let mode=localStorage.getItem(STORAGE_MODE)==='dishes'?'dishes':'products';
let filter='Tous';
let favorites=readFavorites();
let drivingCatalog=false;
let busyDish='';
let controls;
let modeSwitch;
let dishFilters;
let dishesGrid;
let dishCount;
let searchInput;
let productCount;
let productCategories;
let productsGrid;
let catalogView;
let catalogSubtitle;
let dishDialog;
let dishSheetPhoto;
let dishSheetTitle;
let dishSheetList;
let dishSheetCount;
let dishSheetTags;
let dishSheetFavorite;
let dishConfirmButton;
let currentDish=null;
let selectedIngredients=new Set();
let toastTimer=0;
let lensTimer=0;
const ingredientThumbCache=new Map();
let ingredientThumbRequest=0;
let ingredientThumbUserQuery=null;

function readFavorites(){
  try{return new Set(JSON.parse(localStorage.getItem(STORAGE_FAVORITES)||'[]').map(String))}catch(_){return new Set()}
}
function saveFavorites(){localStorage.setItem(STORAGE_FAVORITES,JSON.stringify([...favorites]))}
function allCatalogNames(){
  const names=new Set();
  Object.values(CATALOG.groups||{}).forEach(group=>Object.values(group||{}).forEach(items=>(items||[]).forEach(name=>names.add(name))));
  return names;
}
const CATALOG_NAMES=allCatalogNames();

function showToast(message){
  const toast=document.getElementById('toast');
  if(!toast)return;
  clearTimeout(toastTimer);
  toast.textContent=message;
  toast.classList.add('is-visible');
  toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
}
function makeButton(label,value,className){
  const button=document.createElement('button');
  button.type='button';
  button.className=className;
  button.dataset.value=value;
  button.textContent=label;
  return button;
}
function buildUi(){
  catalogView=document.getElementById('catalogView');
  searchInput=document.getElementById('productSearch');
  productCount=document.getElementById('productCount');
  productCategories=document.getElementById('categories');
  productsGrid=document.getElementById('products');
  if(!catalogView||!searchInput||!productCategories||!productsGrid)return false;

  catalogSubtitle=catalogView.querySelector('.page-header p');
  controls=document.createElement('div');
  controls.className='catalog-controls';

  modeSwitch=document.createElement('div');
  modeSwitch.className='catalog-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type de catalogue');
  modeSwitch.innerHTML=
    '<span class="catalog-mode-lens" aria-hidden="true"></span>'+ 
    '<button type="button" class="catalog-mode" data-mode="products" role="tab"><svg><use href="#i-grid"></use></svg><span>Produits</span></button>'+ 
    '<button type="button" class="catalog-mode" data-mode="dishes" role="tab"><span class="catalog-mode-fork" aria-hidden="true">🍴</span><span>Plats</span></button>';

  dishFilters=document.createElement('div');
  dishFilters.className='dish-filters';
  dishFilters.setAttribute('aria-label','Catégories de plats');
  FILTERS.forEach(item=>{
    const button=makeButton(item,item,'dish-filter');
    button.addEventListener('click',()=>{filter=item;renderDishFilters();renderDishes()});
    dishFilters.appendChild(button);
  });

  dishesGrid=document.createElement('div');
  dishesGrid.id='dishes';
  dishesGrid.className='dishes-grid';

  dishCount=document.createElement('small');
  dishCount.id='dishCount';
  dishCount.hidden=true;
  productCount.insertAdjacentElement('afterend',dishCount);

  productCategories.before(controls);
  controls.append(modeSwitch,productCategories,dishFilters);
  productsGrid.insertAdjacentElement('afterend',dishesGrid);
  buildDishDialog();

  modeSwitch.querySelectorAll('.catalog-mode').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  searchInput.addEventListener('input',()=>{if(mode==='dishes'&&!drivingCatalog)renderDishes()});
  window.addEventListener('resize',()=>requestAnimationFrame(()=>syncModeLens(false)),{passive:true});
  document.querySelector('.tab[data-view="catalog"]')?.addEventListener('click',()=>requestAnimationFrame(()=>syncModeLens(false)));

  validateDishes();
  setMode(mode,true);
  return true;
}
function buildDishDialog(){
  dishDialog=document.createElement('dialog');
  dishDialog.className='dish-dialog';
  dishDialog.id='dishDialog';
  dishDialog.innerHTML=
    '<div class="dish-sheet-photo-wrap">'+
      '<img class="dish-sheet-photo" alt="" decoding="async" referrerpolicy="no-referrer">'+
      '<button type="button" class="dish-sheet-close" aria-label="Fermer">‹</button>'+ 
      '<button type="button" class="dish-sheet-favorite" aria-label="Ajouter aux favoris">♡</button>'+ 
    '</div>'+ 
    '<div class="dish-sheet-head">'+
      '<h2></h2>'+ 
      '<div class="dish-sheet-meta">'+
        '<p><svg><use href="#i-cart"></use></svg><strong class="dish-sheet-count">0 ingrédient</strong></p>'+ 
        '<div class="dish-sheet-tags" aria-hidden="true"></div>'+ 
      '</div>'+ 
    '</div>'+ 
    '<div class="dish-sheet-list" aria-label="Ingrédients à ajouter"></div>'+ 
    '<div class="dish-sheet-footer">'+
      '<div class="dish-sheet-note"><span aria-hidden="true">ⓘ</span><div><strong>Sel, huile, poivre non inclus</strong><small>Ces ingrédients de base sont à ajouter manuellement si nécessaire.</small></div></div>'+ 
      '<button type="button" class="dish-sheet-add"><svg><use href="#i-cart"></use></svg><span>Ajouter à ma liste</span></button>'+ 
    '</div>';
  document.body.appendChild(dishDialog);
  dishSheetPhoto=dishDialog.querySelector('.dish-sheet-photo');
  dishSheetTitle=dishDialog.querySelector('h2');
  dishSheetList=dishDialog.querySelector('.dish-sheet-list');
  dishSheetCount=dishDialog.querySelector('.dish-sheet-count');
  dishSheetTags=dishDialog.querySelector('.dish-sheet-tags');
  dishSheetFavorite=dishDialog.querySelector('.dish-sheet-favorite');
  dishConfirmButton=dishDialog.querySelector('.dish-sheet-add');
  dishDialog.querySelector('.dish-sheet-close').addEventListener('click',closeDishSheet);
  dishSheetFavorite.addEventListener('click',()=>{if(currentDish)toggleFavorite(currentDish.name,true)});
  dishConfirmButton.addEventListener('click',confirmDishAdd);
  dishDialog.addEventListener('click',event=>{if(event.target===dishDialog)closeDishSheet()});
  dishDialog.addEventListener('cancel',event=>{event.preventDefault();closeDishSheet()});
}
function validateDishes(){
  const missing=[];
  DISHES.forEach(dish=>dish.ingredients.forEach(name=>{if(!CATALOG_NAMES.has(name))missing.push(dish.name+': '+name)}));
  if(missing.length)console.warn('Plats: produits introuvables dans catalog.js',missing);
}
function setMode(next,initial=false){
  if(next!=='products'&&next!=='dishes')return;
  mode=next;
  localStorage.setItem(STORAGE_MODE,mode);
  filter='Tous';
  if(!initial){
    drivingCatalog=true;
    searchInput.value='';
    searchInput.dispatchEvent(new Event('input',{bubbles:true}));
    drivingCatalog=false;
  }
  const dishes=mode==='dishes';
  catalogView.classList.toggle('is-dishes-mode',dishes);
  productCategories.hidden=dishes;
  productsGrid.hidden=dishes;
  dishFilters.hidden=!dishes;
  dishesGrid.hidden=!dishes;
  productCount.hidden=dishes;
  dishCount.hidden=!dishes;
  searchInput.placeholder=dishes?'Rechercher un plat…':'Rechercher un produit…';
  if(catalogSubtitle){
    catalogSubtitle.firstChild.textContent=dishes?'Choisissez un plat et vérifiez ses ingrédients ':'Trouvez et ajoutez vos produits ';
  }
  modeSwitch.querySelectorAll('.catalog-mode').forEach(button=>{
    const active=button.dataset.mode===mode;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  syncModeLens(!initial);
  renderDishFilters();
  if(dishes)renderDishes();
}
function syncModeLens(animate=true){
  if(!modeSwitch)return;
  const active=modeSwitch.querySelector('.catalog-mode.is-active');
  if(!active||!active.offsetWidth)return;
  clearTimeout(lensTimer);
  modeSwitch.classList.toggle('is-switching',animate);
  modeSwitch.style.setProperty('--catalog-lens-x',active.offsetLeft+'px');
  modeSwitch.style.setProperty('--catalog-lens-w',active.offsetWidth+'px');
  if(animate)lensTimer=setTimeout(()=>modeSwitch.classList.remove('is-switching'),430);
}
function renderDishFilters(){
  if(!dishFilters)return;
  dishFilters.querySelectorAll('.dish-filter').forEach(button=>button.classList.toggle('is-active',button.dataset.value===filter));
}
function visibleDishes(){
  const needle=normalize(searchInput?.value||'');
  return DISHES.filter(dish=>{
    if(filter==='Favoris'&&!favorites.has(dish.name))return false;
    if(filter!=='Tous'&&filter!=='Favoris'&&!dish.tags.includes(filter))return false;
    if(!needle)return true;
    const hay=normalize([dish.name,...dish.tags,...dish.ingredients].join(' '));
    return needle.split(' ').filter(Boolean).every(token=>hay.includes(token));
  });
}
function renderDishes(){
  if(!dishesGrid||mode!=='dishes')return;
  const dishes=visibleDishes();
  dishCount.textContent=dishes.length+' plat'+(dishes.length>1?'s':'');
  if(!dishes.length){
    dishesGrid.innerHTML='<div class="dish-empty">'+(filter==='Favoris'?'Aucun plat favori pour le moment.':'Aucun plat trouvé.')+'</div>';
    return;
  }
  dishesGrid.innerHTML=dishes.map(dish=>{
    const favorite=favorites.has(dish.name);
    return '<article class="dish-card" data-dish="'+escapeHtml(dish.name)+'" tabindex="0" role="button" aria-label="Voir les ingrédients de '+escapeHtml(dish.name)+'">'+
      '<div class="dish-visual"><img src="'+photoUrl(dish.photoId)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>'+ 
      '<button type="button" class="dish-favorite '+(favorite?'is-active':'')+'" aria-label="'+(favorite?'Retirer des favoris':'Ajouter aux favoris')+'" aria-pressed="'+(favorite?'true':'false')+'">'+(favorite?'♥':'♡')+'</button>'+ 
      '<div class="dish-copy"><strong>'+escapeHtml(dish.name)+'</strong><small>'+dish.ingredients.length+' ingrédients</small></div>'+ 
      '<span class="dish-add" aria-hidden="true">+</span>'+ 
      '</article>';
  }).join('');

  dishesGrid.querySelectorAll('.dish-card').forEach(card=>{
    const dish=DISHES.find(item=>item.name===card.dataset.dish);
    if(!dish)return;
    const favoriteButton=card.querySelector('.dish-favorite');
    favoriteButton.addEventListener('click',event=>{event.stopPropagation();toggleFavorite(dish.name)});
    card.addEventListener('click',event=>{if(!event.target.closest('.dish-favorite'))openDishSheet(dish)});
    card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.dish-favorite')){event.preventDefault();openDishSheet(dish)}});
  });
}
function toggleFavorite(name,fromSheet=false){
  if(favorites.has(name))favorites.delete(name);else favorites.add(name);
  saveFavorites();
  renderDishes();
  if(fromSheet&&currentDish)renderDishSheetFavorite();
}
function openDishSheet(dish){
  if(busyDish)return;
  currentDish=dish;
  selectedIngredients=new Set(dish.ingredients);
  dishSheetPhoto.src=photoUrl(dish.photoId);
  dishSheetPhoto.alt=dish.name;
  dishSheetTitle.textContent=dish.name;
  dishSheetTags.innerHTML=dish.tags.slice(0,2).map(tag=>'<span>'+escapeHtml(tag)+'</span>').join('');
  renderDishSheetFavorite();
  renderDishSheetIngredients();
  if(typeof dishDialog.showModal==='function')dishDialog.showModal();
  else dishDialog.setAttribute('open','');
  document.documentElement.classList.add('dish-sheet-open');
  void primeDishIngredientThumbs(dish);
}
function cancelIngredientThumbs(){
  ingredientThumbRequest+=1;
  if(ingredientThumbUserQuery!==null){
    setHiddenCatalogQuery(ingredientThumbUserQuery);
    ingredientThumbUserQuery=null;
  }
}
function closeDishSheet(){
  if(!dishDialog||busyDish)return;
  cancelIngredientThumbs();
  if(dishDialog.open)dishDialog.close();else dishDialog.removeAttribute('open');
  document.documentElement.classList.remove('dish-sheet-open');
  currentDish=null;
  selectedIngredients.clear();
}
function renderDishSheetFavorite(){
  if(!currentDish)return;
  const favorite=favorites.has(currentDish.name);
  dishSheetFavorite.textContent=favorite?'♥':'♡';
  dishSheetFavorite.classList.toggle('is-active',favorite);
  dishSheetFavorite.setAttribute('aria-pressed',favorite?'true':'false');
  dishSheetFavorite.setAttribute('aria-label',favorite?'Retirer des favoris':'Ajouter aux favoris');
}
async function primeDishIngredientThumbs(dish){
  const missing=dish.ingredients.filter(name=>!ingredientThumbCache.has(name));
  if(!missing.length||busyDish)return;
  if(ingredientThumbUserQuery===null)ingredientThumbUserQuery=searchInput.value;
  const userQuery=ingredientThumbUserQuery;
  const token=++ingredientThumbRequest;
  try{
    for(const name of missing){
      if(token!==ingredientThumbRequest||currentDish!==dish||busyDish)return;
      setHiddenCatalogQuery(name);
      await nextPaint();
      if(token!==ingredientThumbRequest||currentDish!==dish||busyDish)return;
      const card=[...productsGrid.querySelectorAll('.product')].find(item=>item.dataset.name===name);
      const media=card?.querySelector('.media');
      if(!media)continue;
      const holder=document.createElement('span');
      holder.innerHTML=media.innerHTML;
      holder.querySelector('.premium-sprite')?.classList.add('is-compact');
      holder.querySelector('.product-svg')?.classList.add('is-compact');
      const markup=holder.innerHTML;
      ingredientThumbCache.set(name,markup);
      const row=[...dishSheetList.querySelectorAll('.dish-ingredient')].find(item=>item.dataset.ingredient===name);
      const thumb=row?.querySelector('.dish-ingredient-thumb');
      if(thumb)thumb.innerHTML=markup;
    }
  }finally{
    if(token===ingredientThumbRequest&&!busyDish){
      setHiddenCatalogQuery(userQuery);
      ingredientThumbUserQuery=null;
      await nextPaint();
    }
  }
}
function renderDishSheetIngredients(){
  if(!currentDish)return;
  dishSheetList.innerHTML=currentDish.ingredients.map(name=>{
    const selected=selectedIngredients.has(name);
    const thumb=ingredientThumbCache.get(name)||'';
    return '<button type="button" class="dish-ingredient '+(selected?'is-selected':'')+'" data-ingredient="'+escapeHtml(name)+'" aria-pressed="'+(selected?'true':'false')+'">'+
      '<span class="dish-ingredient-thumb" aria-hidden="true">'+thumb+'</span>'+ 
      '<span class="dish-ingredient-name">'+escapeHtml(name)+'</span>'+ 
      '<span class="dish-ingredient-check" aria-hidden="true">'+(selected?'✓':'')+'</span>'+ 
      '</button>';
  }).join('');
  dishSheetList.querySelectorAll('.dish-ingredient').forEach(row=>row.addEventListener('click',()=>{
    const name=row.dataset.ingredient||'';
    if(selectedIngredients.has(name))selectedIngredients.delete(name);else selectedIngredients.add(name);
    renderDishSheetIngredients();
  }));
  const count=selectedIngredients.size;
  dishSheetCount.textContent=count+' ingrédient'+(count>1?'s':'');
  dishConfirmButton.disabled=count===0||Boolean(busyDish);
  dishConfirmButton.querySelector('span').textContent=count?'Ajouter à ma liste':'Sélectionnez un ingrédient';
}
async function confirmDishAdd(){
  if(!currentDish||busyDish||!selectedIngredients.size)return;
  cancelIngredientThumbs();
  const dish=currentDish;
  const ingredients=dish.ingredients.filter(name=>selectedIngredients.has(name));
  dishConfirmButton.classList.add('is-busy');
  dishConfirmButton.disabled=true;
  dishConfirmButton.querySelector('span').textContent='Ajout en cours…';
  const result=await addDish(dish,ingredients);
  dishConfirmButton.classList.remove('is-busy');
  if(dishDialog.open)dishDialog.close();else dishDialog.removeAttribute('open');
  document.documentElement.classList.remove('dish-sheet-open');
  currentDish=null;
  selectedIngredients.clear();
  navigator.vibrate?.(result.added?[12,35,12]:10);
  if(result.failed){showToast('Ajout partiel · '+result.added+' ajouté'+(result.added>1?'s':'')+' · '+result.failed+' erreur'+(result.failed>1?'s':''));return}
  if(!result.added){showToast('Les ingrédients sélectionnés sont déjà dans Ma liste');return}
  showToast(dish.name+' · '+result.added+' ingrédient'+(result.added>1?'s':'')+' ajouté'+(result.added>1?'s':'')+(result.present?' · '+result.present+' déjà présent'+(result.present>1?'s':''):' '));
}
function setHiddenCatalogQuery(value){
  drivingCatalog=true;
  searchInput.value=value;
  searchInput.dispatchEvent(new Event('input',{bubbles:true}));
  drivingCatalog=false;
}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}
function waitForAdded(card,before,timeout=14000){
  const start=Date.now();
  return new Promise(resolve=>{
    const check=()=>{
      if(!card.isConnected||Number(card.dataset.quantity||0)>before)return resolve(true);
      if(Date.now()-start>=timeout)return resolve(false);
      setTimeout(check,90);
    };
    check();
  });
}
async function addIngredient(name){
  setHiddenCatalogQuery(name);
  await nextPaint();
  const cards=[...productsGrid.querySelectorAll('.product')];
  const card=cards.find(item=>item.dataset.name===name);
  if(!card)return 'present';
  const before=Number(card.dataset.quantity||0);
  if(before>0)return 'present';
  const addButton=card.querySelector('.badge');
  if(!addButton)return 'failed';
  addButton.click();
  return await waitForAdded(card,before)?'added':'failed';
}
async function addDish(dish,ingredients){
  if(busyDish)return {added:0,present:0,failed:0};
  busyDish=dish.name;
  const userQuery=searchInput.value;
  catalogView.classList.add('dish-driving');
  let added=0,present=0,failed=0;
  try{
    for(const ingredient of ingredients){
      const result=await addIngredient(ingredient);
      if(result==='added')added+=1;
      else if(result==='present')present+=1;
      else failed+=1;
    }
  }finally{
    setHiddenCatalogQuery(userQuery);
    await nextPaint();
    catalogView.classList.remove('dish-driving');
    busyDish='';
    renderDishes();
  }
  return {added,present,failed};
}

function init(){
  document.querySelectorAll('.page-version').forEach(el=>{el.textContent='v175'});
  buildUi();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();