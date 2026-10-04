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

(() => {
'use strict';

const STORAGE_SERVINGS='courses-dish-servings-v1';
const BASE_SERVINGS=4;
const MIN_SERVINGS=1;
const MAX_SERVINGS=12;
const RECIPE_QUANTITIES=Object.freeze({
  'Spaghetti carbonara':{'Œufs':4},
  'Spaghetti bolognaise':{'Oignons jaunes':2},
  'Penne poulet crème':{'Poulet':4},
  'Pâtes tomate mozzarella':{'Mozzarella':2,'Tomates':3},
  'Lasagnes bolognaise':{'Oignons jaunes':2},
  'Tagliatelles au saumon':{'Saumon':4,'Citron':1},
  'Pâtes pesto poulet':{'Poulet':4},
  'Penne chorizo poivrons':{'Poivrons':2},
  'Burger maison':{'Pains burger':4,'Steaks hachés':4,'Tomates':2,'Oignons rouges':1},
  'Tacos bœuf':{'Galettes de blé':8,'Tomates':2,'Avocat':2},
  'Chili con carne':{'Oignons jaunes':2},
  'Couscous merguez':{'Merguez':8,'Carottes':4,'Courgettes':2},
  'Steak pommes de terre':{'Steaks hachés':4,'Pommes de terre':8},
  'Saucisses pommes de terre':{'Saucisses':4,'Pommes de terre':8,'Oignons jaunes':2},
  'Tartiflette':{'Pommes de terre':8,'Oignons jaunes':2},
  'Raclette':{'Pommes de terre':8},
  'Poulet curry':{'Poulet':4,'Oignons jaunes':2},
  'Poulet riz légumes':{'Poulet':4,'Poivrons':2,'Courgettes':2,'Carottes':2},
  'Wrap poulet crudités':{'Wraps':4,'Poulet':4,'Tomates':2,'Avocat':2},
  'Poulet crème champignons':{'Poulet':4},
  'Salade César':{'Poulet':4,'Œufs':2},
  'Poulet tomate mozzarella':{'Escalopes de poulet':4,'Mozzarella':2,'Tomates':4},
  'Poulet brocoli riz':{'Poulet':4,'Brocoli':2},
  'Fajitas poulet':{'Galettes de blé':8,'Poulet':4,'Poivrons':3,'Oignons rouges':2,'Avocat':2},
  'Saumon riz brocoli':{'Saumon':4,'Brocoli':2},
  'Cabillaud pommes de terre':{'Cabillaud':4,'Pommes de terre':8,'Citron':1},
  'Crevettes nouilles asiatiques':{'Poivrons':2,'Carottes':2},
  'Salade saumon avocat':{'Avocat':2,'Tomates':2,'Citron':1},
  'Salade thon riz maïs':{'Tomates':3,'Concombres':1},
  'Moules frites':{},
  'Hot-dog':{'Pains hot-dog':4,'Saucisses':4,'Oignons jaunes':2},
  'Omelette jambon fromage':{'Œufs':6,'Jambon blanc':4},
  'Croque-monsieur':{'Pain de mie':8,'Jambon blanc':4,'Emmental':4},
  'Pizza wrap':{'Wraps':4,'Mozzarella':2,'Jambon blanc':4},
  'Bruschetta tomate mozzarella':{'Baguette':2,'Tomates':4,'Mozzarella':2},
  'Sandwich poulet':{'Pain':4,'Blanc de poulet':4,'Tomates':2},
  'Curry pois chiches':{},
  'Buddha bowl quinoa':{'Avocat':2,'Carottes':2,'Concombres':1},
  'Gratin de courgettes':{'Courgettes':4,'Œufs':3},
  'Ratatouille':{'Tomates':4,'Courgettes':2,'Aubergines':2,'Poivrons':2,'Oignons jaunes':2},
  'Salade chèvre noix':{'Tomates':2},
  'Pâtes pesto mozzarella':{'Mozzarella':2,'Tomates':3},
  'Chili sin carne':{'Poivrons':2,'Oignons jaunes':2},
  'Riz champignons parmesan':{},
  'Poulet parmesan tomate':{'Escalopes de poulet':4,'Mozzarella':2},
  'Poulet miel moutarde':{'Poulet':4},
  'Poulet teriyaki riz':{'Poulet':4,'Gingembre':1},
  'Poulet paprika crème':{'Poulet':4,'Oignons jaunes':1},
  'Poulet pommes de terre au four':{'Poulet':4,'Pommes de terre':8,'Oignons jaunes':2},
  'Riz poulet curry coco':{'Poulet':4},
  'Riz sauté poulet légumes':{'Poulet':4,'Poivrons':2,'Carottes':2,'Œufs':2},
  'Riz crevettes légumes':{'Poivrons':2,'Carottes':2,'Œufs':2},
  'Bœuf riz poivrons':{'Poivrons':2,'Oignons jaunes':2},
  'Bœuf sauce tomate pommes de terre':{'Pommes de terre':8,'Oignons jaunes':2,'Carottes':2},
  'Hachis parmentier':{'Pommes de terre':8,'Oignons jaunes':2},
  'Boulettes sauce tomate':{'Œufs':1,'Oignons jaunes':1},
  'Gratin pommes de terre jambon':{'Pommes de terre':8,'Jambon blanc':4},
  'Gratin brocoli poulet':{'Brocoli':2,'Poulet':4},
  'Quiche lorraine':{'Œufs':3},
  'Quiche poireaux chèvre':{'Poireaux':3,'Œufs':3},
  'Tarte tomate mozzarella':{'Tomates':5,'Mozzarella':1},
  'Salade poulet avocat':{'Poulet':4,'Avocat':2,'Tomates':2},
  'Salade César saumon':{'Saumon':4,'Œufs':2},
  'Salade mozzarella avocat':{'Mozzarella':2,'Avocat':2,'Tomates':3},
  'Saumon pommes de terre':{'Saumon':4,'Pommes de terre':8,'Citron':1},
  'Saumon crème épinards':{'Saumon':4},
  'Cabillaud riz légumes':{'Cabillaud':4,'Poivrons':2,'Courgettes':2,'Carottes':2},
  'Crevettes curry coco':{},
  'Poêlée pommes de terre saucisses':{'Saucisses':4,'Pommes de terre':8,'Oignons jaunes':2},
  'Poêlée poulet courgettes':{'Poulet':4,'Courgettes':3,'Oignons jaunes':1,'Ail':2},
  'Croque poulet fromage':{'Pain de mie':8,'Blanc de poulet':4,'Emmental':4},
  'Boulettes riz':{'Œufs':1},
  'Coquillettes jambon':{'Jambon blanc':2},
  'Couscous poulet légumes':{'Poulet':2,'Carottes':2,'Courgettes':1},
  'Gratin pommes de terre':{'Pommes de terre':4},
  'Pâtes jambon':{'Jambon blanc':2},
  'Purée carotte poulet':{'Pommes de terre':4,'Carottes':4,'Poulet':2},
  'Risotto poulet':{'Poulet':2},
  'Saumon brocoli':{'Saumon':2,'Brocoli':1},
  'Steak frites':{'Steaks hachés':2},
  'Velouté carottes':{'Carottes':6,'Pommes de terre':2,'Oignons jaunes':1}
});

// Un multiplicateur correspond à une unité réellement achetée dans le catalogue.
// Les quantités de recette ci-dessus restent des unités culinaires (tranches, pièces, etc.).
const PURCHASE_PACK_SIZE=Object.freeze({
  'Œufs':6,
  'Poulet':4,
  'Pains burger':4,
  'Pains hot-dog':4,
  'Wraps':6,
  'Galettes de blé':8,
  'Jambon blanc':4,
  'Pain de mie':12,
  'Emmental':8,
  'Blanc de poulet':4,
  'Pain':4,
  'Ail':8,
  'Gingembre':3
});

// Quand une recette n'a pas de quantité en pièces, une unité d'achat couvre
// généralement ce nombre de portions avant de proposer ×2, ×3, etc.
const PURCHASE_SERVINGS=Object.freeze({
  'Spaghetti':5,'Penne':5,'Coquillettes':5,'Tagliatelles':5,'Lasagnes':4,
  'Riz basmati':5,'Riz long':5,'Quinoa':5,'Couscous':5,'Nouilles chinoises':4,
  'Crème fraîche':6,'Parmesan':6,'Fromage râpé':6,'Emmental':8,
  'Sauce tomate':6,'Pesto':6,'Sauce soja':12,'Miel':12,'Moutarde':12,'Curry':12,
  'Lait de coco':4,'Tomates pelées':4,'Haricots rouges':4,'Pois chiches':4,'Maïs en boîte':4,'Thon en boîte':4,
  'Frites surgelées':4,'Haricots verts':4,'Épinards':4,'Champignons':4,'Salade verte':4,
  'Farine':12,'Beurre':8,'Lait':8,'Chapelure':12,'Croûtons':6,'Basilic':8,'Romarin frais':8,
  'Viande hachée':4,'Bœuf':4,'Crevettes':4,'Moules':4,'Saumon fumé':4,
  'Lardons':4,'Chorizo':4,'Jambon blanc':4,'Jambon cru':4,'Rosette':4,
  'Raclette':4,'Reblochon':4,'Chèvre':4
});

let dialog=null;
let list=null;
let confirmButton=null;
let searchInput=null;
let productsGrid=null;
let catalogView=null;
let servings=readServings();
let servingsInput=null;
let pending=false;
let lastUserQuery='';
let toastTimer=0;

function clampServings(value){
  const number=Math.round(Number(value)||BASE_SERVINGS);
  return Math.max(MIN_SERVINGS,Math.min(MAX_SERVINGS,number));
}
function readServings(){
  try{return clampServings(localStorage.getItem(STORAGE_SERVINGS)||BASE_SERVINGS)}catch(_){return BASE_SERVINGS}
}
function saveServings(){
  try{localStorage.setItem(STORAGE_SERVINGS,String(servings))}catch(_){}
}
function dishName(){return dialog?.querySelector('.dish-sheet-head h2')?.textContent?.trim()||''}
function ingredientQuantity(name){
  const base=Number(RECIPE_QUANTITIES[dishName()]?.[name]);
  if(Number.isFinite(base)&&base>0){
    const packSize=Math.max(1,Number(PURCHASE_PACK_SIZE[name])||1);
    return Math.max(1,Math.ceil((base*servings/BASE_SERVINGS)/packSize));
  }
  const coveredServings=Math.max(1,Number(PURCHASE_SERVINGS[name])||BASE_SERVINGS);
  return Math.max(1,Math.ceil(servings/coveredServings));
}
function applyQuantities(){
  if(!list)return;
  list.querySelectorAll('.dish-ingredient').forEach(row=>{
    const name=row.dataset.ingredient||'';
    const quantity=ingredientQuantity(name);
    row.dataset.recipeQuantity=String(quantity);
    const badge=row.querySelector('.dish-ingredient-check');
    if(badge){
      badge.textContent=String(quantity);
      badge.setAttribute('aria-label',quantity+' à acheter');
    }
  });
}
function setServings(next){
  servings=clampServings(next);
  saveServings();
  if(servingsInput)servingsInput.value=String(servings);
  applyQuantities();
  navigator.vibrate?.(4);
}
function buildServingsControl(){
  const head=dialog?.querySelector('.dish-sheet-head');
  if(!head||head.querySelector('.dish-servings'))return;
  const block=document.createElement('div');
  block.className='dish-servings';
  block.innerHTML='<strong>Nombre de personnes</strong><div class="dish-servings-control"><button type="button" class="dish-servings-step" data-step="-1" aria-label="Retirer une personne">−</button><input class="dish-servings-value" type="number" inputmode="numeric" min="1" max="12" step="1" aria-label="Nombre de personnes"><button type="button" class="dish-servings-step" data-step="1" aria-label="Ajouter une personne">+</button></div>';
  head.appendChild(block);
  servingsInput=block.querySelector('.dish-servings-value');
  servingsInput.value=String(servings);
  block.querySelectorAll('.dish-servings-step').forEach(button=>button.addEventListener('click',()=>setServings(servings+Number(button.dataset.step||0))));
  servingsInput.addEventListener('input',()=>{
    const value=Number(servingsInput.value);
    if(Number.isFinite(value)&&value>=MIN_SERVINGS&&value<=MAX_SERVINGS){
      servings=Math.round(value);
      saveServings();
      applyQuantities();
    }
  });
  servingsInput.addEventListener('change',()=>setServings(servingsInput.value));
  servingsInput.addEventListener('blur',()=>setServings(servingsInput.value));
}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}
function setProductQuery(value){
  searchInput.value=value;
  searchInput.dispatchEvent(new Event('input',{bubbles:true}));
}
function currentCard(name){return [...productsGrid.querySelectorAll('.product')].find(card=>card.dataset.name===name)||null}
function waitForQuantity(name,before,timeout=14000){
  return new Promise(resolve=>{
    const started=Date.now();
    let observer=null;
    let timer=0;
    let done=false;
    const finish=value=>{
      if(done)return;
      done=true;
      observer?.disconnect();
      clearTimeout(timer);
      resolve(value);
    };
    const check=()=>{
      const card=currentCard(name);
      const quantity=Number(card?.dataset.quantity||0);
      if(quantity>before){finish(quantity);return true}
      if(Date.now()-started>=timeout){finish(quantity);return true}
      return false;
    };
    if(check())return;
    observer=new MutationObserver(()=>{check()});
    observer.observe(productsGrid,{subtree:true,childList:true,attributes:true,attributeFilter:['data-quantity']});
    timer=setTimeout(()=>finish(Number(currentCard(name)?.dataset.quantity||0)),timeout);
  });
}
async function waitForThumbRestore(timeout=2600){
  const started=Date.now();
  while(Date.now()-started<timeout){
    if(searchInput.value===lastUserQuery){await nextPaint();return}
    await new Promise(resolve=>setTimeout(resolve,60));
  }
}
async function ensureIngredient(name,target){
  setProductQuery(name);
  await nextPaint();
  let card=currentCard(name);
  if(!card)return {added:0,failed:1,present:0};
  let quantity=Math.max(0,Number(card.dataset.quantity)||0);
  if(quantity>=target)return {added:0,failed:0,present:1};
  let added=0;
  while(quantity<target){
    card=currentCard(name);
    const button=card?.querySelector('.badge');
    if(!button)return {added,failed:1,present:0};
    const before=quantity;
    button.click();
    const next=await waitForQuantity(name,before);
    if(next<=before)return {added,failed:1,present:0};
    added+=next-before;
    quantity=next;
  }
  return {added,failed:0,present:0};
}
function showToast(message){
  const toast=document.getElementById('toast');
  if(!toast)return;
  clearTimeout(toastTimer);
  toast.textContent=message;
  toast.classList.add('is-visible');
  toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
}
async function addSelectedQuantities(event){
  if(pending||confirmButton.disabled)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const rows=[...list.querySelectorAll('.dish-ingredient[aria-pressed="true"]')];
  if(!rows.length)return;
  pending=true;
  confirmButton.classList.add('is-busy');
  confirmButton.disabled=true;
  const label=confirmButton.querySelector('span');
  if(label)label.textContent='Ajout en cours…';
  const tasks=rows.map(row=>({name:row.dataset.ingredient||'',target:ingredientQuantity(row.dataset.ingredient||'')}));
  const title=dishName();
  await waitForThumbRestore();
  catalogView?.classList.add('dish-driving');
  let added=0,failed=0,present=0;
  try{
    for(const task of tasks){
      const result=await ensureIngredient(task.name,task.target);
      added+=result.added;
      failed+=result.failed;
      present+=result.present;
    }
  }finally{
    setProductQuery(lastUserQuery);
    await nextPaint();
    catalogView?.classList.remove('dish-driving');
    pending=false;
    confirmButton.classList.remove('is-busy');
  }
  dialog.querySelector('.dish-sheet-close')?.click();
  navigator.vibrate?.(added?[12,35,12]:10);
  if(failed){showToast('Ajout partiel · '+added+' unité'+(added>1?'s':'')+' ajoutée'+(added>1?'s':'')+' · '+failed+' erreur'+(failed>1?'s':''));return}
  if(!added){showToast('Les quantités nécessaires sont déjà dans Ma liste');return}
  showToast(title+' · '+added+' unité'+(added>1?'s':'')+' ajoutée'+(added>1?'s':'')+(present?' · '+present+' déjà suffisant'+(present>1?'s':''):''));
}
function onDialogOpen(){
  buildServingsControl();
  if(servingsInput)servingsInput.value=String(servings);
  applyQuantities();
}
function initDishServings(){
  dialog=document.getElementById('dishDialog');
  list=dialog?.querySelector('.dish-sheet-list');
  confirmButton=dialog?.querySelector('.dish-sheet-add');
  searchInput=document.getElementById('productSearch');
  productsGrid=document.getElementById('products');
  catalogView=document.getElementById('catalogView');
  if(!dialog||!list||!confirmButton||!searchInput||!productsGrid)return;
  document.querySelectorAll('.page-version').forEach(el=>{el.textContent='v180'});
  buildServingsControl();
  const listObserver=new MutationObserver(()=>applyQuantities());
  listObserver.observe(list,{childList:true});
  const openObserver=new MutationObserver(()=>{if(dialog.open)onDialogOpen()});
  openObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('.dish-card'))lastUserQuery=searchInput.value;
  },true);
  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target?.closest?.('.dish-card'))lastUserQuery=searchInput.value;
  },true);
  confirmButton.addEventListener('click',event=>{void addSelectedQuantities(event)},true);
  if(dialog.open)onDialogOpen();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initDishServings,{once:true});else initDishServings();
})();