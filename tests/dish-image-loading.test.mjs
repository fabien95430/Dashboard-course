import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('les cartes de plats conservent le chargement natif différé sans warmup forcé',()=>{
  const dishes=read('dishes-ui.js');
  const images=read('dish-local-images.js');
  assert.match(dishes,/loading="lazy" decoding="async"/);
  assert.doesNotMatch(images,/PRIMARY_DISH_VISUALS|DISH_WARMUP_BATCH_SIZE|scheduleDishVisualWarmup|warmRenderedDishCards|queueRenderedDishWarmup|requestIdleCallback|fetchPriority|loading='eager'|new Image\(\)/);
  assert.match(images,/document\.addEventListener\('courses:dishes-rendered',\(\)=>localizeCards\(document\.getElementById\('dishes'\)\)\)/);
  assert.match(images,/window\.addEventListener\('online',retryLocalImages,\{passive:true\}\)/);
});
