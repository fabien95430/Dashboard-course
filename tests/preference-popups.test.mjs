import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const read=name=>readFileSync(resolve(root,name),'utf8');

test('les popups de préférences partagent une coque stable',()=>{
  const source=read('settings-tab-badge.js');
  for(const selector of ['#preferencesDialog','#missingProductsDialog','.recipe-customization-dialog']){
    assert.ok(source.includes(selector),selector+' doit utiliser la coque partagée');
  }
  assert.match(source,/height:min\(590px,calc\(100svh/);
  assert.match(source,/padding:20px!important/);
  assert.match(source,/border-radius:26px!important/);
  assert.match(source,/recipe-customization-dialog\[open\]\{\s*display:flex!important;\s*flex-direction:column!important/);
  assert.match(source,/backdrop-filter:blur\(8px\)!important/);
});

test('le choix d une catégorie produit ne déclenche pas un clic synthétique qui ferme le dialogue',()=>{
  const source=read('missing-products-dishes.js');
  assert.match(source,/original\?\.onclick\?\.\(\);/);
  assert.doesNotMatch(source,/original\?\.click\(\);/);
});

test('les ressources modifiées sont versionnées pour le cache',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/catalog\.js\?v=322/);
  assert.match(index,/settings-tab-badge\.js\?v=322/);
  assert.match(sw,/courses-app-v322-r1/);
  assert.match(sw,/missing-products-dishes\.js\?v=4/);
  assert.match(sw,/dish-local-images\.js\?v=322/);
});
