import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('les intégrateurs ne forcent plus app-ui vers la version globale quand il n est pas modifié',()=>{
  for(const file of ['scripts/integrate_dish.py','scripts/integrate_product_openai.py','scripts/manage_product_catalog.py']){
    const source=read(file);
    assert.equal(source.includes('app-ui'),false,file+' ne doit pas révisionner app-ui');
  }
});

test('l intégrateur produit révisionne catalog-quantities seulement quand il le modifie et précache son URL active',()=>{
  const source=read('scripts/integrate_product_openai.py');
  assert.ok(source.includes('quantities_changed=update_display_mode(name,display_mode)'));
  assert.ok(source.includes('if quantities_changed:'));
  assert.ok(source.includes('catalog_quantities_asset=catalog_quantities_match.group(1)'));
  assert.ok(source.includes('catalog_quantities_asset,'));
});

test('la suppression applique la même règle aux quantités sans forcer les autres modules indépendants',()=>{
  const admin=read('scripts/manage_product_catalog.py');
  assert.ok(admin.includes('quantities_changed = quantities_text != original_quantities_text'));
  assert.ok(admin.includes('if quantities_changed:'));
  assert.ok(admin.includes('catalog_quantities_asset = catalog_quantities_match.group(1)'));
  assert.equal(admin.includes('./app.js?v={new_version}'),false);
  assert.equal(admin.includes('./purchase-intelligence.js?v={new_version}'),false);
  assert.equal(admin.includes(String.raw`(app\.js\?v=)\d+`),false);
  assert.equal(admin.includes(String.raw`(purchase-intelligence\.js\?v=)\d+`),false);
});
