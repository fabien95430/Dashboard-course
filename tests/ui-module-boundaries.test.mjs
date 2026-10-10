import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('dish-local-images reste limité aux visuels des plats',()=>{
  const source=read('dish-local-images.js');
  assert.match(source,/function localDishImage\(name\)/);
  assert.match(source,/function localizeImage\(image,name\)/);
  assert.match(source,/function localizeCards\(grid\)/);
  for(const forbidden of ['syncPageVersions','securityViewportHeight','syncListEmptyState','installMissingProductsFixes','installProductItemImages','installPurchaseIntelligence'])assert.equal(source.includes(forbidden),false,forbidden+' ne doit plus appartenir aux images de plats');
});

test('settings-tab-badge reste limité au badge Réglages',()=>{
  const source=read('settings-tab-badge.js');
  assert.match(source,/badge\.className='settings-tab-badge'/);
  assert.match(source,/navigator\.setAppBadge/);
  for(const forbidden of ['STORAGE_PREFERRED_SERVINGS','PREFERENCE_DIALOG_SELECTOR','initApplicationManagement','initAdministratorSettings','missing-products-dishes.js'])assert.equal(source.includes(forbidden),false,forbidden+' ne doit plus appartenir au badge');
});

test('les responsabilités extraites ont des propriétaires explicites',()=>{
  const appUi=read('app-ui.js');
  const settingsUi=read('settings-ui.js');
  const runtime=read('runtime-features.js');
  assert.match(appUi,/function syncPageVersions\(\)/);
  assert.match(appUi,/function bindSecurityKeyboardViewport\(\)/);
  assert.match(appUi,/function syncListEmptyState\(root\)/);
  assert.match(settingsUi,/const STORAGE_PREFERRED_SERVINGS=/);
  assert.match(settingsUi,/const PREFERENCE_DIALOG_SELECTOR=/);
  assert.match(settingsUi,/function initApplicationManagement\(\)/);
  assert.match(settingsUi,/function initAdministratorSettings\(\)/);
  const missingFixesAsset=runtime.match(/\.\/missing-products-fixes\.js\?v=\d+/)?.[0]||'';
  const missingPopupAsset=runtime.match(/\.\/missing-products-popup-ui\.js\?v=\d+/)?.[0]||'';
  const productImagesAsset=runtime.match(/\.\/product-item-images\.js\?v=\d+/)?.[0]||'';
  const purchaseIntelligenceAsset=runtime.match(/\.\/purchase-intelligence\.js\?v=\d+/)?.[0]||'';
  for(const [asset,label] of [[missingFixesAsset,'missing-products-fixes'],[missingPopupAsset,'missing-products-popup-ui'],[productImagesAsset,'product-item-images'],[purchaseIntelligenceAsset,'purchase-intelligence']])assert.ok(asset,'asset '+label+' introuvable');
});


test('P4 conserve un démarrage déterministe et diffère seulement les fonctions Catalogue',()=>{
  const catalog=read('catalog.js');
  const index=read('index.html');
  const sw=read('sw.js');
  const appUiAsset=catalog.match(/\.\/app-ui\.js\?v=\d+/)?.[0]||'';
  const runtimeAsset=catalog.match(/\.\/runtime-features\.js\?v=\d+/)?.[0]||'';
  const dishImagesAsset=catalog.match(/\.\/dish-local-images\.js\?v=\d+/)?.[0]||'';
  const repurchaseAsset=catalog.match(/\.\/repurchase-soon\.js\?v=\d+/)?.[0]||'';
  const quantitiesAsset=catalog.match(/\.\/catalog-quantities\.js\?v=\d+/)?.[0]||'';
  const dishesAsset=catalog.match(/\.\/dishes-ui\.js\?v=\d+/)?.[0]||'';
  const liquidAsset=catalog.match(/\.\/catalog-liquid\.js\?v=\d+/)?.[0]||'';
  const settingsUiAsset=index.match(/\.\/settings-ui\.js\?v=\d+/)?.[0]||'';
  const settingsBadgeAsset=index.match(/\.\/settings-tab-badge\.js\?v=\d+/)?.[0]||'';
  for(const [asset,label] of [[appUiAsset,'app-ui'],[runtimeAsset,'runtime-features'],[dishImagesAsset,'dish-local-images'],[repurchaseAsset,'repurchase-soon'],[quantitiesAsset,'catalog-quantities'],[dishesAsset,'dishes-ui'],[liquidAsset,'catalog-liquid'],[settingsUiAsset,'settings-ui'],[settingsBadgeAsset,'settings-tab-badge']])assert.ok(asset,'asset '+label+' introuvable');
  assert.match(catalog,/script\.addEventListener\('load',loadRuntimeFeatures,\{once:true\}\)/);
  assert.match(catalog,/document\.addEventListener\('courses:view-changed',event=>\{/);
  assert.match(catalog,/if\(event\.detail\?\.view==='catalog'\)startCatalogFeatures\(\);/);
  assert.match(catalog,/if\(catalogFeaturesStarted\|\|!runtimeReady\)return;/);
  assert.match(catalog,/images\.addEventListener\('load',loadRepurchaseSoon,\{once:true\}\)/);
  assert.match(catalog,/script\.addEventListener\('load',loadQuantities,\{once:true\}\)/);
  assert.match(catalog,/quantities\.addEventListener\('load',loadDishes,\{once:true\}\)/);
  assert.match(catalog,/script\.addEventListener\('load',loadLiquid,\{once:true\}\)/);
  assert.ok(index.indexOf(settingsBadgeAsset)<index.indexOf(settingsUiAsset));
  for(const asset of [appUiAsset,runtimeAsset,dishImagesAsset,repurchaseAsset,quantitiesAsset,dishesAsset,liquidAsset,settingsUiAsset,settingsBadgeAsset])assert.ok(sw.includes(asset),asset+' absent du précache');
});
