import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

// Depuis v890, les invalidations version par version (v722 → v785) sont remplacées par une
// version minimale de cache : un cadrage plus ancien est remesuré, un cadrage récent est gardé.
const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
const cacheReader=source.match(/function loadVisualScaleCache\(\)\{[\s\S]*?\n\}\nfunction saveVisualScaleCacheSoon/);
const minimum=source.match(/const VISUAL_SCALE_MIN_VERSION=(\d+);/);
assert.ok(cacheReader,'lecteur de cadrage introuvable');
assert.ok(minimum,'version minimale du cache introuvable');

function restore(stored){
  const visualScaleCache=new Map();
  const localStorage={getItem:()=>JSON.stringify(stored)};
  const code='const VISUAL_SCALE_MIN_VERSION='+minimum[1]+';\n'+cacheReader[0].replace(/\nfunction saveVisualScaleCacheSoon$/,'')+'\nloadVisualScaleCache();';
  new Function('localStorage','visualScaleCache','VISUAL_SCALE_KEY',code)(localStorage,visualScaleCache,'courses-product-visual-scale-v1');
  return visualScaleCache;
}
const items={'./www/Items/whisky.webp':[1.1,0,0],'./www/Items/rhum.webp':[1.06,1,-1]};

test('les cadrages enregistrés depuis la v785 sont conservés tels quels',()=>{
  assert.equal(minimum[1],'785');
  const restored=restore({version:'v785',items});
  assert.deepEqual(restored.get('./www/Items/rhum.webp'),{scale:1.06,shiftX:1,shiftY:-1});
  assert.ok(restore({version:'v889',items}).has('./www/Items/whisky.webp'));
});
test('les cadrages antérieurs aux derniers visuels remplacés sont remesurés',()=>{
  assert.equal(restore({version:'v784',items}).size,0);
  assert.equal(restore({items}).size,0,'ancien cache sans version');
});
test('une valeur de cadrage invalide est ignorée',()=>{
  const restored=restore({version:'v800',items:{'./www/Items/rhum.webp':[1,'x',0],'./www/Items/sel.webp':[1,0,0]}});
  assert.equal(restored.has('./www/Items/rhum.webp'),false);
  assert.ok(restored.has('./www/Items/sel.webp'));
});
