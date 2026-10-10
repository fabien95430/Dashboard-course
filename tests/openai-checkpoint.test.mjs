import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const rootPath=fileURLToPath(root);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('une relance OpenAI réutilise un checkpoint indépendant du nouvel identifiant de demande',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.match(workflow,/fingerprint=json\.dumps\(\[item_type,item_name,context\]/);
  assert.match(workflow,/checkpoint_branch='automation\/openai-checkpoint-'\+checkpoint_key/);
  assert.match(workflow,/git archive FETCH_HEAD \.courses-openai-checkpoint \| tar -x/);
  assert.match(workflow,/python3 scripts\/run_openai_integration\.py product/);
  assert.match(workflow,/python3 scripts\/run_openai_integration\.py dish/);
  assert.match(workflow,/GIT_INDEX_FILE="\$checkpoint_index" git add -f \.courses-openai-checkpoint/);
  assert.match(workflow,/git commit-tree "\$checkpoint_tree"/);
  assert.match(workflow,/git push --force origin "\$checkpoint_commit:refs\/heads\/\$branch"/);
  assert.match(workflow,/git push origin --delete "\$branch"/);
  assert.doesNotMatch(workflow,/fingerprint=.*REQUEST_ID/);
});

test('le cache OpenAI restaure le même binaire sans refaire l appel API',()=>{
  const program=String.raw`
import base64, os, sys, tempfile
from pathlib import Path
sys.path.insert(0,'scripts')
import run_openai_integration as runner

with tempfile.TemporaryDirectory() as directory:
    runner.CHECKPOINT_DIR=Path(directory)
    os.environ['COURSES_CHECKPOINT_KEY']='checkpoint-test'
    calls=[]
    payload={'data':[{'b64_json':base64.b64encode(b'RIFF1234WEBPpayload').decode('ascii')}], 'id':'image-test'}
    def first_call(*args,**kwargs):
        calls.append(1)
        return payload
    runner.ORIGINAL_API_JSON=first_call
    runner.CALL_INDEX=0
    first=runner.cached_api_json('https://api.openai.com/v1/images/generations',{},'secret')
    assert len(calls)==1
    assert first['data'][0]['b64_json']==payload['data'][0]['b64_json']
    assert any(Path(directory).glob('*-image.bin'))

    def forbidden(*args,**kwargs):
        raise AssertionError('second OpenAI call')
    runner.ORIGINAL_API_JSON=forbidden
    runner.CALL_INDEX=0
    second=runner.cached_api_json('https://api.openai.com/v1/images/generations',{},'secret')
    assert second['data'][0]['b64_json']==payload['data'][0]['b64_json']
`;
  const run=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);
});

test('une image refusée invalide seulement le visuel et conserve les réponses texte',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.match(workflow,/name: Invalider uniquement le visuel du checkpoint/);
  assert.match(workflow,/\*-image\.json/);
  assert.match(workflow,/\*-image\.bin/);
  assert.match(workflow,/id: asset/);
  assert.match(workflow,/steps\.asset\.outcome == 'failure'/);
});
