from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


path='tests/error-center-loading.test.mjs'
text=read(path)
start=text.index("test('le centre d erreurs reste chargé")
replacement="""test('le centre d erreurs reste chargé sans restaurer le shell de démarrage',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const localImages=read('dish-local-images.js');
  assert.match(index,/error-center\\.js\\?v=390/);
  assert.match(index,/error-feedback-bridge\\.js\\?v=391/);
  assert.ok(index.indexOf('error-center.js?v=390')<index.indexOf('error-feedback-bridge.js?v=391'));
  assert.doesNotMatch(index,/startup\\/app\\.js/);
  assert.match(sw,/courses-app-v391-r1/);
  assert.match(sw,/error-center\\.js\\?v=390/);
  assert.match(sw,/error-feedback-bridge\\.js\\?v=391/);
  assert.match(localImages,/const APP_VERSION='v391'/);
  assert.equal((index.match(/page-version\">v391/g)||[]).length,3);
});
"""
write(path,text[:start]+replacement)

path='tests/product-images-no-atlas.test.mjs'
text=read(path)
old="  assert.ok(dishes.includes(\"const ingredientImageSource=name=>'./www/Items/'+normalize(name).replace(/\\\\s+/g,'-')+'.webp';\"));"
new="  assert.ok(dishes.includes(\"const ingredientImageSource=name=>'./www/Items/'\"));\n  assert.ok(dishes.includes(\"+'.webp';\"));"
if old not in text:
    raise SystemExit('ingredient image assertion not found')
write(path,text.replace(old,new,1))
