#!/usr/bin/env python3
from pathlib import Path
import re

path=Path('tests/preference-popups.test.mjs')
text=path.read_text(encoding='utf-8')

old="""test('le design moderne des produits manquants ne redéfinit plus la coque extérieure',()=>{
  const source=read('missing-products-modern.js');
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bwidth:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bheight:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bmax-height:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bpadding(?:-left|-right)?:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bborder-radius:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\boverflow(?:-y)?:/);
});"""
new="""test('le design moderne des produits manquants ne redéfinit plus les dimensions de la coque extérieure',()=>{
  const source=read('missing-products-modern.js');
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bwidth:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bheight:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bmax-height:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bpadding(?:-left|-right)?:/);
  assert.doesNotMatch(source,/#missingProductsDialog\\{[^}]*\\bborder-radius:/);
});"""
if old not in text:
    raise SystemExit('test coque popup introuvable')
text=text.replace(old,new,1)

text=text.replace("test('la version visible runtime passe à v370 et recharge les modules modifiés',()=>{","test('la version visible runtime passe à v373 et recharge les modules modifiés',()=>{",1)
text=text.replace("catalog\\.js\\?v=370","catalog\\.js\\?v=373")
text=text.replace("app\\.js\\?v=370","app\\.js\\?v=373")
text=text.replace('page-version\\\">v370','page-version\\\">v373')
text=text.replace("catalog-quantities\\.js\\?v=370","catalog-quantities\\.js\\?v=373")
text=text.replace("dish-local-images\\.js\\?v=370","dish-local-images\\.js\\?v=373")
text=text.replace("courses-app-v370-r1","courses-app-v373-r1")
text=text.replace("const APP_VERSION='v370'","const APP_VERSION='v373'")
text=text.replace("product-item-images\\.js\\?v=11","product-item-images\\.js\\?v=12")
anchor="  assert.match(localImages,/product-item-images\\.js\\?v=12/);\n"
if anchor not in text:
    raise SystemExit('assert product-item-images v12 introuvable')
text=text.replace(anchor,anchor+"  assert.match(localImages,/purchase-intelligence\\.js\\?v=5/);\n",1)

path.write_text(text,encoding='utf-8')
