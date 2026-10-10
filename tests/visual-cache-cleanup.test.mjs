import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('P6 conserve un cache visuel persistant sans remigration des anciens caches',()=>{
  assert.match(sw,/const VISUAL_CACHE='courses-visuals-v2';/);
  assert.doesNotMatch(sw,/function migrateExistingVisuals|migrateExistingVisuals\(/);
  assert.match(sw,/caches\.keys\(\)[\s\S]*?key!==CACHE&&key!==VISUAL_CACHE&&key!==ERROR_INBOX_CACHE/);
  assert.match(sw,/caches\.open\(VISUAL_CACHE\)/);
});

test('les visuels critiques sont toujours seedés et les items/plats restent persistants',()=>{
  for(const asset of ['welcome-cart-transparent-v46.png','welcome-background-v40.webp','www/empty-list-premium-v4.webp'])assert.ok(sw.includes(asset),asset+' absent des visuels critiques');
  assert.match(sw,/url\.pathname\.includes\('\/www\/Plats\/'\)/);
  assert.match(sw,/url\.pathname\.includes\('\/www\/Items\/'\)/);
  assert.match(sw,/caches\.open\(CACHE\)\.then\(cache=>cache\.addAll\(SHELL\)\),\s*seedCoreVisuals\(\)/s);
});
