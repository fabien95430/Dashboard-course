import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog-liquid.js',import.meta.url),'utf8');

test('le swipe Produits Plats reste visuel pendant le geste et ne déclenche le mode qu à la fin',()=>{
  assert.doesNotMatch(source,/function activatePointerTarget\(clientX\)/);
  const start=source.indexOf("track.addEventListener('pointermove'");
  const end=source.indexOf('const finish=',start);
  assert.ok(start>=0&&end>start,'gestionnaire pointermove introuvable');
  const pointerMove=source.slice(start,end);
  assert.doesNotMatch(pointerMove,/\.click\(\)/);
  assert.match(pointerMove,/scrub\.clientX=event\.clientX;/);
  assert.match(pointerMove,/start\(\)/);
  assert.match(source,/const target=moved&&!cancelled\?nearest\(\):null;/);
  assert.match(source,/track\.addEventListener\('pointerup',event=>finish\(event,false\)\)/);
});
