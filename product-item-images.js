(() => {
'use strict';

const PRODUCT_NAMES=new Set(Object.values(window.COURSES_CATALOG?.groups||{}).flatMap(groups=>
  Object.values(groups||{}).flatMap(names=>Array.isArray(names)?names:[])
));
const PRODUCT_NAMES_DISPLAY_ORDER=[...PRODUCT_NAMES].sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
let products=null;
let listItems=null;
let productRefreshFrame=0;
let listRefreshFrame=0;
let eventsBound=false;
let productIdleFrame=0;
let productImagesIdle=false;
let warmQueue=[];
let warmScheduled=false;
let warmActive=0;
let warmCycleRequested=false;
const warmedSources=new Set();
const visualScaleCache=new Map();
const PRODUCT_WARM_VERSION_KEY='courses-product-images-warm-version-v1';
const VISUAL_SCALE_KEY='courses-product-visual-scale-v1';
// Cadrages mesurés avant cette version : remesurés une fois (derniers visuels remplacés en v785).
const VISUAL_SCALE_MIN_VERSION=785;
// Ces sept WebP possèdent une marge de sécurité : conserver le zoom à 1 et le centrage.
const NO_CROP_SOURCES_V733=new Set([
  'butternut','courge','navets','echalotes','noisettes','ail','oignons-jaunes'
].map(slug=>'./www/Items/'+slug+'.webp'));
// Profils absolus validés : réglage intermédiaire validé après les réductions v788 (v790).
// v792 : restauration ciblée de 17 légumes et herbes validée.
// [Catalogue, Ma liste] : garder les mesures brutes dans le cache pour éviter tout
// cumul du zoom et appliquer immédiatement les profils aux anciens appareils.
const PRODUCT_VISUAL_FACTORS=new Map(Object.entries({
  "citronnade":[0.9558, 1.0],
  "lait-chocolate":[0.8988, 0.9274],
  "compotes-bebe":[0.8561, 0.8846],
  "desserts-lactes-bebe":[0.7, 0.7],
  "lait-infantile":[0.9274, 0.9558],
  "lingettes-bebe":[0.9274, 0.9558],
  "petits-pots":[0.8276, 0.8561],
  "puree-bebe":[0.8561, 0.8846],
  "sacs-a-couches":[0.8988, 0.9274],
  "bagels":[0.8846, 0.9131],
  "biscottes":[0.9558, 1.0],
  "croissants":[0.8846, 0.9131],
  "galettes-de-ble":[0.8846, 0.9131],
  "pain-de-mie":[0.9274, 0.9558],
  "pain-de-mie-complet":[0.9274, 0.9558],
  "pain-naan":[0.9558, 1.0],
  "pain-pita":[0.9558, 1.0],
  "pains-au-chocolat":[0.8846, 0.9131],
  "pains-burger":[0.8846, 0.9131],
  "pains-hot-dog":[0.9558, 1.0],
  "wraps":[0.9558, 1.0],
  "champignons-en-boite":[0.9558, 1.0],
  "concentre-de-tomate":[0.8827, 0.916],
  "coulis-de-tomate":[0.9416, 0.9701],
  "flageolets":[0.9558, 1.0],
  "haricots-blancs":[0.9558, 1.0],
  "haricots-rouges":[0.9558, 1.0],
  "haricots-verts-en-boite":[0.9558, 1.0],
  "lentilles":[0.9558, 1.0],
  "mais-en-boite":[0.9558, 1.0],
  "petits-pois-carottes":[0.9558, 1.0],
  "pois-chiches":[0.9558, 1.0],
  "raviolis-en-boite":[0.9558, 1.0],
  "tomates-pelees":[0.9558, 1.0],
  "bouillon-cubes":[0.8062, 0.8646],
  "chili":[0.8134, 0.8419],
  "couscous":[0.9558, 1.0],
  "creme-de-coco":[0.9558, 1.0],
  "croutons":[0.9558, 1.0],
  "curcuma":[0.8134, 0.8419],
  "curry":[0.8134, 0.8419],
  "guacamole":[0.9558, 1.0],
  "harissa":[0.9558, 1.0],
  "lait-de-coco":[0.9558, 1.0],
  "paprika":[0.8134, 0.8419],
  "poivre":[0.8134, 0.8419],
  "sel":[0.8134, 0.8419],
  "tortillas":[0.9558, 1.0],
  "sucre":[0.9558, 1.0],
  "sucre-glace":[0.9558, 1.0],
  "sucre-roux":[0.9558, 1.0],
  "vanille":[0.8134, 0.8419],
  "bolognaise":[0.9274, 0.9558],
  "cornichon":[0.9416, 0.9701],
  "ketchup":[0.9274, 0.9558],
  "mayonnaise":[0.9274, 0.9558],
  "moutarde":[0.9274, 0.9558],
  "pesto":[0.9274, 0.9558],
  "sauce-aigre-douce":[0.9274, 0.9558],
  "sauce-algerienne":[0.9274, 0.9558],
  "sauce-andalouse":[0.9274, 0.9558],
  "sauce-au-poivre":[0.9274, 0.9558],
  "sauce-au-roquefort":[0.9274, 0.9558],
  "sauce-aux-champignons":[0.9274, 0.9558],
  "sauce-barbecue":[0.9274, 0.9558],
  "sauce-bearnaise":[0.9274, 0.9558],
  "sauce-blanche":[0.9274, 0.9558],
  "sauce-burger":[0.9274, 0.9558],
  "sauce-cesar":[0.9274, 0.9558],
  "sauce-curry":[0.9274, 0.9558],
  "sauce-hollandaise":[0.9274, 0.9558],
  "sauce-miel-moutarde":[0.9274, 0.9558],
  "sauce-napolitaine":[0.9274, 0.9558],
  "sauce-ranch":[0.9274, 0.9558],
  "sauce-samourai":[0.9274, 0.9558],
  "sauce-soja":[0.9274, 0.9558],
  "sauce-tartare":[0.9274, 0.9558],
  "sauce-teriyaki":[0.9274, 0.9558],
  "sauce-tomate":[0.9274, 0.9558],
  "tabasco":[0.9274, 0.9558],
  "confiture-abricot":[0.8988, 0.9274],
  "confiture-cerise":[0.8988, 0.9274],
  "confiture-figue":[0.8988, 0.9274],
  "confiture-fraise":[0.8988, 0.9274],
  "confiture-framboise":[0.8988, 0.9274],
  "confiture-fruits-rouges":[0.8988, 0.9274],
  "confiture-mirabelles":[0.8988, 0.9274],
  "confiture-mure":[0.8988, 0.9274],
  "confiture-myrtille":[0.8988, 0.9274],
  "confiture-orange":[0.8988, 0.9274],
  "confiture-peche":[0.8988, 0.9274],
  "coulis-de-fruit":[0.9274, 0.9558],
  "brie":[0.9131, 0.9416],
  "burrata":[0.9131, 0.9416],
  "camembert":[0.9131, 0.9416],
  "cheddar":[0.9274, 0.9558],
  "chevre":[0.8988, 0.9274],
  "comte":[0.9274, 0.9558],
  "emmental":[0.9274, 0.9558],
  "emmental-rape":[0.9274, 0.9558],
  "feta":[0.9131, 0.9416],
  "fromage-rape":[0.9274, 0.9558],
  "gouda":[0.9274, 0.9558],
  "mozzarella":[0.8703, 0.8988],
  "mozzarella-en-billes":[0.8703, 0.8988],
  "mozzarella-rapee":[0.9274, 0.9558],
  "parmesan":[0.8988, 0.9274],
  "parmesan-rape":[0.9274, 0.9558],
  "raclette":[0.9274, 0.9558],
  "reblochon":[0.9131, 0.9416],
  "ricotta":[0.9493, 0.9796],
  "roquefort":[0.9131, 0.9416],
  "soignon":[0.9131, 0.9416],
  "beurre":[0.8703, 0.8988],
  "creme-epaisse":[0.8419, 0.8703],
  "creme-fraiche":[0.8419, 0.8703],
  "creme-liquide":[0.8988, 0.9274],
  "mascarpone":[0.8988, 0.9274],
  "frites-surgelees":[0.9558, 1.0],
  "glace-chocolat":[0.9274, 0.9558],
  "glace-nuii":[0.9146, 0.9431],
  "glace-vanille":[0.9274, 0.9558],
  "pate-a-pizza":[0.9558, 1.0],
  "pates-fraiches":[0.9558, 1.0],
  "quiche":[0.9558, 1.0],
  "tofu":[0.9558, 1.0],
  "creme-anglaise":[0.8988, 0.9274],
  "creme-dessert-caramel":[0.8276, 0.8561],
  "creme-dessert-chocolat":[0.8276, 0.8561],
  "creme-dessert-vanille":[0.8276, 0.8561],
  "fromage-blanc":[0.9558, 1.0],
  "petits-suisses":[0.8276, 0.8561],
  "riz-au-lait":[0.8419, 0.8703],
  "skyr":[0.9274, 0.9558],
  "yaourt":[0.8276, 0.8561],
  "yaourt-a-boire":[0.8846, 0.9131],
  "yaourts-citron":[0.8276, 0.8561],
  "yaourts-fruits":[0.8276, 0.8561],
  "yaourts-grecs":[0.8846, 0.9131],
  "yaourts-nature":[0.8846, 0.9131],
  "yaourts-noix-de-coco":[0.8276, 0.8561],
  "yaourts-vanille":[0.8276, 0.8561],
  "abricots":[0.9416, 0.9701],
  "bananes":[0.9416, 0.9701],
  "citrons":[0.9416, 0.9701],
  "clementines":[0.9416, 0.9701],
  "kiwis":[0.9416, 0.9701],
  "nectarines":[0.9416, 0.9701],
  "oranges":[0.9416, 0.9701],
  "pamplemousse":[0.9416, 0.9701],
  "peches":[0.9416, 0.9701],
  "poires":[0.9416, 0.9701],
  "pommes":[0.9416, 0.9701],
  "prunes":[0.9416, 0.9701],
  "raisin":[0.9416, 0.9701],
  "ananas":[0.9558, 1.0],
  "avocat":[0.9558, 1.0],
  "cerises":[0.8703, 0.8988],
  "fraises":[0.8703, 0.8988],
  "framboises":[0.8703, 0.8988],
  "fruit-de-la-passion":[0.9416, 0.9701],
  "grenade":[0.9558, 1.0],
  "mangue":[0.9558, 1.0],
  "melon":[0.9558, 1.0],
  "mures":[0.8703, 0.8988],
  "myrtilles":[0.9003, 0.9288],
  "noix-de-coco":[0.9558, 1.0],
  "aubergines":[0.9558, 1.0],
  "brocoli":[0.9558, 1.0],
  "carottes":[1.04, 1.04],
  "concombres":[0.9558, 1.0],
  "courgettes":[1.04, 1.04],
  "epinards":[0.9558, 1.0],
  "haricots-verts":[1.04, 1.04],
  "petits-pois":[0.9416, 0.9701],
  "poireaux":[1.04, 1.04],
  "poivrons":[0.9558, 1.0],
  "tomates":[0.9558, 1.0],
  "artichauts":[0.9558, 1.0],
  "asperges":[1.04, 1.04],
  "betteraves":[0.9558, 1.0],
  "champignons":[0.9558, 1.0],
  "choux-de-bruxelles":[0.9558, 1.0],
  "fenouil":[0.9558, 1.0],
  "mais":[0.9558, 1.0],
  "navets":[0.9631, 1.0],
  "radis":[0.9558, 1.0],
  "endives":[0.8988, 0.9274],
  "mache":[0.8988, 0.9274],
  "roquette":[0.8988, 0.9274],
  "salade-verte":[0.9558, 1.0],
  "citron-vert":[0.8988, 0.9274],
  "noisettes":[0.9052, 0.9342],
  "noix":[0.8988, 0.9274],
  "oignons-jaunes":[0.9197, 0.9486],
  "oignons-rouges":[0.9131, 0.9416],
  "olives-fraiches":[0.9131, 0.9416],
  "piments":[0.8988, 0.9274],
  "apres-shampoing":[0.9558, 1.0],
  "brosses-a-dents":[0.9816, 1.0101],
  "brossettes-interdentaires":[0.9558, 1.0],
  "cotons-tiges":[0.9558, 1.0],
  "dentifrice":[0.9131, 0.9416],
  "deodorant":[0.9131, 0.9416],
  "disques-coton":[0.9558, 1.0],
  "fil-dentaire":[0.7634, 0.8419],
  "gel-douche":[0.9558, 1.0],
  "gel-hydroalcoolique":[0.9558, 1.0],
  "mouchoirs-poche":[0.9558, 1.0],
  "papier-toilette-humide":[0.9558, 1.0],
  "savon-mains":[0.9558, 1.0],
  "shampoing":[0.9558, 1.0],
  "alcool-70":[0.9131, 0.9416],
  "antiseptique":[0.9131, 0.9416],
  "baume-levres":[0.8134, 0.8419],
  "coton":[0.9274, 0.9558],
  "creme-hydratante":[0.8304, 0.8988],
  "creme-mains":[0.8561, 0.8846],
  "demaquillant":[0.9274, 0.9558],
  "eau-micellaire":[0.9274, 0.9558],
  "mousse-a-raser":[0.9274, 0.9558],
  "pansements":[0.8561, 0.8846],
  "protections-hygieniques":[0.9274, 0.9558],
  "rasoirs":[0.9131, 0.9416],
  "thermometre-piles":[0.9416, 0.9701],
  "bicarbonate":[0.8988, 0.9274],
  "eponges-magiques":[0.8846, 0.9131],
  "lingettes-menage":[0.9274, 0.9558],
  "pile-9v":[0.9558, 1.0],
  "pile-aaa":[0.9558, 1.0],
  "piles-aa":[0.9558, 1.0],
  "piles-cr123a":[0.9558, 1.0],
  "piles-cr2025":[0.9558, 1.0],
  "piles-cr2032":[0.9558, 1.0],
  "piles-cr2450":[0.9558, 1.0],
  "piles-lr44":[0.9558, 1.0],
  "amidon":[1.0286, 1.06],
  "lingettes-anti-decoloration":[0.9274, 0.9558],
  "pinces-a-linge":[0.9274, 0.9558],
  "sacs-zip":[0.9274, 0.9558],
  "serviettes-papier":[0.9274, 0.9558],
  "eponges":[0.8846, 0.9131],
  "essuie-verres":[0.9274, 0.9558],
  "gants-menage":[0.9131, 0.9416],
  "grattoirs":[0.8846, 0.9131],
  "liquide-rincage":[0.9558, 1.0],
  "liquide-vaisselle":[0.9558, 1.0],
  "liquide-vaisselle-mains-sensibles":[0.9558, 1.0],
  "nettoyant-lave-vaisselle":[0.9558, 1.0],
  "produit-inox":[0.9558, 1.0],
  "sel-lave-vaisselle":[0.9558, 1.0],
  "tablettes-lave-vaisselle":[0.92, 1.0],
  "torchons":[0.9274, 0.9558],
  "biscuits-aperitifs":[0.9558, 1.0],
  "bretzels":[0.8703, 0.8988],
  "cacahuetes":[0.9558, 1.0],
  "chips":[0.9558, 1.0],
  "crackers":[0.8703, 0.8988],
  "gressins":[0.9558, 1.0],
  "houmous":[0.8988, 0.9274],
  "noix-de-cajou":[0.9558, 1.0],
  "noix-de-pecan":[0.9558, 1.0],
  "noix-du-bresil":[0.9558, 1.0],
  "olives":[0.8988, 0.9274],
  "pistaches":[0.9558, 1.0],
  "pop-corn":[0.9558, 1.0],
  "tapenade":[0.8988, 0.9274],
  "barres-cereales":[0.8861, 0.9146],
  "biscuits-beurre":[0.8703, 0.8988],
  "biscuits-chocolat":[0.8703, 0.8988],
  "bonbons":[0.8134, 0.8419],
  "brownies":[0.8846, 0.9131],
  "chocolat-au-lait":[0.8846, 0.9131],
  "chocolat-blanc":[0.8846, 0.9131],
  "chocolat-noir":[0.8846, 0.9131],
  "compotes-gourdes":[0.8561, 0.8846],
  "cookies":[0.8454, 0.8988],
  "crepes":[0.8846, 0.9131],
  "gaufres":[0.8846, 0.9131],
  "kinder-maxi":[0.8719, 0.9003],
  "madeleines":[0.8846, 0.9131],
  "muffins":[0.8846, 0.9131],
  "speculoos":[0.8846, 0.9131],
  "cafe-en-grains":[0.9416, 0.9701],
  "cafe-moulu":[0.8973, 0.9558],
  "cafe-soluble":[0.9274, 0.9558],
  "capsules-cafe":[0.6884, 0.7919],
  "chicoree":[0.9274, 0.9558],
  "dosettes-cafe":[0.7527, 0.8312],
  "filtres-a-cafe":[0.7819, 0.8503],
  "infusion-camomille":[0.8846, 0.9131],
  "infusion-menthe":[0.8846, 0.9131],
  "infusion-verveine":[0.8846, 0.9131],
  "matcha":[0.8496, 0.9131],
  "the-earl-grey":[0.9353, 0.9546],
  "the-fruits-rouges":[0.9353, 0.9546],
  "the-noir":[0.8531, 0.9216],
  "the-vert":[0.8846, 0.9131],
  "abricots-secs":[0.9558, 1.0],
  "beurre-de-cacahuete":[0.9274, 0.9558],
  "chocolat-en-poudre":[0.9274, 0.9558],
  "creme-de-marrons":[0.9274, 0.9558],
  "dattes":[0.9558, 1.0],
  "figues-seches":[0.9558, 1.0],
  "miel":[0.9274, 0.9558],
  "pancakes":[0.8988, 0.9274],
  "pate-a-tartiner":[0.9274, 0.9558],
  "pruneaux":[0.9558, 1.0],
  "raisins-secs":[0.9558, 1.0],
  "sirop-d-erable":[0.9274, 0.9558],
  "bacon":[0.9416, 0.9701],
  "blanc-de-poulet":[0.9416, 0.9701],
  "chorizo":[0.9416, 0.9701],
  "coppa":[0.9416, 0.9701],
  "jambon-blanc":[0.9416, 0.9701],
  "jambon-cru":[0.9416, 0.9701],
  "lardons":[0.9416, 0.9701],
  "mortadelle":[0.9416, 0.9701],
  "pate":[0.8488, 0.9073],
  "peperroni":[0.9416, 0.9701],
  "rillettes":[0.8688, 0.9274],
  "rosette":[0.9416, 0.9701],
  "saucisson":[1.1722, 1.18],
  "cabillaud":[0.9558, 1.0],
  "crevettes":[0.9558, 1.0],
  "moules":[0.9558, 1.0],
  "poisson-pane":[0.9558, 1.0],
  "saumon":[0.9859, 1.0144],
  "saumon-fume":[0.9558, 1.0],
  "surimi":[0.9558, 1.0],
  "thon-frais":[0.9558, 1.0],
  "truite":[0.9859, 1.0144],
  "maquereaux":[0.9416, 0.9701],
  "sardines":[0.9416, 0.9701],
  "thon-en-boite":[0.9416, 0.9701],
  "agneau":[0.9558, 1.0],
  "boeuf":[0.9558, 1.0],
  "cotes-de-porc":[0.9558, 1.0],
  "dinde":[0.9558, 1.0],
  "escalopes-de-poulet":[0.9558, 1.0],
  "filets-de-poulet":[0.9558, 1.0],
  "merguez":[0.9558, 1.0],
  "porc":[1.0158, 1.0244],
  "saucisses":[0.9558, 1.0],
  "steaks-haches":[0.9558, 1.0],
  "veau":[0.9558, 1.0],
  "viande-hachee":[0.9558, 1.0]
}).map(([slug,factors])=>['./www/Items/'+slug+'.webp',factors]));
function visualScaleForView(source,metrics,compact=false){
  const factors=PRODUCT_VISUAL_FACTORS.get(source);
  if(!factors)return metrics;
  return {...metrics,scale:Math.round(metrics.scale*factors[compact?1:0]*1000)/1000};
}
let visualScaleSaveTimer=0;

const slugify=window.COURSES_TEXT.slug;

function imageSource(name){
  return './www/Items/'+slugify(name)+'.webp';
}
function currentAppVersion(){
  return String(window.COURSES_APP_VERSION||document.querySelector('.page-version')?.textContent||'').trim();
}
function storedWarmVersion(){
  try{return localStorage.getItem(PRODUCT_WARM_VERSION_KEY)||''}catch(_){return ''}
}
function saveWarmVersion(){
  const version=currentAppVersion();
  if(!version)return;
  try{localStorage.setItem(PRODUCT_WARM_VERSION_KEY,version)}catch(_){}
}
function markWarmCycleComplete(){
  if(!warmCycleRequested||warmQueue.length||warmActive)return;
  saveWarmVersion();
}
function scheduleProductWarmup(){
  if(warmScheduled||warmActive>=3||!warmQueue.length)return;
  warmScheduled=true;
  const run=()=>{
    warmScheduled=false;
    warmProductImagesStep();
  };
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:1200});
  else setTimeout(run,0);
}
function warmProductImagesStep(){
  while(warmActive<3&&warmQueue.length){
    const source=warmQueue.shift();
    if(!source||warmedSources.has(source))continue;
    warmActive+=1;
    const image=new Image();
    image.alt='';
    image.decoding='async';
    image.fetchPriority='low';
    const done=()=>{
      warmActive=Math.max(0,warmActive-1);
      warmedSources.add(source);
      scheduleProductWarmup();
      markWarmCycleComplete();
    };
    image.addEventListener('load',()=>measureVisualScale(image,source),{once:true});
    image.addEventListener('load',done,{once:true});
    image.addEventListener('error',done,{once:true});
    image.src=source;
  }
  scheduleProductWarmup();
  markWarmCycleComplete();
}
// Les visuels produits restent dans le cache persistant du service worker : ils sont chargés
// tout de suite et décodés avant affichage, pour qu'une catégorie apparaisse déjà prête.
function imageLoading(){
  return 'eager';
}
function queueProductWarmup(){
  warmCycleRequested=true;
  const queued=new Set(warmQueue);
  for(const name of PRODUCT_NAMES_DISPLAY_ORDER){
    const source=imageSource(name);
    if(warmedSources.has(source)||queued.has(source))continue;
    warmQueue.push(source);
    queued.add(source);
  }
  scheduleProductWarmup();
  markWarmCycleComplete();
}
function warmProductImages(){
  scheduleDecorateProducts();
  scheduleDecorateList();
  if(storedWarmVersion()===currentAppVersion())return true;
  queueProductWarmup();
  return true;
}
function loadVisualScaleCache(){
  try{
    const stored=JSON.parse(localStorage.getItem(VISUAL_SCALE_KEY)||'null');
    if(!stored||!stored.items||typeof stored.items!=='object')return;
    // Les cadrages enregistrés avant la dernière série de visuels remplacés (v722 → v785) sont
    // tous remesurés une fois ; depuis, le cache est conservé tel quel.
    const cacheVersion=Number(String(stored.version||'').replace(/^v/,''));
    if(!Number.isFinite(cacheVersion)||cacheVersion<VISUAL_SCALE_MIN_VERSION)return;
    Object.entries(stored.items).forEach(([source,values])=>{
      if(Array.isArray(values)&&values.length===3&&values.every(Number.isFinite)){
        visualScaleCache.set(source,{scale:values[0],shiftX:values[1],shiftY:values[2]});
      }
    });
  }catch(_){}
}
function saveVisualScaleCacheSoon(){
  if(visualScaleSaveTimer)return;
  visualScaleSaveTimer=setTimeout(()=>{
    visualScaleSaveTimer=0;
    const version=currentAppVersion();
    if(!version)return;
    const items={};
    visualScaleCache.forEach((metrics,source)=>{items[source]=[metrics.scale,metrics.shiftX,metrics.shiftY]});
    try{localStorage.setItem(VISUAL_SCALE_KEY,JSON.stringify({version,items}))}catch(_){}
  },1500);
}
function visualScaleStyle(source,compact=false){
  const cached=visualScaleCache.get(source);
  if(!cached&&!PRODUCT_VISUAL_FACTORS.has(source))return '';
  const metrics=visualScaleForView(source,cached||{scale:1,shiftX:0,shiftY:0},compact);
  return '--single-product-scale:'+metrics.scale+';--single-product-shift-x:'+metrics.shiftX+'%;--single-product-shift-y:'+metrics.shiftY+'%';
}
loadVisualScaleCache();
// Cadrage harmonisé pour une vignette produit hors Catalogue / Ma liste (ex. À prévoir) :
// l'image porte data-single-product-source ; mesure à la fin du chargement si besoin.
function frameProductImage(image){
  const source=image?.dataset?.singleProductSource;
  if(!source)return;
  if(image.complete&&image.naturalWidth>0){applyVisualScale(image,source);return}
  image.addEventListener('load',()=>applyVisualScale(image,source),{once:true});
}
window.COURSES_PRODUCT_IMAGES=Object.freeze({warm:warmProductImages,visualScaleStyle,frame:frameProductImage});
function productCardVisible(card){
  if(!card||card.hidden||products?.classList.contains('is-catalog-mode-hidden'))return false;
  const rect=card.getBoundingClientRect?.();
  if(!rect)return false;
  const viewport=window.innerHeight||document.documentElement.clientHeight||0;
  return rect.bottom>=0&&rect.top<=viewport;
}
function publishProductImagesIdle(){
  if(!document.getElementById('catalogView')?.classList.contains('is-active'))return;
  const cards=[...(products?.querySelectorAll('.product[data-name]')||[])].filter(productCardVisible);
  const pending=cards.some(card=>{
    const image=card.querySelector('.premium-sprite>img');
    if(image&&!image.complete)return true;
    return Boolean(card.querySelector('.product-svg[data-single-product-pending]'));
  });
  if(pending){productImagesIdle=false;return}
  if(productImagesIdle)return;
  productImagesIdle=true;
  document.dispatchEvent(new CustomEvent('courses:product-images-idle',{detail:{visible:cards.length}}));
}
function scheduleProductImagesIdleCheck(){
  if(productIdleFrame)return;
  productIdleFrame=requestAnimationFrame(()=>{
    productIdleFrame=0;
    publishProductImagesIdle();
  });
}
function bindProductImageSettle(image){
  if(!image||image.dataset.productImageSettleBound==='1')return;
  image.dataset.productImageSettleBound='1';
  image.addEventListener('load',scheduleProductImagesIdleCheck);
  image.addEventListener('error',scheduleProductImagesIdleCheck);
}
function measureVisualScale(image,source){
  try{
    const size=96,canvas=document.createElement('canvas');
    canvas.width=size;canvas.height=size;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)return null;
    context.clearRect(0,0,size,size);
    context.drawImage(image,0,0,size,size);
    const pixels=context.getImageData(0,0,size,size).data;
    let minX=size,minY=size,maxX=-1,maxY=-1;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      if(pixels[(y*size+x)*4+3]<24)continue;
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
    if(maxX<minX||maxY<minY)return null;
    const occupancy=Math.max((maxX-minX+1)/size,(maxY-minY+1)/size);
    const cropSafe=NO_CROP_SOURCES_V733.has(source);
    const scale=cropSafe?1:Math.max(.94,Math.min(1.45,.90/Math.max(.01,occupancy)));
    const centerX=(minX+maxX+1)/(2*size);
    const centerY=(minY+maxY+1)/(2*size);
    const shiftX=cropSafe?0:Math.max(-18,Math.min(18,(.5-centerX)*100*scale));
    const shiftY=cropSafe?0:Math.max(-18,Math.min(18,(.5-centerY)*100*scale));
    const metrics={
      scale:Math.round(scale*1000)/1000,
      shiftX:Math.round(shiftX*10)/10,
      shiftY:Math.round(shiftY*10)/10,
    };
    visualScaleCache.set(source,metrics);
    saveVisualScaleCacheSoon();
    return metrics;
  }catch(_){return null}
}
function setVisualScale(image,metrics){
  const compact=image.dataset.singleProductCompact==='1'||Boolean(image.closest('.premium-sprite.is-compact'));
  const adjusted=visualScaleForView(image.dataset.singleProductSource,metrics,compact);
  image.style.setProperty('--single-product-scale',String(adjusted.scale));
  image.style.setProperty('--single-product-shift-x',metrics.shiftX+'%');
  image.style.setProperty('--single-product-shift-y',metrics.shiftY+'%');
}
// Cadrages déjà connus : appliqués sans attendre l'arrivée de la pastille ni l'ouverture du
// Catalogue, pour que les images ne changent pas de taille après la première image affichée.
function applyCachedVisualScales(){
  products?.querySelectorAll('.premium-sprite.is-single-product-image>img[data-single-product-source]').forEach(image=>{
    if(image.style.getPropertyValue('--single-product-scale'))return;
    const cached=visualScaleCache.get(image.dataset.singleProductSource);
    if(cached)setVisualScale(image,cached);
  });
}
// Mesurer un cadrage décode l'image : seules les cartes visibles sont mesurées tout de suite,
// les autres le sont par petits lots quand le navigateur est libre (aucun effet visible).
const pendingVisualMeasures=new Map();
let visualMeasureScheduled=false;
function measurePendingVisualScales(deadline){
  visualMeasureScheduled=false;
  let first=true;
  for(const [image,source] of pendingVisualMeasures){
    // Une image par passage au minimum, puis seulement tant qu'il reste du temps libre.
    if(!first&&!(deadline?.timeRemaining?.()>12))break;
    first=false;
    pendingVisualMeasures.delete(image);
    if(!image.isConnected||!image.complete||!image.naturalWidth)continue;
    const metrics=visualScaleCache.get(source)||measureVisualScale(image,source);
    if(metrics)setVisualScale(image,metrics);
  }
  scheduleVisualMeasures();
}
function scheduleVisualMeasures(){
  if(visualMeasureScheduled||!pendingVisualMeasures.size)return;
  visualMeasureScheduled=true;
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(measurePendingVisualScales,{timeout:1500});
  else setTimeout(measurePendingVisualScales,50);
}
function applyVisualScale(image,source){
  if(!image||!source)return;
  const cached=visualScaleCache.get(source);
  if(cached){setVisualScale(image,cached);return}
  const card=image.closest('#products .product');
  if(card&&!productCardVisible(card)){
    pendingVisualMeasures.set(image,source);
    scheduleVisualMeasures();
    return;
  }
  const metrics=measureVisualScale(image,source);
  if(metrics)setVisualScale(image,metrics);
}
function onSingleProductImageLoaded(image,source){
  image.closest('.premium-sprite')?.classList.remove('is-fallback');
  applyVisualScale(image,source);
}
function decorateFallback(card,name,source,eager=false){
  const fallback=card.querySelector('.product-svg');
  if(!fallback||fallback.dataset.singleProductPending===source)return;
  fallback.dataset.singleProductPending=source;
  const compact=fallback.classList.contains('is-compact');
  const image=new Image();
  image.dataset.singleProductCompact=compact?'1':'0';
  image.alt='';
  image.loading=imageLoading(source,eager);
  image.decoding='sync';
  image.dataset.singleProductSource=source;
  bindProductImageSettle(image);
  image.addEventListener('load',()=>{
    if(!fallback.isConnected)return;
    applyVisualScale(image,source);
    const sprite=document.createElement('span');
    sprite.className='premium-sprite is-single-product-image'+(compact?' is-compact':'');
    sprite.appendChild(image);
    fallback.replaceWith(sprite);
    card.classList.add('has-single-product-image');
    onSingleProductImageLoaded(image,source);
  },{once:true});
  image.addEventListener('error',()=>{
    delete fallback.dataset.singleProductPending;
  },{once:true});
  image.src=source;
}
function decorateCard(card,eager=false){
  const name=String(card?.dataset?.name||'');
  if(!PRODUCT_NAMES.has(name))return;
  const source=imageSource(name);
  const sprite=card.querySelector('.premium-sprite');
  const image=sprite?.querySelector(':scope > img');
  bindProductImageSettle(image);
  if(!sprite||!image){decorateFallback(card,name,source,eager);return;}
  card.classList.add('has-single-product-image');
  sprite.classList.add('is-single-product-image');
  image.loading=imageLoading(source,eager);
  if(image.decoding!=='sync')image.decoding='sync';
  const loaded=()=>onSingleProductImageLoaded(image,source);
  if(image.dataset.singleProductSource!==source){image.dataset.singleProductSource=source;image.src=source;}
  if(image.complete&&image.naturalWidth>0)loaded();
  else image.addEventListener('load',loaded,{once:true});
}
function decorateProducts(){
  if(!document.getElementById('catalogView')?.classList.contains('is-active'))return;
  productImagesIdle=false;
  if(!products?.classList.contains('is-catalog-mode-hidden')){
    products?.querySelectorAll('.product[data-name]:not([hidden])').forEach(card=>decorateCard(card,false));
  }
  scheduleProductImagesIdleCheck();
}
function decorateList(){
  listItems?.querySelectorAll('.list-row[data-name]').forEach(card=>decorateCard(card,true));
}
function scheduleDecorateProducts(){
  if(productRefreshFrame)return;
  productRefreshFrame=requestAnimationFrame(()=>{
    productRefreshFrame=0;
    applyCachedVisualScales();
    decorateProducts();
  });
}
function scheduleDecorateList(){
  if(listRefreshFrame)return;
  listRefreshFrame=requestAnimationFrame(()=>{
    listRefreshFrame=0;
    decorateList();
  });
}
function bindEvents(){
  if(eventsBound)return;
  eventsBound=true;
  document.addEventListener('courses:products-updated',scheduleDecorateProducts);
  document.addEventListener('courses:list-rendered',scheduleDecorateList);
  document.addEventListener('courses:view-changed',event=>{
    if(event.detail?.view!=='catalog')return;
    applyCachedVisualScales();
    // Laisser la pastille de navigation finir sa course avant de parcourir la grille.
    const nav=window.COURSES_BOTTOM_NAV;
    if(typeof nav?.afterSettle==='function')nav.afterSettle(scheduleDecorateProducts);
    else scheduleDecorateProducts();
  });
  document.addEventListener('courses:catalog-products-ready',warmProductImages);
}
function bind(){
  products=document.getElementById('products');
  listItems=document.getElementById('listItems');
  if(!products||!listItems)return false;
  bindEvents();
  applyCachedVisualScales();
  decorateList();
  if(window.COURSES_CATALOG_PRODUCTS_READY)warmProductImages();
  return true;
}
function init(){
  bind();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();