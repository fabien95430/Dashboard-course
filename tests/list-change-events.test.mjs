import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Ma liste publie un événement seulement quand son état métier change',()=>{
  const app=read('app.js');
  assert.match(app,/function emitListChangedIfNeeded\(groups=activeGroups\(\)\)/);
  assert.match(app,/if\(signature===listChangeSignature\)return;/);
  assert.match(app,/new CustomEvent\('courses:list-changed'/);
  assert.match(app,/function syncProductSelection\(\)\{[\s\S]*?emitListChangedIfNeeded\(groups\)/);
  assert.match(app,/function renderList\(\)\{[\s\S]*?emitListChangedIfNeeded\(groups\)/);
});

test('À racheter bientôt écoute Ma liste sans observer son DOM',()=>{
  const repurchase=read('repurchase-soon.js');
  assert.match(repurchase,/document\.addEventListener\('courses:list-changed',\(\)=>refresh\(true\)\)/);
  assert.doesNotMatch(repurchase,/listObserver/);
  assert.doesNotMatch(repurchase,/observe\(list,\{childList:true,subtree:true,characterData:true\}\)/);
});
