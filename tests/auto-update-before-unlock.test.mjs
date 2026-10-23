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
