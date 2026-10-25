import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('les cartes du Catalogue sont créées par lots annulables',()=>{
  const app=read('app.js');
  assert.match(app,/const PRODUCT_FIRST_BATCH=18;/);
  assert.match(app,/const PRODUCT_IDLE_BATCH=24;/);
  assert.match(app,/pending\.splice\(0,PRODUCT_FIRST_BATCH\)/);
  assert.match(app,/remaining\.splice\(0,PRODUCT_IDLE_BATCH\)/);
  assert.match(app,/generation!==productBuildGeneration\|\|state\.view!=='catalog'/);
  assert.match(app,/document\.addEventListener\('courses:catalog-mode-changed'/);
  assert.match(app,/document\.addEventListener\('courses:view-changed'/);
});

test('Produits et Plats activent la lentille avant le rendu des cartes',()=>{
  const dishes=read('dishes-ui.js');
  const start=dishes.indexOf('function setMode(next,initial=false){');
  const end=dishes.indexOf('function syncModeLens(',start);
  assert.ok(start>=0&&end>start);
  const mode=dishes.slice(start,end);
  assert.match(mode,/syncModeLens\(!initial\)/);
  assert.match(mode,/scheduleDishModeRender\(\)/);
  assert.doesNotMatch(mode,/if\(dishes\)renderDishes\(\)/);
  assert.match(mode,/courses:catalog-mode-changed/);
  assert.match(mode,/productsGrid\.inert=dishes/);
  assert.match(dishes,/dishModeRenderFrame=requestAnimationFrame/);
});
