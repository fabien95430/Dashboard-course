import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('recherche : aucune catégorie ni filtre de plats sélectionné pendant une recherche',()=>{
  const app=read('app.js'),dishes=read('dishes-ui.js');
  assert.match(app,/classList\.toggle\('is-active',!searching&&\(button\.dataset\.category/);
  assert.match(app,/state\.productQuery=e\.target\.value\|\|'';syncCategorySelection\(\);/);
  assert.match(dishes,/classList\.toggle\('is-active',!searching&&button\.dataset\.value===filter\)/);
  // La recherche de plats couvre tous les plats, sans le filtre de catégorie.
  assert.match(dishes,/if\(!needle\)\{\s*if\(filter==='Favoris'/);
});

test('recherche : effacée à la fermeture du clavier, sauf toucher dans les résultats',()=>{
  const app=read('app.js');
  assert.match(app,/UI\.productSearch\.addEventListener\('blur'/);
  assert.match(app,/Date\.now\(\)-catalogResultPointerAt<700/);
  assert.match(app,/function clearCatalogSearch\(\)/);
});

test('recherche sans résultat : raccourci vers Catalogue des produits › Ajout, nom prérempli',()=>{
  const app=read('app.js'),dishes=read('dishes-ui.js'),missing=read('missing-products-dishes.js');
  assert.match(app,/Demander ce '\+label\+' au catalogue/);
  assert.match(app,/window\.COURSES_MISSING_ADD\.openWith\(\{type,name\}\)/);
  assert.match(dishes,/COURSES_CATALOG_REQUEST_EMPTY\(empty,'dishes',query/);
  assert.match(missing,/openWith\(\{type,name\}=\{\}\)\{\s*settingsButton\.click\(\);\s*setMode\(type==='dishes'\?'dishes':'products'/);
  assert.match(missing,/setStep\('form'\);/);
});
