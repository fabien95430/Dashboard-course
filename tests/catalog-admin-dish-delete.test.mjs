import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('l administration du catalogue distingue produits et plats',()=>{
  const source=read('catalog-product-admin.js');
  assert.match(source,/DELETE_PRODUCT_PREFIX='__courses_delete_product__:'/);
  assert.match(source,/DELETE_DISH_PREFIX='__courses_delete_dish__:'/);
  assert.match(source,/const nextMode=detail\?\.mode==='dishes'\?'dishes':'products';/);
  assert.match(source,/document\.addEventListener\('courses:catalog-view-changed',event=>followCatalogView\(event\.detail\)\)/);
  assert.match(source,/requestDeletion\(itemType,name\)/);
  assert.match(source,/itemType==='dish'\?DELETE_DISH_PREFIX:DELETE_PRODUCT_PREFIX/);
  assert.match(source,/removals\.set\(key,token\)/);
  assert.match(source,/await wait\(REMOVE_HOLD_MS\);[\s\S]*?if\(token\.cancelled\)return;[\s\S]*?await requestDeletion\(itemType,name\)/);
  assert.match(source,/function undoRemoval\(key\)\{/);
  assert.match(source,/data-undo-delete/);
  assert.match(source,/recipeUsages\(name\)\.then\(usages=>\(\{usages\}\)/);
  assert.match(source,/await usage;\s*if\(token\.cancelled\)return;\s*token\.phase='exit'/);
});

test('la suppression d un plat retire recette, quantités et visuel sans toucher aux produits',()=>{
  const source=read('scripts/manage_product_catalog.py');
  assert.match(source,/DELETE_DISH_PREFIX = '__courses_delete_dish__:'/);
  assert.match(source,/def delete_dish\(requested: str\)/);
  assert.match(source,/remove_dish_record\(dishes_text, name\)/);
  assert.match(source,/remove_object_entry\(quantities_text, 'DISH_NEEDS_FOR_TWO'/);
  assert.match(source,/ROOT \/ 'www' \/ 'Plats' \/ filename/);
  assert.match(source,/if image_path\.exists\(\):\s*image_path\.unlink\(\)/);
});

test('le workflow traite delete_dish sans génération OpenAI',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.match(workflow,/delete_dish_prefix='__courses_delete_dish__:'/);
  assert.match(workflow,/item_type='delete_dish'/);
  assert.match(workflow,/type != 'delete_product' && steps\.request\.outputs\.type != 'delete_dish'/);
  assert.match(workflow,/www\/Plats\/\$\{\{ steps\.result\.outputs\.filename \}\}/);
  assert.match(workflow,/supprime le plat \$\{\{ steps\.request\.outputs\.name \}\} du catalogue/);
});

test('la notification distingue la suppression d un plat',()=>{
  const source=read('scripts/send_web_push.mjs');
  assert.match(source,/deleteDishPrefix='__courses_delete_dish__:'/);
  assert.match(source,/deleteDish\?'dish'/);
  assert.match(source,/deleteDish\?'Plat supprimé'/);
  assert.match(source,/operation:deleting\?'delete':'integrate'/);
});
