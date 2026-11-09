import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import test from 'node:test';
import {COURSES_TEXT} from './courses-text.mjs';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
// Anciennes copies, recopiées telles qu'elles existaient dans les modules avant la v820.
const oldKey=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const oldSlug=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

test('les clés partagées donnent exactement les résultats des anciennes copies',()=>{
  const catalog=read('catalog.js');
  const groups=JSON.parse(catalog.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s)[1]);
  const names=new Set(Object.values(groups).flatMap(subs=>Object.values(subs).flat()));
  // Noms de plats et d'ingrédients cités dans dishes-ui.js, plus des cas limites.
  for(const match of read('dishes-ui.js').matchAll(/'([^'\n]{2,60})'/g))names.add(match[1]);
  ['','  Œufs  ','Sirop d’érable','Crème brûlée!','Lait d\'amande','Bière IPA','---','Ça & là',null,undefined,42].forEach(value=>names.add(value));
  assert.ok(names.size>400,'jeu de noms trop petit');
  for(const name of names){
    assert.equal(COURSES_TEXT.key(name),oldKey(name),'key: '+name);
    assert.equal(COURSES_TEXT.slug(name),oldSlug(name),'slug: '+name);
  }
  assert.equal(COURSES_TEXT.key('Œufs'),'oeufs');
  assert.equal(COURSES_TEXT.slug('Lait d’amande'),'lait-d-amande');
});

test('les modules utilisent la clé partagée au lieu de leur propre copie',()=>{
  const copy=/\.replace\(\/\[\^a-z0-9\]\+\/g,'[ -]'\)/;
  // error-center.js garde volontairement sa copie : il doit fonctionner même si catalog.js échoue.
  const allowed=new Set(['catalog.js','error-center.js']);
  const offenders=readdirSync(new URL('.',root)).filter(file=>file.endsWith('.js')&&!allowed.has(file)&&copy.test(read(file).replace(/\n\s*\./g,'.')));
  assert.deepEqual(offenders,[]);
  assert.match(read('error-center.js'),/Copie volontaire de COURSES_TEXT\.key/);
  for(const [file,pattern] of [
    ['dishes-ui.js',/const normalize=window\.COURSES_TEXT\.key;[\s\S]*const dishSlug=window\.COURSES_TEXT\.slug;/],
    ['dish-added-marker.js',/const normalize=window\.COURSES_TEXT\.key;/],
    ['missing-requests-store.js',/const normalize=window\.COURSES_TEXT\.key;/],
    ['purchase-intelligence.js',/const norm=window\.COURSES_TEXT\.key;/],
    ['catalog-product-admin.js',/const norm=window\.COURSES_TEXT\.key;/],
    ['app.js',/const key=window\.COURSES_TEXT\.key\(value\);[\s\S]*const productSlug=window\.COURSES_TEXT\.slug;/],
    ['product-item-images.js',/const slugify=window\.COURSES_TEXT\.slug;/],
    ['repurchase-soon.js',/const slugify=window\.COURSES_TEXT\.slug;/]
  ])assert.match(read(file),pattern,file);
  // catalog.js est chargé en premier par index.html, avant tout module qui lit COURSES_TEXT.
  const scripts=[...read('index.html').matchAll(/<script src="\.\/([^"?]+)/g)].map(match=>match[1]);
  assert.equal(scripts[0],'catalog.js');
});
