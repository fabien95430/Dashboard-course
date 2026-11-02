import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
const snippet=source.match(/function loadVisualScaleCache\(\)\{[\s\S]*?\n\}\nfunction saveVisualScaleCacheSoon/);
assert.ok(snippet,'le lecteur du cache existe');

function readScaleCache(data,current){
  const localStorage={getItem:()=>JSON.stringify(data)};
  const visualScaleCache=new Map();
  const method=snippet[0].replace(/\nfunction saveVisualScaleCacheSoon$/,'')+'\nloadVisualScaleCache();';
  new Function('localStorage','visualScaleCache','currentAppVersion','VISUAL_SCALE_KEY',method)(
    localStorage,visualScaleCache,()=>current,'courses-product-visual-scale-v1'
  );
  return visualScaleCache;
}

test('un cadrage obsolète ne survit pas au changement de WebP',()=>{
  const cached={version:'v721',items:{'./www/Items/quinoa.webp':[1.45,0,18]}};
  assert.equal(readScaleCache(cached,'v722').size,0);
});
test('le cadrage de la version actuelle reste utilisable immédiatement',()=>{
  const source='./www/Items/quinoa.webp';
  assert.deepEqual(readScaleCache({version:'v722',items:{[source]:[1.14,1.2,-3]}},'v722').get(source),{
    scale:1.14,shiftX:1.2,shiftY:-3
  });
});
test('les anciens caches sans version sont ignorés',()=>{
  assert.equal(readScaleCache({items:{'./www/Items/quinoa.webp':[1.45,0,18]}},'v722').size,0);
});
