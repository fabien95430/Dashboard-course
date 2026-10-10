import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('le shell de démarrage reste un document HTML et le service worker reste du JavaScript',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/^<!doctype html>/i);
  assert.doesNotMatch(index,/^const CACHE=/);
  assert.match(sw,/^const CACHE='courses-app-v391-r1';/);
  assert.doesNotMatch(sw,/<!doctype html>/i);
});

test('le lancement reprend le flux direct sans écran de transition supplémentaire',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/<body class="is-launching">/);
  assert.match(index,/id="securityOverlay" class="overlay security-overlay"/);
  assert.doesNotMatch(index,/id="startupCover"/);
  assert.doesNotMatch(index,/startup\/app\.js/);
  assert.doesNotMatch(sw,/startup\/app\.js/);
  assert.doesNotMatch(index,/rel="preload" as="image" href="\.\/www\/empty-list-premium-v4\.webp\?v=305"/);
});

test('la version v391 est cohérente entre le shell, le cache et les modules visuels',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const catalog=read('catalog.js');
  const localImages=read('dish-local-images.js');
  assert.match(index,/page-version">v391</);
  assert.match(index,/catalog\.js\?v=391/);
  assert.match(sw,/catalog\.js\?v=391/);
  assert.match(sw,/dish-local-images\.js\?v=391/);
  assert.match(catalog,/dish-local-images\.js\?v=391/);
  assert.match(localImages,/const APP_VERSION='v391';/);
});
