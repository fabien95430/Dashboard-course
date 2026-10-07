import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const read=name=>readFileSync(resolve(root,name),'utf8');

test('les popups de préférences partagent une coque stable',()=>{
  const source=read('settings-tab-badge.js');
  const index=read('index.html');
  for(const selector of ['#preferencesDialog','#missingProductsDialog','.recipe-customization-dialog']){
    assert.ok(source.includes(selector),selector+' doit utiliser la coque partagée');
  }
  assert.match(source,/height:min\(590px,calc\(100svh/);
  assert.match(source,/padding:20px!important/);
  assert.match(source,/border-radius:26px!important/);
  assert.match(source,/recipe-customization-dialog\[open\]\{\s*display:flex!important;\s*flex-direction:column!important/);
  assert.match(source,/backdrop-filter:blur\(8px\)!important/);
  assert.match(index,/id="missingProductsDialog" class="dialog"/);
  assert.doesNotMatch(index,/id="missingProductsDialog" class="dialog missing-products-dialog"/);
});

test('le choix d une catégorie produit ne déclenche pas un clic synthétique qui ferme le dialogue',()=>{
  const source=read('missing-products-dishes.js');
  assert.match(source,/original\?\.onclick\?\.\(\);/);
  assert.doesNotMatch(source,/original\?\.click\(\);/);
});

test('la personnalisation des recettes se réinitialise durablement et s enregistre sans fermer le popup',()=>{
  const source=read('dishes-ui.js');
  const resetStart=source.indexOf('function resetRecipeCustomizationDraft()');
  const resetEnd=source.indexOf('function recipeCustomizationMatchesBase()',resetStart);
  const saveStart=source.indexOf('function saveRecipeCustomization()');
  const saveEnd=source.indexOf('function validateDishes()',saveStart);
  assert.ok(resetStart>=0&&resetEnd>resetStart,'fonction de réinitialisation introuvable');
  assert.ok(saveStart>=0&&saveEnd>saveStart,'fonction d enregistrement introuvable');
  const reset=source.slice(resetStart,resetEnd);
  const save=source.slice(saveStart,saveEnd);
  assert.match(reset,/delete recipeCustomizations\[dish\.name\]/);
  assert.match(reset,/persistRecipeCustomizations\(\)/);
  assert.match(reset,/resetRecipeNeeds\?\.\(dish\.name\)/);
  assert.match(reset,/showToast\('Recette '\+dish\.name\+' réinitialisée'\)/);
  assert.match(save,/setRecipeNeeds\?\.\(dish\.name,recipeCustomizationNeeds\)/);
  assert.match(save,/loadRecipeCustomizationDish\(dish\.name\)/);
  assert.doesNotMatch(save,/recipeCustomizationDialog\.close\(\)/);
});

test('les ressources modifiées sont versionnées pour le cache',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  assert.match(index,/catalog\.js\?v=325/);
  assert.match(index,/settings-tab-badge\.js\?v=322/);
  assert.match(sw,/courses-app-v326-r1/);
  assert.match(sw,/missing-products-dishes\.js\?v=4/);
  assert.match(sw,/catalog\.js\?v=326/);
  assert.match(sw,/dishes-ui\.js\?v=326/);
  assert.match(sw,/dish-local-images\.js\?v=326/);
});
