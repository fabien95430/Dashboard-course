import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

function loadAdmin(extra={}){
  const sandbox={
    console,
    document:{readyState:'complete',addEventListener(){},querySelector:()=>null,getElementById:()=>null,documentElement:{dataset:{}}},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
    COURSES_TEXT:{key:v=>String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim()},
    COURSES_CATALOG:{groups:{Frais:{Yaourts:['Yaourts nature']},'Fruits & Légumes':{Fruits:['Pommes']}}},
    COURSES_DISH_BASE:{'Penne poulet crème':['Penne','Poulet','Crème fraîche','Champignons','Parmesan']},
    COURSES_FAMILY:{displayName:id=>{const w=String(id||'').split('@')[0].split(/[._\-\s\d]+/).filter(Boolean);const f=(/^famille$/i.test(w[0]||'')?w[1]:w[0])||'';return f?f[0].toUpperCase()+f.slice(1).toLowerCase():''}},
    ...extra
  };
  sandbox.window=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('family-admin.js'),sandbox);
  return sandbox.COURSES_FAMILY_ADMIN;
}

test('foyers : regroupés par famille, nommés depuis l’identifiant, sans mélange',()=>{
  const admin=loadAdmin();
  const families=admin.buildFamilies({
    families:[{id:'a',email:'karina@famille.invalid'},{id:'b',email:'stephany.maison@hotmail.fr'},{id:'c',email:'marie@famille.invalid'}],
    devices:[{id:'d1',famille:'a',nom:'iPhone'}],
    requests:[{id:'r1',famille:'b',type:'plat',nom:'Paëlla'},{id:'r2',famille:'a',type:'produit',nom:'Kombucha'}],
    purchases:[{famille:'a',nom:'Pommes',coche_le:new Date().toISOString()}],
    customizations:[]
  });
  assert.equal(JSON.stringify(families.map(f=>f.name)),JSON.stringify(['Famille Karina','Famille Marie','Famille Stephany']));
  const dupont=families.find(f=>f.id==='a');
  assert.equal(dupont.devices.length,1);
  assert.equal(dupont.requests.map(r=>r.nom).join(),'Kombucha');
  assert.equal(families.find(f=>f.id==='b').requests[0].nom,'Paëlla');
});

test('foyers : sans la fonction familles(), les foyers sont déduits de leur activité',()=>{
  const admin=loadAdmin();
  const families=admin.buildFamilies({families:[],devices:[{id:'d',famille:'x',nom:'iPad'}],requests:[],purchases:[],customizations:[]});
  assert.equal(families.length,1);
  assert.equal(families[0].name,'Famille 1');
});

test('stats : courses du mois, produits cochés, plus achetés et catégories',()=>{
  const admin=loadAdmin();
  const now=Date.UTC(2026,10,20,12);
  const day=d=>new Date(Date.UTC(2026,10,d,10)).toISOString();
  const stats=admin.statsFor([
    {nom:'Pommes',coche_le:day(6)},{nom:'Pommes',coche_le:day(13)},{nom:'Pommes',coche_le:day(20)},
    {nom:'Yaourts nature',coche_le:day(13)}
  ],now);
  assert.equal(stats.courses,3);
  assert.equal(stats.checked,4);
  assert.equal(stats.top[0].name,'Pommes');
  assert.equal(stats.top[0].count,3);
  assert.equal(stats.top[0].rhythm,'chaque semaine');
  assert.equal(stats.categories[0].name,'Fruits & Légumes');
  assert.equal(stats.categories[0].share,'75 %');
});

test('modifs : écart avec le plat de base, sans jamais changer la base',()=>{
  const base={'Penne poulet crème':['Penne','Poulet','Crème fraîche','Champignons','Parmesan']};
  const admin=loadAdmin({COURSES_DISH_BASE:base});
  const modifs=admin.modifsFor([
    {recette_id:'Penne poulet crème',donnees:['Penne','Dinde','Crème fraîche','Champignons','Parmesan']},
    {recette_id:'Plat inconnu',donnees:['Riz']},
    {recette_id:'Penne poulet crème',donnees:['Penne','Poulet','Crème fraîche','Champignons','Parmesan']}
  ]);
  assert.equal(modifs.length,1);
  assert.equal(modifs[0].detail,'Poulet → Dinde');
  assert.deepEqual([...base['Penne poulet crème']],['Penne','Poulet','Crème fraîche','Champignons','Parmesan']);
});

test('Familles : demandes avec OpenAI, ChatGPT et refus confirmé, via les modules propriétaires',()=>{
  const source=read('family-admin.js');
  assert.match(source,/data-tool="openai"/);
  assert.match(source,/data-tool="chatgpt"/);
  assert.match(source,/data-tool="ask-refuse"/);
  assert.match(source,/COURSES_OPENAI_INTEGRATION\?\.start\(/);
  assert.match(source,/COURSES_CHATGPT_INTEGRATION\?\.start\(/);
  assert.match(source,/adminSetRequestStatus\(/);
  assert.doesNotMatch(source,/MutationObserver/);
  assert.match(read('missing-products-fixes.js'),/window\.COURSES_OPENAI_INTEGRATION=Object\.freeze/);
  assert.match(read('missing-products-dishes.js'),/window\.COURSES_CHATGPT_INTEGRATION=Object\.freeze/);
  // Les demandes des familles n'alimentent jamais « À intégrer » de l'administrateur.
  assert.doesNotMatch(source,/writeProducts|writeDishes|COURSES_MISSING_REQUESTS/);
});

test('coffre : l’accès admin du service famille est chiffré avec le reste et préservé au changement de mot de passe',()=>{
  const app=read('app.js');
  assert.match(app,/payload\.family_admin=\{email:/);
  assert.match(app,/storeSecureVault\(payload\.refresh_token,payload\.ha_url,next,payload\.family_admin\|\|null\)/);
  assert.match(app,/state\.familyAdmin=payload\.family_admin\|\|null/);
  assert.match(app,/Object\.defineProperty\(window,'COURSES_ADMIN_ACCESS'/);
  assert.doesNotMatch(app,/localStorage\.setItem\([^)]*family_admin/);
});
