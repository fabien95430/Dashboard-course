import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const app=readFileSync(new URL('app.js',root),'utf8');

test('le sélecteur Catalogue réutilise sa structure entre deux changements de catégorie',()=>{
  assert.match(app,/function syncCategorySelection\(\)/);
  assert.match(app,/function selectCategory\(category\)/);
  assert.match(app,/if\(state\.category===next&&!state\.productQuery\)return;/);
  assert.match(app,/state\.productQuery='';/);
  assert.match(app,/UI\.productSearch\.value='';/);
  assert.match(app,/if\(el\.childElementCount!==CATALOG_CATEGORY_ORDER\.length\)/);
  assert.match(app,/button\.onclick=\(\)=>selectCategory\(button\.dataset\.category\|\|'Toutes'\)/);
  assert.match(app,/syncCategorySelection\(\);\n  renderProducts\(\);/);
  assert.doesNotMatch(app,/button\.onclick=\(\)=>\{state\.category=.*renderCategories\(\);renderProducts\(\)\}/);
  assert.doesNotMatch(app,/new MutationObserver/);
});
