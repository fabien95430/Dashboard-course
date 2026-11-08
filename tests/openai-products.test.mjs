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
assert 'maximum 15 000 octets' in requests[0]['prompt']
assert 'Sous-groupe' not in requests[0]['prompt']
assert 'Règle de sous-catégorie' in requests[0]['prompt']
assert 'Sodas & sirops' in requests[0]['prompt']
assert 'fond totalement transparent' in requests[0]['prompt']
assert 'GABARIT INVARIABLE' in requests[0]['prompt']
assert 'www/Items/mayonnaise.webp' not in requests[0]['prompt']
assert 'www/Items/paprika.webp' not in requests[0]['prompt']
assert 'Céréales Lion' not in requests[0]['prompt']
assert 'même si le fichier doit être plus lourd' not in requests[0]['prompt']
assert 'le conditionnement demandé et la transparence du fond' in requests[0]['prompt']
`;
  const run=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);
});

test('les produits lourds sont réencodés via libwebp sans nouveau paquet ni appel API',()=>{
  const script=read('scripts/integrate_product_openai.py');
  const validator=read('scripts/validate_generated_asset.py');
  assert.match(script,/def optimize_product_webp\(/);
  assert.match(script,/lib\.WebPDecodeRGBA/);
  assert.match(script,/lib\.WebPEncodeRGBA/);
  assert.match(script,/return optimize_product_webp\(image\)/);
  assert.match(validator,/allowed_dimensions=\{\(816,816\)/);
  const program=String.raw`
import sys
from pathlib import Path
sys.path.insert(0,'scripts')
import integrate_product_openai as product
from validate_generated_asset import webp_dimensions
source=Path('www/Items/cereales-lion.webp').read_bytes()
assert source[:4]==b'RIFF' and len(source)<15000
assert product.optimize_product_webp(source)==source
heavy=source+b'0'*20000
result=product.optimize_product_webp(heavy)
assert result[:4]==b'RIFF' and result[8:12]==b'WEBP'
assert len(result)<=15000
assert webp_dimensions(result) in ((816,816),(512,512),(384,384),(320,320),(256,256))
assert result[12:16]==b'VP8X' and result[20]&0x10
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
assert validate.PRODUCT_IMAGE_MAX_BYTES==15_000
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


test('les 41 sous-catégories utilisent des règles actives ciblées et les références réellement validées',()=>{
  const program=String.raw`
import json, re, sys
from pathlib import Path
sys.path.insert(0, 'scripts')
import integrate_product_openai as product
_,_,groups=product.load_groups()
keys={f"{c} / {s}" for c,sub in groups.items() for s in sub}
assert len(keys)==41
assert keys==set(product.SUBGROUP_VISUAL_GUIDANCE), (keys-set(product.SUBGROUP_VISUAL_GUIDANCE),set(product.SUBGROUP_VISUAL_GUIDANCE)-keys)
for c,subgroups in groups.items():
    for subgroup in subgroups:
        prompt=product.image_prompt('Produit fictif',c,subgroup)
        assert product.SUBGROUP_VISUAL_GUIDANCE[f"{c} / {subgroup}"] in prompt
        assert 'maximum 15 000 octets' in prompt
def p(name,c,sub):
    return product.image_prompt(name,c,sub)
tresor=p('Céréales Trésor','Petit-déj & snacks','Petit-déjeuner')
assert 'www/Items/cereales-lion.webp' in tresor and 'BLÉ DORÉ CLAIR' in tresor
assert 'GABARIT VISUEL INVARIABLE' in tresor
assert 'même fenêtre arrondie basse' in tresor
assert 'pas de carton plus étroit' in tresor
assert 'SEUL CHANGEMENT AUTORISÉ' in tresor
assert 'www/Items/cereales-lion.webp' not in p('Jus de poire','Boissons','Eaux & jus')
assert 'fenêtre' in tresor and 'vague bleue' in tresor
lion=p('Céréales Lion','Petit-déj & snacks','Petit-déjeuner')
assert 'triangulaires' in lion and 'www/Items/cereales-lion.webp' in lion
assert 'BLÉ DORÉ CLAIR' not in lion
jus=p('Jus de poire','Boissons','Eaux & jus')
assert 'v783' in jus and 'www/Items/jus-d-orange.webp' in jus and '~2,6' in jus
assert 'www/Items/biere-blonde.webp' not in jus
beer=p('Bière blonde','Boissons','Bières & vins')
assert 'v780' in beer and '33 cl' in beer and 'SANS TEXTE' not in beer
zero=p('Bière sans alcool','Boissons','Bières & vins')
assert 'BIÈRE 0 %' in zero and 'www/Items/biere-blonde.webp' not in zero
whisky=p('Whisky','Boissons','Bières & vins')
assert 'v785' in whisky and 'bouchon noir' in whisky and 'UNIQUEMENT WHISKY' in whisky
assert 'bouchon de liège v780' in whisky
for n,rule in [('Rhum','UNIQUEMENT RHUM'),('Ricard','UNIQUEMENT RICARD'),('Tonic','UNIQUEMENT TONIC')]:
    assert rule in p(n,'Boissons','Bières & vins' if n!='Tonic' else 'Sodas & sirops')
dry=p('Noix de pécan','Petit-déj & snacks','Apéritif')
assert 'www/Items/dattes.webp v778' in dry and 'Aucun mot' in dry
assert 'bocaux de noix v774' not in dry
plain=p('Noix','Fruits & Légumes','Pommes de terre & aromates')
assert 'www/Items/dattes.webp' not in plain
sauce=p('Sauce au poivre','Épicerie','Sauces & condiments')
assert 'www/Items/mayonnaise.webp' in sauce and 'SANS TEXTE NI PICTOGRAMME' in sauce
spice=p('Paprika','Épicerie','Monde & pratique')
assert 'www/Items/paprika.webp' in spice and 'www/Items/mayonnaise.webp' not in spice
cream=p('Crème fraîche','Frais','Laits & crèmes')
assert 'Pot de crème fraîche fermé' in cream and 'www/Items/mayonnaise.webp' not in cream
assert 'opercule SOUPLE CARRÉ' in p('Yaourts vanille','Frais','Yaourts & desserts')
assert 'couvercle ROND' in p('Skyr','Frais','Yaourts & desserts')
assert 'jamais poisson entier' in p('Truite','Viandes & poissons','Poissons & traiteur')
assert 'www/Items/mayonnaise.webp' not in p('Tomate cerise','Fruits & Légumes','Légumes du quotidien')
`;
  const result=spawnSync('python3',['-c',program],{cwd:rootPath,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
