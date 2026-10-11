import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('la version globale et les révisions actives associées restent cohérentes',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),runtime=read('runtime-features.js'),sw=read('sw.js'),images=read('dish-local-images.js');
  const versions=[...index.matchAll(/<span class="page-version">(v\d+)<\/span>/g)].map(match=>match[1]);
  assert.equal(versions.length,3);
  assert.equal(new Set(versions).size,1);
  const [version]=versions;
  const revision=version.slice(1);
  assert.equal(version,'v430');
  assert.ok(index.includes(`./catalog.js?v=${revision}`));
  assert.match(index,/\.\/app\.js\?v=428/);
  assert.match(index,/\.\/settings-ui\.js\?v=428/);
  assert.match(index,/\.\/bottom-nav-liquid\.js\?v=414/);
  assert.match(catalog,/\.\/app-ui\.js\?v=427/);
  assert.ok(catalog.includes(`./dish-local-images.js?v=${revision}`));
  assert.match(catalog,/\.\/dishes-ui\.js\?v=429/);
  assert.ok(catalog.includes(`./runtime-features.js?v=${revision}`));
  assert.match(catalog,/\.\/catalog-quantities\.js\?v=426/);
  assert.ok(runtime.includes(`./missing-products-fixes.js?v=${revision}`));
  assert.match(runtime,/\.\/product-item-images\.js\?v=429/);
  assert.ok(images.includes(`const APP_VERSION='${version}';`));
  assert.ok(sw.includes(`const CACHE='courses-app-${version}-r1';`));
  assert.ok(sw.includes(`./catalog.js?v=${revision}`));
  assert.match(sw,/\.\/app\.js\?v=428/);
  assert.match(sw,/\.\/settings-ui\.js\?v=428/);
  assert.ok(sw.includes(`./runtime-features.js?v=${revision}`));
  assert.match(sw,/\.\/product-item-images\.js\?v=429/);
  assert.match(sw,/\.\/app-ui\.js\?v=427/);
  assert.ok(sw.includes(`./missing-products-fixes.js?v=${revision}`));
});
