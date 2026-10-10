import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('la CI permanente valide main et les pull requests en lecture seule',()=>{
  const workflow=read('.github/workflows/validate.yml');
  assert.match(workflow,/name:\s*validation/);
  assert.match(workflow,/push:\s*\n\s*branches:\s*\[main\]/);
  assert.match(workflow,/pull_request:/);
  assert.match(workflow,/workflow_dispatch:/);
  assert.match(workflow,/permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow,/contents:\s*write/);
  assert.match(workflow,/node-version:\s*24/);
  assert.match(workflow,/bash scripts\/validate_repo\.sh/);
});

test('le validateur contrôle la syntaxe et toute la suite sans masquer la dette images',()=>{
  const script=read('scripts/validate_repo.sh');
  assert.match(script,/node --check/);
  assert.match(script,/tests\/\*\.test\.mjs/);
  assert.match(script,/product-images-no-atlas\.test\.mjs/);
  assert.match(script,/# pass 2/);
  assert.match(script,/# fail 1/);
  assert.match(script,/not ok 3 - Ma liste et la fiche plat demandent directement leurs WebP sans délai artificiel/);
  assert.match(script,/if \[\[ "\$image_code" -ne 0 \]\]; then/);
});
