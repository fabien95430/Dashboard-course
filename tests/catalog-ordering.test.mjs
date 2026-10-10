import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

test('les catégories du catalogue gardent Tous en tête, Favoris à la fin et le reste en ordre alphabétique',()=>{
  const app=read('app.js');
  assert.match(app,/const CATALOG_CATEGORY_ORDER=\['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons','Favoris'\]/);
  const requests=read('missing-requests-store.js');
assert.match(requests,/const PRODUCT_CATEGORIES=Object\.freeze\(\['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons'\]\)/);
assert.match(app,/const MISSING_PRODUCT_CATEGORIES=MISSING_REQUESTS\.productCategories;/);
});

test('chaque sous-catégorie de catalog.js est stockée en ordre alphabétique',()=>{
  const source=read('catalog.js');
  const match=source.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s);
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


test('chaque produit appartient à une seule catégorie principale cohérente',()=>{
  const source=read('catalog.js');
  const match=source.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s);
  assert.ok(match,'groups introuvable');
  const groups=JSON.parse(match[1]);
  const locations=new Map();
  for(const [category,subgroups] of Object.entries(groups))for(const [sub,names] of Object.entries(subgroups))for(const name of names){
    const key=norm(name);
    assert.ok(!locations.has(key),`produit dupliqué: ${name}`);
    locations.set(key,{name,category,sub});
  }
  assert.equal(locations.get(norm('Lait'))?.category,'Frais');
  assert.equal(locations.get(norm('Poulet'))?.category,'Viandes & poissons');
  assert.equal(locations.get(norm('Saumon'))?.category,'Viandes & poissons');
  assert.equal(locations.get(norm('Pain'))?.category,'Boulangerie');
  assert.equal(locations.get(norm('Paprika'))?.category,'Cuisine');
  assert.equal(locations.get(norm('Chips'))?.category,'Apéritif & snacks');
  assert.equal(locations.get(norm('Shampoing'))?.category,'Hygiène & soins');
  assert.equal(locations.get(norm('Piles AA'))?.sub,'Équipement');
  assert.equal(locations.get(norm('Pile AAA'))?.sub,'Équipement');
});

test('les images unitaires suivent dynamiquement toutes les catégories du catalogue',()=>{
  const images=read('product-item-images.js');
  assert.doesNotMatch(images,/const CATEGORIES=/);
  assert.match(images,/Object\.values\(window\.COURSES_CATALOG\?\.groups\|\|\{\}\)/);
});
