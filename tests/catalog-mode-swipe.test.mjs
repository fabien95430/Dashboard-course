import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../catalog-liquid.js',import.meta.url),'utf8');

test('le swipe Produits Plats suit le doigt et change de mode avant le relâchement',()=>{
  assert.match(source,/function pointerTarget\(clientX\)/);
  assert.match(source,/function activatePointerTarget\(clientX\)/);
  assert.match(source,/track\.addEventListener\('pointermove',[\s\S]*liquid\.x=liquid\.tx;[\s\S]*activatePointerTarget\(event\.clientX\)/);
  assert.match(source,/const target=moved&&!cancelled\?pointerTarget\(scrub\.clientX\):null;/);
  assert.doesNotMatch(source,/const target=moved&&!cancelled\?nearest\(\):null;/);
});
