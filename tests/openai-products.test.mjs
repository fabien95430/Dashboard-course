import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const rootPath=fileURLToPath(root);
const read=file=>readFileSync(new URL(file,root),'utf8');

test('un produit manquant utilise le même déclencheur OpenAI et le même relais Home Assistant qu’un plat',()=>{
  const fixes=read('missing-products-fixes.js');
  const popup=read('missing-products-popup-ui.js');
  assert.match(fixes,/const PRODUCT_PREFIX='__courses_product__:'/);
  assert.match(fixes,/\[data-openai-missing-product\],\[data-openai-missing-dish\]/);
  assert.match(fixes,/haCallService\('rest_command','courses_integrate_dish_openai'/);
  assert.match(fixes,/dish_name:\(type==='product'\?PRODUCT_PREFIX:''\)\+String\(item\.name/);
  assert.match(popup,/Intégrer avec OpenAI/);
  assert.match(popup,/\[data-openai-missing-product\],\[data-openai-missing-dish\]/);
});

test('le lancement OpenAI reste visible dans le popup et notifie Courses immédiatement',()=>{
  const fixes=read('missing-products-fixes.js');
  assert.ok(fixes.includes("const progressLabel=cancelled?'Annulé':failed?'Erreur':'En cours';"));
  assert.ok(fixes.includes('if(progress.textContent!==progressLabel)progress.textContent=progressLabel;'));
  assert.ok(fixes.includes('const openAiErrors=new Set();'));
  assert.ok(fixes.includes('.missing-dish-progress.is-error'));
  assert.match(fixes,/courses-openai-feedback/);
  assert.match(fixes,/registration\.showNotification\('Demande envoyée'/);
  assert.match(fixes,/est en cours de génération\./);
  assert.match(fixes,/void notifyIntegrationStarted\(type,item,serviceData\.request_id\)/);
});

test('le workflow OpenAI route les produits vers une intégration WebP avec notification Web Push',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  const runner=read('scripts/run_openai_integration.py');
  const script=read('scripts/integrate_product_openai.py');
  assert.match(workflow,/python3 scripts\/run_openai_integration\.py product/);
  assert.match(runner,/import integrate_product_openai as product/);
  assert.match(runner,/product\.main\(\)/);
  assert.match(workflow,/www\/Items\/\$\{\{ steps\.result\.outputs\.filename \}\}/);
  assert.match(workflow,/git add catalog\.js app\.js catalog-quantities\.js index\.html product-item-images\.js dish-local-images\.js sw\.js/);
  assert.match(workflow,/node scripts\/send_web_push\.mjs/);
  assert.match(script,/"output_format":"webp"/);
  assert.match(script,/"background":"transparent"/);
  assert.match(script,/ROOT \/ "www" \/ "Items" \/ filename/);
  assert.match(script,/ROOT \/ "catalog\.js"/);
});

test('les visuels produits OpenAI sont générés au plus petit carré valide et pensés pour une vignette 192 px',()=>{
  const script=read('scripts/integrate_product_openai.py');
  const validator=read('scripts/validate_generated_asset.py');
  assert.match(script,/PRODUCT_IMAGE_SIZE = "816x816"/);
  assert.match(script,/"size":PRODUCT_IMAGE_SIZE/);
  assert.match(script,/cible d'affichage finale de 192×192 px/);
  assert.match(script,/Éviter les micro-détails/);
  assert.match(script,/textures photographiques complexes/);
  assert.match(validator,/expected=\(816,816\)/);
  assert.doesNotMatch(script,/"size":"1024x1024"/);
});

test('le classement OpenAI reçoit tout le catalogue et peut créer une sous-catégorie',()=>{
  const script=read('scripts/integrate_product_openai.py');
  assert.doesNotMatch(script,/list\(names\)\[:8\]/);
  assert.match(script,/category:\{subgroup:list\(names\) for subgroup,names in subgroups\.items\(\)\}/);
  assert.match(script,/"category", "subgroup", "create_subgroup" et "display_mode"/);
  assert.match(script,/display_mode not in DISPLAY_MODES/);
  assert.match(script,/groups\[category\]\[subgroup\]\.sort\(key=base\.normalize\)/);
  assert.match(script,/update_display_mode\(name,display_mode\)/);
  assert.match(script,/def display_mode_from_hint\(value: str\) -> str:/);
  assert.match(script,/result\["display_mode"\]=explicit_mode/);
  assert.match(script,/ensure_shell_assets\(sw_text,\[/);
  assert.match(script,/if not isinstance\(create_value,bool\)/);
  assert.match(script,/if create_subgroup:/);
  assert.match(script,/groups\[category\]\[subgroup\]=\[\]/);
  assert.match(script,/created_subgroup/);
});

test('un sous-groupe inventé est reclassé parmi les sous-catégories existantes',()=>{
  const program=String.raw`
import json, sys
sys.path.insert(0,'scripts')
import integrate_product_openai as product
responses=[
    {'category':'Apéritif & snacks','subgroup':'Chocolats','create_subgroup':False,'display_mode':'Paquet'},
    {'category':'Apéritif & snacks','subgroup':'Biscuits & goûters','create_subgroup':False,'display_mode':'Paquet'},
]
calls=[]
def fake_api_json(*args,**kwargs):
    calls.append(1)
    return responses.pop(0)
product.base.api_json=fake_api_json
product.base.response_text=lambda payload: json.dumps(payload,ensure_ascii=False)
product.base.parse_json_object=lambda text: json.loads(text)
groups={'Apéritif & snacks':{'Apéritif':['Chips'],'Biscuits & goûters':['Cookies']}}
result=product.infer_location('Kinder Maxi','Apéritif & snacks',groups,'Kinder maxi - boîte','test-key')
assert result==('Apéritif & snacks','Biscuits & goûters',False,'Boîte'), result
assert len(calls)==2, calls
`;
  const run=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);
});

test('les données Web Push sont masquées avant les actions du workflow',()=>{
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  assert.doesNotMatch(workflow,/PUSH_ENDPOINT:\s*\$\{\{ github\.event\.client_payload\.push_endpoint \}\}/);
  assert.doesNotMatch(workflow,/PUSH_P256DH:\s*\$\{\{ github\.event\.client_payload\.push_p256dh \}\}/);
  assert.doesNotMatch(workflow,/PUSH_AUTH:\s*\$\{\{ github\.event\.client_payload\.push_auth \}\}/);
  assert.doesNotMatch(workflow,/PUSH_PUBLIC_KEY:\s*\$\{\{ github\.event\.client_payload\.push_public_key \}\}/);
  assert.match(workflow,/name: Masquer la souscription Web Push/);
  assert.match(workflow,/GITHUB_EVENT_PATH/);
  assert.match(workflow,/::add-mask::/);
  assert.match(workflow,/GITHUB_ENV/);
  assert.ok(workflow.indexOf('Masquer la souscription Web Push')<workflow.indexOf('Récupérer main'));
});

test('une nouvelle tuile produit peut être remplacée par son image unitaire',()=>{
  const images=read('product-item-images.js');
  assert.match(images,/card\.querySelector\('\.product-svg'\)/);
  assert.match(images,/fallback\.replaceWith\(sprite\)/);
  assert.match(images,/const compact=fallback\.classList\.contains\('is-compact'\)/);
  assert.match(images,/sprite\.className='premium-sprite is-single-product-image'\+\(compact\?' is-compact':''\)/);
  assert.match(images,/getImageData\(0,0,size,size\)/);
  assert.match(images,/--single-product-scale/);
  assert.match(images,/\.90\/Math\.max\(\.01,occupancy\)/);
});

test('Ma liste reprend la même image unitaire que le Catalogue sans atlas de secours',()=>{
  const images=read('product-item-images.js');
  const app=read('app.js');
  assert.match(images,/listItems=document\.getElementById\('listItems'\)/);
  assert.match(images,/listItems\?\.querySelectorAll\('\.list-row\[data-name\]'\)\.forEach\(card=>decorateCard\(card,true\)\)/);
  assert.match(images,/document\.addEventListener\('courses:list-rendered',scheduleDecorateList\)/);
  assert.doesNotMatch(images,/restoreAtlas|singleProductAtlasSource/);
  assert.match(app,/const productImageSource=name=>'\.\/www\/Items\/'\+productSlug\(name\)\+'\.webp'/);
  assert.match(app,/bindProductImageFallbacks\(el\)/);
});


test('la génération produit fixe la compression WebP tout en conservant le cadrage et la transparence',()=>{
  const script=read('scripts/integrate_product_openai.py');
  assert.match(script,/PRODUCT_IMAGE_COMPRESSION = 75/);
  assert.match(script,/"output_compression":PRODUCT_IMAGE_COMPRESSION/);
  const program=String.raw`
import base64, sys
sys.path.insert(0, 'scripts')
import integrate_product_openai as product
requests=[]
def fake_api(url, payload, key, **kwargs):
    requests.append(payload)
    return {'data':[{'b64_json':base64.b64encode(b'RIFF1234WEBPpayload').decode()}]}
product.base.api_json=fake_api
result=product.generate_image('Produit test','Boissons','Sodas & sirops','','secret')
assert result.startswith(b'RIFF')
assert len(requests)==1
assert requests[0]['output_format']=='webp'
assert requests[0]['background']=='transparent'
assert requests[0]['size']=='816x816'
assert requests[0]['quality']=='high'
assert requests[0]['output_compression']==75
assert 'compresse efficacement en WebP' in requests[0]['prompt']
`;
  const run=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);
});

test('la validation refuse un WebP produit trop lourd sans modifier le contrôle des plats',()=>{
  const program=String.raw`
import json, sys, tempfile
from pathlib import Path
sys.path.insert(0,'scripts')
import validate_generated_asset as validate
assert validate.PRODUCT_IMAGE_MAX_BYTES==100*1024
with tempfile.TemporaryDirectory() as folder:
    validate.ROOT=Path(folder)
    validate.RESULT_PATH=Path(folder)/'.courses-dish-result.json'
    path=Path(folder)/'www'/'Items'/'produit-test.webp'
    path.parent.mkdir(parents=True)
    validate.RESULT_PATH.write_text(json.dumps({'ok':True,'filename':path.name}))
    # WebP VP8X 816x816, dimensions conformes : on teste exclusivement le poids.
    dimension=(816-1).to_bytes(3,'little')
    webp=b'RIFF'+bytes(4)+b'WEBP'+b'VP8X'+(10).to_bytes(4,'little')+bytes(4)+dimension+dimension
    sys.argv=['validate_generated_asset.py','product']
    path.write_bytes(webp+b'0'*(validate.PRODUCT_IMAGE_MAX_BYTES-len(webp)))
    validate.main()
    path.write_bytes(webp+b'0'*(validate.PRODUCT_IMAGE_MAX_BYTES+1-len(webp)))
    try:
        validate.main()
    except RuntimeError as error:
        assert 'trop lourd' in str(error), error
    else:
        raise AssertionError('Le WebP trop lourd est accepté')
    assert json.loads(validate.RESULT_PATH.read_text())['ok'] is False
`;
  const run=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);
});
