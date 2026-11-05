import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=read('catalog.js');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(read('catalog-quantities.js'),context);

const names=["Noix de cajou", "Pistaches", "Cacahuètes", "Noix de pécan", "Noix du Brésil", "Dattes", "Abricots secs", "Raisins secs", "Pruneaux", "Figues sèches"];
test('les dix fruits secs emballés affichent Sachet dans Catalogue et Ma liste',()=>{for(const name of names){assert.equal(context.window.COURSES_QUANTITIES.getCatalogDisplayLabel(name),'Sachet',name);assert.equal(context.window.COURSES_QUANTITIES.getPurchaseLabel(name),'Sachet',name);}});
