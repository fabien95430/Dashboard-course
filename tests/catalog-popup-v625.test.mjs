import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('v625 : le bouton Réglages ouvre « Catalogue des produits » avec deux vues', ()=>{
  const html=read('index.html');
  assert.match(html,/id="settingsMissingProductsBtn"[\s\S]{0,600}Catalogue des produits[\s\S]{0,200}Ajouter ou supprimer des produits et des plats/);
  assert.match(html,/data-catalog-view="add"/);
  assert.match(html,/data-catalog-view="remove"/);
  assert.match(html,/id="catalogRemovePanel"/);
  assert.match(html,/id="missingAddStart"/);
  assert.match(html,/id="missingAddCancel"/);
});

test('v625 : le module propriétaire pilote les vues et annonce le changement au catalogue', ()=>{
  const js=read('missing-products-dishes.js');
  assert.match(js,/function applyLayout\(\)/);
  assert.match(js,/courses:catalog-view-changed/);
  assert.match(js,/Précision pour la photo · facultatif/);
  assert.match(read('catalog-product-admin.js'),/courses:catalog-view-changed/);
});

test('v625 : actions de ligne intégrées, sans menu flottant, OpenAI neutre', ()=>{
  const js=read('missing-products-popup-ui.js');
  assert.match(js,/data-row-tool/);
  assert.doesNotMatch(js,/function openMenu/);
  assert.match(js,/Intégrer avec OpenAI/);
});

test('v625 : catégories en grille de 3 colonnes et attribut hidden respecté', ()=>{
  const css=read('styles.css');
  assert.match(css,/#missingProductsDialog#missingProductsDialog \[hidden\]\{display:none!important\}/);
  assert.match(css,/#missingProductsDialog \.missing-category-grid\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
});
