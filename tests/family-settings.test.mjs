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

test('Réglages famille : Sécurité, Messages d erreur et suppression du catalogue masqués',()=>{
  const css=read('styles.css');
  // v891 : Sécurité partage la carte Compte (Appareils connectés reste visible) ; la section Administrateur devient Contribuer.
  assert.doesNotMatch(css,/html\[data-account="family"\] #settingsAdministratorSection/);
  for(const selector of ['#settingsConnectionBtn','#settingsSecurityBtn','#preferencesErrorMessages','#missingProductsDialog .catalog-view-switch','#catalogRemovePanel','#missingProductsDialog .missing-row-caret','#missingProductsDialog .missing-row-tools']){
    assert.ok(css.includes('html[data-account="family"] '+selector),selector);
  }
  // v902 : la pastille des demandes reste visible sur « Catalogue des produits » pour une famille.
  assert.ok(!css.includes('html[data-account="family"] #settingsMissingProductsCount'));
});

test('Réglages famille : sections Compte et Contribuer selon le compte',()=>{
  const settings=read('settings-ui.js');
  // v891 : plus de ligne Gestion à déplacer ; seuls les titres de section suivent le compte.
  assert.doesNotMatch(settings,/settingsApplicationManagementBtn|placeManagement/);
  assert.match(settings,/accountTitle\.textContent=family\?'Compte':'Compte et sécurité';/);
  assert.match(settings,/adminTitle\.textContent=family\?'Contribuer':'Administrateur';/);
  assert.match(settings,/document\.addEventListener\('courses:account-changed',event=>apply\(event\.detail\?\.kind\)\);/);
});

test('Catalogue famille : demandes seulement, sans dépliage ni outils de génération',()=>{
  assert.match(read('missing-products-popup-ui.js'),/function handleRowClick\(event\)\{\s*\/\/[^\n]*\n\s*if\(document\.documentElement\.dataset\.account==='family'\)return;/);
  assert.match(read('missing-products-dishes.js'),/'Ajouter des produits et des plats':'Ajouter ou supprimer des produits et des plats'/);
  assert.match(read('app.js'),/function setAccountKind\(kind\)\{[\s\S]*?new CustomEvent\('courses:account-changed'/);
});

test('popups famille : même hauteur que les autres feuilles de réglages',()=>{
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  for(const id of ['familyAdminDialog','familyDevicesDialog','familyDeviceDialog']){
    assert.doesNotMatch(css,new RegExp('#'+id+'\\s*\\{[^}]*height'),id+' ne doit pas redéfinir la hauteur');
  }
});

test('popup « Cet appareil » : bouton Se déconnecter vers la page de connexion',()=>{
  const html=read('index.html'),app=read('app.js');
  assert.match(html,/id="familyDeviceSignOut"[^>]*>.*Se déconnecter/);
  assert.match(app,/UI\.familyDeviceSignOut\.onclick=\(\)=>\{void revoke\(\)\}/);
  // Connexion affichée avant la déconnexion réseau : Ma liste ne s'affiche pas entre les deux.
  assert.match(app,/forgetAccount\(\);\s*showLogin\(\);[\s\S]*?requestAnimationFrame\(\(\)=>requestAnimationFrame\(resolve\)\)\);\s*UI\.settingsDialog\.close\(\);\s*UI\.familyDeviceDialog\?\.close\(\);\s*await window\.COURSES_FAMILY\?\.signOut\(\);/);
});

test('v902 : pastilles des demandes cohérentes (même rouge, mêmes nombres sur Réglages, Catalogue des produits, Produits et Plats)',()=>{
  const dishes=read('missing-products-dishes.js'),css=read('styles.css'),tab=read('settings-tab-badge.js'),soon=read('repurchase-soon.js'),app=read('app.js');
  assert.match(dishes,/function syncCounts\(\)\{\s*const counts=\{products:productCount\(\),dishes:readDishes\(\)\.length\};/);
  assert.match(dishes,/>Produits<i class="missing-mode-count" hidden>0<\/i><\/button>/);
  assert.match(dishes,/>Plats<i class="missing-mode-count" hidden>0<\/i><\/button>/);
  // « À intégrer » suit l'onglet affiché ; app.js n'y écrit plus le nombre de produits.
  assert.match(dishes,/listCount\.textContent=String\(counts\[mode==='dishes'\?'dishes':'products'\]\);/);
  assert.doesNotMatch(app,/listCount\.textContent=/);
  assert.equal((dishes.match(/listCount\.textContent=/g)||[]).length,1,'une seule écriture du nombre');
  // Une seule couleur de pastille : la variable --danger du thème.
  assert.match(css,/\.settings-view \.settings-count\{[^}]*background:var\(--danger\)!important/);
  assert.match(css,/#missingProductsDialog \.missing-mode-count\{[^}]*background:var\(--danger\)/);
  assert.match(tab,/background:'var\(--danger\)'/);
  assert.match(soon,/\.repurchase-count\{[\s\S]*?background:var\(--danger\)/);
  assert.doesNotMatch(tab,/#ff3b30/);
  // Chiffres centrés sur la hauteur des capitales, quelle que soit la police (SF Pro sur iPhone).
  assert.match(css,/\.settings-view \.settings-count\{[^}]*line-height:1!important;text-box:trim-both cap alphabetic/);
  assert.match(css,/#missingProductsDialog \.missing-mode-count\{[^}]*text-box:trim-both cap alphabetic/);
  assert.match(tab,/badge\.style\.setProperty\('text-box','trim-both cap alphabetic'\);/);
  assert.match(soon,/\.repurchase-count\{[^}]*text-box:trim-both cap alphabetic/);
  assert.doesNotMatch(soon.match(/\.repurchase-count\{[^}]*\}/)?.[0]||'',/#2378f2/);
});
