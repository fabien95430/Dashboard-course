(() => {
'use strict';

const STARTUP_CLASS='startup-assets-pending';
const root=document.documentElement;
const retained=[];

function timeout(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

function preloadVisual(src,priority='high'){
  const image=new Image();
  image.decoding='sync';
  try{image.fetchPriority=priority}catch(_){}
  image.src=src;
  retained.push(image);

  return new Promise(resolve=>{
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      resolve(image);
    };
    const decode=()=>{
      if(typeof image.decode!=='function'){
        finish();
        return;
      }
      image.decode().then(finish).catch(finish);
    };

    if(image.complete){
      decode();
      return;
    }
    image.addEventListener('load',decode,{once:true});
    image.addEventListener('error',finish,{once:true});
  });
}

const backgroundReady=preloadVisual('./welcome-background-v40.webp');
const welcomeCartReady=preloadVisual('./welcome-cart-transparent-v46.png');
const emptyListReady=preloadVisual('./www/empty-list-premium-v4.webp?v=305');

window.COURSES_STARTUP_VISUALS=retained;
window.COURSES_EMPTY_LIST_VISUAL_READY=emptyListReady;

Promise.race([
  Promise.allSettled([backgroundReady,welcomeCartReady]),
  timeout(1800)
]).then(()=>{
  requestAnimationFrame(()=>root.classList.remove(STARTUP_CLASS));
});

const listRoot=document.getElementById('listItems');
if(!listRoot)return;

let emptyVisualToken=0;
function syncEmptyListVisual(){
  const state=listRoot.querySelector('.list-empty-state');
  if(!state||state.dataset.visualSyncBound==='1')return;
  const image=state.querySelector('.list-empty-visual img');
  if(!image)return;

  state.dataset.visualSyncBound='1';
  state.style.visibility='hidden';
  const token=++emptyVisualToken;

  void Promise.race([
    emptyListReady.then(async()=>{
      try{
        if(typeof image.decode==='function')await image.decode();
        else if(!image.complete)await new Promise(resolve=>{
          image.addEventListener('load',resolve,{once:true});
          image.addEventListener('error',resolve,{once:true});
        });
      }catch(_){}
    }),
    timeout(2200)
  ]).then(()=>{
    if(token!==emptyVisualToken||!state.isConnected)return;
    requestAnimationFrame(()=>{state.style.visibility=''});
  });
}

new MutationObserver(syncEmptyListVisual).observe(listRoot,{childList:true,subtree:true});
syncEmptyListVisual();
})();
