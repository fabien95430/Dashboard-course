import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../dish-added-marker.js',import.meta.url),'utf8');
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const plain=value=>JSON.parse(JSON.stringify(value));

const markerStart=source.indexOf('function markerState(name){');
const markerEnd=source.indexOf('function syncCard(card){',markerStart);
assert.ok(markerStart>=0&&markerEnd>markerStart,'markerState introuvable');

function stateFor({ingredients,listed}){
  const context={
    entries:{Plat:{ingredients}},
    trustedListNames:listed===null?null:new Set(listed.map(normalize)),
    normalize,
    result:null
  };
  vm.runInNewContext(source.slice(markerStart,markerEnd)+'\nresult=markerState("Plat");',context);
  return plain(context.result);
}

test('un état de liste inconnu ne marque jamais un plat comme complet',()=>{
  assert.deepEqual(stateFor({ingredients:['Tagliatelles','Saumon'],listed:null}),{state:'none',present:0,total:2});
});

test('le vert et le partiel dépendent uniquement de la liste réellement connue',()=>{
  assert.deepEqual(stateFor({ingredients:['Tagliatelles','Saumon','Crème fraîche','Citron'],listed:['Tagliatelles','Saumon','Crème fraîche','Citron']}),{state:'complete',present:4,total:4});
  assert.deepEqual(stateFor({ingredients:['Tagliatelles','Saumon','Crème fraîche','Citron'],listed:['Crème fraîche','Citron']}),{state:'partial',present:2,total:4});
});

const settleStart=source.indexOf('function commitDishEntry(name,ingredients){');
const settleEnd=source.indexOf('function consumeToast(){',settleStart);
assert.ok(settleStart>=0&&settleEnd>settleStart,'confirmation directe introuvable');

function settle(detail){
  const context={
    entries:{},
    trustedListNames:new Set(['ancien']),
    trustedListQuantities:new Map([['ancien',1]]),
    pending:null,
    saveEntries(){context.saved=(context.saved||0)+1;},
    syncCards(){context.synced=(context.synced||0)+1;},
    clearPending(){context.pending=null;},
    requestAnimationFrame(fn){fn();return 1;},
    reconcileList(){context.reconciled=(context.reconciled||0)+1;},
    event:{detail},
    result:null
  };
  vm.runInNewContext(source.slice(settleStart,settleEnd)+'\nresult=consumeDishAddSettled(event);',context);
  return context;
}

test('la confirmation du plat enregistre immédiatement ses ingrédients puis force la réconciliation',()=>{
  const context=settle({
    name:'Tagliatelles au saumon',
    ingredients:['Tagliatelles','Saumon','Crème fraîche','Citron'],
    result:{added:1,failed:0,present:3}
  });
  assert.deepEqual(plain(context.entries['Tagliatelles au saumon'].ingredients),['Tagliatelles','Saumon','Crème fraîche','Citron']);
  assert.equal(context.saved,1);
  assert.equal(context.synced,1);
  assert.equal(context.reconciled,1);
  assert.equal(context.trustedListNames,null);
  assert.equal(context.trustedListQuantities,null);
});

test('une confirmation en erreur ne crée pas de faux état local',()=>{
  const context=settle({name:'Tagliatelles au saumon',ingredients:['Citron'],result:null});
  assert.equal(context.entries['Tagliatelles au saumon'],undefined);
  assert.equal(context.saved,undefined);
});
