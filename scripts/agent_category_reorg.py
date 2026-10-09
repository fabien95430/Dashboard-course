#!/usr/bin/env python3
from pathlib import Path
import collections
import html
import json
import re
import unicodedata

ROOT=Path('.')
VERSION=373


def norm(value):
    value=str(value or '').lower().replace('œ','oe')
    value=''.join(c for c in unicodedata.normalize('NFD',value) if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]+',' ',value).strip()


def sort_names(values):
    unique={}
    for value in values:
        unique.setdefault(norm(value),value)
    return sorted(unique.values(),key=norm)


def replace_once(text,old,new,label):
    if old not in text:
        raise SystemExit(f'{label}: motif introuvable')
    return text.replace(old,new,1)


def replace_regex(text,pattern,replacement,label,flags=0):
    text,count=re.subn(pattern,replacement,text,count=1,flags=flags)
    if count!=1:
        raise SystemExit(f'{label}: remplacement={count}')
    return text


catalog_path=ROOT/'catalog.js'
catalog=catalog_path.read_text(encoding='utf-8')
groups_match=re.search(r'groups:\s*(\{.*?\}),\s*\n\s*meta:',catalog,flags=re.S)
if not groups_match:
    raise SystemExit('catalog.js: groups introuvable')
old=json.loads(groups_match.group(1))


def group(category,subgroup):
    return list(old[category][subgroup])


def pick(values,*selected):
    wanted={norm(x) for x in selected}
    return [x for x in values if norm(x) in wanted]


def without(values,*removed):
    rejected={norm(x) for x in removed}
    return [x for x in values if norm(x) not in rejected]

fish_traiteur=group('Frais','Poissons & traiteur')
frozen=group('Frais','Surgelés')
preserves=group('Épicerie','Conserves')
apero=group('Épicerie','Apéritif')
equipment=group('Maison','Équipement')+group('Maison','Piles')

new_groups={
    'Apéritif & snacks':{
        'Apéritif':sort_names(without(apero,'Tortillas')),
        'Biscuits & goûters':sort_names(group('Épicerie','Biscuits & goûters')),
    },
    'Boissons':{
        'Bières & vins':sort_names(group('Boissons','Bières & vins')),
        'Eaux & jus':sort_names(group('Boissons','Eaux & jus')),
        'Sodas & sirops':sort_names(group('Boissons','Sodas & sirops')),
    },
    'Boulangerie':{
        'Boulangerie':sort_names(group('Frais','Boulangerie')),
        'Pâtes à tarte':sort_names(group('Frais','Pâtes à tarte')),
    },
    'Cuisine':{
        'Conserves':sort_names(without(preserves,'Maquereaux','Sardines','Thon en boîte')),
        'Monde & pratique':sort_names(group('Épicerie','Monde & pratique')),
        'Pâtes, riz & céréales':sort_names(group('Épicerie','Pâtes, riz & céréales')),
        'Pâtisserie & cuisine':sort_names(group('Épicerie','Pâtisserie & cuisine')),
        'Sauces & condiments':sort_names(group('Épicerie','Sauces & condiments')),
    },
    'Enfant':{
        key:sort_names(values) for key,values in old['Enfant'].items()
    },
    'Frais':{
        'Fromages':sort_names(group('Frais','Fromages')),
        'Laits & crèmes':sort_names(group('Frais','Laits & crèmes')),
        'Surgelés':sort_names(without(frozen,'Poisson surgelé','Steaks hachés surgelés')),
        'Traiteur frais':sort_names(pick(fish_traiteur,'Pâtes fraîches','Pizza fraîche','Quiche')),
        'Yaourts & desserts':sort_names(group('Frais','Yaourts & desserts')),
    },
    'Fruits & Légumes':{
        key:sort_names(values) for key,values in old['Fruits & Légumes'].items()
    },
    'Hygiène & soins':{
        'Hygiène':sort_names(group('Maison','Hygiène')),
        'Salle de bain & soins':sort_names(group('Maison','Salle de bain & soins')),
    },
    'Maison':{
        'Entretien':sort_names(group('Maison','Entretien')),
        'Équipement':sort_names(equipment),
        'Lessive':sort_names(group('Maison','Lessive')),
        'Papier & sacs':sort_names(group('Maison','Papier & sacs')),
        'Vaisselle':sort_names(group('Maison','Vaisselle')),
    },
    'Petit-déjeuner':{
        'Café & thé':sort_names(group('Boissons','Café & thé')),
        'Petit-déjeuner':sort_names(group('Épicerie','Petit-déjeuner')),
    },
    'Viandes & poissons':{
        'Charcuterie':sort_names(group('Frais','Charcuterie')),
        'Poissons & traiteur':sort_names(without(fish_traiteur,'Pâtes fraîches','Pizza fraîche','Quiche')),
        'Poissons en conserve':sort_names(pick(preserves,'Maquereaux','Sardines','Thon en boîte')),
        'Surgelés':sort_names(pick(frozen,'Poisson surgelé','Steaks hachés surgelés')),
        'Viandes':sort_names(group('Frais','Viandes')),
    },
}

old_unique={norm(name):name for subs in old.values() for names in subs.values() for name in names}
new_names=[name for subs in new_groups.values() for names in subs.values() for name in names]
new_keys=[norm(name) for name in new_names]
if len(new_keys)!=len(set(new_keys)):
    dupes=[key for key,count in collections.Counter(new_keys).items() if count>1]
    raise SystemExit(f'doublons après migration: {dupes}')
if set(new_keys)!=set(old_unique):
    raise SystemExit(f'écart produits: manquants={sorted(set(old_unique)-set(new_keys))}; extras={sorted(set(new_keys)-set(old_unique))}')

encoded=json.dumps(new_groups,ensure_ascii=False,separators=(',',':'))
catalog=catalog[:groups_match.start(1)]+encoded+catalog[groups_match.end(1):]
catalog=re.sub(r'(catalog-quantities\.js\?v=)\d+',rf'\g<1>{VERSION}',catalog,count=1)
catalog=re.sub(r'(dish-local-images\.js\?v=)\d+',rf'\g<1>{VERSION}',catalog,count=1)
catalog_path.write_text(catalog,encoding='utf-8')

app_path=ROOT/'app.js'
app=app_path.read_text(encoding='utf-8')
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
app=replace_regex(app,r"const CATEGORY_META = \{.*?const MISSING_PRODUCT_CATEGORIES=Object\.freeze\(\[.*?\]\);",category_block,'app catégories',re.S)
app=app.replace("return category==='Frais'?'Produits frais':(CATEGORY_META[category]?.label||category);","return CATEGORY_META[category]?.label||category;",1)
app_path.write_text(app,encoding='utf-8')

images_path=ROOT/'product-item-images.js'
images=images_path.read_text(encoding='utf-8')
images=replace_regex(
    images,
    r"const CATEGORIES=\[.*?\];\nconst PRODUCT_NAMES=new Set\(CATEGORIES\.flatMap\(category=>\{\n  const groups=window\.COURSES_CATALOG\?\.groups\?\.\[category\]\|\|\{\};\n  return Object\.values\(groups\)\.flatMap\(names=>Array\.isArray\(names\)\?names:\[\]\);\n\}\)\);",
    "const PRODUCT_NAMES=new Set(Object.values(window.COURSES_CATALOG?.groups||{}).flatMap(groups=>\n  Object.values(groups||{}).flatMap(names=>Array.isArray(names)?names:[])\n));",
    'images catégories',re.S
)
images_path.write_text(images,encoding='utf-8')

quantities_path=ROOT/'catalog-quantities.js'
quantities=quantities_path.read_text(encoding='utf-8')
for marker in ('DISPLAY_MODE_BY_SUB','TECHNICAL_MODE_BY_SUB'):
    block=re.search(rf'(const {marker}=Object\.freeze\(\{{)(.*?)(\n\}}\);)',quantities,flags=re.S)
    if not block:
        raise SystemExit(f'{marker} introuvable')
    body=block.group(2)
    additions=[]
    if "'Poissons en conserve':" not in body:
        additions.append("  'Poissons en conserve':'Boîte'")
    if "'Traiteur frais':" not in body:
        additions.append("  'Traiteur frais':'Pièce'")
    if additions:
        body=body.rstrip()+(',' if body.rstrip() and not body.rstrip().endswith(',') else '')+'\n'+',\n'.join(additions)
        quantities=quantities[:block.start()]+block.group(1)+body+block.group(3)+quantities[block.end():]
quantities_path.write_text(quantities,encoding='utf-8')

intel_path=ROOT/'purchase-intelligence.js'
intel=intel_path.read_text(encoding='utf-8')
category_rules="""const CATEGORY=Object.freeze({
  'Apéritif & snacks':{days:18,factor:.72},
  'Boissons':{days:14,factor:.8},
  'Boulangerie':{days:4,factor:.55,shelf:7},
  'Cuisine':{days:30,factor:.8},
  'Enfant':{days:14,factor:.78},
  'Frais':{days:7,factor:.6,shelf:12},
  'Fruits & Légumes':{days:7,factor:.62,shelf:14},
  'Hygiène & soins':{days:45,factor:.86},
  'Maison':{days:45,factor:.86},
  'Petit-déjeuner':{days:30,factor:.82},
  'Viandes & poissons':{days:3,factor:.5,shelf:5}
});"""
intel=replace_regex(intel,r'const CATEGORY=Object\.freeze\(\{.*?\n\}\);',category_rules,'intelligence catégories',re.S)
intel=replace_once(intel,"  'Viandes':{days:2,factor:.5,shelf:3},'Poissons & traiteur':{days:2,factor:.5,shelf:3},","  'Viandes':{days:2,factor:.5,shelf:3},'Poissons & traiteur':{days:2,factor:.5,shelf:3},'Poissons en conserve':{days:4,factor:.25},'Traiteur frais':{days:4,factor:.55,shelf:7},",'intelligence sous-catégories')
intel_path.write_text(intel,encoding='utf-8')

index_path=ROOT/'index.html'
index=index_path.read_text(encoding='utf-8')
labels=['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons']
filter_lines=['        <div class="list-filter-section list-filter-categories" role="radiogroup" aria-label="Filtrer par catégorie">','          <strong class="list-filter-title">Filtrer par catégorie</strong>']
for label in labels:
    escaped=html.escape(label,quote=True)
    filter_lines += [f'          <button class="list-filter-option" type="button" data-list-category="{escaped}" role="radio">',f'            <span>{escaped}</span><i aria-hidden="true"></i>','          </button>']
filter_lines.append('        </div>')
index=replace_regex(index,r'        <div class="list-filter-section list-filter-categories" role="radiogroup" aria-label="Filtrer par catégorie">.*?        </div>','\n'.join(filter_lines),'index filtre liste',re.S)
missing_labels=['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons']
missing=[]
for label in missing_labels:
    escaped=html.escape(label,quote=True)
    shown='Aucune' if not label else escaped
    active=' is-active' if not label else ''
    pressed='true' if not label else 'false'
    missing.append(f'        <button class="missing-category-choice{active}" type="button" data-missing-category="{escaped}" aria-pressed="{pressed}"><span>{shown}</span></button>')
index=replace_regex(index,r'(<div id="missingCategoryGrid" class="missing-category-grid">).*?(\n\s*</div>)',lambda m:m.group(1)+'\n'+'\n'.join(missing)+m.group(2),'index catégories manquantes',re.S)
index=re.sub(r'(<span class="page-version">)v\d+(</span>)',rf'\g<1>v{VERSION}\g<2>',index)
index=re.sub(r'(src="\./catalog\.js\?v=)\d+(\")',rf'\g<1>{VERSION}\g<2>',index,count=1)
index=re.sub(r'(src="\./app\.js\?v=)\d+(\")',rf'\g<1>{VERSION}\g<2>',index,count=1)
index_path.write_text(index,encoding='utf-8')

local_path=ROOT/'dish-local-images.js'
local=local_path.read_text(encoding='utf-8')
local=replace_regex(local,r"const APP_VERSION='v\d+';",f"const APP_VERSION='v{VERSION}';",'version runtime')
local=replace_regex(local,r'(product-item-images\.js\?v=)\d+',r'\g<1>12','cache images unitaires')
local=replace_regex(local,r'(purchase-intelligence\.js\?v=)\d+',r'\g<1>5','cache intelligence achat')
local_path.write_text(local,encoding='utf-8')

sw_path=ROOT/'sw.js'
sw=sw_path.read_text(encoding='utf-8')
sw=replace_regex(sw,r"const CACHE='courses-app-v\d+-r\d+';",f"const CACHE='courses-app-v{VERSION}-r1';",'cache SW')
shell=re.search(r'(const SHELL=\[)(.*?)(\];)',sw,flags=re.S)
if not shell:
    raise SystemExit('SHELL sw introuvable')
body=shell.group(2)
for asset in [f'./catalog.js?v={VERSION}',f'./app.js?v={VERSION}',f'./catalog-quantities.js?v={VERSION}',f'./dish-local-images.js?v={VERSION}','./product-item-images.js?v=12','./purchase-intelligence.js?v=5']:
    if json.dumps(asset) not in body and ("'"+asset+"'") not in body:
        body=body.rstrip()+(',' if body.rstrip() else '')+json.dumps(asset)
sw=sw[:shell.start()]+shell.group(1)+body+shell.group(3)+sw[shell.end():]
sw_path.write_text(sw,encoding='utf-8')

test_path=ROOT/'tests/catalog-ordering.test.mjs'
test=test_path.read_text(encoding='utf-8')
test=replace_regex(test,r"assert\.match\(app,/const CATALOG_CATEGORY_ORDER=.*?\);\n  assert\.match\(app,/const MISSING_PRODUCT_CATEGORIES=.*?\);","assert.match(app,/const CATALOG_CATEGORY_ORDER=\\['Toutes','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons','Favoris'\\]/);\n  assert.match(app,/const MISSING_PRODUCT_CATEGORIES=Object\\.freeze\\(\\['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons'\\]\\)/);",'test ordre catégories',re.S)
extra="""

test('chaque produit appartient à une seule catégorie principale cohérente',()=>{
  const source=read('catalog.js');
  const match=source.match(/groups:\\s*(\\{.*?\\}),\\s*\\n\\s*meta:/s);
  assert.ok(match,'groups introuvable');
  const groups=JSON.parse(match[1]);
  const locations=new Map();
  for(const [category,subgroups] of Object.entries(groups))for(const [sub,names] of Object.entries(subgroups))for(const name of names){
    const key=norm(name);
    assert.ok(!locations.has(key),`produit dupliqué: ${name}`);
    locations.set(key,{name,category,sub});
  }
  assert.equal(locations.get(norm('Confiture fruits rouges'))?.category,'Petit-déjeuner');
  assert.equal(locations.get(norm('Poulet'))?.category,'Viandes & poissons');
  assert.equal(locations.get(norm('Saumon'))?.category,'Viandes & poissons');
  assert.equal(locations.get(norm('Pain'))?.category,'Boulangerie');
  assert.equal(locations.get(norm('Paprika'))?.category,'Cuisine');
  assert.equal(locations.get(norm('Chips nature'))?.category,'Apéritif & snacks');
  assert.equal(locations.get(norm('Shampoing'))?.category,'Hygiène & soins');
  assert.equal(locations.get(norm('Piles AA'))?.sub,'Équipement');
  assert.equal(locations.get(norm('Pile AAA'))?.sub,'Équipement');
});

test('les images unitaires suivent dynamiquement toutes les catégories du catalogue',()=>{
  const images=read('product-item-images.js');
  assert.doesNotMatch(images,/const CATEGORIES=/);
  assert.match(images,/Object\\.values\\(window\\.COURSES_CATALOG\\?\\.groups\\|\\|\\{\\}\\)/);
});
"""
if 'chaque produit appartient à une seule catégorie principale cohérente' not in test:
    test += extra
test_path.write_text(test,encoding='utf-8')

print('Migration v373 préparée:',len(new_names),'produits uniques,',len(new_groups),'catégories principales')
