import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=read('catalog.js');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(read('catalog-quantities.js'),context);

test('les nouveaux goûters enfant sont uniques et utilisent le bon conditionnement',()=>{
  const groups=context.window.COURSES_CATALOG.groups;
  for(const [name,slug,mode] of [["Gâteaux bébé", "gateaux-bebe", "Paquet"], ["Biscuits bébé", "biscuits-bebe", "Paquet"], ["Boudoirs bébé", "boudoirs-bebe", "Paquet"], ["Galettes de riz bébé", "galettes-de-riz-bebe", "Paquet"], ["Céréales infantiles", "cereales-infantiles", "Boîte"], ["Desserts lactés bébé", "desserts-lactes-bebe", "Pot"]]){
    assert.equal(Object.values(groups).flatMap(g=>Object.values(g).flat()).filter(n=>n===name).length,1,name);
    assert.ok(groups.Enfant.Enfant.includes(name),name);
    assert.equal(context.window.COURSES_QUANTITIES.getCatalogDisplayLabel(name),mode,name);
    assert.equal(context.window.COURSES_QUANTITIES.getPurchaseLabel(name),mode,name);
    assert.equal(context.window.COURSES_QUANTITIES.getQuantity('',name,2),1,name);
  }
  for(const name of ['Compotes bébé','Couches','Lait infantile','Lingettes bébé','Petits pots','Sacs à couches'])
    assert.ok(groups.Enfant.Enfant.includes(name),name);
});
test('les six ajouts enfant possèdent des images unitaires transparentes sous 15000 octets',()=>{
  for(const [name,slug] of [["Gâteaux bébé", "gateaux-bebe", "Paquet"], ["Biscuits bébé", "biscuits-bebe", "Paquet"], ["Boudoirs bébé", "boudoirs-bebe", "Paquet"], ["Galettes de riz bébé", "galettes-de-riz-bebe", "Paquet"], ["Céréales infantiles", "cereales-infantiles", "Boîte"], ["Desserts lactés bébé", "desserts-lactes-bebe", "Pot"]]){
    const data=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
    assert.equal(data.toString('ascii',0,4),'RIFF',slug);
    assert.equal(data.toString('ascii',8,12),'WEBP',slug);
    assert.equal(data.toString('ascii',12,16),'VP8X',slug);
    assert.ok((data[20]&16)!==0,slug+' alpha');
    assert.ok(data.length<=15000,slug+' poids');
  }
});
