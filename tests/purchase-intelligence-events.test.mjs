import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../purchase-intelligence.js',import.meta.url),'utf8');
const purchaseStart=source.indexOf('function consumePurchaseSettled(event){');
const purchaseEnd=source.indexOf('function consumeDishAddSettled(event){',purchaseStart);
const dishEnd=source.indexOf('function styles(){',purchaseEnd);
assert.ok(purchaseStart>=0&&purchaseEnd>purchaseStart&&dishEnd>purchaseEnd,'consommateurs événementiels introuvables');

function purchaseCalls(detail,enabled=true){
  const calls=[];
  const context={event:{detail},isEnabled:()=>enabled,record:(name,qty)=>calls.push({name,qty})};
  vm.runInNewContext(source.slice(purchaseStart,purchaseEnd)+'\nconsumePurchaseSettled(event);',context);
  return calls;
}

test('un achat accepté enregistre directement son nom et sa quantité',()=>{
  assert.deepEqual(purchaseCalls({name:'Lait',quantity:3}),[{name:'Lait',qty:3}]);
  assert.deepEqual(purchaseCalls({name:'Lait',quantity:3},false),[]);
});

function dishOutcome(detail){
  const token={dish:'Pâtes tomate mozzarella',items:[{name:'Mozzarella',qty:1}]};
  const context={
    event:{detail},dishPending:token,
    norm:value=>String(value||'').toLowerCase(),
    clearDishPending(){context.cleared=(context.cleared||0)+1;context.dishPending=null;},
    recordDishConsumptions(value){context.recorded=value;}
  };
  vm.runInNewContext(source.slice(purchaseEnd,dishEnd)+'\nconsumeDishAddSettled(event);',context);
  return context;
}

test('un plat confirmé débite le stock probabiliste sans dépendre du texte du toast',()=>{
  const success=dishOutcome({name:'Pâtes tomate mozzarella',result:{added:1,failed:0,present:0}});
  assert.equal(success.cleared,1);
  assert.deepEqual(JSON.parse(JSON.stringify(success.recorded)),{dish:'Pâtes tomate mozzarella',items:[{name:'Mozzarella',qty:1}]});

  const partial=dishOutcome({name:'Pâtes tomate mozzarella',result:{added:1,failed:1,present:0}});
  assert.equal(partial.cleared,1);
  assert.equal(partial.recorded,undefined);

  const unrelated=dishOutcome({name:'Autre plat',result:{added:1,failed:0,present:0}});
  assert.equal(unrelated.cleared,undefined);
  assert.equal(unrelated.recorded,undefined);
});

test('activer ou désactiver l historique prévient tout de suite le badge À prévoir',()=>{
  const start=source.indexOf('function setEnabled(value){');
  const end=source.indexOf('function syncPreferenceToggle(){',start);
  assert.ok(start>=0&&end>start,'setEnabled introuvable');
  const events=[],stored=new Map();
  const context={
    localStorage:{setItem:(key,value)=>stored.set(key,value)},
    clearDishPending(){},syncPreferenceToggle(){},scheduleDish(){},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
    document:{dispatchEvent:event=>events.push({type:event.type,enabled:event.detail.enabled})}
  };
  const setEnabled=vm.runInNewContext(source.slice(start,end)+';setEnabled',context);
  assert.equal(setEnabled(false),false);
  assert.equal(setEnabled(true),true);
  assert.deepEqual(events,[{type:'courses:purchase-history-changed',enabled:false},{type:'courses:purchase-history-changed',enabled:true}]);
  const repurchase=readFileSync(new URL('../repurchase-soon.js',import.meta.url),'utf8');
  assert.match(repurchase,/addEventListener\('courses:purchase-history-changed',\(\)=>refresh\(true\)\)/);
});

test('le résumé de l historique compte les achats et liste les derniers produits',()=>{
  const start=source.indexOf('function historySummary(');
  const end=source.indexOf('function styles(){',start);
  assert.ok(start>=0&&end>start,'historySummary introuvable');
  const META=new Map([['lait demi ecreme',{name:'Lait demi-écrémé'}],['bananes',{name:'Bananes'}],['beurre',{name:'Beurre'}],['pain',{name:'Pain'}]]);
  const make=purchases=>vm.runInNewContext(source.slice(start,end)+';historySummary',{META,state:{purchases}});
  assert.deepEqual(JSON.parse(JSON.stringify(make({})())),{purchases:0,products:0,recent:[]});
  const summary=make({
    'bananes':[{at:10},{at:40}],
    'lait demi ecreme':[{at:50}],
    'beurre':[{at:5}],
    'pain':[{at:30}],
    'produit retire':[{at:99}]
  })(3);
  assert.deepEqual(JSON.parse(JSON.stringify(summary)),{purchases:5,products:4,recent:['Lait demi-écrémé','Bananes','Pain']});
});

test('l écran vide de À prévoir montre si les achats sont bien enregistrés',()=>{
  const repurchase=readFileSync(new URL('../repurchase-soon.js',import.meta.url),'utf8');
  const start=repurchase.indexOf('function historyStatusMarkup(){');
  const end=repurchase.indexOf('function emptyMarkup(){',start);
  assert.ok(start>=0&&end>start,'historyStatusMarkup introuvable');
  const esc=value=>String(value).replace(/</g,'&lt;');
  const markup=summary=>vm.runInNewContext(repurchase.slice(start,end)+';historyStatusMarkup()',{esc,intelligence:()=>summary?{summary:()=>summary}:null});
  assert.equal(markup(null),'');
  assert.match(markup({purchases:0,products:0,recent:[]}),/Aucun achat enregistré pour le moment\. Cochez ✓ les produits achetés dans Ma liste\./);
  assert.match(markup({purchases:1,products:1,recent:['Bananes']}),/<strong>1 achat enregistré dans l’historique partagé<\/strong><small>Derniers : Bananes<\/small>/);
  assert.match(markup({purchases:12,products:5,recent:['Lait demi-écrémé','Bananes','Pain']}),/12 achats enregistrés dans l’historique partagé<\/strong><small>Derniers : Lait demi-écrémé, Bananes, Pain…<\/small>/);
  assert.match(repurchase,/Les suggestions apparaissent quand un prochain achat approche\.<\/span>'\+historyStatusMarkup\(\)/);
});


test('deux appareils conservent leurs achats distincts dans un même cycle',()=>{
  const start=source.indexOf('function eventsFor(name){'),end=source.indexOf('function feedbackFor(name)',start);
  assert.ok(start>0&&end>start);
  const rows=[{id:'e-iphone',at:1000,firstAt:1000,qty:2,household:4},{id:'e-tablette',at:2000,firstAt:2000,qty:3,household:4}];
  const cycles=vm.runInNewContext(source.slice(start,end)+';eventsFor("Lait")',{
    state:{purchases:{lait:rows}},norm:value=>value.toLowerCase(),SAME_TRIP:18*60*60*1000
  });
  assert.equal(rows.length,2);
  assert.equal(cycles.length,1);
  assert.equal(cycles[0].qty,5);
  assert.equal(cycles[0].firstAt,1000);
  assert.equal(cycles[0].at,2000);
});

test('la fusion Home Assistant conserve les événements locaux et distants sans doublons',()=>{
  const start=source.indexOf('function sharedEventId('),end=source.indexOf('function readHousehold(){',start);
  const sharedStart=source.indexOf('function sharedCanonicalEvent('),sharedEnd=source.indexOf('function sharedDescription(entry)',sharedStart);
  assert.ok(start>0&&end>start&&sharedStart>0&&sharedEnd>sharedStart);
  const events=[];
  const state={purchases:{lait:[{id:'e-local',at:2000,firstAt:2000,qty:1,household:4}]},feedback:{},consumptions:{}};
  const ctx={
    state,SHARED_TYPES:['purchases','feedback','consumptions'],META:new Map([['lait',{name:'Lait'}]]),
    HISTORY_DAYS:400,DAY:86400000,readHousehold:()=>4,
    prune(){},rebuild(){},writeState(){},scheduleDish(){},isEnabled:()=>true,
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
    document:{dispatchEvent:e=>events.push(e)},Date:{now:()=>3000}
  };
  vm.runInNewContext(source.slice(start,end)+source.slice(sharedStart,sharedEnd)+';globalThis.mergeSharedRows=mergeSharedRows;globalThis.sharedSnapshot=sharedSnapshot;',ctx);
  const remote=[{type:'purchases',key:'lait',event:{id:'e-remote',at:1000,firstAt:1000,qty:2,household:4}}];
  ctx.mergeSharedRows(remote);
  ctx.mergeSharedRows(remote);
  assert.equal(state.purchases.lait.length,2);
  assert.deepEqual([...ctx.sharedSnapshot().keys()].sort(),['purchases|lait|e-local','purchases|lait|e-remote']);
  assert.equal(events.length,1);
});

test('la synchronisation réutilise le WebSocket authentifié et la liste de demandes sans toucher à Ma liste',()=>{
  assert.match(source,/const SHARED_ENTITY='todo\.courses_demandes'/);
  assert.match(source,/const SHARED_PREFIX='courses-history-v1:'/);
  assert.match(source,/const sharedConnected=\(\)=>sharedClient\(\)\?\.isConnected\?\.\(\)===true;/);
  assert.match(source,/subscribeMissingTodo\(SHARED_ENTITY/);
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/COURSES_PURCHASE_INTELLIGENCE\?\.connectShared\?\.\(\{newConnection:true\}\)/);
});


test('un plat partagé conserve les consommations associées aux cycles fusionnés',()=>{
  const start=source.indexOf('function consumedForCycle('),end=source.indexOf('function adaptiveProfile(',start);
  assert.ok(start>0&&end>start);
  const items=[{at:1000,firstAt:1000},{at:2000,firstAt:2000}];
  const context={
    norm:s=>s.toLowerCase(),state:{purchases:{lait:items}},
    eventsFor:()=>[{at:2000,firstAt:1000,qty:2}],
    consumptionsFor:()=>[{cycleAt:1000,qty:1},{cycleAt:2000,qty:2},{cycleAt:3000,qty:7}]
  };
  const consumed=vm.runInNewContext(source.slice(start,end)+';consumedForCycle("Lait",1000)',context);
  assert.equal(consumed,3);
});

test('la rétention distante ne supprime que les entrées historiques expirées',()=>{
  assert.match(source,/function expiredSharedHistory\(row\)/);
  assert.match(source,/SHARED_TYPES\.includes\(payload\.type\)&&META\.has\(payload\.key\)/);
  assert.match(source,/callService\('todo','remove_item'/);
});

test('un ingrédient acheté récemment recoché reste coché quand dishes-ui reconstruit les lignes',()=>{
  const start=source.indexOf('const dishRows='),end=source.indexOf('function bindHistoryEvents(){',start);
  assert.ok(start>0&&end>start,'gestion des lignes de la fiche introuvable');
  const selected=new Set(['Lait']);
  let rows=[],ctx;
  class Row{
    constructor(name){this.dataset={ingredient:name};this.disabled=false;this.classes=new Set();this.pressed=selected.has(name)?'true':'false';
      this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c)};}
    getAttribute(name){return name==='aria-pressed'?this.pressed:null}
    hasAttribute(){return false}
    querySelector(){return null}
    closest(selector){return selector.includes('is-recent-purchase')&&!this.classes.has('is-recent-purchase')?null:this}
    // Comme dishes-ui.js : le clic bascule la sélection puis reconstruit toutes les lignes, avant la décoration.
    click(){if(selected.has(this.dataset.ingredient))selected.delete(this.dataset.ingredient);else selected.add(this.dataset.ingredient);render()}
  }
  const render=()=>{rows=['Lait','Beurre'].map(name=>new Row(name));ctx.decorateDish()};
  const feedback=[];
  ctx={
    document:{getElementById:()=>({open:true,querySelectorAll:()=>rows})},
    isEnabled:()=>true,recent:name=>name==='Beurre'?{}:null,rowRequiredQty:()=>1,LABEL:'Acheté récemment',
    recordFeedback:name=>feedback.push(name),setTimeout:fn=>fn(),requestAnimationFrame:fn=>fn()
  };
  vm.runInNewContext(source.slice(start,end)+';Object.assign(globalThis,{decorateDish,consumeRecentDishClick,resetDishRows});',ctx);
  selected.add('Beurre');render();
  const beurre=()=>rows.find(row=>row.dataset.ingredient==='Beurre');
  assert.equal(beurre().pressed,'false','acheté récemment : décoché à l ouverture');
  assert.ok(beurre().classes.has('is-recent-purchase'));

  const target=beurre();
  ctx.consumeRecentDishClick({isTrusted:true,target});
  target.click();
  assert.equal(beurre().pressed,'true','le choix de l utilisateur survit à la reconstruction');
  assert.equal(beurre().classes.has('is-recent-purchase'),false);
  assert.deepEqual(feedback,['Beurre']);

  rows.find(row=>row.dataset.ingredient==='Lait').click();
  assert.equal(beurre().pressed,'true','un autre clic ne redécoche pas le produit');

  ctx.resetDishRows();selected.add('Beurre');render();
  assert.equal(beurre().pressed,'false','une nouvelle ouverture repart de l historique');
});
