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
  assert.match(index,/<div class="page-title-row">\s*<h1>Ma liste<\/h1>\s*<span class="page-version">v\d+<\/span>\s*<\/div>\s*<p>Votre liste de courses<\/p>/);
  assert.match(index,/<div class="page-title-row">\s*<h1>Catalogue<\/h1>\s*<span class="page-version">v\d+<\/span>\s*<\/div>\s*<p>Ajouter vos produits<\/p>/);
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
  const appScript=index.indexOf('<script src="./app.js?v=504"></script>');
  assert.ok(appUiScript>=0&&appScript>appUiScript,'app-ui doit être chargé avant app.js');
  assert.match(appUi,/if\(!listEmptyStateConfirmed\)\{/);
  assert.match(appUi,/title==='Synchronisé'\|\|title==='Mode test'/);
  assert.match(appUi,/courses:list-rendered/);
});

test('les badges de version sont à côté des h1 dans une ligne de titre commune',()=>{
  for(const title of ['Ma liste','Catalogue','Réglages']){
    const titlePos=index.indexOf('<h1>'+title+'</h1>');
    assert.ok(titlePos>=0,'titre '+title+' introuvable');
    const rowStart=index.lastIndexOf('<div class="page-title-row">',titlePos);
    const rowEnd=index.indexOf('</div>',titlePos);
    assert.ok(rowStart>=0&&rowEnd>titlePos,'ligne de titre '+title+' introuvable');
    const row=index.slice(rowStart,rowEnd+6);
    const versionStart=row.indexOf('<span class="page-version">');
    const versionEnd=row.indexOf('</span>',versionStart);
    assert.ok(versionStart>=0&&versionEnd>versionStart,'badge '+title+' introuvable');
    const version=row.slice(versionStart+'<span class="page-version">'.length,versionEnd);
    assert.match(version,/^v[0-9]+$/);
  }
  assert.ok(!appUi.includes('appendChild(badge)'));
});

test('les trois badges de version partagent une géométrie unique sur iPhone',()=>{
  const rows=[...index.matchAll(/<div class="page-title-row">\s*<h1>(Ma liste|Catalogue|Réglages)<\/h1>\s*<span class="page-version">v\d+<\/span>\s*<\/div>/g)];
  assert.equal(rows.length,3,'les trois vues doivent utiliser exactement la même structure titre + badge');
  const rowRule=styles.match(/\.page-title-row\{([^}]*)\}/)?.[1]||'';
  assert.match(rowRule,/display:flex/);
  assert.match(rowRule,/align-items:flex-end/);
  assert.match(rowRule,/gap:5px/);
  assert.match(styles,/\.page-title-row\{\s*height:32px;\s*\}/,'la ligne de titre mobile doit avoir une hauteur fixe');
  const badgeRules=[...styles.matchAll(/\.page-version\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(badgeRules.some(rule=>/display:flex/.test(rule)&&/align-items:center/.test(rule)&&/justify-content:center/.test(rule)),'le badge doit utiliser une boîte commune centrée');
  assert.ok(badgeRules.some(rule=>/height:14px/.test(rule)&&/line-height:12px/.test(rule)),'le badge mobile doit garder une hauteur fixe identique');
  assert.ok(badgeRules.every(rule=>!/vertical-align/.test(rule)),'les anciens vertical-align v447 doivent être supprimés');
  const sharedTitleRules=[...styles.matchAll(/\.list-view \.page-header h1,\s*\.catalog-view \.page-header h1,\s*\.settings-view \.page-header h1\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(sharedTitleRules.every(rule=>!/display:flex!important/.test(rule)&&!/align-items:flex-end!important/.test(rule)&&!/column-gap:5px!important/.test(rule)),'les h1 ne doivent plus porter le flex v448');
  assert.doesNotMatch(styles,/\.catalog-view \.page-version\s*\{/);
});

test('sur iPhone les titres, recherches et boutons du Catalogue reprennent la géométrie de Ma liste',()=>{
  const mobile=firstPaint.slice(firstPaint.indexOf('@media(max-width:520px){'));
  assert.match(styles,/\.list-view\{\s*grid-template-rows:82px 42px minmax\(0,1fr\)!important/);
  assert.match(styles,/\.list-view\{\s*gap:8px!important/);
  assert.match(mobile,/grid-template-rows:82px 46px 46px minmax\(0,1fr\)!important;\s*gap:8px!important/);
  assert.match(mobile,/html \.catalog-view>\.page-search\{\s*grid-row:2!important;\s*height:46px!important;\s*margin-left:1px!important;\s*margin-right:1px!important/);
  assert.match(styles,/\.catalog-view \.page-header\{\s*margin-left:0!important;\s*margin-right:0!important/);
  assert.match(styles,/\.list-view \.page-header-actions \.icon-btn,\.catalog-view \.page-header-actions \.icon-btn\{width:38px!important;height:38px!important/);
  assert.match(styles,/\.list-view \.page-header-actions \.icon-btn svg,\.catalog-view \.page-header-actions \.icon-btn svg\{width:17px!important;height:17px!important/);
  assert.doesNotMatch(mobile,/html \.catalog-view>\.page-header\{\s*display:grid!important/);
  assert.match(mobile,/html \.catalog-mode-switch\{\s*position:absolute!important;\s*top:72px!important;\s*left:50%!important;\s*right:auto!important;\s*transform:translateX\(-50%\)!important/);
  assert.match(mobile,/html \.catalog-controls>\.categories,\s*html \.catalog-controls>\.dish-filters\{\s*grid-row:3!important;\s*align-self:end!important/);
  assert.match(mobile,/html \.catalog-view>#products,\s*html \.catalog-view>\.dishes-grid\{grid-row:4!important\}/);
  assert.match(firstPaint,/html \.catalog-mode-lens\{[\s\S]*?height:2px!important/);
  assert.doesNotMatch(mobile,/order:1!important|order:2!important/,'pas de changement de hiérarchie Produits / Plats');
});
