import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('le pipeline visuel charge les images sans préchauffer tous les produits',()=>{
  const products=read('product-item-images.js');
  const catalog=read('catalog.js');
  const dishImages=read('dish-local-images.js');
  assert.match(products,/function publishProductImagesIdle\(\)/);
  assert.match(products,/const pending=cards\.some/);
  assert.match(products,/function warmProductImages\(\)/);
  assert.match(products,/function imageLoading\(source,eager=false\)/);
  assert.match(products,/return eager\?'eager':'lazy'/);
  assert.doesNotMatch(products,/queueProductWarmup|PRODUCT_NAMES_DISPLAY_ORDER|warmQueue/);
  assert.match(products,/window\.requestIdleCallback\(run,\{timeout:1200\}\)/);
  assert.match(dishImages,/slice\(0,8\)/);
  assert.match(catalog,/const scheduleDishFeaturesWarmup=\(\)=>\{/);
  assert.match(catalog,/const onDishLocalImagesReady=\(\)=>\{[\s\S]*warmDishImages\(\);/);
  assert.match(dishImages,/function warmNextDishImage\(\)/);
  assert.match(dishImages,/warmRunning=true;/);
  assert.match(dishImages,/scheduleWarmStep\(\);/);
  assert.doesNotMatch(products,/setInterval\(|MutationObserver/);
  assert.doesNotMatch(dishImages,/setInterval\(|MutationObserver/);
});

test('le retour Catalogue ne relance pas le préchargement de 414 images',()=>{
  const products=read('product-item-images.js');
  assert.match(products,/function warmProductImages\(\)/);
  assert.match(products,/scheduleDecorateProducts\(\);/);
  assert.match(products,/scheduleDecorateList\(\);/);
  assert.doesNotMatch(products,/PRODUCT_WARM_VERSION_KEY|storedWarmVersion|warmProductImagesStep|localStorage\.setItem/);
  assert.doesNotMatch(products,/restoreCachedProductImages|cachedSources|caches\.keys\(\)|cache\.keys\(\)/);
});
