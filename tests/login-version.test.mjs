import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../app-ui.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

// Demande utilisateur (v915) : plus de numéro de version sur l'écran de connexion.
test("l'écran de connexion n'affiche pas de version", () => {
  const overlay = html.slice(html.indexOf('id="securityOverlay"'));
  assert.doesNotMatch(overlay.slice(0, overlay.indexOf('</section>')), /securityVersion|security-version|page-version/);
  assert.doesNotMatch(ui, /securityVersion/);
  assert.doesNotMatch(css, /security-version/);
});
