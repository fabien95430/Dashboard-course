import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('P2 publie la version globale v411 et les révisions app associées',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),sw=read('sw.js'),images=read('dish-local-images.js');
  assert.equal((index.match(/<span class="page-version">v411<\/span>/g)||[]).length,3);
  assert.match(index,/\.\/catalog\.js\?v=411/);
  assert.match(index,/\.\/app\.js\?v=411/);
  assert.match(catalog,/\.\/dish-local-images\.js\?v=411/);
  assert.match(images,/const APP_VERSION='v411';/);
  assert.match(sw,/const CACHE='courses-app-v411-r1';/);
  assert.match(sw,/\.\/catalog\.js\?v=411/);
  assert.match(sw,/\.\/app\.js\?v=411/);
  assert.match(sw,/\.\/dish-local-images\.js\?v=411/);
});
