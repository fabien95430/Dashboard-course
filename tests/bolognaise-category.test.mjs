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

test('les trois vues et le cache référencent la même version courante',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const local=readFileSync(new URL('../dish-local-images.js',import.meta.url),'utf8');
  const version=sw.match(/const CACHE='courses-app-(v\d+)-r\d+'/i)?.[1];
  assert.ok(version,'Version du cache introuvable');
  assert.equal((html.match(new RegExp('class="page-version">'+version,'g'))||[]).length,3);
  assert.ok(html.includes('./catalog.js?'+version.replace(/^v/,'v=')));
  assert.ok(sw.includes('./catalog.js?'+version.replace(/^v/,'v=')));
  assert.ok(sw.includes('./dish-local-images.js?'+version.replace(/^v/,'v=')));
  assert.ok(source.includes('./dish-local-images.js?'+version.replace(/^v/,'v=')));
  assert.ok(local.includes("const APP_VERSION='"+version+"'"));
});
