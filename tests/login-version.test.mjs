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

test("la version de l'écran de connexion est masquée quand le clavier est ouvert", () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.security-shell\.is-keyboard-open \.security-version\{display:none\}/);
  assert.match(ui, /classList\.toggle\('is-keyboard-open',visible&&Math\.round\(window\.innerHeight\|\|0\)-available>150\)/);
  assert.doesNotMatch(css, /:focus-within \.security-version/, 'un champ actif sans clavier ne doit pas masquer la version');
});
