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

test('les onze boissons validées conservent dimensions et transparence sous 15 000 octets',()=>{
  const juices=["jus-d-orange","jus-de-pomme","jus-d-ananas","jus-de-raisin","jus-de-tomate","jus-multifruits","jus-de-poire","biere-sans-alcool","rhum","ricard","tonic"];
  for(const slug of juices){
    const file=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
    const dimension=slug.startsWith('jus-')&&slug!=='jus-de-poire'?384:256;
    assert.equal(file.subarray(0,4).toString(),'RIFF',slug);
    assert.equal(file.subarray(8,12).toString(),'WEBP',slug);
    assert.equal(file.subarray(12,16).toString(),'VP8X',slug);
    assert.ok(file[20]&0x10,slug+' alpha');
    assert.equal(file.readUIntLE(24,3)+1,dimension,slug);
    assert.equal(file.readUIntLE(27,3)+1,dimension,slug);
    assert.ok(file.length>1000&&file.length<=15000,slug+' poids');
  }
});
