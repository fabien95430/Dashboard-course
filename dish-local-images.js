(() => {
'use strict';

const APP_VERSION='v694';
window.COURSES_APP_VERSION=APP_VERSION;

let warmQueue=[];
let warmScheduled=false;
let warmRunning=false;
const warmedSources=new Set();
// Adresses fournies par dishes-ui.js (source unique des noms de fichiers des plats).
// Adresses stables : le service worker garde les visuels tant que son cache n'est pas vidé,
// et les rafraîchit en arrière-plan quand un fichier change.
const dishFiles=()=>window.COURSES_DISH_FILES||null;
function localDishImage(name){
  return dishFiles()?.sheet(name)||'';
}
function localDishCardImage(name){
  return dishFiles()?.card(name)||'';
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
    if(!source||warmedSources.has(source)||queued.has(source))continue;
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
// dishes-ui.js pose les adresses et gère seul la chaîne de secours (WebP -> PNG -> visuel
// « Photo indisponible »). Ici, seulement : au retour du réseau, réessayer les visuels restés sur le visuel de secours.
function retryImage(image,name,primary){
  if(!image||!name||!primary)return;
  const current=image.getAttribute('src')||'';
  if(!current.startsWith('data:image/svg+xml'))return;
  delete image.dataset.dishCardFallback;
  delete image.dataset.dishPhotoFallback;
  if(!sameImageSource(image,primary))image.src=primary;
}
function retryLocalImages(){
  document.getElementById('dishes')?.querySelectorAll?.('.dish-card').forEach(card=>{
    const name=card.dataset.dish||'';
    retryImage(card.querySelector('.dish-visual img'),name,localDishCardImage(name));
  });
  const dialog=document.getElementById('dishDialog');
  const photo=dialog?.open?dialog.querySelector('.dish-sheet-photo'):null;
  const name=photo?.dataset?.dishImage||'';
  retryImage(photo,name,localDishImage(name));
}

window.addEventListener('online',retryLocalImages,{passive:true});
})();