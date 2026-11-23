import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

function extractBetween(startMarker,endMarker){
  const start=app.indexOf(startMarker);
  const end=app.indexOf(endMarker,start);
  assert.ok(start>=0&&end>start,`section introuvable: ${startMarker}`);
  return app.slice(start,end);
}

test('Ma liste réutilise les lignes lorsque seule la quantité ou l état occupé change',()=>{
  // v906 : la quantité est le chiffre du sélecteur − n + ; son apparition ou sa disparition
  // (passage par 1) change la signature de structure et passe par le rendu complet.
  const source=extractBetween('function patchListRowState(row,group){','function patchRenderedListRows(root,rows,structureSignature){');
  const makePatch=new Function('norm','state',`${source}; return patchListRowState;`);
  const busy=new Set(['lait']);
  const quantity={textContent:'2'};
  const check={disabled:false};
  const classes=new Set();
  const row={
    classList:{
      contains:name=>classes.has(name),
      toggle(name,on){if(on)classes.add(name);else classes.delete(name)}
    },
    querySelector(selector){
      if(selector==='.purchase-check')return check;
      if(selector==='.list-qty')return quantity;
      return null;
    }
  };
  const patch=makePatch(value=>String(value).toLowerCase(),{productBusy:busy});

  assert.equal(patch(row,{summary:'Lait',count:2}),true,'seul l état occupé a changé');
  assert.equal(quantity.textContent,'2');
  assert.equal(check.disabled,true);
  assert.equal(classes.has('is-busy'),true);

  busy.clear();
  assert.equal(patch(row,{summary:'Lait',count:3}),true);
  assert.equal(quantity.textContent,'3','le chiffre du sélecteur existant doit être réutilisé');
  assert.equal(check.disabled,false);
  assert.equal(patch(row,{summary:'Lait',count:3}),false,'aucun changement, aucune écriture');
});

test('la présence du sélecteur de quantité fait partie de la structure de Ma liste',()=>{
  const signature=extractBetween('function listStructureSignature(','function patchListRowState(row,group){');
  assert.match(signature,/group\.count>1\?'quantite':''/);
  const render=extractBetween('function renderList(){','function updateListReorderAvailability(root){');
  assert.match(render,/list-qty-stepper/);
  assert.match(render,/queueCatalogQuantityChange\(name,step\)/);
});

test('le rendu complet reste le repli dès que la structure de Ma liste change',()=>{
  const render=extractBetween('function renderList(){','function updateListReorderAvailability(root){');
  assert.match(render,/const structureSignature=listStructureSignature\(rows,showCategorySections\);/);
  assert.match(render,/if\(patchRenderedListRows\(el,rows,structureSignature\)\)return;/);
  assert.match(render,/el\.innerHTML=rows\.map\(group=>\{/);
  assert.match(render,/listRenderStructureSignature=structureSignature;/);
  assert.doesNotMatch(app,/function listDomMatchesCurrentState\(/);
});

test('un rafraîchissement Home Assistant passe par le rendu propriétaire optimisé',()=>{
  const refresh=extractBetween('async function refreshItems(){','function productQuantity(name){');
  assert.match(refresh,/state\.loading=false;state\.error='';syncProductSelection\(\);\s*renderList\(\);/);
  assert.doesNotMatch(refresh,/listDomMatchesCurrentState/);
});

test('une suppression partielle invalide la signature de structure',()=>{
  const remove=extractBetween('function removeRenderedListRow(row){','function listRowCategory(row){');
  assert.match(remove,/listRenderStructureSignature='';\s*row\.remove\(\);/);
});
