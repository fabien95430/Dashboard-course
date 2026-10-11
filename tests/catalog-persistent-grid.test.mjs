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
