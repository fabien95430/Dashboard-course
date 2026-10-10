import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('une annulation OpenAI passe la demande à Annulé et autorise une relance',()=>{
  const fixes=read('missing-products-fixes.js');
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.match(workflow,/run-name: Courses · \${{ github\.event\.client_payload\.request_id }}/);
  assert.match(workflow,/concurrency:\s*group: courses-openai-integration\s*cancel-in-progress: false\s*queue: max/s);
  assert.match(fixes,/const STORAGE_OPENAI_REQUESTS='courses-openai-request-status-v1'/);
  assert.match(fixes,/status:'running'/);
  assert.match(fixes,/display_title\|\|''\)\.includes\(entry\.state\.requestId\)/);
  assert.match(fixes,/run\.conclusion==='cancelled'/);
  assert.match(fixes,/setRunning\(entry\.type,entry\.id,false\)/);
  assert.match(fixes,/status:'cancelled'/);
  assert.match(fixes,/const progressLabel=cancelled\?'Annulé':failed\?'Erreur':'En cours';/);
  assert.match(fixes,/if\(progress\.textContent!==progressLabel\)progress\.textContent=progressLabel;/);
  assert.match(fixes,/const retryable=cancelled\|\|failed;/);
  assert.match(fixes,/retryable\?'Relancer ce '\+noun\+' avec OpenAI'/);
  assert.match(fixes,/appNotify\('Intégration OpenAI annulée',unique\[0\]\+' peut être relancé\.'\)/);
});

test('un échec GitHub passe la demande à Erreur et libère immédiatement la relance',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/function markOpenAiFailed\(entry,conclusion='failure'\)/);
  assert.match(fixes,/openAiErrors\.add\(key\)/);
  assert.match(fixes,/status:'failed'/);
  assert.match(fixes,/run\.conclusion&&run\.conclusion!=='success'/);
  assert.match(fixes,/request\?\.status==='failed'/);
  assert.match(fixes,/failed=!added&&status==='failed'/);
  assert.match(fixes,/button\.disabled=added\|\|running\|\|openAiCooldown\.has\(key\)/);
  assert.match(fixes,/appNotify\('Intégration OpenAI échouée',unique\[0\]\+' peut être relancé\.'\)/);
});

test('une demande OpenAI orpheline ne peut plus rester bloquée indéfiniment',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/const OPENAI_STALE_RUNNING_MS=60\*60\*1000/);
  assert.match(fixes,/now-startedAt>=OPENAI_STALE_RUNNING_MS/);
  assert.match(fixes,/markOpenAiFailed\(entry,'introuvable'\)/);
});

test('la vérification des statuts reste événementielle et ne fait pas de polling permanent',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/settingsMissingProductsBtn'\)\?\.addEventListener\('click',requestOpenAiReconciliation\)/);
  assert.match(fixes,/document\.addEventListener\('visibilitychange'/);
  assert.match(fixes,/window\.addEventListener\('focus',requestOpenAiReconciliation/);
  assert.match(fixes,/OPENAI_RECONCILE_MIN_MS=15000/);
  assert.doesNotMatch(fixes,/setInterval\(/);
});

test('une relance OpenAI crée un nouvel identifiant et remplace le statut terminal',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.match(fixes,/const requestId=randomId\(\)/);
  assert.match(fixes,/setOpenAiRequestState\(type,id,\{\s*requestId,\s*status:'running'/);
  assert.match(fixes,/integrateWithOpenAi\(type,id,requestId\)/);
});
