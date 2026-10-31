import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('les cartes de plats utilisent leur vignette prête et leur warmup démarre hors du rendu critique',()=>{
  const products=read('product-item-images.js');
  const catalog=read('catalog.js');
  const dishes=read('dishes-ui.js');
  const images=read('dish-local-images.js');
  assert.match(dishes,/<img src="'\+dishCardPhotoUrl\(dish\.name\)\+'" alt="" loading="eager" decoding="sync"/);
  assert.match(dishes,/const dishCardPhotoUrl=name=>'\.\/www\/Plats\/cartes\/'\+dishFileName\(name\)\+'\.webp';/);
  assert.match(images,/function localDishCardImage\(name\)/);
  assert.doesNotMatch(images,/\?v='\+encodeURIComponent\(APP_VERSION\)/,'adresse stable : le cache persistant reste valable d une version à l autre');
  assert.match(products,/new CustomEvent\('courses:product-images-idle'/);
  assert.match(products,/filter\(productCardVisible\)/);
  assert.match(products,/if\(pending\)\{productImagesIdle=false;return\}/);
  assert.match(catalog,/const scheduleDishFeaturesWarmup=\(\)=>\{/);
  assert.match(catalog,/onDishLocalImagesReady=\(\)=>\{[\s\S]*loadDishAddedMarker\(\);[\s\S]*warmDishImages\(\);/);
  assert.match(dishes,/window\.COURSES_DISH_NAMES=Object\.freeze\(DISHES\.map\(dish=>dish\.name\)\)/);
  assert.match(images,/window\.COURSES_DISH_IMAGES=Object\.freeze\(\{warm:warmDishImages\}\)/);
  assert.match(images,/image\.fetchPriority='low'/);
  assert.match(images,/window\.requestIdleCallback/);
  assert.match(images,/new Image\(\)/);
  assert.doesNotMatch(images,/setInterval\(|MutationObserver/);
});

test('le préchargement Plats reste événementiel et ne revient pas dans le démarrage critique',()=>{
  const catalog=read('catalog.js');
  const start=catalog.indexOf('const bootstrap=()=>{');
  const end=catalog.indexOf("if(document.readyState==='loading')",start);
  const bootstrap=catalog.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.doesNotMatch(bootstrap,/warmDishImages\(\)|loadDishLocalImages\(\)|startDishFeatures\(\)/);
  assert.match(catalog,/if\(title==='Synchronisé'\|\|title==='Mode test'\)\{[\s\S]*scheduleDishFeaturesWarmup\(\);/);
  assert.doesNotMatch(catalog,/setInterval\(|new MutationObserver/);
});

test('chaque plat a sa vignette de carte, sinon la carte reprend la photo d origine',async()=>{
  const {readdirSync}=await import('node:fs');
  const photos=readdirSync(new URL('../www/Plats/',import.meta.url)).filter(f=>f.endsWith('.png')).map(f=>f.slice(0,-4)).sort();
  const cards=readdirSync(new URL('../www/Plats/cartes/',import.meta.url)).filter(f=>f.endsWith('.webp')).map(f=>f.slice(0,-5)).sort();
  for(const card of cards)assert.ok(photos.includes(card),'vignette sans photo d origine : '+card);
  const dishes=read('dishes-ui.js');
  assert.match(dishes,/if\(name&&current===dishCardPhotoUrl\(name\)\)\{\s*image\.dataset\.dishCardFallback='1';\s*image\.src=dishPhotoUrl\(name\);/);
});

test('le service worker retire les anciennes photos de plats versionnées',()=>{
  const sw=read('sw.js');
  assert.match(sw,/async function pruneVersionedDishVisuals\(\)/);
  assert.match(sw,/url\.pathname\.includes\('\/www\/Plats\/'\)&&url\.search/);
  assert.match(sw,/\.then\(\(\)=>pruneVersionedDishVisuals\(\)\.catch\(\(\)=>\{\}\)\)/);
});

test('la fiche plat affiche sa photo WebP légère, avec la photo PNG en secours',async()=>{
  const {readdirSync,statSync}=await import('node:fs');
  const photos=readdirSync(new URL('../www/Plats/',import.meta.url)).filter(f=>f.endsWith('.png')).map(f=>f.slice(0,-4)).sort();
  const sheets=readdirSync(new URL('../www/Plats/fiches/',import.meta.url)).filter(f=>f.endsWith('.webp')).map(f=>f.slice(0,-5)).sort();
  for(const sheet of sheets)assert.ok(photos.includes(sheet),'photo de fiche sans photo d origine : '+sheet);
  for(const sheet of sheets)assert.ok(statSync(new URL('../www/Plats/fiches/'+sheet+'.webp',import.meta.url)).size<400*1024,'photo de fiche trop lourde : '+sheet);
  const dishes=read('dishes-ui.js');
  assert.match(dishes,/image\.src=dishSheetPhotoUrl\(name\);/);
  assert.match(dishes,/if\(sheetName&&current===dishSheetPhotoUrl\(sheetName\)\)\{\s*image\.dataset\.dishPhotoFallback='1';\s*image\.src=dishPhotoUrl\(sheetName\);/);
  const sw=read('sw.js');
  assert.match(sw,/function isDishOriginalPhoto\(url\)/);
  assert.match(sw,/url\.pathname\.includes\('\/www\/Plats\/'\)&&!isDishOriginalPhoto\(url\)/);
});

test('les visuels déjà en cache sont revalidés sans être re-téléchargés à chaque version',()=>{
  const sw=read('sw.js');
  assert.match(sw,/headers\.set\('If-None-Match',etag\)/);
  assert.match(sw,/headers\.set\('If-Modified-Since',modified\)/);
  assert.match(sw,/if\(response\.status===304&&hit\)return cache\.put\(request,markVisualRefreshed\(hit\.clone\(\)\)\);/);
});
