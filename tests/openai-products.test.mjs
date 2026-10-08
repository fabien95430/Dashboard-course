import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('un produit manquant utilise le même déclencheur OpenAI et le même relais Home Assistant qu’un plat',()=>{
  const fixes=read('missing-products-fixes.js');
  const popup=read('missing-products-popup-ui.js');
  assert.match(fixes,/const PRODUCT_PREFIX='__courses_product__:'/);
  assert.match(fixes,/\[data-openai-missing-product\],\[data-openai-missing-dish\]/);
  assert.match(fixes,/haCallService\('rest_command','courses_integrate_dish_openai'/);
  assert.match(fixes,/dish_name:\(type==='product'\?PRODUCT_PREFIX:''\)\+String\(item\.name/);
  assert.match(popup,/Intégrer avec OpenAI/);
  assert.match(popup,/\[data-openai-missing-product\],\[data-openai-missing-dish\]/);
});

test('le lancement OpenAI reste visible dans le popup et notifie Courses immédiatement',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/progress\.textContent='En cours…'/);
  assert.match(fixes,/courses-openai-feedback/);
  assert.match(fixes,/registration\.showNotification\('Demande envoyée'/);
  assert.match(fixes,/est en cours de génération\./);
  assert.match(fixes,/void notifyIntegrationStarted\(type,item,serviceData\.request_id\)/);
});

test('le workflow OpenAI route les produits vers une intégration WebP avec notification Web Push',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  const script=read('scripts/integrate_product_openai.py');
  assert.match(workflow,/python3 scripts\/integrate_product_openai\.py/);
  assert.match(workflow,/www\/Items\/\$\{\{ steps\.result\.outputs\.filename \}\}/);
  assert.match(workflow,/node scripts\/send_web_push\.mjs/);
  assert.match(script,/"output_format":"webp"/);
  assert.match(script,/"background":"transparent"/);
  assert.match(script,/ROOT \/ "www" \/ "Items" \/ filename/);
  assert.match(script,/ROOT \/ "catalog\.js"/);
});

test('le classement OpenAI reçoit tout le catalogue et peut créer une sous-catégorie',()=>{
  const script=read('scripts/integrate_product_openai.py');
  assert.doesNotMatch(script,/list\(names\)\[:8\]/);
  assert.match(script,/category:\{subgroup:list\(names\) for subgroup,names in subgroups\.items\(\)\}/);
  assert.match(script,/"category", "subgroup" et "create_subgroup"/);
  assert.match(script,/if not isinstance\(create_value,bool\)/);
  assert.match(script,/if create_subgroup:/);
  assert.match(script,/groups\[category\]\[subgroup\]=\[\]/);
  assert.match(script,/created_subgroup/);
});

test('une nouvelle tuile produit hors atlas peut être remplacée par son image unitaire',()=>{
  const images=read('product-item-images.js');
  assert.match(images,/card\.querySelector\('\.product-svg'\)/);
  assert.match(images,/fallback\.replaceWith\(sprite\)/);
  assert.match(images,/sprite\.className='premium-sprite is-single-product-image'/);
});
