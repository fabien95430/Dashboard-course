import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const changed=["glace-vanille","lait-infantile","yaourt-a-boire","ricotta","gouda","gnocchis","feta","burrata","savon-mains"];
const asset=slug=>'./www/Items/'+slug+'.webp';
test('WebP transparents 384x384 et sous 150 Kio pour les neuf corrections v732',()=>{
  for(const slug of changed){
    const b=readFileSync(join(root,'www','Items',slug+'.webp'));
    assert.equal(b.toString('ascii',0,4),'RIFF',slug);
    assert.equal(b.toString('ascii',8,12),'WEBP',slug);
    assert.equal(b.toString('ascii',12,16),'VP8X',slug);
    assert.ok((b[20]&16)!==0,slug+' : canal alpha requis');
    assert.equal(1+b.readUIntLE(24,3),384,slug);
    assert.equal(1+b.readUIntLE(27,3),384,slug);
    assert.ok(b.length<=153600,slug);
  }
});
function scaleAt(version,stored){
 const window={COURSES_CATALOG:{groups:{Frais:{Divers:['Glace vanille','Mozzarella']}}},COURSES_APP_VERSION:version};
 const document={readyState:'loading',addEventListener(){}};
 const localStorage={getItem(k){return k==='courses-product-visual-scale-v1'?JSON.stringify(stored):null}};
 vm.runInNewContext(readFileSync(join(root,'product-item-images.js'),'utf8'),{window,document,localStorage});
 return window.COURSES_PRODUCT_IMAGES.visualScaleStyle;
}
test('recalculer uniquement les neuf métriques du lot 732',()=>{
 const items=Object.fromEntries([...changed,'mozzarella'].map(s=>[asset(s),[1.45,18,-18]]));
 const previous=scaleAt('v732',{version:'v731',items});
 for(const s of changed)assert.equal(previous(asset(s)),'',s);
 assert.match(previous(asset('mozzarella')),/--single-product-scale:1.45/);
 const currentVersion=readFileSync(join(root,'dish-local-images.js'),'utf8').match(/const APP_VERSION='(v\d+)'/)[1];
 const current=scaleAt(currentVersion,{version:currentVersion,items});
 for(const s of changed)assert.match(current(asset(s)),/--single-product-scale:1.45/,s);
});
