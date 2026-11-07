import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const slugs=['butternut','courge','navets','echalotes','noisettes','ail','oignons-jaunes'];
const src=s=>'./www/Items/'+s+'.webp';
test('sept WebP entiers, 256 px, canal alpha et sous 15 Ko',()=>{
  for(const slug of slugs){
    const b=readFileSync(join(root,'www','Items',slug+'.webp'));
    assert.equal(b.toString('ascii',0,4),'RIFF',slug);
    assert.equal(b.toString('ascii',8,12),'WEBP',slug);
    assert.equal(b.toString('ascii',12,16),'VP8X',slug);
    assert.ok((b[20]&16)!==0,slug+' : canal alpha');
    assert.equal(1+b.readUIntLE(24,3),256,slug);
    assert.equal(1+b.readUIntLE(27,3),256,slug);
    assert.ok(b.length<=15000,slug);
  }
});
test('v733 invalide seulement les sept cadrages conservés en localStorage',()=>{
 const window={COURSES_CATALOG:{groups:{}},COURSES_APP_VERSION:'v733'};
 const document={readyState:'loading',addEventListener(){}};
 const items=Object.fromEntries([...slugs,'mozzarella'].map(s=>[src(s),[1.45,18,-18]]));
 const localStorage={getItem(k){return k==='courses-product-visual-scale-v1'?JSON.stringify({version:'v732',items}):null}};
 vm.runInNewContext(readFileSync(join(root,'product-item-images.js'),'utf8'),{window,document,localStorage});
 const style=window.COURSES_PRODUCT_IMAGES.visualScaleStyle;
 const expected={"butternut": 1.0, "courge": 1.0, "navets": 0.963, "echalotes": 1, "noisettes": 0.905, "ail": 1, "oignons-jaunes": 0.92};
 for(const s of slugs)assert.equal(style(src(s)),expected[s]===1?'':'--single-product-scale:'+expected[s]+';--single-product-shift-x:0%;--single-product-shift-y:0%',s);
 assert.ok(style(src('mozzarella')).includes('--single-product-scale:1.262;'));
});
