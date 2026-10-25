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
  const cacheDeclarations=[...sw.matchAll(/^const CACHE='courses-app-(v\d+)-r([1-9]\d*)';$/gm)];
  assert.equal(cacheDeclarations.length,1,'Le cache doit déclarer une seule version globale avec une révision positive');
  assert.equal(cacheDeclarations[0][1],version,'Le cache service worker doit suivre la version visible');
  assert.ok(Number.isSafeInteger(Number(cacheDeclarations[0][2])),'La révision du cache doit être un entier sûr');
});
