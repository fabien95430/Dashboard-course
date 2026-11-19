import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

function loadBureau(){
  const sandbox={
    console,
    document:{readyState:'complete',addEventListener(){},querySelector:()=>null,getElementById:()=>null,documentElement:{dataset:{}}},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
    COURSES_FAMILY_ADMIN:{familyTitle:email=>{const n=String(email||'').split('@')[0];return n?'Famille '+n[0].toUpperCase()+n.slice(1):'Famille'}}
  };
  sandbox.window=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('bureau-ui.js'),sandbox);
  return sandbox.COURSES_BUREAU;
}

test('bureau : retours nouveaux en cours (étape Reçu), traités terminés, autres comptes ignorés',()=>{
  const bureau=loadBureau();
  const now=Date.UTC(2026,10,19,20);
  const iso=h=>new Date(now-h*36e5).toISOString();
  const result=bureau.buildDossiers([
    {id:'1',famille:'a',type:'correction',message:'Le prix du lait est faux',contexte:{version:'v857',appareil:'iPhone de Marie'},statut:'nouveau',cree_le:iso(30)},
    {id:'2',famille:'b',type:'idee',message:'Trier les plats par temps',statut:'nouveau',cree_le:iso(2)},
    {id:'3',famille:'a',type:'idee',message:'Photo des plats',statut:'traite',cree_le:iso(100),traite_le:iso(90)},
    {id:'9',famille:'admin',type:'idee',message:'Ignoré',statut:'nouveau',cree_le:iso(1)},
    {id:'4',famille:'b',type:'bug',message:'Type inconnu',statut:'nouveau',cree_le:iso(50)}
  ],[{id:'a',email:'marie@famille.invalid'},{id:'b',email:'camille@famille.invalid'}],now);
  assert.equal(result.valider.length,0,'sans agents, rien n’est à valider');
  assert.equal(result.cours.map(d=>d.id).join(),'2,1,4','plus récent en premier');
  assert.equal(result.termines.map(d=>d.id).join(),'3');
  const lait=result.cours.find(d=>d.id==='1');
  assert.equal(lait.family,'Famille Marie');
  assert.equal(lait.stage,'recu');
  assert.equal(lait.stageLabel,'Reçu');
  assert.equal(lait.device,'iPhone de Marie');
  assert.equal(lait.version,'v857');
  assert.equal(result.cours.find(d=>d.id==='4').type,'idee','type inconnu → idée');
  assert.equal(result.termines[0].stage,'traite');
});

test('bureau : titres courts et dates lisibles',()=>{
  const bureau=loadBureau();
  const long='x'.repeat(80);
  const [dossier]=bureau.buildDossiers([{id:'1',famille:'a',type:'idee',message:long,statut:'nouveau'}],[]).cours;
  assert.equal(dossier.title.length,60);
  assert.ok(dossier.title.endsWith('…'));
  const now=new Date(2026,10,19,21,0).getTime();
  assert.equal(bureau.dayLabel(new Date(2026,10,19,8,0).toISOString(),now),'Aujourd’hui');
  assert.equal(bureau.dayLabel(new Date(2026,10,18,23,0).toISOString(),now),'Hier');
  assert.equal(bureau.dayLabel(new Date(2026,10,12,9,0).toISOString(),now),'Le 12/11');
});

test('bureau : ligne admin sous Familles, chargé avec l’app, données oubliées au verrouillage',()=>{
  const ui=read('bureau-ui.js'),html=read('index.html'),sw=read('sw.js'),css=read('styles.css');
  assert.match(ui,/families\.after\(row\)/);
  assert.match(ui,/id="settingsBureauCount" class="settings-count"/);
  assert.match(ui,/event\.detail\?\.locked\)forget\(\)/);
  assert.match(ui,/adminWatchRequests\?\.\(credentials,scheduleRefresh\)/);
  assert.match(html,/<script src="\.\/family-admin\.js\?v=\d+"><\/script>\s*<script src="\.\/bureau-ui\.js\?v=\d+"><\/script>/);
  assert.match(html,/<symbol id="i-briefcase"/);
  const version=html.match(/bureau-ui\.js\?v=(\d+)/)[1];
  assert.ok(sw.includes('"./bureau-ui.js?v='+version+'"'),'bureau-ui.js dans le cache de l’app');
  assert.match(css,/html\[data-account="family"\] #settingsBureauBtn\{display:none!important\}/);
  // Le fichier de maquette reste une référence, jamais chargé.
  assert.doesNotMatch(html,/maquette-scene/);
  assert.doesNotMatch(sw,/maquette-scene/);
});

test('bureau : lecture admin des retours et canal temps réel partagé avec Familles',()=>{
  const service=read('family-service.js');
  assert.match(service,/async function adminBureau\(credentials\)/);
  assert.match(service,/from\('retours'\)\.select\('id,famille,type,message,contexte,statut,cree_le,traite_le'\)/);
  assert.match(service,/adminRequestListeners\.add\(onChange\)/);
  assert.match(service,/adminRequestListeners\.clear\(\)/);
  assert.match(service,/adminOverview,adminBureau,/);
});

test('bureau : scène en images WebP légères tirées des PNG d’origine',async()=>{
  const {statSync,existsSync}=await import('node:fs');
  const ui=read('bureau-ui.js');
  assert.match(ui,/const SCENE_IMAGES='\.\/www\/Bureau\/webp\/'/);
  let total=0;
  for(const file of ['piece','trieur-repos','developpeur-repos','testeur-repos']){
    const url=new URL('../www/Bureau/webp/'+file+'.webp',import.meta.url);
    assert.ok(existsSync(url),file+'.webp présent');
    total+=statSync(url).size;
  }
  assert.ok(total<250000,'scène sous 250 Ko ('+total+' octets)');
  for(const file of ['01-piece-vide','02-trieur-repos','03-developpeur-repos','04-testeur-repos'])assert.ok(existsSync(new URL('../www/Bureau/'+file+'.png',import.meta.url)),'source '+file+'.png conservée');
  assert.match(read('scripts/make_bureau_images.py'),/POSTE_WIDTH = 360/);
  assert.match(read('styles.css'),/\.bureau-poste\.is-trieur\{left:[\d.]+%;top:[\d.]+%\}/);
});
