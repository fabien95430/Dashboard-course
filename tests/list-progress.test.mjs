import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('app.js');
const index=read('index.html');
const styles=read('styles.css');

test('la progression affiche les vrais achats confirmés, pas les suppressions',()=>{
  const purchase=app.slice(app.indexOf('function publishPurchaseSettled('),app.indexOf('function clearDialogFeedback('));
  assert.match(purchase,/purchasedProgressGroups\+\+/);
  assert.match(purchase,/updateListProgress\(\)/);
  assert.match(purchase,/courses:purchase-settled/);
  const remove=app.slice(app.indexOf('async function removeGroup('),app.indexOf('function showNeutralDialog('));
  assert.match(remove,/if\(isPurchase\)publishPurchaseSettled\(/);
  assert.match(remove,/intent!=='delete'/);
});

test('la progression compte les lignes sans être affectée par les filtres ou les quantités',()=>{
  const start=app.indexOf('function listProgressState('),end=app.indexOf('function updateListProgress(',start);
  assert.ok(start>0&&end>start);
  const context=vm.createContext({});
  vm.runInContext(app.slice(start,end)+'\nthis.compute=listProgressState',context);
  const sample=(p,groups)=>JSON.parse(JSON.stringify(context.compute(p,groups)));
  assert.deepEqual(sample(0,[{count:5},{count:1},{count:3}]),{bought:0,remaining:3,total:3,percent:0});
  assert.deepEqual(sample(1,[{count:5},{count:1}]),{bought:1,remaining:2,total:3,percent:33});
  assert.deepEqual(sample(3,[]),{bought:3,remaining:0,total:3,percent:100});
  assert.deepEqual(sample(0,[]),{bought:0,remaining:0,total:0,percent:0});
  const updater=app.slice(end,app.indexOf('function renderSelectionAndList(',end));
  assert.match(updater,/groups=activeGroups\(\)/);
  assert.doesNotMatch(updater,/visibleListGroups|state\.listQuery|state\.listCategoryFilter/);
  assert.match(updater,/!state\.locked&&!state\.loading&&!state\.error/);
});

test('l option 1A apparaît sous le sous-titre sans déplacer la recherche ou le Catalogue',()=>{
  const list=index.slice(index.indexOf('<section id="listView"'),index.indexOf('<section id="catalogView"'));
  const header=list.slice(0,list.indexOf('</header>'));
  assert.ok(header.indexOf('Votre liste de courses')<header.indexOf('id="listProgress"'));
  assert.match(header,/role="progressbar"/);
  assert.ok(list.indexOf('id="listProgress"')<list.indexOf('id="listSearch"'));
  assert.match(styles,/\.list-view \.list-progress\{[\s\S]*?position:absolute;[\s\S]*?top:calc\(100% - 2px\)/);
  assert.match(styles,/\.list-view \.list-progress\[hidden\]\{display:none!important\}/);
  assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(styles,/\.catalog-view \.list-progress/);
});
