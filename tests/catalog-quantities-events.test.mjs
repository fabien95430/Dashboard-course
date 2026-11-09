import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('les quantités écoutent des événements propriétaires sans observer le DOM',()=>{
  const quantities=read('catalog-quantities.js');
  assert.doesNotMatch(quantities,/new MutationObserver/);
  assert.match(quantities,/document\.addEventListener\('courses:products-updated',scheduleProductRefresh\)/);
  assert.match(quantities,/document\.addEventListener\('courses:list-rendered',scheduleShoppingListRefresh\)/);
  assert.match(quantities,/document\.addEventListener\('courses:list-changed',[\s\S]*?scheduleShoppingListRefresh\(\);[\s\S]*?scheduleDishRefresh\(\)/);
  assert.match(quantities,/document\.addEventListener\('courses:dish-ingredients-rendered',scheduleDishRefresh\)/);
  assert.match(quantities,/if\(eventsBound\)return;[\s\S]*?eventsBound=true;/);
});

test('les propriétaires publient les changements après leurs rendus',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  assert.match(app,/function notifyProductsUpdated\(\)[\s\S]*?new CustomEvent\('courses:products-updated'\)/);
  assert.match(app,/function notifyListRendered\(\)[\s\S]*?new CustomEvent\('courses:list-rendered'\)/);
  const productRender=app.slice(app.indexOf('function renderProducts(){'),app.indexOf('function setProductQuantity(',app.indexOf('function renderProducts(){')));
  assert.match(productRender,/ensureProductGrid\(el,quantities\);/);
  assert.match(productRender,/syncProductGrid\(products,quantities\);/);
  assert.match(productRender,/notifyProductsUpdated\(\);/);
  assert.doesNotMatch(productRender,/replaceChildren\(/);
  assert.match(app,/function renderList\(\)[\s\S]*?bindListReorder\(el\);\s*notifyListRendered\(\)/);
  assert.match(dishes,/function renderDishSheetIngredients\(\)[\s\S]*?new CustomEvent\('courses:dish-ingredients-rendered',\{detail:\{dish:currentDish\.name\}\}\)/);
});

test('la synchronisation globale du catalogue ne publie qu après la mise à jour des cartes',()=>{
  const app=read('app.js');
  const start=app.indexOf('function syncProductSelection()');
  const end=app.indexOf('function renderSelectionAndList()',start);
  assert.ok(start>=0&&end>start,'syncProductSelection introuvable');
  const sync=app.slice(start,end);
  assert.match(sync,/updateProductCardQuantity\(card,name,/);
  assert.match(sync,/notifyProductsUpdated\(\);/);
  assert.doesNotMatch(sync,/setProductQuantity\(/);
});

test('un appui sur un ingrédient met à jour sa seule ligne sans reconstruire la fiche',()=>{
  const dishes=readFileSync(new URL('../dishes-ui.js',import.meta.url),'utf8');
  const start=dishes.indexOf('function syncDishSheetSummary(){'),end=dishes.indexOf('// Validation de la fiche plat',start);
  assert.ok(start>0&&end>start,'mise à jour de la sélection introuvable');
  const events=[];
  const label={textContent:''},check={textContent:'✓'};
  const row={dataset:{ingredient:'Lait'},classes:new Set(['is-selected']),attrs:{'aria-pressed':'true'},
    classList:{toggle(name,on){on?row.classes.add(name):row.classes.delete(name)}},
    setAttribute(name,value){row.attrs[name]=value},querySelector:()=>check};
  const context={
    currentDish:{name:'Hachis parmentier'},busyDish:null,selectedIngredients:new Set(['Lait','Beurre']),
    dishSheetCount:{textContent:''},dishConfirmButton:{disabled:false,querySelector:()=>label},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
    document:{dispatchEvent:event=>events.push(event)},
    renderDishSheetIngredients(){throw new Error('la fiche ne doit pas être reconstruite')}
  };
  vm.runInNewContext(dishes.slice(start,end)+';globalThis.toggleDishIngredient=toggleDishIngredient;',context);
  context.toggleDishIngredient(row);
  assert.equal(row.classes.has('is-selected'),false);
  assert.equal(row.attrs['aria-pressed'],'false');
  assert.equal(check.textContent,'');
  assert.equal(context.dishSheetCount.textContent,'1 ingrédient');
  assert.deepEqual(events.map(event=>[event.type,event.detail.ingredient,event.detail.selected]),[['courses:dish-selection-changed','Lait',false]]);
  // Une fois la quantité posée par catalog-quantities.js, la pastille « ×N » n'est plus touchée.
  row.dataset.dishQuantity='2';check.textContent='×2';
  context.toggleDishIngredient(row);
  assert.equal(check.textContent,'×2');
  assert.equal(context.dishSheetCount.textContent,'2 ingrédients');
  assert.equal(label.textContent,'Ajouter à ma liste');
  const marker=readFileSync(new URL('../dish-added-marker.js',import.meta.url),'utf8');
  assert.match(marker,/document\.addEventListener\('courses:dish-selection-changed',syncDialogGuard\)/);
});
