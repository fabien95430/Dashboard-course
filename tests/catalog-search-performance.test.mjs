import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('la recherche catalogue diffère le rendu pendant la saisie',()=>{
  assert.match(source,/UI\.productSearch\.oninput=e=>\{state\.productQuery=e\.target\.value\|\|'';clearTimeout\(UI\.productSearch\._searchTimer\);UI\.productSearch\._searchTimer=setTimeout\(renderProducts,80\)\}/);
  assert.match(source,/\$\('#listSearch'\)\.oninput=e=>\{state\.listQuery=e\.target\.value\|\|'';renderList\(\)\}/);
});
