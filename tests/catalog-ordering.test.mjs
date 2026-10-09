import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

test('les catégories du catalogue gardent Tous en tête, Favoris à la fin et le reste en ordre alphabétique',()=>{
  const app=read('app.js');
  assert.match(app,/const CATALOG_CATEGORY_ORDER=\['Toutes','Boissons','Enfant','Épicerie','Frais','Fruits & Légumes','Maison','Favoris'\]/);
  assert.match(app,/const MISSING_PRODUCT_CATEGORIES=Object\.freeze\(\['','Boissons','Enfant','Épicerie','Frais','Fruits & Légumes','Maison'\]\)/);
});

test('chaque sous-catégorie de catalog.js est stockée en ordre alphabétique',()=>{
  const source=read('catalog.js');
  const match=source.match(/groups:\s*(\{.*?\}),\s*\n\s*meta:/s);
  assert.ok(match,'groups introuvable');
  const groups=JSON.parse(match[1]);
  for(const [category,subgroups] of Object.entries(groups)){
    for(const [subgroup,names] of Object.entries(subgroups)){
      const sorted=[...names].sort((a,b)=>norm(a).localeCompare(norm(b),'fr'));
      assert.deepEqual(names,sorted,`${category} / ${subgroup} n'est pas trié`);
    }
  }
});

test('Catalogue trie aussi visuellement Tous et les catégories normales de A à Z',()=>{
  const app=read('app.js');
  assert.match(app,/const sortProductsAlpha=products=>\[\.\.\.products\]\.sort\(\(a,b\)=>a\.name\.localeCompare\(b\.name,'fr',\{sensitivity:'base'\}\)\)/);
  assert.match(app,/state\.category==='Toutes'[\s\S]*?products=sortProductsAlpha\(unique\(ALL\)\)/);
  assert.match(app,/const subs=GROUPS\[state\.category\]\|\|\{\};[\s\S]*?products=sortProductsAlpha\(unique\(/);
});

test('les noms longs ont un libellé automatique de 13 caractères maximum',()=>{
  const app=read('app.js');
  assert.match(app,/const PRODUCT_DISPLAY_MAX=13;/);
  assert.match(app,/const productDisplayName=name=>CATALOG_DISPLAY_NAMES\[name\]\|\|autoProductDisplayName\(name\)/);
  assert.match(app,/remaining=PRODUCT_DISPLAY_MAX-label\.length-1/);
});
