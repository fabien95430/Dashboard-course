import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const origin='https://example.test/Dashboard-course/';
const sw=readFileSync(new URL('sw.js',root),'utf8');
const cacheName=sw.match(/^const CACHE='([^']+)'/m)[1];

function loadWorker({fetchImpl,visualEntries=new Map()}){
  const shell=new Map();
  const listeners=new Map();
  const puts=[];
  const keyOf=request=>typeof request==='string'?new URL(request,origin).href:request.url;
  const makeCache=(store,name)=>({
    async addAll(urls){for(const url of urls)store.set(new URL(url,origin).href,new Response(url));},
    async match(request){return store.get(keyOf(request))?.clone();},
    async keys(){return [];},
    async put(request,response){puts.push(name);store.set(keyOf(request),response);}
  });
  const shellCache=makeCache(shell,'shell'),visualCache=makeCache(visualEntries,'visual');
  vm.runInNewContext(sw,{
    URL,Request,Response,Headers,
    self:{location:{origin:new URL(origin).origin},addEventListener:(type,handler)=>listeners.set(type,handler),skipWaiting:async()=>{},clients:{claim:async()=>{}}},
    caches:{open:async name=>name===cacheName?shellCache:visualCache,keys:async()=>[],match:request=>shellCache.match(request)},
    fetch:fetchImpl
  });
  return {listeners,puts,visualEntries};
}

test('sur réseau lent, chaque script et style de la page part du cache sans attendre le réseau',async()=>{
  const network=[];
  const {listeners}=loadWorker({fetchImpl:request=>{network.push(String(request.url||request));return new Promise(()=>{})}});
  let install;
  listeners.get('install')({waitUntil:promise=>{install=promise;}});
  // addAll est simulé : l'installation n'utilise pas le réseau.
  await Promise.race([install,new Promise(resolve=>setTimeout(resolve,50))]);
  const index=readFileSync(new URL('index.html',root),'utf8');
  const urls=[...index.matchAll(/(?:src|href)="(\.\/[^"]+\.(?:js|css)\?v=\d+)"/g)].map(match=>match[1]);
  assert.ok(urls.length>=10,'scripts et styles de démarrage introuvables');
  const slow=[];
  for(const url of urls){
    let response;
    listeners.get('fetch')({request:new Request(new URL(url,origin)),respondWith:promise=>{response=promise;},waitUntil(){}});
    const result=await Promise.race([response,new Promise(resolve=>setTimeout(()=>resolve('timeout'),50))]);
    if(result==='timeout'||!result.ok)slow.push(url);
  }
  assert.deepEqual(slow,[],'Fichiers de démarrage bloqués par le réseau');
});

test('un visuel déjà vérifié pour cette version n est plus re-téléchargé à chaque lancement',async()=>{
  const fetched=[];
  const fetchImpl=async request=>{fetched.push(request.url);return new Response('image',{status:200});};
  const visual=new URL('www/Items/pommes.webp',origin).href;
  const tagged=new Map([[visual,new Response('image',{headers:{'X-Courses-Refreshed':cacheName}})]]);
  const first=loadWorker({fetchImpl,visualEntries:tagged});
  const waits=[];
  let response;
  first.listeners.get('fetch')({request:new Request(visual),respondWith:promise=>{response=promise;},waitUntil:promise=>waits.push(promise)});
  assert.equal((await response).ok,true);
  await Promise.all(waits);
  assert.deepEqual(fetched,[]);

  const untagged=new Map([[visual,new Response('ancienne image')]]);
  const second=loadWorker({fetchImpl,visualEntries:untagged});
  const waits2=[];
  second.listeners.get('fetch')({request:new Request(visual),respondWith:promise=>{response=promise;},waitUntil:promise=>waits2.push(promise)});
  assert.equal(await (await response).text(),'ancienne image','l image affichée vient du cache');
  await Promise.all(waits2);
  assert.deepEqual(fetched,[visual]);
  assert.equal(untagged.get(visual).headers.get('X-Courses-Refreshed'),cacheName);
});
