import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Garde-fou du cache des visuels : le service worker compare le CONTENU des images (empreintes),
// jamais une liste tenue à la main ni les ETag/Last-Modified de GitHub Pages (remis à neuf à chaque mise en ligne).
const root=new URL('../',import.meta.url);
const sw=readFileSync(new URL('sw.js',root),'utf8');
const FOLDERS=['Items','Plats/cartes','Plats/fiches'];

function expectedHashes(){
  const hashes={};
  for(const folder of FOLDERS){
    const dir=new URL('www/'+folder+'/',root);
    if(!existsSync(dir))continue;
    for(const name of readdirSync(dir).sort()){
      if(name.startsWith('.'))continue;
      const file=new URL(name,dir);
      if(!statSync(file).isFile())continue;
      hashes[folder+'/'+name]=createHash('sha256').update(readFileSync(file)).digest('hex').slice(0,10);
    }
  }
  return hashes;
}
function manifest(){
  const line=sw.split('\n').find(line=>line.startsWith('const VISUAL_HASHES='));
  assert.ok(line,'ligne VISUAL_HASHES absente de sw.js');
  return JSON.parse(line.slice('const VISUAL_HASHES='.length,-1));
}

test('les empreintes des visuels de sw.js correspondent exactement aux fichiers du dépôt',()=>{
  const actual=manifest();
  const expected=expectedHashes();
  const stale=Object.keys(expected).filter(key=>actual[key]!==expected[key]);
  const orphan=Object.keys(actual).filter(key=>!(key in expected));
  assert.deepEqual({stale,orphan},{stale:[],orphan:[]},'Empreintes obsolètes : lancer python3 scripts/update_visual_hashes.py puis committer sw.js');
});

test('aucune liste manuelle de visuels à invalider n est réintroduite',()=>{
  assert.doesNotMatch(sw,/UPDATED_ITEM_VISUALS/);
  assert.doesNotMatch(sw,/const [A-Z_]*(?:UPDATED|CHANGED|STALE|RENEWED|INVALIDATED)[A-Z_]*\s*=/);
  assert.doesNotMatch(sw,/www\/(?:Items|Plats)\/[^'"\s]+\.(?:webp|png)/,'aucun visuel ne doit être cité un par un dans sw.js');
  assert.match(sw,/\.then\(\(\)=>pruneChangedVisuals\(\)\.catch\(\(\)=>\{\}\)\)/);
  assert.match(sw,/if\(expectedHash\)\{\s*event\.respondWith\(serveHashedVisual\(event\.request,expectedHash\)\);/);
});

// Service worker exécuté avec un cache et un réseau simulés.
function loadWorker(network){
  const store=new Map();
  const cache={
    async match(request){const hit=store.get(typeof request==='string'?request:request.url);return hit?hit.clone():undefined},
    async put(request,response){store.set(typeof request==='string'?request:request.url,response)},
    async delete(request){return store.delete(typeof request==='string'?request:request.url)},
    async keys(){return [...store.keys()].map(url=>new Request(url))}
  };
  const fetched=[];
  const context={
    self:{addEventListener(){},location:{href:'https://exemple.test/'},skipWaiting(){},clients:{claim(){}}},
    caches:{open:async()=>cache,keys:async()=>[],match:async()=>undefined,delete:async()=>true},
    fetch:async request=>{fetched.push(request.url);const body=network.get(request.url);if(!body)throw new TypeError('hors ligne');return new Response(body,{status:200})},
    crypto:globalThis.crypto,Response,Headers,Request,URL,Uint8Array,Array,Object,Promise,console
  };
  vm.createContext(context);
  vm.runInContext(sw,context);
  return {store,fetched,run:name=>vm.runInContext(name,context)};
}
const base='https://exemple.test/www/';
const keys=Object.keys(manifest()).filter(key=>key.startsWith('Items/'));
const [unchangedKey,changedKey]=keys;

test('à la mise à jour, seul le visuel modifié ou supprimé quitte le cache, sans aucun téléchargement',async()=>{
  const worker=loadWorker(new Map());
  const current=readFileSync(new URL('www/'+unchangedKey,root));
  await worker.store.set(base+unchangedKey,new Response(current,{status:200}));
  await worker.store.set(base+changedKey,new Response(new Uint8Array([1,2,3]),{status:200}));
  await worker.store.set(base+'Items/produit-supprime.webp',new Response(new Uint8Array([4]),{status:200}));
  await worker.run('pruneChangedVisuals')();
  assert.ok(worker.store.has(base+unchangedKey),'visuel inchangé conservé');
  assert.equal(worker.store.get(base+unchangedKey).headers.get('X-Courses-Hash'),manifest()[unchangedKey]);
  assert.ok(!worker.store.has(base+changedKey),'visuel modifié retiré');
  assert.ok(!worker.store.has(base+'Items/produit-supprime.webp'),'visuel supprimé retiré');
  assert.deepEqual(worker.fetched,[]);
});

test('un visuel à jour est servi du cache, un visuel modifié est téléchargé avant l affichage',async()=>{
  const fresh=readFileSync(new URL('www/'+changedKey,root));
  const worker=loadWorker(new Map([[base+changedKey,fresh]]));
  const serve=worker.run('serveHashedVisual');
  const hashes=manifest();
  const first=await serve(new Request(base+changedKey),hashes[changedKey]);
  assert.deepEqual(Buffer.from(await first.arrayBuffer()),fresh);
  assert.deepEqual(worker.fetched,[base+changedKey]);
  const second=await serve(new Request(base+changedKey),hashes[changedKey]);
  assert.deepEqual(Buffer.from(await second.arrayBuffer()),fresh);
  assert.equal(worker.fetched.length,1,'deuxième affichage sans réseau');
});

test('hors ligne, l ancienne copie reste affichée plutôt qu une image vide',async()=>{
  const worker=loadWorker(new Map());
  await worker.store.set(base+changedKey,new Response(new Uint8Array([9,9]),{status:200,headers:{'X-Courses-Hash':'ancienne00'}}));
  const response=await worker.run('serveHashedVisual')(new Request(base+changedKey),manifest()[changedKey]);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[9,9]);
});
