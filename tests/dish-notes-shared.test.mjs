import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const marker=readFileSync(new URL('../dish-added-marker.js',import.meta.url),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

const start=app.indexOf('const DISH_NOTE_LINE=');
const end=app.indexOf('// Ajoute la note du plat',start);
assert.ok(start>=0&&end>start,'notes de plats introuvables dans app.js');
function notes(items){
  const context={state:{items},isPendingItem:item=>String(item?.status||'needs_action')!=='completed',itemSummary:item=>String(item?.summary||'').trim(),result:null,input:null};
  vm.runInNewContext(app.slice(start,end)+'\nthis.parseDishNote=parseDishNote;this.withDishNote=withDishNote;this.withoutDishNote=withoutDishNote;this.dishNoteOwner=dishNoteOwner;this.listDishNotes=listDishNotes;',context);
  return context;
}

test('la note « Plat : … » s ajoute sans écraser le texte existant et cumule plusieurs plats',()=>{
  const {withDishNote,parseDishNote}=notes([]);
  assert.equal(withDishNote('','Spaghetti carbonara',4),'Plat : Spaghetti carbonara (4)');
  assert.equal(withDishNote('Bio de préférence','Spaghetti carbonara',4),'Bio de préférence\nPlat : Spaghetti carbonara (4)');
  const two=withDishNote('Plat : Spaghetti carbonara (4)','Spaghetti bolognaise',6);
  assert.equal(two,'Plats : Spaghetti carbonara (4), Spaghetti bolognaise (6)');
  assert.equal(withDishNote(two,'Spaghetti carbonara',5),'Plats : Spaghetti bolognaise (6), Spaghetti carbonara (5)');
  assert.deepEqual(plain(parseDishNote('Bio\nPlats : A (2), B (3)')),[{name:'A',total:2},{name:'B',total:3}]);
  assert.deepEqual(plain(parseDishNote('note libre sans plat')),[]);
});

test('les plats partagés se lisent depuis les articles encore à acheter',()=>{
  const {listDishNotes}=notes([
    {uid:'1',summary:'Pâtes',status:'needs_action',description:'Plats : Carbonara (3), Bolognaise (2)'},
    {uid:'2',summary:'Pâtes',status:'needs_action',description:'Plat : Carbonara (3)'},
    {uid:'3',summary:'Lardons',status:'needs_action',description:'Plat : Carbonara (3)'},
    {uid:'4',summary:'Crème',status:'completed',description:'Plat : Carbonara (3)'},
    {uid:'5',summary:'Lait',status:'needs_action'}
  ]);
  const dishes=Object.fromEntries(listDishNotes().map(entry=>[entry.name,entry]));
  assert.deepEqual(plain(dishes.Carbonara),{name:'Carbonara',total:3,ingredients:['Pâtes','Lardons']});
  assert.deepEqual(plain(dishes.Bolognaise),{name:'Bolognaise',total:2,ingredients:['Pâtes']});
});

test('le marqueur lit la liste partagée : un ingrédient acheté rend le plat partiel sur tous les appareils',()=>{
  const ms=marker.indexOf('function markerState(name){');
  const me=marker.indexOf('function syncCard(card){',ms);
  const context={entries:{Carbonara:{ingredients:['Pâtes','Lardons'],total:3}},trustedListNames:new Set(['pates','lardons']),normalize:norm,result:null};
  vm.runInNewContext(marker.slice(ms,me)+'\nresult=markerState("Carbonara");',context);
  assert.deepEqual(plain(context.result),{state:'partial',present:2,total:3});
});

test('app.js écrit la note dans Home Assistant et le marqueur ne garde plus les plats seulement en local',()=>{
  assert.match(app,/window\.COURSES_LIST=Object\.freeze\(\{getQuantity:productQuantity,ensureQuantity:ensureProductQuantity,dishNotes:listDishNotes,listUids:listItemUids,tagDish:tagDishItems,cancelDish:cancelDishItems\}\)/);
  assert.match(app,/await todoService\('update_item',\{item:uid,description\}\)/);
  assert.match(marker,/window\.COURSES_LIST\?\.dishNotes\?\.\(\)/);
  assert.match(marker,/await tagDish\(dish,entry\.ingredients,\{before:entry\.before\|\|null\}\)/);
  assert.match(marker,/function reconcileList\(\)\{\s*rebuildEntries\(\);/);
});

test('« Ajouté pour » marque seulement les unités ajoutées par le plat et passe au plat suivant à l annulation',()=>{
  const {withDishNote,withoutDishNote,dishNoteOwner}=notes([]);
  const added=withDishNote('','Carbonara',4,{owner:true});
  assert.equal(added,'Plat : Carbonara (4)\nAjouté pour : Carbonara');
  const existing=withDishNote('Bio','Carbonara',4);
  assert.equal(existing,'Bio\nPlat : Carbonara (4)');
  // Une unité déjà « Ajouté pour » un plat garde ce plat quand un autre l utilise aussi.
  const shared=withDishNote(added,'Bolognaise',6,{owner:true});
  assert.equal(shared,'Plats : Carbonara (4), Bolognaise (6)\nAjouté pour : Carbonara');
  // Annuler Carbonara : l unité reste pour la Bolognaise, qui en devient responsable.
  assert.equal(withoutDishNote(shared,'Carbonara'),'Plat : Bolognaise (6)\nAjouté pour : Bolognaise');
  // Annuler le seul plat d une unité déjà présente : la note du plat disparaît, le texte reste.
  assert.equal(withoutDishNote(existing,'Carbonara'),'Bio');
  assert.equal(dishNoteOwner(withoutDishNote(added,'Carbonara')),'');
});

test('annuler un plat retire seulement ses unités ajoutées que rien d autre n utilise',()=>{
  const cs=app.indexOf('async function cancelDishItems(dish){');
  const ce=app.indexOf('window.COURSES_LIST=Object.freeze(',cs);
  const items=[
    {uid:'1',summary:'Spaghetti',status:'needs_action',description:'Plat : Carbonara (3)\nAjouté pour : Carbonara'},
    {uid:'2',summary:'Lardons',status:'needs_action',description:'Plats : Carbonara (3), Quiche (4)\nAjouté pour : Carbonara'},
    {uid:'3',summary:'Lait',status:'needs_action',description:'Plat : Carbonara (3)'},
    {uid:'4',summary:'Pain',status:'needs_action'}
  ];
  let saved=null;
  const context={state:{items,demo:true,locked:false},DEMO_KEY:'demo',loadJson:()=>items,saveJson:(key,value)=>{saved=value},renderSelectionAndList(){},
    isPendingItem:item=>String(item?.status||'needs_action')!=='completed',itemSummary:item=>String(item?.summary||'').trim(),itemUid:item=>String(item?.uid||''),console,result:null};
  vm.runInNewContext(app.slice(start,end)+app.slice(cs,ce)+'\ncancelDishItems("Carbonara").then(value=>{result=value});',context);
  return new Promise(resolve=>setImmediate(resolve)).then(()=>{
    assert.deepEqual(plain(context.result),{removed:1,kept:2,failed:0});
    assert.deepEqual(plain(saved.map(item=>item.summary+' | '+(item.description||''))),['Lardons | Plat : Quiche (4)\nAjouté pour : Quiche','Lait | ','Pain | ']);
  });
});

test('le ✓ d un plat ajouté demande une annulation confirmée',()=>{
  const dishes=readFileSync(new URL('../dishes-ui.js',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(dishes,/event\.target\.closest\('\.dish-add'\)&&\(card\.classList\.contains\('is-added'\)\|\|card\.classList\.contains\('is-partial'\)\)/);
  assert.match(dishes,/new CustomEvent\('courses:dish-cancel-requested'/);
  assert.match(marker,/document\.addEventListener\('courses:dish-cancel-requested',requestCancelDish\)/);
  assert.match(index,/<dialog id="dishCancelDialog"/);
  assert.match(marker,/window\.COURSES_LIST\.cancelDish\(dish\)/);
});
