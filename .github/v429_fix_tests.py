from pathlib import Path


def replace_once(path, old, new):
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one stale assertion, got {count}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'tests/deferred-catalog-startup.test.mjs',
    '  assert.ok(source.includes("images.addEventListener(\'load\',loadDishAddedMarker,{once:true});"));',
    '  assert.ok(source.includes("images.addEventListener(\'load\',onDishLocalImagesReady,{once:true});"));\n'
    '  assert.match(source,/const onDishLocalImagesReady=\\(\\)=>\\{[\\s\\S]*loadDishAddedMarker\\(\\);[\\s\\S]*if\\(productImagesIdle\\)warmDishImages\\(\\);/);',
)

replace_once(
    'tests/ui-module-boundaries.test.mjs',
    "  assert.match(catalog,/images\\.addEventListener\\('load',loadDishAddedMarker,\\{once:true\\}\\)/);",
    "  assert.match(catalog,/images\\.addEventListener\\('load',onDishLocalImagesReady,\\{once:true\\}\\)/);\n"
    "  assert.match(catalog,/const onDishLocalImagesReady=\\(\\)=>\\{[\\s\\S]*loadDishAddedMarker\\(\\);[\\s\\S]*if\\(productImagesIdle\\)warmDishImages\\(\\);/);",
)
