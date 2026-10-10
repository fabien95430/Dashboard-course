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
  const localImages=read('dish-local-images.js');
  assert.match(index,/error-center\.js\?v=393/);
  assert.match(index,/error-feedback-bridge\.js\?v=391/);
  assert.ok(index.indexOf('error-center.js?v=393')<index.indexOf('error-feedback-bridge.js?v=391'));
  assert.doesNotMatch(index,/startup\/app\.js/);
  assert.match(sw,/courses-app-v393-r1/);
  assert.match(sw,/error-center\.js\?v=393/);
  assert.match(sw,/error-feedback-bridge\.js\?v=391/);
  assert.match(localImages,/const APP_VERSION='v393'/);
  assert.equal((index.match(/page-version">v393/g)||[]).length,3);
});

test('le clic Messages d erreur ouvre le centre même si le bouton est créé dynamiquement',()=>{
  const errorCenter=read('error-center.js');
  assert.doesNotMatch(errorCenter,/button\.addEventListener\('click',showErrorCenter\)/);
  assert.match(errorCenter,/function handleErrorCenterTrigger\(event\)/);
  assert.match(errorCenter,/event\.target\.closest\?\.\('#preferencesErrorMessages'\)/);
  assert.match(errorCenter,/if\(!bindUi\(\)\)return;[\s\S]*?showErrorCenter\(\)/);
  assert.match(errorCenter,/document\.addEventListener\('click',handleErrorCenterTrigger\)/);
});
