import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {COURSES_TEXT} from './courses-text.mjs';

const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const groups = JSON.parse(read('catalog.js').match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s)[1]);
const slugify = name => name.toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const sauces = [
  ...groups['Épicerie']['Sauces & condiments'].filter(name => name !== 'Cornichon' && !/^(Huile|Vinaigre)/.test(name)),
  ...groups['Épicerie']['Sauces sucrées'],
  'Harissa', 'Guacamole', 'Houmous', 'Tapenade'
].map(slugify);
const spices = ['Curcuma', 'Curry', 'Paprika', 'Poivre', 'Sel', 'Chili', 'Vanille'].map(slugify);
const slugs = [...sauces, ...spices];
const canonical = new Set(['mayonnaise','paprika']);
const asset = slug => './www/Items/' + slug + '.webp';

test('toutes les sauces et épices du périmètre restent transparentes et sous 15 000 octets', () => {
  for (const slug of slugs) {
    const bytes = readFileSync(new URL(asset(slug), root));
    assert.ok(bytes.length <= 15000, slug + ': ' + bytes.length + ' octets');
    assert.equal(bytes.toString('ascii',0,4),'RIFF',slug);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',slug);
    assert.equal(bytes.toString('ascii',12,16),'VP8X',slug);
    assert.ok(bytes[20] & 0x10,slug + ': alpha requis');
  }
});

test('les deux références approuvées Mayonnaise et Paprika sont conservées à l’identique', () => {
  for (const [slug, expected] of [
    ['mayonnaise','f49e68401619d372a143695f0ca7adf891b306ef'],
    ['paprika','2a6c2f58e403921f1e9b4b1e7262aa3d27c677c1']
  ]) {
    const bytes = readFileSync(new URL(asset(slug), root));
    const actual = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
    assert.equal(actual, expected, slug + ': référence canonique modifiée');
  }
});

test('les cadrages antérieurs sont recalculés seulement pour les visuels renouvelés', () => {
  const source = read('product-item-images.js');
  const currentVersion = read('dish-local-images.js').match(/const APP_VERSION='(v\d+)'/)[1];
  for (const version of ['v740',currentVersion]) {
    const items = Object.fromEntries([...slugs,'lait','riz-blanc'].map(slug => [asset(slug),[1.2,2,-3]]));
    const window = {COURSES_TEXT,COURSES_CATALOG:{groups:{}},COURSES_APP_VERSION:currentVersion};
    vm.runInNewContext(source, {
      window,
      document:{readyState:'loading',addEventListener(){}},
      localStorage:{getItem:key => key==='courses-product-visual-scale-v1' ? JSON.stringify({version,items}) : null}
    });
    const style = window.COURSES_PRODUCT_IMAGES.visualScaleStyle;
    const factors = new Function(source.slice(source.indexOf('const PRODUCT_VISUAL_FACTORS='),source.indexOf('let visualScaleSaveTimer='))+';return PRODUCT_VISUAL_FACTORS;')();
    for (const slug of slugs) {
      if (version==='v740' && !canonical.has(slug)) assert.equal(style(asset(slug)), factors.has(asset(slug))?'--single-product-scale:'+Math.round(factors.get(asset(slug))[0]*1000)/1000+';--single-product-shift-x:0%;--single-product-shift-y:0%':'',slug);
      else assert.ok(style(asset(slug)).includes('--single-product-scale:'+Math.round(1.2*(factors.get(asset(slug))?.[0]||1)*1000)/1000+';'),slug);
    }
    for (const slug of ['lait','riz-blanc']) assert.ok(style(asset(slug)).includes('--single-product-scale:'+Math.round(1.2*(factors.get(asset(slug))?.[0]||1)*1000)/1000+';'),slug);
  }
});
