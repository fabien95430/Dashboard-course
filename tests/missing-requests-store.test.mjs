import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(resolve(root,path),'utf8');
const source=read('missing-requests-store.js');
const plain=value=>JSON.parse(JSON.stringify(value));

function loadStore(initial={}){
  const values=new Map(Object.entries(initial)),events=[];
  const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value))};
  let byte=0;
  const crypto={getRandomValues:array=>{for(let i=0;i<array.length;i++)array[i]=(byte++%255)+1;return array}};
  class CustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail}}
  const window={dispatchEvent:event=>{events.push(event);return true}};
  const context={window,localStorage,crypto,CustomEvent,Uint8Array,globalThis:null,Date,Math};
  context.globalThis=context;
  vm.runInNewContext(source,context,{filename:'missing-requests-store.js'});
  return {store:window.COURSES_MISSING_REQUESTS,values,events};
}

test('les produits gardent les catégories et la normalisation historiques',()=>{
  const {store}=loadStore({'courses-missing-products-v1':JSON.stringify([{name:'  Café   moulu ',category:'Petit-déjeuner'},{name:'Test',category:'Inconnue'},{name:'   '}])});
  assert.deepEqual(plain(store.readProducts()).map(({name,category})=>({name,category})),[{name:'Café moulu',category:'Petit-déjeuner'},{name:'Test',category:''}]);
  assert.equal(store.productCategories.includes('Fruits & Légumes'),true);
});

test('ajouter et supprimer un produit utilise une seule source avec détection des doublons',()=>{
  const {store,values,events}=loadStore();
  const first=store.addProduct({name:'Confiture fruits rouges',category:'Petit-déjeuner'});
  assert.equal(first.ok,true);
  assert.equal(store.addProduct({name:'  confiture fruits rouges  ',category:'Cuisine'}).reason,'duplicate');
  assert.equal(store.counts().total,1);
  assert.equal(JSON.parse(values.get('courses-missing-products-v1')).length,1);
  assert.equal(store.removeProduct(first.item.id).ok,true);
  assert.equal(store.counts().total,0);
  assert.ok(events.some(event=>event.type===store.eventName));
});

test('les plats pending et ajoutés partagent la détection de doublon et le compteur total',()=>{
  const {store}=loadStore();
  const dish=store.addDish({name:'Poulet citron',category:'Familial'});
  assert.equal(dish.ok,true);
  store.rememberAddedDish(dish.item);
  store.writeDishes([]);
  assert.equal(store.addDish({name:'poulet citron',category:''}).reason,'duplicate');
  assert.equal(store.addProduct({name:'Citron',category:'Fruits & Légumes'}).ok,true);
  assert.deepEqual(plain(store.counts()),{products:1,dishes:0,total:1});
  assert.equal(store.removeDish(dish.item.id).ok,true);
});

test('la précision image est liée au nom, limitée et nettoyée avec les produits',()=>{
  const {store,values}=loadStore();
  const item=store.addProduct({name:'Épices cajun',category:'Cuisine'}).item;
  const hint='pot '.repeat(50);
  assert.ok(store.setProductImageHint(item.name,hint).length<=140);
  assert.ok(store.productImageHint('  epices cajun  ').length<=140);
  store.removeProduct(item.id);
  assert.deepEqual(JSON.parse(values.get('courses-missing-product-image-hints-v1')||'{}'),{});
});

test('les modules actifs consomment le store sans dupliquer les clés métier',()=>{
  const app=read('app.js'),dishes=read('missing-products-dishes.js'),fixes=read('missing-products-fixes.js');
  for(const consumer of [app,dishes,fixes]){
    assert.match(consumer,/COURSES_MISSING_REQUESTS/);
    assert.doesNotMatch(consumer,/courses-missing-products-v1|courses-missing-dishes-v1|courses-missing-product-image-hints-v1/);
  }
  assert.doesNotMatch(app,/STORAGE\.missingProducts|function readMissingProducts\(|function persistMissingProducts\(/);
  assert.doesNotMatch(dishes,/new MutationObserver\(\(\)=>queueMicrotask\(syncCombinedCount\)\)/);
});

test('le service partagé est chargé avant app.js et précaché',()=>{
  const index=read('index.html'),sw=read('sw.js');
  const storeIndex=index.indexOf('./missing-requests-store.js?v=399');
  const appIndex=index.indexOf('./app.js?v=399');
  assert.ok(storeIndex>=0&&appIndex>storeIndex);
  assert.match(sw,/\.\/missing-requests-store\.js\?v=399/);
  assert.match(source,/Object\.defineProperty\(window,'COURSES_MISSING_REQUESTS',[\s\S]*?configurable:false,[\s\S]*?enumerable:false,[\s\S]*?writable:false/);
});
