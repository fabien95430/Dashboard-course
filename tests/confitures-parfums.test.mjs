import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=read('catalog.js');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(read('catalog-quantities.js'),context);

test('les onze confitures sont uniques, classées ensemble et achetées par pot',()=>{
  const groups=context.window.COURSES_CATALOG.groups;
  const names=["Confiture abricot", "Confiture framboise", "Confiture cerise", "Confiture mûre", "Confiture myrtille", "Confiture orange", "Confiture fruits rouges", "Confiture pêche", "Confiture figue", "Confiture fraise", "Confiture mirabelles"];
  assert.equal(groups['Épicerie'].Confitures.length,names.length);
  for(const name of names){
    assert.equal(Object.values(groups).flatMap(g=>Object.values(g).flat()).filter(n=>n===name).length,1,name);
    assert.ok(groups['Épicerie'].Confitures.includes(name),name);
    assert.equal(context.window.COURSES_QUANTITIES.getCatalogDisplayLabel(name),'Pot',name);
    assert.equal(context.window.COURSES_QUANTITIES.getPurchaseLabel(name),'Pot',name);
    assert.equal(context.window.COURSES_QUANTITIES.getQuantity('',name,2),1,name);
  }
});
test('chaque confiture possède son WebP transparent sous 15000 octets',()=>{
  for(const slug of ["confiture-abricot", "confiture-framboise", "confiture-cerise", "confiture-mure", "confiture-myrtille", "confiture-orange", "confiture-fruits-rouges", "confiture-peche", "confiture-figue", "confiture-fraise", "confiture-mirabelles"]){
    const data=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
    assert.equal(data.toString('ascii',0,4),'RIFF',slug);
    assert.equal(data.toString('ascii',8,12),'WEBP',slug);
    assert.equal(data.toString('ascii',12,16),'VP8X',slug);
    assert.ok((data[20]&16)!==0,slug+' alpha');
    assert.ok(data.length<=15000,slug+' poids');
  }
});
