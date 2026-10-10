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

test('le validateur contrôle la syntaxe et toute la suite sans exception',()=>{
  const script=read('scripts/validate_repo.sh');
  assert.match(script,/node --check/);
  assert.match(script,/node --test --test-reporter=tap tests\/\*\.test\.mjs/);
  assert.doesNotMatch(script,/product-images-no-atlas|# pass 2|# fail 1|image_code|not ok 3/);
});

test('les automatisations valident leur commit rebased avant tout push vers main',()=>{
  for(const path of ['.github/workflows/integrate-dish.yml','.github/workflows/integrate-dish-openai.yml']){
    const workflow=read(path);
    const pushIndex=workflow.indexOf('git push origin HEAD:main');
    assert.ok(pushIndex>=0,path+' doit publier explicitement sur main');
    const validationIndex=workflow.lastIndexOf('bash scripts/validate_repo.sh',pushIndex);
    const rebaseIndex=workflow.lastIndexOf('git rebase origin/main',pushIndex);
    assert.ok(rebaseIndex>=0,path+' doit rebaser sur main avant publication');
    assert.ok(validationIndex>rebaseIndex,path+' doit valider après le rebase et avant le push');
    assert.equal(workflow.slice(validationIndex,pushIndex).includes('|| true'),false,path+' ne doit pas ignorer un échec de validation');
  }
});
