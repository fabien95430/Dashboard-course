import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const src=fs.readFileSync(new URL('../missing-requests-store.js',import.meta.url),'utf8');
const remote=[];let nextId=1;
const actors=[];
const tick=()=>new Promise(done=>setTimeout(done,10));
function phone(initial={}){
  const map=new Map(Object.entries(initial).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)]));
  const client={connected:true,isConnected(){return this.connected},async getStates(){return [{entity_id:'todo.courses_demandes',state:'0'}]},
    async request(payload){
      assert.equal(payload.entity_id||payload.trigger?.entity_id,'todo.courses_demandes');
      if(payload.type==='subscribe_trigger')return {subscription:1};
      if(payload.type==='todo/item/list')return {items:structuredClone(remote)};
      throw new Error(payload.type);
    },
    async callService(domain,action,data){
      assert.equal(domain,'todo');
      if(action==='add_item')remote.push({uid:String(nextId++),summary:data.item,description:data.description,status:'needs_action'});
      else if(action==='remove_item'){
        const index=remote.findIndex(r=>r.uid===data.item||r.summary===data.item);
        if(index<0)throw new Error('unknown');
        remote.splice(index,1);
      }else if(action==='update_item'){
        const row=remote.find(r=>r.uid===data.item);
        if(!row)throw new Error('unknown');
        row.description=data.description;
      }else throw new Error(action);
      queueMicrotask(()=>actors.forEach(p=>p.window.dispatchEvent({type:'courses:missing-ha-updated'})));
    }
  };
  const listeners=new Map(),events=[];
  const window={COURSES_HA_CLIENT:client,
    addEventListener(type,fn){(listeners.get(type)||listeners.set(type,[]).get(type)).push(fn)},
    dispatchEvent(event){events.push(event);for(const fn of listeners.get(event.type)||[])fn(event)}
  };
  let byte=0;const crypto={getRandomValues(array){for(let i=0;i<array.length;i++)array[i]=((byte++%250)+1);return array}};
  const localStorage={getItem(key){return map.get(key)??null},setItem(key,value){map.set(key,value)}};
  class CustomEvent{constructor(type,{detail}={}){this.type=type;this.detail=detail}}
  const context={window,localStorage,crypto,CustomEvent,console,Uint8Array,Date,Math,globalThis:null};context.globalThis=context;
  vm.runInNewContext(src,context,{filename:'missing-requests-store.js'});
  const obj={window,store:window.COURSES_MISSING_REQUESTS,client,map,events};actors.push(obj);return obj;
}
test('la première connexion fusionne deux téléphones et synchronise ajouts et suppressions',async()=>{
  remote.length=0;actors.length=0;nextId=1;
  const A=phone({'courses-missing-products-v1':[{id:'a',name:'Jus de pomme',category:'Boissons'}]});
  const B=phone({'courses-missing-dishes-v1':[{id:'b',name:'Poulet citron',category:'Familial'}]});
  assert.equal(await A.store.connectShared(),true);assert.equal(await B.store.connectShared(),true);
  await tick();await tick();
  assert.deepEqual(Array.from(A.store.readProducts(),x=>x.name),['Jus de pomme']);
  assert.deepEqual(Array.from(B.store.readProducts(),x=>x.name),['Jus de pomme']);
  assert.deepEqual(Array.from(A.store.readDishes(),x=>x.name),['Poulet citron']);
  assert.deepEqual(Array.from(B.store.readDishes(),x=>x.name),['Poulet citron']);
  A.store.removeProduct(A.store.readProducts()[0].id);
  await tick();await tick();
  assert.equal(B.store.readProducts().length,0);
  B.store.addDish({name:'Riz aux légumes',category:'Famille'});
  await tick();await tick();
  assert.deepEqual(Array.from(A.store.readDishes(),x=>x.name).sort(),['Poulet citron','Riz aux légumes']);
});
test('les opérations locales hors connexion sont transmises à la reconnexion',async()=>{
  remote.length=0;actors.length=0;nextId=1;
  const A=phone();await A.store.connectShared();
  A.client.connected=false;
  A.store.addProduct({name:'Piles AA',category:'Maison'});
  assert.equal(A.store.readProducts().length,1);
  assert.equal(remote.length,0);
  A.client.connected=true;await A.store.connectShared();await tick();
  assert.equal(remote.length,1);
  assert.equal(JSON.parse(A.map.get('courses-missing-ha-actions-v1')).length,0);
});
test('une liste Home Assistant absente ne supprime aucune demande locale',async()=>{
  remote.length=0;actors.length=0;
  const A=phone();A.client.getStates=async()=>[];
  A.store.addDish({name:'Salade',category:'Entrée'});
  assert.equal(await A.store.connectShared(),false);
  assert.equal(A.store.readDishes().length,1);
  assert.equal(remote.length,0);
});
