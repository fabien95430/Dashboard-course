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
  const end=source.indexOf('UI.changePasswordBtn.onclick',start);
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
  const lockStart=app.indexOf('function setAutoLockMinutes(value)');
  const lockEnd=app.indexOf('async function changeLocalPassword()',lockStart);
  assert.match(app.slice(lockStart,lockEnd),/setDialogFeedback\(UI\.settingsDialogFeedback,'Enregistré'\)/);
  assert.match(app,/preferencesDialogFeedback: document\.getElementById\('preferencesDialogFeedback'\)/);
  assert.match(app,/document\.addEventListener\('courses:preferences-saved',\(\)=>setDialogFeedback\(UI\.preferencesDialogFeedback,'Enregistré'\)\)/);
  assert.match(app,/async function saveConnectionEntity\(\)\{[\s\S]*?setDialogFeedback\(UI\.connectionDialogFeedback,'Enregistré'\)/);
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
  assert.match(dishes,/<p class="dialog-intro">Ingrédients et quantités pour 2 personnes\.<\/p>/);
  assert.match(dishes,/À ajouter manuellement si besoin\./);
  assert.match(missing,/Ajoutez les produits ou plats absents du catalogue\./);
  assert.match(settings,/Documentation, historique et informations de l’application\./);
  assert.match(repurchase,/Suggestions selon vos habitudes\. Aucun ajout automatique\./);
  assert.match(repurchase,/Activez l’historique des achats dans Préférences\./);
  assert.match(repurchase,/Les suggestions apparaissent quand un prochain achat approche\./);
});


test('les sous-vues de Réglages sans flèche gardent leur navigation et leur fermeture',()=>{
  const settings=read('settings-ui.js'),errors=read('error-center.js'),catalog=read('catalog-product-admin.js'),app=read('app.js');
  const html=read('index.html'),css=read('styles.css');
  assert.doesNotMatch(settings,/preference-title-back|dataset.preferenceBack/);
  assert.match(settings,/function setTitle\(label\)\{/);
  assert.match(settings,/setTitle\('Gestion de l’application','preferences'\)/);
  assert.match(errors,/COURSES_SETTINGS_NAV\.setTitle\('Messages d’erreur','management'\)/);
  assert.match(catalog,/COURSES_SETTINGS_NAV\.setTitle\('Catalogue produit','management'\)/);
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
  assert.match(css,/\.settings-sheet :is\(#connectionDialogFeedback,#preferencesDialogFeedback,#settingsDialogFeedback\)\{position:absolute!important;[^}]*bottom:max\(24px,env\(safe-area-inset-bottom\)\)/);
});

test('le titre produits manquants conserve son icône et le style des actions est cohérent',()=>{
  const source=read('missing-products-dishes.js'),modern=read('missing-products-modern.js');
  const html=read('index.html'),notifications=read('courses-notifications.js');
  assert.match(source,/dialog\.querySelector\('\.missing-products-header \.settings-sheet-title'\)/);
  assert.doesNotMatch(source,/dialogTitle=dialog\.querySelector\('\.missing-products-header h3'\)/);
  assert.match(html,/settings-sheet-title">Connexion Home Assistant<\/span><\/h3>\s*<p class="dialog-intro">/);
  assert.match(modern,/background:linear-gradient\(160deg,#32664a,#214b36\)!important/);
  assert.match(notifications,/Notifications indisponibles : Service Worker non prêt/);
});

test('Réglages aligne les éléments internes sur une colonne centrale sobre',()=>{
  const css=read('styles.css');
  assert.match(css,/--sheet-inner-max:400px/);
  assert.match(css,/\.settings-sheet > \*,\s*\.settings-sheet \.preference-dialog-scroll\{[^}]*width:100%!important;[^}]*max-width:var\(--sheet-inner-max\)!important;[^}]*margin-inline:auto!important/s);
  assert.match(css,/\.settings-sheet \.preference-dialog-scroll > :is\(\.field,\.preference-options,\.dialog-actions,#preferencesApplicationManagement,#preferencesNotificationsPanel\)\{/);
  assert.match(css,/\.settings-sheet \.dialog-actions\{\s*display:flex;\s*align-items:stretch;\s*justify-content:center;/);
  assert.match(css,/\.settings-sheet \.dialog-actions > button:only-child\{[^}]*width:100%!important;[^}]*margin-inline:auto!important/s);
  assert.match(css,/\.settings-sheet\.recipe-customization-dialog \.dialog-actions > button\{[^}]*flex:1 1 0;[^}]*min-width:0;/s);
  assert.match(css,/\.settings-sheet h3,\.settings-sheet \.preference-dialog-scroll>h3\{[^}]*max-width:var\(--sheet-inner-max\)!important;[^}]*margin:0 auto!important;[^}]*padding:0 0 0 58px!important;[^}]*font-size:20px!important;[^}]*font-weight:600!important;[^}]*line-height:24px!important;[^}]*white-space:nowrap!important/);
  assert.match(css,/\.settings-sheet \.settings-sheet-icon\{position:absolute;left:0;top:0;width:44px;height:44px;/);
  assert.match(css,/\.settings-sheet \.dialog-intro,[^\n]*\{[^}]*margin:2px auto 21px!important;[^}]*padding-left:58px!important;[^}]*line-height:18px!important;[^}]*max-width:var\(--sheet-inner-max\)!important;[^}]*white-space:nowrap!important/);
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
  assert.match(css,/#preferencesDialog \.courses-product-admin-modes::after,[\s\S]*?#preferencesDialog \.courses-error-tabs::after\{/);
  assert.match(css,/#preferencesDialog \.courses-product-admin-modes > button\.is-active,[\s\S]*?background:transparent!important/);
  assert.match(admin,/let modeTrack=null/);
  assert.match(admin,/freshTrack\.replaceWith\(modeTrack\)/);
  assert.match(admin,/COURSES_SEGMENTED_LIQUID\?\.bindSegment\(modeTrack/);
  assert.match(errors,/let filterTrack=null/);
  assert.match(errors,/freshTrack\.replaceWith\(filterTrack\)/);
  assert.match(errors,/COURSES_SEGMENTED_LIQUID\?\.bindSegment\(filterTrack/);
  assert.match(errors,/role="tablist" aria-label="Filtrer les messages d’erreur"/);
  // Les validations des suppressions, les filtres et les actions HA restent propriétaires.
  assert.match(admin,/data-confirm-delete/);
  assert.match(errors,/data-error-filter/);
  assert.match(errors,/data-error-action/);
});


test('Connexion, Préférences et Sécurité enregistrent immédiatement, sans bouton Enregistrer',()=>{
  const html=read('index.html'),app=read('app.js'),settings=read('settings-ui.js'),history=read('purchase-intelligence.js');
  for(const id of ['connectionDialog','preferencesDialog','settingsDialog']){
    const start=html.indexOf('<dialog id="'+id+'"');
    const dialog=html.slice(start,html.indexOf('</dialog>',start));
    assert.ok(start>=0,id+' introuvable');
    assert.doesNotMatch(dialog,/Enregistrer|class="dialog-actions"/,id+' ne doit plus avoir de bouton Enregistrer');
  }
  assert.doesNotMatch(app,/savePreferences'|saveConnectionSettings/);
  assert.match(app,/UI\.connectionEntitySelect\.onchange=\(\)=>\{void saveConnectionEntity\(\)\}/);
  assert.match(app,/UI\.connectionHaUrl\.onchange=\(\)=>\{void saveConnectionUrl\(\)\}/);
  assert.match(app,/for\(const control of \[UI\.preferencesListSort,UI\.preferencesStartView,UI\.preferencesHideAdded,UI\.preferencesSmartFavorites\]\)control\.onchange=savePreferencesSettings;/);
  const prefStart=app.indexOf('function savePreferencesSettings()');
  const prefs=app.slice(prefStart,app.indexOf('function openSettings()',prefStart));
  assert.doesNotMatch(prefs,/\.close\(\)/,'les préférences restent ouvertes après enregistrement');
  assert.match(prefs,/courses:preferences-saved/);
  assert.match(settings,/servingsSelect\.addEventListener\('change',[\s\S]*?persistPreferredServings\(nextServings\);[\s\S]*?courses:preferences-saved/);
  assert.match(history,/document\.addEventListener\('courses:preferences-saved',\(\)=>\{ensureModel\(\);scheduleDish\(\)\}\)/);
  assert.doesNotMatch(history,/#savePreferences/);
});

test('l adresse invalide ou inchangée ne déconnecte jamais Home Assistant',async()=>{
  const app=read('app.js');
  const start=app.indexOf('async function saveConnectionUrl()');
  const body=app.slice(start,app.indexOf('\n}\n',start)+3);
  const calls=[];const feedback=[];
  const ui={connectionHaUrl:{value:''},connectionDialog:{close(){calls.push('close')}},haUrlInput:{value:''},setupError:{textContent:''},connectionDialogFeedback:{}};
  const state={haUrl:'https://ha.example.com'};
  const run=new Function('UI','state','normalizeHaUrl','setDialogFeedback','clearDialogFeedback','revoke',body+'return saveConnectionUrl;')(
    ui,state,value=>/^https:\/\//.test(value)?value:'',(target,message,kind)=>feedback.push(kind||'success'),()=>{},async()=>{calls.push('revoke')}
  );
  ui.connectionHaUrl.value='pas une adresse';await run();
  assert.deepEqual(calls,[]);assert.deepEqual(feedback,['error']);
  ui.connectionHaUrl.value='https://ha.example.com';await run();
  assert.deepEqual(calls,[]);
  ui.connectionHaUrl.value='https://autre.example.com';await run();
  assert.deepEqual(calls,['close','revoke']);
  assert.equal(state.haUrl,'https://autre.example.com');
});

test('le formulaire de mot de passe remplace la tuile puis revient à l état initial',()=>{
  const app=read('app.js'),html=read('index.html');
  const start=app.indexOf('function clearPasswordChangeForm(){');
  const body=app.slice(start,app.indexOf('function openConnectionSettings()',start));
  const attr={};
  const ui={currentLocalPassword:{value:'a'},newLocalPassword:{value:'b'},confirmNewLocalPassword:{value:'c'},changePasswordError:{textContent:'x'},changePasswordPanel:{hidden:true},changePasswordBtn:{hidden:false,setAttribute(k,v){attr[k]=v}},settingsDialogFeedback:{}};
  const [clear,open]=new Function('UI','clearDialogFeedback',body+'return [clearPasswordChangeForm,openPasswordChangeForm];')(ui,()=>{});
  open();
  assert.equal(ui.changePasswordBtn.hidden,true);
  assert.equal(ui.changePasswordPanel.hidden,false);
  assert.equal(attr['aria-expanded'],'true');
  clear();
  assert.equal(ui.changePasswordBtn.hidden,false);
  assert.equal(ui.changePasswordPanel.hidden,true);
  assert.equal(attr['aria-expanded'],'false');
  assert.equal(ui.currentLocalPassword.value+ui.newLocalPassword.value+ui.confirmNewLocalPassword.value,'');
  assert.match(app,/UI\.settingsDialog\.addEventListener\('close',clearPasswordChangeForm\)/);
  const change=app.slice(app.indexOf('async function changeLocalPassword()'),app.indexOf('const OFFLINE_STORAGE_VERSION'));
  assert.ok(change.indexOf('clearPasswordChangeForm()')<change.indexOf("'Mot de passe modifié'"),'le succès referme le formulaire');
  assert.match(html,/<h4 class="settings-sheet-section-title">Verrouillage<\/h4>/);
  assert.match(html,/<h4 class="settings-sheet-section-title">Mot de passe<\/h4>/);
});

test('le verrouillage manuel est retiré, le verrouillage automatique reste en place',()=>{
  const app=read('app.js'),html=read('index.html'),css=read('styles.css');
  assert.doesNotMatch(html+app+css,/lockNowBtn|settingsLockBtn|security-lock-now|manualLockReason/);
  assert.match(app,/UI\.autoLockSelect\.onchange=\(\)=>setAutoLockMinutes\(UI\.autoLockSelect\.value\)/);
  assert.match(app,/lockApp\('Verrouillage automatique après inactivité\.'\)/);
  assert.match(app,/lockApp\('Verrouillage après passage en arrière-plan\.'\)/);
});

test('l écran Réglages reprend la tuile produit et retire les icônes des titres de section',()=>{
  const html=read('index.html'),css=read('styles.css'),settings=read('settings-ui.js');
  assert.match(css,/\.settings-view \.settings-card\{[^}]*border:1px solid rgba\(33,55,40,\.035\)!important;[^}]*background:linear-gradient\(160deg,rgba\(255,254,251,\.98\),rgba\(249,247,242,\.95\)\)!important;[^}]*box-shadow:0 3px 9px rgba\(57,75,62,\.07\)!important/);
  assert.doesNotMatch(html+settings+css,/section-icon/);
  assert.match(settings,/adminSection\.innerHTML='<h2>Administrateur<\/h2>/);
  assert.match(css,/--sheet-inner-max:400px;\n  font-family:"Baskerville","Iowan Old Style",Georgia,serif;/);
});
