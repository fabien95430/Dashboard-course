import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Catalogue entre toujours sur Produits et Plats reste une action explicite',()=>{
  const dishes=read('dishes-ui.js'),settings=read('settings-ui.js');
  assert.match(dishes,/let mode='products';/);
  assert.match(dishes,/setMode\('products',true\)/);
  assert.match(dishes,/courses:view-changed[\s\S]*view==='catalog'&&mode!=='products'[\s\S]*setMode\('products'\)/);
  assert.doesNotMatch(dishes,/STORAGE_MODE|localStorage\.setItem\([^\n]*catalog-mode|localStorage\.getItem\([^\n]*catalog-mode/);
  assert.doesNotMatch(settings,/preferencesCatalogMode|Ouverture du Catalogue|applyPreferredCatalogMode|bindCatalogEntry/);
  assert.match(settings,/removeItem\('courses-catalog-preferred-mode-v1'\)/);
  assert.match(settings,/removeItem\('courses-catalog-mode-v1'\)/);
});

test('Ma liste garde la priorité et le Catalogue caché nest plus construit',()=>{
  const app=read('app.js');
  assert.match(app,/loading="'\+\(compact\?'eager':'lazy'\)\+'/);
  assert.match(app,/function renderCategories\(\)[\s\S]*catalogView[^\n]*is-active[^\n]*return/);
  assert.match(app,/function renderProducts\(\)[\s\S]*catalogView[^\n]*is-active[^\n]*return/);
  assert.match(app,/if\(state\.view==='catalog'\)\{renderCategories\(\);renderProducts\(\)\}/);
  const renderView=app.slice(app.indexOf('function renderView(){'),app.indexOf('function renderSettingsPage(){'));
  assert.doesNotMatch(renderView,/renderCategories\(\)|renderProducts\(\)/);
});

test('les images produits respectent la visibilité et ne possèdent plus ladministration',()=>{
  const images=read('product-item-images.js');
  assert.match(images,/image\.loading=eager\?'eager':'lazy'/);
  assert.match(images,/catalogView[^\n]*is-active[^\n]*return/);
  assert.match(images,/courses:view-changed/);
  assert.doesNotMatch(images,/decorateAll/);
  assert.doesNotMatch(images,/catalog-product-admin\.js/);
});

test('les propriétaires secondaires sont chargés depuis leur vrai contexte',()=>{
  const catalog=read('catalog.js'),settings=read('settings-ui.js');
  assert.match(catalog,/courses:settings-management-opened',loadCatalogProductAdmin/);
  assert.match(catalog,/loadRepurchaseSoon\(\)/);
  assert.match(catalog,/loadDishAddedMarker/);
  assert.doesNotMatch(settings,/data-dish-added-marker|dish-added-marker\.js/);
  assert.match(settings,/new CustomEvent\('courses:settings-management-opened'\)/);
});
