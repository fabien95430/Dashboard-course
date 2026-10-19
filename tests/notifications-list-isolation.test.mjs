import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('les listes techniques HA ne peuvent pas remplacer Ma liste',()=>{
  assert.match(app,/entry\?\.id!=='todo\.courses_demandes'&&entry\?\.id!=='todo\.courses_notifications'/);
  assert.match(app,/s\.entity_id!=='todo\.courses_demandes'&&s\.entity_id!=='todo\.courses_notifications'/);
});
