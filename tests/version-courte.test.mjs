import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const ui=readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('le badge affiche une version courte sans changer le numéro interne',()=>{
  const source=ui.match(/function shortVersionLabel\(version\)\{[\s\S]*?\n\}/)?.[0];
  assert.ok(source,'shortVersionLabel introuvable');
  const shortVersionLabel=new Function(source+';return shortVersionLabel;')();
  assert.equal(shortVersionLabel('v755'),'v7.55');
  assert.equal(shortVersionLabel('v800'),'v8.00');
  assert.equal(shortVersionLabel('v1003'),'v10.03');
  assert.equal(shortVersionLabel('v61'),'v61');
  assert.match(ui,/badge\.textContent=APP_VERSION/);
  assert.match(styles,/\.page-version\[data-label\]::after\{content:attr\(data-label\)/);
});
