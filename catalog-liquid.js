(() => {
'use strict';
/* Moteur unique du sélecteur Produits / Plats.
   Le Catalogue reste la référence : même trait, ressort et traitement tactile.
   Chaque sélecteur possède son état indépendant, sans polling. */
if(window.COURSES_SEGMENTED_LIQUID)return;
const controllers=new WeakMap();
function reduced(){return Boolean(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function attach(track,buttonSelector,flag){
  if(!track)return null;
  if(controllers.has(track))return controllers.get(track);
  const liquid={x:0,vx:0,tx:0,w:0,tw:0,vw:0,lift:0,vl:0,tl:0,last:0,ready:false,frame:0,scrub:null,justScrubbed:false,allowProgrammatic:false};
  const items=()=>[...track.querySelectorAll(buttonSelector)];
  const trackOrigin=()=>{const rect=track.getBoundingClientRect();return rect.left+track.clientLeft};
  const metrics=item=>{const rect=item.getBoundingClientRect();return{x:rect.left-trackOrigin(),w:rect.width}};
  function contain(x,w,sx,minLeft,maxRight){
    const room=Math.max(1,maxRight-minLeft);
    let visual=w*sx;
    visual-=(Math.max(0,minLeft-x)+Math.max(0,x+w-maxRight))*0.6;
    visual=Math.max(w*0.72,Math.min(visual,room));
    let center=x+w/2;
    center=Math.max(minLeft+visual/2,Math.min(maxRight-visual/2,center));
    return{x:center-w/2,sx:visual/w};
  }
  function rubber(distance,dimension=60){
    const d=Math.abs(distance);
    return Math.sign(distance)*(1-1/(d*0.55/dimension+1))*dimension;
  }
  function scrubTarget(){
    const list=items();
    if(!list.length||!liquid.scrub)return liquid.tx;
    const x=liquid.scrub.clientX-trackOrigin()-liquid.w/2;
    const first=metrics(list[0]),last=metrics(list[list.length-1]);
    const min=first.x,max=last.x+last.w-liquid.w;
    if(x<min)return min+rubber(x-min);
    if(x>max)return max+rubber(x-max);
    return x;
  }
  function nearest(){
    const center=liquid.x+liquid.w/2;
    let best=null,distance=Infinity;
    items().forEach(item=>{
      const m=metrics(item),d=Math.abs(m.x+m.w/2-center);
      if(d<distance){distance=d;best=item}
    });
    return best;
  }
  function markUnder(clear=false){
    const center=liquid.x+liquid.w/2;
    items().forEach(item=>{
      const m=metrics(item),under=!clear&&liquid.lift>.18&&center>=m.x&&center<m.x+m.w;
      item.classList.toggle('is-liquid-under',under);
    });
  }
  function paint(){
    if(!track.isConnected)return;
    const list=items();
    if(!list.length||!liquid.w)return;
    const lift=Math.max(-.12,Math.min(1.12,liquid.lift));
    const speed=Math.min(1,Math.abs(liquid.vx)/1700);
    const first=metrics(list[0]),last=metrics(list[list.length-1]);
    const lensW=Math.max(48,Math.min(liquid.w*0.5,108));
    const box=contain(liquid.x+(liquid.w-lensW)/2,lensW,1+Math.max(0,lift)*.04+speed*.06,first.x,last.x+last.w);
    track.style.setProperty('--catalog-lens-x',box.x.toFixed(2)+'px');
    track.style.setProperty('--catalog-lens-w',lensW.toFixed(2)+'px');
    track.style.setProperty('--catalog-liquid-sx',box.sx.toFixed(4));
    track.classList.toggle('is-liquid-moving',Boolean(liquid.scrub)||lift>.035||Math.abs(liquid.vx)>18);
  }
  function step(time){
    liquid.frame=0;
    if(!track.isConnected)return;
    const dt=liquid.last?Math.min(.032,Math.max(.001,(time-liquid.last)/1000)):1/60;
    liquid.last=time;
    if(liquid.scrub){liquid.tx=scrubTarget();liquid.tl=1}
    const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
    for(let i=0;i<steps;i++){
      liquid.vx+=(250*(liquid.tx-liquid.x)-24*liquid.vx)*h;liquid.x+=liquid.vx*h;
      liquid.vw+=(250*(liquid.tw-liquid.w)-24*liquid.vw)*h;liquid.w+=liquid.vw*h;
      liquid.vl+=(360*(liquid.tl-liquid.lift)-22*liquid.vl)*h;liquid.lift+=liquid.vl*h;
    }
    if(!liquid.scrub&&liquid.tl===1&&Math.abs(liquid.tx-liquid.x)<10)liquid.tl=0;
    markUnder();paint();
    const settled=!liquid.scrub&&Math.abs(liquid.tx-liquid.x)<.25&&Math.abs(liquid.vx)<4
      &&Math.abs(liquid.tw-liquid.w)<.25&&Math.abs(liquid.tl-liquid.lift)<.004&&Math.abs(liquid.vl)<.05;
    if(settled){
      Object.assign(liquid,{x:liquid.tx,vx:0,w:liquid.tw,vw:0,lift:liquid.tl,vl:0});
      paint();markUnder(true);return;
    }
    liquid.frame=requestAnimationFrame(step);
  }
  function sync(animate=true){
    const active=items().find(item=>item.classList.contains('is-active'));
    if(!active||!active.offsetWidth)return;
    const m=metrics(active);
    liquid.tx=m.x;liquid.tw=m.w;
    if(!animate||!liquid.ready||reduced()){
      if(liquid.frame)cancelAnimationFrame(liquid.frame);
      Object.assign(liquid,{x:liquid.tx,vx:0,w:liquid.tw,vw:0,lift:0,vl:0,tl:0,last:0,ready:true,frame:0});
      paint();markUnder(true);return;
    }
    if(Math.abs(liquid.tx-liquid.x)<.25&&Math.abs(liquid.tw-liquid.w)<.25)return;
    if(Math.abs(liquid.tx-liquid.x)>2)liquid.tl=1;
    paint();
    if(!liquid.frame){liquid.last=0;liquid.frame=requestAnimationFrame(step)}
  }
  function start(){if(liquid.frame)return;liquid.last=0;liquid.frame=requestAnimationFrame(step)}
  track.dataset[flag]='1';
  track.addEventListener('click',event=>{
    if(liquid.justScrubbed&&!liquid.allowProgrammatic){
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
  track.addEventListener('click',event=>{
    if(event.target.closest(buttonSelector))requestAnimationFrame(()=>sync(true));
  });
  track.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    const item=event.target?.closest?.(buttonSelector);
    if(!item||!item.classList.contains('is-active'))return;
    if(!liquid.ready)sync(false);
    liquid.scrub={id:event.pointerId,clientX:event.clientX,startX:event.clientX,moved:false};
    try{track.setPointerCapture(event.pointerId)}catch(_){}
    liquid.tl=1;
    if(reduced()){liquid.lift=1;paint()}else start();
  });
  track.addEventListener('pointermove',event=>{
    const scrub=liquid.scrub;
    if(!scrub||event.pointerId!==scrub.id)return;
    scrub.clientX=event.clientX;
    if(Math.abs(event.clientX-scrub.startX)>6)scrub.moved=true;
    const target=scrubTarget();
    liquid.x=target;liquid.tx=target;liquid.vx=0;liquid.tl=1;
    if(reduced())liquid.lift=1;
    markUnder();paint();
  });
  const finish=(event,cancelled)=>{
    const scrub=liquid.scrub;
    if(!scrub||event.pointerId!==scrub.id)return;
    const moved=scrub.moved;
    liquid.scrub=null;
    try{track.releasePointerCapture(event.pointerId)}catch(_){}
    liquid.tl=0;
    const target=moved&&!cancelled?nearest():null;
    if(moved&&!cancelled){
      liquid.justScrubbed=true;
      setTimeout(()=>{liquid.justScrubbed=false},0);
    }
    if(target&&!target.classList.contains('is-active')){
      navigator.vibrate?.(4);
      liquid.allowProgrammatic=true;
      try{target.click()}finally{liquid.allowProgrammatic=false}
      requestAnimationFrame(()=>sync(true));
    }else sync(!reduced());
  };
  track.addEventListener('pointerup',event=>finish(event,false));
  track.addEventListener('pointercancel',event=>finish(event,true));
  const controller={sync};
  controllers.set(track,controller);
  requestAnimationFrame(()=>sync(false));
  return controller;
}
const api={
  bindCatalog(){
    const track=document.querySelector('.catalog-mode-switch');
    if(track)track.querySelectorAll('.catalog-mode>svg,.catalog-mode>.catalog-mode-fork').forEach(node=>node.remove());
    return attach(track,'.catalog-mode','catalogLiquidBound');
  },
  bindMissing(){
    return attach(document.querySelector('#missingProductsDialog .missing-mode-switch'),'.missing-mode-button','segmentedLiquidBound');
  },
  bindSegment(track,buttonSelector){return attach(track,buttonSelector,'segmentedLiquidBound')},
  syncCatalog(animate=true){api.bindCatalog()?.sync(animate)},
  syncMissing(animate=true){api.bindMissing()?.sync(animate)}
};
window.COURSES_SEGMENTED_LIQUID=api;
function init(){
  api.bindCatalog();
  api.bindMissing();
  window.addEventListener('resize',()=>{
    requestAnimationFrame(()=>{api.syncCatalog(false);api.syncMissing(false)});
  },{passive:true});
  document.querySelector('.tab[data-view="catalog"]')?.addEventListener('click',()=>requestAnimationFrame(()=>api.syncCatalog(false)));
  document.getElementById('settingsMissingProductsBtn')?.addEventListener('click',()=>requestAnimationFrame(()=>api.syncMissing(false)));
  document.addEventListener('courses:missing-requests-rendered',()=>requestAnimationFrame(()=>api.syncMissing(true)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
