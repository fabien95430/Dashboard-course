#!/usr/bin/env python3
from pathlib import Path
import re

V='383'
ROOT=Path('.')

def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,text): Path(path).write_text(text,encoding='utf-8')
def one(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 occurrence, got {n}')
    return text.replace(old,new,1)

for old,new in [('www/Items/lait-amande.webp','www/Items/lait-d-amande.webp'),('www/Items/lait-avoine.webp','www/Items/lait-d-avoine.webp')]:
    source=Path(old); target=Path(new)
    if source.exists() and not target.exists(): source.rename(target)

path='catalog.js'; text=read(path)
text,n=re.subn(r"\n\s*meta:\s*\{[^\n]*\},","",text,count=1)
if n!=1: raise SystemExit('catalog atlas meta not found')
text,n=re.subn(r"dish-local-images\.js\?v=\d+",f"dish-local-images.js?v={V}",text,count=1)
if n!=1: raise SystemExit('catalog local images loader not found')
write(path,text)

for path in ['scripts/integrate_dish.py','scripts/manage_product_catalog.py','scripts/integrate_product_openai.py']:
    text=read(path)
    old=r'groups:\s*(\{.*?\}),\s*\n\s*meta:'
    new=r'groups:\s*(\{.*?\}),\s*\n\s*favorites:'
    if old not in text: raise SystemExit(f'{path}: catalog parser marker not found')
    write(path,text.replace(old,new))

path='app.js'; text=read(path)
text=text.replace("const META = CATALOG.meta;\n",'',1)
start=text.index('const POSITIONS=new Map();')
end=text.index('let state={',start)
text=text[:start]+text[end:]
marker='const esc = value =>'
pos=text.index(marker)
slug="""const productSlug=value=>String(value||'')
  .toLowerCase()
  .replace(/œ/g,'oe')
  .normalize('NFD')
  .replace(/[\\u0300-\\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'');
const productImageSource=name=>'./www/Items/'+productSlug(name)+'.webp';
"""
text=text[:pos]+slug+text[pos:]
start=text.index('function sprite(product,compact=false){')
end=text.index('\n\nfunction usageSave()',start)
renderer="""function sprite(product,compact=false){
  const fallback=premiumProductVisual(product,compact);
  const source=productImageSource(product?.name);
  return '<span class=\"sprite premium-sprite is-single-product-image '+(compact?'is-compact':'')+'\" aria-hidden=\"true\">'+
    '<img src=\"'+source+'\" alt=\"\" loading=\"'+(compact?'lazy':'eager')+'\" decoding=\"async\" draggable=\"false\" data-single-product-source=\"'+source+'\">'+
    '<span class=\"sprite-fallback\">'+fallback+'</span>'+
  '</span>';
}
function bindProductImageFallbacks(root){
  root?.querySelectorAll?.('.premium-sprite.is-single-product-image>img').forEach(image=>{
    if(image.dataset.productFallbackBound==='1')return;
    image.dataset.productFallbackBound='1';
    const fallback=()=>{
      image.hidden=true;
      image.parentElement?.classList.add('is-fallback');
    };
    image.addEventListener('error',fallback,{once:true});
    if(image.complete&&image.naturalWidth===0)fallback();
  });
}"""
text=text[:start]+renderer+text[end:]
marker="  const add=card.querySelector('.badge');if(add)add.onclick=()=>queueCatalogQuantityChange(product.name,1);"
text=one(text,marker,"  bindProductImageFallbacks(card);\n"+marker,'catalog fallback binding')
marker="  }).join('');\n  el.querySelectorAll('.purchase-check')"
text=one(text,marker,"  }).join('');\n  bindProductImageFallbacks(el);\n  el.querySelectorAll('.purchase-check')",'list fallback binding')
text=text.replace('scheduleProductSheetsWarmup();\n','',1)
if any(token in text for token in ('PRODUCT_SHEETS','POSITIONS','scheduleProductSheetsWarmup','warmProductSheets','bring-photo-v5-')):
    raise SystemExit('app.js still contains atlas runtime code')
write(path,text)

path='product-item-images.js'; text=read(path)
start=text.index('function restoreAtlas('); end=text.index('function decorateFallback(',start)
text=text[:start]+text[end:]
start=text.index('function decorateCard(card){'); end=text.index('function decorateProducts(){',start)
decorate="""function decorateCard(card){
  const name=String(card?.dataset?.name||'');
  if(!PRODUCT_NAMES.has(name))return;
  const source=imageSource(name);
  const sprite=card.querySelector('.premium-sprite');
  const image=sprite?.querySelector(':scope > img');
  if(!sprite||!image){decorateFallback(card,name,source);return;}
  card.classList.add('has-single-product-image');
  sprite.classList.add('is-single-product-image');
  const loaded=()=>onSingleProductImageLoaded(image,source);
  if(image.dataset.singleProductSource!==source){image.dataset.singleProductSource=source;image.src=source;}
  if(image.complete&&image.naturalWidth>0)loaded();
  else image.addEventListener('load',loaded,{once:true});
}
"""
text=text[:start]+decorate+text[end:]
if 'restoreAtlas' in text or 'singleProductAtlasSource' in text: raise SystemExit('atlas fallback remains in product-item-images.js')
write(path,text)

path='dish-local-images.js'; text=read(path)
text,n=re.subn(r"const APP_VERSION='v\d+';",f"const APP_VERSION='v{V}';",text,count=1)
if n!=1: raise SystemExit('APP_VERSION not found')
start=text.index('const PRODUCT_VISUALS=Object.freeze(['); end=text.index('const PRIMARY_DISH_VISUALS=',start)
text=text[:start]+text[end:]
start=text.index('function installVisualWarmupStyle(){'); end=text.index('function installMissingProductsFixes(){',start)
text=text[:start]+text[end:]
text,n=re.subn(r"product-item-images\.js\?v=\d+",'product-item-images.js?v=14',text,count=1)
if n!=1: raise SystemExit('product item loader not found')
start=text.index('async function warmProductVisuals(){'); end=text.index('function scheduleDishVisualWarmup(){',start)
text=text[:start]+text[end:]
text=text.replace('installVisualWarmupStyle();\n','',1).replace('void warmProductVisuals();\n','',1)
if 'PRODUCT_VISUALS' in text or 'courses-product-visuals-warming' in text or 'bring-photo-v5-' in text: raise SystemExit('atlas warmup remains')
write(path,text)

path='missing-products-dishes.js'; text=read(path)
old="    '- Ne pas modifier ni supprimer l’atlas de la catégorie : il reste uniquement comme fallback si l’image unitaire manque ou échoue.',"
new="    '- Utiliser uniquement l’image WebP unitaire dans www/Items/ ; aucun atlas ou sprite produit ne doit être créé ni réintroduit.',"
text=one(text,old,new,'product prompt atlas rule')
text=text.replace("    if(document.documentElement.classList.contains('courses-product-visuals-warming'))return;\n",'',1)
marker='const visualWarmupObserver=new MutationObserver'
s=text.find(marker)
if s>=0:
    end_marker="visualWarmupObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});"
    e=text.index(end_marker,s)+len(end_marker)
    while e<len(text) and text[e] in '\r\n': e+=1
    text=text[:s]+text[e:]
if 'courses-product-visuals-warming' in text: raise SystemExit('missing-products still waits for atlas warmup')
write(path,text)

path='settings-tab-badge.js'; text=read(path)
text,n=re.subn(r"missing-products-dishes\.js\?v=\d+",f"missing-products-dishes.js?v={V}",text,count=1)
if n!=1: raise SystemExit('missing-products loader not found')
write(path,text)

path='index.html'; text=read(path)
current=re.findall(r'<span class="page-version">v(\d+)</span>',text)
if current!=['382','382','382']: raise SystemExit(f'unexpected visible versions: {current}')
text=text.replace('<span class="page-version">v382</span>',f'<span class="page-version">v{V}</span>')
for file in ['catalog.js','app.js','settings-tab-badge.js']:
    text,n=re.subn(rf'<script src="\./{re.escape(file)}\?v=\d+"></script>',f'<script src="./{file}?v={V}"></script>',text,count=1)
    if n!=1: raise SystemExit(f'{file} entry script not found')
write(path,text)

path='sw.js'; text=read(path)
text,n=re.subn(r"const CACHE='courses-app-v\d+-r1';",f"const CACHE='courses-app-v{V}-r1';",text,count=1)
if n!=1: raise SystemExit('app cache version not found')
text=one(text,"const VISUAL_CACHE='courses-visuals-v1';","const VISUAL_CACHE='courses-visuals-v2';",'visual cache')
text=text.replace('const PRODUCT_VISUALS=[','const CORE_VISUALS=[',1)
text=re.sub(r"^\s*'\./bring-photo-v5-[^']+',\n",'',text,flags=re.M)
text=text.replace("\n    ||/\\/bring-photo-v5-(?:frais|fruits-legumes|epicerie|boissons|maison)\\.webp\\.png$/.test(url.pathname);",";",1)
text=text.replace('async function seedProductVisuals(){','async function seedCoreVisuals(){',1).replace('PRODUCT_VISUALS.map','CORE_VISUALS.map').replace('migrateExistingVisuals().then(seedProductVisuals)','migrateExistingVisuals().then(seedCoreVisuals)')
shell_end=text.index('];',text.index('const SHELL=[')); prefix=text[:shell_end]
for entry in [f"'./catalog.js?v={V}'",f"'./app.js?v={V}'",f"'./dish-local-images.js?v={V}'","'./product-item-images.js?v=14'",f"'./missing-products-dishes.js?v={V}'",f"'./settings-tab-badge.js?v={V}'","'./catalog-product-admin.js?v=2'"]:
    if entry not in prefix: prefix+=','+entry
text=prefix+text[shell_end:]
if 'bring-photo-v5-' in text or 'PRODUCT_VISUALS' in text: raise SystemExit('atlas assets remain in sw.js')
write(path,text)

path='AGENTS.md'; text=read(path); heading='## Atlas de visuels produits\n'
if heading not in text: raise SystemExit('AGENTS atlas section missing')
text=text[:text.index(heading)]+"""## Visuels des produits

Un produit utilise une image WebP unitaire dans `www/Items/`. Lire `docs/IMAGES_ITEMS.md` avant toute création ou modification d’un visuel produit.

Ne jamais réintroduire d’atlas, de planche ou de sprite produit. `product-item-images.js` peut harmoniser le cadrage des WebP unitaires, et le SVG premium local reste le seul fallback si une image manque ou échoue.
"""
write(path,text)

path='docs/IMAGES_ITEMS.md'; text=read(path)
old="- Les catégories Fruits & Légumes, Frais, Épicerie, Boissons et Maison utilisent les images unitaires.\n- Les anciens atlas restent uniquement comme **solution de repli** si une image unitaire manque ou ne charge pas. Ne pas les supprimer lors de la régénération d’un seul item."
new="- Toutes les catégories utilisent les images unitaires.\n- Si une image unitaire manque ou ne charge pas, l’application utilise uniquement le visuel SVG premium local de secours."
text=one(text,old,new,'IMAGES_ITEMS principle')
text=text.replace('Conserver l’atlas comme fallback.','Vérifier aussi que le fallback SVG local reste lisible si le WebP ne charge pas.',1)
text=text.replace('le fallback atlas fonctionne-t-il toujours si le fichier unitaire échoue ?','le fallback SVG local reste-t-il lisible si le fichier unitaire échoue ?',1)
text=text.replace('- Ne pas supprimer les atlas de secours dans une opération de régénération isolée.','- Ne jamais réintroduire d’atlas, de planche ou de sprite produit : un produit reste un fichier WebP unitaire.',1)
write(path,text)

path='docs/AUTOMATISATION_PLATS.md'; text=read(path)
text=one(text,'   - pour un produit, le respect de `docs/ATLAS_PRODUITS.md` et de l’atlas de sa catégorie.','   - pour un produit, le respect de `docs/IMAGES_ITEMS.md` et d’une image WebP unitaire dans `www/Items/`.','automation docs')
write(path,text)

path='tests/catalog-ordering.test.mjs'; text=read(path)
text=text.replace(r'/groups:\s*(\{.*?\}),\s*\n\s*meta:/s',r'/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s')
text=text.replace("assert.equal(locations.get(norm('Confiture fruits rouges'))?.category,'Petit-déjeuner');","assert.equal(locations.get(norm('Lait'))?.category,'Frais');")
write(path,text)

path='tests/openai-cancellation.test.mjs'; text=read(path)
text=text.replace(r"assert.match(workflow,/run-name: OpenAI · \$\{\{ github\.event\.client_payload\.request_id \}\}/);",r"assert.match(workflow,/run-name: Courses · \$\{\{ github\.event\.client_payload\.request_id \}\}/);")
write(path,text)

path='tests/openai-products.test.mjs'; text=read(path)
text=text.replace("test('une nouvelle tuile produit hors atlas peut être remplacée par son image unitaire'","test('une nouvelle tuile produit peut être remplacée par son image unitaire'",1)
start=text.index("test('Ma liste reprend la même image unitaire que le Catalogue"); end=text.index('\n});',start)+4
replacement="""test('Ma liste reprend la même image unitaire que le Catalogue sans atlas de secours',()=>{
  const images=read('product-item-images.js');
  const app=read('app.js');
  assert.match(images,/listItems=document\.getElementById\('listItems'\)/);
  assert.match(images,/listItems\?\.querySelectorAll\('\.list-row\[data-name\]'\)\.forEach\(decorateCard\)/);
  assert.match(images,/observer\.observe\(listItems,\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(images,/restoreAtlas|singleProductAtlasSource/);
  assert.match(app,/const productImageSource=name=>'\.\/www\/Items\/'\+productSlug\(name\)\+'\.webp'/);
  assert.match(app,/bindProductImageFallbacks\(el\)/);
});"""
text=text[:start]+replacement+text[end:]; write(path,text)

path='tests/preference-popups.test.mjs'; text=read(path)
start=text.index("test('la version visible runtime passe à v373"); end=text.index('\n});',start)+4
replacement=f"""test('la version visible runtime passe à v{V} et recharge les modules modifiés',()=>{{
  const index=read('index.html'),catalog=read('catalog.js'),settings=read('settings-tab-badge.js'),sw=read('sw.js'),localImages=read('dish-local-images.js');
  assert.match(index,/catalog\\.js\\?v={V}/); assert.match(index,/app\\.js\\?v={V}/); assert.match(index,/settings-tab-badge\\.js\\?v={V}/);
  assert.equal((index.match(/page-version\\">v{V}/g)||[]).length,3);
  assert.match(catalog,/dish-local-images\\.js\\?v={V}/); assert.match(settings,/missing-products-dishes\\.js\\?v={V}/);
  assert.match(sw,/courses-app-v{V}-r1/); assert.match(sw,/product-item-images\\.js\\?v=14/);
  assert.match(localImages,/const APP_VERSION='v{V}'/); assert.match(localImages,/product-item-images\\.js\\?v=14/);
}});"""
text=text[:start]+replacement+text[end:]; write(path,text)

path='tests/startup-shell.test.mjs'; text=read(path).replace('v380',f'v{V}').replace('v=380',f'v={V}'); write(path,text)

path='tests/offline-shell.test.mjs'; text=read(path)
needle="      if(next==='sw.js')continue;\n      requests.add(match[1]);walk(next);"
text=one(text,needle,"      if(next==='sw.js'||match[1].includes('courses_catalog_admin='))continue;\n      requests.add(match[1]);walk(next);",'offline runtime fetch exclusion'); write(path,text)

Path('tests/product-images-no-atlas.test.mjs').write_text(r'''import assert from 'node:assert/strict';
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
''',encoding='utf-8')

Path('docs/ATLAS_PRODUITS.md').unlink()
for asset in Path('.').glob('bring-photo-v[45]-*.webp.png'): asset.unlink()
