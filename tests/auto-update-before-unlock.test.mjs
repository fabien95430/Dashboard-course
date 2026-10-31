import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=app.indexOf('const UNLOCK_UPDATE_TIMEOUT_MS=');
const end=app.indexOf("/* Mise à jour depuis l'en-tête",start);
assert.ok(start>0&&end>start,'Contrôle de mise à jour au déverrouillage introuvable');
const checkSource=app.slice(start,end);

function harness({online=true,available=false,shouldFail=false,hang=false,version=620,storage=new Map()}={}){
  const calls=[];
  const button={disabled:false};
  const timers=[];
  const context={
    navigator:{onLine:online},
    UI:{securitySubmit:button},
    state:{securityMode:'unlock'},
    currentAppVersion:()=>version,
    sessionStorage:{getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
    setTimeout:(fn)=>{timers.push(fn);return timers.length},
    clearTimeout:()=>{},
    installLatestAppVersion:async()=>{
      calls.push('check');
      if(shouldFail)throw new Error('réseau indisponible');
      if(hang)return new Promise(()=>{});
      return available;
    },
    location:{reload:()=>calls.push('reload')},
    console:{warn:()=>calls.push('warn')}
  };
  const check=vm.runInNewContext(
    'let unlockVersionChecked=false;let unlockVersionCheckPromise=null;'+checkSource+';checkForUpdateBeforeUnlock',
    context
  );
  return {check,calls,button,timers,storage};
}

test('un déverrouillage commence par une vérification de version avant la récupération des jetons',()=>{
  assert.match(app,/function showSecurity\(mode,message=''\)[\s\S]*?if\(mode==='unlock'\)void gateUnlockOnUpdate\(\);\s*else focusSecurityPassword\(\);/);
  // Le champ mot de passe ne reçoit le curseur (et la fenêtre d'identifiants iOS) qu'après la vérification.
  assert.match(app,/async function gateUnlockOnUpdate\(\)\{[\s\S]*?if\(unlockVersionCheckPromise\)setUnlockGate\(true\);\s*const reloading=await checkForUpdateBeforeUnlock\(\);\s*if\(!reloading&&state\.securityMode==='unlock'\)focusSecurityPassword\(\);/);
  assert.match(app,/input\.readOnly=locked/);
  assert.match(app,/const UNLOCK_UPDATE_TIMEOUT_MS=4000;/);
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
  return {ok,headers:{get:()=>'text/html; charset=utf-8'},text:async()=>html,clone(){return response(html,ok)}};
}
function shellHarness({cachedVersion=null,startVersion=null,networkVersion=620}={}){
  const calls=[];
  const store=new Map();
  if(cachedVersion)store.set('./index.html',response(page(cachedVersion)));
  if(startVersion)store.set('./',response(page(startVersion)));
  const cache={
    match:async key=>store.get(key),
    put:async(key,value)=>{calls.push('put '+key);store.set(key,value)}
  };
  const ensure=vm.runInNewContext(shellSource+';ensureCachedShellVersion',{
    Date,Response,AbortController,setTimeout,clearTimeout,
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
  assert.deepEqual(calls,['fetch','put ./index.html']);
  assert.match(await store.get('./index.html').text(),/v620/);
});

test('sans page à jour disponible, aucun rechargement inutile n est demandé',async()=>{
  const {ensure,cache,calls}=shellHarness({cachedVersion:619,networkVersion:619});
  assert.equal(await ensure(cache,620),false);
  assert.deepEqual(calls,['fetch']);
});

test('un contrôle de version qui ne répond pas ne bloque plus le bouton Connexion',async()=>{
  const {check,calls,button,timers}=harness({hang:true});
  const pending=check();
  assert.equal(button.disabled,true);
  await Promise.resolve();
  timers.forEach(fn=>fn());
  assert.equal(await pending,false);
  assert.equal(button.disabled,false);
  assert.equal(calls.includes('reload'),false);
});

test('après un rechargement de mise à jour resté sur la même version, pas de boucle de rechargement',async()=>{
  const storage=new Map();
  const first=harness({available:true,storage});
  assert.equal(await first.check(),true);
  const second=harness({available:true,storage});
  assert.equal(await second.check(),false);
  assert.deepEqual(second.calls,[]);
  assert.equal(second.button.disabled,false);
  // Page rechargée sur la nouvelle version : pas de seconde attente, et le repère est effacé.
  const updated=harness({available:false,version:621,storage});
  assert.equal(await updated.check(),false);
  assert.deepEqual(updated.calls,[]);
  assert.equal(storage.size,0);
  const later=harness({available:false,version:621,storage});
  assert.equal(await later.check(),false);
  assert.deepEqual(later.calls,['check']);
});

test('l adresse de démarrage précachée périmée est corrigée avec index.html',async()=>{
  const {ensure,cache,calls,store}=shellHarness({cachedVersion:620,startVersion:619,networkVersion:620});
  assert.equal(await ensure(cache,620),true);
  assert.deepEqual(calls,['fetch','put ./']);
  assert.match(await store.get('./').text(),/v620/);
  const fresh=shellHarness({cachedVersion:620,startVersion:620});
  assert.equal(await fresh.ensure(fresh.cache,620),true);
  assert.deepEqual(fresh.calls,[]);
});

const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
test('les contrôles de version ne sont jamais conservés dans le cache du service worker',()=>{
  assert.match(sw,/url\.searchParams\.has\('courses-version-check'\)\|\|url\.searchParams\.has\('courses-shell-refresh'\)\)return;/);
  assert.ok(sw.indexOf("courses-version-check")<sw.indexOf("event.request.mode==='navigate'"));
});

const headerStart=app.indexOf("/* Mise à jour depuis l'en-tête");
const headerEnd=app.indexOf('function bindUiEvents(',headerStart);
assert.ok(headerStart>0&&headerEnd>headerStart,'Rafraîchissement de l en-tête introuvable');
const headerSource=app.slice(headerStart,headerEnd);
function headerHarness({update='none',hang=false}={}){
  const calls=[],timers=[];
  const statusEl={textContent:'',dataset:{}};
  const classes=new Set();
  const button={disabled:false,classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)}};
  const context={
    console:{warn:()=>{}},Intl,Date,
    setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout:()=>{},
    document:{getElementById:()=>statusEl},
    latestAppVersionStatus:async()=>{calls.push('check');return hang?new Promise(()=>{}):update},
    refreshItems:async()=>calls.push('items'),
    location:{reload:()=>calls.push('reload')}
  };
  const refresh=vm.runInNewContext(headerSource+';refreshFromHeader',context);
  return {refresh:()=>refresh(button,true),calls,statusEl,button,timers};
}

test('la flèche distingue version à jour, nouvelle version prête et mise à jour non terminée',async()=>{
  const none=headerHarness({update:'none'});
  await none.refresh();
  assert.deepEqual(none.calls,['check','items']);
  assert.match(none.statusEl.textContent,/^À jour/);
  const ready=headerHarness({update:'ready'});
  await ready.refresh();
  assert.deepEqual(ready.calls,['check','reload']);
  const pending=headerHarness({update:'pending'});
  await pending.refresh();
  assert.deepEqual(pending.calls,['check','items']);
  assert.equal(pending.statusEl.textContent,'Mise à jour non terminée · réessayez');
  assert.equal(pending.statusEl.dataset.state,'error');
});

test('la flèche ne tourne plus indéfiniment si la mise à jour ne répond pas',async()=>{
  const stuck=headerHarness({hang:true});
  const run=stuck.refresh();
  await Promise.resolve();await Promise.resolve();
  assert.equal(stuck.button.disabled,true);
  stuck.timers[0]();
  await run;
  assert.equal(stuck.button.disabled,false);
  assert.deepEqual(stuck.calls,['check','items']);
  assert.equal(stuck.statusEl.textContent,'Mise à jour non terminée · réessayez');
});

test('le retour au premier plan ne réinitialise pas un écran de connexion déjà affiché',()=>{
  const start=app.indexOf('function resumeForegroundSession(){');
  const body=app.slice(start,app.indexOf("document.addEventListener('visibilitychange'",start));
  assert.match(body,/if\(state\.locked\)\{[\s\S]*?if\(UI\.securityOverlay\.classList\.contains\('is-visible'\)&&state\.securityMode==='unlock'\)return;\s*showSecurity\('unlock'\);/);
});
