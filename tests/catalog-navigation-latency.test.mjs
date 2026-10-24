import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('le changement de vue démarre avant le rendu lourd et annule un ancien Catalogue',()=>{
  const start=app.indexOf("let publishedView='';");
  const end=app.indexOf('function renderView(){',start);
  assert.ok(start>=0&&end>start);
  const trace=[],frames=new Map(),state={view:'list'};
  let counter=0;
  const raf=fn=>{const id=++counter;frames.set(id,fn);return id;};
  const caf=id=>frames.delete(id);
  const frame=()=>{const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());};
  const tabs=['list','catalog','settings'].map(view=>({dataset:{view},classList:{toggle(){}}}));
  const elements=Object.fromEntries(['catalogView','listView','settingsView']
    .map(name=>['#'+name,{classList:{toggle(){}}}]));
  const document={
    querySelectorAll:()=>tabs,
    dispatchEvent:event=>trace.push('event:'+event.detail.view)
  };
  const Event=class{constructor(type,options){this.type=type;this.detail=options.detail;}};
  const factory=new Function('state','$','document','BOTTOM_NAV','requestAnimationFrame',
    'cancelAnimationFrame','setListFilterMenuOpen','renderCategories','renderProducts',
    'CustomEvent',app.slice(start,end)+'return showView;');
  const showView=factory(state,selector=>elements[selector],document,
    {sync:()=>trace.push('nav')},raf,caf,()=>{},
    ()=>trace.push('categories'),()=>trace.push('products'),Event);
  showView();
  trace.length=0;
  state.view='catalog';showView();
  assert.ok(trace.indexOf('nav')>=0&&trace.indexOf('nav')<trace.indexOf('categories'));
  assert.ok(trace.includes('event:catalog'));
  assert.equal(trace.includes('products'),false);
  frame();
  assert.equal(trace.includes('products'),false,'la première frame reste libre');
  frame();
  assert.equal(trace.filter(x=>x==='products').length,1);
  state.view='settings';showView();
  state.view='catalog';showView();
  state.view='list';showView();
  frame();frame();
  assert.equal(trace.filter(x=>x==='products').length,1,'aucun rendu sur un onglet quitté');
  state.view='catalog';showView();showView();
  frame();frame();
  assert.equal(trace.filter(x=>x==='products').length,2,'une seule mise à jour au retour');
});
