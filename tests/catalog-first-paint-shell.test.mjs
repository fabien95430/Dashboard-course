import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const index=read('index.html');
const firstPaint=read('product-item-first-paint.css');
const dishes=read('dishes-ui.js');

test('le premier affichage du Catalogue utilise déjà sa géométrie finale',()=>{
  const products=index.indexOf('<div id="products" class="products"></div>');
  const shell=index.indexOf('class="catalog-mode-first-paint"');
  assert.ok(products>=0&&shell>products,'la coque Produits / Plats doit exister dans le HTML initial après la grille Produits');
  assert.match(firstPaint,/html \.catalog-view\{\s*grid-template-rows:112px 46px 58px 48px minmax\(0,1fr\)!important;/);
  assert.match(firstPaint,/html \.catalog-view>#categories\{[\s\S]*?order:3!important;[\s\S]*?height:48px!important;/);
  assert.match(firstPaint,/\.catalog-view>\.catalog-controls~\.catalog-mode-first-paint\{display:none!important\}/);
  assert.match(firstPaint,/@media\(max-width:520px\)\{[\s\S]*?grid-template-rows:82px 46px 42px 38px minmax\(0,1fr\)!important;/);
  assert.match(firstPaint,/html \.catalog-view>#categories \.cat\{[\s\S]*?height:38px!important;[\s\S]*?padding-left:16px!important;/);
});

test('la vraie interface Plats prend le relais sans seconde structure visible',()=>{
  assert.match(dishes,/productCategories\.before\(controls\);\s*controls\.append\(modeSwitch,productCategories,dishFilters\);/);
  assert.match(dishes,/modeSwitch\.className='catalog-mode-switch';/);
  assert.doesNotMatch(index,/class="catalog-mode-switch"/);
});
