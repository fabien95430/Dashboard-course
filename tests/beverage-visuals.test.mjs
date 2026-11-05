import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('les six boissons corrigées conservent dimensions et transparence sous 15 000 octets',()=>{
  const sizes={"tonic":[256,256],"whisky":[256,256],"jus-de-poire":[256,256],"sirop-de-grenadine":[384,384],"sirop-de-menthe":[384,384],"sirop-de-peche":[384,384]};
  for(const [slug,[width,height]] of Object.entries(sizes)){
    const file=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
    assert.equal(file.subarray(0,4).toString(),'RIFF',slug);
    assert.equal(file.subarray(8,12).toString(),'WEBP',slug);
    assert.equal(file.subarray(12,16).toString(),'VP8X',slug);
    assert.ok(file[20]&0x10,slug+' sans alpha');
    assert.equal(file.readUIntLE(24,3)+1,width,slug);
    assert.equal(file.readUIntLE(27,3)+1,height,slug);
    assert.ok(file.length>1000&&file.length<=15000,slug+' poids');
  }
});
