import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('les cartes de plats restent lazy et le warmup attend la fin du lot Produits visible',()=>{
  const products=read('product-item-images.js');
  const catalog=read('catalog.js');
  const dishes=read('dishes-ui.js');
  const images=read('dish-local-images.js');
  assert.match(dishes,/loading="lazy" decoding="async"/);
  assert.match(products,/new CustomEvent\('courses:product-images-idle'/);
  assert.match(products,/filter\(productCardVisible\)/);
  assert.match(products,/if\(pending\)\{productImagesIdle=false;return\}/);
  assert.match(catalog,/document\.addEventListener\('courses:product-images-idle',\(\)=>\{/);
  assert.match(catalog,/productImagesIdle=true;\s*warmDishImages\(\);/);
  assert.match(dishes,/window\.COURSES_DISH_NAMES=Object\.freeze\(DISHES\.map\(dish=>dish\.name\)\)/);
  assert.match(images,/window\.COURSES_DISH_IMAGES=Object\.freeze\(\{warm:warmDishImages\}\)/);
  assert.match(images,/image\.fetchPriority='low'/);
  assert.match(images,/window\.requestIdleCallback/);
  assert.match(images,/new Image\(\)/);
  assert.doesNotMatch(images,/setInterval\(|MutationObserver/);
});

test('le préchargement Plats reste événementiel et ne revient pas dans le démarrage critique',()=>{
  const catalog=read('catalog.js');
  const start=catalog.indexOf('const bootstrap=()=>{');
  const end=catalog.indexOf("if(document.readyState==='loading')",start);
  const bootstrap=catalog.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.doesNotMatch(bootstrap,/warmDishImages\(\)|loadDishLocalImages\(\)|startDishFeatures\(\)/);
  assert.doesNotMatch(catalog,/setInterval\(|new MutationObserver/);
});
