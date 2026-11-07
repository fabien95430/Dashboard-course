import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../repurchase-soon.js',import.meta.url),'utf8');

function extract(startMarker,endMarker){
  const start=source.indexOf(startMarker);
  const end=source.indexOf(endMarker,start);
  assert.ok(start>=0&&end>start,`section introuvable: ${startMarker}`);
  return source.slice(start,end);
}

function fakeRoot(){
  const root={children:[]};
  const attach=node=>{node.remove=()=>{const i=root.children.indexOf(node);if(i>=0)root.children.splice(i,1)};return node};
  root.insertBefore=(node,ref)=>{
    node.remove?.();
    attach(node);
    const i=ref?root.children.indexOf(ref):-1;
    if(i<0)root.children.push(node);else root.children.splice(i,0,node);
  };
  root.add=node=>{attach(node);root.children.push(node);return node};
  return root;
}

const syncRows=new Function(extract('function syncRows(root,items,create,update){','function renderDialog(')+';return syncRows;')();

test('À prévoir réutilise les lignes existantes après un ajout au lieu de recréer les vignettes',()=>{
  const root=fakeRoot();
  const created=[];
  const updated=[];
  const create=item=>{const row={dataset:{name:item.name},image:{}};created.push(item.name);return row};
  const update=(row,item)=>updated.push(item.name);

  syncRows(root,[{name:'Lait'},{name:'Œufs'},{name:'Pain'}],create,update);
  assert.deepEqual(root.children.map(row=>row.dataset.name),['Lait','Œufs','Pain']);
  const [lait,oeufs,pain]=root.children;
  created.length=0;

  // « Œufs » vient d'être ajouté à Ma liste : il disparaît, les autres lignes restent les mêmes nœuds.
  syncRows(root,[{name:'Lait'},{name:'Pain'}],create,update);
  assert.deepEqual(created,[],'aucune ligne ne doit être recréée');
  assert.deepEqual(updated,['Lait','Pain']);
  assert.equal(root.children[0],lait);
  assert.equal(root.children[1],pain);
  assert.equal(root.children.includes(oeufs),false);

  // Nouvel ordre et nouvelle suggestion : seule la nouvelle ligne est créée.
  syncRows(root,[{name:'Pain'},{name:'Beurre'},{name:'Lait'}],create,update);
  assert.deepEqual(created,['Beurre']);
  assert.deepEqual(root.children.map(row=>row.dataset.name),['Pain','Beurre','Lait']);
  assert.equal(root.children[0],pain);
  assert.equal(root.children[2],lait);
});

test('À prévoir retire l état vide avant d afficher des suggestions',()=>{
  const root=fakeRoot();
  root.add({dataset:{}});
  syncRows(root,[{name:'Lait'}],item=>({dataset:{name:item.name}}),()=>{});
  assert.deepEqual(root.children.map(row=>row.dataset.name),['Lait']);
});

test('le rendu de À prévoir ne reconstruit plus toute la liste en HTML',()=>{
  const render=extract('function renderDialog(','async function addSuggested(');
  assert.match(render,/syncRows\(root,items,createRow,updateRow\)/);
  assert.doesNotMatch(render,/root\.innerHTML=items\.map/);
});

const tripCode=extract('function nextTripStart(now=Date.now()){','function suggestionFor(');
const trips=new Function(tripCode+';return {nextTripStart,followingTripStart};')();
const at=(y,m,d,h=12)=>new Date(y,m-1,d,h).getTime();

test('À prévoir cale la prochaine course sur le week-end',()=>{
  // 7 novembre 2026 = samedi.
  assert.equal(trips.nextTripStart(at(2026,11,4)),at(2026,11,7,0),'mercredi → samedi qui vient');
  assert.equal(trips.nextTripStart(at(2026,11,7,18)),at(2026,11,7,0),'samedi → ce week-end');
  assert.equal(trips.nextTripStart(at(2026,11,8,10)),at(2026,11,7,0),'dimanche → ce week-end');
  assert.equal(trips.followingTripStart(at(2026,11,8,10)),at(2026,11,14,0));
  assert.equal(trips.followingTripStart(at(2026,11,9)),at(2026,11,21,0),'lundi → course d après le samedi 14');
});

test('À prévoir parle en courses et non en jours',()=>{
  const labels=new Function(extract('function timingLabel(){','function ensureStyles(){')+extract('function cadenceLabel(item){','function createRow(item){')+';return {timingLabel,timingClass,cadenceLabel};')();
  assert.equal(labels.cadenceLabel({cadence:2}),'À chaque course');
  assert.equal(labels.cadenceLabel({cadence:9}),'À chaque course');
  assert.equal(labels.cadenceLabel({cadence:14}),'Toutes les 2 courses');
  assert.equal(labels.timingLabel({dueIn:3}),'Prochaine course');
  assert.equal(labels.timingClass({dueIn:-1}),'is-now');
  assert.equal(labels.timingClass({dueIn:3}),'is-soon');
  assert.doesNotMatch(source,/'Dans '\+days\+' jours'/);
  assert.doesNotMatch(source,/'Cycle estimé : '/);
});

test('un saumon acheté samedi est prévu pour la course suivante, pas dans 2 jours',()=>{
  const body=extract('const DAY=86400000;','const MAX_BADGE')+tripCode+extract('function suggestionFor(name,now=Date.now()){','function suggestions(');
  const make=new Function('intelligence','listService','META',body+';return suggestionFor;');
  const purchaseAt=at(2026,11,7,11);
  const profiles={
    Saumon:{lastAt:purchaseAt,samples:2,recentDays:2},
    Lessive:{lastAt:at(2026,9,28),samples:2,recentDays:45},
    Riz:{lastAt:purchaseAt,samples:2,recentDays:60}
  };
  const api={isEnabled:()=>true,profileFor:name=>profiles[name],stockFor:(name,now)=>({ageDays:(now-profiles[name].lastAt)/86400000,estimatedQty:1})};
  const suggestionFor=make(()=>api,()=>({getQuantity:()=>0}),new Map());
  const now=at(2026,11,7,18);
  assert.ok(suggestionFor('Saumon',now),'le saumon manquera avant samedi prochain');
  assert.ok(suggestionFor('Lessive',now),'la lessive (fin le 12/11) manquera avant samedi prochain');
  assert.equal(suggestionFor('Riz',now),null,'le riz tient bien au-delà de la course suivante');
  profiles.Lessive.lastAt=at(2026,10,1);
  assert.equal(suggestionFor('Lessive',now),null,'fin le 15/11 : elle peut attendre la course du 14/11');
});

test('les vignettes de À prévoir utilisent le cadrage par produit de Ma liste',()=>{
  const create=extract('function createRow(item){','// Met à jour le texte');
  assert.match(create,/window\.COURSES_PRODUCT_IMAGES\?\.visualScaleStyle\?\.\(source,true\)/);
  assert.match(create,/data-single-product-source="'\+esc\(source\)\+'" data-single-product-compact="1"/);
  assert.match(create,/window\.COURSES_PRODUCT_IMAGES\?\.frame\?\.\(image\)/);
  assert.match(source,/\.repurchase-thumb img\{[^}]*scale\(var\(--single-product-scale,1\)\)/);
  const images=fs.readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
  assert.match(images,/window\.COURSES_PRODUCT_IMAGES=Object\.freeze\(\{warm:warmProductImages,visualScaleStyle,frame:frameProductImage\}\)/);
});
