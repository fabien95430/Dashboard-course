import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const beers=[
  ['Bière ambrée','biere-ambree'],
  ['Bière aux fruits','biere-aux-fruits'],
  ['Bière blanche','biere-blanche'],
  ['Bière blonde','biere-blonde'],
  ['Bière brune','biere-brune'],
  ['Bière IPA','biere-ipa'],
  ['Bière sans alcool','biere-sans-alcool'],
  ['Bière triple','biere-triple'],
  ['Panaché','panache']
];

test('la catégorie bières recense exactement les neuf références validées sans doublon',()=>{
  const catalog=read('catalog.js').toString();
  const match=catalog.match(/"Bières & vins":(\[[^\]]+\])/);
  assert.ok(match,'sous-catégorie Bières & vins absente');
  const items=JSON.parse(match[1]);
  assert.equal(new Set(items).size,items.length,'doublons dans la sous-catégorie');
  beers.forEach(([name])=>assert.ok(items.includes(name),name+' absent'));
  assert.equal(items.filter(name=>name.startsWith('Bière ')||name==='Panaché').length,9);
});

test('chaque bière utilise un WebP unitaire 256px, transparent et de 15 000 octets maximum',()=>{
  const seen=new Set();
  beers.forEach(([name,slug])=>{
    const path='www/Items/'+slug+'.webp';
    const file=read(path);
    assert.equal(file.subarray(0,4).toString('ascii'),'RIFF',name);
    assert.equal(file.subarray(8,12).toString('ascii'),'WEBP',name);
    assert.equal(file.subarray(12,16).toString('ascii'),'VP8X',name);
    assert.ok(file[20]&0x10,name+' sans canal alpha');
    assert.equal(file.readUIntLE(24,3)+1,256,name+' largeur');
    assert.equal(file.readUIntLE(27,3)+1,256,name+' hauteur');
    assert.ok(file.length>1000&&file.length<=15000,name+' poids');
    const key=file.toString('base64');
    assert.ok(!seen.has(key),name+' réutilise un visuel identique');
    seen.add(key);
  });
});

test('le mode Bouteille et les priorités de Home Assistant restent inchangés',()=>{
  const modes=read('catalog-quantities.js').toString();
  assert.match(modes,/'Bières & vins':'Bouteille'/);
  const app=read('app.js').toString();
  assert.match(app,/todo\.courses/);
});
