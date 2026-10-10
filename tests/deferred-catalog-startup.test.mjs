import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog.js',import.meta.url),'utf8');

test('P4 garde le démarrage critique séparé des fonctions Catalogue lourdes',()=>{
  const bootstrapStart=source.indexOf('const bootstrap=()=>{');
  const bootstrapEnd=source.indexOf("if(document.readyState==='loading')",bootstrapStart);
  assert.ok(bootstrapStart>=0&&bootstrapEnd>bootstrapStart);
  const bootstrap=source.slice(bootstrapStart,bootstrapEnd);
  assert.ok(bootstrap.includes('loadAppUi();'));
  for(const heavy of ['loadDishLocalImages();','loadRepurchaseSoon();','loadQuantities();','loadDishes();','loadLiquid();'])assert.equal(bootstrap.includes(heavy),false,heavy+' ne doit pas faire partie du démarrage critique');
});

test('les fonctions Catalogue se déclenchent à l entrée dans la vue propriétaire sans observation ni polling',()=>{
  assert.ok(source.includes("document.addEventListener('courses:view-changed',event=>{"));
  assert.ok(source.includes("if(event.detail?.view==='catalog')startCatalogFeatures();"));
  assert.ok(source.includes('if(catalogFeaturesStarted||!runtimeReady)return;'));
  assert.ok(source.includes('catalogFeaturesStarted=true;'));
  assert.ok(source.includes('loadDishLocalImages();'));
  assert.equal(source.includes('new MutationObserver'),false);
  assert.equal(source.includes('setInterval('),false);
});

test('la chaîne différée conserve son ordre et attend les fonctions runtime de Ma liste',()=>{
  assert.ok(source.includes("images.addEventListener('load',loadRepurchaseSoon,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadQuantities,{once:true});"));
  assert.ok(source.includes("quantities.addEventListener('load',loadDishes,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadLiquid,{once:true});"));
  assert.ok(source.includes('runtimeReady=true;'));
  assert.ok(source.includes('if(catalogFeaturesRequested)startCatalogFeatures();'));
});
