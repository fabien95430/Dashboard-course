import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('le retour haptique a une seule source et remplace les appels directs à navigator.vibrate',()=>{
  const appUi=read('app-ui.js');
  assert.match(appUi,/window\.CoursesHaptics\s*=\s*\{/);
  for(const file of fs.readdirSync(new URL('../',import.meta.url)).filter(name=>name.endsWith('.js')&&name!=='app-ui.js'&&name!=='sw.js')){
    assert.doesNotMatch(read(file),/navigator\.vibrate/,file+' ne doit plus appeler navigator.vibrate directement');
  }
});

test('les confirmations de produit, plat et réglage déclenchent le retour haptique',()=>{
  assert.match(read('app.js'),/function toast\(message\)\{window\.CoursesHaptics\?\.forMessage\(message\)/);
  assert.match(read('app.js'),/function setDialogFeedback\([^)]*\)\{[\s\S]*?CoursesHaptics\?\.forMessage/);
  assert.match(read('dishes-ui.js'),/function showToast\(message\)\{[\s\S]*?CoursesHaptics\?\.forMessage\(message\)/);
  assert.match(read('catalog-product-admin.js'),/function feedback\(message,type=''\)\{[\s\S]*?CoursesHaptics\?\.play/);
});

test('le type de retour suit le message : erreur, retrait ou succès',()=>{
  const source=read('app-ui.js');
  const start=source.indexOf('// v634 — retour haptique unique');
  assert.ok(start>=0,'bloc haptique introuvable');
  const calls=[];
  const context={window:{},navigator:{vibrate:pattern=>{calls.push(pattern);return true}},document:{body:null}};
  vm.createContext(context);
  vm.runInContext(source.slice(start),context);
  const haptics=context.window.CoursesHaptics;
  assert.equal(haptics.kindFor('Ajout impossible'),'error');
  assert.equal(haptics.kindFor('Suppression impossible'),'error');
  assert.equal(haptics.kindFor('Lait -1'),'remove');
  assert.equal(haptics.kindFor('Retrait demandé'),'remove');
  assert.equal(haptics.kindFor('Lait ajouté'),'success');
  assert.equal(haptics.kindFor(''),null);
  haptics.forMessage('Lait ajouté');
  haptics.forMessage('Ajout impossible');
  assert.equal(JSON.stringify(calls[0]),'[10]');
  assert.equal(JSON.stringify(calls[1]),'[22,70,22]');
});
