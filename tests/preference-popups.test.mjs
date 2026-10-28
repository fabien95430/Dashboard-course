import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const read=name=>readFileSync(resolve(root,name),'utf8');

test('les popups de Réglages partagent une coque iOS et le même défilement interne',()=>{
  const src=read('settings-ui.js'),css=read('styles.css'),index=read('index.html'),dishes=read('dishes-ui.js');
  assert.match(css,/\.settings-sheet\{[\s\S]*?height:min\(78svh/);
  assert.match(css,/\.settings-sheet::backdrop\{[\s\S]*?blur\(13px\)/);
  for(const id of ['connectionDialog','preferencesDialog','missingProductsDialog','settingsDialog'])assert.match(index,new RegExp('id="'+id+'" class="[^"]*settings-sheet"'));
  assert.match(dishes,/recipeCustomizationDialog\.className='dialog recipe-customization-dialog settings-sheet'/);
  assert.match(src,/function ensurePreferenceDialogScroll\(dialog\)[\s\S]*?content\.className='preference-dialog-scroll'/);
  assert.match(src,/\.preference-dialog-scroll\{[\s\S]*?flex:1 1 auto;[\s\S]*?min-height:0;[\s\S]*?overflow:auto/);
  assert.match(css,/\.settings-sheet#missingProductsDialog \.missing-products-list/);
});

test('le design moderne des produits manquants ne redéfinit plus les dimensions de la coque extérieure',()=>{
  const source=read('missing-products-modern.js');
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bwidth:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bheight:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bmax-height:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bpadding(?:-left|-right)?:/);
  assert.doesNotMatch(source,/#missingProductsDialog\{[^}]*\bborder-radius:/);
});

test('le clavier ne déplace ni ne redimensionne les popups de préférences pendant la saisie',()=>{
  const source=read('settings-ui.js');
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
  const end=source.indexOf("settingsButton.addEventListener('click'",start);
  assert.ok(start>=0&&end>start,'gestionnaire de suppression des plats introuvable');
  const handler=source.slice(start,end);
  assert.match(handler,/const remove=event\.target\.closest\('\[data-remove-missing-dish\]'\);/);
  assert.match(handler,/if\(!remove\)return;/);
  assert.match(handler,/event\.stopPropagation\(\);/);
  assert.ok(handler.indexOf('event.stopPropagation()')<handler.indexOf('removeDish('));
});

test('les notifications produit évitent le doublon ajout puis génération et expliquent les refus',()=>{
  const source=read('missing-products-dishes.js');
  assert.match(source,/const PRODUCT_QUEUE_NOTIFICATION_DELAY_MS=10000;/);
  assert.match(source,/setTimeout\(\(\)=>\{[\s\S]*?showProductNotification\([\s\S]*?'Produit à générer',[\s\S]*?a été ajouté aux produits manquants/);
  assert.match(source,/document\.addEventListener\('courses:integration-started',[\s\S]*?cancelQueuedProductNotification\(event\.detail\?\.id\)/);
  assert.match(source,/function notifyProductAlreadyPresent\([\s\S]*?'Produit déjà présent',[\s\S]*?Aucun ajout effectué\./);
  assert.match(source,/function notifyProductAlreadyPending\([\s\S]*?'Produit déjà en attente',[\s\S]*?Aucun doublon créé\./);
  assert.match(source,/if\(catalog\.has\(normalize\(item\.name\)\)\)\{[\s\S]*?notifyProductAlreadyPresent\(item\.id,item\.name\)[\s\S]*?\}else\{[\s\S]*?notifyRequest\(item\.name\);[\s\S]*?void notifyProductQueued\(item\.id\);/);
});

test('les notifications finales distinguent succès, suppression et étape d échec',()=>{
  const source=read('scripts/send_web_push.mjs');
  assert.match(source,/failureStageLabel=\{/);
  assert.match(source,/repository:'Validation ou publication du dépôt'/);
  assert.match(source,/deployment:'Validation ou publication du dépôt \/ GitHub Pages'/);
  assert.match(source,/deleteProduct\?'Produit supprimé':itemType==='product'\?'Produit intégré':'Plat intégré'/);
  assert.match(source,/deleteProduct\?'Suppression échouée':'Intégration échouée'/);
});

test('la précision image reste séparée du nom et atteint les deux intégrations produit',()=>{
  const missing=read('missing-products-dishes.js');
  const fixes=read('missing-products-fixes.js');
  const store=read('missing-requests-store.js');
  const generator=read('scripts/integrate_product_openai.py');
  assert.match(store,/productImageHints:'courses-missing-product-image-hints-v1'/);
  assert.match(missing,/id="missingProductImageHint"/);
  assert.match(missing,/REQUESTS\.productImageHint\(item\.name\)/);
  assert.match(missing,/function saveProductImageHintDraft\(\)/);
  assert.match(missing,/Précision fournie par l’utilisateur pour le visuel ou le contenant/);
  assert.match(missing,/conditionnement visible/);
  assert.match(fixes,/PRODUCT_IMAGE_HINT_MARKER='\|\|__courses_image_hint__:'/);
  assert.match(fixes,/REQUESTS\.productImageHint\(item\?\.name\)/);
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
  assert.match(index,/<dialog id=\"missingProductsDialog\" class=\"dialog settings-sheet\" tabindex=\"-1\">/);
  assert.doesNotMatch(index,/<dialog id="missingProductsDialog"[^>]*\bautofocus\b/);
  assert.match(app,/function openMissingProducts\(\)[\s\S]*?showNeutralDialog\(UI\.missingProductsDialog\)/);
  assert.doesNotMatch(popup,/function bindOpenFallback\(dialog\)/);
  assert.doesNotMatch(popup,/function ensureCloseButton\(dialog\)/);
  assert.match(app,/bindDialogBackdropClose\(UI\.missingProductsDialog\)/);
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
  const settings=read('settings-ui.js');
  const repurchase=read('repurchase-soon.js');
  assert.match(index,/Connexion OAuth sécurisée\. L’autorisation reste chiffrée sur cet appareil\./);
  assert.match(index,/Mot de passe non enregistré : il déchiffre uniquement l’accès Home Assistant local\./);
  assert.match(dishes,/Modifiez ingrédients et quantités pour 2 personnes\./);
  assert.match(dishes,/À ajouter manuellement si besoin\./);
  assert.match(missing,/Demandez l’ajout d’un produit ou d’un plat\./);
  assert.match(settings,/Documentation, historique et informations\./);
  assert.match(repurchase,/Suggestions selon vos habitudes\. Aucun ajout automatique\./);
  assert.match(repurchase,/Activez l’historique des achats dans Préférences\./);
  assert.match(repurchase,/Les suggestions apparaissent quand un prochain achat approche\./);
});


test('les sous-vues de Réglages sans flèche gardent leur navigation et leur fermeture',()=>{
  const settings=read('settings-ui.js'),errors=read('error-center.js'),catalog=read('catalog-product-admin.js'),app=read('app.js');
  const html=read('index.html'),css=read('styles.css');
  assert.doesNotMatch(settings,/preference-title-back|dataset.preferenceBack/);
  assert.match(settings,/function setTitle\(label,parent=''\)\{/);
  assert.match(settings,/setTitle\('Gestion de l’application','preferences'\)/);
  assert.match(errors,/COURSES_SETTINGS_NAV\.setTitle\('Messages d’erreur','management'\)/);
  assert.doesNotMatch(catalog,/COURSES_SETTINGS_NAV|preferencesDialog/);
  assert.match(app,/bindDialogBackdropClose\(UI\.preferencesDialog\)/);
  assert.match(html,/id="settingsDialog" class="dialog security-settings-dialog settings-sheet"/);
  assert.match(css,/\.settings-sheet::before\{content:"";position:absolute/);
});


test('les feuilles de Réglages touchent les bords iPhone, sans toucher aux safe areas',()=>{
  const css=read('styles.css');
  const shell=css.slice(css.indexOf('.settings-sheet{'),css.indexOf('.settings-sheet::-webkit-scrollbar'));
  assert.match(shell,/width:100vw!important;width:100dvw!important/);
  assert.match(shell,/max-width:none!important;max-inline-size:none!important/);
  assert.match(shell,/left:0!important;right:0!important;margin:0!important/);
  assert.match(shell,/height:min\(78svh/);
  assert.match(shell,/safe-area-inset-top/);
  assert.match(shell,/safe-area-inset-bottom/);
  assert.match(css,/@media\(min-width:650px\)\{\.settings-sheet\{[^}]*max-width:480px!important/);
  assert.match(css,/\.settings-sheet#preferencesDialog \.preference-dialog-scroll>\.dialog-actions\{position:sticky/);
  assert.match(css,/\.settings-sheet#connectionDialog \.dialog-actions\{flex:0 0 auto;margin-top:auto!important/);
});

test('le titre produits manquants conserve son icône et le style des actions est cohérent',()=>{
  const source=read('missing-products-dishes.js'),modern=read('missing-products-modern.js');
  const html=read('index.html'),notifications=read('courses-notifications.js');
  assert.match(source,/dialog\.querySelector\('\.missing-products-header \.settings-sheet-title'\)/);
  assert.doesNotMatch(source,/dialogTitle=dialog\.querySelector\('\.missing-products-header h3'\)/);
  assert.match(html,/settings-sheet-title">Connexion Home Assistant<\/span><\/h3>\s*<p class="dialog-intro">/);
  assert.match(html,/<div class="missing-add-actions" hidden>\s*<button id="missingAddCancel" class="secondary" type="button">Annuler<\/button>\s*<button id="addMissingProduct" class="primary" type="button" disabled>Ajouter<\/button>/);
  assert.doesNotMatch(modern,/missing-products-add|missing-product-row/);
  assert.match(notifications,/Notifications indisponibles : Service Worker non prêt/);
});

test('Réglages aligne les éléments internes sur une colonne centrale sobre',()=>{
  const css=read('styles.css');
  assert.match(css,/--sheet-inner-max:400px/);
  assert.match(css,/\.settings-sheet > :where\(:not\(\.courses-openai-feedback\)\),\s*\.settings-sheet \.preference-dialog-scroll\{[^}]*width:100%!important;[^}]*max-width:var\(--sheet-inner-max\)!important;[^}]*margin-inline:auto!important/s);
  assert.match(css,/\.settings-sheet \.preference-dialog-scroll > :is\(\.field,\.preference-options,\.dialog-actions,#preferencesApplicationManagement,#preferencesNotificationsPanel\)\{/);
  assert.match(css,/\.settings-sheet \.dialog-actions\{\s*display:flex;\s*align-items:stretch;\s*justify-content:center;/);
  assert.match(css,/\.settings-sheet \.dialog-actions > button:only-child\{[^}]*width:100%!important;[^}]*margin-inline:auto!important/s);
  assert.match(css,/\.settings-sheet\.recipe-customization-dialog \.dialog-actions > button\{[^}]*flex:1 1 0;[^}]*min-width:0;/s);
  assert.match(css,/\.settings-sheet \.security-lock-now\{[^}]*width:100%!important;[^}]*margin-inline:auto!important/);
  assert.match(css,/\.settings-sheet \.dialog-intro,[^\n]*\{[^}]*padding-left:58px!important;[^}]*max-width:var\(--sheet-inner-max\)!important/);
});

test('la colonne centrée ne réduit pas la coque bord à bord ni les zones de saisie',()=>{
  const css=read('styles.css'),ui=read('settings-ui.js'),markup=read('index.html');
  assert.match(css,/width:100vw!important;width:100dvw!important;max-width:none!important/);
  assert.match(css,/height:min\(78svh/);
  assert.match(css,/@media\(min-width:650px\)\{\.settings-sheet\{[^}]*max-width:480px!important/);
  assert.match(css,/\.settings-sheet:not\(\[open\]\)\{display:none!important\}/);
  assert.match(ui,/function lockPreferenceDialog\(dialog\)[\s\S]*?const rect=dialog\.getBoundingClientRect\(\)/);
  for(const id of ['connectionDialog','preferencesDialog','missingProductsDialog','settingsDialog'])
    assert.match(markup,new RegExp('id="'+id+'" class="[^"]*settings-sheet"'));
});

test('Gestion et Messages d erreur réutilisent le trait du Catalogue et gardent leurs interactions',()=>{
  const css=read('styles.css');
  const admin=read('catalog-product-admin.js');
  const errors=read('error-center.js');
  assert.match(css,/#preferencesDialog \.courses-error-tabs::after\{/);
  assert.match(css,/#missingProductsDialog \.missing-mode-lens\{[\s\S]*?transform:translate3d\(var\(--catalog-lens-x\),0,0\)/);
  assert.doesNotMatch(css,/courses-product-admin-modes/);
  assert.doesNotMatch(admin,/modeTrack|data-catalog-admin-mode/);
  assert.match(errors,/let filterTrack=null/);
  assert.match(errors,/freshTrack\.replaceWith\(filterTrack\)/);
  assert.match(errors,/COURSES_SEGMENTED_LIQUID\?\.bindSegment\(filterTrack/);
  assert.match(errors,/role="tablist" aria-label="Filtrer les messages d’erreur"/);
  // Les validations des suppressions, les filtres et les actions HA restent propriétaires.
  assert.match(admin,/data-confirm-delete/);
  assert.match(errors,/data-error-filter/);
  assert.match(errors,/data-error-action/);
});


test('v607 : en-têtes lisibles, champs ouverts par l utilisateur seulement, recettes choisies dans une liste',()=>{
  const css=read('styles.css'),html=read('index.html'),dishes=read('dishes-ui.js');
  assert.match(css,/--sheet-muted:#55685b;/);
  assert.match(css,/\.settings-sheet \.dialog-intro,[^\n]*\{[^}]*font-size:var\(--fs-sub\)!important;[^}]*line-height:20px!important/);
  assert.match(css,/\.settings-sheet \.settings-sheet-icon\{position:absolute;left:0;top:0;width:44px;height:44px;/);
  assert.doesNotMatch(css,/translateY\(11px\)/);
  assert.match(css,/\.settings-sheet \.field>span,[^{]*\{[^}]*font-size:var\(--fs-label\)!important;[^}]*text-transform:none!important/);
  assert.match(css,/\.settings-sheet \.security-setting-copy strong,[^{]*\{[^}]*font-size:var\(--fs-text\)!important;font-weight:400!important/);
  for(const id of ['connectionDialog','preferencesDialog','settingsDialog'])assert.match(html,new RegExp('<dialog id="'+id+'"[^>]*tabindex="-1" autofocus>'));
  assert.match(dishes,/recipeCustomizationDialog\.autofocus=true;/);
  const open=dishes.slice(dishes.indexOf('function openRecipeCustomization()'),dishes.indexOf('function saveRecipeCustomization()'));
  assert.match(open,/loadRecipeCustomizationDish\(''\);/);
  assert.doesNotMatch(open,/DISHES\[0\]/);
  assert.match(dishes,/function setRecipeCustomizationStep\(dish,keepCategory\)\{[\s\S]*?dataset\.step=dish\?'edit':'choose'/);
  assert.match(dishes,/recipeCustomizationPicker\.addEventListener\('click',[\s\S]*?selectRecipeCustomizationDish\(/);
  assert.match(dishes,/\[data-step="choose"\] :is\(\.recipe-customization-list,\.recipe-customization-status,\.recipe-customization-add,\.dialog-actions\)\{display:none!important\}/);
});

test('v617 : les sous-écrans de Gestion ont une flèche retour à la place de l icône, sans tuile différée',()=>{
  const settings=read('settings-ui.js'),css=read('styles.css'),catalog=read('catalog-product-admin.js');
  assert.match(settings,/backButton\.className='settings-sheet-back';/);
  assert.match(settings,/backButton\?\.addEventListener\('click',\(\)=>showManagement\(\)\)/);
  assert.match(settings,/const back=parent==='management';[\s\S]*?backButton\.hidden=!back;[\s\S]*?classList\.toggle\('has-back',back\)/);
  assert.match(settings,/setTitle\('Notifications','management'\)/);
  assert.match(css,/\.settings-sheet \.settings-sheet-back\{position:absolute;[^}]*width:44px;height:44px;/);
  assert.match(css,/\.settings-sheet h3\.has-back \.settings-sheet-icon\{visibility:hidden\}/);
  // v624 : le Catalogue a quitté Gestion pour « Catalogue des produits » ; plus aucune tuile différée dans Gestion.
  assert.doesNotMatch(settings,/preferencesProductCatalog/);
  assert.doesNotMatch(catalog,/preferencesProductCatalog/);
  const ui=settings.indexOf("managementPanel.appendChild(notificationsButton)"),err=settings.indexOf('managementPanel.appendChild(errorMessagesButton)');
  assert.ok(ui>0&&ui<err,'ordre Documentation, Notifications, Messages d erreur');
});

test('v618 : Messages d erreur en liste groupée, détails dépliés sur place, sélecteur à deux mots',()=>{
  const errors=read('error-center.js'),css=read('styles.css');
  assert.doesNotMatch(errors,/courses-error-summary|courses-error-card/);
  assert.match(errors,/let openErrorId='';/);
  assert.match(errors,/data-error-toggle="'\+escapeHtml\(entry\.id\)\+'"/);
  assert.match(errors,/const toggle=event\.target\.closest\('\[data-error-toggle\]'\);[\s\S]*?openErrorId=openErrorId===id\?'':id;renderPanel\(\)/);
  assert.match(errors,/<pre class="courses-error-details">/);
  assert.match(errors,/data-error-resolve="'\+escapeHtml\(entry\.key\)\+'">Marquer comme résolue/);
  assert.match(errors,/currentFilter==='resolved'&&resolved\.length\?'<button class="courses-error-clear"/);
  assert.match(errors,/Aucune erreur à traiter/);
  assert.match(css,/#preferencesDialog \.courses-error-tabs\{[^}]*grid-template-columns:130px 130px!important;[^}]*background:transparent!important/);
  assert.match(css,/#preferencesDialog \.courses-error-tabs > button\{[^}]*font:inherit!important;[^}]*font-size:var\(--fs-text\)!important/);
});

test('v621 : recettes par catégories repliables avec flèche retour, et rafraîchissement qui affiche son état',()=>{
  const dishes=read('dishes-ui.js'),app=read('app.js'),css=read('styles.css'),html=read('index.html');
  assert.doesNotMatch(dishes,/recipe-dish-current|recipeCustomizationCurrent/);
  assert.match(dishes,/data-recipe-category="'\+escapeHtml\(category\)\+'"/);
  assert.match(dishes,/recipeCustomizationOpenCategory=recipeCustomizationOpenCategory===next\?'':next;\s*setRecipeCustomizationStep\(null,true\);/);
  assert.match(dishes,/recipeCustomizationBack\.className='settings-sheet-back';/);
  assert.match(dishes,/recipeCustomizationBack\.addEventListener\('click',\(\)=>\{[\s\S]*?loadRecipeCustomizationDish\('',true\)/);
  assert.match(dishes,/label\.textContent=dish\?\.name\|\|'Personnalisation des recettes';/);
  assert.match(dishes,/\.recipe-cat-head span\{[^}]*font-weight:600/);
  assert.match(html,/<p id="settingsHeaderStatus" aria-live="polite">Personnalisez votre expérience<\/p>/);
  assert.match(html,/class="refresh-done"[^>]*><use href="#i-check">/);
  assert.match(app,/setHeaderRefreshStatus\('Vérification de la mise à jour…','busy'\)/);
  assert.match(app,/setHeaderRefreshStatus\('À jour · vérifié à '\+headerRefreshTime\(\),'ok'\)/);
  assert.match(app,/button\._doneTimer=setTimeout\(\(\)=>button\.classList\.remove\('is-done'\),1500\)/);
  assert.match(css,/@keyframes header-refresh-spin\{to\{transform:rotate\(-360deg\)\}\}/);
  assert.match(css,/#refreshBtn\.is-refreshing::after\{[^}]*animation:header-refresh-halo 1\.6s/);
});
