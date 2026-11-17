import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('version famille : scripts Supabase versionnés dans l’ordre, sans clé secrète',()=>{
  const sql=['01','02','03','04'].map(n=>read('supabase/'+n+'-famille.sql'));
  assert.match(sql[0],/enable row level security/);
  assert.match(sql[0],/function public\.ping\(\)/);
  assert.match(sql[1],/statut in \('en_attente','integre','refuse'\)/);
  assert.match(sql[2],/add column if not exists ordre integer/);
  assert.match(sql[3],/function public\.familles\(\)/);
  assert.match(sql[3],/where public\.is_admin\(\)/);
  for(const text of sql)assert.doesNotMatch(text,/service_role|sb_secret_/);
});

test('version famille : keepalive Supabase en lecture seule, clé publishable uniquement',()=>{
  const workflow=read('.github/workflows/supabase-keepalive.yml');
  assert.match(workflow,/cron:/);
  assert.match(workflow,/rpc\/ping/);
  assert.match(workflow,/permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow,/contents:\s*write|service_role|sb_secret_|secrets\./);
});
