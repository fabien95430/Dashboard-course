import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../app-ui.js', import.meta.url), 'utf8');

test("l'écran de connexion affiche la version, hors marqueurs .page-version", () => {
  const overlay = html.slice(html.indexOf('id="securityOverlay"'));
  const tag = overlay.match(/<p id="securityVersion"[^>]*>/);
  assert.ok(tag, 'élément #securityVersion dans securityOverlay');
  assert.ok(!/page-version/.test(tag[0]));
  assert.ok(overlay.indexOf('securityVersion') > overlay.indexOf('id="securityError"'));
});

test('app-ui.js renseigne #securityVersion avec le libellé court', () => {
  assert.match(ui, /getElementById\('securityVersion'\)/);
  assert.match(ui, /loginVersion\.textContent=label/);
});
