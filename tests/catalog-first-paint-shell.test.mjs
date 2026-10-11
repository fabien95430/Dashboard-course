import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const index=read('index.html');
const firstPaint=read('product-item-first-paint.css');
const dishes=read('dishes-ui.js');
const appUi=read('app-ui.js');

test('le rollback Catalogue revient à un seul propriétaire de la structure Produits Plats',()=>{
  assert.doesNotMatch(index,/catalog-mode-first-paint/);
  assert.doesNotMatch(index,/class="catalog-mode-switch"/);
  assert.doesNotMatch(firstPaint,/catalog-mode-first-paint|catalog-mode-switch|catalog-controls/);
  assert.match(dishes,/controls=document\.createElement\('div'\);[\s\S]*controls\.className='catalog-controls'/);
  assert.match(dishes,/modeSwitch=document\.createElement\('div'\);[\s\S]*modeSwitch\.className='catalog-mode-switch'/);
  assert.match(dishes,/productCategories\.before\(controls\);[\s\S]*controls\.append\(modeSwitch,productCategories,dishFilters\)/);
});

test('les badges de version sont déjà dans les h1 et ne sont plus déplacés par JavaScript',()=>{
  for(const title of ['Ma liste','Catalogue','Réglages']){
    assert.match(index,new RegExp('<h1>'+title+' <span class="page-version">v\\d+</span></h1>'));
  }
  assert.doesNotMatch(appUi,/appendChild\(badge\)/);
});
