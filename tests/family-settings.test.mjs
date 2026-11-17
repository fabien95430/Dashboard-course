import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('Réglages famille : Appareils connectés remplace Connexion Home Assistant, en lecture seule',()=>{
  const index=read('index.html'),css=read('styles.css'),app=read('app.js');
  assert.match(index,/id="settingsFamilyDevicesBtn" class="settings-row settings-family-only"[\s\S]*?<strong>Appareils connectés<\/strong>/);
  assert.match(css,/\.settings-family-only\{display:none!important\}\s*html\[data-account="family"\] \.settings-family-only\{display:grid!important\}/);
  const dialog=index.match(/<dialog id="familyDevicesDialog"[\s\S]*?<\/dialog>/)?.[0]||'';
  assert.match(dialog,/Téléphones de la famille\./);
  assert.match(dialog,/Seul l’administrateur peut déconnecter un appareil\./);
  assert.match(dialog,/Vos ajouts et modifications aident à améliorer l’application\./);
  assert.doesNotMatch(dialog,/<button/,'aucun bouton : lecture seule');
  assert.match(app,/device\.current\?'Cet appareil':relativeActivity\(device\.derniere_activite\)/);
});

test('Réglages famille : Sécurité, Administrateur, Messages d erreur et suppression du catalogue masqués',()=>{
  const css=read('styles.css');
  for(const selector of ['#settingsConnectionBtn','.settings-section:has(#settingsSecurityBtn)','#settingsAdministratorSection','#preferencesErrorMessages','#settingsMissingProductsCount','#missingProductsDialog .catalog-view-switch','#catalogRemovePanel','#missingProductsDialog .missing-row-caret','#missingProductsDialog .missing-row-tools']){
    assert.ok(css.includes('html[data-account="family"] '+selector),selector);
  }
});

test('Réglages famille : Gestion de l application rejoint la carte Préférences',()=>{
  const settings=read('settings-ui.js');
  assert.match(settings,/const target=kind==='family'\?preferencesCard:adminSection\.querySelector\('\.settings-card'\);/);
  assert.match(settings,/document\.addEventListener\('courses:account-changed',event=>placeManagement\(event\.detail\?\.kind\)\);/);
});

test('Catalogue famille : demandes seulement, sans dépliage ni outils de génération',()=>{
  assert.match(read('missing-products-popup-ui.js'),/function handleRowClick\(event\)\{\s*\/\/[^\n]*\n\s*if\(document\.documentElement\.dataset\.account==='family'\)return;/);
  assert.match(read('missing-products-dishes.js'),/'Ajouter des produits et des plats':'Ajouter ou supprimer des produits et des plats'/);
  assert.match(read('app.js'),/function setAccountKind\(kind\)\{[\s\S]*?new CustomEvent\('courses:account-changed'/);
});
