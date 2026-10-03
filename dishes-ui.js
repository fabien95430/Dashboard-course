(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG)return;

const DISHES=Object.freeze([
  {name:'Spaghetti carbonara',emoji:'🍝',tags:['Pâtes','Rapides'],ingredients:['Spaghetti','Lardons','Œufs','Parmesan','Crème fraîche']},
  {name:'Spaghetti bolognaise',emoji:'🍝',tags:['Pâtes','Viandes'],ingredients:['Spaghetti','Viande hachée','Sauce tomate','Oignons jaunes']},
  {name:'Penne poulet crème',emoji:'🍝',tags:['Pâtes','Poulet'],ingredients:['Penne','Poulet','Crème fraîche','Champignons','Parmesan']},
  {name:'Pâtes tomate mozzarella',emoji:'🍅',tags:['Pâtes','Végé','Rapides'],ingredients:['Penne','Sauce tomate','Mozzarella','Basilic']},
  {name:'Lasagnes bolognaise',emoji:'🥘',tags:['Pâtes','Viandes'],ingredients:['Lasagnes','Viande hachée','Sauce tomate','Fromage râpé','Crème fraîche']},
  {name:'Tagliatelles au saumon',emoji:'🍝',tags:['Pâtes','Poissons'],ingredients:['Tagliatelles','Saumon','Crème fraîche','Citron']},
  {name:'Pâtes pesto poulet',emoji:'🍝',tags:['Pâtes','Poulet','Rapides'],ingredients:['Penne','Poulet','Pesto','Parmesan']},
  {name:'Penne chorizo poivrons',emoji:'🍝',tags:['Pâtes','Viandes'],ingredients:['Penne','Chorizo','Sauce tomate','Poivrons']},

  {name:'Burger maison',emoji:'🍔',tags:['Viandes','Rapides'],ingredients:['Pains burger','Steaks hachés','Emmental','Tomates','Salade verte','Oignons rouges']},
  {name:'Tacos bœuf',emoji:'🌮',tags:['Viandes','Rapides'],ingredients:['Galettes de blé','Viande hachée','Fromage râpé','Tomates','Salade verte','Avocat']},
  {name:'Chili con carne',emoji:'🌶️',tags:['Viandes'],ingredients:['Viande hachée','Haricots rouges','Tomates pelées','Maïs en boîte','Oignons jaunes']},
  {name:'Couscous merguez',emoji:'🥘',tags:['Viandes'],ingredients:['Couscous','Merguez','Carottes','Courgettes','Pois chiches']},
  {name:'Steak pommes de terre',emoji:'🥩',tags:['Viandes'],ingredients:['Steaks hachés','Pommes de terre','Salade verte']},
  {name:'Saucisses pommes de terre',emoji:'🌭',tags:['Viandes'],ingredients:['Saucisses','Pommes de terre','Oignons jaunes']},
  {name:'Tartiflette',emoji:'🧀',tags:['Viandes'],ingredients:['Pommes de terre','Reblochon','Lardons','Oignons jaunes','Crème fraîche']},
  {name:'Raclette',emoji:'🧀',tags:['Viandes'],ingredients:['Raclette','Pommes de terre','Jambon blanc','Jambon cru','Rosette']},

  {name:'Poulet curry',emoji:'🍛',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Lait de coco','Oignons jaunes']},
  {name:'Poulet riz légumes',emoji:'🍚',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Poivrons','Courgettes','Carottes']},
  {name:'Wrap poulet crudités',emoji:'🌯',tags:['Poulet','Rapides'],ingredients:['Wraps','Poulet','Salade verte','Tomates','Avocat']},
  {name:'Poulet crème champignons',emoji:'🍗',tags:['Poulet'],ingredients:['Poulet','Crème fraîche','Champignons','Riz basmati']},
  {name:'Salade César',emoji:'🥗',tags:['Poulet','Rapides'],ingredients:['Salade verte','Poulet','Parmesan','Croûtons','Œufs']},
  {name:'Poulet tomate mozzarella',emoji:'🍗',tags:['Poulet'],ingredients:['Escalopes de poulet','Mozzarella','Tomates','Sauce tomate']},
  {name:'Poulet brocoli riz',emoji:'🍚',tags:['Poulet'],ingredients:['Poulet','Brocoli','Riz basmati','Crème fraîche']},
  {name:'Fajitas poulet',emoji:'🌯',tags:['Poulet','Rapides'],ingredients:['Galettes de blé','Poulet','Poivrons','Oignons rouges','Avocat']},

  {name:'Saumon riz brocoli',emoji:'🐟',tags:['Poissons'],ingredients:['Saumon','Riz basmati','Brocoli','Citron']},
  {name:'Cabillaud pommes de terre',emoji:'🐟',tags:['Poissons'],ingredients:['Cabillaud','Pommes de terre','Haricots verts','Citron']},
  {name:'Crevettes nouilles asiatiques',emoji:'🍤',tags:['Poissons'],ingredients:['Crevettes','Nouilles chinoises','Poivrons','Carottes','Sauce soja']},
  {name:'Salade saumon avocat',emoji:'🥗',tags:['Poissons','Rapides'],ingredients:['Saumon fumé','Avocat','Salade verte','Tomates','Citron']},
  {name:'Salade thon riz maïs',emoji:'🥗',tags:['Poissons','Rapides'],ingredients:['Thon en boîte','Riz long','Maïs en boîte','Tomates','Concombres']},
  {name:'Moules frites',emoji:'🦪',tags:['Poissons','Rapides'],ingredients:['Moules','Frites surgelées']},

  {name:'Hot-dog',emoji:'🌭',tags:['Viandes','Rapides'],ingredients:['Pains hot-dog','Saucisses','Oignons jaunes']},
  {name:'Omelette jambon fromage',emoji:'🍳',tags:['Viandes','Rapides'],ingredients:['Œufs','Jambon blanc','Fromage râpé','Champignons']},
  {name:'Croque-monsieur',emoji:'🥪',tags:['Viandes','Rapides'],ingredients:['Pain de mie','Jambon blanc','Emmental']},
  {name:'Pizza wrap',emoji:'🍕',tags:['Viandes','Rapides'],ingredients:['Wraps','Sauce tomate','Mozzarella','Jambon blanc']},
  {name:'Bruschetta tomate mozzarella',emoji:'🥖',tags:['Végé','Rapides'],ingredients:['Baguette','Tomates','Mozzarella','Basilic']},
  {name:'Sandwich poulet',emoji:'🥪',tags:['Poulet','Rapides'],ingredients:['Pain','Blanc de poulet','Salade verte','Tomates']},

  {name:'Curry pois chiches',emoji:'🍛',tags:['Végé'],ingredients:['Pois chiches','Lait de coco','Tomates pelées','Épinards','Riz basmati']},
  {name:'Buddha bowl quinoa',emoji:'🥗',tags:['Végé'],ingredients:['Quinoa','Avocat','Pois chiches','Carottes','Concombres']},
  {name:'Gratin de courgettes',emoji:'🥒',tags:['Végé'],ingredients:['Courgettes','Crème fraîche','Fromage râpé','Œufs']},
  {name:'Ratatouille',emoji:'🍆',tags:['Végé'],ingredients:['Tomates','Courgettes','Aubergines','Poivrons','Oignons jaunes']},
  {name:'Salade chèvre noix',emoji:'🥗',tags:['Végé','Rapides'],ingredients:['Salade verte','Chèvre','Noix','Tomates']},
  {name:'Pâtes pesto mozzarella',emoji:'🍝',tags:['Pâtes','Végé','Rapides'],ingredients:['Penne','Pesto','Mozzarella','Tomates']},
  {name:'Chili sin carne',emoji:'🌶️',tags:['Végé'],ingredients:['Haricots rouges','Maïs en boîte','Tomates pelées','Poivrons','Oignons jaunes']},
  {name:'Riz champignons parmesan',emoji:'🍚',tags:['Végé'],ingredients:['Riz long','Champignons','Parmesan','Crème fraîche']}
]);

const FILTERS=['Tous','Pâtes','Viandes','Poulet','Poissons','Rapides','Végé','Favoris'];
const STORAGE_MODE='courses-catalog-mode-v1';
const STORAGE_FAVORITES='courses-dish-favorites-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

let mode=localStorage.getItem(STORAGE_MODE)==='dishes'?'dishes':'products';
let filter='Tous';
let favorites=readFavorites();
let drivingCatalog=false;
let busyDish='';
let controls;
let dishFilters;
let dishesGrid;
let dishCount;
let searchInput;
let productCount;
let productCategories;
let productsGrid;
let catalogView;
let catalogSubtitle;
let toastTimer=0;

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

  const modeSwitch=document.createElement('div');
  modeSwitch.className='catalog-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type de catalogue');
  modeSwitch.innerHTML=
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

  modeSwitch.querySelectorAll('.catalog-mode').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  searchInput.addEventListener('input',()=>{if(mode==='dishes'&&!drivingCatalog)renderDishes()});

  validateDishes();
  setMode(mode,true);
  return true;
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
    catalogSubtitle.firstChild.textContent=dishes?'Choisissez un plat et ajoutez ses ingrédients ':'Trouvez et ajoutez vos produits ';
  }
  controls.querySelectorAll('.catalog-mode').forEach(button=>{
    const active=button.dataset.mode===mode;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  renderDishFilters();
  if(dishes)renderDishes();
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
    const busy=busyDish===dish.name;
    return '<article class="dish-card '+(busy?'is-busy':'')+'" data-dish="'+escapeHtml(dish.name)+'" tabindex="0" role="button" aria-label="Ajouter les ingrédients de '+escapeHtml(dish.name)+'">'+
      '<div class="dish-visual dish-tone-'+toneForDish(dish)+'"><span>'+dish.emoji+'</span></div>'+ 
      '<button type="button" class="dish-favorite '+(favorite?'is-active':'')+'" aria-label="'+(favorite?'Retirer des favoris':'Ajouter aux favoris')+'" aria-pressed="'+(favorite?'true':'false')+'">'+(favorite?'♥':'♡')+'</button>'+ 
      '<div class="dish-copy"><strong>'+escapeHtml(dish.name)+'</strong><small>'+dish.ingredients.length+' ingrédients</small></div>'+ 
      '<span class="dish-add" aria-hidden="true">'+(busy?'<i></i>':'+')+'</span>'+ 
      '</article>';
  }).join('');

  dishesGrid.querySelectorAll('.dish-card').forEach(card=>{
    const dish=DISHES.find(item=>item.name===card.dataset.dish);
    if(!dish)return;
    const favoriteButton=card.querySelector('.dish-favorite');
    favoriteButton.addEventListener('click',event=>{event.stopPropagation();toggleFavorite(dish.name)});
    card.addEventListener('click',event=>{if(!event.target.closest('.dish-favorite'))addDish(dish)});
    card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.dish-favorite')){event.preventDefault();addDish(dish)}});
  });
}
function toneForDish(dish){
  if(dish.tags.includes('Pâtes'))return 'pasta';
  if(dish.tags.includes('Poulet'))return 'chicken';
  if(dish.tags.includes('Poissons'))return 'fish';
  if(dish.tags.includes('Végé'))return 'veggie';
  if(dish.tags.includes('Viandes'))return 'meat';
  return 'quick';
}
function toggleFavorite(name){
  if(favorites.has(name))favorites.delete(name);else favorites.add(name);
  saveFavorites();
  renderDishes();
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
async function addDish(dish){
  if(busyDish)return;
  busyDish=dish.name;
  const userQuery=searchInput.value;
  catalogView.classList.add('dish-driving');
  renderDishes();
  let added=0,present=0,failed=0;
  try{
    for(const ingredient of dish.ingredients){
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
  navigator.vibrate?.(added?[12,35,12]:10);
  if(failed){showToast('Ajout partiel · '+added+' ajouté'+(added>1?'s':'')+' · '+failed+' erreur'+(failed>1?'s':''));return}
  if(!added){showToast('Tous les ingrédients sont déjà dans Ma liste');return}
  showToast(dish.name+' · '+added+' ingrédient'+(added>1?'s':'')+' ajouté'+(added>1?'s':'')+(present?' · '+present+' déjà présent'+(present>1?'s':''):''));
}

function init(){buildUi()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
