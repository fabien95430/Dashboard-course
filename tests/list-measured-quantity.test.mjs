import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Ma liste : le poids (100 g par occurrence) ne s'affiche que pour une quantité venue d'un plat,
// et jamais pour un fruit compté à la pièce (Bananes, Pommes…).
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function el(extra={}){
  return {
    children:[],classes:new Set(),textContent:'',dataset:{},
    classList:{add(c){this.owner.classes.add(c)},remove(c){this.owner.classes.delete(c)}},
    appendChild(child){this.children.push(child);child.parent=this;return child},
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)},
    querySelector(){return null},querySelectorAll(){return []},setAttribute(){},
    ...extra
  };
}
function row(name,count){
  const qty=el({textContent:String(count)});qty.classList.owner=qty;
  const copy=el();copy.classList.owner=copy;
  const r=el({dataset:{name}});
  r.querySelector=sel=>sel==='.list-qty'?qty:sel==='.list-copy'?copy:sel==='.list-measured-quantity'?(copy.children[0]||null):null;
  return {row:r,qty,copy};
}
function load(contributions={}){
  const rows=[row('Bananes',1),row('Courgettes',1),row('Carottes',3)];
  const listItems=el({querySelectorAll:sel=>sel==='.list-row[data-name]'?rows.map(r=>r.row):[]});
  const storage=new Map([['courses-dish-contributions-v1',JSON.stringify(contributions)]]);
  const byId={dishDialog:el({open:false,querySelector:sel=>sel==='.dish-sheet-list'?el():null}),products:el(),listItems};
  const context={
    window:{COURSES_LIST:{getQuantity:name=>({Bananes:1,Courgettes:1,Carottes:3})[name]||0}},
    document:{readyState:'loading',addEventListener(){},getElementById:id=>byId[id],
      head:el(),createElement:()=>{const e=el();e.classList.owner=e;return e},dispatchEvent(){}},
    CustomEvent:class{constructor(type){this.type=type}},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))},
    console:{warn(){}},requestAnimationFrame:()=>0,queueMicrotask(){}
  };
  const catalog=read('catalog.js');
  vm.runInNewContext(catalog.slice(0,catalog.indexOf('})();')+5),context);
  vm.runInNewContext(read('catalog-quantities.js'),context);
  context.window.COURSES_QUANTITIES.bind();
  const measured=r=>r.copy.children[0]?.textContent||'';
  return {bananes:rows[0],courgettes:rows[1],carottes:rows[2],measured};
}

test('un produit au poids ajouté sans plat garde son compteur, sans « 100 g »',()=>{
  const {courgettes,measured}=load();
  assert.equal(measured(courgettes),'');
  assert.equal(courgettes.qty.classes.has('is-measured-count'),false);
});

test('une banane ajoutée seule ne devient jamais « 100 pièces »',()=>{
  const {bananes,measured}=load({'Salade de fruits':{Bananes:1}});
  assert.equal(measured(bananes),'');
  assert.equal(bananes.qty.classes.has('is-measured-count'),false);
});

test('une quantité venue d’un plat garde son poids',()=>{
  const {carottes,measured}=load({'Velouté carottes':{Carottes:250}});
  assert.equal(measured(carottes),'300 g');
  assert.equal(carottes.qty.classes.has('is-measured-count'),true);
});
