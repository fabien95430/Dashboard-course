import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const quantities=readFileSync(new URL('../catalog-quantities.js',import.meta.url),'utf8');
const dishes=readFileSync(new URL('../dishes-ui.js',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
const settings=readFileSync(new URL('../settings-ui.js',import.meta.url),'utf8');

function quantityApi(contributions={}){
  const storage=new Map([['courses-dish-contributions-v1',JSON.stringify(contributions)]]);
  const context={
    window:{},
    document:{readyState:'loading',addEventListener(){}},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))}
  };
  vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
  vm.runInNewContext(quantities,context);
  return context.window.COURSES_QUANTITIES;
}

test('200 g déjà prévus plus 300 g d un second plat donnent 500 g sur une seule ligne',()=>{
  const api=quantityApi({'Plat précédent':{'Tomates':200}});
  assert.equal(api.getNeed('Tarte tomate mozzarella','Tomates',2),300);
  assert.equal(api.getCumulativeQuantity('Tarte tomate mozzarella','Tomates',2),5);
});

test('le cumul se fait sur le besoin brut avant la conversion en paquets',()=>{
  const api=quantityApi({'Plat précédent':{'Penne':200}});
  assert.equal(api.getNeed('Pâtes tomate mozzarella','Penne',2),200);
  assert.equal(api.getCumulativeQuantity('Pâtes tomate mozzarella','Penne',2),1);
});

test('les recettes natives sont calibrées pour 2 personnes',()=>{
  const api=quantityApi();
  assert.equal(api.getNeed('Riz au lait','Lait entier',2),500);
  assert.equal(api.getNeed('Pannacotta','Gélatine',2),3);
  assert.equal(api.getNeed('Poulet curry','Riz basmati',2),140);
  assert.match(settings,/const DEFAULT_SERVINGS=2;/);
  assert.match(quantities,/const BASE_SERVINGS=2;/);
});

test('les 88 plats ont tous une quantité spécifique et des ingrédients du catalogue',()=>{
  const dishBlock=dishes.slice(dishes.indexOf('const DISHES='),dishes.indexOf('const FILTERS='));
  const quantityBlock=quantities.slice(quantities.indexOf('const DISH_NEEDS_FOR_TWO='),quantities.indexOf('const BASE_SERVINGS='));
  const dishNames=[...dishBlock.matchAll(/\{name:'([^']+)'/g)].map(match=>match[1]);
  const quantityNames=[...quantityBlock.matchAll(/^\s*'([^']+)':\{/gm)].map(match=>match[1]);
  assert.equal(dishNames.length,88);
  assert.deepEqual([...new Set(quantityNames)].sort(),[...dishNames].sort());
  assert.doesNotMatch(dishBlock,/ingredients:\[[^\]]*'Citron'/);
  for(const name of ['Paprika','Curcuma','Gélatine','Chili','Sauce César','Pâte brisée'])assert.match(catalog,new RegExp(`"${name}"`));
});

test('la réconciliation attend la fin du chargement Home Assistant',()=>{
  assert.match(quantities,/shoppingList\.querySelector\('\.empty \.spinner'\)/);
});