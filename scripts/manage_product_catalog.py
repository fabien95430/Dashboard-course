#!/usr/bin/env python3
"""Apply an administrator product removal to the current catalog files."""
from __future__ import annotations
import json, os, re, sys
import integrate_dish as base

ROOT=base.ROOT
RESULT_PATH=base.RESULT_PATH
REMOVE_PREFIX='__courses_delete_product__:'

def fail(message):
    RESULT_PATH.write_text(json.dumps({'ok':False,'deleted':False,'error':message},ensure_ascii=False,indent=2),encoding='utf-8')
    raise RuntimeError(message)

def decode_js(value):
    return value.replace("\\'","'").replace('\\"','"').replace('\\\\','\\')

def find_product(groups,name):
    wanted=base.normalize(name)
    for category,subgroups in groups.items():
        for subgroup,names in subgroups.items():
            for existing in names:
                if base.normalize(existing)==wanted:return str(existing),category,subgroup
    return None

def recipe_usages(name):
    text=(ROOT/'dishes-ui.js').read_text(encoding='utf-8')
    wanted=base.normalize(name);used=[]
    for match in re.finditer(r"\{name:'((?:\\.|[^'])*)'.*?ingredients:\[([^\]]*)\]\}",text,re.S):
        dish=decode_js(match.group(1));ingredients=[decode_js(v) for v in re.findall(r"'((?:\\.|[^'])*)'",match.group(2))]
        if any(base.normalize(v)==wanted for v in ingredients):used.append(dish)
    return used

def remove_simple_entry(text,const_name,name,value_pattern):
    match=re.search(rf"(const\s+{re.escape(const_name)}\s*=\s*(?:Object\.freeze\()?\{{)(.*?)(\}}\)?;)",text,re.S)
    if not match:return text
    body=match.group(2);keys=[re.escape(base.js_quote(name)),re.escape(json.dumps(name,ensure_ascii=False))]
    entry=rf"(?:{'|'.join(keys)})\s*:\s*{value_pattern}"
    updated,count=re.subn(entry+r"\s*,",'',body,count=1,flags=re.S)
    if count==0:updated,count=re.subn(r",\s*"+entry,'',body,count=1,flags=re.S)
    if count==0:updated,count=re.subn(entry,'',body,count=1,flags=re.S)
    return text if count==0 else text[:match.start(2)]+updated+text[match.end(2):]

def current_version():
    text=(ROOT/'dish-local-images.js').read_text(encoding='utf-8');match=re.search(r"const APP_VERSION='v(\d+)'",text)
    if not match:fail('Version globale introuvable')
    return int(match.group(1))

def ensure_shell(text,assets):
    match=re.search(r"(const SHELL=\[)(.*?)(\];)",text,re.S)
    if not match:fail('Précache SHELL introuvable')
    body=match.group(2)
    for asset in assets:
        quoted=json.dumps(asset,ensure_ascii=False)
        if quoted not in body and ("'"+asset+"'") not in body:body=body.rstrip()+(',' if body.rstrip() else '')+quoted
    return text[:match.start()]+match.group(1)+body+match.group(3)+text[match.end():]

def main():
    raw=re.sub(r"\s+"," ",str(os.getenv('DISH_NAME') or '')).strip()
    if not raw.startswith(REMOVE_PREFIX):fail('Demande de suppression invalide')
    requested=raw[len(REMOVE_PREFIX):].strip()
    catalog_path=ROOT/'catalog.js';catalog_text=catalog_path.read_text(encoding='utf-8')
    groups_match=re.search(r"groups:\s*(\{.*?\}),\s*\n\s*meta:",catalog_text,re.S)
    if not groups_match:fail('Structure groups de catalog.js introuvable')
    groups=json.loads(groups_match.group(1));found=find_product(groups,requested)
    if not found:fail('Produit introuvable dans catalog.js')
    name,category,subgroup=found
    usages=recipe_usages(name)
    if usages:
        fail('Suppression bloquée : « '+name+' » est utilisé par '+str(len(usages))+' plat(s) : '+', '.join(usages[:8]))
    groups[category][subgroup]=[v for v in groups[category][subgroup] if base.normalize(v)!=base.normalize(name)]
    if not groups[category][subgroup]:del groups[category][subgroup]
    encoded=json.dumps(groups,ensure_ascii=False,separators=(',',':'))
    catalog_text=catalog_text[:groups_match.start(1)]+encoded+catalog_text[groups_match.end(1):]
    fav=re.search(r"(favorites:\s*\[)(.*?)(\])",catalog_text,re.S)
    if fav:
        values=[decode_js(v) for v in re.findall(r"'((?:\\.|[^'])*)'",fav.group(2))]
        values=[v for v in values if base.normalize(v)!=base.normalize(name)]
        catalog_text=catalog_text[:fav.start(2)]+','.join(base.js_quote(v) for v in values)+catalog_text[fav.end(2):]
    quantities_path=ROOT/'catalog-quantities.js';quantities=quantities_path.read_text(encoding='utf-8')
    quantities=remove_simple_entry(quantities,'PURCHASE_REFERENCES',name,r"\{[^{}]*\}")
    quantities=remove_simple_entry(quantities,'DISPLAY_MODE_BY_PRODUCT',name,r"(?:'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\")")
    quantities=remove_simple_entry(quantities,'TECHNICAL_MODE_BY_PRODUCT',name,r"(?:'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\")")
    app_path=ROOT/'app.js';app=remove_simple_entry(app_path.read_text(encoding='utf-8'),'CATALOG_DISPLAY_NAMES',name,r"(?:'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\")")
    intelligence_path=ROOT/'purchase-intelligence.js';intelligence=remove_simple_entry(intelligence_path.read_text(encoding='utf-8'),'PRODUCT',name,r"\{[^{}]*\}")
    local_path=ROOT/'dish-local-images.js';local=local_path.read_text(encoding='utf-8')
    sw_path=ROOT/'sw.js';sw=sw_path.read_text(encoding='utf-8')
    index_path=ROOT/'index.html';index=index_path.read_text(encoding='utf-8')
    version=current_version()+1
    catalog_text=re.sub(r"(catalog-quantities\.js\?v=)\d+",rf"\g<1>{version}",catalog_text,count=1)
    catalog_text=re.sub(r"(dish-local-images\.js\?v=)\d+",rf"\g<1>{version}",catalog_text,count=1)
    local=re.sub(r"const APP_VERSION='v\d+'",f"const APP_VERSION='v{version}'",local,count=1)
    local=re.sub(r"(purchase-intelligence\.js\?v=)\d+",rf"\g<1>{version}",local,count=1)
    sw=re.sub(r"const CACHE='courses-app-v\d+-r\d+'",f"const CACHE='courses-app-v{version}-r1'",sw,count=1)
    sw=ensure_shell(sw,[f'./catalog.js?v={version}',f'./app.js?v={version}',f'./catalog-quantities.js?v={version}',f'./dish-local-images.js?v={version}',f'./purchase-intelligence.js?v={version}'])
    index,count=re.subn(r'(<span class="page-version">)v\d+(</span>)',rf'\g<1>v{version}\g<2>',index)
    if count!=3:fail('Badges de version visibles introuvables')
    index=re.sub(r'(catalog\.js\?v=)\d+',rf'\g<1>{version}',index,count=1)
    index=re.sub(r'(app\.js\?v=)\d+',rf'\g<1>{version}',index,count=1)
    catalog_path.write_text(catalog_text,encoding='utf-8');quantities_path.write_text(quantities,encoding='utf-8')
    app_path.write_text(app,encoding='utf-8');intelligence_path.write_text(intelligence,encoding='utf-8')
    local_path.write_text(local,encoding='utf-8');sw_path.write_text(sw,encoding='utf-8');index_path.write_text(index,encoding='utf-8')
    filename=base.slugify(name)+'.webp'
    RESULT_PATH.write_text(json.dumps({'ok':True,'deleted':True,'already_exists':False,'name':name,'version':version,'filename':filename,'category':category,'subgroup':subgroup},ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':
    try:main()
    except Exception as error:
        if not RESULT_PATH.exists():RESULT_PATH.write_text(json.dumps({'ok':False,'deleted':False,'error':str(error)},ensure_ascii=False,indent=2),encoding='utf-8')
        print(str(error),file=sys.stderr);sys.exit(1)
