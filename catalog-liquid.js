(() => {
'use strict';

let track=null;
const liquid={x:0,vx:0,tx:0,w:0,tw:0,vw:0,lift:0,vl:0,tl:0,last:0,ready:false,frame:0,scrub:null,justScrubbed:false,allowProgrammatic:false};

function reduced(){return Boolean(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function items(){return track?[...track.querySelectorAll('.catalog-mode')]:[]}
function contain(x,w,sx,minLeft,maxRight){
  const room=Math.max(1,maxRight-minLeft);
  let visual=w*sx;
  const overshootLeft=Math.max(0,minLeft-x);
  const overshootRight=Math.max(0,x+w-maxRight);
  visual-=(overshootLeft+overshootRight)*0.6;
  visual=Math.max(w*0.72,Math.min(visual,room));
  let center=x+w/2;
  center=Math.max(minLeft+visual/2,Math.min(maxRight-visual/2,center));
  return {x:center-w/2,sx:visual/w};
}
function rubber(distance,dimension=60){
  const d=Math.abs(distance);
  return Math.sign(distance)*(1-1/(d*0.55/dimension+1))*dimension;
}
function scrubTarget(){
  const list=items();
  if(!track||!list.length||!liquid.scrub)return liquid.tx;
  const rect=track.getBoundingClientRect();
  const x=liquid.scrub.clientX-rect.left-track.clientLeft-liquid.w/2;
  const min=list[0].offsetLeft;
  const last=list[list.length-1];
  const max=last.offsetLeft+last.offsetWidth-liquid.w;
  if(x<min)return min+rubber(x-min);
  if(x>max)return max+rubber(x-max);
  return x;
}
function nearest(){
  const center=liquid.x+liquid.w/2;
  let best=null,bestDistance=Infinity;
  items().forEach(item=>{
    const distance=Math.abs(item.offsetLeft+item.offsetWidth/2-center);
    if(distance<bestDistance){bestDistance=distance;best=item}
  });
  return best;
}
function markUnder(clear=false){
  const center=liquid.x+liquid.w/2;
  items().forEach(item=>{
    const under=!clear&&liquid.lift>0.18&&center>=item.offsetLeft&&center<item.offsetLeft+item.offsetWidth;
    if(item.classList.contains('is-liquid-under')!==under)item.classList.toggle('is-liquid-under',under);
  });
}
function paint(){
  if(!track)return;
  const lift=Math.max(-0.12,Math.min(1.12,liquid.lift));
  const speed=Math.min(1,Math.abs(liquid.vx)/1700);
  const list=items();
  if(!list.length||!liquid.w)return;
  const minLeft=list[0].offsetLeft;
  const last=list[list.length-1];
  const maxRight=last.offsetLeft+last.offsetWidth;
  const lensW=liquid.w*0.84;
  const lensX=liquid.x+(liquid.w-lensW)/2;
  const box=contain(lensX,lensW,1+lift*0.08+speed*0.22,minLeft,maxRight);
  const sy=1+lift*0.09-speed*0.03;
  track.style.setProperty('--catalog-lens-x',box.x.toFixed(2)+'px');
  track.style.setProperty('--catalog-lens-w',lensW.toFixed(2)+'px');
  track.style.setProperty('--catalog-liquid-sx',box.sx.toFixed(4));
  track.style.setProperty('--catalog-liquid-sy',sy.toFixed(4));
  track.style.setProperty('--catalog-liquid-lift',Math.max(0,Math.min(1,lift)).toFixed(3));
  const moving=Boolean(liquid.scrub)||lift>0.035||Math.abs(liquid.vx)>18;
  track.classList.toggle('is-liquid-moving',moving);
}
function step(time){
  liquid.frame=0;
  if(!track||!track.isConnected)return;
  const dt=liquid.last?Math.min(0.032,Math.max(0.001,(time-liquid.last)/1000)):1/60;
  liquid.last=time;
  if(liquid.scrub){
    liquid.tx=scrubTarget();
    liquid.tl=1;
  }
  const steps=Math.max(1,Math.ceil(dt/0.008));
  const h=dt/steps;
  for(let i=0;i<steps;i+=1){
    liquid.vx+=(250*(liquid.tx-liquid.x)-24*liquid.vx)*h;
    liquid.x+=liquid.vx*h;
    liquid.vw+=(250*(liquid.tw-liquid.w)-24*liquid.vw)*h;
    liquid.w+=liquid.vw*h;
    liquid.vl+=(360*(liquid.tl-liquid.lift)-22*liquid.vl)*h;
    liquid.lift+=liquid.vl*h;
  }
  if(!liquid.scrub&&liquid.tl===1&&Math.abs(liquid.tx-liquid.x)<10)liquid.tl=0;
  markUnder();
  paint();
  const settled=!liquid.scrub&&Math.abs(liquid.tx-liquid.x)<0.25&&Math.abs(liquid.vx)<4
    &&Math.abs(liquid.tw-liquid.w)<0.25&&Math.abs(liquid.tl-liquid.lift)<0.004&&Math.abs(liquid.vl)<0.05;
  if(settled){
    Object.assign(liquid,{x:liquid.tx,vx:0,w:liquid.tw,vw:0,lift:liquid.tl,vl:0});
    paint();
    markUnder(true);
    return;
  }
  liquid.frame=requestAnimationFrame(step);
}
function sync(animate=true){
  if(!track)return;
  const active=track.querySelector('.catalog-mode.is-active');
  if(!active||!active.offsetWidth)return;
  liquid.tx=active.offsetLeft;
  liquid.tw=active.offsetWidth;
  if(!animate||!liquid.ready||reduced()){
    if(liquid.frame)cancelAnimationFrame(liquid.frame);
    Object.assign(liquid,{x:liquid.tx,vx:0,w:liquid.tw,vw:0,lift:0,vl:0,tl:0,last:0,ready:true,frame:0});
    paint();
    markUnder(true);
    return;
  }
  if(Math.abs(liquid.tx-liquid.x)<0.25&&Math.abs(liquid.tw-liquid.w)<0.25)return;
  if(Math.abs(liquid.tx-liquid.x)>2)liquid.tl=1;
  paint();
  if(!liquid.frame){
    liquid.last=0;
    liquid.frame=requestAnimationFrame(step);
  }
}
function start(){
  if(liquid.frame)return;
  liquid.last=0;
  liquid.frame=requestAnimationFrame(step);
}
function bind(){
  if(!track||track.dataset.catalogLiquidBound==='1')return;
  track.dataset.catalogLiquidBound='1';
  track.addEventListener('click',event=>{
    if(liquid.justScrubbed&&!liquid.allowProgrammatic){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);
  items().forEach(button=>button.addEventListener('click',()=>{
    if(liquid.justScrubbed&&!liquid.allowProgrammatic)return;
    if(!liquid.allowProgrammatic&&Math.abs(button.offsetLeft-liquid.tx)>2)navigator.vibrate?.(4);
    sync(true);
  }));
  track.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    const item=event.target?.closest?.('.catalog-mode');
    if(!item||!item.classList.contains('is-active'))return;
    if(!liquid.ready)sync(false);
    liquid.scrub={id:event.pointerId,clientX:event.clientX,startX:event.clientX,moved:false};
    try{track.setPointerCapture(event.pointerId)}catch(_){}
    liquid.tl=1;
    if(reduced()){
      liquid.lift=1;
      paint();
    }else{
      start();
    }
  });
  track.addEventListener('pointermove',event=>{
    const scrub=liquid.scrub;
    if(!scrub||event.pointerId!==scrub.id)return;
    scrub.clientX=event.clientX;
    if(Math.abs(event.clientX-scrub.startX)>6)scrub.moved=true;
    if(reduced()){
      liquid.x=scrubTarget();
      markUnder();
      paint();
    }else{
      start();
    }
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
    }else{
      sync(!reduced());
    }
  };
  track.addEventListener('pointerup',event=>finish(event,false));
  track.addEventListener('pointercancel',event=>finish(event,true));
}
function init(){
  track=document.querySelector('.catalog-mode-switch');
  if(!track)return;
  track.querySelectorAll('.catalog-mode>svg,.catalog-mode>.catalog-mode-fork').forEach(node=>node.remove());
  bind();
  window.addEventListener('resize',()=>requestAnimationFrame(()=>sync(false)),{passive:true});
  document.querySelector('.tab[data-view="catalog"]')?.addEventListener('click',()=>requestAnimationFrame(()=>sync(false)));
  requestAnimationFrame(()=>sync(false));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
