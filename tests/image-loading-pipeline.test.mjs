import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('le pipeline visuel respecte Produits puis Plats sans timer permanent',()=>{
  const products=read('product-item-images.js');
  const catalog=read('catalog.js');
  const dishImages=read('dish-local-images.js');
  assert.match(products,/function publishProductImagesIdle\(\)/);
  assert.match(products,/const pending=cards\.some/);
  assert.match(products,/scheduleProductImagesIdleCheck\(\);/);
  assert.match(catalog,/let productImagesIdle=false;/);
  assert.match(catalog,/const onDishLocalImagesReady=\(\)=>\{/);
  assert.match(catalog,/if\(productImagesIdle\)warmDishImages\(\);/);
  assert.match(dishImages,/function warmNextDishImage\(\)/);
  assert.match(dishImages,/warmRunning=true;/);
  assert.match(dishImages,/scheduleWarmStep\(\);/);
  assert.doesNotMatch(products,/setInterval\(|MutationObserver/);
  assert.doesNotMatch(dishImages,/setInterval\(|MutationObserver/);
});
