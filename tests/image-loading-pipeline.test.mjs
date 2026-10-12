import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('le pipeline visuel préchauffe Produits puis Plats sans timer permanent',()=>{
  const products=read('product-item-images.js');
  const catalog=read('catalog.js');
  const dishImages=read('dish-local-images.js');
  assert.match(products,/function publishProductImagesIdle\(\)/);
  assert.match(products,/const pending=cards\.some/);
  assert.match(products,/function warmProductImages\(\)/);
  assert.match(products,/window\.requestIdleCallback/);
  assert.match(catalog,/const scheduleDishFeaturesWarmup=\(\)=>\{/);
  assert.match(catalog,/const onDishLocalImagesReady=\(\)=>\{[\s\S]*warmDishImages\(\);/);
  assert.match(dishImages,/function warmNextDishImage\(\)/);
  assert.match(dishImages,/warmRunning=true;/);
  assert.match(dishImages,/scheduleWarmStep\(\);/);
  assert.doesNotMatch(products,/setInterval\(|MutationObserver/);
  assert.doesNotMatch(dishImages,/setInterval\(|MutationObserver/);
});

test('les images Produits déjà persistées sont réutilisées entre deux ouvertures de la même version',()=>{
  const products=read('product-item-images.js');
  assert.match(products,/const PRODUCT_WARM_VERSION_KEY='courses-product-images-warm-version-v1'/);
  assert.match(products,/caches\.keys\(\)/);
  assert.match(products,/name\.startsWith\('courses-visuals-'\)/);
  assert.match(products,/warmedSources\.has\(source\)\|\|cachedSources\.has\(source\)/);
  assert.match(products,/storedWarmVersion\(\)===currentAppVersion\(\)/);
  assert.match(products,/reuseCached&&cachedSources\.has\(source\)/);
  assert.match(products,/localStorage\.setItem\(PRODUCT_WARM_VERSION_KEY,version\)/);
});
