import assert from 'node:assert/strict';
import {existsSync,readdirSync,readFileSync} from 'node:fs';
import test from 'node:test';
const root=new URL('../',import.meta.url); const read=file=>readFileSync(new URL(file,root),'utf8');
const slugify=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
function groups(){const source=read('catalog.js');const match=source.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s);assert.ok(match,'groups introuvable');return JSON.parse(match[1]);}
test('aucun ancien atlas produit ni chemin atlas ne subsiste',()=>{
  assert.deepEqual(readdirSync(root).filter(name=>/^bring-photo-v[45]-.*\.webp\.png$/.test(name)),[]);
  assert.doesNotMatch(read('app.js'),/PRODUCT_SHEETS|POSITIONS|bring-photo-v[45]|scheduleProductSheetsWarmup|warmProductSheets/);
  assert.doesNotMatch(read('product-item-images.js'),/restoreAtlas|singleProductAtlasSource|bring-photo-v[45]/);
  assert.doesNotMatch(read('dish-local-images.js'),/PRODUCT_VISUALS|courses-product-visuals-warming|bring-photo-v[45]/);
  assert.doesNotMatch(read('sw.js'),/bring-photo-v[45]|PRODUCT_VISUALS/); assert.doesNotMatch(read('catalog.js'),/\n\s*meta:\s*\{/);
  assert.equal(existsSync(new URL('docs/ATLAS_PRODUITS.md',root)),false);
});
test('chaque produit du catalogue dispose de son WebP unitaire canonique',()=>{
  const missing=[]; for(const subgroups of Object.values(groups()))for(const names of Object.values(subgroups||{}))for(const name of names)if(!existsSync(new URL('www/Items/'+slugify(name)+'.webp',root)))missing.push(name);
  assert.deepEqual(missing,[]);
});


test('Ma liste et la fiche plat demandent directement leurs WebP sans délai artificiel',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  const bridge=read('error-feedback-bridge.js');
  assert.ok(app.includes(`loading="eager" fetchpriority="'+(compact?'high':'auto')+'"`));
  assert.ok(dishes.includes("const ingredientImageSource=name=>'./www/Items/'"));
  assert.ok(dishes.includes("+'.webp';"));
  assert.ok(dishes.includes('loading="eager" fetchpriority="high"'));
  assert.doesNotMatch(dishes,/ingredientThumbCache|ingredientThumbRequest|ingredientThumbUserQuery|primeDishIngredientThumbs|setHiddenCatalogQuery|nextPaint\(\)/);
  assert.doesNotMatch(bridge,/forceListImagesEager|startListImageWarmup/);
});
