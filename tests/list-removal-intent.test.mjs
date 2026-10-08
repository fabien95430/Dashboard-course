import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
test('achat et suppression utilisent des intentions distinctes',()=>{
  assert.match(app,/removeGroup\(button\.dataset\.name\|\|'',row,'purchase'\)/);
  assert.match(app,/removeGroup\(name,row,'delete'\)/);
  assert.match(app,/async function removeGroup\(name,row=null,intent='purchase'\)/);
  assert.match(app,/removeGroup=async function\(name,row=null,intent='purchase'\)/);
  assert.match(app,/successMessage=isPurchase\?item\+' acheté':item\+' supprimé de Ma liste'/);
});
test('la suppression a son propre effet visuel sans état acheté',()=>{
  assert.match(app,/row\.classList\.add\('is-deleting','is-busy'\)/);
  assert.match(styles,/\.list-row\.is-deleting\{/);
  assert.match(styles,/\.list-row\.is-deleting \.purchase-check::before\{/);
  assert.match(styles,/\.list-row\.is-deleting \.list-row-more\{/);
});


test('le toast global reste sur une seule ligne sur mobile',()=>{
  assert.match(styles,/\.toast\{[^}]*width:max-content;[^}]*max-width:calc\(100vw - 24px\);[^}]*white-space:nowrap;[^}]*overflow:hidden;[^}]*text-overflow:ellipsis;/s);
});
