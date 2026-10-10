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
  assert.match(index,/error-center\.js\?v=390/);
  assert.match(index,/error-feedback-bridge\.js\?v=391/);
  assert.ok(index.indexOf('error-center.js?v=390')<index.indexOf('error-feedback-bridge.js?v=391'));
  assert.doesNotMatch(index,/startup\/app\.js/);
  assert.match(sw,/courses-app-v391-r1/);
  assert.match(sw,/error-center\.js\?v=390/);
  assert.match(sw,/error-feedback-bridge\.js\?v=391/);
  assert.match(localImages,/const APP_VERSION='v391'/);
  assert.equal((index.match(/page-version">v391/g)||[]).length,3);
});
