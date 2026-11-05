import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

// v753 : aucune liste cumulative de visuels à effacer. v779 : contrôle par empreinte de contenu
// (voir tests/visual-hashes.test.mjs), car les ETag de GitHub Pages changent à chaque mise en ligne.
test('aucune liste de visuels produits n est effacée à chaque mise à jour',()=>{
  assert.doesNotMatch(sw,/UPDATED_ITEM_VISUALS/);
  assert.doesNotMatch(sw,/www\/Items\/[^'"]+\.webp/,'aucun visuel produit ne doit être listé dans sw.js');
});

test('les vignettes produits restent en cache persistant et sont contrôlées par empreinte de contenu',()=>{
  assert.match(sw,/url\.pathname\.includes\('\/www\/Items\/'\)/);
  assert.match(sw,/const VISUAL_HASHES=\{/);
  assert.match(sw,/function serveHashedVisual\(request,expected\)/);
});
