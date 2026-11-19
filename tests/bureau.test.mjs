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
  assert.ok(total<150000,'scène au repos sous 150 Ko ('+total+' octets)');
  for(const file of ['01-piece-vide','02-trieur-repos','03-developpeur-repos','04-testeur-repos'])assert.ok(existsSync(new URL('../www/Bureau/'+file+'.png',import.meta.url)),'source '+file+'.png conservée');
  assert.match(read('scripts/make_bureau_images.py'),/POSTE_WIDTH = 360/);
  assert.match(read('styles.css'),/\.bureau-poste\.is-trieur\{left:[\d.]+%;top:[\d.]+%\}/);
});

test('bureau : actions, étiquettes reliées aux agents, onglets et dossier à valider',()=>{
  const bureau=loadBureau();
  // Postes : alternance repos / frappe / tête, décalée d'un poste à l'autre.
  const frames=['trieur','testeur','developpeur'].map(id=>bureau.posteFrame(id,0));
  assert.equal(new Set(frames).size>1,true,'les trois postes ne bougent pas en même temps');
  for(let ms=0;ms<10000;ms+=480)assert.match(bureau.posteFrame('trieur',ms),/^(repos|frappe|tete)$/);
  const ui=read('bureau-ui.js'),css=read('styles.css');
  assert.match(ui,/node\.addEventListener\('close',onDialogClose\)/,'traitement coupé à la fermeture du popup');
  assert.match(ui,/function onDialogClose\(\)\{if\(demo&&!demo\.finished\)stopDemo\(\)\}/,'dossier fini gardé jusqu’à la validation');
  assert.match(ui,/prefers-reduced-motion: reduce/,'coupé si réduire les animations');
  assert.match(ui,/function forget\(\)\{\n  stopDemo\(\);/,'oublié au verrouillage');
  assert.match(ui,/data-action="demo"/);
  assert.match(ui,/data-action="validate-demo"/,'le dossier de démonstration se valide');
  assert.match(ui,/const ACTIVITIES=Object\.freeze\(\{trieur:'Trie le courrier',developpeur:'Code la version',testeur:'Lance les tests'\}\)/);
  assert.match(ui,/function typeLetters\(label\)/,'texte qui s’écrit lettre par lettre');
  assert.doesNotMatch(ui+css,/coursier|courier|bureau-bubble|bureau-badge|bureau-agents/,'ni livreur, ni bulles, ni légende');
  // Phrase juste au-dessus de la tête de chaque agent.
  for(const id of ['trieur','developpeur','testeur']){
    const lead=bureau.LEADS[id];
    assert.ok(lead.lift>0&&lead.lift<=24,id+' : phrase juste au-dessus de la tête');
  }
  assert.match(ui,/top:calc\('\+lead\.head\[1\]\+'% - '\+lead\.lift\+'px\)/);
  assert.doesNotMatch(ui+css,/bureau-leads/,'plus de traits');
  assert.match(ui,/state==='done'\?'<i aria-hidden="true">'\+SVG_DONE\+'<\/i>'/,'coche dans la phrase de l’agent qui a fini');
  assert.doesNotMatch(ui+css,/bureau-head/,'pas de repère sous les phrases');
  // Agents : coche gardée tant que le dossier n'est pas validé.
  assert.match(ui,/return validerCount\(\)\?'done':'wait';/);
  // Onglets : En cours, À valider (pastille rouge), Terminés.
  assert.match(ui,/const TABS=Object\.freeze\(\[\['cours','En cours'\],\['valider','À valider'\],\['termines','Terminés'\]\]\);/);
  assert.match(ui,/class="bureau-tab-count"/);
  assert.match(css,/\.bureau-tab-count\{[^}]*background:#d85d54/);
  // Pile : un dossier par dossier à valider, 6 au plus.
  assert.match(ui,/function pileCount\(\)\{return Math\.min\(validerCount\(\),PILE_MAX\)\}/);
  assert.match(ui,/const PILE_MAX=6;/);
  for(let k=1;k<=6;k++)assert.match(css,new RegExp('\\.bureau-pile-dossier\\.is-'+k+'\\{left:'));
  // Démonstration : une demande en 10 s — Trieur, puis Développeur, puis Testeur, puis dossier posé.
  const at=ms=>{const step=bureau.demoAt(ms);return [step.active,step.done.join('+'),step.filed].join('|')};
  assert.equal(at(0),'trieur||false');
  assert.equal(at(4000),'developpeur|trieur|false');
  assert.equal(at(8000),'testeur|trieur+developpeur|false');
  assert.equal(at(10000),'|trieur+developpeur+testeur|true');
  for(const file of ['trieur-frappe','trieur-tete','developpeur-frappe','developpeur-tete','testeur-frappe','testeur-tete','dossier']){
    assert.ok(read('www/Bureau/webp/'+file+'.webp').length>0,file);
  }
});
