(() => {
'use strict';

let track=null;
const liquid={x:0,vx:0,tx:0,w:0,tw:0,vw:0,lift:0,vl:0,tl:0,last:0,ready:false,frame:0,scrub:null,justScrubbed:false,allowProgrammatic:false};

function reduced(){return Boolean(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function items(){return track?[...track.querySelectorAll('.catalog-mode')]:[]}
function trackOrigin(){
  if(!track)return 0;
  const rect=track.getBoundingClientRect();
  return rect.left+track.clientLeft;
}
function itemMetrics(item){
  const rect=item.getBoundingClientRect();
  return {x:rect.left-trackOrigin(),w:rect.width};
}
function sourceLabel(item){return [...item.children].find(node=>node.tagName==='SPAN')||null}
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
  const x=liquid.scrub.clientX-trackOrigin()-liquid.w/2;
  const first=itemMetrics(list[0]);
  const last=itemMetrics(list[list.length-1]);
  const min=first.x;
  const max=last.x+last.w-liquid.w;
  if(x<min)return min+rubber(x-min);
  if(x>max)return max+rubber(x-max);
  return x;
}
function nearest(){
  const center=liquid.x+liquid.w/2;
  let best=null,bestDistance=Infinity;
  items().forEach(item=>{
    const metrics=itemMetrics(item);
    const distance=Math.abs(metrics.x+metrics.w/2-center);
    if(distance<bestDistance){bestDistance=distance;best=item}
  });
  return best;
}
function markUnder(clear=false){
  const center=liquid.x+liquid.w/2;
  items().forEach(item=>{
    const metrics=itemMetrics(item);
    const under=!clear&&liquid.lift>0.18&&center>=metrics.x&&center<metrics.x+metrics.w;
    if(item.classList.contains('is-liquid-under')!==under)item.classList.toggle('is-liquid-under',under);
  });
}
function ensureLensCopies(list=items()){
  list.forEach(item=>{
    const exists=[...item.children].some(node=>node.classList?.contains('catalog-mode-lens-copy'));
    if(exists)return;
    const label=sourceLabel(item);
    if(!label)return;
    const copy=document.createElement('i');
    copy.className='catalog-mode-lens-copy';
    copy.setAttribute('aria-hidden','true');
    copy.append(label.cloneNode(true));
    item.append(copy);
  });
}
function alignLensCopy(item,copy){
  const label=sourceLabel(item);
  const copyLabel=copy.querySelector('span');
  if(!label||!copyLabel)return;
  const itemRect=item.getBoundingClientRect();
  const rect=label.getBoundingClientRect();
  copyLabel.style.left=(rect.left-itemRect.left).toFixed(2)+'px';
  copyLabel.style.top=(rect.top-itemRect.top).toFixed(2)+'px';
  copyLabel.style.width=rect.width.toFixed(2)+'px';
  copyLabel.style.height=rect.height.toFixed(2)+'px';
  const labelStyle=getComputedStyle(label);
  ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','font-kerning','font-variation-settings'].forEach(prop=>{
    const value=labelStyle.getPropertyValue(prop);
    if(value)copyLabel.style.setProperty(prop,value,'important');
  });
}
function maskOriginalLabel(item,visualLeft=null,visualRight=null){
  const label=sourceLabel(item);
  if(!label)return;
  if(visualLeft===null||visualRight===null){
    label.style.webkitMaskImage='';
    label.style.maskImage='';
    return;
  }
  const rect=label.getBoundingClientRect();
  if(!rect.width)return;
  const sourceLeft=rect.left-trackOrigin();
  const sourceRight=sourceLeft+rect.width;
  const overlapLeft=Math.max(sourceLeft,visualLeft);
  const overlapRight=Math.min(sourceRight,visualRight);
  if(overlapRight<=overlapLeft){
    label.style.webkitMaskImage='';
    label.style.maskImage='';
    return;
  }
  const left=Math.max(0,overlapLeft-sourceLeft);
  const right=Math.min(rect.width,overlapRight-sourceLeft);
  const mask=left<=0.01&&right>=rect.width-0.01
    ?'linear-gradient(transparent,transparent)'
    :`linear-gradient(to right,#000 0,#000 ${left.toFixed(2)}px,transparent ${left.toFixed(2)}px,transparent ${right.toFixed(2)}px,#000 ${right.toFixed(2)}px,#000 100%)`;
  label.style.webkitMaskImage=mask;
  label.style.maskImage=mask;
}
function paintLensContent(list,visualLeft,visualRight,lift,speed){
  ensureLensCopies(list);
  const moving=Boolean(liquid.scrub)||lift>0.035||Math.abs(liquid.vx)>18;
  track.classList.toggle('is-liquid-moving',moving);
  const intensity=Math.min(1,Math.max(0,lift*.72+speed*.55));
  const scale=reduced()?1:1+intensity*.16;
  const shift=reduced()?0:Math.max(-3.5,Math.min(3.5,liquid.vx/360));
  track.style.setProperty('--catalog-lens-content-scale',scale.toFixed(4));
  track.style.setProperty('--catalog-lens-content-shift',shift.toFixed(2)+'px');
  list.forEach(item=>{
    const copy=[...item.children].find(node=>node.classList?.contains('catalog-mode-lens-copy'));
    if(!copy)return;
    if(!moving){
      copy.style.opacity='0';
      copy.style.clipPath='inset(0 100% 0 0)';
      copy.style.webkitClipPath='inset(0 100% 0 0)';
      maskOriginalLabel(item);
      return;
    }
    alignLensCopy(item,copy);
    const metrics=itemMetrics(item);
    const itemLeft=metrics.x;
    const itemRight=itemLeft+metrics.w;
    const overlapLeft=Math.max(itemLeft,visualLeft);
    const overlapRight=Math.min(itemRight,visualRight);
    if(overlapRight<=overlapLeft){
      copy.style.opacity='0';
      maskOriginalLabel(item);
      return;
    }
    maskOriginalLabel(item,visualLeft,visualRight);
    const clipLeft=Math.max(0,overlapLeft-itemLeft);
    const clipRight=Math.max(0,itemRight-overlapRight);
    const clip=`inset(0 ${clipRight.toFixed(2)}px 0 ${clipLeft.toFixed(2)}px)`;
    copy.style.clipPath=clip;
    copy.style.webkitClipPath=clip;
    copy.style.opacity='1';
  });
}
function paint(){
  if(!track)return;
  const lift=Math.max(-0.12,Math.min(1.12,liquid.lift));
  const speed=Math.min(1,Math.abs(liquid.vx)/1700);
  const list=items();
  if(!list.length||!liquid.w)return;
  const first=itemMetrics(list[0]);
  const last=itemMetrics(list[list.length-1]);
  const minLeft=first.x;
  const maxRight=last.x+last.w;
  const lensW=liquid.w*0.84;
  const lensX=liquid.x+(liquid.w-lensW)/2;
  const box=contain(lensX,lensW,1+lift*0.08+speed*0.22,minLeft,maxRight);
  const sy=1+lift*0.09-speed*0.03;
  const visualWidth=lensW*box.sx;
  const visualLeft=box.x+(lensW-visualWidth)/2;
  const visualRight=visualLeft+visualWidth;
  track.style.setProperty('--catalog-lens-x',box.x.toFixed(2)+'px');
  track.style.setProperty('--catalog-lens-w',lensW.toFixed(2)+'px');
  track.style.setProperty('--catalog-liquid-sx',box.sx.toFixed(4));
  track.style.setProperty('--catalog-liquid-sy',sy.toFixed(4));
  track.style.setProperty('--catalog-liquid-lift',Math.max(0,Math.min(1,lift)).toFixed(3));
  paintLensContent(list,visualLeft,visualRight,Math.max(0,Math.min(1,lift)),speed);
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
  const metrics=itemMetrics(active);
  liquid.tx=metrics.x;
  liquid.tw=metrics.w;
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
    if(!liquid.allowProgrammatic&&Math.abs(itemMetrics(button).x-liquid.tx)>2)navigator.vibrate?.(4);
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
  ensureLensCopies();
  bind();
  window.addEventListener('resize',()=>requestAnimationFrame(()=>sync(false)),{passive:true});
  document.querySelector('.tab[data-view="catalog"]')?.addEventListener('click',()=>requestAnimationFrame(()=>sync(false)));
  requestAnimationFrame(()=>sync(false));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
