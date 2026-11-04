import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=read('catalog.js');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(read('catalog-quantities.js'),context);

test('Citron et Coco sont disponibles une seule fois dans les yaourts et achetés par pot',()=>{
  const groups=context.window.COURSES_CATALOG.groups;
  for(const name of ['Yaourts citron','Yaourts noix de coco']){
    assert.equal(Object.values(groups).flatMap(g=>Object.values(g).flat()).filter(n=>n===name).length,1,name);
    assert.ok(groups.Frais['Yaourts & desserts'].includes(name),name);
    assert.equal(context.window.COURSES_QUANTITIES.getCatalogDisplayLabel(name),'Pot',name);
    assert.equal(context.window.COURSES_QUANTITIES.getPurchaseLabel(name),'Pot',name);
    assert.equal(context.window.COURSES_QUANTITIES.getQuantity('',name,2),1,name);
  }
  for(const name of ['Crème dessert chocolat','Crème dessert vanille','Yaourt','Yaourts fruits','Yaourts vanille','Yaourts nature','Yaourts grecs','Skyr'])
    assert.ok(groups.Frais['Yaourts & desserts'].includes(name),name);
});

test('les quatre parfums disposent de WebP unitaires transparents sous 15000 octets',()=>{
  for(const slug of ['creme-dessert-chocolat','creme-dessert-vanille','yaourts-citron','yaourts-noix-de-coco']){
    const data=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
    assert.equal(data.toString('ascii',0,4),'RIFF',slug);
    assert.equal(data.toString('ascii',8,12),'WEBP',slug);
    assert.equal(data.toString('ascii',12,16),'VP8X',slug);
    assert.ok((data[20]&16)!==0,slug+' alpha');
    assert.ok(data.length<=15000,slug+' poids');
  }
});
