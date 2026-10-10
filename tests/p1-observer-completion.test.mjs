import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

const formerObserverModules=[
  'dish-local-images.js','settings-tab-badge.js','app-ui.js','error-center.js','repurchase-soon.js',
  'missing-products-dishes.js','missing-products-fixes.js','missing-products-modern.js','catalog-product-admin.js','missing-products-popup-ui.js',
  'product-item-images.js','catalog-quantities.js','dish-added-marker.js','purchase-intelligence.js','settings-ui.js'
];

test('P1 ne conserve plus de MutationObserver dans les modules applicatifs concernés',()=>{
  for(const file of formerObserverModules)assert.doesNotMatch(read(file),/new MutationObserver/,file+' conserve un MutationObserver');
  assert.equal(existsSync(new URL('../error-feedback-bridge.js',import.meta.url)),false,'le bridge de lecture des toasts doit être supprimé');
});

test('les propriétaires publient les cycles transverses restants',()=>{
  const app=read('app.js'),settings=read('settings-ui.js'),missing=read('missing-products-dishes.js');
  for(const event of ['courses:status-changed','courses:lock-changed','courses:dialog-opened','courses:missing-product-category-changed'])assert.ok(app.includes("new CustomEvent('"+event),event+' absent de app.js');
  assert.match(settings,/new CustomEvent\('courses:settings-management-ready'\)/);
  assert.match(missing,/new CustomEvent\('courses:missing-requests-rendered',\{detail:\{mode\}\}\)/);
});

test('les consommateurs P1 écoutent les événements propriétaires au lieu du DOM',()=>{
  const images=read('dish-local-images.js'),appUi=read('app-ui.js'),errors=read('error-center.js'),repurchase=read('repurchase-soon.js');
  const fixes=read('missing-products-fixes.js'),popup=read('missing-products-popup-ui.js'),admin=read('catalog-product-admin.js');
  assert.match(images,/document\.addEventListener\('courses:dishes-rendered'/);
  assert.match(images,/document\.addEventListener\('courses:dish-sheet-opened'/);
  assert.match(appUi,/document\.addEventListener\('courses:list-rendered'/);
  assert.match(errors,/document\.addEventListener\('courses:status-changed',sync\)/);
  assert.match(errors,/document\.addEventListener\('courses:settings-management-ready',bindUi/);
  assert.match(repurchase,/document\.addEventListener\('courses:lock-changed'/);
  assert.match(fixes,/document\.addEventListener\('courses:missing-requests-rendered',decorateOpenAiButtons\)/);
  assert.match(popup,/document\.addEventListener\('courses:missing-requests-rendered',queueDecorate\)/);
  assert.match(admin,/document\.addEventListener\('courses:settings-management-ready',bindUi/);
});

test('Ma liste affiche son panier vide sans attendre Home Assistant et seulement sur le vrai état vide',()=>{
  const app=read('app.js'),appUi=read('app-ui.js');
  assert.match(app,/state\.error\?'Liste indisponible\.':'La liste est vide\.'/);
  assert.match(appUi,/const nativeEmpty=Boolean\(empty&&empty\.children\.length===0&&empty\.textContent\.trim\(\)==='La liste est vide\.'\)/);
  assert.match(appUi,/const shouldEnhance=Boolean\(empty&&\(nativeEmpty\|\|empty\.classList\.contains\('list-empty-state'\)\)\)/);
  assert.doesNotMatch(appUi,/listEmptyStateConfirmed/);
  assert.doesNotMatch(appUi,/document\.addEventListener\('courses:status-changed'/);
});

test('Ma liste réutilise le même panier premium pendant les rendus vides successifs',()=>{
  const appUi=read('app-ui.js');
  assert.match(appUi,/let retainedListEmptyState=null;/);
  assert.match(appUi,/if\(nativeEmpty&&retainedListEmptyState\)\{\s*root\.replaceChildren\(retainedListEmptyState\);\s*root\.classList\.add\('is-list-home-empty'\);\s*return;\s*\}/);
  assert.match(appUi,/retainedListEmptyState=empty;/);
});
