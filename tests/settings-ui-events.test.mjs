import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('les portions de préférence passent par le propriétaire des quantités',()=>{
  const settings=read('settings-ui.js');
  const quantities=read('catalog-quantities.js');
  assert.match(settings,/const quantities=window\.COURSES_QUANTITIES/);
  assert.match(settings,/document\.addEventListener\('courses:quantities-ready',sync\)/);
  assert.match(quantities,/addSelected:addSelectedQuantities,\s*setServings,\s*bind/);
  assert.match(quantities,/new CustomEvent\('courses:quantities-ready'\)/);
});

test('l entrée Catalogue repose sur des événements propriétaires et non sur le DOM observé',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  const settings=read('settings-ui.js');
  assert.match(app,/new CustomEvent\('courses:view-changed',\{detail:\{view:state\.view\}\}\)/);
  assert.match(dishes,/new CustomEvent\('courses:catalog-mode-ready',\{detail:\{mode\}\}\)/);
  assert.match(settings,/document\.addEventListener\('courses:view-changed',sync\)/);
  assert.match(settings,/document\.addEventListener\('courses:catalog-mode-ready',sync\)/);
  assert.doesNotMatch(settings,/new MutationObserver/);
  assert.doesNotMatch(settings,/observer\.observe\(document\.body/);
});
