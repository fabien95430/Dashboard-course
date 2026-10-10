from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)


# Ma liste: le renderer propriétaire lance le WebP dès la création de la ligne.
path = 'app.js'
text = read(path)
text = once(
    text,
    "    '<img src=\"'+source+'\" alt=\"\" loading=\"'+(compact?'lazy':'eager')+'\" decoding=\"async\" draggable=\"false\" data-single-product-source=\"'+source+'\">'+",
    "    '<img src=\"'+source+'\" alt=\"\" loading=\"eager\" fetchpriority=\"'+(compact?'high':'auto')+'\" decoding=\"async\" draggable=\"false\" data-single-product-source=\"'+source+'\">'+",
    'app product image loading',
)
write(path, text)

# Fiche plat: WebP canonique direct, sans recherche Catalogue cachée.
path = 'dishes-ui.js'
text = read(path)
text = once(
    text,
    "const dishPhotoUrl=name=>'./www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+(DISH_SPECIAL_SLUGS[name]||dishSlug(name))+'.png';",
    "const dishPhotoUrl=name=>'./www/Plats/'+(CHILD_DISHES.has(name)?'enfant-':'')+(DISH_SPECIAL_SLUGS[name]||dishSlug(name))+'.png';\nconst ingredientImageSource=name=>'./www/Items/'+normalize(name).replace(/\\s+/g,'-')+'.webp';",
    'ingredient image source',
)
text = once(text, "const ingredientThumbCache=new Map();\n", '', 'ingredient thumb cache')
text = once(text, "let ingredientThumbRequest=0;\nlet ingredientThumbUserQuery=null;\n", '', 'ingredient thumb request state')
text = once(text, "  void primeDishIngredientThumbs(dish);\n", '', 'dish thumb priming call')
text, count = re.subn(
    r"function cancelIngredientThumbs\(\)\{.*?\n\}\nfunction closeDishSheet\(\)\{",
    "function closeDishSheet(){",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit('cancelIngredientThumbs block not replaced')
text = text.replace('  cancelIngredientThumbs();\n', '')
text, count = re.subn(
    r"async function primeDishIngredientThumbs\(dish\)\{.*?\n\}\nfunction renderDishSheetIngredients\(\)\{",
    "function renderDishSheetIngredients(){",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit('primeDishIngredientThumbs block not replaced')
old = """    const selected=selectedIngredients.has(name);
    const thumb=ingredientThumbCache.get(name)||'';
    return '<button type=\"button\" class=\"dish-ingredient '+(selected?'is-selected':'')+'\" data-ingredient=\"'+escapeHtml(name)+'\" aria-pressed=\"'+(selected?'true':'false')+'\">'+
      '<span class=\"dish-ingredient-thumb\" aria-hidden=\"true\">'+thumb+'</span>'+ """
new = """    const selected=selectedIngredients.has(name);
    const source=ingredientImageSource(name);
    const thumb='<span class=\"sprite premium-sprite is-single-product-image is-compact\"><img src=\"'+source+'\" alt=\"\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\" draggable=\"false\" data-single-product-source=\"'+source+'\"></span>';
    return '<button type=\"button\" class=\"dish-ingredient '+(selected?'is-selected':'')+'\" data-ingredient=\"'+escapeHtml(name)+'\" aria-pressed=\"'+(selected?'true':'false')+'\">'+
      '<span class=\"dish-ingredient-thumb\" aria-hidden=\"true\">'+thumb+'</span>'+ """
text = once(text, old, new, 'direct ingredient thumb')
text, count = re.subn(
    r"\nfunction setHiddenCatalogQuery\(value\)\{.*?\nfunction nextPaint\(\)\{.*?\n\}\n?",
    "\n",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit('hidden catalogue helper block not replaced')
for forbidden in ('ingredientThumbCache', 'ingredientThumbRequest', 'ingredientThumbUserQuery', 'primeDishIngredientThumbs', 'setHiddenCatalogQuery', 'nextPaint()'):
    if forbidden in text:
        raise SystemExit(f'{forbidden} still present')
write(path, text)

# Retire la rustine Ma liste ajoutée dans le module d'erreurs.
path = 'error-feedback-bridge.js'
text = read(path)
marker = "\n(() => {\n'use strict';\n\nfunction forceListImagesEager(root){"
if marker not in text:
    raise SystemExit('temporary list image patch not found')
text = text.split(marker, 1)[0].rstrip() + '\n'
write(path, text)

# Version/cache et loaders.
path = 'index.html'
text = read(path)
text = text.replace('page-version">v390', 'page-version">v391')
if text.count('page-version">v391') != 3:
    raise SystemExit('index page versions not all v391')
text = once(text, './catalog.js?v=390', './catalog.js?v=391', 'index catalog version')
text = once(text, './app.js?v=387', './app.js?v=391', 'index app version')
text = once(text, './error-feedback-bridge.js?v=390', './error-feedback-bridge.js?v=391', 'index error bridge version')
write(path, text)

path = 'catalog.js'
text = read(path)
text = once(text, './dishes-ui.js?v=364', './dishes-ui.js?v=391', 'catalog dishes version')
text = once(text, './dish-local-images.js?v=390', './dish-local-images.js?v=391', 'catalog local images version')
write(path, text)

path = 'dish-local-images.js'
text = read(path)
text = once(text, "const APP_VERSION='v390';", "const APP_VERSION='v391';", 'runtime app version')
write(path, text)

path = 'sw.js'
text = read(path)
text = once(text, "const CACHE='courses-app-v390-r1';", "const CACHE='courses-app-v391-r1';", 'service worker cache')
shell_end = text.index('];', text.index('const SHELL=['))
additions = [
    "'./catalog.js?v=391'",
    "'./app.js?v=391'",
    "'./dishes-ui.js?v=391'",
    "'./dish-local-images.js?v=391'",
    "'./error-feedback-bridge.js?v=391'",
]
prefix = text[:shell_end]
for item in additions:
    if item not in prefix:
        prefix += ',' + item
text = prefix + text[shell_end:]
write(path, text)

# Régression exécutable: aucun délai artificiel ni rustine inter-module.
path = 'tests/product-images-no-atlas.test.mjs'
text = read(path)
if 'Ma liste et la fiche plat demandent directement leurs WebP' not in text:
    text += '''

test('Ma liste et la fiche plat demandent directement leurs WebP sans délai artificiel',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  const bridge=read('error-feedback-bridge.js');
  assert.ok(app.includes(`loading="eager" fetchpriority="'+(compact?'high':'auto')+'"`));
  assert.ok(dishes.includes("const ingredientImageSource=name=>'./www/Items/'+normalize(name).replace(/\\s+/g,'-')+'.webp';"));
  assert.ok(dishes.includes('loading="eager" fetchpriority="high"'));
  assert.doesNotMatch(dishes,/ingredientThumbCache|ingredientThumbRequest|ingredientThumbUserQuery|primeDishIngredientThumbs|setHiddenCatalogQuery|nextPaint\(\)/);
  assert.doesNotMatch(bridge,/forceListImagesEager|startListImageWarmup/);
});
'''
write(path, text)

# Assertions historiques remises au niveau du main courant.
path = 'tests/startup-shell.test.mjs'
text = read(path).replace('v383', 'v391').replace('v=383', 'v=391')
write(path, text)

path = 'tests/error-center-loading.test.mjs'
text = read(path).replace('error-feedback-bridge\\.js\\?v=390', 'error-feedback-bridge\\.js\\?v=391')
write(path, text)

path = 'tests/catalog-ordering.test.mjs'
text = read(path).replace("norm('Chips nature')", "norm('Chips')")
write(path, text)

path = 'tests/preference-popups.test.mjs'
text = read(path)
start = text.index("test('la version visible runtime passe à v383")
replacement = """test('la version visible runtime passe à v391 et recharge les modules modifiés',()=>{
  const index=read('index.html'),catalog=read('catalog.js'),sw=read('sw.js'),localImages=read('dish-local-images.js');
  assert.match(index,/catalog\\.js\\?v=391/); assert.match(index,/app\\.js\\?v=391/); assert.match(index,/error-feedback-bridge\\.js\\?v=391/);
  assert.equal((index.match(/page-version\\\">v391/g)||[]).length,3);
  assert.match(catalog,/dishes-ui\\.js\\?v=391/); assert.match(catalog,/dish-local-images\\.js\\?v=391/);
  assert.match(sw,/courses-app-v391-r1/); assert.match(sw,/app\\.js\\?v=391/); assert.match(sw,/dishes-ui\\.js\\?v=391/);
  assert.match(localImages,/const APP_VERSION='v391'/);
});
"""
text = text[:start] + replacement
write(path, text)
