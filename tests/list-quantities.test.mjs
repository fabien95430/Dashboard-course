import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Run the real list service with deterministic storage/network adapters.
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const start=source.indexOf('function productQuantity(name){');
const end=source.indexOf('async function incrementProduct(name',start);
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


test('le catalogue cumule immédiatement les appuis rapides sur plus et moins',async()=>{
  const queueStart=source.indexOf('const catalogQuantityQueue=new Map();');
  const queueEnd=source.indexOf('function syncProductSelection()',queueStart);
  assert.ok(queueStart>=0&&queueEnd>queueStart,'file de quantité catalogue introuvable');
  let quantity=0,firstAdd=true,release;
  const gate=new Promise(resolve=>{release=resolve});
  const shown=[];
  const context={
    Map,Math,Number,String,Promise,clearTimeout(){},
    state:{locked:false,listRefreshTimer:null},
    norm:value=>String(value).toLowerCase(),
    productQuantity:()=>quantity,
    setProductQuantity:(_name,value)=>shown.push(value),
    scheduleListRefresh(){},
    incrementProduct:async()=>{if(firstAdd){firstAdd=false;await gate}quantity+=1},
    decrementProduct:async()=>{quantity-=1}
  };
  vm.runInNewContext(source.slice(queueStart,queueEnd)+';globalThis.catalogQueueApi={queueCatalogQuantityChange,catalogQuantityForDisplay};',context);
  const api=context.catalogQueueApi;
  const adding=api.queueCatalogQuantityChange('Crème liquide',1);
  api.queueCatalogQuantityChange('Crème liquide',1);
  api.queueCatalogQuantityChange('Crème liquide',1);
  assert.equal(shown.at(-1),3);
  assert.equal(api.catalogQuantityForDisplay('Crème liquide',0),3);
  release();
  await adding;
  assert.equal(quantity,3);
  assert.equal(shown.at(-1),3);
  const removing=api.queueCatalogQuantityChange('Crème liquide',-1);
  api.queueCatalogQuantityChange('Crème liquide',-1);
  api.queueCatalogQuantityChange('Crème liquide',-1);
  assert.equal(shown.at(-1),0);
  await removing;
  assert.equal(quantity,0);
  assert.equal(shown.at(-1),0);
});


test('les rafales multi-produits diffèrent les refresh intermédiaires et gardent une seule réconciliation finale',()=>{
  const queueStart=source.indexOf('const catalogQuantityQueue=new Map();');
  const queueEnd=source.indexOf('function syncProductSelection()',queueStart);
  const queue=source.slice(queueStart,queueEnd);
  const scheduleStart=source.indexOf('function scheduleListRefresh(delay=HA_TIMING.eventRefreshDelayMs){');
  const scheduleEnd=source.indexOf('function connectWs(token){',scheduleStart);
  const schedule=source.slice(scheduleStart,scheduleEnd);
  const opsStart=source.indexOf('async function incrementProduct(name');
  const opsEnd=source.indexOf("async function removeGroup(name,row=null,intent='purchase')",opsStart);
  const ops=source.slice(opsStart,opsEnd);
  assert.match(queue,/incrementProduct\(task\.name,\{deferRefresh:true\}\)/);
  assert.match(queue,/decrementProduct\(task\.name,\{deferRefresh:true\}\)/);
  assert.match(queue,/if\(!catalogQuantityQueue\.size&&!state\.locked\)scheduleListRefresh\(\)/);
  assert.match(schedule,/if\(catalogQuantityQueue\.size\)/);
  assert.match(ops,/async function addItem\(name,\{deferRefresh=false\}=\{\}\)/);
  assert.match(ops,/state\.items=\[\.\.\.state\.items,\{uid:'',summary:item,status:'needs_action'\}\]/);
  assert.match(ops,/if\(deferRefresh&&group\.uids\.filter\(Boolean\)\.length<group\.count\)/);
});

test('le menu trois points adopte un glass iOS plus compact et fondu sans changer les actions',()=>{
  const helperStart=source.indexOf('async function changeListRowMenuQuantity(name,delta){');
  const menuStart=source.indexOf('function openListRowMenu(row,anchor){',helperStart);
  const menuEnd=source.indexOf('function bindListReorder(root){',menuStart);
  assert.ok(helperStart>=0&&menuStart>helperStart&&menuEnd>menuStart,'menu d actions introuvable');
  const helper=source.slice(helperStart,menuStart),menu=source.slice(menuStart,menuEnd);
  assert.match(helper,/await incrementProduct\(item\)/);
  assert.match(helper,/await decrementProduct\(item\)/);
  assert.match(menu,/list-row-menu-product-icon/);
  assert.match(menu,/quantityLabel\.textContent='Quantité'/);
  assert.match(menu,/changeListRowMenuQuantity\(name,-1\)/);
  assert.match(menu,/changeListRowMenuQuantity\(name,1\)/);
  assert.match(menu,/remove\.textContent='Supprimer de Ma liste'/);
  assert.match(menu,/removeGroup\(name,row,'delete'\)/);
  assert.match(menu,/Math\.min\(252,window\.innerWidth-margin\*2\)/);
  assert.match(styles,/\.list-row-menu\{[^}]*padding:11px[^}]*border-radius:23px[^}]*backdrop-filter:blur\(34px\) saturate\(150%\)/s);
  assert.match(styles,/\.list-row-menu-product-icon\{[^}]*border:0[^}]*background:transparent[^}]*box-shadow:none/s);
  assert.match(styles,/\.list-row-menu-head\{[^}]*grid-template-columns:40px minmax\(0,1fr\) 30px/s);
  assert.match(styles,/\.list-row-menu-quantity\{[^}]*border-radius:999px[^}]*backdrop-filter:blur\(18px\) saturate\(135%\)/s);
  assert.match(styles,/\.list-row-menu-delete\{[^}]*height:46px[^}]*border-radius:15px/s);
});
