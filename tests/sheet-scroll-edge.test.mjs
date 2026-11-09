import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('feuilles des Réglages : les listes du bas défilent jusqu au bord de l écran',()=>{
  const css=read('styles.css');
  assert.match(css,/--sheet-bottom-inset:max\(24px,env\(safe-area-inset-bottom\)\);\s*padding:43px 21px var\(--sheet-bottom-inset\)!important;/);
  const rule=css.match(/([^{}]+)\{margin-bottom:calc\(-1 \* var\(--sheet-bottom-inset\)\)!important;padding-bottom:calc\(var\(--sheet-bottom-inset\) \+ 12px\)!important;/);
  assert.ok(rule,'règle unique de marge basse des listes absente');
  for(const selector of ['#preferencesDialog .preference-dialog-scroll','#missingProductsDialog .missing-products-list','#missingProductsDialog .catalog-remove-panel','.recipe-customization-dialog .recipe-dish-picker']){
    assert.ok(rule[1].includes(selector),selector);
  }
});

test('feuilles des Réglages : les modules ne remettent pas de marge basse concurrente sur ces listes',()=>{
  const dishes=read('dishes-ui.js');
  assert.doesNotMatch(dishes,/\.recipe-dish-picker\{[^}]*padding-bottom/);
  assert.doesNotMatch(dishes,/\.recipe-dish-picker\{[^}]*padding:0 0 calc\(env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(read('catalog-product-admin.js'),/\.catalog-remove-panel\{[^}]*padding-bottom/);
});

test('À prévoir : la liste plein écran défile jusqu au bord et garde la barre d accueil en fin de liste',()=>{
  const source=read('repurchase-soon.js');
  assert.match(source,/\.repurchase-screen\{[^}]*padding:0 18px\s*\}/);
  assert.match(source,/\.repurchase-list\{[^}]*padding:1px 1px max\(calc\(env\(safe-area-inset-bottom\) \+ 28px\),36px\)/);
});
