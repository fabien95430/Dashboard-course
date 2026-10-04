(() => {
'use strict';

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
  'Velouté carottes'
]);
const slugify=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');

function localDishImage(name){
  const slug=SPECIAL_SLUGS[name]||slugify(name);
  return './www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+slug+'.png';
}
function localizeCard(card){
  const name=card?.dataset?.dish||'';
  const image=card?.querySelector?.('.dish-visual img');
  if(!name||!image||image.dataset.localDish===name)return;
  image.src=localDishImage(name);
  image.dataset.localDish=name;
}
function localizeCards(grid){
  grid?.querySelectorAll?.('.dish-card').forEach(localizeCard);
}
function localizeDialog(dialog){
  if(!dialog?.open)return;
  const name=dialog.querySelector('.dish-sheet-head h2')?.textContent?.trim()||'';
  const image=dialog.querySelector('.dish-sheet-photo');
  if(!name||!image||image.dataset.localDish===name)return;
  image.src=localDishImage(name);
  image.dataset.localDish=name;
}

let gridObserver=null;
let dialogObserver=null;
const bootstrapObserver=new MutationObserver(()=>bind());

function bind(){
  const grid=document.getElementById('dishes');
  if(grid&&!gridObserver){
    localizeCards(grid);
    gridObserver=new MutationObserver(()=>localizeCards(grid));
    gridObserver.observe(grid,{childList:true});
  }
  const dialog=document.getElementById('dishDialog');
  if(dialog&&!dialogObserver){
    localizeDialog(dialog);
    dialogObserver=new MutationObserver(()=>localizeDialog(dialog));
    dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
  }
  if(gridObserver&&dialogObserver)bootstrapObserver.disconnect();
}

bootstrapObserver.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();