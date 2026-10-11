import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../missing-products-fixes.js',import.meta.url),'utf8');

test('le premier essai reste En cours et une relance devient Reconstruction',()=>{
  assert.match(source,/const previousRequest=openAiRequestState\(type,id\);/);
  assert.match(source,/const reconstruction=previousRequest\?\.status==='cancelled'\|\|previousRequest\?\.status==='failed';/);
  assert.match(source,/setOpenAiRequestState\(type,id,\{\s*requestId,\s*status:'running',\s*reconstruction,/);
  assert.match(source,/const reconstruction=active&&request\?\.reconstruction===true;/);
  assert.match(source,/const progressLabel=cancelled\?'Annulé':failed\?'Erreur':'En cours';/);
  assert.match(source,/if\(reconstruction&&progress\.textContent!=='Reconstruction'\)progress\.textContent='Reconstruction';/);
});
