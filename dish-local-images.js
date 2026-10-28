(() => {
'use strict';

const APP_VERSION='v640';
window.COURSES_APP_VERSION=APP_VERSION;

const SPECIAL_SLUGS=Object.freeze({
  'Tagliatelles au saumon':'tagliatelles-saumon',
  'Gratin de courgettes':'gratin-courgettes',
  'Poulet pommes de terre au four':'poulet-pommes-de-terre-four'
});
const CHILD_DISHES=new Set([
  'Boulettes riz',
  'Coquillettes jambon',
  'Couscous poulet légumes',
  'Gratin pommes de terre',
  'Pâtes jambon',
  'Purée carotte poulet',
  'Risotto poulet',
  'Saumon brocoli',
  'Steak frites',
  'Velouté carottes',
  'Crème brûlée',
  'Riz au lait'
]);
const DISH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#eef1eb"/><ellipse cx="450" cy="330" rx="250" ry="170" fill="#f8f7f2" stroke="#cbd2c8" stroke-width="12"/><text x="450" y="350" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="30" font-weight="700" fill="#708076">Photo indisponible</text></svg>');
let warmQueue=[];
let warmScheduled=false;
let warmRunning=false;
const warmedSources=new Set();
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

function dishFileName(name){
  return (CHILD_DISHES.has(name)?'enfant-':'')+(SPECIAL_SLUGS[name]||slugify(name));
}
// Adresses stables : le service worker garde les visuels tant que son cache n'est pas vidé,
// et les rafraîchit en arrière-plan quand un fichier change.
function localDishImage(name){
  return './www/Plats/'+dishFileName(name)+'.png';
}
function localDishCardImage(name){
  return './www/Plats/cartes/'+dishFileName(name)+'.webp';
}
function scheduleWarmStep(){
  if(warmScheduled||warmRunning||!warmQueue.length)return;
  warmScheduled=true;
  const run=()=>{
    warmScheduled=false;
    warmNextDishImage();
  };
  if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:1200});
  else setTimeout(run,0);
}
function warmNextDishImage(){
  if(warmRunning)return;
  const source=warmQueue.shift();
  if(!source)return;
  if(warmedSources.has(source)){scheduleWarmStep();return}
  warmRunning=true;
  const image=new Image();
  image.alt='';
  image.decoding='async';
  image.fetchPriority='low';
  const done=()=>{
    warmRunning=false;
    warmedSources.add(source);
    scheduleWarmStep();
  };
  image.addEventListener('load',done,{once:true});
  image.addEventListener('error',done,{once:true});
  image.src=source;
}
function warmDishImages(){
  const names=Array.isArray(window.COURSES_DISH_NAMES)?window.COURSES_DISH_NAMES:[];
  if(!names.length)return false;
  const queued=new Set(warmQueue);
  for(const name of names){
    const source=localDishCardImage(name);
    if(warmedSources.has(source)||queued.has(source))continue;
    warmQueue.push(source);
    queued.add(source);
  }
  scheduleWarmStep();
  return true;
}
window.COURSES_DISH_IMAGES=Object.freeze({warm:warmDishImages});
function sameImageSource(image,source){
  const current=image?.getAttribute?.('src')||'';
  if(current===source)return true;
  try{return image.src===new URL(source,document.baseURI).href}catch(_){return false}
}
function bindImageFallback(image){
  if(!image||image.dataset.localImageFallbackBound==='1')return;
  image.dataset.localImageFallbackBound='1';
  image.addEventListener('error',()=>{
    const name=image.dataset.localDish||'';
    if(!name)return;
    const current=image.getAttribute('src')||'';
    if(!sameImageSource(image,localDishImage(name))&&current!==DISH_PLACEHOLDER)return;
    image.dataset.localImageFailed=name;
    if(current!==DISH_PLACEHOLDER)image.src=DISH_PLACEHOLDER;
  });
}
function localizeImage(image,name,card=false){
  if(!name||!image)return;
  bindImageFallback(image);
  const source=card&&image.dataset.dishCardFallback!=='1'?localDishCardImage(name):localDishImage(name);
  const current=image.getAttribute('src')||'';
  if(image.dataset.localImageFailed===name&&current===DISH_PLACEHOLDER){
    image.dataset.localDish=name;
    return;
  }
  image.dataset.localDish=name;
  if(sameImageSource(image,source))return;
  delete image.dataset.localImageFailed;
  image.src=source;
}
function localizeCard(card){
  const name=card?.dataset?.dish||'';
  const image=card?.querySelector?.('.dish-visual img');
  localizeImage(image,name,true);
}
function localizeCards(grid){
  grid?.querySelectorAll?.('.dish-card').forEach(localizeCard);
}
function localizeDialog(dialog){
  if(!dialog?.open)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const image=dialog.querySelector('.dish-sheet-photo');
  localizeImage(image,name);
}
function retryLocalImages(){
  const grid=document.getElementById('dishes');
  grid?.querySelectorAll?.('.dish-card img').forEach(image=>delete image.dataset.localImageFailed);
  const dialog=document.getElementById('dishDialog');
  const dialogImage=dialog?.querySelector?.('.dish-sheet-photo');
  if(dialogImage)delete dialogImage.dataset.localImageFailed;
  localizeCards(grid);
  localizeDialog(dialog);
}

function bind(){
  localizeCards(document.getElementById('dishes'));
  localizeDialog(document.getElementById('dishDialog'));
}

document.addEventListener('courses:dishes-rendered',()=>localizeCards(document.getElementById('dishes')));
document.addEventListener('courses:dish-sheet-opened',()=>localizeDialog(document.getElementById('dishDialog')));
window.addEventListener('online',retryLocalImages,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();