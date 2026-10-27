import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=fs.readFileSync(new URL('../catalog-liquid.js',import.meta.url),'utf8');

test('le swipe Produits Plats suit directement le doigt et ne change le mode qu à la fin',()=>{
  const start=source.indexOf("track.addEventListener('pointermove'");
  const end=source.indexOf('const finish=',start);
  assert.ok(start>=0&&end>start,'gestionnaire pointermove introuvable');
  const pointerMove=source.slice(start,end);
  assert.doesNotMatch(pointerMove,/\.click\(\)/);
  assert.match(pointerMove,/scrub\.clientX=event\.clientX;/);
  assert.match(pointerMove,/const target=scrubTarget\(\);/);
  assert.match(pointerMove,/liquid\.x=target;/);
  assert.match(pointerMove,/liquid\.tx=target;/);
  assert.match(pointerMove,/liquid\.vx=0;/);
  assert.match(pointerMove,/paint\(\);/);
  assert.doesNotMatch(pointerMove,/start\(\)/);
  assert.match(source,/const target=moved&&!cancelled\?nearest\(\):null;/);
  assert.match(source,/track\.addEventListener\('pointerup',event=>finish\(event,false\)\)/);
});


test('un moteur commun remplace les gestions tactiles concurrentes',()=>{
  const popup=fs.readFileSync(new URL('../missing-products-dishes.js',import.meta.url),'utf8');
  const modern=fs.readFileSync(new URL('../missing-products-modern.js',import.meta.url),'utf8');
  const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(source,/window\.COURSES_SEGMENTED_LIQUID=api/);
  assert.match(source,/bindCatalog\(\)/);
  assert.match(source,/bindMissing\(\)/);
  assert.match(source,/bindSegment\(track,buttonSelector\)/);
  assert.match(modern,/catalog-liquid\.js\?v=\d+/);
  assert.doesNotMatch(modern,/liquid\.scrub|function nearest\(\)/);
  assert.match(popup,/modeSwitch\.addEventListener\('click'/);
  assert.doesNotMatch(popup,/modeSwitch\.addEventListener\('pointerdown'/);
  assert.doesNotMatch(popup,/modeSwitch\.addEventListener\('pointerup'/);
  assert.match(styles,/#missingProductsDialog \.missing-mode-lens\{[\s\S]*?height:2px!important/);
  assert.match(styles,/#preferencesDialog \.courses-error-tabs::after\{/);
});

test('clic, glissement et annulation déclenchent une seule sélection par sélecteur',()=>{
  const cls=active=>{
    const items=new Set(active?['is-active']:[]);
    return{
      contains:name=>items.has(name),
      toggle:(name,value)=>{const yes=value===undefined?!items.has(name):Boolean(value);yes?items.add(name):items.delete(name);return yes},
      remove:name=>items.delete(name)
    };
  };
  function track(selector){
    const events=new Map(),t={
      isConnected:true,dataset:{},clientLeft:0,classList:cls(false),
      style:{setProperty(){}},
      getBoundingClientRect:()=>({left:0,width:200}),
      querySelectorAll:s=>s.includes('>svg')?[]:s===selector?t.buttons:[],
      addEventListener(type,fn,capture=false){let list=events.get(type)||[];list.push({fn,capture:!!capture});events.set(type,list)},
      setPointerCapture(){},releasePointerCapture(){},
      emit(type,detail={}){
        const e={target:t,pointerId:1,isPrimary:true,button:0,clientX:0,stopped:false,
          preventDefault(){},stopImmediatePropagation(){this.stopped=true},...detail};
        const list=events.get(type)||[];
        for(const item of [...list.filter(x=>x.capture),...list.filter(x=>!x.capture)]){
          item.fn(e);if(e.stopped)break;
        }
      }
    };
    t.buttons=[0,1].map((i)=>{
      const b={classList:cls(i===0),dataset:{mode:i?'dishes':'products',missingMode:i?'dishes':'products'},
        offsetWidth:100,getBoundingClientRect:()=>({left:i*100,width:100}),
        closest:s=>s===selector?b:null,click:()=>t.emit('click',{target:b})};
      return b;
    });
    t.changes=0;
    t.addEventListener('click',e=>{
      if(!t.buttons.includes(e.target))return;
      t.buttons.forEach(b=>b.classList.toggle('is-active',b===e.target));
      t.changes++;
    });
    return t;
  }
  const catalog=track('.catalog-mode'),missing=track('.missing-mode-button'),timers=[];
  const sandbox={
    document:{readyState:'complete',querySelector:s=>s==='.catalog-mode-switch'?catalog:s==='#missingProductsDialog .missing-mode-switch'?missing:null,
      getElementById:()=>null,addEventListener(){}},
    window:{matchMedia:()=>({matches:true}),addEventListener(){}},
    navigator:{vibrate(){}},
    requestAnimationFrame:fn=>{fn(16);return 1},cancelAnimationFrame(){},setTimeout:fn=>{timers.push(fn);return 1}
  };
  runInNewContext(source,sandbox);
  const api=sandbox.window.COURSES_SEGMENTED_LIQUID;
  assert.ok(api);
  for(const t of [catalog,missing]){
    t.buttons[1].click();
    assert.ok(t.buttons[1].classList.contains('is-active'));
    const previous=t.changes;
    t.emit('pointerdown',{target:t.buttons[1],clientX:150});
    t.emit('pointermove',{target:t.buttons[1],clientX:50});
    t.emit('pointerup',{target:t.buttons[1],clientX:50});
    assert.equal(t.changes,previous+1);
    assert.ok(t.buttons[0].classList.contains('is-active'));
    t.buttons[1].click();
    assert.equal(t.changes,previous+1,'clic natif après glissement bloqué');
    timers.splice(0).forEach(fn=>fn());
    const count=t.changes;
    t.emit('pointerdown',{target:t.buttons[0],clientX:50});
    t.emit('pointermove',{target:t.buttons[0],clientX:150});
    t.emit('pointercancel',{target:t.buttons[0],clientX:150});
    assert.equal(t.changes,count);
    assert.ok(t.buttons[0].classList.contains('is-active'));
    if(t===catalog){api.bindCatalog();api.syncCatalog(false)}
    else{api.bindMissing();api.syncMissing(false)}
    assert.equal(t.changes,count,'aucun handler dupliqué à la réouverture');
  }
});

