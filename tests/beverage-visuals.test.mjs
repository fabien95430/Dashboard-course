import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('le whisky corrigé reste transparent en 256 px sous 15 000 octets',()=>{
  const file=readFileSync(new URL('../www/Items/whisky.webp',import.meta.url));
  assert.equal(file.subarray(0,4).toString(),'RIFF');
  assert.equal(file.subarray(8,12).toString(),'WEBP');
  assert.equal(file.subarray(12,16).toString(),'VP8X');
  assert.ok(file[20]&0x10,'canal alpha');
  assert.equal(file.readUIntLE(24,3)+1,256);
  assert.equal(file.readUIntLE(27,3)+1,256);
  assert.ok(file.length>1000&&file.length<=15000,'poids maximal');
});
