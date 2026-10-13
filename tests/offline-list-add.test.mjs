import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

function extractFunction(signature){
  const start=app.indexOf(signature);
  assert.ok(start>=0,signature+' introuvable');
  const brace=app.indexOf('{',start);
  let depth=0;
  for(let index=brace;index<app.length;index++){
    if(app[index]==='{')depth++;
    else if(app[index]==='}'){
      depth--;
      if(depth===0)return app.slice(start,index+1);
    }
  }
  throw new Error(signature+' non terminée');
}

test('un ajout hors ligne apparaît immédiatement et rejoint la file chiffrée',async()=>{
  const source=extractFunction('async function queueOfflineAdd(name)');
  const state={entity:'todo.courses',offlinePending:[],items:[]};
  const context={
    state,String,Math,Date,
    secureRandomToken:()=> 'offline-add-1',
    productQuantity:()=>0,
    persistOfflineState:async()=>true,
    showOfflineStatus(){}
  };
  vm.runInNewContext(source+';globalThis.run=queueOfflineAdd;',context);
  const action=await context.run('Lait');
  assert.equal(action.type,'add');
  assert.equal(action.target,1);
  assert.equal(state.offlinePending.length,1);
  assert.equal(state.items[0].summary,'Lait');
  assert.equal(state.items[0].offlineActionId,'offline-add-1');
});

test('la reconnexion applique une seule fois un ajout absent de Home Assistant',async()=>{
  const source=extractFunction('async function syncOfflinePending()');
  const calls=[];
  const state={
    entity:'todo.courses',
    offlinePending:[{id:'a1',type:'add',entity:'todo.courses',name:'Lait',target:2}],
    offlineSyncing:null,
    items:[{uid:'',summary:'Lait',status:'needs_action',offlineActionId:'a1'}]
  };
  const context={
    state,String,Math,Map,Set,
    socketReady:()=>true,
    todoList:async()=>({items:[{uid:'r1',summary:'Lait',status:'needs_action'}]}),
    isPendingItem:item=>item.status!=='completed',
    itemUid:item=>String(item.uid||''),
    itemSummary:item=>String(item.summary||''),
    norm:value=>String(value||'').toLowerCase(),
    todoService:async(service,data)=>calls.push(service+':'+data.item),
    completeTodoItem:async uid=>calls.push('complete:'+uid),
    persistOfflineState:async()=>true
  };
  vm.runInNewContext(source+';globalThis.run=syncOfflinePending;',context);
  await context.run();
  assert.deepEqual(calls,['add_item:Lait']);
  assert.equal(state.offlinePending.length,0);
  assert.equal(state.items.length,0);
});

test('la reconnexion ne duplique pas un ajout déjà confirmé à distance',async()=>{
  const source=extractFunction('async function syncOfflinePending()');
  const calls=[];
  const state={entity:'todo.courses',offlinePending:[{id:'a1',type:'add',entity:'todo.courses',name:'Lait',target:2}],offlineSyncing:null,items:[]};
  const context={
    state,String,Math,Map,Set,
    socketReady:()=>true,
    todoList:async()=>({items:[
      {uid:'r1',summary:'Lait',status:'needs_action'},
      {uid:'r2',summary:'Lait',status:'needs_action'}
    ]}),
    isPendingItem:item=>item.status!=='completed',
    itemUid:item=>String(item.uid||''),
    itemSummary:item=>String(item.summary||''),
    norm:value=>String(value||'').toLowerCase(),
    todoService:async(service,data)=>calls.push(service+':'+data.item),
    completeTodoItem:async uid=>calls.push('complete:'+uid),
    persistOfflineState:async()=>true
  };
  vm.runInNewContext(source+';globalThis.run=syncOfflinePending;',context);
  await context.run();
  assert.deepEqual(calls,[]);
  assert.equal(state.offlinePending.length,0);
});

test('les opérations hors ligne gardent leur ordre à la reconnexion',async()=>{
  const source=extractFunction('async function syncOfflinePending()');
  const calls=[];
  const state={entity:'todo.courses',offlinePending:[
    {id:'c1',type:'complete',entity:'todo.courses',name:'Lait',uids:['r1']},
    {id:'a1',type:'add',entity:'todo.courses',name:'Lait',target:1}
  ],offlineSyncing:null,items:[]};
  const context={
    state,String,Math,Map,Set,
    socketReady:()=>true,
    todoList:async()=>({items:[{uid:'r1',summary:'Lait',status:'needs_action'}]}),
    isPendingItem:item=>item.status!=='completed',
    itemUid:item=>String(item.uid||''),
    itemSummary:item=>String(item.summary||''),
    norm:value=>String(value||'').toLowerCase(),
    todoService:async(service,data)=>calls.push(service+':'+data.item),
    completeTodoItem:async uid=>calls.push('complete:'+uid),
    persistOfflineState:async()=>true
  };
  vm.runInNewContext(source+';globalThis.run=syncOfflinePending;',context);
  await context.run();
  assert.deepEqual(calls,['complete:r1','add_item:Lait']);
});

test('supprimer un article ajouté hors ligne annule son ajout différé',async()=>{
  const source=extractFunction('async function queueOfflineCompletion(name,uids)');
  const state={
    entity:'todo.courses',
    offlinePending:[{id:'a1',type:'add',entity:'todo.courses',name:'Lait',target:1}],
    items:[{uid:'',summary:'Lait',status:'needs_action',offlineActionId:'a1'}]
  };
  const context={
    state,String,Set,Date,
    norm:value=>String(value||'').toLowerCase(),
    secureRandomToken:()=> 'complete-1',
    persistOfflineState:async()=>true,
    showOfflineStatus(){}
  };
  vm.runInNewContext(source+';globalThis.run=queueOfflineCompletion;',context);
  await context.run('Lait',[]);
  assert.equal(state.offlinePending.length,0);
  assert.equal(state.items.length,0);
});

test('le retrait unitaire annule en priorité le dernier ajout différé',async()=>{
  const source=extractFunction('async function cancelQueuedOfflineAdd(name,all=false)');
  const state={
    entity:'todo.courses',
    offlinePending:[
      {id:'a1',type:'add',entity:'todo.courses',name:'Lait',target:1},
      {id:'a2',type:'add',entity:'todo.courses',name:'Lait',target:2}
    ],
    items:[
      {summary:'Lait',offlineActionId:'a1'},
      {summary:'Lait',offlineActionId:'a2'}
    ]
  };
  const context={
    state,String,Set,
    norm:value=>String(value||'').toLowerCase(),
    persistOfflineState:async()=>true,
    showOfflineStatus(){}
  };
  vm.runInNewContext(source+';globalThis.run=cancelQueuedOfflineAdd;',context);
  const cancelled=await context.run('Lait');
  assert.equal(cancelled,1);
  assert.deepEqual(state.offlinePending.map(action=>action.id),['a1']);
  assert.deepEqual(state.items.map(item=>item.offlineActionId),['a1']);
});

test('addItem bascule vers la file chiffrée sans WebSocket',()=>{
  const start=app.indexOf('async function addItem(name,{deferRefresh=false}={}){');
  const end=app.indexOf('async function completeTodoItem(uid){',start);
  assert.ok(start>=0&&end>start,'bloc addItem introuvable');
  const source=app.slice(start,end);
  assert.match(source,/if\(!socketReady\(\)\)/);
  assert.match(source,/await queueOfflineAdd\(item\)/);
  assert.match(source,/if\(isTransientHaError\(error\)\)/);
});
