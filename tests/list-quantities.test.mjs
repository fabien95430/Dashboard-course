import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Run the real list service with deterministic storage/network adapters.
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const start=source.indexOf('function productQuantity(name){');
const end=source.indexOf('async function incrementProduct(name){',start);
assert.ok(start>=0&&end>start,'service de quantité introuvable');
function service({initial=0,onAdd}={}){
  const item={name:'Crème liquide'};
  const state={entity:'todo.test',demo:false,locked:false,productBusy:new Set()};
  let quantity=initial,writes=0;
  const context={window:{},state,BY_NAME:new Map([[item.name,item]]),norm:value=>String(value),
    activeGroups:()=>[{summary:item.name,count:quantity}],renderSelectionAndList(){},
    addItem:async()=>{writes+=1;return onAdd?onAdd({state,write:writes,increment:()=>{quantity+=1;}}):(quantity+=1,true);}
  };
  vm.runInNewContext(source.slice(start,end),context);
  return {api:context.window.COURSES_LIST,state,writes:()=>writes,quantity:()=>quantity};
}
const plain=value=>JSON.parse(JSON.stringify(value));
test('ajout de la quantité manquante et second appel sans doublon',async()=>{
  const s=service({initial:1});
  assert.deepEqual(plain(await s.api.ensureQuantity('Crème liquide',3)),{added:2,failed:0,present:0});
  assert.deepEqual(plain(await s.api.ensureQuantity('Crème liquide',3)),{added:0,failed:0,present:1});
  assert.equal(s.writes(),2);assert.equal(s.quantity(),3);
});
test('un échec partiel conserve le succès et libère le verrou produit',async()=>{
  const s=service({onAdd:({write,increment})=>{if(write===2)return false;increment();return true;}});
  assert.deepEqual(plain(await s.api.ensureQuantity('Crème liquide',3)),{added:1,failed:1,present:0});
  assert.equal(s.writes(),2);assert.equal(s.state.productBusy.size,0);
});
test('une écriture acceptée suivie d’un rafraîchissement obsolète n’est pas répétée',async()=>{
  const s=service({onAdd:()=>true});
  assert.deepEqual(plain(await s.api.ensureQuantity('Crème liquide',3)),{added:1,failed:1,present:0});
  assert.equal(s.writes(),1);
});
test('un verrouillage interrompt les écritures restantes',async()=>{
  const s=service({onAdd:({state,increment})=>{increment();state.locked=true;return true;}});
  assert.deepEqual(plain(await s.api.ensureQuantity('Crème liquide',3)),{added:1,failed:1,present:0});
  assert.equal(s.writes(),1);
});
test('un changement de liste interrompt les écritures restantes',async()=>{
  const s=service({onAdd:({state,increment})=>{increment();state.entity='todo.other';return true;}});
  assert.equal((await s.api.ensureQuantity('Crème liquide',3)).failed,1);
  assert.equal(s.writes(),1);
});
test('deux commandes concurrentes ne déclenchent pas deux séries d’ajouts',async()=>{
  let release;
  const wait=new Promise(resolve=>{release=resolve;});
  const s=service({onAdd:async({increment})=>{await wait;increment();return true;}});
  const first=s.api.ensureQuantity('Crème liquide',3);
  assert.equal((await s.api.ensureQuantity('Crème liquide',3)).failed,1);
  release();
  assert.equal((await first).added,3);
  assert.equal(s.writes(),3);
});
test('une erreur inattendue libère le verrou et ne relance pas l’ajout',async()=>{
  const s=service({onAdd:()=>{throw new Error('network');}});
  assert.equal((await s.api.ensureQuantity('Crème liquide',3)).failed,1);
  assert.equal(s.writes(),1);assert.equal(s.state.productBusy.size,0);
});
test('un produit inconnu, une quantité invalide ou une session verrouillée ne produit aucune écriture',async()=>{
  const s=service();
  for(const value of [0,-1,1.5,Infinity,101])assert.equal((await s.api.ensureQuantity('Crème liquide',value)).failed,1);
  assert.equal((await s.api.ensureQuantity('Inconnu',3)).failed,1);
  s.state.locked=true;
  assert.equal((await s.api.ensureQuantity('Crème liquide',3)).failed,1);
  assert.equal(s.writes(),0);
});


test('le menu trois points adopte le glass classique iOS tout en conservant quantité et suppression',()=>{
  const helperStart=source.indexOf('async function changeListRowMenuQuantity(name,delta){');
  const menuStart=source.indexOf('function openListRowMenu(row,anchor){',helperStart);
  const menuEnd=source.indexOf('function bindListReorder(root){',menuStart);
  assert.ok(helperStart>=0&&menuStart>helperStart&&menuEnd>menuStart,'menu d actions introuvable');
  const helper=source.slice(helperStart,menuStart),menu=source.slice(menuStart,menuEnd);
  assert.match(helper,/await incrementProduct\(item\)/);
  assert.match(helper,/await decrementProduct\(item\)/);
  assert.match(menu,/const product=catalogProductFor\(name\)/);
  assert.match(menu,/list-row-menu-head/);
  assert.match(menu,/list-row-menu-product-icon/);
  assert.match(menu,/list-row-menu-close/);
  assert.match(menu,/quantityLabel\.textContent='Quantité'/);
  assert.match(menu,/list-row-menu-decrement/);
  assert.match(menu,/list-row-menu-value/);
  assert.match(menu,/list-row-menu-increment/);
  assert.match(menu,/changeListRowMenuQuantity\(name,-1\)/);
  assert.match(menu,/changeListRowMenuQuantity\(name,1\)/);
  assert.match(menu,/remove\.textContent='Supprimer de Ma liste'/);
  assert.match(menu,/removeGroup\(name,row,'delete'\)/);
  assert.match(menu,/Math\.min\(286,window\.innerWidth-margin\*2\)/);
  assert.match(styles,/\.list-row-menu\{[^}]*border-radius:26px[^}]*backdrop-filter:blur\(30px\) saturate\(145%\)/s);
  assert.match(styles,/\.list-row-menu-head\{[^}]*grid-template-columns:46px minmax\(0,1fr\) 34px/s);
  assert.match(styles,/\.list-row-menu-quantity\{[^}]*border-radius:999px[^}]*backdrop-filter:blur\(16px\) saturate\(125%\)/s);
  assert.match(styles,/\.list-row-menu-delete\{[^}]*height:52px[^}]*border-radius:17px/s);
});
