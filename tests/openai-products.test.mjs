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
  assert.ok(fixes.includes("const progressLabel=cancelled?'Annulé':failed?'Erreur':'En cours';"));
  assert.ok(fixes.includes('if(progress.textContent!==progressLabel)progress.textContent=progressLabel;'));
  assert.ok(fixes.includes('const openAiErrors=new Set();'));
  assert.ok(fixes.includes('.missing-dish-progress.is-error'));
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
  assert.match(workflow,/git add catalog\.js app\.js catalog-quantities\.js index\.html product-item-images\.js dish-local-images\.js sw\.js/);
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
  assert.match(script,/"category", "subgroup", "create_subgroup" et "display_mode"/);
  assert.match(script,/display_mode not in DISPLAY_MODES/);
  assert.match(script,/groups\[category\]\[subgroup\]\.sort\(key=base\.normalize\)/);
  assert.match(script,/update_display_mode\(name,display_mode\)/);
  assert.match(script,/def display_mode_from_hint\(value: str\) -> str:/);
  assert.match(script,/result\["display_mode"\]=explicit_mode/);
  assert.match(script,/ensure_shell_assets\(sw_text,\[/);
  assert.match(script,/if not isinstance\(create_value,bool\)/);
  assert.match(script,/if create_subgroup:/);
  assert.match(script,/groups\[category\]\[subgroup\]=\[\]/);
  assert.match(script,/created_subgroup/);
});

test('une nouvelle tuile produit peut être remplacée par son image unitaire',()=>{
  const images=read('product-item-images.js');
  assert.match(images,/card\.querySelector\('\.product-svg'\)/);
  assert.match(images,/fallback\.replaceWith\(sprite\)/);
  assert.match(images,/const compact=fallback\.classList\.contains\('is-compact'\)/);
  assert.match(images,/sprite\.className='premium-sprite is-single-product-image'\+\(compact\?' is-compact':''\)/);
  assert.match(images,/getImageData\(0,0,size,size\)/);
  assert.match(images,/--single-product-scale/);
  assert.match(images,/\.90\/Math\.max\(\.01,occupancy\)/);
});

test('Ma liste reprend la même image unitaire que le Catalogue sans atlas de secours',()=>{
  const images=read('product-item-images.js');
  const app=read('app.js');
  assert.match(images,/listItems=document\.getElementById\('listItems'\)/);
  assert.match(images,/listItems\?\.querySelectorAll\('\.list-row\[data-name\]'\)\.forEach\(decorateCard\)/);
  assert.match(images,/observer\.observe\(listItems,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(images,/restoreAtlas|singleProductAtlasSource/);
  assert.match(app,/const productImageSource=name=>'\.\/www\/Items\/'\+productSlug\(name\)\+'\.webp'/);
  assert.match(app,/bindProductImageFallbacks\(el\)/);
});
