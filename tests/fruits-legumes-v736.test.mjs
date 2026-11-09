import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import {COURSES_TEXT} from './courses-text.mjs';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const changed=['brocoli','basilic','carottes'];
const asset=slug=>'./www/Items/'+slug+'.webp';

test('WebP Fruits & Légumes v736 256 x 256, transparents et sous 15 Ko',()=>{
  for(const slug of changed){
    const b=readFileSync(join(root,'www','Items',slug+'.webp'));
    assert.equal(b.toString('ascii',0,4),'RIFF',slug);
    assert.equal(b.toString('ascii',8,12),'WEBP',slug);
    assert.equal(b.toString('ascii',12,16),'VP8X',slug);
    assert.ok((b[20]&16)!==0,slug+': canal alpha requis');
    assert.equal(1+b.readUIntLE(24,3),256,slug);
    assert.equal(1+b.readUIntLE(27,3),256,slug);
    assert.ok(b.length<=15000,slug);
  }
});

function scaleAt(version,stored){
  const window={COURSES_TEXT,COURSES_CATALOG:{groups:{'Fruits & Légumes':{'Légumes variés':['Brocoli','Basilic','Carottes','Radis']}}},COURSES_APP_VERSION:version};
  const document={readyState:'loading',addEventListener(){}};
  const localStorage={getItem(k){return k==='courses-product-visual-scale-v1'?JSON.stringify(stored):null}};
  vm.runInNewContext(readFileSync(join(root,'product-item-images.js'),'utf8'),{window,document,localStorage});
  return window.COURSES_PRODUCT_IMAGES.visualScaleStyle;
}
test('les trois nouvelles images v736 seulement perdent les métriques anciennes',()=>{
  const items=Object.fromEntries([...changed,'radis'].map(s=>[asset(s),[1.35,12,-9]]));
  const previous=scaleAt('v736',{version:'v735',items});
  const cold={brocoli:0.956,basilic:1,carottes:1.04};
  for(const slug of changed)assert.equal(previous(asset(slug)),cold[slug]===1?'':'--single-product-scale:'+cold[slug]+';--single-product-shift-x:0%;--single-product-shift-y:0%',slug);
  assert.ok(previous(asset('radis')).includes('--single-product-scale:1.29;'));
  const current=scaleAt('v736',{version:'v736',items});
  for(const slug of changed)assert.ok(current(asset(slug)).includes('--single-product-scale:'+{"brocoli": 1.29, "basilic": 1.35, "carottes": 1.404}[slug]+';'),slug);
});
