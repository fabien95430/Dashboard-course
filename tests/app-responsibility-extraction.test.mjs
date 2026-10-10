import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('app.js');
const nav=read('bottom-nav-liquid.js');
const index=read('index.html');
const sw=read('sw.js');

test('P3 confie la navigation liquide à son module propriétaire',()=>{
  assert.match(app,/const BOTTOM_NAV=window\.COURSES_BOTTOM_NAV;/);
  assert.match(app,/BOTTOM_NAV\.bind\(next=>\{/);
  assert.match(app,/BOTTOM_NAV\.sync\(true\)/);
  assert.match(app,/BOTTOM_NAV\.shouldIgnoreClick\(\)/);
  assert.doesNotMatch(app,/const bottomNavLiquid=|function bottomNavReduced|function bindBottomNavLiquid|function paintBottomNavLiquid/);
});

test('le module de navigation reste découplé de l état métier',()=>{
  assert.match(nav,/window\.COURSES_BOTTOM_NAV=Object\.freeze\(\{bind,sync,shouldIgnoreClick\}\)/);
  assert.match(nav,/function bind\(navigate\)/);
  assert.match(nav,/onNavigate\?\.\(target\.dataset\.view\|\|'list'\)/);
  assert.doesNotMatch(nav,/\bstate\.view\b|\bshowView\s*\(|COURSES_HA_CLIENT|WebSocket|MutationObserver/);
});

test('le module est chargé avant app.js et précaché avec sa propre révision',()=>{
  const navIndex=index.indexOf('./bottom-nav-liquid.js?v=413');
  const appIndex=index.indexOf('./app.js?v=413');
  assert.ok(navIndex>=0&&appIndex>navIndex);
  assert.match(sw,/\.\/bottom-nav-liquid\.js\?v=413/);
});
