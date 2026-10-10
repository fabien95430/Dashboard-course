import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const read=name=>readFileSync(resolve(root,name),'utf8');

test('le centre d erreurs reste chargé sans restaurer le shell de démarrage',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const catalog=read('catalog.js');
  const localImages=read('dish-local-images.js');
  const version=localImages.match(/const APP_VERSION='(v\d+)'/)?.[1];
  assert.ok(version,'version applicative introuvable');
  const number=version.slice(1);
  const catalogRef=index.match(/catalog\.js\?v=\d+/)?.[0];
  const errorCenterRef=index.match(/error-center\.js\?v=\d+/)?.[0];
  const errorBridgeRef=index.match(/error-feedback-bridge\.js\?v=\d+/)?.[0];
  assert.equal(catalogRef,'catalog.js?v='+number);
  assert.ok(errorCenterRef&&errorBridgeRef,'modules du centre d erreurs introuvables');
  assert.ok(index.indexOf(errorCenterRef)<index.indexOf(errorBridgeRef));
  assert.doesNotMatch(index,/startup\/app\.js/);
  assert.match(catalog,new RegExp('dish-local-images\\.js\\?v='+number));
  assert.match(sw,new RegExp("courses-app-"+version+"-r\\d+"));
  assert.match(sw,/product-item-first-paint\.css\?v=1/);
  assert.ok(sw.includes('./'+catalogRef));
  assert.ok(sw.includes('./dish-local-images.js?v='+number));
  assert.ok(sw.includes('./'+errorCenterRef));
  assert.ok(sw.includes('./'+errorBridgeRef));
  assert.equal((index.match(new RegExp('page-version\\">'+version,'g'))||[]).length,3);
});

test('le clic Messages d erreur ouvre le centre même si le bouton est créé dynamiquement',()=>{
  const errorCenter=read('error-center.js');
  assert.doesNotMatch(errorCenter,/button\.addEventListener\('click',showErrorCenter\)/);
  assert.match(errorCenter,/function handleErrorCenterTrigger\(event\)/);
  assert.match(errorCenter,/event\.target\.closest\?\.\('#preferencesErrorMessages'\)/);
  assert.match(errorCenter,/if\(!bindUi\(\)\)return;[\s\S]*?showErrorCenter\(\)/);
  assert.match(errorCenter,/document\.addEventListener\('click',handleErrorCenterTrigger\)/);
});

test('les anomalies transitoires se referment quand leur cause a disparu',()=>{
  const errorCenter=read('error-center.js');
  const bridge=read('error-feedback-bridge.js');
  assert.match(errorCenter,/TRANSIENT_PREFIXES[\s\S]*?'resource:'[\s\S]*?'javascript:'[\s\S]*?'promise:'[\s\S]*?'integration-local:'[\s\S]*?'notifications:'/);
  assert.match(errorCenter,/function reconcilePreviousVersionEntries\(\)[\s\S]*?String\(entry\.appVersion\|\|''\)===version[\s\S]*?entry\.resolved=true/);
  assert.match(errorCenter,/existing\.appVersion=appVersion/);
  assert.match(errorCenter,/entries\.unshift\(\{[\s\S]*?appVersion[\s\S]*?resolved:false/);
  assert.match(errorCenter,/window\.addEventListener\('load',[\s\S]*?resolveResourceTarget\(event\.target\)[\s\S]*?true\);/);
  assert.match(errorCenter,/function reconcileLoadedResources\(\)[\s\S]*?image\.complete&&image\.naturalWidth>0[\s\S]*?link\.sheet/);
  assert.match(errorCenter,/reconcilePreviousVersionEntries\(\);/);
  assert.match(bridge,/Intégration OpenAI lancée/);
  assert.match(bridge,/Intégration automatique lancée/);
  assert.match(bridge,/resolvePrefix\?\.\('integration-local:'\)/);
  assert.match(bridge,/resolvePrefix\?\.\('notifications:'\)/);
  assert.doesNotMatch(errorCenter,/setInterval\s*\(/);
  assert.doesNotMatch(bridge,/setInterval\s*\(/);
});

test('une intégration réussie résout les anciennes erreurs du même élément',()=>{
  const errorCenter=read('error-center.js');
  assert.match(errorCenter,/function resolveIntegrationItem\(itemType,itemName\)[\s\S]*?startsWith\('integration:'\)[\s\S]*?metaType!==wantedType\|\|metaName!==wantedName[\s\S]*?entry\.resolved=true/);
  assert.match(errorCenter,/if\(status==='added'\)\{[\s\S]*?resolve\(key\);[\s\S]*?resolveIntegrationItem\(itemType,itemName\)/);
});
