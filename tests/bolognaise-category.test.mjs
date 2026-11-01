import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
const firstIifeEnd=source.indexOf('\n(() => {',15);
if(firstIifeEnd<0)throw new Error('Catalogue initial introuvable');
const sandbox={window:{}};
vm.runInNewContext(source.slice(0,firstIifeEnd),sandbox,{filename:'catalog.js'});
const catalog=sandbox.window.COURSES_CATALOG;
const groups=catalog.groups;
const occurrences=Object.entries(groups).flatMap(([category,subcategories])=>
  Object.entries(subcategories).flatMap(([subcategory,items])=>
    items.filter(item=>item==='Bolognaise').map(item=>({category,subcategory,item}))
  )
);

test('Bolognaise reste un produit unique en Épicerie → Sauces & condiments',()=>{
  assert.equal(occurrences.length,1);
  assert.equal(occurrences[0].category,'Épicerie');
  assert.equal(occurrences[0].subcategory,'Sauces & condiments');
  assert.equal(occurrences[0].item,'Bolognaise');
  assert.equal(Object.hasOwn(groups.Maison,'Sauces'),false);
});

test('le conditionnement et la référence HA restent inchangés',()=>{
  const quantities=readFileSync(new URL('../catalog-quantities.js',import.meta.url),'utf8');
  assert.match(quantities,/"Bolognaise":"Pot"/);
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/todo\.courses/);
});

test('le cache invalide seulement la nouvelle Bolognaise en plus des précédents visuels',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const line=sw.split('\n').find(line=>line.startsWith('const UPDATED_ITEM_VISUALS='));
  assert.ok(line);
  const assets=JSON.parse(line.split('=')[1].replace(/;$/,''));
  assert.equal(assets.length,14);
  assert.equal(new Set(assets).size,14);
  assert.ok(assets.includes('./www/Items/bolognaise.webp'));
  assert.match(sw,/const CACHE='courses-app-v715-r1'/);
});

test('les trois vues et le cache référencent tous la version v715',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const local=readFileSync(new URL('../dish-local-images.js',import.meta.url),'utf8');
  assert.equal((html.match(/class="page-version">v715/g)||[]).length,3);
  assert.match(html,/\.\/catalog\.js\?v=715/);
  assert.match(sw,/\.\/catalog\.js\?v=715/);
  assert.match(sw,/\.\/dish-local-images\.js\?v=715/);
  assert.match(source,/\.\/dish-local-images\.js\?v=715/);
  assert.match(local,/const APP_VERSION='v715'/);
});
