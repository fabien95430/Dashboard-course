import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const index=read('index.html');
const firstPaint=read('product-item-first-paint.css');
const dishes=read('dishes-ui.js');
const appUi=read('app-ui.js');

test('le premier affichage du Catalogue contient déjà le vrai sélecteur final',()=>{
  assert.equal((index.match(/class="catalog-mode-switch"/g)||[]).length,1);
  assert.match(index,/class="catalog-mode-switch"[\s\S]*data-mode="products"[\s\S]*data-mode="dishes"/);
  assert.match(index,/class="catalog-mode is-active" data-mode="products" role="tab" aria-selected="true"/);
  assert.doesNotMatch(index,/catalog-mode-first-paint/);
  assert.doesNotMatch(firstPaint,/catalog-mode-first-paint/);
  assert.match(firstPaint,/html \.catalog-view\{\s*grid-template-rows:112px 46px 58px 48px minmax\(0,1fr\)!important;/);
  assert.match(firstPaint,/html \.catalog-view>\.catalog-controls\{display:contents!important\}/);
  assert.match(firstPaint,/html \.catalog-mode-switch\{[\s\S]*?order:1!important;[\s\S]*?height:46px!important;/);
  assert.match(firstPaint,/@media\(max-width:520px\)\{[\s\S]*?grid-template-rows:82px 46px 42px 38px minmax\(0,1fr\)!important;/);
});

test('dishes-ui enrichit la structure existante sans la reconstruire',()=>{
  assert.match(dishes,/controls=catalogView\.querySelector\(':scope > \.catalog-controls'\)/);
  assert.match(dishes,/modeSwitch=controls\.querySelector\('\.catalog-mode-switch'\)/);
  assert.match(dishes,/dishFilters=controls\.querySelector\('\.dish-filters'\)/);
  assert.match(dishes,/dishesGrid=document\.getElementById\('dishes'\)/);
  assert.match(dishes,/dishCount=document\.getElementById\('dishCount'\)/);
  assert.match(dishes,/if\(!controls\)\{/);
  assert.match(dishes,/if\(!modeSwitch\)\{/);
});

test('les badges de version sont dans les h1 avant tout JavaScript',()=>{
  for(const title of ['Ma liste','Catalogue','Réglages']){
    assert.match(index,new RegExp('<h1>'+title+' <span class="page-version">v\\d+</span></h1>'));
  }
  assert.doesNotMatch(appUi,/appendChild\(badge\)/);
});
