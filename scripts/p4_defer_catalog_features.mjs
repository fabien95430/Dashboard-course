import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const write=(path,value)=>fs.writeFileSync(path,value);
const replaceOnce=(source,from,to,label)=>{
  const first=source.indexOf(from);
  if(first<0)throw new Error(`marqueur introuvable: ${label}`);
  if(source.indexOf(from,first+from.length)>=0)throw new Error(`marqueur dupliqué: ${label}`);
  return source.slice(0,first)+to+source.slice(first+from.length);
};

let catalog=read('catalog.js');
const marker="\n\n(() => {\n  'use strict';\n\n  const style=document.createElement('link');";
const start=catalog.indexOf(marker);
if(start<0)throw new Error('chargeur catalogue introuvable');
const loader=`

(() => {
  'use strict';

  const style=document.createElement('link');
  style.rel='stylesheet';
  style.href='./dishes.css?v=3';
  style.dataset.catalogDishes='style';
  document.head.appendChild(style);

  const liquidStyle=document.createElement('link');
  liquidStyle.rel='stylesheet';
  liquidStyle.href='./catalog-liquid.css?v=4';
  liquidStyle.dataset.catalogLiquid='style';
  document.head.appendChild(liquidStyle);

  let runtimeReady=false;
  let catalogFeaturesRequested=false;
  let catalogFeaturesStarted=false;

  const loadLiquid=()=>{
    if(document.querySelector('script[data-catalog-liquid]'))return;
    const liquid=document.createElement('script');
    liquid.src='./catalog-liquid.js?v=297';
    liquid.async=false;
    liquid.dataset.catalogLiquid='script';
    document.body.appendChild(liquid);
  };
  const loadDishes=()=>{
    if(document.querySelector('script[data-catalog-dishes]')){loadLiquid();return}
    const script=document.createElement('script');
    script.src='./dishes-ui.js?v=408';
    script.async=false;
    script.dataset.catalogDishes='script';
    script.addEventListener('load',loadLiquid,{once:true});
    document.body.appendChild(script);
  };
  const loadQuantities=()=>{
    if(window.COURSES_QUANTITIES){loadDishes();return}
    const quantities=document.createElement('script');
    quantities.src='./catalog-quantities.js?v=408';
    quantities.async=false;
    quantities.dataset.catalogQuantities='script';
    quantities.addEventListener('load',loadDishes,{once:true});
    document.body.appendChild(quantities);
  };
  const loadRepurchaseSoon=()=>{
    if(document.querySelector('script[data-repurchase-soon]')){loadQuantities();return}
    const script=document.createElement('script');
    script.src='./repurchase-soon.js?v=410';
    script.async=false;
    script.dataset.repurchaseSoon='script';
    script.addEventListener('load',loadQuantities,{once:true});
    document.body.appendChild(script);
  };
  const loadDishLocalImages=()=>{
    if(document.querySelector('script[data-dish-local-images]')){loadRepurchaseSoon();return}
    const images=document.createElement('script');
    images.src='./dish-local-images.js?v=413';
    images.async=false;
    images.dataset.dishLocalImages='script';
    images.addEventListener('load',loadRepurchaseSoon,{once:true});
    document.body.appendChild(images);
  };
  const startCatalogFeatures=()=>{
    catalogFeaturesRequested=true;
    if(catalogFeaturesStarted||!runtimeReady)return;
    catalogFeaturesStarted=true;
    loadDishLocalImages();
  };
  document.addEventListener('courses:view-changed',event=>{
    if(event.detail?.view==='catalog')startCatalogFeatures();
  });
  const loadRuntimeFeatures=()=>{
    if(document.querySelector('script[data-runtime-features]')){
      runtimeReady=true;
      if(catalogFeaturesRequested)startCatalogFeatures();
      return;
    }
    const script=document.createElement('script');
    script.src='./runtime-features.js?v=410';
    script.async=false;
    script.dataset.runtimeFeatures='script';
    script.addEventListener('load',()=>{
      runtimeReady=true;
      if(catalogFeaturesRequested)startCatalogFeatures();
    },{once:true});
    document.body.appendChild(script);
  };
  const loadAppUi=()=>{
    if(document.querySelector('script[data-app-ui]')){loadRuntimeFeatures();return}
    const script=document.createElement('script');
    script.src='./app-ui.js?v=410';
    script.async=false;
    script.dataset.appUi='script';
    script.addEventListener('load',loadRuntimeFeatures,{once:true});
    document.body.appendChild(script);
  };
  const bootstrap=()=>{
    loadAppUi();
    if(document.getElementById('catalogView')?.classList.contains('is-active'))startCatalogFeatures();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});
  else bootstrap();
})();`;
catalog=catalog.slice(0,start)+loader;
write('catalog.js',catalog);

let index=read('index.html');
const badges=index.match(/<span class="page-version">v412<\/span>/g)||[];
if(badges.length!==3)throw new Error(`badges v412 inattendus: ${badges.length}`);
index=index.replaceAll('<span class="page-version">v412</span>','<span class="page-version">v413</span>');
index=replaceOnce(index,'<script src="./catalog.js?v=412"></script>','<script src="./catalog.js?v=413"></script>','révision catalog');
index=replaceOnce(index,'<script src="./bottom-nav-liquid.js?v=412"></script>','<script src="./bottom-nav-liquid.js?v=413"></script>','révision navigation');
index=replaceOnce(index,'<script src="./app.js?v=412"></script>','<script src="./app.js?v=413"></script>','révision app');
write('index.html',index);

let images=read('dish-local-images.js');
images=replaceOnce(images,"const APP_VERSION='v412';","const APP_VERSION='v413';",'version globale');
write('dish-local-images.js',images);

let sw=read('sw.js');
sw=replaceOnce(sw,"const CACHE='courses-app-v412-r1';","const CACHE='courses-app-v413-r1';",'cache application');
sw=replaceOnce(sw,"  './catalog.js?v=412',","  './catalog.js?v=413',",'précache catalog');
sw=replaceOnce(sw,"  './bottom-nav-liquid.js?v=412',","  './bottom-nav-liquid.js?v=413',",'précache navigation');
sw=replaceOnce(sw,"  './app.js?v=412',","  './app.js?v=413',",'précache app');
sw=replaceOnce(sw,"  './dish-local-images.js?v=412',","  './dish-local-images.js?v=413',",'précache images plats');
write('sw.js',sw);

write('tests/list-render-version.test.mjs',String.raw`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('P4 publie la version globale v413 et les révisions app associées',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),sw=read('sw.js'),images=read('dish-local-images.js');
  assert.equal((index.match(/<span class="page-version">v413<\/span>/g)||[]).length,3);
  assert.match(index,/\.\/catalog\.js\?v=413/);
  assert.match(index,/\.\/bottom-nav-liquid\.js\?v=413/);
  assert.match(index,/\.\/app\.js\?v=413/);
  assert.match(catalog,/\.\/dish-local-images\.js\?v=413/);
  assert.match(images,/const APP_VERSION='v413';/);
  assert.match(sw,/const CACHE='courses-app-v413-r1';/);
  assert.match(sw,/\.\/catalog\.js\?v=413/);
  assert.match(sw,/\.\/bottom-nav-liquid\.js\?v=413/);
  assert.match(sw,/\.\/app\.js\?v=413/);
  assert.match(sw,/\.\/dish-local-images\.js\?v=413/);
});
`);

let extraction=read('tests/app-responsibility-extraction.test.mjs');
extraction=extraction.replaceAll('v=412','v=413');
write('tests/app-responsibility-extraction.test.mjs',extraction);

write('tests/deferred-catalog-startup.test.mjs',`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog.js',import.meta.url),'utf8');

test('P4 garde le démarrage critique séparé des fonctions Catalogue lourdes',()=>{
  const bootstrapStart=source.indexOf('const bootstrap=()=>{');
  const bootstrapEnd=source.indexOf("if(document.readyState==='loading')",bootstrapStart);
  assert.ok(bootstrapStart>=0&&bootstrapEnd>bootstrapStart);
  const bootstrap=source.slice(bootstrapStart,bootstrapEnd);
  assert.ok(bootstrap.includes('loadAppUi();'));
  for(const heavy of ['loadDishLocalImages();','loadRepurchaseSoon();','loadQuantities();','loadDishes();','loadLiquid();'])assert.equal(bootstrap.includes(heavy),false,heavy+' ne doit pas faire partie du démarrage critique');
});

test('les fonctions Catalogue se déclenchent à l entrée dans la vue propriétaire sans observation ni polling',()=>{
  assert.ok(source.includes("document.addEventListener('courses:view-changed',event=>{"));
  assert.ok(source.includes("if(event.detail?.view==='catalog')startCatalogFeatures();"));
  assert.ok(source.includes('if(catalogFeaturesStarted||!runtimeReady)return;'));
  assert.ok(source.includes('catalogFeaturesStarted=true;'));
  assert.ok(source.includes('loadDishLocalImages();'));
  assert.equal(source.includes('new MutationObserver'),false);
  assert.equal(source.includes('setInterval('),false);
});

test('la chaîne différée conserve son ordre et attend les fonctions runtime de Ma liste',()=>{
  assert.ok(source.includes("images.addEventListener('load',loadRepurchaseSoon,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadQuantities,{once:true});"));
  assert.ok(source.includes("quantities.addEventListener('load',loadDishes,{once:true});"));
  assert.ok(source.includes("script.addEventListener('load',loadLiquid,{once:true});"));
  assert.ok(source.includes('runtimeReady=true;'));
  assert.ok(source.includes('if(catalogFeaturesRequested)startCatalogFeatures();'));
});
`);

let boundaries=read('tests/ui-module-boundaries.test.mjs');
const boundaryStart=boundaries.indexOf("\ntest('le nouvel ordre de chargement reste déterministe et précaché'");
if(boundaryStart<0)throw new Error('test de frontière de chargement introuvable');
boundaries=boundaries.slice(0,boundaryStart)+String.raw`

test('P4 conserve un démarrage déterministe et diffère seulement les fonctions Catalogue',()=>{
  const catalog=read('catalog.js');
  const index=read('index.html');
  const sw=read('sw.js');
  const appUiAsset=catalog.match(/\.\/app-ui\.js\?v=\d+/)?.[0]||'';
  const runtimeAsset=catalog.match(/\.\/runtime-features\.js\?v=\d+/)?.[0]||'';
  const dishImagesAsset=catalog.match(/\.\/dish-local-images\.js\?v=\d+/)?.[0]||'';
  const repurchaseAsset=catalog.match(/\.\/repurchase-soon\.js\?v=\d+/)?.[0]||'';
  const quantitiesAsset=catalog.match(/\.\/catalog-quantities\.js\?v=\d+/)?.[0]||'';
  const dishesAsset=catalog.match(/\.\/dishes-ui\.js\?v=\d+/)?.[0]||'';
  const liquidAsset=catalog.match(/\.\/catalog-liquid\.js\?v=\d+/)?.[0]||'';
  const settingsUiAsset=index.match(/\.\/settings-ui\.js\?v=\d+/)?.[0]||'';
  const settingsBadgeAsset=index.match(/\.\/settings-tab-badge\.js\?v=\d+/)?.[0]||'';
  for(const [asset,label] of [[appUiAsset,'app-ui'],[runtimeAsset,'runtime-features'],[dishImagesAsset,'dish-local-images'],[repurchaseAsset,'repurchase-soon'],[quantitiesAsset,'catalog-quantities'],[dishesAsset,'dishes-ui'],[liquidAsset,'catalog-liquid'],[settingsUiAsset,'settings-ui'],[settingsBadgeAsset,'settings-tab-badge']])assert.ok(asset,'asset '+label+' introuvable');
  assert.match(catalog,/script\.addEventListener\('load',loadRuntimeFeatures,\{once:true\}\)/);
  assert.match(catalog,/document\.addEventListener\('courses:view-changed',event=>\{/);
  assert.match(catalog,/if\(event\.detail\?\.view==='catalog'\)startCatalogFeatures\(\);/);
  assert.match(catalog,/if\(catalogFeaturesStarted\|\|!runtimeReady\)return;/);
  assert.match(catalog,/images\.addEventListener\('load',loadRepurchaseSoon,\{once:true\}\)/);
  assert.match(catalog,/script\.addEventListener\('load',loadQuantities,\{once:true\}\)/);
  assert.match(catalog,/quantities\.addEventListener\('load',loadDishes,\{once:true\}\)/);
  assert.match(catalog,/script\.addEventListener\('load',loadLiquid,\{once:true\}\)/);
  assert.ok(index.indexOf(settingsBadgeAsset)<index.indexOf(settingsUiAsset));
  for(const asset of [appUiAsset,runtimeAsset,dishImagesAsset,repurchaseAsset,quantitiesAsset,dishesAsset,liquidAsset,settingsUiAsset,settingsBadgeAsset])assert.ok(sw.includes(asset),asset+' absent du précache');
});
`;
write('tests/ui-module-boundaries.test.mjs',boundaries);

for(const path of ['scripts/p4_defer_catalog_features.mjs','.github/workflows/p4-defer-catalog.yml']){
  try{fs.unlinkSync(path)}catch(error){if(error.code!=='ENOENT')throw error}
}
