import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

// Comportement d'avant v714 rétabli en v753 : aucune liste cumulative de visuels à effacer.
// Chaque vignette est revérifiée une fois par version (304 si inchangée) au lieu d'être re-téléchargée.
test('aucune liste de visuels produits n est effacée à chaque mise à jour',()=>{
  assert.doesNotMatch(sw,/UPDATED_ITEM_VISUALS/);
  assert.doesNotMatch(sw,/www\/Items\/[^'"]+\.webp/,'aucun visuel produit ne doit être listé dans sw.js');
});

test('les vignettes produits restent en cache persistant et sont revalidées conditionnellement',()=>{
  assert.match(sw,/url\.pathname\.includes\('\/www\/Items\/'\)/);
  assert.match(sw,/If-None-Match/);
  assert.match(sw,/If-Modified-Since/);
  assert.match(sw,/hit\?\.headers\?\.get\(VISUAL_REFRESH_MARK\)===CACHE/);
});
