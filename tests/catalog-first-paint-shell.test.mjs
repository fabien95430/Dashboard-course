import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const index=read('index.html');
const styles=read('styles.css');
const firstPaint=read('product-item-first-paint.css');
const dishes=read('dishes-ui.js');
const repurchase=read('repurchase-soon.js');
const appUi=read('app-ui.js');

test('le Catalogue possède sa structure finale dès le HTML initial',()=>{
  assert.doesNotMatch(index,/catalog-mode-first-paint/);
  assert.match(index,/class="catalog-controls"/);
  assert.match(index,/class="catalog-mode-switch"/);
  assert.match(index,/id="dishCount" hidden/);
  assert.match(index,/class="dish-filters"[^>]*hidden/);
  assert.match(index,/id="dishes" class="dishes-grid" hidden/);
  assert.match(firstPaint,/catalog-mode-switch/);
  assert.match(firstPaint,/catalog-controls/);
  assert.match(dishes,/controls=catalogView\.querySelector\(':scope > \.catalog-controls'\)/);
  assert.match(dishes,/modeSwitch=controls\.querySelector\('\.catalog-mode-switch'\)/);
  assert.match(dishes,/dishesGrid=document\.getElementById\('dishes'\)/);
  assert.doesNotMatch(dishes,/productCategories\.before\(controls\);\s*controls\.append\(modeSwitch,productCategories,dishFilters\);/);
});

test('les libellés et actions de Ma liste et du Catalogue sont définitifs dès la première frame',()=>{
  assert.match(index,/<h1>Ma liste <span class="page-version">v\d+<\/span><\/h1>\s*<p>Votre liste de courses<\/p>/);
  assert.match(index,/<h1>Catalogue <span class="page-version">v\d+<\/span><\/h1>\s*<p>Ajouter vos produits<\/p>/);
  const listHeader=index.slice(index.indexOf('<section id="listView"'),index.indexOf('</header>',index.indexOf('<section id="listView"')));
  assert.ok(listHeader.indexOf('id="listFilterBtn"')<listHeader.indexOf('id="refreshBtn"'),'le filtre doit précéder le rafraîchissement sur Ma liste');
  const catalogHeader=index.slice(index.indexOf('<section id="catalogView"'),index.indexOf('</header>',index.indexOf('<section id="catalogView"')));
  assert.ok(catalogHeader.indexOf('id="repurchaseSoonBtn"')<catalogHeader.indexOf('id="catalogRefreshBtn"'),'À racheter bientôt doit précéder le rafraîchissement du Catalogue');
  assert.match(firstPaint,/repurchase-header-button/);
  assert.doesNotMatch(firstPaint,/catalog-view \.page-version\{[\s\S]*?translateY\(/);
  assert.match(dishes,/dishes\?'Choisissez un plat à cuisiner ':'Ajouter vos produits '/);
});

test('le bouton À racheter bientôt est seulement branché par son module propriétaire',()=>{
  assert.match(repurchase,/function ensureButton\(\)[\s\S]*?getElementById\('repurchaseSoonBtn'\)[\s\S]*?dataset\.repurchaseBound='1'[\s\S]*?addEventListener\('click',openDialog\)/);
  assert.doesNotMatch(repurchase,/refresh\.before\(actions\)/);
  assert.doesNotMatch(repurchase,/actions\.append\(button,refresh\)/);
  assert.doesNotMatch(repurchase,/button\.id='repurchaseSoonBtn'/);
});

test('app-ui est branché avant app.js pour enrichir la vraie liste vide sans rendu tardif',()=>{
  const appUiScript=index.indexOf('<script src="./app-ui.js?v=442" data-app-ui="script"></script>');
  const appScript=index.indexOf('<script src="./app.js?v=429"></script>');
  assert.ok(appUiScript>=0&&appScript>appUiScript,'app-ui doit être chargé avant app.js');
  assert.match(appUi,/if\(!listEmptyStateConfirmed\)\{/);
  assert.match(appUi,/title==='Synchronisé'\|\|title==='Mode test'/);
  assert.match(appUi,/courses:list-rendered/);
});

test('les badges de version sont déjà dans les h1 et ne sont plus déplacés par JavaScript',()=>{
  for(const title of ['Ma liste','Catalogue','Réglages']){
    assert.match(index,new RegExp('<h1>'+title+' <span class="page-version">v\\d+</span></h1>'));
  }
  assert.doesNotMatch(appUi,/appendChild\(badge\)/);
});

test('les trois badges de version partagent le même alignement bas sur iPhone',()=>{
  const sharedTitleRules=[...styles.matchAll(/\.list-view \.page-header h1,\s*\.catalog-view \.page-header h1,\s*\.settings-view \.page-header h1\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(sharedTitleRules.some(rule=>
    /display:flex!important/.test(rule)&&
    /align-items:flex-end!important/.test(rule)&&
    /column-gap:5px!important/.test(rule)
  ),'les trois titres doivent partager le même conteneur flex aligné en bas');
  const badgeRules=[...styles.matchAll(/\.page-version\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(badgeRules.some(rule=>
    /display:inline-flex/.test(rule)&&
    /align-items:center/.test(rule)&&
    /justify-content:center/.test(rule)
  ),'le badge doit utiliser une boîte inline-flex commune');
  assert.ok(badgeRules.some(rule=>
    /height:14px/.test(rule)&&
    /min-height:14px/.test(rule)&&
    /margin-left:0/.test(rule)&&
    /flex:0 0 auto/.test(rule)
  ),'le badge mobile doit garder la même géométrie sur les trois vues');
  assert.doesNotMatch(styles,/\.catalog-view \.page-version\s*\{/);
});
