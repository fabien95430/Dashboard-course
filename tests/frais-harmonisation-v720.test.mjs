import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const source=read('catalog.js');
const match=source.match(/groups:\s*(\{.*?\}),\s*favorites:/s);
assert.ok(match,'catalog.js indisponible');
const groups=JSON.parse(match[1]);
const frais=groups.Frais;
const list=Object.values(frais).flat();
const expected=[
  ['Beurre','beurre'],['Parmesan','parmesan'],['Soignon','soignon'],
  ['Lait','lait'],["Lait d'amande",'lait-d-amande'],["Lait d'avoine",'lait-d-avoine'],
  ['Œufs','oeufs'],['Haricots verts surgelés','haricots-verts-surgeles'],
  ['Légumes surgelés','legumes-surgeles'],['Petits pois surgelés','petits-pois-surgeles'],
  ['Poêlée de légumes','poelee-de-legumes'],['Glace chocolat','glace-chocolat'],
  ['Glace vanille','glace-vanille'],['Glaçons','glacons'],['Pâte à pizza','pate-a-pizza'],
  ['Feta','feta'],['Burrata','burrata'],['Ricotta','ricotta'],['Gouda','gouda'],
  ['Yaourt à boire','yaourt-a-boire'],['Gnocchis','gnocchis'],['Épinards surgelés','epinards-surgeles']
];

test('Frais classe les nouveaux produits sans perdre les références existantes',()=>{
  assert.equal(list.length,56);
  assert.equal(new Set(list).size,56);
  assert.deepEqual(Object.fromEntries(Object.entries(frais).map(([k,v])=>[k,v.length])),{
    'Fromages':18,'Laits & crèmes':13,'Surgelés':9,'Traiteur frais':4,'Yaourts & desserts':12
  });
  for(const name of ['Feta','Burrata','Ricotta','Gouda'])assert.ok(frais.Fromages.includes(name),name);
  assert.ok(frais['Yaourts & desserts'].includes('Yaourt à boire'));
  assert.ok(frais['Traiteur frais'].includes('Gnocchis'));
  assert.ok(frais.Surgelés.includes('Épinards surgelés'));
  assert.ok(frais['Laits & crèmes'].includes('Beurre'));
  assert.ok(!frais.Fromages.includes('Beurre'));
  assert.ok(groups['Épicerie']['Sauces & condiments'].includes('Cornichon'));
  assert.ok(!list.includes('Cornichon'));
  for(const name of ['Mozzarella','Mozzarella râpée','Fromage râpé','Crème épaisse','Crème fraîche','Crème liquide','Fromage blanc','Skyr','Yaourts grecs','Yaourts nature'])
    assert.ok(list.includes(name),'Élément validé disparu: '+name);
});

test('22 photos Frais sont des WebP transparents individuels conformes et invalidés',()=>{
  const sw=read('sw.js');
  for(const [name,slug] of expected){
    assert.ok(list.includes(name),'Produit absent: '+name);
    const relative='www/Items/'+slug+'.webp';
    assert.ok(existsSync(new URL(relative,root)),'Image absente: '+relative);
    const data=readFileSync(new URL(relative,root));
    assert.ok(data.length>=2000&&data.length<=153600,'Poids incorrect: '+relative);
    assert.equal(data.toString('ascii',0,4),'RIFF',relative);
    assert.equal(data.toString('ascii',8,12),'WEBP',relative);
    assert.equal(data.toString('ascii',12,16),'VP8X',relative);
    assert.ok((data[20]&0x10)!==0,'Fond transparent absent: '+relative);
    assert.equal(data.readUIntLE(24,3)+1,256,relative);
    assert.equal(data.readUIntLE(27,3)+1,256,relative);
    assert.ok(sw.includes('./'+relative),'Cache visuel non invalidé: '+relative);
  }
});

test('conditionnements et doublons Home Assistant préservés lors des déplacements',()=>{
  const q=read('catalog-quantities.js');
  assert.match(q,/'Beurre':\{amount:250,unit:'g'\}/);
  assert.match(q,/'Beurre':'Poids'/);
  assert.match(q,/"Gnocchis":"Paquet"/);
  assert.match(q,/"Yaourt à boire":"Bouteille"/);
  assert.match(q,/"Cornichon":"Pot"/);
});
