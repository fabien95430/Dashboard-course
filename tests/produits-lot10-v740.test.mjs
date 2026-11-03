import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const slugs = [
  'champignons-en-boite', 'concentre-de-tomate', 'mais-en-boite',
  'petits-pois-carottes', 'raviolis-en-boite', 'tomates-pelees',
  'paprika', 'mayonnaise', 'sauce-tomate', 'jus-d-ananas'
];

test('les dix produits harmonisés respectent la limite utilisateur de 15 Ko et gardent un alpha WebP', () => {
  for (const slug of slugs) {
    const bytes = readFileSync(new URL('../www/Items/' + slug + '.webp', import.meta.url));
    assert.ok(bytes.length <= 15000, slug + ': ' + bytes.length + ' octets, maximum 15000');
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', slug);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', slug);
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8X', slug);
    assert.ok(bytes[20] & 0x10, slug + ': canal alpha requis');
  }
});
