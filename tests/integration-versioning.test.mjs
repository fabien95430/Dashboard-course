import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('toutes les intégrations qui changent la version globale alignent aussi app-ui',()=>{
  for(const file of ['scripts/integrate_dish.py','scripts/integrate_product_openai.py','scripts/manage_product_catalog.py']){
    const source=read(file);
    assert.ok(source.includes(String.raw`app-ui\.js\?v=`),file+' doit mettre à jour la référence active app-ui');
    assert.ok(source.includes('./app-ui.js?v={new_version}'),file+' doit précacher app-ui avec la nouvelle version globale');
  }
});

test('la suppression ne force plus des révisions de modules dont les chargeurs gardent leur version propre',()=>{
  const admin=read('scripts/manage_product_catalog.py');
  assert.equal(admin.includes('./app.js?v={new_version}'),false);
  assert.equal(admin.includes('./purchase-intelligence.js?v={new_version}'),false);
  assert.equal(admin.includes(String.raw`(app\.js\?v=)\d+`),false);
  assert.equal(admin.includes(String.raw`(purchase-intelligence\.js\?v=)\d+`),false);
});
