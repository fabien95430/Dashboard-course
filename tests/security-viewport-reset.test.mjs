import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');

test('le déverrouillage stabilise le viewport iOS sans déplacer la saisie',()=>{
  assert.match(source,/function securityViewportOffsetTop\(\)/);
  assert.match(source,/const offset=visible\?securityViewportOffsetTop\(\):0;/);
  assert.match(source,/if\(offset\)\{\s*shell\.style\.top=offset\+'px';\s*overlay\?\.style\.setProperty\('--security-viewport-offset',offset\+'px'\);/);
  // Le fond suit la même compensation que le bloc de connexion (pas de fond qui bouge sous la carte).
  assert.match(fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8'),/background-position:center calc\(50% \+ var\(--security-viewport-offset,0px\)\)!important/);
  assert.match(source,/window\.visualViewport\?\.addEventListener\('scroll',syncSecurityKeyboardState,\{passive:true\}\)/);
  assert.match(source,/document\.addEventListener\('courses:lock-changed',event=>\{/);
  assert.match(source,/if\(event\.detail\?\.locked!==false\|\|!securityViewportSession\)return;/);
  assert.match(source,/if\(isSecurityPasswordField\(document\.activeElement\)\)document\.activeElement\.blur\(\);/);
  assert.match(source,/const scrolling=document\.scrollingElement;/);
  assert.match(source,/window\.scrollTo\(0,0\)/);
  assert.doesNotMatch(source,/setInterval\(/);
});
