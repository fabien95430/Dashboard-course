import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('le CSS principal ne conserve plus de blocs de declaration vides',()=>{
  const styles=read('styles.css').replace(/\/\*[\s\S]*?\*\//g,'');
  assert.doesNotMatch(styles,/[^{}]+\{\s*\}/);
});

test('le nettoyage CSS conserve les safe areas iOS et le plein ecran PWA',()=>{
  const styles=read('styles.css');
  assert.match(styles,/env\(safe-area-inset-top\)/);
  assert.match(styles,/env\(safe-area-inset-bottom\)/);
  assert.match(styles,/@media \(display-mode:standalone\)/);
  assert.match(styles,/@supports \(padding-bottom:env\(safe-area-inset-bottom\)\)/);
});

test('la feuille nettoyee est chargee avec la version applicative courante',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const localImages=read('dish-local-images.js');
  const version=localImages.match(/const APP_VERSION='v(\d+)'/)?.[1]||'';
  assert.match(version,/^\d+$/);
  assert.match(index,new RegExp('styles\\.css\\?v='+version));
  assert.match(sw,new RegExp('styles\\.css\\?v='+version));
  assert.equal((index.match(new RegExp('page-version\">v'+version,'g'))||[]).length,3);
});
