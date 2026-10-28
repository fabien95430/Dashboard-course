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
  assert.doesNotMatch(listHeader,/page-header-actions|icon-btn/,'Ma liste n a plus de bouton dans son en-tête');
  assert.doesNotMatch(index,/listFilterBtn|listFilterMenu|list-filter/,'le menu de filtre de Ma liste est retiré');
  const catalogHeader=index.slice(index.indexOf('<section id="catalogView"'),index.indexOf('</header>',index.indexOf('<section id="catalogView"')));
  assert.ok(catalogHeader.includes('id="repurchaseSoonBtn"'),'À racheter bientôt reste sur le Catalogue');
  const settingsHeader=index.slice(index.indexOf('<section id="settingsView"'),index.indexOf('</header>',index.indexOf('<section id="settingsView"')));
  assert.ok(settingsHeader.includes('<div class="page-header-actions">')&&settingsHeader.includes('id="refreshBtn"'),'le rafraîchissement est dans l en-tête de Réglages');
  assert.equal(index.match(/id="refreshBtn"/g)?.length,1,'un seul bouton de rafraîchissement');
  assert.doesNotMatch(listHeader+catalogHeader,/#i-refresh|catalogRefreshBtn/,'aucun rafraîchissement sur Ma liste ni le Catalogue');
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
  const appUiScript=index.indexOf('<script src="./app-ui.js?v=650" data-app-ui="script"></script>');
  const appScript=index.search(/<script src="\.\/app\.js\?v=\d+"><\/script>/);
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

test('les titres gardent leur géométrie et seul Réglages affiche le badge de version',()=>{
  const rows=[...index.matchAll(/<div class="page-title-row">\s*<h1>(Ma liste|Catalogue|Réglages)<\/h1>\s*<span class="page-version">v\d+<\/span>\s*<\/div>/g)];
  assert.equal(rows.length,3,'les trois vues doivent utiliser exactement la même structure titre + badge');
  const rowRule=styles.match(/\.page-title-row\{([^}]*)\}/)?.[1]||'';
  assert.match(rowRule,/display:flex/);
  assert.match(rowRule,/align-items:flex-end/);
  assert.match(rowRule,/gap:5px/);
  assert.match(styles,/\.page-title-row\{\s*height:35px;\s*\}/,'la ligne de titre mobile doit laisser de la place aux descendantes');
  const badgeRules=[...styles.matchAll(/\.page-version\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(badgeRules.some(rule=>/display:flex/.test(rule)&&/align-items:center/.test(rule)&&/justify-content:center/.test(rule)),'le badge doit utiliser une boîte commune centrée');
  assert.ok(badgeRules.some(rule=>/height:14px/.test(rule)&&/line-height:12px/.test(rule)),'le badge mobile doit garder une hauteur fixe identique');
  assert.ok(badgeRules.every(rule=>!/vertical-align/.test(rule)),'les anciens vertical-align v447 doivent être supprimés');
  const sharedTitleRules=[...styles.matchAll(/\.list-view \.page-header h1,\s*\.catalog-view \.page-header h1,\s*\.settings-view \.page-header h1\{([^}]*)\}/g)].map(match=>match[1]);
  assert.ok(sharedTitleRules.every(rule=>!/display:flex!important/.test(rule)&&!/align-items:flex-end!important/.test(rule)&&!/column-gap:5px!important/.test(rule)),'les h1 ne doivent plus porter le flex v448');
  assert.match(styles,/\.list-view \.page-version,\.catalog-view \.page-version\{display:none!important\}/,'les badges de Ma liste et Catalogue doivent être masqués');
  assert.doesNotMatch(styles,/\.settings-view \.page-version\s*\{[^}]*display\s*:\s*none/,'le badge de Réglages reste visible');
});

test('sur iPhone les en-têtes restent alignés et Produits / Plats dispose de sa propre ligne',()=>{
  const mobile=firstPaint.slice(firstPaint.indexOf('@media(max-width:520px){'));
  assert.doesNotMatch(mobile,/data-category="Toutes"/,'la catégorie « Tous » du Catalogue n existe plus');
  assert.match(styles,/\.list-view\{[\s\S]*?grid-template-rows:82px 98px minmax\(0,1fr\)!important/);
  assert.match(styles,/\.list-view\{\s*gap:8px!important/);
  assert.match(mobile,/grid-template-rows:82px 42px 40px 42px minmax\(0,1fr\)!important;\s*gap:12px!important/);
  assert.match(mobile,/html \.catalog-view>\.page-search\{\s*grid-row:3!important;\s*height:40px!important;\s*margin-left:1px!important;\s*margin-right:1px!important/);
  assert.match(styles,/\.catalog-view \.page-header\{\s*margin-left:12px!important;\s*margin-right:12px!important/);
  // Ma liste a une marge extérieure de 12px et une recherche à 1px.
  // Catalogue est pleine largeur : ses éléments d’en-tête doivent compenser ces 12px.
  assert.match(styles,/\.app>\.list-view,\s*\.app>\.catalog-view,\s*\.app>\.settings-view\{[\s\S]*?margin-left:12px!important;\s*margin-right:12px!important/);
  assert.match(styles,/\.app>\.catalog-view\{\s*margin-left:0!important;\s*margin-right:0!important/);
  assert.match(styles,/html \.app>\.catalog-view>\.page-search\{\s*margin-left:13px!important;\s*margin-right:13px!important/);
  assert.match(mobile,/html \.catalog-view>\.page-search\{[\s\S]*?margin-left:1px!important;\s*margin-right:1px!important/,'la règle spécifique doit primer sur le premier affichage');
  assert.match(styles,/\.list-view \.page-header-actions \.icon-btn,\.catalog-view \.page-header-actions \.icon-btn,\.settings-view \.page-header-actions \.icon-btn\{width:38px!important;height:38px!important/);
  assert.match(styles,/\.list-view \.page-header-actions \.icon-btn svg,\.catalog-view \.page-header-actions \.icon-btn svg,\.settings-view \.page-header-actions \.icon-btn svg\{width:17px!important;height:17px!important/);
  assert.doesNotMatch(mobile,/html \.catalog-view>\.page-header\{\s*display:grid!important/);
  assert.match(mobile,/html \.catalog-mode-switch\{\s*position:relative!important;\s*grid-row:2!important;\s*grid-column:1!important;\s*justify-self:center!important;\s*align-self:start!important;\s*top:auto!important;\s*left:auto!important;\s*right:auto!important;\s*transform:none!important/);
  assert.doesNotMatch(mobile,/html \.catalog-mode-switch\{[^}]*position:absolute!important/);
  // Onglets élargis et texte 18px ; recherche amincie à 40px.
  // Le total des lignes reste constant, et l'espace entre les zones reste à 16px.
  assert.match(mobile,/width:clamp\(220px,60vw,240px\)!important;\s*height:38px!important/);
  assert.match(mobile,/html \.catalog-mode\{font-size:18px!important\}/);
  // Le trait de Produits a sa géométrie finale (catalog-liquid.js) dès la première image :
  // moitié de l'onglet, centrée. Un pourcentage dans translate3d serait relatif au trait lui-même.
  assert.match(mobile,/--catalog-lens-w:calc\(clamp\(220px,60vw,240px\) \/ 4\);\s*--catalog-lens-x:calc\(clamp\(220px,60vw,240px\) \/ 8\)/);
  assert.doesNotMatch(firstPaint,/--catalog-lens-x:calc\([^)]*%/,'aucun pourcentage dans la position du trait');
  assert.match(styles,/\.catalog-view \.page-search\{height:46px!important;[\s\S]*?background:linear-gradient/,'la recherche reste transparente et soulignée');
  assert.match(mobile,/html \.catalog-view>\.page-search\{[^}]*height:40px!important;[^}]*border-radius:0!important/);
  const layout={header:82,tabRow:42,tab:38,search:40,categoryRow:42,category:38,gap:12};
  assert.equal(layout.tabRow+layout.search,82,'le contenu descend seulement à l’intérieur de la même hauteur globale');
  assert.equal(layout.tabRow-layout.tab+layout.gap,16);
  assert.equal(layout.categoryRow-layout.category+layout.gap,16);
  assert.match(mobile,/html \.catalog-controls>\.categories,\s*html \.catalog-controls>\.dish-filters\{\s*grid-row:4!important;\s*align-self:end!important/);
  assert.match(mobile,/html \.catalog-view>#products,\s*html \.catalog-view>\.dishes-grid\{grid-row:5!important\}/);
  assert.match(firstPaint,/html \.catalog-mode-lens\{[\s\S]*?height:2px!important/);
  assert.doesNotMatch(mobile,/order:1!important|order:2!important/,'pas de changement de hiérarchie Produits / Plats');
});

test('sur iPhone la recherche de Ma liste commence exactement au même endroit que celle du Catalogue',()=>{
  // Deux grilles différentes mais une position calculée identique : y = 148 px.
  const list={header:82,gap:8,searchTrack:98,searchHeight:40,outerMargin:12,searchMargin:1};
  const catalog={header:82,gap:12,tabTrack:42,searchHeight:40,outerMargin:0,searchMargin:13};
  const listY=list.header+list.gap+list.searchTrack-list.searchHeight;
  const catalogY=catalog.header+catalog.gap+catalog.tabTrack+catalog.gap;
  assert.equal(listY,catalogY);
  assert.equal(list.outerMargin+list.searchMargin,catalog.outerMargin+catalog.searchMargin);
  assert.match(styles,/\.list-view\{[\s\S]*?grid-template-rows:82px 98px minmax\(0,1fr\)!important/);
  assert.match(styles,/html \.list-view>\.page-search\{\s*height:40px!important;\s*align-self:end!important/);
  assert.match(styles,/\.list-view\{\s*gap:8px!important/);
  assert.match(styles,/\.catalog-view \.page-search\{height:46px!important;[\s\S]*?background:linear-gradient/);
  assert.match(firstPaint,/html \.catalog-view\{\s*position:relative!important;\s*grid-template-rows:82px 42px 40px 42px minmax\(0,1fr\)!important;\s*gap:12px!important/);
  assert.match(firstPaint,/html \.catalog-view>\.page-search\{\s*grid-row:3!important;\s*height:40px!important/);
  assert.match(styles,/html \.app>\.catalog-view>\.page-search\{\s*margin-left:13px!important;\s*margin-right:13px!important/);
  assert.match(styles,/\.app>\.list-view,\s*\.app>\.catalog-view,\s*\.app>\.settings-view\{[\s\S]*?margin-left:12px!important;\s*margin-right:12px!important/);
  assert.match(styles,/\.list-view \.page-search\{height:46px!important;[\s\S]*?background:linear-gradient/);
});

test('la progression hachurée de Ma liste reste au-dessus de la recherche sans modifier sa géométrie',()=>{
  const index=read('index.html'),app=read('app.js');
  assert.match(index,/<div id="listProgress" class="list-progress" role="progressbar"[^>]*hidden>/);
  assert.match(index,/id="listProgressFill"/);
  assert.match(index,/id="listProgressCount"/);
  assert.match(styles,/\.list-progress\{display:none\}/);
  assert.match(styles,/\.list-view>\.list-progress:not\(\[hidden\]\)\{\s*display:flex;\s*position:absolute;\s*top:106px;\s*left:1px;\s*right:1px;/);
  assert.match(styles,/\.list-progress-track\{[\s\S]*?height:2px;/);
  assert.match(styles,/\.list-progress-fill\{[\s\S]*?repeating-linear-gradient\(115deg/);
  assert.match(styles,/\.list-view\{[\s\S]*?grid-template-rows:82px 98px minmax\(0,1fr\)!important/);
  assert.match(app,/function updateListProgress\(groups=activeGroups\(\)\)/);
  assert.match(app,/document\.addEventListener\('courses:purchase-settled'/);
  assert.match(app,/listProgressSession\.done\+=1/);
  assert.match(app,/if\(listProgressSession\.remaining===0&&remaining>0&&listProgressSession\.done>0\)listProgressSession\.done=0/);
  assert.match(app,/const groups=activeGroups\(\),needle=norm\(state\.listQuery\);\s*emitListChangedIfNeeded\(groups\);\s*updateListProgress\(groups\);/);
  assert.doesNotMatch(app,/setInterval\([^)]*updateListProgress/);
});


test('la référence visuelle conserve les icônes du menu et la lentille native',()=>{
  const index=read('index.html');
  const liquid=read('catalog-liquid.css');
  assert.ok(index.includes('<symbol id="i-nav-list"'));
  assert.ok(index.includes('<symbol id="i-nav-grid"'));
  assert.ok(index.includes('<svg><use href="#i-nav-list"></use></svg><span>Ma liste</span>'));
  assert.ok(index.includes('<svg><use href="#i-nav-grid"></use></svg><span>Catalogue</span>'));
  assert.ok(index.includes('bottom-nav-liquid.js?v=573'));
  assert.ok(styles.includes('font-family:"Baskerville","Iowan Old Style",Georgia,serif'));
  assert.ok(styles.includes('background:rgba(214,226,213,.73)'));
  assert.ok(styles.includes('background:#2c563c;'));
  assert.ok(liquid.includes('.catalog-mode-lens{top:auto!important;bottom:2px!important;height:2px!important'));
});

test('le Catalogue occupe la première page avec neuf cartes plus grandes, sans bandeau',()=>{
  const style=read('styles.css');
  const start=style.indexOf('--catalog-first-page-height:');
  assert.ok(start>=0,'hauteur calculée de la première page absente');
  const rule=style.slice(start,style.indexOf('}',start)+1);
  assert.ok(style.includes('@media(max-width:520px) and (min-height:800px)'));
  assert.ok(rule.includes('100dvh - max(14px,env(safe-area-inset-top)) - env(safe-area-inset-bottom) - 300px'));
  assert.ok(!rule.includes('height:min('),'le conteneur ne doit plus se terminer au-dessus de la barre');
  assert.ok(rule.includes('grid-auto-rows:max(132px,calc((var(--catalog-first-page-height) - 25px) / 3))!important'));
  assert.ok(rule.includes('padding:1px 12px max(78px,calc(66px + 2 * env(safe-area-inset-bottom)))!important'));
  assert.ok(style.includes('.catalog-view>#products .product{\n    grid-template-rows:94px minmax(0,1fr)!important'));
  assert.ok(style.includes('.catalog-view>#products .product .media{\n    height:92px!important'));
  assert.ok(!style.includes(' - 334px'),'ancien bandeau artificiel supprimé');
  // 402 × 874 CSS px, safe areas 62/34, commandes supérieures 254px.
  const viewportHeight=874,viewportWidth=402,top=62,bottom=34,chrome=254;
  const visible=viewportHeight-top-bottom-300;
  const row=(visible-1-6-2*9)/3;
  const width=(viewportWidth-2*12-2*9)/3;
  const thirdBottom=top+chrome+1+3*row+2*9;
  const fourthTop=top+chrome+1+3*row+3*9;
  assert.equal(visible,478);
  assert.equal(row,151);
  assert.equal(width,120);
  assert.ok(thirdBottom<=top+chrome+visible-6);
  assert.ok(fourthTop>top+chrome+visible);
  assert.ok(row>132,'les tuiles sont réellement agrandies');
  assert.ok(style.includes('overflow-y:auto;'),'défilement natif conservé');
  assert.ok(index.includes('bottom-nav-liquid.js?v=573'));
  assert.ok(index.includes('product-item-first-paint.css?v=610'));
});

test('le rail des catégories défile bord à bord et les cartes Produits restent ivoire clair et les boutons + vert forêt',()=>{
  const firstPaint=read('product-item-first-paint.css');
  const styles=read('styles.css');
  const index=read('index.html');
  const mobile=firstPaint.slice(firstPaint.indexOf('@media(max-width:520px){'));
  assert.ok(mobile.includes('margin-left:0!important;\n    margin-right:0!important;\n    gap:7px!important'));
  assert.ok(mobile.includes('html .catalog-controls>.categories .cat:first-child,\n  html .catalog-controls>.dish-filters .dish-filter:first-child'));
  assert.ok(mobile.includes('margin-left:12px!important'));
  assert.ok(styles.includes('.catalog-view .categories{\n    margin-left:0!important;\n    margin-right:0!important'));
  assert.ok(styles.includes('background:linear-gradient(160deg,rgba(255,254,251,.98),rgba(249,247,242,.95))'));
  assert.ok(styles.includes('.product.is-selected{\n  background:linear-gradient(155deg,#e4ede3,#e9f0e8)'));
  assert.ok(styles.includes('border-color:#648773;\n  border-width:2px;'));
  assert.ok(styles.includes('background:#2c563c;\n  color:#fff;\n  box-shadow:0 4px 10px rgba(30,67,47,.18)'));
  assert.ok(styles.includes('.product.is-selected .badge{\n  font-size:15px;\n  background:#2c563c;'));
  assert.ok(styles.includes('.cat.is-active{\n  background:#2c563c;'));
  assert.ok(!styles.includes('background:#238d4e;'));
  assert.ok(!styles.includes('background:#168647;'));
  assert.ok(index.includes('bottom-nav-liquid.js?v=573'));
  const liquidRef=read('catalog.js').match(/\.\/catalog-liquid\.js\?v=\d+/)?.[0];
  assert.ok(liquidRef&&read('sw.js').includes(liquidRef),'le sélecteur Liquid chargé reste précaché hors ligne');
});

test('les grilles Produits et Plats défilent sous la barre Liquid Glass sans perdre les dernières cartes',()=>{
  const styles=read('styles.css'),dishes=read('dishes.css'),catalog=read('catalog.js'),sw=read('sw.js');
  const start=styles.indexOf('.catalog-view>#products{');
  const productRule=styles.slice(start,styles.indexOf('}',start)+1);
  assert.ok(start>=0);
  assert.ok(!productRule.includes('height:min('));
  assert.ok(productRule.includes('grid-auto-rows:max(132px,calc((var(--catalog-first-page-height) - 25px) / 3))!important'));
  assert.ok(productRule.includes('padding:1px 12px max(78px,calc(66px + 2 * env(safe-area-inset-bottom)))!important'));
  assert.ok(styles.includes('.app>.tabs{\n    position:fixed!important;\n    z-index:40!important'));
  const dishesRule='.dishes-grid{margin-left:0!important;margin-right:0!important;padding:1px 19px calc(84px + env(safe-area-inset-bottom))!important}';
  assert.equal(dishes.split(dishesRule).length-1,2);
  assert.ok(dishes.includes('.dishes-grid{min-height:0;overflow-y:auto;'));
  assert.ok(catalog.includes("'./dishes.css?v=532'"));
  assert.ok(sw.includes('"./dishes.css?v=532"'));
  assert.ok(index.includes('bottom-nav-liquid.js?v=573'));
  assert.ok(index.includes('product-item-first-paint.css?v=610'));
});

test('sélection sauge visible et lettres descendantes non rognées sur les trois vues',()=>{
  const styles=read('styles.css'),dishes=read('dishes.css'),index=read('index.html'),catalog=read('catalog.js'),sw=read('sw.js');
  assert.ok(styles.includes('.product.is-selected{\n  background:linear-gradient(155deg,#e4ede3,#e9f0e8)'));
  assert.ok(styles.includes('border-color:#648773;\n  border-width:2px;'));
  assert.ok(styles.includes('box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 6px 18px rgba(47,77,55,.14)'));
  assert.ok(styles.includes('font-size:14.5px!important;\n    line-height:1.22!important'));
  assert.ok(styles.includes('font-size:17.5px!important;line-height:1.22!important'));
  assert.ok(styles.includes('font-size:34px!important;\n    line-height:35px!important'));
  assert.ok(styles.includes('.page-title-row{\n    height:35px;'));
  assert.ok(dishes.includes('.dish-copy strong{color:#101418;font-size:12.7px;line-height:1.22;'));
  assert.ok(catalog.includes("'./dishes.css?v=532'"));
  assert.ok(sw.includes('"./dishes.css?v=532"'));
  assert.ok(index.includes('bottom-nav-liquid.js?v=573'));
  assert.ok(index.includes('product-item-first-paint.css?v=610'));
  const localImages=read('dish-local-images.js');
  const version=localImages.match(/const APP_VERSION='(v\d+)'/)?.[1];
  assert.ok(version,'version applicative introuvable');
  assert.deepEqual([...index.matchAll(/class="page-version">(v\d+)<\/span>/g)].map(match=>match[1]),Array(3).fill(version));
});
