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
  assert.match(markup({purchases:0,products:0,recent:[]}),/Aucun achat enregistré sur cet iPhone pour l’instant\. Cochez ✓ les produits achetés dans Ma liste\./);
  assert.match(markup({purchases:1,products:1,recent:['Bananes']}),/<strong>1 achat enregistré sur cet iPhone<\/strong><small>Derniers : Bananes<\/small>/);
  assert.match(markup({purchases:12,products:5,recent:['Lait demi-écrémé','Bananes','Pain']}),/12 achats enregistrés sur cet iPhone<\/strong><small>Derniers : Lait demi-écrémé, Bananes, Pain…<\/small>/);
  assert.match(repurchase,/Les suggestions apparaissent quand un prochain achat approche\.<\/span>'\+historyStatusMarkup\(\)/);
});
