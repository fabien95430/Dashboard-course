import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const read=name=>readFileSync(resolve(root,name),'utf8');

test('les popups de préférences utilisent la même coque extérieure et un scroll interne',()=>{
  const source=read('settings-tab-badge.js');
  assert.match(source,/#preferencesDialog,\s*#missingProductsDialog,\s*\.recipe-customization-dialog\{[\s\S]*?width:min\(calc\(100% - 28px\),430px\)!important;[\s\S]*?height:min\(590px,calc\(100svh[\s\S]*?padding:20px!important;[\s\S]*?border-radius:26px!important;[\s\S]*?overflow:hidden!important/);
  assert.match(source,/#preferencesDialog\[open\],\s*#missingProductsDialog\[open\],\s*\.recipe-customization-dialog\[open\]\{\s*display:flex!important;\s*flex-direction:column!important/);
  assert.match(source,/function ensurePreferenceDialogScroll\(dialog\)[\s\S]*?content\.className='preference-dialog-scroll'/);
  assert.match(source,/\.preference-dialog-scroll\{[\s\S]*?flex:1 1 auto;[\s\S]*?min-height:0;[\s\S]*?overflow:auto/);
  assert.match(source,/#missingProductsDialog \.missing-products-list,\s*#missingProductsDialog \.missing-dishes-list\{[\s\S]*?flex:1 1 auto!important;[\s\S]*?min-height:0!important;[\s\S]*?max-height:none!important;[\s\S]*?overflow:auto!important/);
  assert.match(source,/#preferencesDialog::backdrop,\s*#missingProductsDialog::backdrop,\s*\.recipe-customization-dialog::backdrop\{[\s\S]*?backdrop-filter:blur\(8px\)!important/);
});

test('le design moderne des produits manquants ne redéfinit plus la coque extérieure',()=>{
  const source=read('missing-products-modern.js');
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bwidth:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bheight:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bmax-height:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bpadding(?:-left|-right)?:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bborder-radius:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\boverflow(?:-y)?:/);
});

test('le clavier ne déplace ni ne redimensionne les popups de préférences pendant la saisie',()=>{
  const source=read('settings-tab-badge.js');
  const selector=source.match(/const PREFERENCE_DIALOG_SELECTOR='([^']+)'/)?.[1];
  assert.equal(selector,'#preferencesDialog,#missingProductsDialog,.recipe-customization-dialog');
  assert.doesNotMatch(selector,/#settingsDialog|#connectionDialog/);
  assert.match(source,/const rect=dialog\.getBoundingClientRect\(\)/);
  assert.match(source,/document\.addEventListener\('pointerdown',[\s\S]*?lockPreferenceDialog\(preferenceDialogFor\(event\.target\)\)/);
  assert.match(source,/document\.addEventListener\('focusin',[\s\S]*?lockPreferenceDialog\(preferenceDialogFor\(event\.target\)\)/);
  assert.match(source,/document\.addEventListener\('focusout',[\s\S]*?schedulePreferenceDialogUnlock\(preferenceDialogFor\(event\.target\)\)/);
  assert.match(source,/#preferencesDialog\.is-preference-keyboard-locked,[\s\S]*?position:fixed!important;[\s\S]*?top:var\(--preference-dialog-lock-top\)!important;[\s\S]*?height:var\(--preference-dialog-lock-height\)!important;[\s\S]*?margin:0!important/);
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

test('la recherche des recettes personnalisées reste fermée à l ouverture',()=>{
  const source=read('dishes-ui.js');
  const start=source.indexOf('function openRecipeCustomization()');
  const end=source.indexOf('function saveRecipeCustomization()',start);
  assert.ok(start>=0&&end>start,'fonction d ouverture introuvable');
  const open=source.slice(start,end);
  const show=open.indexOf("recipeCustomizationDialog.showModal()");
  const focus=open.indexOf("recipeCustomizationDialog.focus({preventScroll:true})");
  const hide=open.lastIndexOf('hideRecipeCustomizationSuggestions()');
  assert.ok(show>=0,'showModal introuvable');
  assert.ok(focus>show,'le dialogue doit reprendre le focus après showModal');
  assert.ok(hide>focus,'les suggestions doivent être refermées après la gestion du focus');
});

test('un ingrédient du catalogue peut être ajouté à une recette personnalisée puis repris dans la fiche du plat',()=>{
  const source=read('dishes-ui.js');
  assert.match(source,/recipe-customization-add-button[^\n]*Ajouter un ingrédient/);
  assert.match(source,/const matches=\[\.\.\.CATALOG_NAMES\]/);
  assert.match(source,/recipeCustomizationSelection\.add\(name\)/);
  assert.match(source,/saved\.map\(String\)\.filter\(name=>CATALOG_NAMES\.has\(name\)\)/);
  assert.match(source,/const selected=recipeIngredientsForDish\(dish,recipeCustomizationSelection\)\.filter\(name=>recipeCustomizationSelection\.has\(name\)\)/);
  assert.match(source,/dishSheetList\.innerHTML=recipeIngredientsForDish\(currentDish\)\.map\(name=>/);
});

test('la version visible passe à v340 et les ressources de personnalisation sont rechargées',()=>{
  const index=read('index.html');
  const catalog=read('catalog.js');
  const settings=read('settings-tab-badge.js');
  const sw=read('sw.js');
  const localImages=read('dish-local-images.js');
  assert.match(index,/styles\.css\?v=339/);
  assert.match(index,/catalog\.js\?v=340/);
  assert.match(index,/app\.js\?v=339/);
  assert.match(index,/settings-tab-badge\.js\?v=337/);
  assert.equal((index.match(/page-version\">v340/g)||[]).length,3);
  assert.match(catalog,/dishes-ui\.js\?v=340/);
  assert.match(catalog,/dish-local-images\.js\?v=340/);
  assert.match(settings,/missing-products-modern\.js\?v=6/);
  assert.match(sw,/courses-app-v340-r1/);
  assert.match(sw,/styles\.css\?v=339/);
  assert.match(sw,/catalog\.js\?v=340/);
  assert.match(sw,/app\.js\?v=339/);
  assert.match(sw,/settings-tab-badge\.js\?v=337/);
  assert.match(sw,/dishes-ui\.js\?v=340/);
  assert.match(sw,/dish-local-images\.js\?v=340/);
  assert.match(sw,/missing-products-modern\.js\?v=6/);
  assert.match(localImages,/const APP_VERSION='v340'/);
});