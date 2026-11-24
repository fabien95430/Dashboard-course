import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('le nom de produit du catalogue ne coupe pas les jambages (g, p, y)', () => {
  const base = css.match(/\n\.pname\{([^}]*)\}/)[1];
  assert.ok(parseFloat(base.match(/line-height:([\d.]+)/)[1]) >= 1.2);
  assert.match(base, /padding:0 2px 2px/);
  const mobile = css.match(/\n\s+\.product \.pname\{([^}]*)\}/)[1];
  assert.ok(parseFloat(mobile.match(/line-height:([\d.]+)/)[1]) >= 1.3);
});
