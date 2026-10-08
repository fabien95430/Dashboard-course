(() => {
'use strict';

// Références techniques utilisées uniquement pour convertir un besoin de recette
// en nombre d'unités à ajouter. Elles ne sont jamais affichées comme un format fixe.
const PURCHASE_REFERENCES=Object.freeze({
  'Spaghetti':{amount:500,unit:'g'},
  'Penne':{amount:500,unit:'g'},
  'Coquillettes':{amount:500,unit:'g'},
  'Tagliatelles':{amount:500,unit:'g'},
  'Lasagnes':{amount:500,unit:'g'},
  'Riz basmati':{amount:500,unit:'g'},
  'Riz long':{amount:500,unit:'g'},
  'Quinoa':{amount:500,unit:'g'},
  'Couscous':{amount:500,unit:'g'},
  'Nouilles chinoises':{amount:250,unit:'g'},
  'Lardons':{amount:200,unit:'g'},
  'Parmesan':{amount:100,unit:'g'},
  'Crème fraîche':{amount:200,unit:'ml'},
  'Crème liquide':{amount:200,unit:'ml'},
  'Crème épaisse':{amount:200,unit:'ml'},
  'Œufs':{amount:6,unit:'piece'},
  'Mascarpone':{amount:250,unit:'g'},
  'Frites surgelées':{amount:1000,unit:'g'},
  'Mozzarella':{amount:125,unit:'g'},
  'Fromage râpé':{amount:200,unit:'g'},
  'Pains burger':{amount:4,unit:'piece'},
  'Pains hot-dog':{amount:4,unit:'piece'},
  'Wraps':{amount:6,unit:'piece'},
  'Galettes de blé':{amount:8,unit:'piece'},
  'Sauce tomate':{amount:400,unit:'g'},
  'Pesto':{amount:190,unit:'g'},
  'Sauce soja':{amount:150,unit:'ml'},
  'Moutarde':{amount:370,unit:'g'},
  'Miel':{amount:375,unit:'g'},
  'Curry':{amount:40,unit:'g'},
  'Lait de coco':{amount:400,unit:'ml'},
  'Haricots rouges':{amount:400,unit:'g'},
  'Pois chiches':{amount:400,unit:'g'},
  'Tomates pelées':{amount:400,unit:'g'},
  'Maïs en boîte':{amount:300,unit:'g'},
  'Thon en boîte':{amount:140,unit:'g'},
  'Lentilles':{amount:400,unit:'g'},
  'Farine':{amount:1000,unit:'g'},
  'Sucre':{amount:1000,unit:'g'},
  'Beurre':{amount:250,unit:'g'},
  'Lait':{amount:1000,unit:'ml'},
  'Lait entier':{amount:1000,unit:'ml'},
  'Lait demi-écrémé':{amount:1000,unit:'ml'},
  'Lait écrémé':{amount:1000,unit:'ml'},
  'Lait sans lactose':{amount:1000,unit:'ml'},
  "Lait d'amande":{amount:1000,unit:'ml'},
  "Lait d'avoine":{amount:1000,unit:'ml'},
  'Chapelure':{amount:250,unit:'g'},
  'Croûtons':{amount:100,unit:'g'},
  'Vanille':{amount:1,unit:'piece'}
});

const PRODUCT_META=new Map();
Object.entries(window.COURSES_CATALOG?.groups||{}).forEach(([category,subgroups])=>{
  Object.entries(subgroups||{}).forEach(([sub,names])=>{
    (Array.isArray(names)?names:[]).forEach(name=>PRODUCT_META.set(name,{category,sub}));
  });
});

// Libellés visibles : mode d'achat / type de conditionnement uniquement.
const DISPLAY_MODE_BY_SUB=Object.freeze({
  'Laits & crèmes':'Bouteille',
  'Yaourts & desserts':'Pot',
  'Fromages':'Poids',
  'Charcuterie':'Barquette',
  'Viandes':'Poids',
  'Poissons & traiteur':'Poids',
  'Surgelés':'Sachet',
  'Boulangerie':'Pièce',
  'Fruits classiques':'Poids',
  'Fruits rouges & exotiques':'Poids',
  'Légumes du quotidien':'Poids',
  'Légumes variés':'Poids',
  'Salades & herbes':'Pièce',
  'Pommes de terre & aromates':'Poids',
  'Pâtes, riz & céréales':'Paquet',
  'Conserves':'Boîte',
  'Sauces & condiments':'Flacon',
  'Petit-déjeuner':'Paquet',
  'Biscuits & goûters':'Paquet',
  'Pâtisserie & cuisine':'Paquet',
  'Apéritif':'Sachet',
  'Monde & pratique':'Paquet',
  'Eaux & jus':'Bouteille',
  'Sodas & sirops':'Bouteille',
  'Café & thé':'Boîte',
  'Bières & vins':'Bouteille',
  'Entretien':'Flacon',
  'Lessive':'Flacon',
  'Vaisselle':'Flacon',
  'Papier & sacs':'Paquet',
  'Hygiène':'Flacon',
  'Salle de bain & soins':'Flacon',
  'Enfant':'Paquet'
});

const DISPLAY_MODE_BY_PRODUCT=Object.freeze({
  'Crème fraîche':'Pot','Crème liquide':'Brique','Crème épaisse':'Pot','Œufs':'Boîte','Mascarpone':'Pot',
  'Beurre':'Plaquette','Camembert':'Pièce','Chèvre':'Pièce','Mozzarella':'Sachet','Raclette':'Barquette','Reblochon':'Pièce','Fromage râpé':'Sachet',
  'Saucisson':'Pièce','Chorizo':'Pièce','Pâté':'Barquette','Rillettes':'Pot',
  'Surimi':'Paquet','Saumon fumé':'Paquet','Poisson pané':'Boîte','Quiche':'Pièce','Pizza fraîche':'Boîte','Pâtes fraîches':'Paquet',
  'Steaks hachés surgelés':'Boîte','Pizza surgelée':'Boîte','Glace vanille':'Pot','Glace chocolat':'Pot','Sorbet':'Pot','Glaçons':'Sac',
  'Pain de mie':'Paquet','Brioche':'Paquet','Croissants':'Paquet','Pains au chocolat':'Paquet','Wraps':'Paquet','Pains burger':'Paquet','Pains hot-dog':'Paquet','Galettes de blé':'Paquet',
  'Citrons':'Pièce','Kiwis':'Pièce','Fraises':'Barquette','Framboises':'Barquette','Myrtilles':'Barquette','Mûres':'Barquette',
  'Ananas':'Pièce','Mangue':'Pièce','Avocat':'Pièce','Noix de coco':'Pièce','Grenade':'Pièce','Fruit de la passion':'Pièce','Melon':'Pièce',
  'Concombres':'Pièce','Brocoli':'Pièce','Chou-fleur':'Pièce','Épinards':'Sachet','Poireaux':'Botte',
  'Champignons':'Barquette','Courge':'Pièce','Potiron':'Pièce','Butternut':'Pièce','Fenouil':'Pièce','Céleri':'Pièce','Artichauts':'Pièce','Asperges':'Botte','Maïs':'Pièce','Radis':'Botte',
  'Mâche':'Sachet','Roquette':'Sachet','Endives':'Sachet',
  'Persil':'Botte','Ciboulette':'Botte','Basilic':'Botte','Coriandre':'Botte','Menthe':'Botte','Thym frais':'Botte','Romarin frais':'Botte',
  'Ail':'Pièce','Citron vert':'Pièce','Olives fraîches':'Barquette',
  'Mayonnaise':'Pot','Moutarde':'Pot','Sauce tomate':'Pot','Pesto':'Pot','Vinaigre balsamique':'Bouteille','Vinaigre de vin':'Bouteille','Huile d\'olive':'Bouteille','Huile de tournesol':'Bouteille',
  'Café soluble':'Pot','Thé noir':'Boîte','Thé vert':'Boîte','Chocolat en poudre':'Boîte','Céréales':'Boîte','Confiture':'Pot','Miel':'Pot','Pâte à tartiner':'Pot',
  'Bonbons':'Sachet','Chocolat noir':'Tablette','Chocolat au lait':'Tablette',
  'Levure chimique':'Sachet','Levure boulangère':'Sachet','Maïzena':'Boîte','Vanille':'Sachet','Pépites chocolat':'Sachet','Noix de coco râpée':'Sachet','Amandes en poudre':'Sachet',
  'Olives':'Pot','Crackers':'Paquet','Mini saucissons':'Paquet','Tapenade':'Pot','Houmous':'Pot',
  'Nouilles instantanées':'Paquet','Nouilles chinoises':'Paquet','Tortillas':'Paquet','Couscous':'Paquet','Curry':'Flacon','Lait de coco':'Boîte','Harissa':'Tube','Guacamole':'Pot','Purée en flocons':'Paquet','Bouillon cubes':'Boîte','Soupes en brique':'Brique','Croûtons':'Sachet',
  'Café décaféiné':'Paquet','Chicorée':'Pot','Matcha':'Boîte','Chocolat chaud':'Boîte','Filtres à café':'Boîte',
  'Éponges magiques':'Paquet','Lingettes ménage':'Paquet','Bicarbonate':'Paquet','Vinaigre ménager':'Bouteille',
  'Lessive capsules':'Boîte','Lessive poudre':'Paquet','Lingettes anti-décoloration':'Boîte','Filet de lavage':'Pièce','Pinces à linge':'Paquet','Sacs linge délicat':'Paquet',
  'Tablettes lave-vaisselle':'Boîte','Sel lave-vaisselle':'Paquet','Éponges':'Paquet','Grattoirs':'Paquet','Brosses vaisselle':'Pièce','Gants ménage':'Paire','Torchons':'Paquet','Essuie-verres':'Paquet',
  'Papier aluminium':'Rouleau','Film alimentaire':'Rouleau','Papier cuisson':'Rouleau',
  'Dentifrice':'Tube','Brosses à dents':'Pièce','Cotons-tiges':'Boîte','Disques coton':'Paquet','Mouchoirs poche':'Paquet','Papier toilette humide':'Paquet',
  'Crème hydratante':'Tube','Crème mains':'Tube','Baume lèvres':'Stick','Rasoirs':'Paquet','Coton':'Paquet','Protections hygiéniques':'Paquet','Pansements':'Boîte','Thermomètre piles':'Pièce','Pile AAA':'Paquet',
  'Lait infantile':'Boîte','Petits pots':'Pot','Compotes bébé':'Pot','Croquettes chat':'Sac','Pâtée chat':'Boîte','Litière chat':'Sac','Croquettes chien':'Sac','Sacs déjections':'Paquet','Friandises animaux':'Paquet'
});

// Modes techniques conservés séparément pour le modèle de doublons Home Assistant.
const TECHNICAL_MODE_BY_SUB=Object.freeze({
  'Laits & crèmes':'Volume',
  'Yaourts & desserts':'Pot',
  'Fromages':'Poids',
  'Charcuterie':'Barquette',
  'Viandes':'Poids',
  'Poissons & traiteur':'Poids',
  'Surgelés':'Sachet',
  'Boulangerie':'Pièce',
  'Fruits classiques':'Poids',
  'Fruits rouges & exotiques':'Poids',
  'Légumes du quotidien':'Poids',
  'Légumes variés':'Poids',
  'Salades & herbes':'Pièce',
  'Pommes de terre & aromates':'Poids',
  'Pâtes, riz & céréales':'Paquet',
  'Conserves':'Boîte',
  'Sauces & condiments':'Flacon',
  'Petit-déjeuner':'Paquet',
  'Biscuits & goûters':'Paquet',
  'Pâtisserie & cuisine':'Paquet',
  'Apéritif':'Sachet',
  'Monde & pratique':'Sachet',
  'Eaux & jus':'Bouteille',
  'Sodas & sirops':'Bouteille',
  'Café & thé':'Boîte',
  'Bières & vins':'Bouteille',
  'Entretien':'Flacon',
  'Lessive':'Flacon',
  'Vaisselle':'Flacon',
  'Papier & sacs':'Paquet',
  'Hygiène':'Flacon',
  'Salle de bain & soins':'Flacon',
  'Enfant':'Paquet'
});

const TECHNICAL_MODE_BY_PRODUCT=Object.freeze({
  'Surimi':'Paquet','Poisson pané':'Boîte','Quiche':'Pièce','Pizza fraîche':'Pièce','Pâtes fraîches':'Paquet',
  'Ananas':'Pièce','Mangue':'Pièce','Avocat':'Pièce','Noix de coco':'Pièce','Grenade':'Pièce','Fruit de la passion':'Pièce','Melon':'Pièce',
  'Concombres':'Pièce','Brocoli':'Pièce','Chou-fleur':'Pièce','Courge':'Pièce','Potiron':'Pièce','Butternut':'Pièce','Fenouil':'Pièce','Céleri':'Pièce','Artichauts':'Pièce',
  'Ail':'Pièce','Citron vert':'Pièce'
});

// Une occurrence synchronisée avec Home Assistant représente 100 g (ou 100 ml)
// pour les produits vendus à quantité variable. Cela conserve le modèle actuel
// de quantité par doublons tout en permettant aux plats de transporter leur besoin réel.
const VARIABLE_PURCHASE_STEPS=Object.freeze({
  'Poids':{amount:100,unit:'g'},
  'Coupe':{amount:100,unit:'g'},
  'Volume':{amount:100,unit:'ml'}
});

// Besoin culinaire, indépendant du conditionnement du produit.
const NEED_PER_PERSON=Object.freeze({
  'Spaghetti':100,'Penne':100,'Coquillettes':100,'Tagliatelles':100,'Lasagnes':100,
  'Riz basmati':75,'Riz long':75,'Quinoa':70,'Couscous':80,'Nouilles chinoises':100,
  'Lardons':50,'Parmesan':25,'Crème fraîche':50,'Crème liquide':125,'Œufs':1,
  'Poulet':125,'Escalopes de poulet':125,'Viande hachée':125,'Bœuf':125,
  'Steaks hachés':1,'Saucisses':1,'Merguez':2,
  'Saumon':150,'Cabillaud':150,'Crevettes':100,'Moules':500,'Saumon fumé':50,'Frites surgelées':200,
  'Mozzarella':60,'Fromage râpé':40,'Emmental':40,'Raclette':200,'Reblochon':112.5,'Chèvre':50,
  'Jambon blanc':1,'Jambon cru':25,'Rosette':25,'Chorizo':50,'Blanc de poulet':1,
  'Pains burger':1,'Pains hot-dog':1,'Wraps':1,'Galettes de blé':2,
  'Pain de mie':70,'Pain':100,'Baguette':60,
  'Sauce tomate':100,'Pesto':30,'Sauce soja':15,'Moutarde':10,'Miel':15,'Curry':5,'Lait de coco':100,
  'Haricots rouges':100,'Pois chiches':100,'Tomates pelées':100,'Maïs en boîte':75,'Thon en boîte':70,'Lentilles':80,
  'Tomates':125,'Carottes':100,'Courgettes':125,'Aubergines':125,'Poivrons':100,'Champignons':60,
  'Brocoli':150,'Haricots verts':150,'Épinards':100,'Poireaux':150,'Pommes de terre':250,
  'Oignons jaunes':50,'Oignons rouges':50,'Salade verte':0.25,'Avocat':0.5,'Concombres':0.25,
  'Citron':0.25,'Citrons':0.25,'Ail':0.25,'Gingembre':10,'Basilic':4,'Romarin frais':2,'Noix':25,
  'Farine':65,'Sucre':25,'Beurre':25,'Lait':100,'Chapelure':25,'Croûtons':25,'Vanille':0.25
});

const RECIPE_UNITS=Object.freeze({
  'Crème fraîche':'ml','Crème liquide':'ml','Sauce soja':'ml','Lait de coco':'ml','Lait':'ml',
  'Œufs':'piece','Steaks hachés':'piece','Saucisses':'piece','Merguez':'piece','Jambon blanc':'piece',
  'Blanc de poulet':'piece','Pains burger':'piece','Pains hot-dog':'piece','Wraps':'piece',
  'Galettes de blé':'piece','Salade verte':'piece','Avocat':'piece','Concombres':'piece',
  'Citron':'piece','Citrons':'piece','Ail':'piece','Vanille':'piece'
});

const DISH_NEEDS_FOR_FOUR=Object.freeze({
  'Spaghetti carbonara':{'Spaghetti':400,'Lardons':200,'Œufs':4,'Parmesan':100,'Crème fraîche':200},
  'Tartiflette':{'Pommes de terre':1000,'Reblochon':450,'Lardons':200,'Oignons jaunes':200,'Crème fraîche':200},
  'Raclette':{'Raclette':800,'Pommes de terre':1000},
  'Omelette jambon fromage':{'Œufs':6,'Jambon blanc':4},
  'Gratin de courgettes':{'Œufs':3},
  'Quiche lorraine':{'Œufs':3,'Lardons':200,'Crème fraîche':200},
  'Quiche poireaux chèvre':{'Œufs':3},
  'Salade César':{'Œufs':2},
  'Salade César saumon':{'Œufs':2},
  'Crème brûlée':{'Crème liquide':500,'Œufs':4,'Sucre':100,'Vanille':1},
  'Sushis':{'Saumon':400,'Riz long':320,'Avocat':2,'Concombres':1},
  'Steak tartare':{'Bœuf':600,'Œufs':4,'Oignons rouges':120}
});

const BASE_SERVINGS=4;
let dialog=null;
let list=null;
let products=null;
let shoppingList=null;
let pending=false;
let productObserver=null;
let listObserver=null;
let shoppingListObserver=null;
let dialogObserver=null;
const STORAGE_SERVINGS='courses-dish-servings-v1';
const STORAGE_RECIPE_NEEDS='courses-dish-need-overrides-v1';
let recipeNeedOverrides=readRecipeNeedOverrides();

window.COURSES_PRODUCT_PACKS=PURCHASE_REFERENCES;

function servings(){
  const input=dialog?.querySelector('.dish-servings-value');
  const value=Math.round(Number(input?.value)||BASE_SERVINGS);
  return Math.max(1,Math.min(12,value));
}
function currentDish(){
  return dialog?.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
}
function purchaseReferenceFor(name){
  const reference=PURCHASE_REFERENCES[name];
  return reference&&Number(reference.amount)>0?reference:null;
}
function purchaseLabel(name){
  const explicit=DISPLAY_MODE_BY_PRODUCT[name];
  if(explicit)return explicit;
  const meta=PRODUCT_META.get(name);
  return DISPLAY_MODE_BY_SUB[meta?.sub]||'Unité';
}
function technicalMode(name){
  const explicit=TECHNICAL_MODE_BY_PRODUCT[name];
  if(explicit)return explicit;
  const meta=PRODUCT_META.get(name);
  return TECHNICAL_MODE_BY_SUB[meta?.sub]||'Unité';
}
function variablePurchaseStepFor(name){
  if(purchaseReferenceFor(name))return null;
  const step=VARIABLE_PURCHASE_STEPS[technicalMode(name)];
  if(!step)return null;
  const recipeUnit=RECIPE_UNITS[name]||'g';
  return recipeUnit===step.unit?step:null;
}
function recipeUnitFor(name){
  return RECIPE_UNITS[name]||purchaseReferenceFor(name)?.unit||variablePurchaseStepFor(name)?.unit||'g';
}
function auditPurchaseModes(){
  const missing=[];
  PRODUCT_META.forEach((meta,name)=>{
    if(DISPLAY_MODE_BY_PRODUCT[name]||DISPLAY_MODE_BY_SUB[meta?.sub])return;
    missing.push(name);
  });
  if(missing.length)console.warn('Catalogue : mode d’achat non défini',missing);
}
function readRecipeNeedOverrides(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_RECIPE_NEEDS)||'{}');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
    const clean={};
    Object.entries(raw).forEach(([dish,values])=>{
      if(!values||typeof values!=='object'||Array.isArray(values))return;
      const dishValues={};
      Object.entries(values).forEach(([name,value])=>{
        const amount=Number(value);
        if(PRODUCT_META.has(name)&&Number.isFinite(amount)&&amount>0)dishValues[name]=amount;
      });
      if(Object.keys(dishValues).length)clean[String(dish)]=dishValues;
    });
    return clean;
  }catch(_){return {}}
}
function persistRecipeNeedOverrides(){
  try{localStorage.setItem(STORAGE_RECIPE_NEEDS,JSON.stringify(recipeNeedOverrides))}catch(_){}
}
function baseNeedFor(name,dish=currentDish(),count=servings()){
  const currentServings=Math.max(1,Math.min(12,Math.round(Number(count)||BASE_SERVINGS)));
  const dishNeed=Number(DISH_NEEDS_FOR_FOUR[dish]?.[name]);
  if(Number.isFinite(dishNeed)&&dishNeed>0)return dishNeed*currentServings/BASE_SERVINGS;
  const perPerson=Number(NEED_PER_PERSON[name]);
  return Number.isFinite(perPerson)&&perPerson>0?perPerson*currentServings:null;
}
function needFor(name,dish=currentDish(),count=servings()){
  const currentServings=Math.max(1,Math.min(12,Math.round(Number(count)||BASE_SERVINGS)));
  const custom=Number(recipeNeedOverrides[dish]?.[name]);
  if(Number.isFinite(custom)&&custom>0)return custom*currentServings/BASE_SERVINGS;
  return baseNeedFor(name,dish,currentServings);
}
function quantityFor(name,dish=currentDish(),count=servings()){
  const purchaseUnit=purchaseReferenceFor(name)||variablePurchaseStepFor(name);
  const need=needFor(name,dish,count);
  if(!purchaseUnit||need===null)return 1;
  return Math.max(1,Math.ceil(need/purchaseUnit.amount));
}
function setRecipeNeeds(dish,values){
  const dishName=String(dish||'').trim();
  if(!dishName)return false;
  const clean={};
  Object.entries(values||{}).forEach(([name,value])=>{
    if(!PRODUCT_META.has(name))return;
    const amount=Number(value);
    if(!Number.isFinite(amount)||amount<=0)return;
    const rounded=Math.round(amount*100)/100;
    const base=baseNeedFor(name,dishName,BASE_SERVINGS);
    if(base!==null&&Math.abs(base-rounded)<0.001)return;
    clean[name]=rounded;
  });
  if(Object.keys(clean).length)recipeNeedOverrides[dishName]=clean;
  else delete recipeNeedOverrides[dishName];
  persistRecipeNeedOverrides();
  if(currentDish()===dishName)decorateDishRows();
  return true;
}
function resetRecipeNeeds(dish){
  const dishName=String(dish||'').trim();
  if(!dishName)return false;
  delete recipeNeedOverrides[dishName];
  persistRecipeNeedOverrides();
  if(currentDish()===dishName)decorateDishRows();
  return true;
}
function hasRecipeNeeds(dish){
  return Boolean(Object.keys(recipeNeedOverrides[String(dish||'')]||{}).length);
}
function formatNumber(value){
  return Number.isInteger(value)?String(value):String(Math.round(value*10)/10).replace('.',',');
}
function formatNeed(name,need){
  if(!(Number.isFinite(need)&&need>0))return '';
  const unit=recipeUnitFor(name);
  if(unit==='piece'){
    const rounded=Math.max(1,Math.ceil(need));
    return rounded+' '+(rounded>1?'pièces':'pièce');
  }
  if(unit==='ml'){
    if(need>=1000)return formatNumber(need/1000)+' L';
    if(need%10===0)return formatNumber(need/10)+' cl';
    return formatNumber(need)+' ml';
  }
  if(need>=1000)return formatNumber(need/1000)+' kg';
  return formatNumber(need)+' g';
}
function measuredQuantity(name,count){
  const step=variablePurchaseStepFor(name);
  const value=Math.max(0,Number(count)||0);
  return step&&value>0?formatNeed(name,value*step.amount):'';
}
function ensureStyles(){
  if(document.getElementById('courses-product-quantities-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-quantities-style';
  style.textContent=`
    #products .product .product-pack-badge{
      position:absolute!important;
      z-index:2!important;
      top:6px!important;
      left:6px!important;
      height:17px!important;
      max-width:45px!important;
      padding:0 5px!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      border:1px solid rgba(27,49,35,.08)!important;
      border-radius:999px!important;
      background:rgba(248,250,246,.92)!important;
      color:#5f6e66!important;
      box-shadow:0 2px 7px rgba(46,64,52,.08)!important;
      font-size:8px!important;
      line-height:1!important;
      font-weight:780!important;
      letter-spacing:-.08px!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      pointer-events:none!important;
    }
    #products .product.is-selected .product-pack-badge{
      background:rgba(255,255,255,.82)!important;
      color:#365447!important;
    }
    #products .product .pcat{display:block!important}
    #dishDialog .dish-ingredient-name{display:flex!important;flex-direction:column!important;gap:2px!important}
    #dishDialog .dish-ingredient-pack{display:block!important;color:#718078!important;font-size:10.5px!important;line-height:1.05!important;font-weight:720!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #dishDialog .dish-ingredient-check{font-size:12px!important;letter-spacing:-.2px!important}
    #listItems .list-qty.is-measured-count{display:none!important}
    #listItems .list-measured-quantity{display:block!important;color:#718078!important;font-size:11px!important;line-height:1.15!important;font-weight:720!important;white-space:nowrap!important}
  `;
  document.head.appendChild(style);
}
function decorateProducts(){
  if(!products)return;
  products.querySelectorAll('.product[data-name]').forEach(card=>{
    const name=String(card.dataset.name||'');
    const variableStep=variablePurchaseStepFor(name);
    const quantity=Math.max(0,Number(card.dataset.quantity)||0);
    const meta=PRODUCT_META.get(name);
    const detail=card.querySelector('.pcat');
    const subcategory=String(meta?.sub||meta?.category||'');
    if(detail){
      if(detail.textContent!==subcategory)detail.textContent=subcategory;
      detail.hidden=!subcategory;
      delete detail.dataset.packReference;
      if(subcategory)detail.title=subcategory;
      else detail.removeAttribute('title');
    }
    let reference=card.querySelector('.product-pack-badge');
    if(!reference){
      reference=document.createElement('span');
      reference.className='product-pack-badge';
      card.appendChild(reference);
    }
    const measured=variableStep&&quantity>0?measuredQuantity(name,quantity):'';
    const referenceText=measured||purchaseLabel(name);
    if(reference.textContent!==referenceText)reference.textContent=referenceText;
    reference.title=measured?'Quantité dans Ma liste : '+measured:'Mode d’achat : '+purchaseLabel(name);
  });
}
function decorateShoppingList(){
  if(!shoppingList)return;
  shoppingList.querySelectorAll('.list-row[data-name]').forEach(row=>{
    const name=String(row.dataset.name||'');
    const step=variablePurchaseStepFor(name);
    const countBadge=row.querySelector('.list-qty');
    let measured=row.querySelector('.list-measured-quantity');
    if(!step){
      countBadge?.classList.remove('is-measured-count');
      measured?.remove();
      return;
    }
    const match=String(countBadge?.textContent||'').match(/(\d+)/);
    const count=match?Math.max(1,Number(match[1])||1):1;
    const text=measuredQuantity(name,count);
    const copy=row.querySelector('.list-copy');
    if(!copy||!text)return;
    if(!measured){
      measured=document.createElement('small');
      measured.className='list-measured-quantity';
      copy.appendChild(measured);
    }
    if(measured.textContent!==text)measured.textContent=text;
    countBadge?.classList.add('is-measured-count');
  });
}
function decorateDishRows(){
  if(!dialog?.open||!list)return;
  list.querySelectorAll('.dish-ingredient[data-ingredient]').forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    const purchaseReference=purchaseReferenceFor(name);
    const variableStep=variablePurchaseStepFor(name);
    const need=needFor(name);
    const quantity=quantityFor(name);
    row.dataset.recipeQuantity=String(quantity);
    const label=row.querySelector('.dish-ingredient-name');
    if(label){
      let reference=label.querySelector('.dish-ingredient-pack');
      const text=purchaseReference?purchaseLabel(name):(need!==null?'Besoin : '+formatNeed(name,need):'');
      if(text){
        if(!reference){
          reference=document.createElement('small');
          reference.className='dish-ingredient-pack';
          label.appendChild(reference);
        }
        reference.textContent=text;
      }else{
        reference?.remove();
      }
    }
    const badge=row.querySelector('.dish-ingredient-check');
    if(badge){
      if(purchaseReference){
        badge.textContent='×'+quantity;
        badge.setAttribute('aria-label',quantity+' '+purchaseLabel(name)+(quantity>1?'s':'')+' à acheter');
      }else if(variableStep&&need!==null){
        const purchaseAmount=measuredQuantity(name,quantity);
        badge.textContent='×'+quantity;
        badge.setAttribute('aria-label',purchaseAmount+' à acheter pour un besoin de '+formatNeed(name,need));
      }else{
        badge.textContent='1';
        badge.setAttribute('aria-label','1 article à ajouter');
      }
    }
  });
}
function scheduleDishRefresh(){
  queueMicrotask(()=>requestAnimationFrame(decorateDishRows));
}
function setServings(value){
  const input=dialog?.querySelector('.dish-servings-value');
  if(!input)return;
  const next=Math.max(1,Math.min(12,Math.round(Number(value)||BASE_SERVINGS)));
  input.value=String(next);
  try{localStorage.setItem(STORAGE_SERVINGS,String(next))}catch(_){}
  decorateDishRows();
}
function buildServingsControl(){
  const head=dialog?.querySelector('.dish-sheet-head');
  if(!head||head.querySelector('.dish-servings'))return;
  const block=document.createElement('div');
  block.className='dish-servings';
  block.innerHTML='<strong>Nombre de personnes</strong><div class="dish-servings-control"><button type="button" class="dish-servings-step" data-step="-1" aria-label="Retirer une personne">−</button><input class="dish-servings-value" type="number" inputmode="numeric" min="1" max="12" step="1" aria-label="Nombre de personnes"><button type="button" class="dish-servings-step" data-step="1" aria-label="Ajouter une personne">+</button></div>';
  head.appendChild(block);
  const input=block.querySelector('input');
  let saved=BASE_SERVINGS;
  try{saved=localStorage.getItem(STORAGE_SERVINGS)||BASE_SERVINGS}catch(_){}
  setServings(saved);
  block.querySelectorAll('.dish-servings-step').forEach(button=>button.addEventListener('click',()=>{
    setServings(servings()+Number(button.dataset.step||0));
    navigator.vibrate?.(4);
  }));
  input.addEventListener('input',()=>{
    const value=Number(input.value);
    if(Number.isFinite(value)&&value>=1&&value<=12)setServings(value);
  });
  input.addEventListener('change',()=>setServings(input.value));
  input.addEventListener('blur',()=>setServings(input.value));
}
async function addSelectedQuantities(){
  if(pending)throw new Error('Ajout déjà en cours');
  if(!dialog||!list)throw new Error('Fiche du plat indisponible');
  const tasks=[...list.querySelectorAll('.dish-ingredient[aria-pressed="true"]:not([disabled])')]
    .map(row=>({name:String(row.dataset.ingredient||''),target:quantityFor(String(row.dataset.ingredient||''))}));
  const result={added:0,failed:0,present:0};
  pending=true;
  try{
    for(const task of tasks){
      const item=await window.COURSES_LIST.ensureQuantity(task.name,task.target);
      result.added+=item.added;
      result.failed+=item.failed;
      result.present+=item.present;
    }
    return result;
  }finally{pending=false}
}
window.COURSES_QUANTITIES=Object.freeze({
  getQuantity:(dish,name,count)=>quantityFor(name,dish,count),
  getNeed:(dish,name,count)=>needFor(name,dish,count),
  getBaseNeed:(dish,name,count)=>baseNeedFor(name,dish,count),
  getRecipeUnit:recipeUnitFor,
  hasRecipeNeeds,
  setRecipeNeeds,
  resetRecipeNeeds,
  getPurchaseLabel:purchaseLabel,
  addSelected:addSelectedQuantities,
  bind
});
function bind(){
  dialog=document.getElementById('dishDialog');
  list=dialog?.querySelector('.dish-sheet-list');
  products=document.getElementById('products');
  shoppingList=document.getElementById('listItems');
  if(!dialog||!list||!products||!shoppingList)return false;
  auditPurchaseModes();
  ensureStyles();
  buildServingsControl();
  decorateProducts();
  decorateShoppingList();
  decorateDishRows();

  productObserver?.disconnect();
  productObserver=new MutationObserver(()=>requestAnimationFrame(decorateProducts));
  productObserver.observe(products,{childList:true,subtree:true,attributes:true,attributeFilter:['data-quantity']});

  listObserver?.disconnect();
  listObserver=new MutationObserver(scheduleDishRefresh);
  listObserver.observe(list,{childList:true});

  shoppingListObserver?.disconnect();
  shoppingListObserver=new MutationObserver(()=>requestAnimationFrame(decorateShoppingList));
  shoppingListObserver.observe(shoppingList,{childList:true,subtree:true});

  dialogObserver?.disconnect();
  dialogObserver=new MutationObserver(scheduleDishRefresh);
  dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']});

  return true;
}
})();