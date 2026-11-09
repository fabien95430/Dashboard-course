import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');

test('l intégrateur insère un plat dans DISHES malgré les déclarations qui suivent le tableau',()=>{
  const python=String.raw`
import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd() / 'scripts'))
import integrate_dish

original = Path('dishes-ui.js').read_text(encoding='utf-8')
position = integrate_dish.find_dishes_insert_position(original)
assert original[position:].startswith(']);')
assert 'const DISHES=Object.freeze([' in original[:position]
assert 'window.COURSES_DISH_NAMES=' in original[position:]
assert 'const FILTERS=' in original[position:]

with_extra = original.replace('window.COURSES_DISH_NAMES=', "const EXTRA='test';\nwindow.COURSES_DISH_NAMES=", 1)
assert with_extra[integrate_dish.find_dishes_insert_position(with_extra):].startswith(']);')

integrate_dish.fail = lambda msg: (_ for _ in ()).throw(RuntimeError(msg))
try:
    integrate_dish.find_dishes_insert_position('const DISHES=Object.freeze([\n')
except RuntimeError as error:
    assert 'Fin de DISHES introuvable' in str(error)
else:
    raise AssertionError('La fermeture manquante doit être refusée')
`;
  const result=spawnSync('python3',['-c',python],{
    cwd:new URL('../',import.meta.url),encoding:'utf8'
  });
  assert.equal(result.status,0,result.stderr||result.stdout);
});

test('la structure DISHES est vérifiée avant les appels OpenAI payants',()=>{
  const script=read('scripts/integrate_dish.py');
  const main=script.slice(script.indexOf('def main() -> None:'));
  const guard=main.indexOf('find_dishes_insert_position(dishes_text)');
  const metadata=main.indexOf('metadata = infer_metadata(');
  const image=main.indexOf('image = generate_image(');
  assert.ok(guard>=0&&guard<metadata&&guard<image);
  assert.equal(script.includes('const FILTERS="'),false);
});

test('les nouvelles recettes ont une quantité par ingrédient et le fichier est versionné dans le workflow',()=>{
  const integrator=read('scripts/integrate_dish.py');
  const workflow=read('.github/workflows/integrate-dish-openai.yml');
  const quantities=read('catalog-quantities.js');
  assert.match(integrator,/def insert_dish_needs\(/);
  assert.match(integrator,/quantities_text = insert_dish_needs\(quantities_text, name, metadata\["needs"\]\)/);
  assert.ok(integrator.includes('f"./catalog-quantities.js?v={new_version}"'));
  assert.match(workflow,/git add catalog\.js catalog-quantities\.js index\.html dishes-ui\.js/);
  assert.match(quantities,/'Steak tartare':\{'Bœuf':300,'Cornichon':40,'Échalotes':50,'Moutarde':15,'Œufs':2,'Persil':8\}/);
  assert.match(read('catalog.js'),/catalog-quantities\.js\?v=822/);
});

test('les générations de plats reçoivent une vraie image de référence et un cadrage adapté aux cartes',()=>{
  const python=String.raw`
import sys,base64
from pathlib import Path
sys.path.insert(0, str(Path.cwd() / 'scripts'))
import integrate_dish as dish
calls=[]
def stub(url,payload,key,timeout=180):
    assert url.endswith('/images/edits')
    assert payload['size']=='1536x1024'
    assert payload['images'][0]['image_url'].startswith('data:image/png;base64,')
    assert '80 % centraux' in payload['prompt']
    assert 'object-fit: cover' in payload['prompt']
    calls.append(payload)
    return {'data':[{'b64_json':base64.b64encode(b'generated').decode()}]}
dish.api_json=stub
metadata={'tags':['Viandes'],'ingredients':['Bœuf','Œufs'],'description':'Steak tartare'}
for tags,child,filename in [
    (['Viandes'],False,'salade-cesar-saumon.png'),
    (['Enfants'],True,'enfant-pates-jambon.png'),
    (['Dessert'],False,'enfant-creme-brulee.png'),
]:
    metadata['tags']=tags
    assert dish.generate_image('Nouveau plat',metadata,child,'key')==b'generated'
    encoded=calls[-1]['images'][0]['image_url'].split(',',1)[1]
    assert base64.b64decode(encoded)==Path('www/Plats',filename).read_bytes()
`;
  const result=spawnSync('python3',['-c',python],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
