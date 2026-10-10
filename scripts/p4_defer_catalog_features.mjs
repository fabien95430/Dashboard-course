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
index=index.replaceAll('v412','v413');
write('index.html',index);

let images=read('dish-local-images.js');
images=replaceOnce(images,"const APP_VERSION='v412';","const APP_VERSION='v413';",'version globale');
write('dish-local-images.js',images);

let sw=read('sw.js');
sw=sw.replaceAll('v412','v413');
write('sw.js',sw);

for(const path of ['tests/list-render-version.test.mjs','tests/app-responsibility-extraction.test.mjs']){
  let source=read(path).replaceAll('v412','v413');
  if(path.endsWith('list-render-version.test.mjs'))source=source.replace('P3 publie la version globale v413','P4 publie la version globale v413');
  write(path,source);
}

write('tests/deferred-catalog-startup.test.mjs',`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog.js',import.meta.url),'utf8');

test('P4 garde le démarrage critique séparé des fonctions Catalogue lourdes',()=>{
  const bootstrapStart=source.indexOf('const bootstrap=()=>{');
  const bootstrapEnd=source.indexOf("if(document.readyState==='loading')",bootstrapStart);
  assert.ok(bootstrapStart>=0&&bootstrapEnd>bootstrapStart);
  const bootstrap=source.slice(bootstrapStart,bootstrapEnd);
  assert.match(bootstrap,/loadAppUi\(\)/);
  assert.doesNotMatch(bootstrap,/loadDishLocalImages|loadRepurchaseSoon|loadQuantities|loadDishes|loadLiquid/);
});

test('les fonctions Catalogue se déclenchent uniquement à l entrée dans la vue propriétaire',()=>{
  assert.match(source,/document\.addEventListener\('courses:view-changed',event=>\{\s*if\(event\.detail\?\.view==='catalog'\)startCatalogFeatures\(\);\s*\}\)/s);
  assert.match(source,/const startCatalogFeatures=\(\)=>\{\s*catalogFeaturesRequested=true;\s*if\(catalogFeaturesStarted\|\|!runtimeReady\)return;\s*catalogFeaturesStarted=true;\s*loadDishLocalImages\(\);\s*\};/s);
  assert.doesNotMatch(source,/new MutationObserver|setInterval\s*\(/);
});

test('la chaîne différée conserve son ordre et attend les fonctions runtime de Ma liste',()=>{
  const dish=source.indexOf('const loadDishLocalImages=()=>');
  const repurchase=source.indexOf('const loadRepurchaseSoon=()=>');
  const quantities=source.indexOf('const loadQuantities=()=>');
  const dishes=source.indexOf('const loadDishes=()=>');
  const liquid=source.indexOf('const loadLiquid=()=>');
  assert.ok(liquid>=0&&dishes>liquid&&quantities>dishes&&repurchase>quantities&&dish>repurchase);
  assert.match(source,/runtimeReady=true;\s*if\(catalogFeaturesRequested\)startCatalogFeatures\(\)/s);
});
`);

for(const path of ['scripts/p4_defer_catalog_features.mjs','.github/workflows/p4-defer-catalog.yml']){
  try{fs.unlinkSync(path)}catch(error){if(error.code!=='ENOENT')throw error}
}
