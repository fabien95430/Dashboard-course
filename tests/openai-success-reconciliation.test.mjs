import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../missing-products-fixes.js',import.meta.url),'utf8');

test('une intégration OpenAI réussie quitte immédiatement l état en cours',()=>{
  assert.match(source,/function markOpenAiSucceeded\(entry\)\{/);
  assert.match(source,/function markOpenAiSucceeded\(entry\)\{[\s\S]*?setRunning\(entry\.type,entry\.id,false\);[\s\S]*?setOpenAiRequestState\(entry\.type,entry\.id,null\);[\s\S]*?return true;/);
  assert.match(source,/if\(run\.conclusion==='success'\)\{[\s\S]*?markOpenAiSucceeded\(entry\)/);
  assert.match(source,/if\(!succeeded\.length&&!cancelled\.length&&!failed\.length\)return false;[\s\S]*?decorateOpenAiButtons\(\)/);
});
