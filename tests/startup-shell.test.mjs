import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const escapeRegExp=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function appVersion(localImages){
  const version=localImages.match(/const APP_VERSION='(v\d+)'/)?.[1]||'';
  assert.match(version,/^v\d+$/,'version applicative introuvable');
  return version;
}

test('le shell de démarrage reste un document HTML et le service worker reste du JavaScript',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/^<!doctype html>/i);
  assert.doesNotMatch(index,/^const CACHE=/);
  assert.match(sw,/^const CACHE='courses-app-v\d+-r\d+';/);
  assert.doesNotMatch(sw,/<!doctype html>/i);
});

test('le lancement reprend le flux direct sans écran de transition supplémentaire',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  // Plus de classe de lancement : l'écran de connexion est peint dès le premier rendu (v674-v675).
  assert.match(index,/<body>/);
  assert.doesNotMatch(index+read('app.js'),/is-launching/);
  // v674 : l'écran de connexion est peint dès le premier rendu, avant app.js (pas de fond vide au rechargement de mise à jour).
  assert.match(index,/id="securityOverlay" class="overlay security-overlay is-visible"/);
  assert.doesNotMatch(read('styles.css'),/body\.is-launching[^{]*\.security-(?:hero|modal)/);
  assert.doesNotMatch(index,/id="startupCover"/);
  assert.doesNotMatch(index,/startup\/app\.js/);
  assert.doesNotMatch(sw,/startup\/app\.js/);
  assert.match(index,/rel="preload" as="image" href="\.\/www\/empty-list-premium-v4\.webp\?v=305" fetchpriority="high"/);
});

test('la version courante reste cohérente entre le shell, le cache et les modules visuels',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const catalog=read('catalog.js');
  const localImages=read('dish-local-images.js');
  const version=appVersion(localImages);
  const number=version.slice(1);
  const escapedVersion=escapeRegExp(version);
  const escapedNumber=escapeRegExp(number);
  assert.equal((index.match(new RegExp('page-version">'+escapedVersion,'g'))||[]).length,3);
  assert.match(index,new RegExp('catalog\\.js\\?v='+escapedNumber));
  assert.match(catalog,new RegExp('dish-local-images\\.js\\?v='+escapedNumber));
  assert.match(sw,new RegExp('courses-app-'+escapedVersion+'-r\\d+'));
  assert.match(sw,new RegExp('catalog\\.js\\?v='+escapedNumber));
  assert.match(sw,new RegExp('dish-local-images\\.js\\?v='+escapedNumber));
});
