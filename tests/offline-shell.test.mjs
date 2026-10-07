import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('le précache seul couvre les scripts et styles chargés par la page',async()=>{
  const root=new URL('../',import.meta.url);
  const origin='https://example.test/Dashboard-course/';
  const entries=new Map();
  const listeners=new Map();
  const cache={
    async addAll(urls){for(const url of urls)entries.set(new URL(url,origin).href,new Response(url));},
    async match(request){return entries.get(typeof request==='string'?new URL(request,origin).href:request.url)?.clone();},
    async keys(){return [];},
    async put(){}
  };
  vm.runInNewContext(readFileSync(new URL('sw.js',root),'utf8'),{
    URL,Request,Response,
    self:{location:{origin:new URL(origin).origin},addEventListener:(type,handler)=>listeners.set(type,handler),skipWaiting:async()=>{},clients:{claim:async()=>{}}},
    caches:{open:async()=>cache,keys:async()=>[],match:request=>cache.match(request)},
    fetch:async()=>{throw new Error('offline');}
  });
  let install;
  listeners.get('install')({waitUntil:promise=>{install=promise;}});
  await install;
  const visited=new Set();
  const requests=new Set();
  function walk(file){
    if(visited.has(file))return;
    visited.add(file);
    const source=readFileSync(new URL(file,root),'utf8');
    for(const match of source.matchAll(/["'](\.\/[^"'\s]+\.(?:js|css)(?:\?[^"'\s]*)?)["']/g)){
      const next=match[1].replace(/^\.\//,'').split('?')[0];
      if(next==='sw.js')continue;
      requests.add(match[1]);walk(next);
    }
  }
  walk('index.html');
  const missing=[];
  for(const url of requests){
    let response;
    listeners.get('fetch')({request:new Request(new URL(url,origin)),respondWith:promise=>{response=promise;},waitUntil(){}});
    if(!(await response).ok)missing.push(url);
  }
  assert.deepEqual(missing,[],'URLs chargées non disponibles depuis le précache');
});
