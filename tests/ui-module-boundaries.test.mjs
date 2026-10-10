import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('dish-local-images reste limité aux visuels des plats',()=>{
  const source=read('dish-local-images.js');
  assert.match(source,/function localDishImage\(name\)/);
  assert.match(source,/function warmRenderedDishCards\(\)/);
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
  for(const asset of ['./missing-products-fixes.js?v=399','./missing-products-popup-ui.js?v=18','./purchase-intelligence.js?v=387'])assert.ok(runtime.includes(asset),asset+' doit être chargé par runtime-features');
  const productImagesAsset=runtime.match(/\.\/product-item-images\.js\?v=\d+/)?.[0]||'';
  assert.ok(productImagesAsset,'asset product-item-images introuvable');
});

test('le nouvel ordre de chargement reste déterministe et précaché',()=>{
  const catalog=read('catalog.js');
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(catalog,/images\.addEventListener\('load',loadAppUi,\{once:true\}\)/);
  assert.match(catalog,/const loadAppUi=\(\)=>\{[\s\S]*?script\.src='\.\/app-ui\.js\?v=400';[\s\S]*?script\.addEventListener\('load',loadRuntimeFeatures/);
  assert.match(catalog,/const loadRuntimeFeatures=\(\)=>\{[\s\S]*?script\.src='\.\/runtime-features\.js\?v=\d+';[\s\S]*?script\.addEventListener\('load',loadRepurchaseSoon/);
  const runtimeAsset=catalog.match(/\.\/runtime-features\.js\?v=\d+/)?.[0]||'';
  const settingsUiAsset=index.match(/\.\/settings-ui\.js\?v=\d+/)?.[0]||'';
  assert.ok(runtimeAsset,'asset runtime-features introuvable');
  assert.ok(settingsUiAsset,'asset settings-ui introuvable');
  assert.ok(index.indexOf('./settings-tab-badge.js?v=400')<index.indexOf(settingsUiAsset));
  for(const asset of ['./app-ui.js?v=400',runtimeAsset,settingsUiAsset])assert.ok(sw.includes(asset),asset+' absent du précache');
});
