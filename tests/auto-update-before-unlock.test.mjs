import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=app.indexOf('async function checkForUpdateBeforeUnlock(){');
const end=app.indexOf('async function refreshFromHeader(',start);
assert.ok(start>0&&end>start,'Contrôle de mise à jour au déverrouillage introuvable');
const checkSource=app.slice(start,end);

function harness({online=true,available=false,shouldFail=false}={}){
  const calls=[];
  const button={disabled:false};
  const context={
    navigator:{onLine:online},
    UI:{securitySubmit:button},
    state:{securityMode:'unlock'},
    installLatestAppVersion:async()=>{
      calls.push('check');
      if(shouldFail)throw new Error('réseau indisponible');
      return available;
    },
    location:{reload:()=>calls.push('reload')},
    console:{warn:()=>calls.push('warn')}
  };
  const check=vm.runInNewContext(
    'let unlockVersionChecked=false;let unlockVersionCheckPromise=null;'+checkSource+';checkForUpdateBeforeUnlock',
    context
  );
  return {check,calls,button};
}

test('un déverrouillage commence par une vérification de version avant la récupération des jetons',()=>{
  assert.match(app,/function showSecurity\(mode,message=''\)[\s\S]*?if\(mode==='unlock'\)void checkForUpdateBeforeUnlock\(\)/);
  assert.match(app,/if\(state\.securityMode==='unlock'\)\{\s*if\(await unlockVersionCheckPromise\)return;\s*const payload=await decryptVault/);
});

test('une nouvelle version déclenche un seul rechargement avant connexion',async()=>{
  const {check,calls,button}=harness({available:true});
  assert.equal(await check(),true);
  assert.deepEqual(calls,['check','reload']);
  assert.equal(button.disabled,true);
  assert.equal(await check(),false);
  assert.deepEqual(calls,['check','reload']);
});

test('sans mise à jour ou si le contrôle échoue, le déverrouillage reste possible',async()=>{
  for(const opts of [{},{shouldFail:true}]){
    const {check,calls,button}=harness(opts);
    assert.equal(await check(),false);
    assert.equal(button.disabled,false);
    assert.equal(calls.includes('reload'),false);
  }
  const offline=harness({online:false});
  assert.equal(await offline.check(),false);
  assert.deepEqual(offline.calls,[]);
  assert.equal(offline.button.disabled,false);
});

test('la vérification reste ponctuelle et la liste est relue après authentification',()=>{
  assert.match(app,/await connectWs\(token\);[\s\S]*?await subscribe\(\);\s*await refreshItems\(\)/);
  assert.match(app,/const cacheNames=await caches.keys\(\);[\s\S]*?name\.startsWith\('courses-app-v'\+latest\+'-'\)/);
  assert.match(app,/const timeout=setTimeout\(\(\)=>controller\.abort\(\),4000\)/);
});

const shellStart=app.indexOf('function htmlAppVersion(');
const shellEnd=app.indexOf('function waitForServiceWorkerActivation(',shellStart);
assert.ok(shellStart>0&&shellEnd>shellStart,'Vérification de la page précachée introuvable');
const shellSource=app.slice(shellStart,shellEnd);
const page=version=>'<h1>Ma liste <span class="page-version">v'+version+'</span></h1>';
function response(html,ok=true){
  return {ok,text:async()=>html,clone(){return response(html,ok)}};
}
function shellHarness({cachedVersion=null,networkVersion=620}={}){
  const calls=[];
  const store=new Map(cachedVersion?[['./index.html',response(page(cachedVersion))]]:[]);
  const cache={
    match:async key=>store.get(key),
    put:async(key,value)=>{calls.push('put');store.set(key,value)}
  };
  const ensure=vm.runInNewContext(shellSource+';ensureCachedShellVersion',{
    Date,
    fetch:async()=>{calls.push('fetch');return response(page(networkVersion))}
  });
  return {ensure,cache,calls,store};
}

test('une page d accueil précachée à jour permet le rechargement immédiat',async()=>{
  const {ensure,cache,calls}=shellHarness({cachedVersion:620});
  assert.equal(await ensure(cache,620),true);
  assert.deepEqual(calls,[]);
});

test('une page d accueil précachée périmée est remplacée avant le rechargement',async()=>{
  const {ensure,cache,calls,store}=shellHarness({cachedVersion:619,networkVersion:620});
  assert.equal(await ensure(cache,620),true);
  assert.deepEqual(calls,['fetch','put']);
  assert.match(await store.get('./index.html').text(),/v620/);
});

test('sans page à jour disponible, aucun rechargement inutile n est demandé',async()=>{
  const {ensure,cache,calls}=shellHarness({cachedVersion:619,networkVersion:619});
  assert.equal(await ensure(cache,620),false);
  assert.deepEqual(calls,['fetch']);
});
