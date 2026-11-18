import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('la recherche catalogue diffère le rendu pendant la saisie',()=>{
  // Seul l'état des pastilles de catégorie est mis à jour à la frappe ; le rendu reste différé.\n  assert.match(source,/UI\.productSearch\.oninput=e=>\{state\.productQuery=e\.target\.value\|\|'';syncCategorySelection\(\);clearTimeout\(UI\.productSearch\._searchTimer\);UI\.productSearch\._searchTimer=setTimeout\(renderProducts,80\)\}/);
  assert.match(source,/\$\('#listSearch'\)\.oninput=e=>\{state\.listQuery=e\.target\.value\|\|'';renderList\(\)\}/);
});
