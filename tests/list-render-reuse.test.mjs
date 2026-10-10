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
  const source=extractBetween('function patchListRowState(row,group){','function patchRenderedListRows(root,rows,structureSignature){');
  const makePatch=new Function('norm','state','document',`${source}; return patchListRowState;`);
  const busy=new Set(['lait']);
  let quantity=null;
  const check={disabled:false};
  const classes=new Set();
  const undo={before(node){quantity=node}};
  const row={
    classList:{
      contains:name=>classes.has(name),
      toggle(name,on){if(on)classes.add(name);else classes.delete(name)}
    },
    querySelector(selector){
      if(selector==='.purchase-check')return check;
      if(selector==='.list-qty')return quantity;
      if(selector==='.undo-purchase')return undo;
      return null;
    },
    appendChild(node){quantity=node}
  };
  const document={createElement(){
    const node={className:'',textContent:'',remove(){if(quantity===node)quantity=null}};
    return node;
  }};
  const patch=makePatch(value=>String(value).toLowerCase(),{productBusy:busy},document);

  assert.equal(patch(row,{summary:'Lait',count:2}),true);
  const quantityNode=quantity;
  assert.equal(quantityNode.textContent,'x2');
  assert.equal(check.disabled,true);
  assert.equal(classes.has('is-busy'),true);

  busy.clear();
  assert.equal(patch(row,{summary:'Lait',count:3}),true);
  assert.equal(quantity,quantityNode,'le badge de quantité existant doit être réutilisé');
  assert.equal(quantity.textContent,'x3');
  assert.equal(check.disabled,false);
  assert.equal(classes.has('is-busy'),false);

  assert.equal(patch(row,{summary:'Lait',count:1}),true);
  assert.equal(quantity,null,'le badge doit disparaître quand la quantité revient à 1');
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
