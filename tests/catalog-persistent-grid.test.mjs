import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('la grille Produits est montée une fois puis filtrée sans détacher ses cartes',()=>{
  const app=read('app.js');
  const ensureStart=app.indexOf('function ensureProductGrid(');
  const syncStart=app.indexOf('function syncProductGrid(',ensureStart);
  const renderStart=app.indexOf('function renderProducts(){',syncStart);
  const renderEnd=app.indexOf('function setProductQuantity(',renderStart);
  assert.ok(ensureStart>=0&&syncStart>ensureStart&&renderStart>syncStart&&renderEnd>renderStart);
  const ensure=app.slice(ensureStart,syncStart),sync=app.slice(syncStart,renderStart),render=app.slice(renderStart,renderEnd);
  assert.match(ensure,/el\.replaceChildren\(fragment\)/);
  assert.doesNotMatch(ensure,/sortProductsAlpha\(unique\(ALL\)\)\.forEach/);
  assert.match(app,/const PRODUCT_FIRST_BATCH=18/);
  assert.match(app,/const PRODUCT_IDLE_BATCH=24/);
  assert.match(app,/requestIdleCallback\(step,\{timeout:650\}\)/);
  assert.match(sync,/card\.hidden=!visible/);
  assert.match(sync,/card\.style\.order=visible\?String\(rank\):''/);
  assert.doesNotMatch(render,/replaceChildren\(/);
});

test('la bascule Produits Plats conserve la grille et ne simule pas une saisie vide',()=>{
  const dishes=read('dishes-ui.js');
  const start=dishes.indexOf('function setMode(next,initial=false){'),end=dishes.indexOf('function syncModeLens(',start),block=dishes.slice(start,end);
  assert.match(block,/if\(!initial&&searchInput\.value\)/);
  assert.match(block,/productsGrid\.classList\.toggle\('is-catalog-mode-hidden',dishes\)/);
  assert.match(block,/productsGrid\.inert=dishes/);
  assert.doesNotMatch(block,/productsGrid\.hidden=dishes/);
});

test('images et quantités ignorent les cartes Produits masquées',()=>{
  const images=read('product-item-images.js'),quantities=read('catalog-quantities.js');
  assert.match(images,/card\.hidden\|\|products\?\.classList\.contains\('is-catalog-mode-hidden'\)/);
  assert.match(images,/\.product\[data-name\]:not\(\[hidden\]\)/);
  assert.match(quantities,/\.product\[data-name\]:not\(\[hidden\]\)/);
});

test('la variante sûre garde content-visibility auto hors des cartes',()=>{
  const css=read('product-item-first-paint.css');
  assert.match(css,/#products\.is-catalog-mode-hidden\{[\s\S]*content-visibility:hidden!important/);
  assert.doesNotMatch(css,/\.product[^\{]*\{[^\}]*content-visibility\s*:\s*auto/i);
  assert.doesNotMatch(css,/\.catalog-view \.page-version\{[\s\S]*?transform:/);
});


test('la grille Plats se prépare en arrière-plan avant le premier affichage',()=>{
  const dishes=read('dishes-ui.js');
  const prepareStart=dishes.indexOf('function prepareDishGrid(){');
  const scheduleStart=dishes.indexOf('function scheduleDishGridWarmup(){',prepareStart);
  const renderStart=dishes.indexOf('function renderDishes(){',scheduleStart);
  assert.ok(prepareStart>=0&&scheduleStart>prepareStart&&renderStart>scheduleStart);
  const prepare=dishes.slice(prepareStart,scheduleStart),schedule=dishes.slice(scheduleStart,renderStart);
  assert.match(prepare,/DISHES\.forEach\(dish=>fragment\.appendChild\(dishCard\(dish\)\)\)/);
  assert.match(prepare,/dishesGrid\.replaceChildren\(fragment\)/);
  assert.match(prepare,/mode==='dishes'/);
  assert.match(schedule,/requestIdleCallback\(run,\{timeout:1200\}\)/);
  assert.doesNotMatch(schedule,/setInterval|setMode\('dishes'/);
  assert.match(dishes,/setMode\('products',true\);\s*scheduleDishGridWarmup\(\);/);
  const renderEnd=dishes.indexOf('function toggleFavorite(',renderStart);
  const render=dishes.slice(renderStart,renderEnd);
  assert.match(render,/defaultView&&dishGridState==='default'/);
  assert.match(render,/dishGridState=defaultView&&dishes\.length===DISHES\.length\?'default':'custom'/);
});

test('la lentille Produits Plats garde la même géométrie avant et après le module liquid',()=>{
  const dishes=read('dishes-ui.js'),firstPaint=read('product-item-first-paint.css'),liquid=read('catalog-liquid.js');
  assert.match(firstPaint,/--catalog-lens-x:calc\(25vw - 48px\)/);
  assert.match(firstPaint,/--catalog-lens-w:84px/);
  assert.match(liquid,/const lensW=Math\.max\(48,Math\.min\(liquid\.w\*0\.5,108\)\);/);
  const syncStart=dishes.indexOf('function syncModeLens(animate=true){');
  const syncEnd=dishes.indexOf('function renderDishFilters(){',syncStart);
  const sync=dishes.slice(syncStart,syncEnd);
  assert.match(sync,/modeSwitch\.dataset\.catalogLiquidBound==='1'/);
  assert.match(sync,/const width=Math\.max\(48,Math\.min\(active\.offsetWidth\*\.5,108\)\);/);
  assert.match(sync,/active\.offsetLeft\+\(active\.offsetWidth-width\)\/2/);
  assert.match(firstPaint,/height:2px!important/);
  assert.match(firstPaint,/background:transparent!important/);
});
