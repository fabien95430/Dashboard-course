import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../catalog-quantities.js',import.meta.url),'utf8');
const storage=new Map();
const context={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(key){return storage.get(key)??null},setItem(key,value){storage.set(key,String(value))}}};
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
  assert.equal(api.getQuantity('Crème brûlée','Vanille',8),2);
});

test('une recette personnalisée ajuste le besoin de base sans changer le moteur d’achat',()=>{
  const api=context.window.COURSES_QUANTITIES;
  assert.equal(api.getBaseNeed('Spaghetti carbonara','Spaghetti',4),400);
  assert.equal(api.getRecipeUnit('Spaghetti'),'g');
  assert.equal(api.getRecipeUnit('Œufs'),'piece');
  api.setRecipeNeeds('Spaghetti carbonara',{Spaghetti:700,'Œufs':6});
  assert.equal(api.hasRecipeNeeds('Spaghetti carbonara'),true);
  assert.equal(api.getNeed('Spaghetti carbonara','Spaghetti',4),700);
  assert.equal(api.getNeed('Spaghetti carbonara','Spaghetti',2),350);
  assert.equal(api.getQuantity('Spaghetti carbonara','Spaghetti',4),2);
  assert.equal(api.getNeed('Spaghetti carbonara','Œufs',4),6);
  api.resetRecipeNeeds('Spaghetti carbonara');
  assert.equal(api.hasRecipeNeeds('Spaghetti carbonara'),false);
  assert.equal(api.getNeed('Spaghetti carbonara','Spaghetti',4),400);
});

test('les libellés audités décrivent le mode d’achat sans exposer les références techniques',()=>{
  const api=context.window.COURSES_QUANTITIES;
  const expected={
    'Pâté':'Barquette','Rillettes':'Pot','Jambon blanc':'Barquette',
    'Thon en boîte':'Boîte','Haricots rouges':'Boîte','Pois chiches':'Boîte','Tomates pelées':'Boîte','Maïs en boîte':'Boîte','Lentilles':'Boîte',
    'Farine':'Paquet','Sucre':'Paquet','Sucre roux':'Paquet','Sucre glace':'Paquet','Maïzena':'Boîte','Vanille':'Sachet','Levure chimique':'Sachet','Pépites chocolat':'Sachet',
    'Spaghetti':'Paquet','Riz basmati':'Paquet','Nouilles chinoises':'Paquet',
    'Crème liquide':'Brique','Œufs':'Boîte','Mozzarella':'Sachet','Parmesan':'Poids','Fromage râpé':'Sachet','Poulet':'Poids','Saumon':'Poids',
    'Pain de mie':'Paquet','Brioche':'Paquet','Wraps':'Paquet','Pains burger':'Paquet',
    'Fraises':'Barquette','Concombres':'Pièce','Épinards':'Sachet','Poireaux':'Botte','Champignons':'Barquette','Asperges':'Botte','Mâche':'Sachet','Roquette':'Sachet','Persil':'Botte',
    'Mayonnaise':'Pot','Moutarde':'Pot','Sauce tomate':'Pot','Pesto':'Pot','Huile d\'olive':'Bouteille','Miel':'Pot','Chocolat noir':'Tablette',
    'Curry':'Flacon','Lait de coco':'Boîte','Harissa':'Tube','Soupes en brique':'Brique','Croûtons':'Sachet',
    'Vinaigre ménager':'Bouteille','Lessive capsules':'Boîte','Papier aluminium':'Rouleau','Dentifrice':'Tube','Gants ménage':'Paire','Baume lèvres':'Stick','Croquettes chat':'Sac'
  };
  for(const [name,label] of Object.entries(expected))assert.equal(api.getPurchaseLabel(name),label,name);
});

test('chaque produit du catalogue a un conditionnement audité sans grammage arbitraire',()=>{
  const api=context.window.COURSES_QUANTITIES;
  const allowed=new Set(['Boîte','Pot','Barquette','Paquet','Sachet','Bouteille','Flacon','Pièce','Botte','Poids','Sac','Tube','Brique','Paire','Rouleau','Stick','Plaquette','Tablette']);
  const names=[];
  for(const subgroups of Object.values(context.window.COURSES_CATALOG.groups)){
    for(const products of Object.values(subgroups))names.push(...products);
  }
  for(const name of names){
    const label=api.getPurchaseLabel(name);
    assert.ok(allowed.has(label),`${name}: ${label}`);
    assert.doesNotMatch(label,/\d/,`${name}: pas de quantité exacte affichée`);
  }
});

test('les lentilles suivent désormais la référence technique d’une conserve',()=>{
  const api=context.window.COURSES_QUANTITIES;
  assert.equal(api.getPurchaseLabel('Lentilles'),'Boîte');
  assert.equal(api.getNeed('Saucisse lentille','Lentilles',6),480);
  assert.equal(api.getQuantity('Saucisse lentille','Lentilles',6),2);
});

test('les références techniques restent séparées des libellés visibles',()=>{
  const refs=context.window.COURSES_PRODUCT_PACKS;
  assert.deepEqual(JSON.parse(JSON.stringify(refs['Thon en boîte'])),{amount:140,unit:'g'});
  assert.deepEqual(JSON.parse(JSON.stringify(refs['Crème liquide'])),{amount:200,unit:'ml'});
  assert.deepEqual(JSON.parse(JSON.stringify(refs['Vanille'])),{amount:1,unit:'piece'});
  assert.deepEqual(JSON.parse(JSON.stringify(refs['Lentilles'])),{amount:400,unit:'g'});
});
