import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../catalog-quantities.js',import.meta.url),'utf8');
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null}}};
const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
vm.runInNewContext(source,context);

const cases=[
  ['Pâtes tomate mozzarella','Mozzarella',4,2],
  ['Penne poulet crème','Poulet',8,10],
  ['Crème brûlée','Crème liquide',4,3],
  ['Spaghetti carbonara','Œufs',4,1],
  ['Spaghetti carbonara','Spaghetti',4,1]
];
for(const [dish,ingredient,servings,expected] of cases){
  test(`${dish}: ${ingredient}, ${servings} personnes => ${expected} unité(s) d'achat`,()=>{
    assert.equal(context.window.COURSES_QUANTITIES.getQuantity(dish,ingredient,servings),expected);
  });
}

test('le besoin au poids conserve les pas de 100 g de la v295',()=>{
  const api=context.window.COURSES_QUANTITIES;
  assert.equal(api.getNeed('Penne poulet crème','Poulet',8),1000);
  assert.equal(api.getQuantity('Penne poulet crème','Poulet',8),10);
});

test('les portions arrondissent les conditionnements à l’unité supérieure',()=>{
  const api=context.window.COURSES_QUANTITIES;
  for(const [servings,quantity] of [[2,2],[4,3],[5,4],[8,5]]){
    assert.equal(api.getQuantity('Crème brûlée','Crème liquide',servings),quantity);
  }
});
