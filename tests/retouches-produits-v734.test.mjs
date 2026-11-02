import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const catalog=JSON.parse(read('catalog.js').toString('utf8').match(/groups:\s*(\{.*?\}),\s*favorites:/s)[1]);
const sw=read('sw.js').toString('utf8');
const imageScript=read('product-item-images.js').toString('utf8');
const products=[
  {name:'Céréales',slug:'cereales',category:'Petit-déj & snacks'},
  {name:'Petits pots',slug:'petits-pots',category:'Enfant'},
  {name:'Pop-corn',slug:'pop-corn',category:'Petit-déj & snacks'}
];

test('trois retouches ciblées sont des WebP transparents 384px et sans image manquante',()=>{
  const groups=Object.fromEntries(Object.entries(catalog).map(([category,subs])=>[category,Object.values(subs).flat()]));
  for(const product of products){
    assert.ok(groups[product.category]?.includes(product.name),product.name+' absent du catalogue');
    const bytes=read('www/Items/'+product.slug+'.webp');
    assert.ok(bytes.length>1000&&bytes.length<=153600,product.slug+' doit rester sous 150 Kio');
    assert.equal(bytes.toString('ascii',0,16),'RIFF'+bytes.toString('ascii',4,8)+'WEBPVP8X',product.slug+' doit être un WebP VP8X');
    assert.ok((bytes[20]&0x10)!==0,product.slug+' doit comporter un canal alpha');
    const width=1+bytes.readUIntLE(24,3),height=1+bytes.readUIntLE(27,3);
    assert.deepEqual([width,height],[384,384],product.slug+' doit conserver des marges');
  }
});

test('le service worker invalide uniquement une fois chaque visuel corrigé',()=>{
  const match=sw.match(/const UPDATED_ITEM_VISUALS=(\[[^\n]+\]);/);
  assert.ok(match);
  const items=JSON.parse(match[1]);
  for(const {slug} of products){
    assert.equal(items.filter(url=>url==='./www/Items/'+slug+'.webp').length,1,slug+' invalidé une fois');
  }
});

test('les nouveaux cadrages sont recalculés sans vider ceux des produits inchangés',()=>{
  assert.match(imageScript,/const changedSince734=!Number\.isFinite\(cacheVersion\)\|\|cacheVersion<734;/);
  assert.match(imageScript,/const changedImages734=\['\.\/www\/Items\/cereales\.webp','\.\/www\/Items\/petits-pots\.webp','\.\/www\/Items\/pop-corn\.webp'\]/);
  assert.match(imageScript,/changedSince734&&changedImages734\.includes\(source\)/);
});
