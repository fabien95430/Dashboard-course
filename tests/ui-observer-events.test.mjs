import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('les images produit suivent les rendus propriétaires sans observer le DOM',()=>{
  const source=read('product-item-images.js');
  assert.doesNotMatch(source,/new MutationObserver/);
  assert.match(source,/document\.addEventListener\('courses:products-updated',scheduleDecorateAll\)/);
  assert.match(source,/document\.addEventListener\('courses:list-rendered',scheduleDecorateAll\)/);
});

test('le marqueur des plats suit les événements métier sans observer le DOM',()=>{
  const marker=read('dish-added-marker.js');
  assert.doesNotMatch(marker,/new MutationObserver/);
  for(const event of ['courses:dishes-rendered','courses:list-rendered','courses:list-changed','courses:dish-quantities-updated','courses:dish-sheet-opened']){
    assert.ok(marker.includes("document.addEventListener('"+event+"'"),event+' absent du marqueur');
  }
  assert.match(marker,/new CustomEvent\('courses:dish-availability-updated'/);
  assert.match(marker,/document\.addEventListener\('courses:quantities-ready',scheduleConfirmationBinding\)/);
});

test('les propriétaires publient les rendus de plats et les quantités décorées',()=>{
  const dishes=read('dishes-ui.js');
  const quantities=read('catalog-quantities.js');
  assert.match(dishes,/new CustomEvent\('courses:dishes-rendered',\{detail:\{count\}\}\)/);
  assert.match(dishes,/new CustomEvent\('courses:dish-sheet-opened',\{detail:\{dish:dish\.name\}\}\)/);
  assert.match(quantities,/new CustomEvent\('courses:dish-quantities-updated',\{detail:\{dish:currentDish\(\)\}\}\)/);
});

test('l historique des achats consomme les événements métier sans observer le DOM ni lire les toasts',()=>{
  const history=read('purchase-intelligence.js');
  assert.doesNotMatch(history,/new MutationObserver/);
  assert.doesNotMatch(history,/consumeToast|toastObserver|dishObserver|const WATCH_TTL=|undoRecords|undoRecorded|watchPurchase|cancelPurchase/);
  assert.match(history,/document\.addEventListener\('courses:purchase-settled',consumePurchaseSettled\)/);
  assert.match(history,/document\.addEventListener\('courses:dish-add-settled',consumeDishAddSettled\)/);
  for(const event of ['courses:dish-ingredients-rendered','courses:dish-quantities-updated','courses:dish-availability-updated','courses:dish-sheet-opened','courses:quantities-ready']){
    assert.ok(history.includes("document.addEventListener('"+event+"',scheduleDish)"),event+' absent de l historique');
  }
});

test('Ma liste publie l achat accepté avec sa quantité et l état hors ligne',()=>{
  const app=read('app.js');
  assert.match(app,/function publishPurchaseSettled\(name,quantity,queued=false\)/);
  assert.match(app,/new CustomEvent\('courses:purchase-settled',\{detail:\{/);
  assert.match(app,/quantity:Math\.max\(1,Number\(quantity\)\|\|1\)/);
  assert.match(app,/queued:Boolean\(queued\)/);
  assert.match(app,/publishPurchaseSettled\(item,group\.count,false\)/);
  assert.match(app,/publishPurchaseSettled\(item,group\.count,true\)/);
});

