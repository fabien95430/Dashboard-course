import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('dishes-ui.js');

function cardEvents({added=false,partial=false}={}){
  const start=source.indexOf("  const favoriteButton=card.querySelector('.dish-favorite');");
  const end=source.indexOf("  dishCardCache.set(dish.name,card);",start);
  assert.ok(start>0&&end>start,'les événements de la carte appartiennent à dishes-ui.js');
  const actions=[],handlers={};
  const favoriteButton={addEventListener:()=>{}};
  const card={
    querySelector:()=>favoriteButton,
    addEventListener:(name,listener)=>{handlers[name]=listener},
    classList:{contains:name=>name==='is-added'?added:(name==='is-partial'?partial:false)},
    blur:()=>actions.push('blur')
  };
  const dish={name:'Spaghetti carbonara'};
  const onOpen=()=>actions.push('open');
  const onCancel=()=>actions.push('cancel');
  const document={dispatchEvent:onCancel};
  const CustomEvent=class{constructor(type,detail){this.type=type;this.detail=detail}};
  const bind=new Function('card','dish','toggleFavorite','openDishSheet','document','CustomEvent','busyDish',
    source.slice(start,end));
  bind(card,dish,()=>{},onOpen,document,CustomEvent,false);
  return {actions,handlers,card};
}

test('un tap ouvre la fiche sans laisser un contour de focus persistant',()=>{
  const {actions,handlers}=cardEvents();
  handlers.click({detail:1,target:{closest:()=>null}});
  assert.deepEqual(actions,['blur','open']);
});

test('la navigation au clavier conserve le focus visible',()=>{
  const {actions,handlers}=cardEvents();
  handlers.keydown({key:'Enter',target:{closest:()=>null},preventDefault:()=>actions.push('preventDefault')});
  assert.deepEqual(actions,['preventDefault','open']);
  assert.match(read('dishes.css'),/\.dish-card:focus-visible\{outline:2px/);
});

test('un clic clavier synthétique ou une activation accessible ne perd pas le focus',()=>{
  const {actions,handlers}=cardEvents();
  handlers.click({detail:0,target:{closest:()=>null}});
  assert.deepEqual(actions,['open']);
});

test('le marquage des plats ajoutés et le bouton annuler restent inchangés',()=>{
  const {actions,handlers}=cardEvents({added:true});
  handlers.click({detail:1,target:{closest:selector=>selector==='.dish-add'?{}:null}});
  assert.deepEqual(actions,['cancel']);
  const marker=read('dish-added-marker.js');
  assert.match(marker,/\.dish-card\.is-added\{/);
  assert.match(marker,/\.dish-card\.is-partial\{/);
  assert.match(marker,/\.dish-card\.is-added:focus-visible/);
});

test('un clic sur le favori ne déclenche ni ouverture ni perte du focus',()=>{
  const {actions,handlers}=cardEvents();
  handlers.click({detail:1,target:{closest:selector=>selector==='.dish-favorite'?{}:null}});
  assert.deepEqual(actions,[]);
});
