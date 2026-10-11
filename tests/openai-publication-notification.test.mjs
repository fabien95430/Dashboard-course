import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../scripts/send_web_push.mjs',import.meta.url),'utf8');

test('un blocage de publication est distingué d un échec de génération OpenAI',()=>{
  assert.match(source,/const publicationBlocked=!success&&!deleteProduct&&stage==='deployment'/);
  assert.ok(source.includes("publicationBlocked?'Publication bloquée':'Courses'"));
  assert.ok(source.includes('`${itemName} est prêt, mais sa publication a été bloquée.`'));
});
