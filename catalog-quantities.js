(() => {
'use strict';

const PACKS=Object.freeze({
  'Spaghetti':{label:'500 g',amount:500,unit:'g'},
  'Penne':{label:'500 g',amount:500,unit:'g'},
  'Coquillettes':{label:'500 g',amount:500,unit:'g'},
  'Tagliatelles':{label:'500 g',amount:500,unit:'g'},
  'Lasagnes':{label:'500 g',amount:500,unit:'g'},
  'Riz basmati':{label:'500 g',amount:500,unit:'g'},
  'Riz long':{label:'500 g',amount:500,unit:'g'},
  'Quinoa':{label:'500 g',amount:500,unit:'g'},
  'Couscous':{label:'500 g',amount:500,unit:'g'},
  'Nouilles chinoises':{label:'250 g',amount:250,unit:'g'},
  'Lardons':{label:'200 g',amount:200,unit:'g'},
  'Parmesan':{label:'100 g',amount:100,unit:'g'},
  'Crème fraîche':{label:'20 cl',amount:200,unit:'ml'},
  'Crème liquide':{label:'20 cl',amount:200,unit:'ml'},
  'Œufs':{label:'Boîte de 6',amount:6,unit:'piece'},
  'Poulet':{label:'500 g',amount:500,unit:'g'},
  'Escalopes de poulet':{label:'500 g',amount:500,unit:'g'},
  'Viande hachée':{label:'500 g',amount:500,unit:'g'},
  'Bœuf':{label:'500 g',amount:500,unit:'g'},
  'Steaks hachés':{label:'4 × 100 g',amount:4,unit:'piece'},
  'Saucisses':{label:'6 pièces · 500 g',amount:6,unit:'piece'},
  'Merguez':{label:'6 pièces · 450 g',amount:6,unit:'piece'},
  'Saumon':{label:'2 pavés · 300 g',amount:300,unit:'g'},
  'Cabillaud':{label:'300 g',amount:300,unit:'g'},
  'Crevettes':{label:'400 g',amount:400,unit:'g'},
  'Moules':{label:'1 kg',amount:1000,unit:'g'},
  'Saumon fumé':{label:'4 tranches · 120 g',amount:120,unit:'g'},
  'Frites surgelées':{label:'1 kg',amount:1000,unit:'g'},
  'Mozzarella':{label:'125 g',amount:125,unit:'g'},
  'Fromage râpé':{label:'200 g',amount:200,unit:'g'},
  'Emmental':{label:'200 g',amount:200,unit:'g'},
  'Raclette':{label:'400 g',amount:400,unit:'g'},
  'Reblochon':{label:'450 g',amount:450,unit:'g'},
  'Chèvre':{label:'150 g',amount:150,unit:'g'},
  'Jambon blanc':{label:'4 tranches',amount:4,unit:'piece'},
  'Jambon cru':{label:'100 g',amount:100,unit:'g'},
  'Rosette':{label:'100 g',amount:100,unit:'g'},
  'Chorizo':{label:'200 g',amount:200,unit:'g'},
  'Blanc de poulet':{label:'4 tranches · 120 g',amount:4,unit:'piece'},
  'Pains burger':{label:'4 pièces',amount:4,unit:'piece'},
  'Pains hot-dog':{label:'4 pièces',amount:4,unit:'piece'},
  'Wraps':{label:'6 pièces',amount:6,unit:'piece'},
  'Galettes de blé':{label:'8 pièces',amount:8,unit:'piece'},
  'Pain de mie':{label:'500 g',amount:500,unit:'g'},
  'Pain':{label:'400 g',amount:400,unit:'g'},
  'Baguette':{label:'250 g',amount:250,unit:'g'},
  'Sauce tomate':{label:'400 g',amount:400,unit:'g'},
  'Pesto':{label:'190 g',amount:190,unit:'g'},
  'Sauce soja':{label:'15 cl',amount:150,unit:'ml'},
  'Moutarde':{label:'370 g',amount:370,unit:'g'},
  'Miel':{label:'375 g',amount:375,unit:'g'},
  'Curry':{label:'40 g',amount:40,unit:'g'},
  'Lait de coco':{label:'40 cl',amount:400,unit:'ml'},
  'Haricots rouges':{label:'400 g',amount:400,unit:'g'},
  'Pois chiches':{label:'400 g',amount:400,unit:'g'},
  'Tomates pelées':{label:'400 g',amount:400,unit:'g'},
  'Maïs en boîte':{label:'300 g',amount:300,unit:'g'},
  'Thon en boîte':{label:'140 g',amount:140,unit:'g'},
  'Lentilles':{label:'500 g',amount:500,unit:'g'},
  'Tomates':{label:'500 g',amount:500,unit:'g'},
  'Carottes':{label:'1 kg',amount:1000,unit:'g'},
  'Courgettes':{label:'1 kg',amount:1000,unit:'g'},
  'Aubergines':{label:'500 g',amount:500,unit:'g'},
  'Poivrons':{label:'500 g',amount:500,unit:'g'},
  'Champignons':{label:'250 g',amount:250,unit:'g'},
  'Brocoli':{label:'500 g',amount:500,unit:'g'},
  'Haricots verts':{label:'500 g',amount:500,unit:'g'},
  'Épinards':{label:'500 g',amount:500,unit:'g'},
  'Poireaux':{label:'1 kg',amount:1000,unit:'g'},
  'Pommes de terre':{label:'1 kg',amount:1000,unit:'g'},
  'Oignons jaunes':{label:'1 kg',amount:1000,unit:'g'},
  'Oignons rouges':{label:'500 g',amount:500,unit:'g'},
  'Salade verte':{label:'1 pièce',amount:1,unit:'piece'},
  'Avocat':{label:'2 pièces',amount:2,unit:'piece'},
  'Concombres':{label:'1 pièce',amount:1,unit:'piece'},
  'Citron':{label:'4 pièces',amount:4,unit:'piece'},
  'Citrons':{label:'4 pièces',amount:4,unit:'piece'},
  'Ail':{label:'3 têtes',amount:3,unit:'piece'},
  'Gingembre':{label:'100 g',amount:100,unit:'g'},
  'Basilic':{label:'20 g',amount:20,unit:'g'},
  'Romarin frais':{label:'20 g',amount:20,unit:'g'},
  'Noix':{label:'125 g',amount:125,unit:'g'},
  'Farine':{label:'1 kg',amount:1000,unit:'g'},
  'Sucre':{label:'1 kg',amount:1000,unit:'g'},
  'Beurre':{label:'250 g',amount:250,unit:'g'},
  'Lait':{label:'1 L',amount:1000,unit:'ml'},
  'Chapelure':{label:'250 g',amount:250,unit:'g'},
  'Croûtons':{label:'100 g',amount:100,unit:'g'},
  'Vanille':{label:'5 sachets',amount:5,unit:'piece'}
});

const NEED_PER_PERSON=Object.freeze({
  'Spaghetti':100,'Penne':100,'Coquillettes':100,'Tagliatelles':100,'Lasagnes':100,
  'Riz basmati':75,'Riz long':75,'Quinoa':70,'Couscous':80,'Nouilles chinoises':100,
  'Lardons':50,'Parmesan':25,'Crème fraîche':50,'Crème liquide':125,'Œufs':1,
  'Poulet':125,'Escalopes de poulet':125,'Viande hachée':125,'Bœuf':125,
  'Steaks hachés':1,'Saucisses':1,'Merguez':2,
  'Saumon':150,'Cabillaud':150,'Crevettes':100,'Moules':500,'Saumon fumé':50,'Frites surgelées':200,
  'Mozzarella':60,'Fromage râpé':40,'Emmental':40,'Raclette':200,'Reblochon':112.5,'Chèvre':50,
  'Jambon blanc':1,'Jambon cru':25,'Rosette':25,'Chorizo':50,'Blanc de poulet':1,
  'Pains burger':1,'Pains hot-dog':1,'Wraps':1,'Galettes de blé':2,
  'Pain de mie':70,'Pain':100,'Baguette':60,
  'Sauce tomate':100,'Pesto':30,'Sauce soja':15,'Moutarde':10,'Miel':15,'Curry':5,'Lait de coco':100,
  'Haricots rouges':100,'Pois chiches':100,'Tomates pelées':100,'Maïs en boîte':75,'Thon en boîte':70,'Lentilles':80,
  'Tomates':125,'Carottes':100,'Courgettes':125,'Aubergines':125,'Poivrons':100,'Champignons':60,
  'Brocoli':150,'Haricots verts':150,'Épinards':100,'Poireaux':150,'Pommes de terre':250,
  'Oignons jaunes':50,'Oignons rouges':50,'Salade verte':0.25,'Avocat':0.5,'Concombres':0.25,
  'Citron':0.25,'Citrons':0.25,'Ail':0.25,'Gingembre':10,'Basilic':4,'Romarin frais':2,'Noix':25,
  'Farine':65,'Sucre':25,'Beurre':25,'Lait':100,'Chapelure':25,'Croûtons':25,'Vanille':0.25
});

const DISH_NEEDS_FOR_FOUR=Object.freeze({
  'Spaghetti carbonara':{'Spaghetti':400,'Lardons':200,'Œufs':4,'Parmesan':100,'Crème fraîche':200},
  'Tartiflette':{'Pommes de terre':1000,'Reblochon':450,'Lardons':200,'Oignons jaunes':200,'Crème fraîche':200},
  'Raclette':{'Raclette':800,'Pommes de terre':1000},
  'Omelette jambon fromage':{'Œufs':6,'Jambon blanc':4},
  'Gratin de courgettes':{'Œufs':3},
  'Quiche lorraine':{'Œufs':3,'Lardons':200,'Crème fraîche':200},
  'Quiche poireaux chèvre':{'Œufs':3},
  'Salade César':{'Œufs':2},
  'Salade César saumon':{'Œufs':2},
  'Crème brûlée':{'Crème liquide':500,'Œufs':4,'Sucre':100,'Vanille':1},
  'Sushis':{'Saumon':400,'Riz long':320,'Avocat':2,'Concombres':1},
  'Steak tartare':{'Bœuf':600,'Œufs':4,'Oignons rouges':120}
});

const BASE_SERVINGS=4;
let dialog=null;
let list=null;
let products=null;
let searchInput=null;
let catalogView=null;
let pending=false;
let productObserver=null;
let listObserver=null;
let dialogObserver=null;
let toastTimer=0;

window.COURSES_PRODUCT_PACKS=PACKS;

function servings(){
  const input=dialog?.querySelector('.dish-servings-value');
  const value=Math.round(Number(input?.value)||BASE_SERVINGS);
  return Math.max(1,Math.min(12,value));
}
function currentDish(){
  return dialog?.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
}
function packFor(name){
  const pack=PACKS[name];
  return pack&&Number(pack.amount)>0?pack:null;
}
function needFor(name){
  const pack=packFor(name);
  if(!pack)return null;
  const currentServings=servings();
  const dishNeed=Number(DISH_NEEDS_FOR_FOUR[currentDish()]?.[name]);
  if(Number.isFinite(dishNeed)&&dishNeed>0)return dishNeed*currentServings/BASE_SERVINGS;
  const perPerson=Number(NEED_PER_PERSON[name]);
  return Number.isFinite(perPerson)&&perPerson>0?perPerson*currentServings:null;
}
function quantityFor(name){
  const pack=packFor(name);
  const need=needFor(name);
  if(!pack||need===null)return 1;
  return Math.max(1,Math.ceil(need/pack.amount));
}
function ensureStyles(){
  if(document.getElementById('courses-product-quantities-style'))return;
  const style=document.createElement('style');
  style.id='courses-product-quantities-style';
  style.textContent=`
    #products .product .pcat[data-pack-reference="1"]{color:#69776f;font-weight:760}
    #dishDialog .dish-ingredient-name{display:flex!important;flex-direction:column!important;gap:2px!important}
    #dishDialog .dish-ingredient-pack{display:block!important;color:#718078!important;font-size:10.5px!important;line-height:1.05!important;font-weight:720!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #dishDialog .dish-ingredient-check{font-size:12px!important;letter-spacing:-.2px!important}
  `;
  document.head.appendChild(style);
}
function decorateProducts(){
  if(!products)return;
  products.querySelectorAll('.product[data-name]').forEach(card=>{
    const name=String(card.dataset.name||'');
    const pack=packFor(name);
    const detail=card.querySelector('.pcat');
    if(!pack||!detail)return;
    if(detail.textContent!==pack.label)detail.textContent=pack.label;
    detail.dataset.packReference='1';
    detail.title='Conditionnement de référence : '+pack.label;
  });
}
function decorateDishRows(){
  if(!dialog?.open||!list)return;
  list.querySelectorAll('.dish-ingredient[data-ingredient]').forEach(row=>{
    const name=String(row.dataset.ingredient||'');
    const pack=packFor(name);
    const quantity=quantityFor(name);
    row.dataset.recipeQuantity=String(quantity);
    const label=row.querySelector('.dish-ingredient-name');
    if(label&&pack){
      let reference=label.querySelector('.dish-ingredient-pack');
      if(!reference){
        reference=document.createElement('small');
        reference.className='dish-ingredient-pack';
        label.appendChild(reference);
      }
      reference.textContent=pack.label;
    }
    const badge=row.querySelector('.dish-ingredient-check');
    if(badge){
      badge.textContent='×'+quantity;
      const reference=pack?' de '+pack.label:'';
      badge.setAttribute('aria-label',quantity+' conditionnement'+(quantity>1?'s':'')+reference+' à acheter');
    }
  });
}
function scheduleDishRefresh(){
  queueMicrotask(()=>requestAnimationFrame(decorateDishRows));
}
function nextPaint(){
  return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
}
function setProductQuery(value){
  if(!searchInput)return;
  searchInput.value=value;
  searchInput.dispatchEvent(new Event('input',{bubbles:true}));
}
function currentCard(name){
  return [...(products?.querySelectorAll('.product')||[])].find(card=>String(card.dataset.name||'')===name)||null;
}
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
      const quantity=Math.max(0,Number(currentCard(name)?.dataset.quantity)||0);
      if(quantity>before){finish(quantity);return true}
      if(Date.now()-started>=timeout){finish(quantity);return true}
      return false;
    };
    if(check())return;
    observer=new MutationObserver(check);
    if(products)observer.observe(products,{subtree:true,childList:true,attributes:true,attributeFilter:['data-quantity']});
    timer=setTimeout(()=>finish(Math.max(0,Number(currentCard(name)?.dataset.quantity)||0)),timeout);
  });
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
async function addSelectedQuantities(button){
  if(pending||button.disabled||!dialog||!list)return;
  const rows=[...list.querySelectorAll('.dish-ingredient[aria-pressed="true"]:not([disabled])')];
  if(!rows.length)return;
  pending=true;
  const title=currentDish();
  const userQuery=String(searchInput?.value||'');
  button.classList.add('is-busy');
  button.disabled=true;
  const buttonLabel=button.querySelector('span');
  if(buttonLabel)buttonLabel.textContent='Ajout en cours…';
  const tasks=rows.map(row=>{
    const name=String(row.dataset.ingredient||'');
    return {name,target:quantityFor(name)};
  });
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
    setProductQuery(userQuery);
    await nextPaint();
    catalogView?.classList.remove('dish-driving');
    pending=false;
    button.classList.remove('is-busy');
  }
  dialog.querySelector('.dish-sheet-close')?.click();
  navigator.vibrate?.(added?[12,35,12]:10);
  if(failed){
    showToast('Ajout partiel · '+added+' unité'+(added>1?'s':'')+' ajoutée'+(added>1?'s':'')+' · '+failed+' erreur'+(failed>1?'s':''));
    return;
  }
  if(!added){
    showToast('Les quantités nécessaires sont déjà dans Ma liste');
    return;
  }
  showToast(title+' · '+added+' unité'+(added>1?'s':'')+' ajoutée'+(added>1?'s':'')+(present?' · '+present+' déjà dans Ma liste':''));
}
function bind(){
  dialog=document.getElementById('dishDialog');
  list=dialog?.querySelector('.dish-sheet-list');
  products=document.getElementById('products');
  searchInput=document.getElementById('productSearch');
  catalogView=document.getElementById('catalogView');
  if(!dialog||!list||!products||!searchInput)return false;
  ensureStyles();
  decorateProducts();
  decorateDishRows();

  productObserver?.disconnect();
  productObserver=new MutationObserver(()=>requestAnimationFrame(decorateProducts));
  productObserver.observe(products,{childList:true,subtree:true});

  listObserver?.disconnect();
  listObserver=new MutationObserver(scheduleDishRefresh);
  listObserver.observe(list,{childList:true});

  dialogObserver?.disconnect();
  dialogObserver=new MutationObserver(scheduleDishRefresh);
  dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']});

  dialog.addEventListener('input',event=>{
    if(event.target?.classList?.contains('dish-servings-value'))scheduleDishRefresh();
  },true);
  dialog.addEventListener('click',event=>{
    if(event.target?.closest?.('.dish-servings-step'))scheduleDishRefresh();
    const button=event.target?.closest?.('.dish-sheet-add');
    if(!button||button.disabled||pending)return;
    decorateDishRows();
    event.preventDefault();
    event.stopImmediatePropagation();
    void addSelectedQuantities(button);
  },true);
  return true;
}
function init(){
  if(bind())return;
  const observer=new MutationObserver(()=>{
    if(bind())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();