import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(join(root,path),'utf8');

function javascriptFiles(dir=root){
  const files=[];
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git'||entry.name==='node_modules')continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())files.push(...javascriptFiles(path));
    else if(entry.isFile()&&entry.name.endsWith('.js'))files.push(path);
  }
  return files;
}

test('app.js expose un client Home Assistant partagé, figé et volontairement étroit',()=>{
  const source=read('app.js');
  const start=source.indexOf('const COURSES_HA_CLIENT=Object.freeze({');
  const end=source.indexOf("Object.defineProperty(window,'COURSES_HA_CLIENT'",start);
  assert.ok(start>=0&&end>start,'client Home Assistant partagé introuvable');
  const api=source.slice(start,end);
  assert.match(api,/request:payload=>haClientRequest\(payload\)/);
  assert.match(api,/callService:\(domain,service,serviceData=\{\}\)=>haClientRequest/);
  assert.match(api,/getStates:\(\)=>haClientRequest\(\{type:'get_states'\}\)/);
  assert.match(api,/isConnected:haClientIsConnected/);
  assert.doesNotMatch(api,/accessToken|refreshToken|state\.ws|haUrl/);
  assert.match(source,/Object\.defineProperty\(window,'COURSES_HA_CLIENT',[\s\S]*?configurable:false,[\s\S]*?enumerable:false,[\s\S]*?writable:false/);
});

test('le client partagé respecte verrouillage, mode test et fermeture du socket',()=>{
  const source=read('app.js');
  const start=source.indexOf('async function haClientRequest(payload)');
  const end=source.indexOf('const COURSES_HA_CLIENT=Object.freeze({',start);
  const request=source.slice(start,end);
  assert.match(request,/if\(state\.demo\)throw new Error/);
  assert.match(request,/if\(state\.locked\)throw new Error\(STATUS_TEXT\.unlockRequired\)/);
  assert.match(request,/UI\.refreshBtn\?\.click\(\)/);
  assert.match(request,/Date\.now\(\)-started<1800/);
  assert.match(request,/return request\(payload\)/);
  assert.match(source,/function closeSocket\(\)[\s\S]*?state\.intentionalClose=true;[\s\S]*?state\.ws\?\.close\(\)[\s\S]*?state\.ws=null;[\s\S]*?state\.pending\.clear\(\)/);
  assert.match(source,/clearLockTimers\(\);\s*closeSocket\(\);\s*wipeMemoryCredentials\(\);/);
});

test('les consommateurs Home Assistant passent par le client partagé',()=>{
  for(const file of ['missing-products-fixes.js','catalog-product-admin.js']){
    const source=read(file);
    assert.match(source,/window\.COURSES_HA_CLIENT/,file+' ne consomme pas le client partagé');
    assert.doesNotMatch(source,/\bhaSocket\b|\bhaSeq\b|\bhaPending\b/,file+' conserve un état WebSocket parallèle');
  }
  const fixes=read('missing-products-fixes.js');
  const admin=read('catalog-product-admin.js');
  assert.match(fixes,/sharedHaClient\(\)\.getStates\(\)/);
  assert.match(fixes,/sharedHaClient\(\)\.callService\(domain,service,serviceData\)/);
  assert.match(admin,/sharedHaClient\(\)\.getStates\(\)/);
  assert.match(admin,/sharedHaClient\(\)\.callService\('rest_command','courses_integrate_dish_openai'/);
});

test('aucun JavaScript du dépôt ne remplace WebSocket.prototype.send',()=>{
  const offenders=[];
  for(const path of javascriptFiles()){
    const source=readFileSync(path,'utf8');
    if(/WebSocket\.prototype\.send\s*=|window\.WebSocket\.prototype\.send\s*=/.test(source))offenders.push(path.slice(root.length+1));
  }
  assert.deepEqual(offenders,[]);
});
