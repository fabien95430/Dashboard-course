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

test('supprimer un produit manquant garde le popup ouvert',()=>{
  const source=read('app.js');
  const start=source.indexOf('UI.missingProductsList.onclick=event=>{');
  const end=source.indexOf("$('#changePasswordBtn')",start);
  assert.ok(start>=0&&end>start,'gestionnaire de suppression introuvable');
  const handler=source.slice(start,end);
  assert.match(handler,/const button=event\.target\.closest\('\[data-remove-missing\]'\);/);
  assert.match(handler,/if\(!button\)return;/);
  assert.match(handler,/event\.stopPropagation\(\);/);
  assert.ok(handler.indexOf('event.stopPropagation()')<handler.indexOf('removeMissingProduct('));
});

test('supprimer un plat manquant garde le popup ouvert',()=>{
  const source=read('missing-products-dishes.js');
  const start=source.indexOf("dishesList.addEventListener('click',event=>{");
  const end=source.indexOf('new MutationObserver(',start);
  assert.ok(start>=0&&end>start,'gestionnaire de suppression des plats introuvable');
  const handler=source.slice(start,end);
  assert.match(handler,/const remove=event\.target\.closest\('\[data-remove-missing-dish\]'\);/);
  assert.match(handler,/if\(!remove\)return;/);
  assert.match(handler,/event\.stopPropagation\(\);/);
  assert.ok(handler.indexOf('event.stopPropagation()')<handler.indexOf('removeDish('));
});

test('un nouveau produit à générer déclenche la notification système dédiée',()=>{
  const source=read('missing-products-dishes.js');
  assert.match(source,/registration\.showNotification\('Produit à générer',\{/);
  assert.match(source,/body:'Un produit a été ajouté à la liste'/);
  assert.match(source,/if\(!knownProductIds\.has\(item\.id\)\)\{[\s\S]*?notifyRequest\(item\.name\);[\s\S]*?void notifyProductQueued\(item\.id\);/);
});

test('la précision image reste séparée du nom et atteint les deux intégrations produit',()=>{
  const missing=read('missing-products-dishes.js');
  const fixes=read('missing-products-fixes.js');
  const generator=read('scripts/integrate_product_openai.py');
  assert.match(missing,/STORAGE_PRODUCT_IMAGE_HINTS='courses-missing-product-image-hints-v1'/);
  assert.match(missing,/id="missingProductImageHint"/);
  assert.match(missing,/Utilisée uniquement pour l’image · le nom reste inchangé/);
  assert.match(missing,/imageHint:productImageHint\(name\)/);
  assert.match(missing,/function saveProductImageHintDraft\(\)/);
  assert.match(missing,/Précision visuelle fournie par l’utilisateur \(uniquement pour l’image\)/);
  assert.match(fixes,/PRODUCT_IMAGE_HINT_MARKER='\|\|__courses_image_hint__:'/);
  assert.match(fixes,/dish_category:type==='product'\?productOpenAiCategory\(item\):String\(item\.category\|\|''\)/);
  assert.match(generator,/IMAGE_HINT_MARKER = "\|\|__courses_image_hint__:"/);
  assert.match(generator,/def parse_product_category\(value: str\) -> tuple\[str,str\]:/);
  assert.match(generator,/Précision visuelle prioritaire fournie par l’utilisateur/);
  assert.match(generator,/image=generate_image\(name,category,subgroup,image_hint,api_key\)/);
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
  assert.match(reset,/showRecipeCustomizationFeedback\('Recette '\+dish\.name\+' réinitialisée'\)/);
  assert.match(save,/setRecipeNeeds\?\.\(dish\.name,recipeCustomizationNeeds\)/);
  assert.match(save,/loadRecipeCustomizationDish\(dish\.name\)/);
  assert.doesNotMatch(save,/recipeCustomizationDialog\.close\(\)/);
});

test('la recherche des recettes personnalisées reste fermée et vide à l ouverture',()=>{
  const source=read('dishes-ui.js');
  const start=source.indexOf('function openRecipeCustomization()');
  const end=source.indexOf('function saveRecipeCustomization()',start);
  assert.ok(start>=0&&end>start,'fonction d ouverture introuvable');
  const open=source.slice(start,end);
  const show=open.indexOf("recipeCustomizationDialog.showModal()");
  const focus=open.indexOf("recipeCustomizationDialog.focus({preventScroll:true})");
  const hide=open.lastIndexOf('hideRecipeCustomizationSuggestions()');
  assert.match(open,/recipeCustomizationSearch\.value='';/);
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


test('les validations restent dans leur popup tant que celui-ci reste ouvert',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  const missing=read('missing-products-dishes.js');
  const styles=read('styles.css');
  assert.match(app,/connectionDialogFeedback: document\.getElementById\('connectionDialogFeedback'\)/);
  assert.match(app,/missingProductsFeedback: document\.getElementById\('missingProductsFeedback'\)/);
  assert.match(app,/settingsDialogFeedback: document\.getElementById\('settingsDialogFeedback'\)/);
  assert.match(app,/if\(!nextUrl\)\{setDialogFeedback\(UI\.connectionDialogFeedback,'Entre une adresse HTTPS Home Assistant valide\.','error'\);return\}/);
  const addStart=app.indexOf('function addMissingProduct()');
  const addEnd=app.indexOf('function removeMissingProduct',addStart);
  const add=app.slice(addStart,addEnd);
  assert.match(add,/setDialogFeedback\(UI\.missingProductsFeedback,'Indique le nom du produit','error'\)/);
  assert.match(add,/setDialogFeedback\(UI\.missingProductsFeedback,'Ce produit est déjà noté','error'\)/);
  assert.match(add,/setDialogFeedback\(UI\.missingProductsFeedback,'Produit ajouté'\)/);
  assert.doesNotMatch(add,/\btoast\(/);
  assert.match(app,/setDialogFeedback\(UI\.settingsDialogFeedback,'Verrouillage après '\+next\+' min'\)/);
  assert.match(app,/setDialogFeedback\(UI\.settingsDialogFeedback,'Mot de passe modifié'\)/);
  const resetStart=dishes.indexOf('function resetRecipeCustomizationDraft()');
  const resetEnd=dishes.indexOf('function recipeCustomizationMatchesBase()',resetStart);
  const saveStart=dishes.indexOf('function saveRecipeCustomization()');
  const saveEnd=dishes.indexOf('function validateDishes()',saveStart);
  assert.match(dishes.slice(resetStart,resetEnd),/showRecipeCustomizationFeedback\(/);
  assert.doesNotMatch(dishes.slice(resetStart,resetEnd),/showToast\(/);
  assert.match(dishes.slice(saveStart,saveEnd),/showRecipeCustomizationFeedback\(/);
  assert.doesNotMatch(dishes.slice(saveStart,saveEnd),/showToast\(/);
  assert.match(missing,/const toast=dialog\?\.open\?document\.getElementById\('missingProductsFeedback'\):document\.getElementById\('toast'\)/);
  assert.match(styles,/\.dialog-feedback,\.courses-openai-feedback\{/);
  assert.match(styles,/\.dialog-feedback,\.courses-openai-feedback\{[\s\S]*?white-space:nowrap;[\s\S]*?overflow:hidden;[\s\S]*?text-overflow:ellipsis;[\s\S]*?max-width:100%/);
});

test('les demandes manquantes affichent catégorie et statut compact sur la même ligne',()=>{
  const missing=read('missing-products-dishes.js');
  const fixes=read('missing-products-fixes.js');
  const popup=read('missing-products-popup-ui.js');
  assert.ok(missing.includes("appNotify('Ajout en cours',name);"));
  assert.ok(fixes.includes("const progressLabel=cancelled?'Annulé':failed?'Erreur':'En cours';"));
  assert.ok(fixes.includes('background:rgba(255,149,0,.11)!important;color:#b96500!important'));
  assert.ok(fixes.includes('.missing-dish-progress.is-error{background:rgba(255,59,48,.10)!important;color:#d93025!important}'));
  assert.ok(popup.includes('display:flex!important;flex-flow:row wrap!important;align-items:center!important'));
  assert.ok(popup.includes('small:not(.missing-dish-error):not(.missing-dish-progress)'));
});

test('le popup produits et plats manquants conserve l ouverture native et peut toujours se fermer',()=>{
  const index=read('index.html');
  const app=read('app.js');
  const popup=read('missing-products-popup-ui.js');
  assert.match(index,/<dialog id="missingProductsDialog" class="dialog" tabindex="-1">/);
  assert.doesNotMatch(index,/<dialog id="missingProductsDialog"[^>]*\bautofocus\b/);
  assert.match(app,/function openMissingProducts\(\)[\s\S]*?showNeutralDialog\(UI\.missingProductsDialog\)/);
  assert.doesNotMatch(popup,/function bindOpenFallback\(dialog\)/);
  assert.match(popup,/function ensureCloseButton\(dialog\)/);
  assert.match(popup,/button\.className='missing-products-close'/);
  assert.match(popup,/button\.setAttribute\('aria-label','Fermer'\)/);
  assert.match(popup,/button\.addEventListener\('click',[\s\S]*?closePopup\(dialog\)/);
  assert.match(popup,/dialog\.addEventListener\('cancel',event=>\{[\s\S]*?event\.preventDefault\(\);[\s\S]*?closePopup\(dialog\)/);
});

test('les décorations du popup sont idempotentes et ne nourrissent plus leurs MutationObserver',()=>{
  const fixes=read('missing-products-fixes.js');
  const popup=read('missing-products-popup-ui.js');
  assert.match(fixes,/const progressLabel=cancelled\?'Annulé':failed\?'Erreur':'En cours';/);
  assert.match(fixes,/if\(progress\.textContent!==progressLabel\)progress\.textContent=progressLabel;/);
  assert.match(popup,/if\(thumb\.dataset\.requestThumbType!==type\)\{[\s\S]*?thumb\.innerHTML=thumbSvg\(type\)/);
  assert.match(popup,/if\(integrate\.textContent!=='Ajouté ✓'\)integrate\.textContent='Ajouté ✓';/);
  assert.match(popup,/if\(integrate\.textContent!==label\)integrate\.textContent=label;/);
  assert.doesNotMatch(popup,/row\.classList\.remove\('is-request-product','is-request-dish','is-request-dessert'\)/);
});

test('les explications de popup restent courtes et essentielles',()=>{
  const index=read('index.html');
  const dishes=read('dishes-ui.js');
  const missing=read('missing-products-dishes.js');
  const settings=read('settings-tab-badge.js');
  const repurchase=read('repurchase-soon.js');
  assert.match(index,/Connexion OAuth sécurisée\. L’autorisation reste chiffrée sur cet appareil\./);
  assert.match(index,/Mot de passe non enregistré : il déchiffre uniquement l’accès Home Assistant local\./);
  assert.match(dishes,/Modifiez ingrédients et quantités pour 2 personnes\. Les portions s’adaptent automatiquement\./);
  assert.match(dishes,/À ajouter manuellement si besoin\./);
  assert.match(missing,/Ajoutez les produits ou plats absents du catalogue\./);
  assert.match(settings,/Documentation, historique et informations de l’application\./);
  assert.match(repurchase,/Suggestions selon vos habitudes\. Aucun ajout automatique\./);
  assert.match(repurchase,/Activez l’historique des achats dans Préférences\./);
  assert.match(repurchase,/Les suggestions apparaissent quand un prochain achat approche\./);
});

test('la version visible runtime passe à v365 et recharge le moteur de recettes',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),settings=read('settings-tab-badge.js'),sw=read('sw.js'),localImages=read('dish-local-images.js');
  assert.match(index,/styles\.css\?v=348/);
  assert.match(index,/catalog\.js\?v=364/);
  assert.match(index,/app\.js\?v=356/);
  assert.match(index,/settings-tab-badge\.js\?v=364/);
  assert.equal((index.match(/page-version\">v365/g)||[]).length,3);
  assert.match(catalog,/dishes-ui\.js\?v=364/);
  assert.match(catalog,/catalog-quantities\.js\?v=364/);
  assert.match(catalog,/repurchase-soon\.js\?v=363/);
  assert.match(catalog,/dish-local-images\.js\?v=364/);
  assert.match(settings,/missing-products-dishes\.js\?v=363/);
  assert.match(sw,/courses-app-v365-r1/);
  assert.match(sw,/catalog\.js\?v=364/);
  assert.match(sw,/app\.js\?v=356/);
  assert.match(sw,/settings-tab-badge\.js\?v=364/);
  assert.match(sw,/missing-products-dishes\.js\?v=363/);
  assert.match(sw,/dishes-ui\.js\?v=364/);
  assert.match(sw,/catalog-quantities\.js\?v=364/);
  assert.match(sw,/repurchase-soon\.js\?v=363/);
  assert.match(sw,/missing-products-fixes\.js\?v=19/);
  assert.match(sw,/missing-products-popup-ui\.js\?v=18/);
  assert.match(sw,/dish-local-images\.js\?v=364/);
  assert.match(localImages,/const APP_VERSION='v365'/);
  assert.match(localImages,/missing-products-fixes\.js\?v=20/);
  assert.match(localImages,/missing-products-popup-ui\.js\?v=18/);
});