import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('une annulation OpenAI passe la demande à Annulé et autorise une relance',()=>{
  const fixes=read('missing-products-fixes.js');
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.match(workflow,/run-name: OpenAI · \$\{\{ github\.event\.client_payload\.request_id \}\}/);
  assert.match(workflow,/concurrency:\s*group: courses-openai-integration\s*cancel-in-progress: false\s*queue: max/s);
  assert.match(fixes,/const STORAGE_OPENAI_REQUESTS='courses-openai-request-status-v1'/);
  assert.match(fixes,/status:'running'/);
  assert.match(fixes,/display_title\|\|'\'\)\.includes\(entry\.state\.requestId\)/);
  assert.match(fixes,/run\?\.status!=='completed'\|\|run\?\.conclusion!=='cancelled'/);
  assert.match(fixes,/setRunning\(entry\.type,entry\.id,false\)/);
  assert.match(fixes,/status:'cancelled'/);
  assert.match(fixes,/if\(cancelled\)progress\.textContent='Annulé'/);
  assert.match(fixes,/cancelled\?'Relancer ce '\+noun\+' avec OpenAI'/);
  assert.match(fixes,/appNotify\('Intégration OpenAI annulée',unique\[0\]\+' peut être relancé\.'\)/);
});

test('la vérification des annulations reste événementielle et ne fait pas de polling permanent',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/settingsMissingProductsBtn'\)\?\.addEventListener\('click',requestOpenAiReconciliation\)/);
  assert.match(fixes,/document\.addEventListener\('visibilitychange'/);
  assert.match(fixes,/window\.addEventListener\('focus',requestOpenAiReconciliation/);
  assert.match(fixes,/OPENAI_RECONCILE_MIN_MS=15000/);
  assert.doesNotMatch(fixes,/setInterval\(/);
});

test('une relance OpenAI crée un nouvel identifiant et remplace le statut annulé',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/const requestId=randomId\(\)/);
  assert.match(fixes,/setOpenAiRequestState\(type,id,\{\s*requestId,\s*status:'running'/);
  assert.match(fixes,/integrateWithOpenAi\(type,id,requestId\)/);
});
