import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const source=read('catalog.js');
const match=source.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s);
assert.ok(match,'catalog.js doit conserver la source du catalogue');
const groups=JSON.parse(match[1]);
const items=groups['Petit-déj & snacks'];
const entries=Object.values(items).flat();
const slug=value=>String(value).toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

test('Petit-déj & snacks contient les 53 produits attendus sans doublon ni image absente',()=>{
  assert.equal(entries.length,53);
  assert.equal(new Set(entries).size,53);
  assert.deepEqual(Object.fromEntries(Object.entries(items).map(([key,values])=>[key,values.length])),{
    'Apéritif':12,'Biscuits & goûters':16,'Café & thé':15,'Petit-déjeuner':10
  });
  for(const name of entries)assert.ok(existsSync(new URL('www/Items/'+slug(name)+'.webp',root)),'WebP absent : '+name);
});

test('sept produits nouveaux et regroupement Café & thé',()=>{
  for(const name of ['Beurre de cacahuète','Pancakes'])assert.ok(items['Petit-déjeuner'].includes(name));
  for(const name of ['Chocolat blanc','Muffins'])assert.ok(items['Biscuits & goûters'].includes(name));
  for(const name of ['Pop-corn','Gressins','Biscuits apéritifs'])assert.ok(items['Apéritif'].includes(name));
  for(const name of ['Café en grains','Café moulu','Café soluble','Thé noir','Thé vert']){
    assert.ok(items['Café & thé'].includes(name),name+' absent de Café & thé');
    assert.ok(!items['Petit-déjeuner'].includes(name),name+' encore dans Petit-déjeuner');
  }
});

test('orthographes corrigées et noms historiques HA compatibles',()=>{
  for(const name of ['Spéculoos','Sirop d’érable'])assert.ok(entries.includes(name));
  for(const old of ['Speculos','Sirot d’érable'])assert.ok(!entries.includes(old));
  const app=read('app.js');
  const declaration=app.match(/const norm = value => \{[\s\S]*?\n\};/);
  assert.ok(declaration,'normalisation des noms absente');
  const context=vm.createContext({});
  vm.runInContext(declaration[0]+';globalThis.normalize=norm;',context);
  assert.equal(context.normalize('Speculos'),context.normalize('Spéculoos'));
  assert.equal(context.normalize('Sirot d’érable'),context.normalize('Sirop d’érable'));
  const qty=read('catalog-quantities.js');
  assert.match(qty,/"Speculos":"Paquet"/);
  assert.match(qty,/"Spéculoos":"Paquet"/);
  assert.match(qty,/"Sirot d’érable":"Bouteille"/);
  assert.match(qty,/"Sirop d’érable":"Bouteille"/);
  assert.match(read('dishes-ui.js'),/Speculos':'Spéculoos/);
});
