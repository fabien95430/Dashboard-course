import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=read('catalog.js');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(read('catalog-quantities.js'),context);

test('Céréales Lion est disponible au Petit-déjeuner, en boîte, avec son WebP transparent sous 15 Ko',()=>{
  const groups=context.window.COURSES_CATALOG.groups,name='Céréales Lion';
  assert.equal(Object.values(groups).flatMap(g=>Object.values(g).flat()).filter(n=>n===name).length,1);
  assert.ok(groups['Petit-déj & snacks']['Petit-déjeuner'].includes(name));
  assert.equal(context.window.COURSES_QUANTITIES.getCatalogDisplayLabel(name),'Boîte');
  assert.equal(context.window.COURSES_QUANTITIES.getPurchaseLabel(name),'Boîte');
  assert.equal(context.window.COURSES_QUANTITIES.getQuantity('',name,2),1);
  const data=readFileSync(new URL('../www/Items/cereales-lion.webp',import.meta.url));
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.equal(data.toString('ascii',12,16),'VP8X');
  assert.ok((data[20]&16)!==0);
  assert.ok(data.length<=15000);
});
