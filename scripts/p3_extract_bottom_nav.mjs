import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const write=(path,value)=>fs.writeFileSync(path,value);
const replaceOnce=(source,from,to,label)=>{
  const first=source.indexOf(from);
  if(first<0)throw new Error(`marqueur introuvable: ${label}`);
  if(source.indexOf(from,first+from.length)>=0)throw new Error(`marqueur dupliqué: ${label}`);
  return source.slice(0,first)+to+source.slice(first+from.length);
};

let app=read('app.js');
const navStart="const bottomNavLiquid={";
const navEnd="\nlet publishedView='';";
const start=app.indexOf(navStart);
const end=app.indexOf(navEnd,start);
if(start<0||end<0)throw new Error('bloc navigation liquide introuvable');
app=app.slice(0,start)+"const BOTTOM_NAV=window.COURSES_BOTTOM_NAV;\nif(!BOTTOM_NAV)throw new Error('Navigation liquide indisponible');\n"+app.slice(end);
app=replaceOnce(app,'  syncBottomNavLiquid(true);','  BOTTOM_NAV.sync(true);','sync showView');
app=replaceOnce(app,"    if(bottomNavLiquid.justScrubbed)return;\n    const next=button.dataset.view||'list';\n    if(next===state.view){syncBottomNavLiquid(false);return}","    if(BOTTOM_NAV.shouldIgnoreClick())return;\n    const next=button.dataset.view||'list';\n    if(next===state.view){BOTTOM_NAV.sync(false);return}",'clic navigation');
app=replaceOnce(app,"  bindBottomNavLiquid();\n  window.addEventListener('resize',()=>syncBottomNavLiquid(false),{passive:true});","  BOTTOM_NAV.bind(next=>{\n    state.view=next;\n    navigator.vibrate?.(4);\n    showView();\n  });",'binding navigation');
if(/bottomNavLiquid|syncBottomNavLiquid|bindBottomNavLiquid|paintBottomNavLiquid|bottomNavReduced/.test(app))throw new Error('ancienne implémentation navigation encore présente dans app.js');
write('app.js',app);

let index=read('index.html');
const versionMatches=index.match(/<span class="page-version">v411<\/span>/g)||[];
if(versionMatches.length!==3)throw new Error(`badges v411 inattendus: ${versionMatches.length}`);
index=index.replaceAll('<span class="page-version">v411</span>','<span class="page-version">v412</span>');
index=replaceOnce(index,'<script src="./catalog.js?v=411"></script>','<script src="./catalog.js?v=412"></script>','révision catalog');
index=replaceOnce(index,'<script src="./app.js?v=411"></script>','<script src="./bottom-nav-liquid.js?v=412"></script>\n  <script src="./app.js?v=412"></script>','chargement navigation/app');
write('index.html',index);

let catalog=read('catalog.js');
catalog=replaceOnce(catalog,"images.src='./dish-local-images.js?v=411';","images.src='./dish-local-images.js?v=412';",'révision dish local loader');
write('catalog.js',catalog);

let images=read('dish-local-images.js');
images=replaceOnce(images,"const APP_VERSION='v411';","const APP_VERSION='v412';",'version globale');
write('dish-local-images.js',images);

let sw=read('sw.js');
sw=replaceOnce(sw,"const CACHE='courses-app-v411-r1';","const CACHE='courses-app-v412-r1';",'cache app');
sw=replaceOnce(sw,"  './catalog.js?v=411',","  './catalog.js?v=412',",'cache catalog');
sw=replaceOnce(sw,"  './app.js?v=411',","  './bottom-nav-liquid.js?v=412',\n  './app.js?v=412',",'cache navigation/app');
sw=replaceOnce(sw,"  './dish-local-images.js?v=411',","  './dish-local-images.js?v=412',",'cache dish local');
write('sw.js',sw);

let versionTest=read('tests/list-render-version.test.mjs');
versionTest=versionTest.replaceAll('v411','v412');
versionTest=versionTest.replaceAll('v=411','v=412');
versionTest=versionTest.replace('P2 publie la version globale v412 et les révisions app associées','P3 publie la version globale v412 et les révisions app associées');
versionTest=versionTest.replace("  assert.match(index,/\\.\\/app\\.js\\?v=412/);","  assert.match(index,/\\.\\/bottom-nav-liquid\\.js\\?v=412/);\n  assert.match(index,/\\.\\/app\\.js\\?v=412/);");
versionTest=versionTest.replace("  assert.match(sw,/\\.\\/app\\.js\\?v=412/);","  assert.match(sw,/\\.\\/bottom-nav-liquid\\.js\\?v=412/);\n  assert.match(sw,/\\.\\/app\\.js\\?v=412/);");
write('tests/list-render-version.test.mjs',versionTest);

const extractionTest=`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('app.js');
const nav=read('bottom-nav-liquid.js');
const index=read('index.html');
const sw=read('sw.js');

test('P3 confie la navigation liquide à son module propriétaire',()=>{
  assert.match(app,/const BOTTOM_NAV=window\\.COURSES_BOTTOM_NAV;/);
  assert.match(app,/BOTTOM_NAV\\.bind\\(next=>\\{/);
  assert.match(app,/BOTTOM_NAV\\.sync\\(true\\)/);
  assert.match(app,/BOTTOM_NAV\\.shouldIgnoreClick\\(\\)/);
  assert.doesNotMatch(app,/const bottomNavLiquid=|function bottomNavReduced|function bindBottomNavLiquid|function paintBottomNavLiquid/);
});

test('le module de navigation reste découplé de l état métier',()=>{
  assert.match(nav,/window\\.COURSES_BOTTOM_NAV=Object\\.freeze\\(\\{bind,sync,shouldIgnoreClick\\}\\)/);
  assert.match(nav,/function bind\\(navigate\\)/);
  assert.match(nav,/onNavigate\\?\\.\\(target\\.dataset\\.view\\|\\|'list'\\)/);
  assert.doesNotMatch(nav,/\\bstate\\.view\\b|\\bshowView\\s*\\(|COURSES_HA_CLIENT|WebSocket|MutationObserver/);
});

test('le module est chargé avant app.js et précaché avec sa propre révision',()=>{
  const navIndex=index.indexOf('./bottom-nav-liquid.js?v=412');
  const appIndex=index.indexOf('./app.js?v=412');
  assert.ok(navIndex>=0&&appIndex>navIndex);
  assert.match(sw,/\\.\\/bottom-nav-liquid\\.js\\?v=412/);
});
`;
write('tests/app-responsibility-extraction.test.mjs',extractionTest);

for(const path of ['scripts/p3_extract_bottom_nav.mjs','.github/workflows/p3-extract.yml']){
  try{fs.unlinkSync(path)}catch(error){if(error.code!=='ENOENT')throw error}
}
