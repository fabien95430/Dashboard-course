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
