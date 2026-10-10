import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('catalog.js');
const sw=read('sw.js');

test('le démarrage critique reste centré sur Ma liste',()=>{
  const bootstrapStart=source.indexOf('const bootstrap=()=>{');
  const bootstrapEnd=source.indexOf("if(document.readyState==='loading')",bootstrapStart);
  assert.ok(bootstrapStart>=0&&bootstrapEnd>bootstrapStart);
  const bootstrap=source.slice(bootstrapStart,bootstrapEnd);
  assert.ok(bootstrap.includes('loadAppUi();'));
  for(const heavy of ['loadQuantities();','loadDishes();','loadLiquid();','loadDishLocalImages();','loadRepurchaseSoon();'])assert.equal(bootstrap.includes(heavy),false,heavy+' ne doit pas faire partie du démarrage critique');
});

test('le Catalogue Produits devient prêt sans charger la branche Plats',()=>{
  assert.ok(source.includes("document.addEventListener('courses:status-changed',event=>{"));
  assert.ok(source.includes("if(title==='Synchronisé'||title==='Mode test')startProductCatalog();"));
  const start=source.indexOf('const startProductCatalog=()=>{');
  const end=source.indexOf('const startCatalogView=()=>{',start);
  const block=source.slice(start,end);
  assert.ok(block.includes('if(productCatalogStarted||!runtimeReady)return;'));
  assert.ok(block.includes('productCatalogStarted=true;'));
  assert.ok(block.includes('markProductCatalogReady();'));
  assert.equal(block.includes('loadQuantities();'),false);
  assert.equal(block.includes('loadDishes();'),false);
  assert.ok(source.includes("new CustomEvent('courses:catalog-products-ready')"));
});

test('les fonctions secondaires attendent l entrée dans Catalogue',()=>{
  const start=source.indexOf('const startCatalogView=()=>{');
  const end=source.indexOf("document.addEventListener('courses:status-changed'",start);
  const block=source.slice(start,end);
  assert.ok(block.includes('startProductCatalog();'));
  assert.ok(block.includes('loadRepurchaseSoon();'));
  assert.ok(block.includes('startDishFeatures();'));
  assert.ok(source.includes('if(dishFeaturesStarted||!productCatalogReady)return;'));
  assert.ok(source.includes('dishFeaturesStarted=true;'));
  assert.ok(source.includes('loadQuantities();'));
  assert.ok(source.includes("quantities.addEventListener('load',loadDishes,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadLiquid,{once:true});"));
  assert.ok(source.includes("liquid.addEventListener('load',loadDishLocalImages,{once:true});"));
  assert.ok(source.includes("images.addEventListener('load',loadDishAddedMarker,{once:true});"));
  assert.equal(source.includes('new MutationObserver'),false);
  assert.equal(source.includes('setInterval('),false);
});

test('le précache hors ligne conserve les fonctions différées sans les exécuter au démarrage',()=>{
  const shell=sw.match(/const SHELL=(\[[^\n]+\]);/)?.[1]||'';
  assert.ok(shell);
  for(const deferred of ['dishes-ui.js?v=428','catalog-quantities.js?v=426','catalog-liquid.js?v=297','dish-local-images.js?v=428','dish-added-marker.js?v=408','repurchase-soon.js?v=410','catalog-product-admin.js?v=410'])assert.ok(shell.includes(deferred),deferred+' absent du précache hors ligne');
  for(const startup of ['catalog.js?v=428','app.js?v=428','settings-ui.js?v=428','runtime-features.js?v=428','product-item-images.js?v=428'])assert.ok(shell.includes(startup),startup+' absent du shell');
});

test('le runtime de Ma liste reste prioritaire avant la préparation du Catalogue',()=>{
  assert.ok(source.includes('runtimeReady=true;'));
  assert.ok(source.includes('if(productCatalogRequested)startProductCatalog();'));
  const productStart=source.indexOf('const startProductCatalog=()=>{');
  const runtimeStart=source.indexOf('const loadRuntimeFeatures=()=>{');
  assert.ok(productStart>=0&&runtimeStart>productStart);
});
