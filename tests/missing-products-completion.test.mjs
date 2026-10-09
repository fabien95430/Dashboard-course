import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const source=readFileSync(resolve(root,'missing-products-dishes.js'),'utf8');

test('un produit intégré quitte les demandes dès qu il existe dans catalog.js',()=>{
  const start=source.indexOf('function reconcileProducts()');
  const end=source.indexOf('function dishImageReady',start);
  assert.ok(start>=0&&end>start,'réconciliation produit introuvable');
  const reconcile=source.slice(start,end);
  assert.match(reconcile,/catalog\.has\(normalize\(item\.name\)\)/);
  assert.doesNotMatch(reconcile,/productImageReady/);
  assert.doesNotMatch(source,/function productImageReady\(/);
});

test('un plat intégré conserve le contrôle de sa photo locale avant clôture',()=>{
  assert.match(source,/const completed=current\.filter\(item=>dishImageReady\(item\)\)/);
});
