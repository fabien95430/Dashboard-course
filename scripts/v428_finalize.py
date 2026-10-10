from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def once(path, old, new):
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one match, got {count}: {old[:100]!r}')
    write(path, text.replace(old, new, 1))


# Reuse the audited application patch stored in the temporary workflow file.
source = read('.github/workflows/v428-catalog-flow-work.yml')
marker = "          python <<'PY'\n"
start = source.index(marker) + len(marker)
end = source.index("\n          PY\n", start)
lines = source[start:end].splitlines()
script = '\n'.join(line[10:] if line.startswith('          ') else line for line in lines)
script = script.replace("})()'''", "})();'''", 1)
exec(compile(script, 'v428-apply.py', 'exec'), {})

# Preserve the established offline-first contract: deferred modules are precached but not executed at startup.
sw = read('sw.js')
shell = 'const SHELL=["./index.html","./styles.css?v=404","./product-item-first-paint.css?v=1","./catalog.js?v=428","./preferences-service.js?v=398","./missing-requests-store.js?v=399","./bottom-nav-liquid.js?v=414","./app.js?v=428","./settings-tab-badge.js?v=410","./settings-ui.js?v=428","./error-center.js?v=410","./dishes.css?v=3","./catalog-liquid.css?v=4","./dish-detail.css?v=6","./catalog-liquid.js?v=297","./dishes-ui.js?v=428","./catalog-quantities.js?v=426","./repurchase-soon.js?v=410","./dish-local-images.js?v=428","./app-ui.js?v=427","./runtime-features.js?v=428","./missing-products-fixes.js?v=427","./missing-products-popup-ui.js?v=410","./product-item-images.js?v=428","./catalog-product-admin.js?v=410","./purchase-intelligence.js?v=409","./missing-products-dishes.js?v=410","./missing-products-modern.js?v=410","./dish-added-marker.js?v=408","./manifest.webmanifest?v=43","./icon-premium-v40.svg","./icon.svg","./apple-touch-icon.png","./docs/guide-fonctionnement-courses.pdf?v=299"];'
sw, count = re.subn(r'const SHELL=\[[^\n]*\];', shell, sw, count=1)
if count != 1:
    raise SystemExit('sw.js SHELL replacement failed')
write('sw.js', sw)

docs = read('docs/ASSET_GRAPH.md')
docs = docs.replace(
    '`sw.js` ne précache dans `SHELL` que les ressources nécessaires au démarrage réel. Les assets Catalogue/Plats/administration différés sont mis en cache lorsqu’ils sont effectivement demandés. Une seule URL active par chemin reste autorisée dans `SHELL`.',
    '`sw.js` conserve dans `SHELL` le graphe actif nécessaire au fonctionnement hors ligne. Le précache rend les assets disponibles mais ne les exécute pas : les frontières de chargement runtime ci-dessus restent différées. Une seule URL active par chemin est autorisée dans `SHELL`.'
)
write('docs/ASSET_GRAPH.md', docs)

# Update only legacy expectations whose ownership/version contract intentionally changed.
once('tests/app-responsibility-extraction.test.mjs', "const appIndex=index.indexOf('./app.js?v=415');", "const appIndex=index.indexOf('./app.js?v=428');")
once(
    'tests/openai-products.test.mjs',
    "assert.match(images,/listItems\\?\\.querySelectorAll\\('\\.list-row\\[data-name\\]'\\)\\.forEach\\(decorateCard\\)/);",
    "assert.match(images,/listItems\\?\\.querySelectorAll\\('\\.list-row\\[data-name\\]'\\)\\.forEach\\(card=>decorateCard\\(card,true\\)\\)/);"
)
once(
    'tests/product-images-no-atlas.test.mjs',
    "assert.ok(app.includes(`loading=\"eager\" fetchpriority=\"'+(compact?'high':'auto')+'\"`));",
    "assert.ok(app.includes(`loading=\"'+(compact?'eager':'lazy')+'\" fetchpriority=\"'+(compact?'high':'auto')+'\"`));"
)

write('tests/settings-ui-events.test.mjs', r"""import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('les portions de préférence passent par le propriétaire des quantités',()=>{
  const settings=read('settings-ui.js');
  const quantities=read('catalog-quantities.js');
  assert.match(settings,/const quantities=window\.COURSES_QUANTITIES/);
  assert.match(settings,/document\.addEventListener\('courses:quantities-ready',sync\)/);
  assert.match(quantities,/addSelected:addSelectedQuantities,\s*setServings,\s*bind/);
  assert.match(quantities,/new CustomEvent\('courses:quantities-ready'\)/);
});

test('l entrée Catalogue a un propriétaire unique et reste événementielle',()=>{
  const app=read('app.js');
  const dishes=read('dishes-ui.js');
  const settings=read('settings-ui.js');
  assert.match(app,/new CustomEvent\('courses:view-changed',\{detail:\{view:state\.view\}\}\)/);
  assert.match(dishes,/new CustomEvent\('courses:catalog-mode-ready',\{detail:\{mode\}\}\)/);
  assert.match(dishes,/document\.addEventListener\('courses:view-changed',event=>\{/);
  assert.match(dishes,/view==='catalog'&&mode!=='products'/);
  assert.match(dishes,/setMode\('products'\)/);
  assert.doesNotMatch(settings,/courses:catalog-mode-ready|applyPreferredCatalogMode|bindCatalogEntry/);
  assert.doesNotMatch(settings,/new MutationObserver/);
  assert.doesNotMatch(settings,/observer\.observe\(document\.body/);
});
""")

once(
    'tests/ui-module-boundaries.test.mjs',
    "assert.match(catalog,/liquid\\.addEventListener\\('load',markProductCatalogReady,\\{once:true\\}\\)/);",
    "assert.match(catalog,/liquid\\.addEventListener\\('load',loadDishLocalImages,\\{once:true\\}\\)/);"
)
once(
    'tests/ui-module-boundaries.test.mjs',
    "assert.match(catalog,/startProductCatalog\\(\\);\\s*startDishFeatures\\(\\);/);",
    "assert.match(catalog,/const startCatalogView=\\(\\)=>\\{[\\s\\S]*startProductCatalog\\(\\);[\\s\\S]*loadRepurchaseSoon\\(\\);[\\s\\S]*startDishFeatures\\(\\);/);"
)
once(
    'tests/ui-module-boundaries.test.mjs',
    "assert.match(catalog,/images\\.addEventListener\\('load',loadRepurchaseSoon,\\{once:true\\}\\)/);",
    "assert.match(catalog,/images\\.addEventListener\\('load',loadDishAddedMarker,\\{once:true\\}\\)/);"
)

path = 'tests/deferred-catalog-startup.test.mjs'
text = read(path)
start = text.index("test('le Service Worker ne précache plus les fonctions Catalogue différées'")
end = text.index('\n});', start) + 4
replacement = r"""test('le précache hors ligne conserve les fonctions différées sans les exécuter au démarrage',()=>{
  const shell=sw.match(/const SHELL=(\[[^\n]+\]);/)?.[1]||'';
  assert.ok(shell);
  for(const deferred of ['dishes-ui.js?v=428','catalog-quantities.js?v=426','catalog-liquid.js?v=297','dish-local-images.js?v=428','dish-added-marker.js?v=408','repurchase-soon.js?v=410','catalog-product-admin.js?v=410'])assert.ok(shell.includes(deferred),deferred+' absent du précache hors ligne');
  for(const startup of ['catalog.js?v=428','app.js?v=428','settings-ui.js?v=428','runtime-features.js?v=428','product-item-images.js?v=428'])assert.ok(shell.includes(startup),startup+' absent du shell');
});"""
write(path, text[:start] + replacement + text[end:])
