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
// Seuls ces WebP ont changé d'empreinte en v722. Conserver les cadrages des 445 autres
// images évite une re-mesure générale et la latence au retour du Catalogue.
const UPDATED_IMAGE_SOURCES_V722=new Set([
  'quinoa','couscous','polenta','lentilles','haricots-rouges','pois-chiches',
  'noix-de-coco-rapee','gelatine','levure-chimique','pepites-chocolat',
  'bouillon-cubes','nouilles-chinoises','nouilles-instantanees'
].map(slug=>'./www/Items/'+slug+'.webp'));
// Ces sept WebP possèdent une marge de sécurité : conserver le zoom à 1 et le centrage.
const NO_CROP_SOURCES_V733=new Set([
  'butternut','courge','navets','echalotes','noisettes','ail','oignons-jaunes'
].map(slug=>'./www/Items/'+slug+'.webp'));
// Profils absolus validés : audit révisé des 522 produits, 358 réductions (v788).
// [Catalogue, Ma liste] : garder les mesures brutes dans le cache pour éviter tout
// cumul du zoom et appliquer immédiatement les profils aux anciens appareils.
const PRODUCT_VISUAL_FACTORS=new Map(Object.entries({
  "citronnade":[0.9117, 1],
  "lait-chocolate":[0.7977, 0.8547],
  "compotes-bebe":[0.7123, 0.7692],
  "desserts-lactes-bebe":[0.6268, 0.6838],
  "lait-infantile":[0.8547, 0.9117],
  "lingettes-bebe":[0.8547, 0.9117],
  "petits-pots":[0.6553, 0.7123],
  "puree-bebe":[0.7123, 0.7692],
  "sacs-a-couches":[0.7977, 0.8547],
  "bagels":[0.7692, 0.8262],
  "biscottes":[0.9117, 1],
  "croissants":[0.7692, 0.8262],
  "galettes-de-ble":[0.7692, 0.8262],
  "pain-de-mie":[0.8547, 0.9117],
  "pain-de-mie-complet":[0.8547, 0.9117],
  "pain-naan":[0.9117, 1],
  "pain-pita":[0.9117, 1],
  "pains-au-chocolat":[0.7692, 0.8262],
  "pains-burger":[0.7692, 0.8262],
  "pains-hot-dog":[0.9117, 1],
  "wraps":[0.9117, 1],
  "champignons-en-boite":[0.9117, 1],
  "concentre-de-tomate":[0.7654, 0.8319],
  "coulis-de-tomate":[0.8832, 0.9402],
  "flageolets":[0.9117, 1],
  "haricots-blancs":[0.9117, 1],
  "haricots-rouges":[0.9117, 1],
  "haricots-verts-en-boite":[0.9117, 1],
  "lentilles":[0.9117, 1],
  "mais-en-boite":[0.9117, 1],
  "petits-pois-carottes":[0.9117, 1],
  "pois-chiches":[0.9117, 1],
  "raviolis-en-boite":[0.9117, 1],
  "tomates-pelees":[0.9117, 1],
  "bouillon-cubes":[0.7123, 0.7692],
  "chili":[0.6268, 0.6838],
  "couscous":[0.9117, 1],
  "creme-de-coco":[0.9117, 1],
  "croutons":[0.9117, 1],
  "curcuma":[0.6268, 0.6838],
  "curry":[0.6268, 0.6838],
  "guacamole":[0.9117, 1],
  "harissa":[0.9117, 1],
  "lait-de-coco":[0.9117, 1],
  "paprika":[0.6268, 0.6838],
  "poivre":[0.6268, 0.6838],
  "sel":[0.6268, 0.6838],
  "tortillas":[0.9117, 1],
  "sucre":[0.9117, 1],
  "sucre-glace":[0.9117, 1],
  "sucre-roux":[0.9117, 1],
  "vanille":[0.6268, 0.6838],
  "bolognaise":[0.8547, 0.9117],
  "cornichon":[0.8832, 0.9402],
  "ketchup":[0.8547, 0.9117],
  "mayonnaise":[0.8547, 0.9117],
  "moutarde":[0.8547, 0.9117],
  "pesto":[0.8547, 0.9117],
  "sauce-aigre-douce":[0.8547, 0.9117],
  "sauce-algerienne":[0.8547, 0.9117],
  "sauce-andalouse":[0.8547, 0.9117],
  "sauce-au-poivre":[0.8547, 0.9117],
  "sauce-au-roquefort":[0.8547, 0.9117],
  "sauce-aux-champignons":[0.8547, 0.9117],
  "sauce-barbecue":[0.8547, 0.9117],
  "sauce-bearnaise":[0.8547, 0.9117],
  "sauce-blanche":[0.8547, 0.9117],
  "sauce-burger":[0.8547, 0.9117],
  "sauce-cesar":[0.8547, 0.9117],
  "sauce-curry":[0.8547, 0.9117],
  "sauce-hollandaise":[0.8547, 0.9117],
  "sauce-miel-moutarde":[0.8547, 0.9117],
  "sauce-napolitaine":[0.8547, 0.9117],
  "sauce-ranch":[0.8547, 0.9117],
  "sauce-samourai":[0.8547, 0.9117],
  "sauce-soja":[0.8547, 0.9117],
  "sauce-tartare":[0.8547, 0.9117],
  "sauce-teriyaki":[0.8547, 0.9117],
  "sauce-tomate":[0.8547, 0.9117],
  "tabasco":[0.8547, 0.9117],
  "confiture-abricot":[0.7977, 0.8547],
  "confiture-cerise":[0.7977, 0.8547],
  "confiture-figue":[0.7977, 0.8547],
  "confiture-fraise":[0.7977, 0.8547],
  "confiture-framboise":[0.7977, 0.8547],
  "confiture-fruits-rouges":[0.7977, 0.8547],
  "confiture-mirabelles":[0.7977, 0.8547],
  "confiture-mure":[0.7977, 0.8547],
  "confiture-myrtille":[0.7977, 0.8547],
  "confiture-orange":[0.7977, 0.8547],
  "confiture-peche":[0.7977, 0.8547],
  "coulis-de-fruit":[0.8547, 0.9117],
  "brie":[0.8262, 0.8832],
  "burrata":[0.8262, 0.8832],
  "camembert":[0.8262, 0.8832],
  "cheddar":[0.8547, 0.9117],
  "chevre":[0.7977, 0.8547],
  "comte":[0.8547, 0.9117],
  "emmental":[0.8547, 0.9117],
  "emmental-rape":[0.8547, 0.9117],
  "feta":[0.8262, 0.8832],
  "fromage-rape":[0.8547, 0.9117],
  "gouda":[0.8547, 0.9117],
  "mozzarella":[0.7407, 0.7977],
  "mozzarella-en-billes":[0.7407, 0.7977],
  "mozzarella-rapee":[0.8547, 0.9117],
  "parmesan":[0.7977, 0.8547],
  "parmesan-rape":[0.8547, 0.9117],
  "raclette":[0.8547, 0.9117],
  "reblochon":[0.8262, 0.8832],
  "ricotta":[0.8485, 0.9091],
  "roquefort":[0.8262, 0.8832],
  "soignon":[0.8262, 0.8832],
  "beurre":[0.7407, 0.7977],
  "creme-epaisse":[0.6838, 0.7407],
  "creme-fraiche":[0.6838, 0.7407],
  "creme-liquide":[0.7977, 0.8547],
  "mascarpone":[0.7977, 0.8547],
  "frites-surgelees":[0.9117, 1],
  "glace-chocolat":[0.8547, 0.9117],
  "glace-nuii":[0.7692, 0.8262],
  "glace-vanille":[0.8547, 0.9117],
  "pate-a-pizza":[0.9117, 1],
  "pates-fraiches":[0.9117, 1],
  "quiche":[0.9117, 1],
  "tofu":[0.9117, 1],
  "creme-anglaise":[0.7977, 0.8547],
  "creme-dessert-caramel":[0.6553, 0.7123],
  "creme-dessert-chocolat":[0.6553, 0.7123],
  "creme-dessert-vanille":[0.6553, 0.7123],
  "fromage-blanc":[0.9117, 1],
  "petits-suisses":[0.6553, 0.7123],
  "riz-au-lait":[0.6838, 0.7407],
  "skyr":[0.8547, 0.9117],
  "yaourt":[0.6553, 0.7123],
  "yaourt-a-boire":[0.7692, 0.8262],
  "yaourts-citron":[0.6553, 0.7123],
  "yaourts-fruits":[0.6553, 0.7123],
  "yaourts-grecs":[0.7692, 0.8262],
  "yaourts-nature":[0.7692, 0.8262],
  "yaourts-noix-de-coco":[0.6553, 0.7123],
  "yaourts-vanille":[0.6553, 0.7123],
  "abricots":[0.8832, 0.9402],
  "bananes":[0.8832, 0.9402],
  "citrons":[0.8832, 0.9402],
  "clementines":[0.8832, 0.9402],
  "kiwis":[0.8832, 0.9402],
  "nectarines":[0.8832, 0.9402],
  "oranges":[0.8832, 0.9402],
  "pamplemousse":[0.8832, 0.9402],
  "peches":[0.8832, 0.9402],
  "poires":[0.8832, 0.9402],
  "pommes":[0.8832, 0.9402],
  "prunes":[0.8832, 0.9402],
  "raisin":[0.8832, 0.9402],
  "ananas":[0.9117, 1],
  "avocat":[0.9117, 1],
  "cerises":[0.7407, 0.7977],
  "fraises":[0.7407, 0.7977],
  "framboises":[0.7407, 0.7977],
  "fruit-de-la-passion":[0.8832, 0.9402],
  "grenade":[0.9117, 1],
  "mangue":[0.9117, 1],
  "melon":[0.9117, 1],
  "mures":[0.7407, 0.7977],
  "myrtilles":[0.7407, 0.7977],
  "noix-de-coco":[0.9117, 1],
  "aubergines":[0.9117, 1],
  "brocoli":[0.9117, 1],
  "carottes":[0.8832, 0.9402],
  "concombres":[0.9117, 1],
  "courgettes":[0.8832, 0.9402],
  "epinards":[0.9117, 1],
  "haricots-verts":[0.8832, 0.9402],
  "petits-pois":[0.8832, 0.9402],
  "poireaux":[0.9117, 0.9687],
  "poivrons":[0.9117, 1],
  "tomates":[0.9117, 1],
  "artichauts":[0.9117, 1],
  "asperges":[0.9117, 0.9687],
  "betteraves":[0.9117, 1],
  "champignons":[0.9117, 1],
  "choux-de-bruxelles":[0.9117, 1],
  "fenouil":[0.9117, 1],
  "mais":[0.9117, 1],
  "navets":[0.9262, 1],
  "radis":[0.9117, 1],
  "basilic":[0.7977, 0.8547],
  "ciboulette":[0.7977, 0.8547],
  "coriandre":[0.7977, 0.8547],
  "endives":[0.7977, 0.8547],
  "mache":[0.7977, 0.8547],
  "menthe":[0.7977, 0.8547],
  "persil":[0.7977, 0.8547],
  "romarin-frais":[0.7977, 0.8547],
  "roquette":[0.7977, 0.8547],
  "salade-verte":[0.9117, 1],
  "thym-frais":[0.7977, 0.8547],
  "ail":[0.8104, 0.8683],
  "citron-vert":[0.7977, 0.8547],
  "echalotes":[0.8104, 0.8683],
  "gingembre":[0.7977, 0.8547],
  "noisettes":[0.8104, 0.8683],
  "noix":[0.7977, 0.8547],
  "oignons-jaunes":[0.8394, 0.8973],
  "oignons-rouges":[0.8262, 0.8832],
  "olives-fraiches":[0.8262, 0.8832],
  "patates-douces":[0.8262, 0.8832],
  "piments":[0.7977, 0.8547],
  "pommes-de-terre":[0.8262, 0.8832],
  "apres-shampoing":[0.9117, 1],
  "brosses-a-dents":[0.8832, 0.9402],
  "brossettes-interdentaires":[0.9117, 1],
  "cotons-tiges":[0.9117, 1],
  "dentifrice":[0.8262, 0.8832],
  "deodorant":[0.8262, 0.8832],
  "disques-coton":[0.9117, 1],
  "fil-dentaire":[0.6268, 0.6838],
  "gel-douche":[0.9117, 1],
  "gel-hydroalcoolique":[0.9117, 1],
  "mouchoirs-poche":[0.9117, 1],
  "papier-toilette-humide":[0.9117, 1],
  "savon-mains":[0.9117, 1],
  "shampoing":[0.9117, 1],
  "alcool-70":[0.8262, 0.8832],
  "antiseptique":[0.8262, 0.8832],
  "baume-levres":[0.6268, 0.6838],
  "coton":[0.8547, 0.9117],
  "creme-hydratante":[0.7407, 0.7977],
  "creme-mains":[0.7123, 0.7692],
  "demaquillant":[0.8547, 0.9117],
  "eau-micellaire":[0.8547, 0.9117],
  "mousse-a-raser":[0.8547, 0.9117],
  "pansements":[0.7123, 0.7692],
  "protections-hygieniques":[0.8547, 0.9117],
  "rasoirs":[0.8262, 0.8832],
  "thermometre-piles":[0.8832, 0.9402],
  "bicarbonate":[0.7977, 0.8547],
  "eponges-magiques":[0.7692, 0.8262],
  "lingettes-menage":[0.8547, 0.9117],
  "pile-9v":[0.9117, 1],
  "pile-aaa":[0.9117, 1],
  "piles-aa":[0.9117, 1],
  "piles-cr123a":[0.9117, 1],
  "piles-cr2025":[0.9117, 1],
  "piles-cr2032":[0.9117, 1],
  "piles-cr2450":[0.9117, 1],
  "piles-lr44":[0.9117, 1],
  "amidon":[0.9972, 1.06],
  "lingettes-anti-decoloration":[0.8547, 0.9117],
  "pinces-a-linge":[0.8547, 0.9117],
  "sacs-zip":[0.8547, 0.9117],
  "serviettes-papier":[0.8547, 0.9117],
  "eponges":[0.7692, 0.8262],
  "essuie-verres":[0.8547, 0.9117],
  "gants-menage":[0.8262, 0.8832],
  "grattoirs":[0.7692, 0.8262],
  "liquide-rincage":[0.9117, 1],
  "liquide-vaisselle":[0.9117, 1],
  "liquide-vaisselle-mains-sensibles":[0.9117, 1],
  "nettoyant-lave-vaisselle":[0.9117, 1],
  "produit-inox":[0.9117, 1],
  "sel-lave-vaisselle":[0.9117, 1],
  "tablettes-lave-vaisselle":[0.92, 1],
  "torchons":[0.8547, 0.9117],
  "biscuits-aperitifs":[0.9117, 1],
  "bretzels":[0.7407, 0.7977],
  "cacahuetes":[0.9117, 1],
  "chips":[0.9117, 1],
  "crackers":[0.7407, 0.7977],
  "gressins":[0.9117, 1],
  "houmous":[0.7977, 0.8547],
  "noix-de-cajou":[0.9117, 1],
  "noix-de-pecan":[0.9117, 1],
  "noix-du-bresil":[0.9117, 1],
  "olives":[0.7977, 0.8547],
  "pistaches":[0.9117, 1],
  "pop-corn":[0.9117, 1],
  "tapenade":[0.7977, 0.8547],
  "barres-cereales":[0.7123, 0.7692],
  "biscuits-beurre":[0.7407, 0.7977],
  "biscuits-chocolat":[0.7407, 0.7977],
  "bonbons":[0.6268, 0.6838],
  "brownies":[0.7692, 0.8262],
  "chocolat-au-lait":[0.7692, 0.8262],
  "chocolat-blanc":[0.7692, 0.8262],
  "chocolat-noir":[0.7692, 0.8262],
  "compotes-gourdes":[0.7123, 0.7692],
  "cookies":[0.7407, 0.7977],
  "crepes":[0.7692, 0.8262],
  "gaufres":[0.7692, 0.8262],
  "kinder-maxi":[0.6838, 0.7407],
  "madeleines":[0.7692, 0.8262],
  "muffins":[0.7692, 0.8262],
  "speculoos":[0.7692, 0.8262],
  "cafe-en-grains":[0.8832, 0.9402],
  "cafe-moulu":[0.8547, 0.9117],
  "cafe-soluble":[0.8547, 0.9117],
  "capsules-cafe":[0.6268, 0.6838],
  "chicoree":[0.8547, 0.9117],
  "dosettes-cafe":[0.6553, 0.7123],
  "filtres-a-cafe":[0.6838, 0.7407],
  "infusion-camomille":[0.7692, 0.8262],
  "infusion-menthe":[0.7692, 0.8262],
  "infusion-verveine":[0.7692, 0.8262],
  "matcha":[0.7692, 0.8262],
  "the-earl-grey":[0.7906, 0.8492],
  "the-fruits-rouges":[0.7906, 0.8492],
  "the-noir":[0.8262, 0.8832],
  "the-vert":[0.7692, 0.8262],
  "abricots-secs":[0.9117, 1],
  "beurre-de-cacahuete":[0.8547, 0.9117],
  "chocolat-en-poudre":[0.8547, 0.9117],
  "creme-de-marrons":[0.8547, 0.9117],
  "dattes":[0.9117, 1],
  "figues-seches":[0.9117, 1],
  "miel":[0.8547, 0.9117],
  "pancakes":[0.7977, 0.8547],
  "pate-a-tartiner":[0.8547, 0.9117],
  "pruneaux":[0.9117, 1],
  "raisins-secs":[0.9117, 1],
  "sirop-d-erable":[0.8547, 0.9117],
  "bacon":[0.8832, 0.9402],
  "blanc-de-poulet":[0.8832, 0.9402],
  "chorizo":[0.8832, 0.9402],
  "coppa":[0.8832, 0.9402],
  "jambon-blanc":[0.8832, 0.9402],
  "jambon-cru":[0.8832, 0.9402],
  "lardons":[0.8832, 0.9402],
  "mortadelle":[0.8832, 0.9402],
  "pate":[0.7977, 0.8547],
  "peperroni":[0.8832, 0.9402],
  "rillettes":[0.7977, 0.8547],
  "rosette":[0.8832, 0.9402],
  "saucisson":[1.0943, 1.18],
  "cabillaud":[0.9117, 1],
  "crevettes":[0.9117, 1],
  "moules":[0.9117, 1],
  "poisson-pane":[0.9117, 1],
  "saumon":[0.9117, 0.9687],
  "saumon-fume":[0.9117, 1],
  "surimi":[0.9117, 1],
  "thon-frais":[0.9117, 1],
  "truite":[0.9117, 0.9687],
  "maquereaux":[0.8832, 0.9402],
  "sardines":[0.8832, 0.9402],
  "thon-en-boite":[0.8832, 0.9402],
  "agneau":[0.9117, 1],
  "boeuf":[0.9117, 1],
  "cotes-de-porc":[0.9117, 1],
  "dinde":[0.9117, 1],
  "escalopes-de-poulet":[0.9117, 1],
  "filets-de-poulet":[0.9117, 1],
  "merguez":[0.9117, 1],
  "porc":[0.9117, 0.9687],
  "saucisses":[0.9117, 1],
  "steaks-haches":[0.9117, 1],
  "veau":[0.9117, 1],
  "viande-hachee":[0.9117, 1]
}).map(([slug,factors])=>['./www/Items/'+slug+'.webp',factors]));
function visualScaleForView(source,metrics,compact=false){
  const factors=PRODUCT_VISUAL_FACTORS.get(source);
  if(!factors)return metrics;
  return {...metrics,scale:Math.round(metrics.scale*factors[compact?1:0]*1000)/1000};
}
let visualScaleSaveTimer=0;

const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

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
    const cacheVersion=Number(String(stored.version||'').replace(/^v/,''));
    const changedSince785=Number(String(currentAppVersion()).replace(/^v/,''))>=785&&(!Number.isFinite(cacheVersion)||cacheVersion<785);
    const changedSince783=Number(String(currentAppVersion()).replace(/^v/,''))>=783&&(!Number.isFinite(cacheVersion)||cacheVersion<783);
    const changedImages783=["./www/Items/jus-d-orange.webp","./www/Items/jus-de-pomme.webp","./www/Items/jus-d-ananas.webp","./www/Items/jus-de-raisin.webp","./www/Items/jus-de-tomate.webp","./www/Items/jus-multifruits.webp","./www/Items/jus-de-poire.webp","./www/Items/biere-sans-alcool.webp","./www/Items/rhum.webp","./www/Items/ricard.webp","./www/Items/tonic.webp"];
    const changedSince780=Number(String(currentAppVersion()).replace(/^v/,''))>=780&&(!Number.isFinite(cacheVersion)||cacheVersion<780);
    const changedImages780=["./www/Items/biere-ambree.webp","./www/Items/biere-aux-fruits.webp","./www/Items/biere-blanche.webp","./www/Items/biere-blonde.webp","./www/Items/biere-brune.webp","./www/Items/biere-ipa.webp","./www/Items/biere-triple.webp","./www/Items/panache.webp","./www/Items/whisky.webp"];
    const changedSinceCache=!Number.isFinite(cacheVersion)||cacheVersion<722;
    const changedSince724=!Number.isFinite(cacheVersion)||cacheVersion<724;
    const changedSince725=!Number.isFinite(cacheVersion)||cacheVersion<725;
    const changedSince726=!Number.isFinite(cacheVersion)||cacheVersion<726;
    const changedSince729=!Number.isFinite(cacheVersion)||cacheVersion<729;
    const changedSince730=!Number.isFinite(cacheVersion)||cacheVersion<730;
    const changedSince732=!Number.isFinite(cacheVersion)||cacheVersion<732;
    const changedSince733=!Number.isFinite(cacheVersion)||cacheVersion<733;
    const changedSince734=!Number.isFinite(cacheVersion)||cacheVersion<734;
    const changedSince736=!Number.isFinite(cacheVersion)||cacheVersion<736;
    const changedSince738=!Number.isFinite(cacheVersion)||cacheVersion<738;
    const changedSince739=!Number.isFinite(cacheVersion)||cacheVersion<739;
    const changedSince740=!Number.isFinite(cacheVersion)||cacheVersion<740;
    const changedSince741=!Number.isFinite(cacheVersion)||cacheVersion<741;
    const changedSince742=!Number.isFinite(cacheVersion)||cacheVersion<742;
    const changedSince743=!Number.isFinite(cacheVersion)||cacheVersion<743;
    const changedSince744=!Number.isFinite(cacheVersion)||cacheVersion<744;
    const changedSince745=!Number.isFinite(cacheVersion)||cacheVersion<745;
    const changedSince746=!Number.isFinite(cacheVersion)||cacheVersion<746;
    const changedSince747=!Number.isFinite(cacheVersion)||cacheVersion<747;
    const changedSince748=!Number.isFinite(cacheVersion)||cacheVersion<748;
    const changedSince749=!Number.isFinite(cacheVersion)||cacheVersion<749;
    const changedSince750=!Number.isFinite(cacheVersion)||cacheVersion<750;
    const changedSince751=!Number.isFinite(cacheVersion)||cacheVersion<751;
    const changedSince752=!Number.isFinite(cacheVersion)||cacheVersion<752;
    const changedSince754=!Number.isFinite(cacheVersion)||cacheVersion<754;
    const changedSince776=Number(String(currentAppVersion()).replace(/^v/,''))>=776&&(!Number.isFinite(cacheVersion)||cacheVersion<776);
    const changedImages776=["./www/Items/noix-de-cajou.webp", "./www/Items/pistaches.webp", "./www/Items/cacahuetes.webp", "./www/Items/noix-de-pecan.webp", "./www/Items/noix-du-bresil.webp", "./www/Items/dattes.webp", "./www/Items/abricots-secs.webp", "./www/Items/raisins-secs.webp", "./www/Items/pruneaux.webp", "./www/Items/figues-seches.webp"];
    const changedSince775=Number(String(currentAppVersion()).replace(/^v/,''))>=775&&(!Number.isFinite(cacheVersion)||cacheVersion<775);
    const changedSince771=Number(String(currentAppVersion()).replace(/^v/,''))>=771&&(!Number.isFinite(cacheVersion)||cacheVersion<771);
    const changedImages771=["./www/Items/rhum.webp","./www/Items/ricard.webp","./www/Items/citronnade.webp","./www/Items/soda-citron.webp","./www/Items/abricots.webp","./www/Items/bananes.webp","./www/Items/citrons.webp","./www/Items/clementines.webp","./www/Items/kiwis.webp","./www/Items/nectarines.webp","./www/Items/oranges.webp","./www/Items/peches.webp","./www/Items/poires.webp","./www/Items/pommes.webp","./www/Items/prunes.webp","./www/Items/raisin.webp","./www/Items/ananas.webp","./www/Items/avocat.webp","./www/Items/cerises.webp","./www/Items/fraises.webp","./www/Items/framboises.webp","./www/Items/fruit-de-la-passion.webp","./www/Items/grenade.webp","./www/Items/mangue.webp","./www/Items/melon.webp","./www/Items/mures.webp","./www/Items/myrtilles.webp","./www/Items/noix-de-coco.webp","./www/Items/aubergines.webp","./www/Items/brocoli.webp","./www/Items/carottes.webp","./www/Items/chou-fleur.webp","./www/Items/concombres.webp","./www/Items/courgettes.webp","./www/Items/epinards.webp","./www/Items/haricots-verts.webp","./www/Items/petits-pois.webp","./www/Items/poireaux.webp","./www/Items/poivrons.webp","./www/Items/tomates.webp","./www/Items/artichauts.webp","./www/Items/asperges.webp","./www/Items/betteraves.webp","./www/Items/butternut.webp","./www/Items/celeri.webp","./www/Items/champignons.webp","./www/Items/courge.webp","./www/Items/fenouil.webp","./www/Items/mais.webp","./www/Items/navets.webp","./www/Items/potiron.webp","./www/Items/radis.webp","./www/Items/basilic.webp","./www/Items/chou-rouge.webp","./www/Items/ciboulette.webp","./www/Items/coriandre.webp","./www/Items/endives.webp","./www/Items/mache.webp","./www/Items/menthe.webp","./www/Items/persil.webp","./www/Items/romarin-frais.webp","./www/Items/roquette.webp","./www/Items/salade-verte.webp","./www/Items/thym-frais.webp","./www/Items/ail.webp","./www/Items/citron-vert.webp","./www/Items/echalotes.webp","./www/Items/gingembre.webp","./www/Items/noisettes.webp","./www/Items/noix.webp","./www/Items/oignons-jaunes.webp","./www/Items/oignons-rouges.webp","./www/Items/olives-fraiches.webp","./www/Items/patates-douces.webp","./www/Items/piments.webp","./www/Items/pommes-de-terre.webp","./www/Items/brosses-a-dents.webp","./www/Items/cotons-tiges.webp","./www/Items/gel-douche.webp","./www/Items/papier-toilette-humide.webp","./www/Items/savon-mains.webp","./www/Items/shampoing.webp","./www/Items/creme-hydratante.webp","./www/Items/pansements.webp","./www/Items/protections-hygieniques.webp","./www/Items/rasoirs.webp","./www/Items/bicarbonate.webp","./www/Items/detartrant.webp","./www/Items/nettoyant-multi-usages.webp","./www/Items/nettoyant-salle-de-bain.webp","./www/Items/nettoyant-vitres.webp","./www/Items/filet-de-lavage.webp","./www/Items/lessive-capsules.webp","./www/Items/lessive-liquide.webp","./www/Items/lessive-poudre.webp","./www/Items/papier-cadeau.webp","./www/Items/sacs-congelation.webp","./www/Items/eponges.webp","./www/Items/gants-menage.webp","./www/Items/liquide-vaisselle.webp","./www/Items/lave-glace.webp","./www/Items/chips.webp","./www/Items/crackers.webp","./www/Items/pop-corn.webp","./www/Items/barres-cereales.webp","./www/Items/brownies.webp","./www/Items/compotes-gourdes.webp","./www/Items/cookies.webp","./www/Items/crepes.webp","./www/Items/gaufres.webp","./www/Items/kinder-maxi.webp","./www/Items/madeleines.webp","./www/Items/speculoos.webp","./www/Items/cafe-en-grains.webp","./www/Items/cafe-moulu.webp","./www/Items/cafe-soluble.webp","./www/Items/capsules-cafe.webp","./www/Items/chicoree.webp","./www/Items/dosettes-cafe.webp","./www/Items/infusion-camomille.webp","./www/Items/infusion-menthe.webp","./www/Items/infusion-verveine.webp","./www/Items/the-earl-grey.webp","./www/Items/the-fruits-rouges.webp","./www/Items/the-vert.webp","./www/Items/cereales.webp","./www/Items/cereales-lion.webp","./www/Items/miel.webp","./www/Items/pate-a-tartiner.webp","./www/Items/sirop-d-erable.webp","./www/Items/crevettes.webp","./www/Items/saumon.webp","./www/Items/surimi.webp","./www/Items/maquereaux.webp","./www/Items/sardines.webp","./www/Items/poisson-surgele.webp","./www/Items/boeuf.webp","./www/Items/dinde.webp","./www/Items/escalopes-de-poulet.webp","./www/Items/filets-de-poulet.webp","./www/Items/merguez.webp","./www/Items/porc.webp","./www/Items/steaks-haches.webp","./www/Items/viande-hachee.webp"];
    const changedSince769=Number(String(currentAppVersion()).replace(/^v/,''))>=769&&(!Number.isFinite(cacheVersion)||cacheVersion<769);
    const changedImages769=['./www/Items/compotes-bebe.webp','./www/Items/lait-infantile.webp','./www/Items/sacs-a-couches.webp','./www/Items/petits-pots.webp'];
    const changedSince768=Number(String(currentAppVersion()).replace(/^v/,''))>=768&&(!Number.isFinite(cacheVersion)||cacheVersion<768);
    const changedImages768=['./www/Items/cornichon.webp'];
    const changedSince766=Number(String(currentAppVersion()).replace(/^v/,''))>=766&&(!Number.isFinite(cacheVersion)||cacheVersion<766);
    const changedImages766=['./www/Items/confiture-fraise.webp','./www/Items/confiture-mirabelles.webp'];
    const changedSince765=Number(String(currentAppVersion()).replace(/^v/,''))>=765&&(!Number.isFinite(cacheVersion)||cacheVersion<765);
    const changedImages765=['./www/Items/pate-brisee.webp'];
    const changedSince764=Number(String(currentAppVersion()).replace(/^v/,''))>=764&&(!Number.isFinite(cacheVersion)||cacheVersion<764);
    const changedImages764=['./www/Items/quinoa.webp'];
    const changedSince763=!Number.isFinite(cacheVersion)||cacheVersion<763;
    const changedImages763=["./www/Items/gelatine.webp", "./www/Items/amandes.webp", "./www/Items/levure-chimique.webp", "./www/Items/sucre.webp", "./www/Items/sucre-glace.webp", "./www/Items/sucre-roux.webp"];
    const changedSince762=!Number.isFinite(cacheVersion)||cacheVersion<762;
    const changedImages762=["./www/Items/bouillon-cubes.webp", "./www/Items/lait-de-coco.webp", "./www/Items/croutons.webp", "./www/Items/nouilles-instantanees.webp"];
    const changedSince761=!Number.isFinite(cacheVersion)||cacheVersion<761;
    const changedImages761=["./www/Items/creme-dessert-chocolat.webp", "./www/Items/creme-dessert-vanille.webp", "./www/Items/yaourts-citron.webp", "./www/Items/yaourts-noix-de-coco.webp"];
    const changedSince760=!Number.isFinite(cacheVersion)||cacheVersion<760;
    const changedImages760=['./www/Items/yaourt.webp','./www/Items/yaourts-fruits.webp','./www/Items/yaourts-vanille.webp'];
    const changedSince759=!Number.isFinite(cacheVersion)||cacheVersion<759;
    const changedImages759=["./www/Items/gnocchis.webp", "./www/Items/gouda.webp", "./www/Items/yaourt.webp", "./www/Items/yaourts-fruits.webp", "./www/Items/yaourts-vanille.webp", "./www/Items/mascarpone.webp"];
    const changedSince758=!Number.isFinite(cacheVersion)||cacheVersion<758;
    const changedImages758=['./www/Items/gnocchis.webp','./www/Items/quiche.webp'];
    const changedSince757=!Number.isFinite(cacheVersion)||cacheVersion<757;
    const changedImages757=["./www/Items/epinards-surgeles.webp", "./www/Items/frites-surgelees.webp", "./www/Items/glace-nuii.webp", "./www/Items/glace-vanille.webp", "./www/Items/haricots-verts-surgeles.webp", "./www/Items/legumes-surgeles.webp", "./www/Items/petits-pois-surgeles.webp", "./www/Items/poelee-de-legumes.webp"];
    const changedSince756=!Number.isFinite(cacheVersion)||cacheVersion<756;
    const changedImages756=['./www/Items/burrata.webp', './www/Items/feta.webp', './www/Items/ricotta.webp', './www/Items/camembert.webp', './www/Items/comte.webp', './www/Items/gouda.webp', './www/Items/raclette.webp', './www/Items/reblochon.webp'];
    const changedImages754=['./www/Items/brioche.webp', './www/Items/croissants.webp', './www/Items/pain.webp', './www/Items/pains-au-chocolat.webp', './www/Items/pains-hot-dog.webp'];
    const changedImages752=['./www/Items/mascarpone.webp'];
    const changedImages751=['./www/Items/riz-au-lait.webp','./www/Items/yaourt-a-boire.webp','./www/Items/yaourts-fruits.webp','./www/Items/yaourts-grecs.webp'];
    const changedImages750=['./www/Items/rosette.webp','./www/Items/pate.webp','./www/Items/blanc-de-poulet.webp','./www/Items/coppa.webp','./www/Items/lardons.webp','./www/Items/mortadelle.webp','./www/Items/peperroni.webp','./www/Items/rillettes.webp','./www/Items/saucisson.webp'];
    const changedImages749=['./www/Items/huile-d-olive.webp','./www/Items/huile-de-tournesol.webp','./www/Items/vinaigre-de-vin.webp'];
    const changedImages748=['./www/Items/jus-d-orange.webp','./www/Items/jus-de-pomme.webp','./www/Items/jus-de-raisin.webp','./www/Items/jus-d-ananas.webp','./www/Items/jus-multifruits.webp','./www/Items/jus-de-tomate.webp'];
    const changedImages747=['./www/Items/jus-d-orange.webp','./www/Items/jus-multifruits.webp','./www/Items/jus-de-tomate.webp'];
    const changedImages746=['./www/Items/desinfectant.webp','./www/Items/desodorisant-textile.webp','./www/Items/detachant.webp'];
    const changedImages745=['./www/Items/truite.webp'];
    const changedImages744=['./www/Items/jambon-cru.webp','./www/Items/cabillaud.webp','./www/Items/moules.webp','./www/Items/saumon-fume.webp','./www/Items/thon-frais.webp','./www/Items/truite.webp','./www/Items/thon-en-boite.webp','./www/Items/agneau.webp','./www/Items/cotes-de-porc.webp','./www/Items/poulet.webp','./www/Items/veau.webp'];
    const changedImages743=['./www/Items/roquefort.webp','./www/Items/pates-fraiches.webp','./www/Items/bretzels.webp','./www/Items/biscuits-beurre.webp','./www/Items/biscuits-chocolat.webp','./www/Items/chocolat-au-lait.webp','./www/Items/chocolat-noir.webp','./www/Items/bacon.webp','./www/Items/chorizo.webp','./www/Items/jambon-blanc.webp'];
    const changedImages742=['./www/Items/baguette.webp','./www/Items/pain-aux-cereales.webp','./www/Items/pain-complet.webp','./www/Items/pain-de-mie.webp','./www/Items/pains-burger.webp','./www/Items/tortillas.webp','./www/Items/brie.webp','./www/Items/cheddar.webp','./www/Items/chevre.webp','./www/Items/emmental.webp'];
    const changedImages741=['./www/Items/bolognaise.webp','./www/Items/ketchup.webp','./www/Items/moutarde.webp','./www/Items/pesto.webp','./www/Items/sauce-aigre-douce.webp','./www/Items/sauce-algerienne.webp','./www/Items/sauce-andalouse.webp','./www/Items/sauce-au-poivre.webp','./www/Items/sauce-au-roquefort.webp','./www/Items/sauce-aux-champignons.webp','./www/Items/sauce-barbecue.webp','./www/Items/sauce-bearnaise.webp','./www/Items/sauce-blanche.webp','./www/Items/sauce-burger.webp','./www/Items/sauce-cesar.webp','./www/Items/sauce-curry.webp','./www/Items/sauce-hollandaise.webp','./www/Items/sauce-miel-moutarde.webp','./www/Items/sauce-napolitaine.webp','./www/Items/sauce-ranch.webp','./www/Items/sauce-samourai.webp','./www/Items/sauce-soja.webp','./www/Items/sauce-tartare.webp','./www/Items/sauce-teriyaki.webp','./www/Items/sauce-tomate.webp','./www/Items/tabasco.webp','./www/Items/harissa.webp','./www/Items/guacamole.webp','./www/Items/houmous.webp','./www/Items/tapenade.webp','./www/Items/coulis-de-fruit.webp','./www/Items/curcuma.webp','./www/Items/curry.webp','./www/Items/poivre.webp','./www/Items/sel.webp','./www/Items/chili.webp','./www/Items/vanille.webp'];
    const changedImages740=['./www/Items/champignons-en-boite.webp','./www/Items/concentre-de-tomate.webp','./www/Items/mais-en-boite.webp','./www/Items/petits-pois-carottes.webp','./www/Items/raviolis-en-boite.webp','./www/Items/tomates-pelees.webp','./www/Items/paprika.webp','./www/Items/mayonnaise.webp','./www/Items/sauce-tomate.webp','./www/Items/jus-d-ananas.webp'];
    const changedImages739=['./www/Items/glace-chocolat.webp','./www/Items/noisettes.webp','./www/Items/noix.webp','./www/Items/oignons-jaunes.webp','./www/Items/pansements.webp','./www/Items/tapenade.webp','./www/Items/muffins.webp','./www/Items/beurre-de-cacahuete.webp','./www/Items/biscuits-aperitifs.webp'];
    const changedImages738=['./www/Items/lait.webp', './www/Items/lait-demi-ecreme.webp', './www/Items/lait-ecreme.webp', './www/Items/lait-d-amande.webp', './www/Items/lait-d-avoine.webp'];
    const changedImages724=['./www/Items/poivrons.webp','./www/Items/asperges.webp','./www/Items/tomates.webp'];
    const changedImages725=['./www/Items/abricots.webp'];
    const changedImages726=['./www/Items/clementines.webp'];
    const changedImages730=['./www/Items/butternut.webp','./www/Items/courge.webp','./www/Items/navets.webp','./www/Items/echalotes.webp','./www/Items/noisettes.webp','./www/Items/ail.webp','./www/Items/oignons-jaunes.webp'];
    const changedImages729=['./www/Items/nectarines.webp','./www/Items/fruit-de-la-passion.webp','./www/Items/noix-de-coco.webp'];
    // Les trois nouvelles images sont remesurées sans toucher aux autres cadrages.
    const changedImages734=['./www/Items/cereales.webp','./www/Items/petits-pots.webp','./www/Items/pop-corn.webp'];
    const changedImages736=['./www/Items/brocoli.webp','./www/Items/basilic.webp','./www/Items/carottes.webp'];
    // Recalculer seulement les cadrages des visuels remplacés en v732.
    const changedImages732=["./www/Items/glace-vanille.webp","./www/Items/lait-infantile.webp","./www/Items/yaourt-a-boire.webp","./www/Items/ricotta.webp","./www/Items/gouda.webp","./www/Items/gnocchis.webp","./www/Items/feta.webp","./www/Items/burrata.webp","./www/Items/savon-mains.webp"];
    Object.entries(stored.items).forEach(([source,values])=>{
      if((changedSince785&&source==='./www/Items/whisky.webp')||(changedSince783&&changedImages783.includes(source))||(changedSince780&&changedImages780.includes(source))||(changedSince776&&changedImages776.includes(source))||(changedSince775&&source==='./www/Items/noix-de-pecan.webp')||(changedSinceCache&&UPDATED_IMAGE_SOURCES_V722.has(source))||(changedSince724&&changedImages724.includes(source))||(changedSince725&&changedImages725.includes(source))||(changedSince726&&changedImages726.includes(source))||(changedSince729&&changedImages729.includes(source))||(changedSince730&&changedImages730.includes(source))||(changedSince732&&changedImages732.includes(source))||(changedSince733&&changedImages730.includes(source))||(changedSince734&&changedImages734.includes(source))||(changedSince736&&changedImages736.includes(source))||(changedSince738&&changedImages738.includes(source))||(changedSince739&&changedImages739.includes(source))||(changedSince740&&changedImages740.includes(source))||(changedSince741&&changedImages741.includes(source))||(changedSince742&&changedImages742.includes(source))||(changedSince743&&changedImages743.includes(source))||(changedSince744&&changedImages744.includes(source))||(changedSince745&&changedImages745.includes(source))||(changedSince746&&changedImages746.includes(source))||(changedSince747&&changedImages747.includes(source))||(changedSince748&&changedImages748.includes(source))||(changedSince749&&changedImages749.includes(source))||(changedSince750&&changedImages750.includes(source))||(changedSince751&&changedImages751.includes(source))||(changedSince752&&changedImages752.includes(source))||(changedSince754&&changedImages754.includes(source))||(changedSince756&&changedImages756.includes(source))||(changedSince757&&changedImages757.includes(source))||(changedSince758&&changedImages758.includes(source))||(changedSince759&&changedImages759.includes(source))||(changedSince760&&changedImages760.includes(source))||(changedSince761&&changedImages761.includes(source))||(changedSince762&&changedImages762.includes(source))||(changedSince763&&changedImages763.includes(source))||(changedSince764&&changedImages764.includes(source))||(changedSince765&&changedImages765.includes(source))||(changedSince766&&changedImages766.includes(source))||(changedSince768&&changedImages768.includes(source))||(changedSince769&&changedImages769.includes(source))||(changedSince771&&changedImages771.includes(source)))return;
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
window.COURSES_PRODUCT_IMAGES=Object.freeze({warm:warmProductImages,visualScaleStyle});
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