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

test('une nouvelle tuile produit hors atlas peut être remplacée par son image unitaire',()=>{
  const images=read('product-item-images.js');
  assert.match(images,/card\.querySelector\('\.product-svg'\)/);
  assert.match(images,/fallback\.replaceWith\(sprite\)/);
  assert.match(images,/sprite\.className='premium-sprite is-single-product-image'/);
});
