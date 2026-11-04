import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const catalog=readFileSync(new URL('catalog.js',root),'utf8');
const names=[
  ['Disques coton','disques-coton.webp'],
  ['Gel hydroalcoolique','gel-hydroalcoolique.webp'],
  ['Alcool 70','alcool-70.webp']
];

test('les trois produits Hygiène & soins conservent leur identité et leur WebP transparent individuel',()=>{
  const groups=JSON.parse(catalog.match(/groups:\s*(\{.*?\}),\s*favorites:/s)?.[1]||'null');
  assert.ok(groups,'Catalogue introuvable');
  const products=Object.values(groups['Hygiène & soins']).flat();
  for(const [name,file] of names){
    assert.ok(products.includes(name),name+' absent de la catégorie');
    const path=new URL('www/Items/'+file,root);
    const data=readFileSync(path);
    assert.ok(data.length>2000&&data.length<=153600,'Taille WebP invalide: '+file);
    assert.equal(data.toString('ascii',0,4),'RIFF',file);
    assert.equal(data.toString('ascii',8,12),'WEBP',file);
    assert.equal(data.toString('ascii',12,16),'VP8X',file);
    assert.ok((data[20]&0x10)!==0,'Alpha absent: '+file);
    assert.equal(data.readUIntLE(24,3)+1,384,'Largeur incorrecte: '+file);
    assert.equal(data.readUIntLE(27,3)+1,384,'Hauteur incorrecte: '+file);
  }
});
