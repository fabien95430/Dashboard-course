import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const nav=readFileSync(new URL('../bottom-nav-liquid.js',import.meta.url),'utf8');
const images=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');

function harness(gridReady){
  const start=app.indexOf("let publishedView='';");
  const end=app.indexOf('function renderView(){',start);
  assert.ok(start>=0&&end>start);
  const trace=[],frames=new Map(),settles=new Set(),state={view:'list'};
  let counter=0;
  const raf=fn=>{const id=++counter;frames.set(id,fn);return id;};
  const caf=id=>frames.delete(id);
  const frame=()=>{const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());};
  const settle=()=>{const queued=[...settles];settles.clear();queued.forEach(fn=>fn());};
  const tabs=['list','catalog','settings'].map(view=>({dataset:{view},classList:{toggle(){}}}));
  const elements=Object.fromEntries(['catalogView','listView','settingsView']
    .map(name=>['#'+name,{classList:{toggle(){}}}]));
  const document={
    querySelectorAll:()=>tabs,
    dispatchEvent:event=>trace.push('event:'+event.detail.view)
  };
  const Event=class{constructor(type,options){this.type=type;this.detail=options.detail;}};
  const BOTTOM_NAV={
    sync:()=>trace.push('nav'),
    afterSettle:fn=>{settles.add(fn);return ()=>settles.delete(fn);}
  };
  const factory=new Function('state','$','document','BOTTOM_NAV','requestAnimationFrame',
    'cancelAnimationFrame','renderCategories','renderProducts',
    'CustomEvent','productGridReady','closeListRowMenu',app.slice(start,end)+'return showView;');
  const showView=factory(state,selector=>elements[selector],document,BOTTOM_NAV,raf,caf,
    ()=>trace.push('categories'),()=>trace.push('products'),Event,gridReady,()=>{});
  showView();
  trace.length=0;
  return {state,trace,showView,frame,settle};
}

test('premier Catalogue : rendu après deux frames, jamais sur un onglet quitté',()=>{
  const {state,trace,showView,frame}=harness(false);
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
});

test('grille déjà construite : mise à jour seulement après l arrivée de la pastille',()=>{
  const {state,trace,showView,frame,settle}=harness(true);
  state.view='catalog';showView();
  assert.ok(trace.indexOf('nav')>=0&&trace.indexOf('nav')<trace.indexOf('categories'));
  frame();frame();frame();
  assert.equal(trace.includes('products'),false,'aucun rendu lourd pendant la course de la pastille');
  settle();
  assert.equal(trace.filter(x=>x==='products').length,1);
  state.view='list';showView();
  state.view='catalog';showView();
  state.view='list';showView();
  settle();
  assert.equal(trace.filter(x=>x==='products').length,1,'aucun rendu sur un onglet quitté');
  state.view='catalog';showView();showView();
  settle();
  assert.equal(trace.filter(x=>x==='products').length,2,'une seule mise à jour au retour');
});

test('la navigation libère les travaux différés à l arrêt de la pastille',()=>{
  assert.match(nav,/function afterSettle\(callback\)/);
  assert.match(nav,/markUnder\(true\);\n\s*flushSettled\(\);\n\s*return;\n\s*\}\n\s*state\.frame=requestAnimationFrame\(step\)/);
  assert.match(nav,/settleTimer=setTimeout\(flushSettled,\d+\)/,'un filet de sécurité libère toujours les travaux');
  assert.match(images,/nav\.afterSettle\(scheduleDecorateProducts\)/);
});

test('le Catalogue masqué garde sa mise en page sans être affiché ni cliquable',()=>{
  const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(styles,/\.app>\.view\{grid-row:1;grid-column:1\}/,'les vues partagent la même cellule');
  const rule=styles.match(/@supports \(content-visibility:hidden\)\{\s*\.app>#catalogView:not\(\.is-active\)\{([^}]*)\}/)?.[1]||'';
  assert.match(rule,/display:grid/);
  assert.match(rule,/content-visibility:hidden/);
  assert.match(rule,/visibility:hidden/);
  assert.match(rule,/pointer-events:none/);
});
