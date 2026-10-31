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
  vm.runInNewContext(app.slice(start,end)+'\nthis.parseDishNote=parseDishNote;this.withDishNote=withDishNote;this.listDishNotes=listDishNotes;',context);
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
  assert.match(app,/window\.COURSES_LIST=Object\.freeze\(\{getQuantity:productQuantity,ensureQuantity:ensureProductQuantity,dishNotes:listDishNotes,tagDish:tagDishItems\}\)/);
  assert.match(app,/await todoService\('update_item',\{item:uid,description\}\)/);
  assert.match(marker,/window\.COURSES_LIST\?\.dishNotes\?\.\(\)/);
  assert.match(marker,/await tagDish\(dish,entry\.ingredients\)/);
  assert.match(marker,/function reconcileList\(\)\{\s*rebuildEntries\(\);/);
});
