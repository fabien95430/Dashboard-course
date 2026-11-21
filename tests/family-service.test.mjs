import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

function loadService(){
  const store=new Map();
  const listeners={};
  const sandbox={
    console,
    crypto:globalThis.crypto,
    setTimeout,clearTimeout,
    localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    document:{addEventListener:(t,f)=>{(listeners[t]||=[]).push(f)},dispatchEvent:()=>true,head:{appendChild(){}},createElement:()=>({}),visibilityState:'visible'},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}}
  };
  sandbox.window=sandbox;
  sandbox.window.addEventListener=(t,f)=>{(listeners[t]||=[]).push(f)};
  vm.createContext(sandbox);
  vm.runInContext(read('family-service.js'),sandbox);
  return sandbox.COURSES_FAMILY;
}

test('identifiant famille : adresse interne @famille.invalid, adresse complète conservée',()=>{
  const family=loadService();
  assert.equal(family.emailFor(' Camille '),'camille@famille.invalid');
  assert.equal(family.emailFor('Stephany.Maison@Hotmail.fr'),'stephany.maison@hotmail.fr');
  assert.equal(family.emailFor(''),'');
  assert.equal(family.displayName('camille@famille.invalid'),'Camille');
  assert.equal(family.displayName('karina@famille.invalid'),'Karina');
  assert.equal(family.displayName('Stephany.Maison@Hotmail.fr'),'Stephany');
  assert.equal(family.displayName('marie-dupont@famille.invalid'),'Marie');
  assert.equal(family.displayName('famille.marie@famille.invalid'),'Marie');
});

test('liste famille : chaque article a un identifiant UUID et l aller-retour ligne ↔ article est fidèle',()=>{
  const family=loadService();
  const {items,changed}=family.ensureUuids([{uid:'demo-1',summary:'Lait',status:'needs_action'},{uid:'8f1c2d3e-4b5a-4c6d-8e7f-001122334455',summary:'Pain',status:'completed',description:'Plat : Croque'}]);
  assert.equal(changed,true);
  assert.match(items[0].uid,/^[0-9a-f-]{36}$/);
  assert.equal(items[1].uid,'8f1c2d3e-4b5a-4c6d-8e7f-001122334455');
  const row=family.itemToRow(items[1],3);
  assert.deepEqual({...row},{id:items[1].uid,nom:'Pain',coche:true,description:'Plat : Croque',ordre:3});
  assert.deepEqual({...family.rowToItem(row)},{uid:items[1].uid,summary:'Pain',status:'completed',description:'Plat : Croque'});
});

test('service famille : clé publishable seulement, bibliothèque embarquée chargée à la demande',()=>{
  const source=read('family-service.js'),index=read('index.html');
  assert.match(source,/key:'sb_publishable_[A-Za-z0-9_-]+'/);
  assert.doesNotMatch(source,/service_role|sb_secret_/);
  assert.match(source,/library:'\.\/vendor\/supabase\.min\.js\?v=\d+'/);
  assert.doesNotMatch(index,/vendor\/supabase\.min\.js/,'la bibliothèque n est pas chargée au démarrage');
  assert.ok(index.indexOf('family-service.js')<index.indexOf('<script src="./app.js'),'le service famille précède app.js');
  assert.ok(read('vendor/supabase.min.js').startsWith('/*! @supabase/supabase-js'));
});

test('le mode admin ne dépend du service famille qu au premier accès sur un appareil',()=>{
  const app=read('app.js');
  const login=app.match(/async function completeLogin\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  const adminBranch=login.slice(0,login.indexOf('enterAdminVaultMode(password,familyAdmin);'));
  // v889 : seul le premier accès vérifie le mot de passe auprès du compte admin Supabase.
  assert.equal((adminBranch.match(/COURSES_FAMILY/g)||[]).length,2);
  assert.ok(adminBranch.indexOf("if(vaultRecord()){showSecurity('unlock');return}")<adminBranch.indexOf('COURSES_FAMILY'));
  // Déverrouillage du coffre : entièrement local.
  const unlock=app.slice(app.indexOf("if(state.securityMode==='unlock'){"),app.indexOf('rememberVaultSeal(password);\n      state.locked=false;'));
  assert.ok(unlock.length>0);
  assert.doesNotMatch(unlock,/COURSES_FAMILY|fetch\(/);
  assert.match(app,/function saveLocalItems\(items\)\{\s*saveJson\(DEMO_KEY,items\);\s*if\(state\.family\)window\.COURSES_FAMILY\?\.listChanged\(\);/);
  assert.doesNotMatch(app,/saveJson\(DEMO_KEY,(?!items\);\s*if\(state\.family\))/);
});

test('compte famille : session conservée, déconnexion et révocation reviennent à la tuile Accès privé',()=>{
  const app=read('app.js');
  assert.match(app,/rememberedAccount\(\)\?\.kind==='family'&&window\.COURSES_FAMILY[\s\S]*?await window\.COURSES_FAMILY\.resume\(\)/);
  assert.match(app,/document\.addEventListener\('courses:family-revoked',\(\)=>\{[\s\S]*?showLogin\('Cet appareil a été déconnecté par l’administrateur\.'\)/);
  const revoke=app.match(/async function revoke\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.match(revoke,/if\(state\.family\)\{[\s\S]*?showLogin\(\);[\s\S]*?await window\.COURSES_FAMILY\?\.signOut\(\);/);
});

test('notifications famille : clé publique propre, abonnements dans le service famille, jamais Home Assistant',()=>{
  const service=read('family-service.js');
  const notif=read('courses-notifications.js');
  assert.match(service,/vapidPublicKey:'B[A-Za-z0-9_-]{80,}'/);
  assert.match(service,/from\('abonnements'\)\.upsert\(row,\{onConflict:'endpoint'\}\)/);
  assert.match(service,/appareil:device\.id/);
  assert.match(notif,/if\(family\(\)\)\{task=registerFamily/);
  assert.match(notif,/if\(family\(\)\|\|!connected\(\)\)return false/);
  assert.doesNotMatch(service+read('supabase/functions/notifier/index.ts'),/VAPID_PRIVATE_KEY\s*[:=]\s*['"][A-Za-z0-9_-]{20,}/);
  const sql=read('supabase/05-famille.sql');
  assert.match(sql,/create table if not exists public\.abonnements/);
  assert.match(sql,/after insert on public\.articles/);
  assert.match(sql,/new\.statut = 'integre'/);
});
