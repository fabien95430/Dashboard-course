import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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
  assert.match(app,/function renderProducts\(\)[\s\S]*?el\.replaceChildren\(fragment\);\s*notifyProductsUpdated\(\)/);
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
