#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import html
import json
import re
import unicodedata

ROOT=Path(__file__).resolve().parents[1]
VERSION=373


def norm(value: str) -> str:
    value=str(value or '').lower().replace('œ','oe')
    value=''.join(c for c in unicodedata.normalize('NFD',value) if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]+',' ',value).strip()


def sort_names(values):
    seen=set()
    result=[]
    for value in values:
        key=norm(value)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(value)
    return sorted(result,key=norm)


def replace_once(text,old,new,label):
    if old not in text:
        raise RuntimeError(f'{label} introuvable')
    return text.replace(old,new,1)


def re_sub_once(pattern,replacement,text,label,flags=0):
    value,count=re.subn(pattern,replacement,text,count=1,flags=flags)
    if count!=1:
        raise RuntimeError(f'{label} introuvable ({count})')
    return value


catalog_path=ROOT/'catalog.js'
catalog=catalog_path.read_text(encoding='utf-8')
groups_match=re.search(r'groups:\s*(\{.*?\}),\s*\n\s*meta:',catalog,flags=re.S)
if not groups_match:
    raise RuntimeError('groups introuvable dans catalog.js')
if 'atlasGroups:' in catalog:
    raise RuntimeError('atlasGroups existe déjà')
old_groups=json.loads(groups_match.group(1))


def group(category,subgroup):
    return list(old_groups.get(category,{}).get(subgroup,[]))


def without(values,*removed):
    removed_keys={norm(value) for value in removed}
    return [value for value in values if norm(value) not in removed_keys]


def only(values,*selected):
    wanted={norm(value) for value in selected}
    return [value for value in values if norm(value) in wanted]


fish_traiteur=group('Frais','Poissons & traiteur')
frozen=group('Frais','Surgelés')
preserves=group('Épicerie','Conserves')
world=group('Épicerie','Monde & pratique')

new_groups={
    'Fruits & Légumes':{key:sort_names(values) for key,values in old_groups['Fruits & Légumes'].items()},
    'Viandes & poissons':{
        'Charcuterie':sort_names(group('Frais','Charcuterie')),
        'Viandes':sort_names(group('Frais','Viandes')),
        'Poissons & traiteur':sort_names(without(fish_traiteur,'Quiche','Pizza fraîche','Pâtes fraîches')),
        'Conserves':sort_names(only(preserves,'Thon en boîte','Sardines','Maquereaux')),
        'Surgelés':sort_names(only(frozen,'Poisson surgelé','Steaks hachés surgelés')),
    },
    'Frais':{
        'Laits & crèmes':sort_names(group('Frais','Laits & crèmes')),
        'Yaourts & desserts':sort_names(group('Frais','Yaourts & desserts')),
        'Fromages':sort_names(group('Frais','Fromages')),
        'Poissons & traiteur':sort_names(only(fish_traiteur,'Quiche','Pizza fraîche','Pâtes fraîches')),
    },
    'Boulangerie':{
        'Boulangerie':sort_names(group('Frais','Boulangerie')),
        'Pâtes à tarte':sort_names(group('Frais','Pâtes à tarte')),
    },
    'Petit-déjeuner':{
        'Petit-déjeuner':sort_names(group('Épicerie','Petit-déjeuner')),
        'Café & thé':sort_names(group('Boissons','Café & thé')),
    },
    'Cuisine':{
        'Pâtes, riz & céréales':sort_names(group('Épicerie','Pâtes, riz & céréales')),
        'Conserves':sort_names(without(preserves,'Thon en boîte','Sardines','Maquereaux')),
        'Sauces & condiments':sort_names(group('Épicerie','Sauces & condiments')),
        'Pâtisserie & cuisine':sort_names(group('Épicerie','Pâtisserie & cuisine')),
        'Monde & pratique':sort_names(without(world,'Tortillas')),
        'Surgelés':sort_names(only(frozen,'Frites surgelées','Légumes surgelés','Haricots verts surgelés','Petits pois surgelés','Poêlée de légumes','Pizza surgelée')),
    },
    'Boissons':{
        'Eaux & jus':sort_names(group('Boissons','Eaux & jus')),
        'Sodas & sirops':sort_names(group('Boissons','Sodas & sirops')),
        'Bières & vins':sort_names(group('Boissons','Bières & vins')),
        'Surgelés':sort_names(only(frozen,'Glaçons')),
    },
    'Apéritif & snacks':{
        'Apéritif':sort_names(group('Épicerie','Apéritif')),
        'Biscuits & goûters':sort_names(group('Épicerie','Biscuits & goûters')),
        'Surgelés':sort_names(only(frozen,'Glace vanille','Glace chocolat','Sorbet')),
    },
    'Maison':{
        'Entretien':sort_names(group('Maison','Entretien')),
        'Lessive':sort_names(group('Maison','Lessive')),
        'Vaisselle':sort_names(group('Maison','Vaisselle')),
        'Papier & sacs':sort_names(group('Maison','Papier & sacs')),
        'Équipement':sort_names(group('Maison','Équipement')+group('Maison','Piles')),
    },
    'Hygiène & soins':{
        'Hygiène':sort_names(group('Maison','Hygiène')),
        'Salle de bain & soins':sort_names(group('Maison','Salle de bain & soins')),
    },
    'Enfant':{key:sort_names(values) for key,values in old_groups['Enfant'].items()},
}

old_unique={norm(name):name for subs in old_groups.values() for names in subs.values() for name in names}
logical=[name for subs in new_groups.values() for names in subs.values() for name in names]
logical_keys=[norm(name) for name in logical]
if len(logical_keys)!=len(set(logical_keys)):
    duplicates=sorted({key for key in logical_keys if logical_keys.count(key)>1})
    raise RuntimeError(f'doublons dans le nouveau catalogue: {duplicates}')
if set(logical_keys)!=set(old_unique):
    missing=sorted(set(old_unique)-set(logical_keys))
    extra=sorted(set(logical_keys)-set(old_unique))
    raise RuntimeError(f'écart produits: manquants={missing}; extras={extra}')

expected_categories=['Fruits & Légumes','Viandes & poissons','Frais','Boulangerie','Petit-déjeuner','Cuisine','Boissons','Apéritif & snacks','Maison','Hygiène & soins','Enfant']
if list(new_groups)!=expected_categories:
    raise RuntimeError('ordre logique inattendu')

encoded_new=json.dumps(new_groups,ensure_ascii=False,separators=(',',':'))
encoded_atlas=json.dumps(old_groups,ensure_ascii=False,separators=(',',':'))
catalog=catalog[:groups_match.start(1)]+encoded_new+catalog[groups_match.end(1):]
meta_anchor=re.search(r'(\n\s*meta:\s*\{.*?\},\s*\n)(\s*favorites:)',catalog,flags=re.S)
if not meta_anchor:
    raise RuntimeError('meta/favorites introuvables')
catalog=catalog[:meta_anchor.end(1)]+f'    atlasGroups: {encoded_atlas},\n'+catalog[meta_anchor.start(2):]
catalog=re.sub(r'(catalog-quantities\.js\?v=)\d+',rf'\g<1>{VERSION}',catalog,count=1)
catalog=re.sub(r'(dish-local-images\.js\?v=)\d+',rf'\g<1>{VERSION}',catalog,count=1)
catalog_path.write_text(catalog,encoding='utf-8')

app_path=ROOT/'app.js'
app=app_path.read_text(encoding='utf-8')
app=replace_once(app,'const GROUPS = CATALOG.groups;\nconst META = CATALOG.meta;','const GROUPS = CATALOG.groups;\nconst ATLAS_GROUPS = CATALOG.atlasGroups || GROUPS;\nconst META = CATALOG.meta;','ATLAS_GROUPS')
category_block="""const CATEGORY_META = {
  'Toutes': { label:'Tous' },
  'Apéritif & snacks': { label:'Apéritif & snacks' },
  'Boissons': { label:'Boissons' },
  'Boulangerie': { label:'Boulangerie' },
  'Cuisine': { label:'Cuisine' },
  'Enfant': { label:'Enfant' },
  'Frais': { label:'Frais' },
  'Fruits & Légumes': { label:'Fruits & légumes' },
  'Hygiène & soins': { label:'Hygiène & soins' },
  'Maison': { label:'Maison' },
  'Petit-déjeuner': { label:'Petit-déjeuner' },
  'Viandes & poissons': { label:'Viandes & poissons' },
  'Favoris': { label:'Favoris' }
};
const CATALOG_CATEGORY_ORDER=['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons','Favoris'];
const MISSING_PRODUCT_CATEGORIES=Object.freeze(['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons']);"""
app=re_sub_once(r"const CATEGORY_META = \{.*?const MISSING_PRODUCT_CATEGORIES=Object\.freeze\(\[.*?\]\);",category_block,app,'bloc catégories app.js',flags=re.S)
old_positions="Object.entries(GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names],row)=>names.forEach((name,col)=>POSITIONS.set(norm(name),{category,sub,row,col}))));"
new_positions="Object.entries(ATLAS_GROUPS).forEach(([category,subs])=>Object.entries(subs).forEach(([sub,names],row)=>names.forEach((name,col)=>POSITIONS.set(norm(name),{category,sub,row,col}))));"
app=replace_once(app,old_positions,new_positions,'POSITIONS atlas')
app=replace_once(app,"return category==='Frais'?'Produits frais':(CATEGORY_META[category]?.label||category);","return CATEGORY_META[category]?.label||category;",'missingCategoryLabel')
app_path.write_text(app,encoding='utf-8')

items_path=ROOT/'product-item-images.js'
items=items_path.read_text(encoding='utf-8')
items=re_sub_once(
    r"const CATEGORIES=\[.*?\];\nconst PRODUCT_NAMES=new Set\(CATEGORIES\.flatMap\(category=>\{\n  const groups=window\.COURSES_CATALOG\?\.groups\?\.\[category\]\|\|\{\};\n  return Object\.values\(groups\)\.flatMap\(names=>Array\.isArray\(names\)\?names:\[\]\);\n\}\)\);",
    "const PRODUCT_NAMES=new Set(Object.values(window.COURSES_CATALOG?.groups||{}).flatMap(groups=>\n  Object.values(groups||{}).flatMap(names=>Array.isArray(names)?names:[])\n));",
    items,'PRODUCT_NAMES dynamique',flags=re.S
)
items_path.write_text(items,encoding='utf-8')

intelligence_path=ROOT/'purchase-intelligence.js'
intelligence=intelligence_path.read_text(encoding='utf-8')
category_rules="""const CATEGORY=Object.freeze({
  'Viandes & poissons':{days:3,factor:.5,shelf:5},
  'Frais':{days:7,factor:.6,shelf:12},
  'Fruits & Légumes':{days:7,factor:.62,shelf:14},
  'Boulangerie':{days:4,factor:.55,shelf:7},
  'Petit-déjeuner':{days:30,factor:.82},
  'Cuisine':{days:30,factor:.8},
  'Boissons':{days:14,factor:.8},
  'Apéritif & snacks':{days:18,factor:.72},
  'Maison':{days:45,factor:.86},
  'Hygiène & soins':{days:45,factor:.86},
  'Enfant':{days:14,factor:.78}
});"""
intelligence=re_sub_once(r'const CATEGORY=Object\.freeze\(\{.*?\n\}\);',category_rules,intelligence,'CATEGORY purchase-intelligence',flags=re.S)
intelligence_path.write_text(intelligence,encoding='utf-8')

index_path=ROOT/'index.html'
index=index_path.read_text(encoding='utf-8')
labels=['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons']
buttons=['        <div class="list-filter-section list-filter-categories" role="radiogroup" aria-label="Filtrer par catégorie">','          <strong class="list-filter-title">Filtrer par catégorie</strong>']
for label in labels:
    escaped=html.escape(label,quote=True)
    buttons.extend([
        f'          <button class="list-filter-option" type="button" data-list-category="{escaped}" role="radio">',
        f'            <span>{escaped}</span><i aria-hidden="true"></i>',
        '          </button>',
    ])
buttons.append('        </div>')
index=re_sub_once(r'        <div class="list-filter-section list-filter-categories" role="radiogroup" aria-label="Filtrer par catégorie">.*?        </div>','\n'.join(buttons),index,'filtres catégories index',flags=re.S)
index,count=re.subn(r'(<span class="page-version">)v\d+(</span>)',rf'\g<1>v{VERSION}\g<2>',index)
if count!=3:
    raise RuntimeError(f'badges version: {count} au lieu de 3')
index=re.sub(r'(catalog\.js\?v=)\d+',rf'\g<1>{VERSION}',index,count=1)
index=re.sub(r'(app\.js\?v=)\d+',rf'\g<1>{VERSION}',index,count=1)
index_path.write_text(index,encoding='utf-8')

local_path=ROOT/'dish-local-images.js'
local=local_path.read_text(encoding='utf-8')
local=re_sub_once(r"const APP_VERSION='v\d+'",f"const APP_VERSION='v{VERSION}'",local,'APP_VERSION')
local=re.sub(r'(product-item-images\.js\?v=)\d+',rf'\g<1>{VERSION}',local,count=1)
local=re.sub(r'(purchase-intelligence\.js\?v=)\d+',rf'\g<1>{VERSION}',local,count=1)
local_path.write_text(local,encoding='utf-8')

sw_path=ROOT/'sw.js'
sw=sw_path.read_text(encoding='utf-8')
sw=re_sub_once(r"const CACHE='courses-app-v\d+-r\d+'",f"const CACHE='courses-app-v{VERSION}-r1'",sw,'CACHE service worker')
shell_match=re.search(r'(const SHELL=\[)(.*?)(\];)',sw,flags=re.S)
if not shell_match:
    raise RuntimeError('SHELL sw introuvable')
body=shell_match.group(2)
for asset in [f'./catalog.js?v={VERSION}',f'./app.js?v={VERSION}',f'./dish-local-images.js?v={VERSION}',f'./product-item-images.js?v={VERSION}',f'./purchase-intelligence.js?v={VERSION}']:
    quoted=json.dumps(asset,ensure_ascii=False)
    if quoted not in body and ("'"+asset+"'") not in body:
        body=body.rstrip()+(',' if body.rstrip() else '')+quoted
sw=sw[:shell_match.start()]+shell_match.group(1)+body+shell_match.group(3)+sw[shell_match.end():]
sw_path.write_text(sw,encoding='utf-8')

tests_path=ROOT/'tests/catalog-ordering.test.mjs'
tests=tests_path.read_text(encoding='utf-8')
tests=replace_once(tests,"const CATALOG_CATEGORY_ORDER=\\['Toutes','Boissons','Enfant','Épicerie','Frais','Fruits & Légumes','Maison','Favoris'\\]","const CATALOG_CATEGORY_ORDER=\\['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons','Favoris'\\]",'test CATALOG_CATEGORY_ORDER')
tests=replace_once(tests,"const MISSING_PRODUCT_CATEGORIES=Object\\.freeze\\(\\['','Boissons','Enfant','Épicerie','Frais','Fruits & Légumes','Maison'\\]\\)","const MISSING_PRODUCT_CATEGORIES=Object\\.freeze\\(\\['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons'\\]\\)",'test MISSING_PRODUCT_CATEGORIES')
tests_path.write_text(tests,encoding='utf-8')

category_test=ROOT/'tests/catalog-categories.test.mjs'
category_test.write_text(r'''import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const norm=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

function catalogue(){
  const source=read('catalog.js');
  const groupsMatch=source.match(/groups:\s*(\{.*?\}),\s*\n\s*meta:/s);
  const atlasMatch=source.match(/atlasGroups:\s*(\{.*?\}),\s*\n\s*favorites:/s);
  assert.ok(groupsMatch,'groups introuvable');
  assert.ok(atlasMatch,'atlasGroups introuvable');
  return {groups:JSON.parse(groupsMatch[1]),atlas:JSON.parse(atlasMatch[1])};
}

test('le catalogue expose les nouvelles catégories principales validées',()=>{
  const {groups}=catalogue();
  assert.deepEqual(Object.keys(groups),[
    'Fruits & Légumes','Viandes & poissons','Frais','Boulangerie','Petit-déjeuner','Cuisine',
    'Boissons','Apéritif & snacks','Maison','Hygiène & soins','Enfant'
  ]);
});

test('chaque produit logique existe une seule fois et les anciens atlas restent couverts',()=>{
  const {groups,atlas}=catalogue();
  const logical=new Map();
  for(const [category,subs] of Object.entries(groups))for(const names of Object.values(subs))for(const name of names){
    const key=norm(name);
    assert.ok(!logical.has(key),`produit dupliqué: ${name}`);
    logical.set(key,{name,category});
  }
  for(const subs of Object.values(atlas))for(const names of Object.values(subs))for(const name of names){
    assert.ok(logical.has(norm(name)),`produit atlas absent du catalogue logique: ${name}`);
  }
  assert.equal(logical.get(norm('Confiture fruits rouges'))?.category,'Petit-déjeuner');
  assert.equal(logical.get(norm('Poulet'))?.category,'Viandes & poissons');
  assert.equal(logical.get(norm('Saumon'))?.category,'Viandes & poissons');
  assert.equal(logical.get(norm('Pain'))?.category,'Boulangerie');
  assert.equal(logical.get(norm('Shampoing'))?.category,'Hygiène & soins');
  assert.equal(logical.get(norm('Piles AA'))?.category,'Maison');
  assert.equal(logical.get(norm('Pile AAA'))?.category,'Maison');
});

test('les positions atlas sont découplées des catégories logiques et les images unitaires couvrent tout le catalogue',()=>{
  const app=read('app.js');
  assert.match(app,/const ATLAS_GROUPS = CATALOG\.atlasGroups \|\| GROUPS;/);
  assert.match(app,/Object\.entries\(ATLAS_GROUPS\).*?POSITIONS\.set/s);
  const itemImages=read('product-item-images.js');
  assert.doesNotMatch(itemImages,/const CATEGORIES=/);
  assert.match(itemImages,/Object\.values\(window\.COURSES_CATALOG\?\.groups\|\|\{\}\)/);
});
''',encoding='utf-8')

# Documentation courte : les catégories affichées ne pilotent plus les coordonnées historiques d'atlas.
docs_path=ROOT/'docs/IMAGES_ITEMS.md'
if docs_path.exists():
    docs=docs_path.read_text(encoding='utf-8')
    docs=docs.replace('Les catégories Fruits & Légumes, Frais, Épicerie, Boissons et Maison utilisent les images unitaires.','Toutes les catégories logiques du catalogue utilisent les images unitaires. Les anciens atlas conservent leurs coordonnées via `atlasGroups`, séparément des catégories affichées.')
    docs_path.write_text(docs,encoding='utf-8')

print('Réorganisation v373 préparée avec',len(logical_keys),'produits uniques.')
