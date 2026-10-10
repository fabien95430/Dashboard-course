import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('P4 publie la version globale v413 et les révisions app associées',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),sw=read('sw.js'),images=read('dish-local-images.js');
  assert.equal((index.match(/<span class="page-version">v413<\/span>/g)||[]).length,3);
  assert.match(index,/\.\/catalog\.js\?v=413/);
  assert.match(index,/\.\/bottom-nav-liquid\.js\?v=413/);
  assert.match(index,/\.\/app\.js\?v=413/);
  assert.match(catalog,/\.\/dish-local-images\.js\?v=413/);
  assert.match(images,/const APP_VERSION='v413';/);
  assert.match(sw,/const CACHE='courses-app-v413-r1';/);
  assert.match(sw,/\.\/catalog\.js\?v=413/);
  assert.match(sw,/\.\/bottom-nav-liquid\.js\?v=413/);
  assert.match(sw,/\.\/app\.js\?v=413/);
  assert.match(sw,/\.\/dish-local-images\.js\?v=413/);
});
