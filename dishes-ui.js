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
  {name:'Riz champignons parmesan',photoId:'31779539',tags:['Végé'],ingredients:['Riz long','Champignons','Parmesan','Crème fraîche']},
  {name:'Poulet parmesan tomate',photoId:'',tags:['Poulet'],ingredients:['Escalopes de poulet','Sauce tomate','Parmesan','Mozzarella','Chapelure']},
  {name:'Poulet miel moutarde',photoId:'',tags:['Poulet'],ingredients:['Poulet','Miel','Moutarde','Crème fraîche']},
  {name:'Poulet teriyaki riz',photoId:'',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Sauce soja','Miel','Gingembre']},
  {name:'Poulet paprika crème',photoId:'',tags:['Poulet'],ingredients:['Poulet','Crème fraîche','Riz basmati','Oignons jaunes']},
  {name:'Poulet pommes de terre au four',photoId:'',tags:['Poulet'],ingredients:['Poulet','Pommes de terre','Oignons jaunes','Romarin frais']},
  {name:'Riz poulet curry coco',photoId:'',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Lait de coco','Curry']},
  {name:'Riz sauté poulet légumes',photoId:'',tags:['Poulet'],ingredients:['Poulet','Riz basmati','Poivrons','Carottes','Œufs','Sauce soja']},
  {name:'Riz crevettes légumes',photoId:'',tags:['Poissons'],ingredients:['Crevettes','Riz basmati','Poivrons','Carottes','Œufs','Sauce soja']},
  {name:'Bœuf riz poivrons',photoId:'',tags:['Viandes'],ingredients:['Bœuf','Riz basmati','Poivrons','Oignons jaunes','Sauce soja']},
  {name:'Bœuf sauce tomate pommes de terre',photoId:'',tags:['Viandes'],ingredients:['Bœuf','Pommes de terre','Sauce tomate','Oignons jaunes','Carottes']},
  {name:'Hachis parmentier',photoId:'',tags:['Viandes'],ingredients:['Viande hachée','Pommes de terre','Lait','Beurre','Oignons jaunes']},
  {name:'Boulettes sauce tomate',photoId:'',tags:['Viandes'],ingredients:['Viande hachée','Sauce tomate','Œufs','Chapelure','Oignons jaunes']},
  {name:'Gratin pommes de terre jambon',photoId:'',tags:['Viandes'],ingredients:['Pommes de terre','Jambon blanc','Crème fraîche','Fromage râpé']},
  {name:'Gratin brocoli poulet',photoId:'',tags:['Poulet'],ingredients:['Brocoli','Poulet','Crème fraîche','Fromage râpé']},
  {name:'Quiche lorraine',photoId:'',tags:['Viandes'],ingredients:['Farine','Beurre','Œufs','Lardons','Crème fraîche']},
  {name:'Quiche poireaux chèvre',photoId:'',tags:['Végé'],ingredients:['Farine','Beurre','Poireaux','Chèvre','Œufs','Crème fraîche']},
  {name:'Tarte tomate mozzarella',photoId:'',tags:['Végé'],ingredients:['Farine','Beurre','Tomates','Mozzarella','Moutarde','Basilic']},
  {name:'Salade poulet avocat',photoId:'',tags:['Poulet','Rapides'],ingredients:['Poulet','Avocat','Salade verte','Tomates']},
  {name:'Salade César saumon',photoId:'',tags:['Poissons','Rapides'],ingredients:['Salade verte','Saumon','Parmesan','Croûtons','Œufs']},
  {name:'Salade mozzarella avocat',photoId:'',tags:['Végé','Rapides'],ingredients:['Mozzarella','Avocat','Tomates','Salade verte']},
  {name:'Saumon pommes de terre',photoId:'',tags:['Poissons'],ingredients:['Saumon','Pommes de terre','Citron']},
  {name:'Saumon crème épinards',photoId:'',tags:['Poissons'],ingredients:['Saumon','Crème fraîche','Épinards','Riz basmati']},
  {name:'Cabillaud riz légumes',photoId:'',tags:['Poissons'],ingredients:['Cabillaud','Riz basmati','Poivrons','Courgettes','Carottes']},
  {name:'Crevettes curry coco',photoId:'',tags:['Poissons'],ingredients:['Crevettes','Riz basmati','Lait de coco','Curry']},
  {name:'Poêlée pommes de terre saucisses',photoId:'',tags:['Viandes'],ingredients:['Saucisses','Pommes de terre','Oignons jaunes']},
  {name:'Poêlée poulet courgettes',photoId:'',tags:['Poulet'],ingredients:['Poulet','Courgettes','Oignons jaunes','Ail']},
  {name:'Croque poulet fromage',photoId:'',tags:['Poulet','Rapides'],ingredients:['Pain de mie','Blanc de poulet','Emmental']},
  {name:'Boulettes riz',photoId:'',tags:['Enfants'],ingredients:['Viande hachée','Riz basmati','Sauce tomate','Œufs','Chapelure']},
  {name:'Coquillettes jambon',photoId:'',tags:['Enfants'],ingredients:['Coquillettes','Jambon blanc','Crème fraîche','Fromage râpé']},
  {name:'Couscous poulet légumes',photoId:'',tags:['Enfants'],ingredients:['Couscous','Poulet','Carottes','Courgettes']},
  {name:'Gratin pommes de terre',photoId:'',tags:['Enfants'],ingredients:['Pommes de terre','Crème fraîche','Fromage râpé']},
  {name:'Pâtes jambon',photoId:'',tags:['Enfants'],ingredients:['Penne','Jambon blanc','Crème fraîche']},
  {name:'Purée carotte poulet',photoId:'',tags:['Enfants'],ingredients:['Pommes de terre','Carottes','Poulet','Lait','Beurre']},
  {name:'Risotto poulet',photoId:'',tags:['Enfants'],ingredients:['Riz long','Poulet','Parmesan','Crème fraîche']},
  {name:'Saumon brocoli',photoId:'',tags:['Enfants'],ingredients:['Saumon','Brocoli','Riz basmati']},
  {name:'Steak frites',photoId:'',tags:['Enfants'],ingredients:['Steaks hachés','Frites surgelées']},
  {name:'Velouté carottes',photoId:'',tags:['Enfants'],ingredients:['Carottes','Pommes de terre','Crème fraîche','Oignons jaunes']},
  {name:'Steak tartare',photoId:'',tags:['Viandes'],ingredients:['Bœuf','Œufs','Oignons rouges']},
  {name:'Sushis',photoId:'',tags:['Poissons'],ingredients:['Saumon','Riz long','Avocat','Concombres']},
  {name:'Saucisse lentille',photoId:'',tags:['Viandes'],ingredients:['Saucisses','Lentilles','Carottes','Oignons jaunes']},
  {name:'Crème brûlée',photoId:'',tags:['Végé','Dessert'],ingredients:['Crème liquide','Œufs','Sucre','Vanille']},
  {name:'Pannacotta',photoId:'',tags:['Dessert'],ingredients:['Crème liquide','Lait entier','Sucre','Vanille']},
  {name:'Riz au lait',photoId:'',tags:['Dessert'],ingredients:['Lait entier','Riz long','Sucre','Vanille']},
  {name:'Rougail saucisse',photoId:'',tags:['Viandes'],ingredients:['Saucisses','Tomates','Oignons jaunes','Ail','Piments','Riz long']},
]);

const FILTERS=['Tous','Favoris','Dessert','Enfants','Pâtes','Poissons','Poulet','Rapides','Végé','Viandes'];
const STORAGE_MODE='courses-catalog-mode-v1';
const STORAGE_FAVORITES='courses-dish-favorites-v1';
const STORAGE_CUSTOMIZATIONS='courses-dish-customizations-v1';
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const DISH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#eef1eb"/><ellipse cx="450" cy="330" rx="250" ry="170" fill="#f8f7f2" stroke="#cbd2c8" stroke-width="12"/><text x="450" y="350" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="30" font-weight="700" fill="#708076">Photo indisponible</text></svg>');
const DISH_SPECIAL_SLUGS=Object.freeze({
  'Tagliatelles au saumon':'tagliatelles-saumon',
  'Gratin de courgettes':'gratin-courgettes',
  'Poulet pommes de terre au four':'poulet-pommes-de-terre-four'
});
const CHILD_DISHES=new Set(['Boulettes riz','Coquillettes jambon','Couscous poulet légumes','Gratin pommes de terre','Pâtes jambon','Purée carotte poulet','Risotto poulet','Saumon brocoli','Steak frites','Velouté carottes','Crème brûlée','Riz au lait']);
const dishSlug=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const dishPhotoUrl=name=>'./www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+(DISH_SPECIAL_SLUGS[name]||dishSlug(name))+'.png';

let mode=localStorage.getItem(STORAGE_MODE)==='dishes'?'dishes':'products';
let filter='Tous';
let favorites=readFavorites();
let recipeCustomizations={};
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
let recipeCustomizationDialog;
let recipeCustomizationSearch;
let recipeCustomizationSuggestions;
let recipeCustomizationList;
let recipeCustomizationStatus;
let recipeCustomizationReset;
let recipeCustomizationSave;
let recipeCustomizationAddButton;
let recipeCustomizationIngredientPicker;
let recipeCustomizationIngredientSearch;
let recipeCustomizationIngredientSuggestions;
let recipeCustomizationIngredientCancel;
let recipeCustomizationDish=null;
let recipeCustomizationSelection=new Set();
let recipeCustomizationNeeds={};
let toastTimer=0;
let lensTimer=0;
const ingredientThumbCache=new Map();
const dishCardCache=new Map();
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
function readRecipeCustomizations(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_CUSTOMIZATIONS)||'{}');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
    const clean={};
    DISHES.forEach(dish=>{
      const saved=raw[dish.name];
      if(!Array.isArray(saved))return;
      const savedNames=[...new Set(saved.map(String).filter(name=>CATALOG_NAMES.has(name)))];
      const selected=new Set(savedNames);
      const extras=savedNames.filter(name=>!dish.ingredients.includes(name));
      clean[dish.name]=[...dish.ingredients.filter(name=>selected.has(name)),...extras];
    });
    return clean;
  }catch(_){return {}}
}
function persistRecipeCustomizations(){
  try{localStorage.setItem(STORAGE_CUSTOMIZATIONS,JSON.stringify(recipeCustomizations))}catch(_){}
}
function selectedDefaultsForDish(dish){
  if(!dish)return [];
  return Object.prototype.hasOwnProperty.call(recipeCustomizations,dish.name)?recipeCustomizations[dish.name]:dish.ingredients;
}
function recipeIngredientsForDish(dish,selection=selectedDefaultsForDish(dish)){
  if(!dish)return [];
  const names=[...dish.ingredients];
  const seen=new Set(names);
  for(const value of selection||[]){
    const name=String(value||'');
    if(!name||seen.has(name)||!CATALOG_NAMES.has(name))continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}
function selectionMatchesBase(dish,selection){
  return Boolean(dish)&&selection.size===dish.ingredients.length&&dish.ingredients.every(name=>selection.has(name));
}
recipeCustomizations=readRecipeCustomizations();

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
function useDishImage(image,name){
  if(!image)return;
  image.dataset.dishImage=name;
  image.src=dishPhotoUrl(name);
}
function bindDishImageFallback(image){
  if(!image||image.dataset.dishImageFallbackBound==='1')return;
  image.dataset.dishImageFallbackBound='1';
  image.addEventListener('error',()=>{
    if(image.getAttribute('src')===DISH_PLACEHOLDER)return;
    image.src=DISH_PLACEHOLDER;
  });
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
  buildRecipeCustomizationDialog();

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
  bindDishImageFallback(dishSheetPhoto);
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
  window.COURSES_QUANTITIES.bind();
}
function buildRecipeCustomizationDialog(){
  const settingsButton=document.getElementById('settingsRecipeCustomizationBtn');
  if(!settingsButton)return;
  if(!document.getElementById('recipe-customization-style')){
    const style=document.createElement('style');
    style.id='recipe-customization-style';
    style.textContent=`
      .recipe-customization-dialog{max-height:calc(100dvh - max(48px,env(safe-area-inset-top)) - max(48px,env(safe-area-inset-bottom)));overflow:hidden}
      .recipe-customization-dialog[open]{display:flex;flex-direction:column}
      .recipe-customization-dialog .dialog-intro{margin:5px 0 13px;color:#7a837d;font-size:13px;line-height:1.4}
      .recipe-customization-search-wrap{position:relative;z-index:4;flex:0 0 auto;margin-bottom:10px}
      .recipe-customization-search{height:46px;padding:0 13px;border:1px solid #e1e7e1;border-radius:15px;display:flex;align-items:center;gap:9px;background:#f8faf7;color:#718078}
      .recipe-customization-search svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;flex:0 0 18px}
      .recipe-customization-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#1d2821;font:inherit;font-size:14px}
      .recipe-customization-search input::placeholder{color:#98a19b}
      .recipe-customization-suggestions{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:8;max-height:min(36dvh,280px);overflow:auto;-webkit-overflow-scrolling:touch;padding:6px;border:1px solid #dfe7e1;border-radius:16px;background:#fff;box-shadow:0 16px 34px rgba(31,55,40,.16)}
      .recipe-customization-suggestions[hidden]{display:none}
      .recipe-customization-suggestion{width:100%;min-height:46px;border:0;border-radius:11px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:transparent;color:#253028;text-align:left;font:inherit;-webkit-appearance:none;appearance:none}
      .recipe-customization-suggestion:active{background:#eef7f0}
      .recipe-customization-suggestion span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:720}
      .recipe-customization-suggestion small{flex:0 0 auto;color:#8a948e;font-size:11px;font-weight:650}
      .recipe-customization-suggestion-empty{padding:14px 10px;color:#7d8781;text-align:center;font-size:13px;font-weight:650}
      .recipe-customization-status{flex:0 0 auto;margin:0 0 9px;color:#6f7872;font-size:12px;font-weight:650}
      .recipe-customization-list{min-height:0;max-height:42dvh;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:8px;padding:2px 1px 7px}
      .recipe-customization-empty{padding:30px 12px;color:#7d8781;text-align:center;font-size:13px;font-weight:650}
      .recipe-customization-item{width:100%;min-height:58px;padding:7px 10px;border:1px solid #e2e8e2;border-radius:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:9px;background:#f8faf7;color:#253028}
      .recipe-customization-item.is-selected{border-color:#b9dfc6;background:#eff8f1;color:#145d37}
      .recipe-customization-toggle{min-width:0;border:0;padding:4px 2px;display:flex;align-items:center;gap:10px;background:transparent;color:inherit;text-align:left;font-size:14px;font-weight:700;-webkit-appearance:none;appearance:none}
      .recipe-customization-toggle i{width:24px;height:24px;flex:0 0 24px;border:1.5px solid #cbd4cd;border-radius:50%;display:grid;place-items:center;color:transparent;font-style:normal;font-size:14px;font-weight:850;background:#fff}
      .recipe-customization-item.is-selected .recipe-customization-toggle i{border-color:#238b50;background:#238b50;color:#fff}
      .recipe-customization-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .recipe-customization-quantity{height:38px;min-width:86px;padding:0 9px;border:1px solid #dce4dd;border-radius:12px;display:flex;align-items:center;justify-content:flex-end;gap:5px;background:#fff;color:#637068}
      .recipe-customization-quantity input{width:52px;border:0;outline:0;background:transparent;color:#1d2821;text-align:right;font-size:14px;font-weight:760;-moz-appearance:textfield}
      .recipe-customization-quantity input::-webkit-outer-spin-button,.recipe-customization-quantity input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
      .recipe-customization-quantity input:disabled{color:#a6aea9}
      .recipe-customization-quantity span{font-size:11px;font-weight:720;white-space:nowrap}
      .recipe-customization-auto{min-width:70px;color:#98a09b;font-size:12px;font-weight:700;text-align:right}
      .recipe-customization-add{flex:0 0 auto;margin-top:8px}
      .recipe-customization-add-button{width:100%;height:44px;border:1px dashed #8dc5a0;border-radius:13px;background:#f8fcf9;color:#157545;font:inherit;font-size:14px;font-weight:780;-webkit-appearance:none;appearance:none}
      .recipe-customization-add-button:active{background:#edf8f0}
      .recipe-customization-add-button:disabled{opacity:.45}
      .recipe-customization-ingredient-picker{padding:8px;border:1px solid #dfe7e1;border-radius:15px;background:#fff;box-shadow:0 10px 24px rgba(31,55,40,.09)}
      .recipe-customization-ingredient-picker[hidden]{display:none}
      .recipe-customization-ingredient-search-row{display:flex;align-items:center;gap:8px}
      .recipe-customization-ingredient-search{height:42px;min-width:0;flex:1;padding:0 11px;border:1px solid #e1e7e1;border-radius:12px;display:flex;align-items:center;gap:8px;background:#f7f9f7;color:#718078}
      .recipe-customization-ingredient-search svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;flex:0 0 17px}
      .recipe-customization-ingredient-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#1d2821;font:inherit;font-size:14px}
      .recipe-customization-ingredient-cancel{height:42px;padding:0 6px;border:0;background:transparent;color:#16804c;font:inherit;font-size:13px;font-weight:760;-webkit-appearance:none;appearance:none}
      .recipe-customization-ingredient-suggestions{max-height:min(24dvh,180px);overflow:auto;-webkit-overflow-scrolling:touch;margin-top:5px;padding-top:3px;border-top:1px solid #edf1ed}
      .recipe-customization-dialog .dialog-actions{flex:0 0 auto;margin-top:12px}
      .recipe-customization-dialog .dialog-actions button{flex:1 1 0;width:0;height:44px;margin:0;padding:0 12px;border-radius:13px;font-weight:750}
      .recipe-customization-dialog .dialog-actions button:disabled{opacity:.45}
      @media(max-width:390px){.recipe-customization-suggestions{max-height:32dvh}.recipe-customization-list{max-height:35dvh}.recipe-customization-item{padding:6px 8px}.recipe-customization-quantity{min-width:80px;padding:0 7px}.recipe-customization-quantity input{width:47px}}
    `;
    document.head.appendChild(style);
  }
  recipeCustomizationDialog=document.createElement('dialog');
  recipeCustomizationDialog.id='recipeCustomizationDialog';
  recipeCustomizationDialog.className='dialog recipe-customization-dialog';
  recipeCustomizationDialog.tabIndex=-1;
  recipeCustomizationDialog.innerHTML=
    '<h3>Personnalisation des recettes</h3>'+ 
    '<p class="dialog-intro">Affinez les aliments et les quantités prédéfinies pour 4 personnes. Les quantités seront ensuite adaptées automatiquement au nombre de personnes.</p>'+ 
    '<div class="recipe-customization-search-wrap"><label class="recipe-customization-search"><svg aria-hidden="true"><use href="#i-search"></use></svg><input type="search" autocomplete="off" placeholder="Rechercher un plat…" aria-label="Rechercher un plat" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="recipeCustomizationSuggestions"></label><div id="recipeCustomizationSuggestions" class="recipe-customization-suggestions" role="listbox" hidden></div></div>'+ 
    '<p class="recipe-customization-status" aria-live="polite"></p>'+ 
    '<div class="recipe-customization-list" aria-label="Aliments et quantités de la recette"></div>'+ 
    '<div class="recipe-customization-add"><button class="recipe-customization-add-button" type="button">＋ Ajouter un ingrédient</button><div class="recipe-customization-ingredient-picker" hidden><div class="recipe-customization-ingredient-search-row"><label class="recipe-customization-ingredient-search"><svg aria-hidden="true"><use href="#i-search"></use></svg><input type="search" autocomplete="off" placeholder="Rechercher un ingrédient…" aria-label="Rechercher un ingrédient" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-controls="recipeCustomizationIngredientSuggestions"></label><button class="recipe-customization-ingredient-cancel" type="button">Annuler</button></div><div id="recipeCustomizationIngredientSuggestions" class="recipe-customization-ingredient-suggestions" role="listbox"></div></div></div>'+ 
    '<div class="dialog-actions"><button class="secondary recipe-customization-reset" type="button">Réinitialiser</button><button class="primary recipe-customization-save" type="button">Enregistrer</button></div>';
  document.body.appendChild(recipeCustomizationDialog);
  recipeCustomizationSearch=recipeCustomizationDialog.querySelector('.recipe-customization-search input');
  recipeCustomizationSuggestions=recipeCustomizationDialog.querySelector('.recipe-customization-suggestions');
  recipeCustomizationList=recipeCustomizationDialog.querySelector('.recipe-customization-list');
  recipeCustomizationStatus=recipeCustomizationDialog.querySelector('.recipe-customization-status');
  recipeCustomizationReset=recipeCustomizationDialog.querySelector('.recipe-customization-reset');
  recipeCustomizationSave=recipeCustomizationDialog.querySelector('.recipe-customization-save');
  recipeCustomizationAddButton=recipeCustomizationDialog.querySelector('.recipe-customization-add-button');
  recipeCustomizationIngredientPicker=recipeCustomizationDialog.querySelector('.recipe-customization-ingredient-picker');
  recipeCustomizationIngredientSearch=recipeCustomizationDialog.querySelector('.recipe-customization-ingredient-search input');
  recipeCustomizationIngredientSuggestions=recipeCustomizationDialog.querySelector('.recipe-customization-ingredient-suggestions');
  recipeCustomizationIngredientCancel=recipeCustomizationDialog.querySelector('.recipe-customization-ingredient-cancel');
  recipeCustomizationSearch.addEventListener('input',renderRecipeCustomizationDishOptions);
  recipeCustomizationSearch.addEventListener('focus',renderRecipeCustomizationDishOptions);
  recipeCustomizationSearch.addEventListener('keydown',event=>{if(event.key==='Escape')hideRecipeCustomizationSuggestions()});
  recipeCustomizationSuggestions.addEventListener('pointerdown',event=>{if(event.target.closest('[data-recipe-dish]'))event.preventDefault()});
  recipeCustomizationSuggestions.addEventListener('click',event=>{
    const button=event.target.closest('[data-recipe-dish]');
    if(button)selectRecipeCustomizationDish(button.dataset.recipeDish||'');
  });
  recipeCustomizationAddButton.addEventListener('click',openRecipeCustomizationIngredientPicker);
  recipeCustomizationIngredientSearch.addEventListener('input',renderRecipeCustomizationIngredientOptions);
  recipeCustomizationIngredientSearch.addEventListener('keydown',event=>{if(event.key==='Escape')hideRecipeCustomizationIngredientPicker()});
  recipeCustomizationIngredientSuggestions.addEventListener('pointerdown',event=>{if(event.target.closest('[data-recipe-ingredient]'))event.preventDefault()});
  recipeCustomizationIngredientSuggestions.addEventListener('click',event=>{
    const button=event.target.closest('[data-recipe-ingredient]');
    if(button)addRecipeCustomizationIngredient(button.dataset.recipeIngredient||'');
  });
  recipeCustomizationIngredientCancel.addEventListener('click',hideRecipeCustomizationIngredientPicker);
  recipeCustomizationReset.addEventListener('click',resetRecipeCustomizationDraft);
  recipeCustomizationSave.addEventListener('click',saveRecipeCustomization);
  recipeCustomizationDialog.addEventListener('click',event=>{
    if(event.target===recipeCustomizationDialog){hideRecipeCustomizationSuggestions();hideRecipeCustomizationIngredientPicker();recipeCustomizationDialog.close();return}
    if(!event.target.closest('.recipe-customization-search-wrap'))hideRecipeCustomizationSuggestions();
  });
  recipeCustomizationDialog.addEventListener('cancel',event=>{event.preventDefault();hideRecipeCustomizationSuggestions();hideRecipeCustomizationIngredientPicker();recipeCustomizationDialog.close()});
  settingsButton.addEventListener('click',openRecipeCustomization);
}
function recipeQuantities(){return window.COURSES_QUANTITIES||null}
function recipeUnitLabel(unit){return unit==='piece'?'pièce':unit}
function loadRecipeCustomizationDish(name){
  const dish=DISHES.find(item=>item.name===name)||null;
  recipeCustomizationDish=dish;
  recipeCustomizationNeeds={};
  if(!dish){
    recipeCustomizationSelection.clear();
    hideRecipeCustomizationIngredientPicker();
    renderRecipeCustomizationIngredients();
    return;
  }
  recipeCustomizationSelection=new Set(selectedDefaultsForDish(dish));
  recipeIngredientsForDish(dish,recipeCustomizationSelection).forEach(ingredient=>{
    const amount=Number(recipeQuantities()?.getNeed?.(dish.name,ingredient,4));
    if(Number.isFinite(amount)&&amount>0)recipeCustomizationNeeds[ingredient]=amount;
  });
  hideRecipeCustomizationIngredientPicker();
  renderRecipeCustomizationIngredients();
}
function hideRecipeCustomizationSuggestions(){
  if(recipeCustomizationSuggestions)recipeCustomizationSuggestions.hidden=true;
  recipeCustomizationSearch?.setAttribute('aria-expanded','false');
}
function selectRecipeCustomizationDish(name){
  const dish=DISHES.find(item=>item.name===name)||null;
  if(!dish)return;
  recipeCustomizationSearch.value=dish.name;
  loadRecipeCustomizationDish(dish.name);
  hideRecipeCustomizationSuggestions();
}
function renderRecipeCustomizationDishOptions(){
  if(!recipeCustomizationSuggestions)return;
  const needle=normalize(recipeCustomizationSearch?.value||'');
  const matches=DISHES.filter(dish=>!needle||normalize(dish.name).includes(needle));
  recipeCustomizationSuggestions.innerHTML=matches.length
    ?matches.map(dish=>'<button type="button" class="recipe-customization-suggestion" role="option" data-recipe-dish="'+escapeHtml(dish.name)+'"><span>'+escapeHtml(dish.name)+'</span><small>'+dish.ingredients.length+' ingrédient'+(dish.ingredients.length>1?'s':'')+'</small></button>').join('')
    :'<div class="recipe-customization-suggestion-empty">Aucun plat trouvé.</div>';
  recipeCustomizationSuggestions.hidden=false;
  recipeCustomizationSearch?.setAttribute('aria-expanded','true');
}
function hideRecipeCustomizationIngredientPicker(){
  if(!recipeCustomizationIngredientPicker)return;
  recipeCustomizationIngredientPicker.hidden=true;
  if(recipeCustomizationAddButton)recipeCustomizationAddButton.hidden=false;
  if(recipeCustomizationIngredientSearch)recipeCustomizationIngredientSearch.value='';
  if(recipeCustomizationIngredientSuggestions)recipeCustomizationIngredientSuggestions.innerHTML='';
}
function openRecipeCustomizationIngredientPicker(){
  if(!recipeCustomizationDish||!recipeCustomizationIngredientPicker||!recipeCustomizationIngredientSearch)return;
  hideRecipeCustomizationSuggestions();
  recipeCustomizationIngredientPicker.hidden=false;
  recipeCustomizationAddButton.hidden=true;
  renderRecipeCustomizationIngredientOptions();
  recipeCustomizationIngredientSearch.focus({preventScroll:true});
}
function renderRecipeCustomizationIngredientOptions(){
  if(!recipeCustomizationDish||!recipeCustomizationIngredientSuggestions)return;
  const needle=normalize(recipeCustomizationIngredientSearch?.value||'');
  const visible=new Set(recipeIngredientsForDish(recipeCustomizationDish,recipeCustomizationSelection));
  const matches=[...CATALOG_NAMES]
    .filter(name=>!visible.has(name)&&(!needle||normalize(name).includes(needle)))
    .sort((a,b)=>a.localeCompare(b,'fr'))
    .slice(0,50);
  recipeCustomizationIngredientSuggestions.innerHTML=matches.length
    ?matches.map(name=>'<button type="button" class="recipe-customization-suggestion" role="option" data-recipe-ingredient="'+escapeHtml(name)+'"><span>'+escapeHtml(name)+'</span><small>Catalogue</small></button>').join('')
    :'<div class="recipe-customization-suggestion-empty">Aucun ingrédient disponible.</div>';
}
function addRecipeCustomizationIngredient(name){
  const dish=recipeCustomizationDish;
  if(!dish||!CATALOG_NAMES.has(name))return;
  recipeCustomizationSelection.add(name);
  const amount=Number(recipeQuantities()?.getNeed?.(dish.name,name,4));
  if(Number.isFinite(amount)&&amount>0)recipeCustomizationNeeds[name]=amount;
  hideRecipeCustomizationIngredientPicker();
  renderRecipeCustomizationIngredients();
  if(recipeCustomizationList)recipeCustomizationList.scrollTop=recipeCustomizationList.scrollHeight;
}
function resetRecipeCustomizationDraft(){
  const dish=recipeCustomizationDish;
  if(!dish)return;
  delete recipeCustomizations[dish.name];
  persistRecipeCustomizations();
  recipeQuantities()?.resetRecipeNeeds?.(dish.name);
  recipeCustomizationSelection=new Set(dish.ingredients);
  recipeCustomizationNeeds={};
  dish.ingredients.forEach(name=>{
    const amount=Number(recipeQuantities()?.getBaseNeed?.(dish.name,name,4));
    if(Number.isFinite(amount)&&amount>0)recipeCustomizationNeeds[name]=amount;
  });
  hideRecipeCustomizationIngredientPicker();
  renderRecipeCustomizationIngredients();
  showToast('Recette '+dish.name+' réinitialisée');
}
function recipeCustomizationMatchesBase(){
  const dish=recipeCustomizationDish;
  if(!dish||!selectionMatchesBase(dish,recipeCustomizationSelection))return false;
  const api=recipeQuantities();
  return dish.ingredients.every(name=>{
    const base=Number(api?.getBaseNeed?.(dish.name,name,4));
    const current=Number(recipeCustomizationNeeds[name]);
    if(!(Number.isFinite(base)&&base>0))return !(Number.isFinite(current)&&current>0);
    return Number.isFinite(current)&&Math.abs(current-base)<0.001;
  });
}
function syncRecipeCustomizationActions(){
  if(!recipeCustomizationStatus||!recipeCustomizationReset||!recipeCustomizationSave)return;
  const dish=recipeCustomizationDish;
  if(!dish){
    recipeCustomizationStatus.textContent='Aucun plat trouvé.';
    recipeCustomizationReset.disabled=true;
    recipeCustomizationSave.disabled=true;
    if(recipeCustomizationAddButton)recipeCustomizationAddButton.disabled=true;
    return;
  }
  const count=recipeCustomizationSelection.size;
  const total=recipeIngredientsForDish(dish,recipeCustomizationSelection).length;
  recipeCustomizationStatus.textContent=count+' ingrédient'+(count>1?'s':'')+' sur '+total+' · quantités pour 4 personnes';
  recipeCustomizationReset.disabled=recipeCustomizationMatchesBase();
  recipeCustomizationSave.disabled=count===0;
  if(recipeCustomizationAddButton)recipeCustomizationAddButton.disabled=false;
}
function renderRecipeCustomizationIngredients(){
  const dish=recipeCustomizationDish;
  if(!recipeCustomizationList)return;
  if(!dish){
    recipeCustomizationList.innerHTML='<div class="recipe-customization-empty">Aucun plat ne correspond à votre recherche.</div>';
    syncRecipeCustomizationActions();
    return;
  }
  const api=recipeQuantities();
  const ingredients=recipeIngredientsForDish(dish,recipeCustomizationSelection);
  recipeCustomizationList.innerHTML=ingredients.map(name=>{
    const selected=recipeCustomizationSelection.has(name);
    const amount=Number(recipeCustomizationNeeds[name]);
    const unit=api?.getRecipeUnit?.(name)||'g';
    const hasAmount=Number.isFinite(amount)&&amount>0;
    const quantity=hasAmount
      ?'<label class="recipe-customization-quantity"><input type="number" inputmode="decimal" min="'+(unit==='piece'?'0.25':'1')+'" step="'+(unit==='piece'?'0.25':'1')+'" value="'+escapeHtml(amount)+'" data-recipe-quantity="'+escapeHtml(name)+'" aria-label="Quantité de '+escapeHtml(name)+' pour 4 personnes" '+(selected?'':'disabled')+'><span>'+escapeHtml(recipeUnitLabel(unit))+'</span></label>'
      :'<span class="recipe-customization-auto">Auto</span>';
    return '<div class="recipe-customization-item '+(selected?'is-selected':'')+'" data-ingredient="'+escapeHtml(name)+'">'+
      '<button type="button" class="recipe-customization-toggle" aria-pressed="'+(selected?'true':'false')+'"><i aria-hidden="true">✓</i><span class="recipe-customization-name">'+escapeHtml(name)+'</span></button>'+quantity+'</div>';
  }).join('');
  recipeCustomizationList.querySelectorAll('.recipe-customization-toggle').forEach(button=>button.addEventListener('click',()=>{
    const name=button.closest('.recipe-customization-item')?.dataset?.ingredient||'';
    if(recipeCustomizationSelection.has(name))recipeCustomizationSelection.delete(name);else recipeCustomizationSelection.add(name);
    renderRecipeCustomizationIngredients();
  }));
  recipeCustomizationList.querySelectorAll('[data-recipe-quantity]').forEach(input=>input.addEventListener('input',()=>{
    const name=input.dataset.recipeQuantity||'';
    const value=Number(input.value);
    if(Number.isFinite(value)&&value>0)recipeCustomizationNeeds[name]=value;
    syncRecipeCustomizationActions();
  }));
  recipeCustomizationList.querySelectorAll('[data-recipe-quantity]').forEach(input=>input.addEventListener('change',()=>{
    const name=input.dataset.recipeQuantity||'';
    const value=Number(input.value);
    if(Number.isFinite(value)&&value>0){recipeCustomizationNeeds[name]=value;return}
    const fallback=Number(recipeQuantities()?.getBaseNeed?.(dish.name,name,4));
    if(Number.isFinite(fallback)&&fallback>0){recipeCustomizationNeeds[name]=fallback;input.value=String(fallback)}
    syncRecipeCustomizationActions();
  }));
  syncRecipeCustomizationActions();
}
function openRecipeCustomization(){
  if(!recipeCustomizationDialog)return;
  const current=recipeCustomizationDish?.name||DISHES[0]?.name||'';
  loadRecipeCustomizationDish(current);
  recipeCustomizationSearch.value='';
  if(typeof recipeCustomizationDialog.showModal==='function')recipeCustomizationDialog.showModal();
  else recipeCustomizationDialog.setAttribute('open','');
  recipeCustomizationDialog.focus({preventScroll:true});
  hideRecipeCustomizationSuggestions();
  hideRecipeCustomizationIngredientPicker();
}
function saveRecipeCustomization(){
  const dish=recipeCustomizationDish;
  if(!dish||!recipeCustomizationSelection.size)return;
  const selected=recipeIngredientsForDish(dish,recipeCustomizationSelection).filter(name=>recipeCustomizationSelection.has(name));
  if(selectionMatchesBase(dish,recipeCustomizationSelection))delete recipeCustomizations[dish.name];
  else recipeCustomizations[dish.name]=selected;
  persistRecipeCustomizations();
  recipeQuantities()?.setRecipeNeeds?.(dish.name,recipeCustomizationNeeds);
  hideRecipeCustomizationSuggestions();
  hideRecipeCustomizationIngredientPicker();
  loadRecipeCustomizationDish(dish.name);
  recipeCustomizationSearch.value=dish.name;
  showToast('Recette '+dish.name+' personnalisée');
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
function syncDishFavorite(card,name){
  const button=card?.querySelector('.dish-favorite');
  if(!button)return;
  const favorite=favorites.has(name);
  button.classList.toggle('is-active',favorite);
  button.setAttribute('aria-label',favorite?'Retirer des favoris':'Ajouter aux favoris');
  button.setAttribute('aria-pressed',favorite?'true':'false');
  button.textContent=favorite?'♥':'♡';
}
function dishCard(dish){
  let card=dishCardCache.get(dish.name);
  if(card){
    syncDishFavorite(card,dish.name);
    return card;
  }
  card=document.createElement('article');
  card.className='dish-card';
  card.dataset.dish=dish.name;
  card.tabIndex=0;
  card.setAttribute('role','button');
  card.setAttribute('aria-label','Voir les ingrédients de '+dish.name);
  card.innerHTML=
    '<div class="dish-visual"><img src="'+dishPhotoUrl(dish.name)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>'+ 
    '<button type="button" class="dish-favorite" aria-label="Ajouter aux favoris" aria-pressed="false">♡</button>'+ 
    '<div class="dish-copy"><strong>'+escapeHtml(dish.name)+'</strong><small>'+dish.ingredients.length+' ingrédients</small></div>'+ 
    '<span class="dish-add" aria-hidden="true">+</span>';
  const cardImage=card.querySelector('.dish-visual img');
  bindDishImageFallback(cardImage);
  const favoriteButton=card.querySelector('.dish-favorite');
  favoriteButton.addEventListener('click',event=>{event.stopPropagation();toggleFavorite(dish.name)});
  card.addEventListener('click',event=>{if(!event.target.closest('.dish-favorite'))openDishSheet(dish)});
  card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.dish-favorite')){event.preventDefault();openDishSheet(dish)}});
  dishCardCache.set(dish.name,card);
  syncDishFavorite(card,dish.name);
  return card;
}
function renderDishes(){
  if(!dishesGrid||mode!=='dishes')return;
  const dishes=visibleDishes();
  dishCount.textContent=dishes.length+' plat'+(dishes.length>1?'s':'');
  if(!dishes.length){
    const empty=document.createElement('div');
    empty.className='dish-empty';
    empty.textContent=filter==='Favoris'?'Aucun plat favori pour le moment.':'Aucun plat trouvé.';
    dishesGrid.replaceChildren(empty);
    return;
  }
  const fragment=document.createDocumentFragment();
  dishes.forEach(dish=>fragment.appendChild(dishCard(dish)));
  dishesGrid.replaceChildren(fragment);
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
  selectedIngredients=new Set(selectedDefaultsForDish(dish));
  useDishImage(dishSheetPhoto,dish.name);
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
  const missing=recipeIngredientsForDish(dish).filter(name=>!ingredientThumbCache.has(name));
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
  dishSheetList.innerHTML=recipeIngredientsForDish(currentDish).map(name=>{
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
  if(!currentDish||busyDish||dishConfirmButton.disabled)return;
  cancelIngredientThumbs();
  const dish=currentDish;
  const operation=window.COURSES_QUANTITIES.addSelected();
  closeDishSheet();
  busyDish=dish.name;
  let result;
  try{
    result=await operation;
  }catch(error){
    showToast('Ajout impossible');
    return;
  }finally{
    busyDish='';
  }
  navigator.vibrate?.(result.added?[12,35,12]:10);
  if(result.failed){showToast('Ajout partiel · '+result.added+' unité'+(result.added>1?'s':'')+' ajoutée'+(result.added>1?'s':'')+' · '+result.failed+' erreur'+(result.failed>1?'s':''));return}
  if(!result.added){showToast('Les quantités nécessaires sont déjà dans Ma liste');return}
  showToast(dish.name+' · '+result.added+' unité'+(result.added>1?'s':'')+' ajoutée'+(result.added>1?'s':'')+(result.present?' · '+result.present+' déjà dans Ma liste':''));
}
function setHiddenCatalogQuery(value){
  drivingCatalog=true;
  searchInput.value=value;
  searchInput.dispatchEvent(new Event('input',{bubbles:true}));
  drivingCatalog=false;
}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}

function init(){
  buildUi();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();