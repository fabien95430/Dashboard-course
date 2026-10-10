import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const assetPath=value=>String(value).split('?')[0];

function shellAssets(){
  const sw=read('sw.js');
  const match=sw.match(/const SHELL=\[(.*?)\];/s);
  assert.ok(match,'Précache SHELL introuvable');
  return [...match[1].matchAll(/["'](\.\/[^"']+)["']/g)].map(entry=>entry[1]);
}

function runtimeAssets(){
  const visited=new Set();
  const assets=new Set();
  function walk(file){
    if(visited.has(file))return;
    visited.add(file);
    const source=read(file);
    for(const match of source.matchAll(/["'](\.\/[^"'\s]+\.(?:js|css)(?:\?[^"'\s]*)?)["']/g)){
      const url=match[1];
      const next=assetPath(url).replace(/^\.\//,'');
      if(next==='sw.js'||url.includes('courses_catalog_admin='))continue;
      assets.add(url);
      walk(next);
    }
  }
  walk('index.html');
  return {visited,assets:[...assets]};
}

test('le précache ne garde qu une URL active par chemin',()=>{
  const shell=shellAssets();
  const paths=shell.map(assetPath);
  assert.equal(new Set(paths).size,paths.length,'Le SHELL contient plusieurs versions du même fichier');
  assert.ok(shell.length<=36,'Le SHELL ne doit plus accumuler les anciennes générations');
});

test('tout le graphe JS CSS actif est précaché avec son URL exacte',()=>{
  const shell=new Set(shellAssets());
  const {assets}=runtimeAssets();
  const missing=assets.filter(asset=>!shell.has(asset));
  assert.deepEqual(missing,[],'Ressources actives absentes du SHELL');
});

test('les anciens modules candidats au nettoyage restent hors du graphe actif',()=>{
  const shell=shellAssets().map(assetPath);
  const {visited}=runtimeAssets();
  for(const file of ['startup/app.js','missing-products-fixes-core.js','list-actions.js','list-swipe.js']){
    assert.equal(visited.has(file),false,file+' ne doit pas être chargé');
    assert.equal(shell.includes('./'+file),false,file+' ne doit pas être précaché');
  }
});

test('les intégrateurs partagent une déduplication du précache par chemin',()=>{
  const base=read('scripts/integrate_dish.py');
  const product=read('scripts/integrate_product_openai.py');
  const admin=read('scripts/manage_product_catalog.py');
  assert.match(base,/asset\.split\('\?',\s*1\)\[0\]/);
  assert.match(base,/seen_paths/);
  assert.match(product,/return base\.ensure_shell_assets\(text,\s*assets\)/);
  assert.match(admin,/return base\.ensure_shell_assets\(text,\s*assets\)/);
});
