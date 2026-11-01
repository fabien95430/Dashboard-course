import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';

const products=['quinoa','couscous','polenta','lentilles','haricots-rouges','pois-chiches','noix-de-coco-rapee','gelatine','levure-chimique','pepites-chocolat','bouillon-cubes','nouilles-chinoises','nouilles-instantanees'];

test('les treize visuels Épicerie sont des WebP individuels RGBA sans atlas',()=>{
  for(const slug of products){
    const path=new URL('../www/Items/'+slug+'.webp',import.meta.url);
    const bytes=readFileSync(path);
    assert.equal(bytes.toString('ascii',0,4),'RIFF',slug);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',slug);
    assert.equal(bytes.toString('ascii',12,16),'VP8X',slug);
    assert.ok(bytes[20]&0x10,'alpha nécessaire pour '+slug);
    assert.equal(bytes.readUIntLE(24,3)+1,256,slug+' largeur');
    assert.equal(bytes.readUIntLE(27,3)+1,256,slug+' hauteur');
    assert.ok(statSync(path).size<=153600,slug+' taille');
  }
});

test('les riz et les pâtes existants restent des fichiers individuels du catalogue',()=>{
  const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
  assert.match(catalog,/"Riz basmati"/);
  assert.match(catalog,/"Spaghetti"/);
  const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
  assert.match(source,/return '\.\/www\/Items\/'\+slugify\(name\)\+'\.webp';/);
});

test('seuls les nouveaux WebP remplacés sont invalidés dans le cache visuel',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  assert.match(sw,/const UPDATED_ITEM_VISUALS=/);
  assert.match(sw,/UPDATED_ITEM_VISUALS\.map\(src=>cache\.delete\(src\)\)/);
  assert.doesNotMatch(sw,/UPDATED_ITEM_VISUALS=[^\n]*(?:riz-|spaghetti|penne\.webp)/);
});
