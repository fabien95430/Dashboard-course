import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('ouverture : animation de chargement par défaut, jamais le formulaire avant le choix de l’écran',()=>{
  const index=read('index.html');
  assert.match(index,/class="modal security-modal is-resuming"/);
  assert.match(index,/class="security-loading" role="status" aria-label="Ouverture de votre liste"/);
  const css=read('styles.css');
  assert.match(css,/\.security-modal\.is-resuming \.password-panel,\.security-modal\.is-resuming \.setup-error\{display:none\}/);
  assert.match(css,/\.security-modal\.is-resuming \.security-loading\{/);
});

test('ouverture : le formulaire revient dès qu’un écran de sécurité est affiché ou masqué',()=>{
  const app=read('app.js');
  assert.match(app,/function showSecurity\(mode,message=''\)\{[\s\S]*?\$\('\.security-modal'\)\.classList\.remove\('is-resuming'\);/);
  assert.match(app,/function hideSecurity\(\)\{[\s\S]*?\$\('\.security-modal'\)\.classList\.remove\('is-resuming'\);/);
});

test('compte famille repris : durée minimale puis arrivée animée de Ma liste',()=>{
  const app=read('app.js');
  assert.match(app,/const FAMILY_RESUME_MIN_MS=\d+;/);
  assert.match(app,/const info=await window\.COURSES_FAMILY\.resume\(\);[\s\S]*?FAMILY_RESUME_MIN_MS[\s\S]*?enterFamilyMode\(info\);[\s\S]*?classList\.add\('is-arriving'\)/);
});
