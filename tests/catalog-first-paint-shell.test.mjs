import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const index=read('index.html');
const firstPaint=read('product-item-first-paint.css');
const dishes=read('dishes-ui.js');
const appUi=read('app-ui.js');

test('le Catalogue possède sa structure finale dès le HTML initial',()=>{
  assert.doesNotMatch(index,/catalog-mode-first-paint/);
  assert.match(index,/class="catalog-controls"/);
  assert.match(index,/class="catalog-mode-switch"/);
  assert.match(index,/id="dishCount" hidden/);
  assert.match(index,/class="dish-filters"[^>]*hidden/);
  assert.match(index,/id="dishes" class="dishes-grid" hidden/);
  assert.match(firstPaint,/catalog-mode-switch/);
  assert.match(firstPaint,/catalog-controls/);
  assert.match(dishes,/controls=catalogView\.querySelector\(':scope > \.catalog-controls'\)/);
  assert.match(dishes,/modeSwitch=controls\.querySelector\('\.catalog-mode-switch'\)/);
  assert.match(dishes,/dishesGrid=document\.getElementById\('dishes'\)/);
  assert.doesNotMatch(dishes,/productCategories\.before\(controls\);\s*controls\.append\(modeSwitch,productCategories,dishFilters\);/);
});

test('les badges de version sont déjà dans les h1 et ne sont plus déplacés par JavaScript',()=>{
  for(const title of ['Ma liste','Catalogue','Réglages']){
    assert.match(index,new RegExp('<h1>'+title+' <span class="page-version">v\\d+</span></h1>'));
  }
  assert.doesNotMatch(appUi,/appendChild\(badge\)/);
});
