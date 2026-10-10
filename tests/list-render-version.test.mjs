import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('v419 publie la version runtime et les révisions actives associées',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),runtime=read('runtime-features.js'),sw=read('sw.js'),images=read('dish-local-images.js'),appUi=read('app-ui.js');
  assert.equal((index.match(/<span class="page-version">v\d+<\/span>/g)||[]).length,3);
  assert.match(appUi,/const APP_VERSION='v419';/);
  assert.match(appUi,/window\.COURSES_APP_VERSION=APP_VERSION;/);
  assert.match(appUi,/document\.querySelectorAll\('\.page-header'\)/);
  assert.match(index,/\.\/catalog\.js\?v=418/);
  assert.match(index,/\.\/bottom-nav-liquid\.js\?v=414/);
  assert.match(index,/\.\/app\.js\?v=415/);
  assert.match(catalog,/\.\/app-ui\.js\?v=418/);
  assert.match(catalog,/\.\/dish-local-images\.js\?v=418/);
  assert.match(catalog,/\.\/runtime-features\.js\?v=416/);
  assert.match(runtime,/\.\/missing-products-fixes\.js\?v=416/);
  assert.match(runtime,/\.\/product-item-images\.js\?v=415/);
  assert.match(images,/const APP_VERSION='v419';/);
  assert.match(sw,/const CACHE='courses-app-v419-r1';/);
  assert.match(sw,/\.\/catalog\.js\?v=418/);
  assert.match(sw,/\.\/bottom-nav-liquid\.js\?v=414/);
  assert.match(sw,/\.\/app\.js\?v=415/);
  assert.match(sw,/\.\/app-ui\.js\?v=418/);
  assert.match(sw,/\.\/dish-local-images\.js\?v=418/);
  assert.match(sw,/\.\/runtime-features\.js\?v=416/);
  assert.match(sw,/\.\/missing-products-fixes\.js\?v=416/);
  assert.match(sw,/\.\/product-item-images\.js\?v=415/);
});
