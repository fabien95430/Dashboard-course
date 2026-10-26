import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

function loadReveal(source,name){
  const start=source.indexOf('function '+name+'(image){');
  const end=source.indexOf('\n}\n',start)+2;
  assert.ok(start>=0&&end>start);
  return new Function(source.slice(start,end)+'return '+name+';')();
}
function fakeImage(complete){
  const listeners={},classes=new Set();
  return {complete,dataset:{},listeners,classes,
    classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},
    addEventListener:(type,fn)=>{listeners[type]=fn;},
    decode:()=>Promise.resolve()};
}

for(const [file,name] of [['app.js','revealProductImageWhenReady'],['dishes-ui.js','revealDishImageWhenReady']]){
  test(name+' masque une image non chargée jusqu à son décodage',async()=>{
    const reveal=loadReveal(read(file),name);
    const pending=fakeImage(false);
    reveal(pending);
    assert.ok(pending.classes.has('is-image-pending'));
    pending.listeners.load();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(pending.classes.has('is-image-pending'),false,'révélée après décodage');
    const failed=fakeImage(false);
    reveal(failed);failed.listeners.error();
    assert.equal(failed.classes.has('is-image-pending'),false,'une erreur ne laisse jamais l image cachée');
    const ready=fakeImage(true);
    reveal(ready);
    assert.equal(ready.classes.has('is-image-pending'),false,'une image déjà prête reste visible');
  });
}

test('le fondu ne vise que les grilles Produits et Plats',()=>{
  const styles=read('styles.css');
  assert.match(styles,/\.products \.premium-sprite>img\.is-image-pending,\.dish-visual img\.is-image-pending\{opacity:0!important\}/);
  assert.match(read('app.js'),/bindProductImageFallbacks\(card\);\n\s*revealProductImageWhenReady\(card\.querySelector\('\.premium-sprite>img'\)\);/);
  assert.match(read('dishes-ui.js'),/bindDishImageFallback\(cardImage\);\n\s*revealDishImageWhenReady\(cardImage\);/);
});
