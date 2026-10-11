import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('la version globale visible, le cache et les visuels restent alignés',()=>{
  const index=read('index.html'),sw=read('sw.js'),images=read('dish-local-images.js');
  const versions=[...index.matchAll(/<span class="page-version">(v\d+)<\/span>/g)].map(match=>match[1]);
  assert.equal(versions.length,3);
  assert.equal(new Set(versions).size,1);
  const [version]=versions;
  assert.match(version,/^v\d+$/);
  assert.ok(images.includes(`const APP_VERSION='${version}';`));
  assert.ok(sw.includes(`const CACHE='courses-app-${version}-r1';`));
});
