import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog.js',import.meta.url),'utf8');

test('le démarrage critique reste centré sur Ma liste',()=>{
  const bootstrapStart=source.indexOf('const bootstrap=()=>{');
  const bootstrapEnd=source.indexOf("if(document.readyState==='loading')",bootstrapStart);
  assert.ok(bootstrapStart>=0&&bootstrapEnd>bootstrapStart);
  const bootstrap=source.slice(bootstrapStart,bootstrapEnd);
  assert.ok(bootstrap.includes('loadAppUi();'));
  for(const heavy of ['loadQuantities();','loadDishes();','loadLiquid();','loadDishLocalImages();','loadRepurchaseSoon();'])assert.equal(bootstrap.includes(heavy),false,heavy+' ne doit pas faire partie du démarrage critique');
});

test('le Catalogue Produits se prépare après la synchronisation de Ma liste',()=>{
  assert.ok(source.includes("document.addEventListener('courses:status-changed',event=>{"));
  assert.ok(source.includes("if(title==='Synchronisé'||title==='Mode test')startProductCatalog();"));
  assert.ok(source.includes('if(productCatalogStarted||!runtimeReady)return;'));
  assert.ok(source.includes('productCatalogStarted=true;'));
  assert.ok(source.includes('loadQuantities();'));
  assert.ok(source.includes("quantities.addEventListener('load',loadDishes,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadLiquid,{once:true});"));
  assert.ok(source.includes("liquid.addEventListener('load',markProductCatalogReady,{once:true});"));
  assert.ok(source.includes("new CustomEvent('courses:catalog-products-ready')"));
});

test('les fonctions secondaires des plats attendent l entrée dans Catalogue',()=>{
  assert.ok(source.includes("document.addEventListener('courses:view-changed',event=>{"));
  assert.ok(source.includes("if(event.detail?.view!=='catalog')return;"));
  assert.ok(source.includes('startProductCatalog();'));
  assert.ok(source.includes('startDishFeatures();'));
  assert.ok(source.includes('if(dishFeaturesStarted||!productCatalogReady)return;'));
  assert.ok(source.includes('dishFeaturesStarted=true;'));
  assert.ok(source.includes('loadDishLocalImages();'));
  assert.ok(source.includes("images.addEventListener('load',loadRepurchaseSoon,{once:true});"));
  assert.equal(source.includes('new MutationObserver'),false);
  assert.equal(source.includes('setInterval('),false);
});

test('le runtime de Ma liste reste prioritaire avant la préparation du Catalogue',()=>{
  assert.ok(source.includes('runtimeReady=true;'));
  assert.ok(source.includes('if(productCatalogRequested)startProductCatalog();'));
  const productStart=source.indexOf('const startProductCatalog=()=>{');
  const runtimeStart=source.indexOf('const loadRuntimeFeatures=()=>{');
  assert.ok(productStart>=0&&runtimeStart>productStart);
});
