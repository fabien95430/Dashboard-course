(() => {
'use strict';

const state={x:0,vx:0,tx:0,w:0,tw:0,vw:0,lift:0,vl:0,tl:0,last:0,ready:false,frame:0,scrub:null,justScrubbed:false};
let onNavigate=null;

function reduced(){
  return Boolean(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function items(){return [...document.querySelectorAll('.tabs .tab')]}
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
  const tabs=items(),track=document.querySelector('.tabs');
  if(!track||!tabs.length||!state.scrub)return state.tx;
  const rect=track.getBoundingClientRect();
  const x=state.scrub.clientX-rect.left-track.clientLeft-state.w/2;
  const min=tabs[0].offsetLeft;
  const last=tabs[tabs.length-1];
  const max=last.offsetLeft+last.offsetWidth-state.w;
  if(x<min)return min+rubber(x-min);
  if(x>max)return max+rubber(x-max);
  return x;
}
function nearest(){
  const center=state.x+state.w/2;
  let best=null,bestDistance=Infinity;
  items().forEach(item=>{
    const distance=Math.abs(item.offsetLeft+item.offsetWidth/2-center);
    if(distance<bestDistance){bestDistance=distance;best=item}
  });
  return best;
}
function markUnder(clear=false){
  const center=state.x+state.w/2;
  items().forEach(item=>{
    const under=!clear&&state.lift>0.18&&center>=item.offsetLeft&&center<item.offsetLeft+item.offsetWidth;
    if(item.classList.contains('is-liquid-under')!==under)item.classList.toggle('is-liquid-under',under);
  });
}
function ensureLensCopies(tabs=items()){
  tabs.forEach(item=>{
    if(item.querySelector('.tab-lens-copy'))return;
    const icon=[...item.children].find(node=>node.tagName==='svg');
    const label=[...item.children].find(node=>node.tagName==='SPAN');
    if(!icon||!label)return;
    const copy=document.createElement('i');
    copy.className='tab-lens-copy';
    copy.setAttribute('aria-hidden','true');
    copy.append(icon.cloneNode(true),label.cloneNode(true));
    item.append(copy);
  });
}
function alignLensCopy(item,copy){
  const icon=[...item.children].find(node=>node.tagName==='svg');
  const label=[...item.children].find(node=>node.tagName==='SPAN');
  const copyIcon=[...copy.children].find(node=>node.tagName==='svg');
  const copyLabel=[...copy.children].find(node=>node.tagName==='SPAN');
  if(!icon||!label||!copyIcon||!copyLabel)return;
  const itemRect=item.getBoundingClientRect();
  const place=(source,target)=>{
    const rect=source.getBoundingClientRect();
    target.style.left=(rect.left-itemRect.left).toFixed(2)+'px';
    target.style.top=(rect.top-itemRect.top).toFixed(2)+'px';
    target.style.width=rect.width.toFixed(2)+'px';
    target.style.height=rect.height.toFixed(2)+'px';
  };
  const labelStyle=getComputedStyle(label);
  ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','font-kerning','font-variation-settings'].forEach(prop=>{
    const value=labelStyle.getPropertyValue(prop);
    if(value)copyLabel.style.setProperty(prop,value,'important');
  });
  place(icon,copyIcon);
  place(label,copyLabel);
}
function maskOriginalContent(item,visualLeft=null,visualRight=null){
  const itemRect=item.getBoundingClientRect();
  const sources=[...item.children].filter(node=>node.tagName==='svg'||node.tagName==='SPAN');
  sources.forEach(source=>{
    if(visualLeft===null||visualRight===null){
      source.style.webkitMaskImage='';
      source.style.maskImage='';
      return;
    }
    const rect=source.getBoundingClientRect();
    if(!rect.width)return;
    const sourceLeft=item.offsetLeft+(rect.left-itemRect.left);
    const sourceRight=sourceLeft+rect.width;
    const overlapLeft=Math.max(sourceLeft,visualLeft);
    const overlapRight=Math.min(sourceRight,visualRight);
    if(overlapRight<=overlapLeft){
      source.style.webkitMaskImage='';
      source.style.maskImage='';
      return;
    }
    const left=Math.max(0,overlapLeft-sourceLeft);
    const right=Math.min(rect.width,overlapRight-sourceLeft);
    const mask=left<=0.01&&right>=rect.width-0.01
      ?'linear-gradient(transparent,transparent)'
      :`linear-gradient(to right,#000 0,#000 ${left.toFixed(2)}px,transparent ${left.toFixed(2)}px,transparent ${right.toFixed(2)}px,#000 ${right.toFixed(2)}px,#000 100%)`;
    source.style.webkitMaskImage=mask;
    source.style.maskImage=mask;
  });
}
function paintLensContent(track,tabs,visualLeft,visualRight,lift,speed){
  ensureLensCopies(tabs);
  const moving=Boolean(state.scrub)||lift>0.035||Math.abs(state.vx)>18;
  track.classList.toggle('is-liquid-moving',moving);
  const reduce=reduced();
  const intensity=Math.min(1,Math.max(0,lift*.72+speed*.55));
  const scale=reduce?1:1+intensity*.16;
  const shift=reduce?0:Math.max(-3.5,Math.min(3.5,state.vx/360));
  track.style.setProperty('--nav-lens-content-scale',scale.toFixed(4));
  track.style.setProperty('--nav-lens-content-shift',shift.toFixed(2)+'px');
  tabs.forEach(item=>{
    const copy=item.querySelector('.tab-lens-copy');
    if(!copy)return;
    if(!moving){
      copy.style.opacity='0';
      copy.style.clipPath='inset(0 100% 0 0)';
      copy.style.webkitClipPath='inset(0 100% 0 0)';
      maskOriginalContent(item);
      return;
    }
    alignLensCopy(item,copy);
    const itemLeft=item.offsetLeft;
    const itemRight=itemLeft+item.offsetWidth;
    const overlapLeft=Math.max(itemLeft,visualLeft);
    const overlapRight=Math.min(itemRight,visualRight);
    if(overlapRight<=overlapLeft){
      copy.style.opacity='0';
      maskOriginalContent(item);
      return;
    }
    maskOriginalContent(item,visualLeft,visualRight);
    const clipLeft=Math.max(0,overlapLeft-itemLeft);
    const clipRight=Math.max(0,itemRight-overlapRight);
    const clip=`inset(0 ${clipRight.toFixed(2)}px 0 ${clipLeft.toFixed(2)}px)`;
    copy.style.clipPath=clip;
    copy.style.webkitClipPath=clip;
    copy.style.opacity='1';
  });
}
function paint(){
  const track=document.querySelector('.tabs');
  if(!track)return;
  const lift=Math.max(-0.12,Math.min(1.12,state.lift));
  const speed=Math.min(1,Math.abs(state.vx)/1700);
  const tabs=items();
  if(!tabs.length||!state.w)return;
  const minLeft=tabs[0].offsetLeft;
  const last=tabs[tabs.length-1];
  const maxRight=last.offsetLeft+last.offsetWidth;
  const lensW=state.w*0.84;
  const lensX=state.x+(state.w-lensW)/2;
  const box=contain(lensX,lensW,1+lift*0.08+speed*0.22,minLeft,maxRight);
  const sy=1+lift*0.09-speed*0.03;
  const visualWidth=lensW*box.sx;
  const visualLeft=box.x+(lensW-visualWidth)/2;
  const visualRight=visualLeft+visualWidth;
  track.style.setProperty('--nav-liquid-x',box.x.toFixed(2)+'px');
  track.style.setProperty('--nav-liquid-w',lensW.toFixed(2)+'px');
  track.style.setProperty('--nav-liquid-sx',box.sx.toFixed(4));
  track.style.setProperty('--nav-liquid-sy',sy.toFixed(4));
  track.style.setProperty('--nav-liquid-lift',Math.max(0,Math.min(1,lift)).toFixed(3));
  paintLensContent(track,tabs,visualLeft,visualRight,Math.max(0,Math.min(1,lift)),speed);
}
function step(time){
  state.frame=0;
  const track=document.querySelector('.tabs');
  if(!track||!track.isConnected)return;
  const dt=state.last?Math.min(0.032,Math.max(0.001,(time-state.last)/1000)):1/60;
  state.last=time;
  if(state.scrub){
    state.tx=scrubTarget();
    state.tl=1;
  }
  const steps=Math.max(1,Math.ceil(dt/0.008));
  const h=dt/steps;
  for(let i=0;i<steps;i+=1){
    state.vx+=(250*(state.tx-state.x)-24*state.vx)*h;
    state.x+=state.vx*h;
    state.vw+=(250*(state.tw-state.w)-24*state.vw)*h;
    state.w+=state.vw*h;
    state.vl+=(360*(state.tl-state.lift)-22*state.vl)*h;
    state.lift+=state.vl*h;
  }
  if(!state.scrub&&state.tl===1&&Math.abs(state.tx-state.x)<10)state.tl=0;
  markUnder();
  paint();
  const settled=!state.scrub&&Math.abs(state.tx-state.x)<0.25&&Math.abs(state.vx)<4
    &&Math.abs(state.tw-state.w)<0.25&&Math.abs(state.tl-state.lift)<0.004&&Math.abs(state.vl)<0.05;
  if(settled){
    Object.assign(state,{x:state.tx,vx:0,w:state.tw,vw:0,lift:state.tl,vl:0});
    paint();
    markUnder(true);
    return;
  }
  state.frame=requestAnimationFrame(step);
}
function sync(animate=true){
  const active=document.querySelector('.tabs .tab.is-active');
  if(!active||!active.offsetWidth)return;
  state.tx=active.offsetLeft;
  state.tw=active.offsetWidth;
  if(!animate||!state.ready||reduced()){
    if(state.frame)cancelAnimationFrame(state.frame);
    Object.assign(state,{x:state.tx,vx:0,w:state.tw,vw:0,lift:0,vl:0,tl:0,last:0,ready:true,frame:0});
    paint();
    markUnder(true);
    return;
  }
  if(Math.abs(state.tx-state.x)<0.25&&Math.abs(state.tw-state.w)<0.25)return;
  if(Math.abs(state.tx-state.x)>2)state.tl=1;
  if(!state.frame){
    state.last=0;
    state.frame=requestAnimationFrame(step);
  }
}
function start(){
  if(state.frame)return;
  state.last=0;
  state.frame=requestAnimationFrame(step);
}
function bind(navigate){
  if(typeof navigate==='function')onNavigate=navigate;
  const track=document.querySelector('.tabs');
  if(!track||track.dataset.liquidBound==='1')return;
  track.dataset.liquidBound='1';
  track.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    const item=event.target?.closest?.('.tab');
    if(!item||!item.classList.contains('is-active'))return;
    if(!state.ready)sync(false);
    state.scrub={id:event.pointerId,clientX:event.clientX,startX:event.clientX,moved:false};
    try{track.setPointerCapture(event.pointerId)}catch(_){}
    state.tl=1;
    if(reduced()){
      state.lift=1;
      paint();
    }else{
      start();
    }
  });
  track.addEventListener('pointermove',event=>{
    const scrub=state.scrub;
    if(!scrub||event.pointerId!==scrub.id)return;
    scrub.clientX=event.clientX;
    if(Math.abs(event.clientX-scrub.startX)>6)scrub.moved=true;
    if(reduced()){
      state.x=scrubTarget();
      markUnder();
      paint();
    }else{
      start();
    }
  });
  const finish=(event,cancelled)=>{
    const scrub=state.scrub;
    if(!scrub||event.pointerId!==scrub.id)return;
    const moved=scrub.moved;
    state.scrub=null;
    try{track.releasePointerCapture(event.pointerId)}catch(_){}
    state.tl=0;
    const target=moved&&!cancelled?nearest():null;
    if(moved&&!cancelled){
      state.justScrubbed=true;
      setTimeout(()=>{state.justScrubbed=false},0);
    }
    if(target&&!target.classList.contains('is-active')){
      onNavigate?.(target.dataset.view||'list');
    }else{
      sync(!reduced());
    }
  };
  track.addEventListener('pointerup',event=>finish(event,false));
  track.addEventListener('pointercancel',event=>finish(event,true));
  window.addEventListener('resize',()=>sync(false),{passive:true});
}
function shouldIgnoreClick(){return state.justScrubbed}

window.COURSES_BOTTOM_NAV=Object.freeze({bind,sync,shouldIgnoreClick});
})();
