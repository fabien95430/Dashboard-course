import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('le shell de démarrage reste un document HTML et le service worker reste du JavaScript',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/^<!doctype html>/i);
  assert.doesNotMatch(index,/^const CACHE=/);
  assert.match(sw,/^const CACHE='courses-app-v376-r1';/);
  assert.doesNotMatch(sw,/<!doctype html>/i);
});

test('le lancement masque les états transitoires et précharge immédiatement le panier',()=>{
  const index=read('index.html');
  const startup=read('startup/app.js');
  assert.match(index,/id="startupCover"/);
  assert.match(index,/<body class="is-launching">/);
  assert.match(index,/id="securityOverlay" class="overlay security-overlay"/);
  assert.match(index,/startup\/app\.js\?v=3/);
  assert.match(startup,/function syncStartupCover/);
  assert.match(startup,/320-/);
  assert.match(startup,/La liste est vide\./);
  assert.match(startup,/Synchronisation…/);
  assert.match(startup,/new MutationObserver\(syncListLoadingPreview\)\.observe\(statusRoot/);
  assert.match(startup,/empty-list-premium-v4\.webp\?v=305/);
});

test('la version v376 est cohérente entre le shell, le cache et les modules visuels',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const catalog=read('catalog.js');
  const localImages=read('dish-local-images.js');
  assert.match(index,/page-version">v376</);
  assert.match(index,/catalog\.js\?v=376/);
  assert.match(sw,/startup\/app\.js\?v=3/);
  assert.match(sw,/catalog\.js\?v=376/);
  assert.match(sw,/dish-local-images\.js\?v=376/);
  assert.match(catalog,/dish-local-images\.js\?v=376/);
  assert.match(localImages,/const APP_VERSION='v376';/);
});
