import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('les styles Plats sont prêts avant la création de leur interface',()=>{
  const catalog=read('catalog.js');
  assert.match(catalog,/ensureStylesheet\('link\[data-catalog-dishes\]'[^\n]+\)/);
  assert.match(catalog,/ensureStylesheet\('link\[data-catalog-liquid\]'[^\n]+\)/);
  assert.match(catalog,/loadDishStyles\(\)\.then\(\(\)=>\{[\s\S]*?script\.src='\.\/dishes-ui\.js\?v=\d+';/);
});

test('le Catalogue ne réintroduit aucune version CSS figée',()=>{
  const dishes=read('dishes.css');
  const liquid=read('catalog-liquid.css');
  assert.doesNotMatch(dishes,/\.catalog-view \.page-header h1::after\{content:"v\d+/);
  assert.doesNotMatch(liquid,/\.catalog-view \.page-header h1::after\{content:"v\d+/);
  assert.doesNotMatch(dishes,/\.catalog-view \.page-header p \.page-version\{display:none!important\}/);
});
